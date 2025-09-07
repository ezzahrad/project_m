# Guide de Déploiement - GestionEDT

## 🚀 Déploiement en Production

### Prérequis
- Serveur Linux (Ubuntu 20.04+ recommandé)
- Docker et Docker Compose
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)

### 1. Configuration du Serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configuration de Production

Créer `docker-compose.prod.yml` :
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - db
      - redis
    restart: unless-stopped

  celery:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    command: celery -A gestion_edt worker -l info
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  celery-beat:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    command: celery -A gestion_edt beat -l info
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - ./frontend/dist:/var/www/html
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### 3. Configuration Nginx

Créer `nginx/nginx.conf` :
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name votre-domaine.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name votre-domaine.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend
        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
        }

        # API Backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin Django
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            alias /var/www/static/;
        }

        location /media/ {
            alias /var/www/media/;
        }
    }
}
```

### 4. Dockerfile de Production

Créer `backend/Dockerfile.prod` :
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "gestion_edt.wsgi:application"]
```

### 5. Variables d'Environnement de Production

Créer `.env.prod` :
```env
# Django
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com,www.votre-domaine.com

# Database
DB_NAME=gestion_edt_prod
DB_USER=postgres
DB_PASSWORD=secure-password-here
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email (pour les notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECURE_SSL_REDIRECT=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
```

### 6. Déploiement

```bash
# 1. Cloner le projet sur le serveur
git clone <repository-url> /opt/gestion-edt
cd /opt/gestion-edt

# 2. Configurer les variables d'environnement
cp .env.example .env.prod
# Éditer .env.prod avec vos valeurs

# 3. Build et démarrer les services
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Migrations et données initiales
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# 5. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

### 7. Configuration SSL avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Maintenance

### Sauvegarde de la Base de Données
```bash
# Sauvegarde
docker-compose exec db pg_dump -U postgres gestion_edt_prod > backup_$(date +%Y%m%d).sql

# Restauration
docker-compose exec -T db psql -U postgres gestion_edt_prod < backup_20240101.sql
```

### Monitoring des Logs
```bash
# Logs en temps réel
docker-compose logs -f backend

# Logs spécifiques
docker-compose logs backend --tail=100
docker-compose logs celery --tail=50
```

### Mise à Jour
```bash
# 1. Sauvegarder la base de données
docker-compose exec db pg_dump -U postgres gestion_edt_prod > backup_before_update.sql

# 2. Arrêter les services
docker-compose down

# 3. Mettre à jour le code
git pull origin main

# 4. Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Appliquer les migrations
docker-compose exec backend python manage.py migrate
```

## 🔒 Sécurité

### Checklist de Sécurité
- [ ] HTTPS configuré avec certificats valides
- [ ] Variables d'environnement sécurisées
- [ ] Firewall configuré (ports 80, 443, 22 uniquement)
- [ ] Mots de passe forts pour la base de données
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring des logs d'erreur
- [ ] Rate limiting activé
- [ ] CORS configuré correctement

### Hardening du Serveur
```bash
# Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Fail2ban pour protection SSH
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## 📊 Performance

### Optimisations Recommandées
- **Cache Redis** : Activé pour les requêtes fréquentes
- **Compression Gzip** : Configurée dans Nginx
- **CDN** : Pour les assets statiques
- **Database indexing** : Index sur les colonnes fréquemment requêtées
- **Connection pooling** : Configuré pour PostgreSQL

### Monitoring
- **Logs centralisés** avec ELK Stack
- **Métriques** avec Prometheus + Grafana
- **Alertes** pour les erreurs critiques
- **Monitoring uptime** avec services externes

## 🆘 Dépannage

### Problèmes Courants

#### Backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la base de données
docker-compose exec db psql -U postgres -l
```

#### Frontend ne se charge pas
```bash
# Vérifier la build
docker-compose exec frontend npm run build

# Vérifier Nginx
docker-compose logs nginx
```

#### Problèmes de permissions
```bash
# Réinitialiser les permissions
sudo chown -R $USER:$USER /opt/gestion-edt
```

### Support
- Documentation API : https://votre-domaine.com/api/docs/
- Logs d'erreur : `/var/log/gestion-edt/`
- Monitoring : https://votre-domaine.com/monitoring/