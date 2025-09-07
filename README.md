# Application de Gestion d'Emplois du Temps Universitaire

Une application web complète pour la gestion des emplois du temps universitaire avec backend Django + DRF et frontend React.

## 🚀 Fonctionnalités

### Authentification et Gestion des Rôles
- **Authentification JWT sécurisée** avec refresh tokens
- **5 rôles utilisateur** : Administrateur, Chef de département, Chef de filière, Enseignant, Étudiant
- **Permissions granulaires** basées sur les rôles
- **Tableaux de bord spécialisés** selon le rôle

### Gestion Académique
- **Départements** : CRUD complet avec gestion des responsables
- **Filières/Programmes** : Organisation par niveaux (L1-L3, M1-M2, D1-D3)
- **Matières** : Types de cours (CM, TD, TP, Projet, Séminaire)
- **Salles** : Gestion des capacités, équipements, disponibilités
- **Utilisateurs** : Enseignants et étudiants avec profils étendus

### Planification et Emplois du Temps
- **Créneaux horaires** configurables par jour
- **Planification interactive** avec vue calendrier
- **Détection automatique des conflits** en temps réel
- **Gestion des indisponibilités** enseignants
- **Séances de rattrapage** avec workflow d'approbation
- **Vues multiples** : par enseignant, filière, salle

### Notifications et Communication
- **Système de notifications** temps réel
- **Préférences personnalisables** (email, SMS, push)
- **Alertes automatiques** pour changements et conflits
- **Centre de notifications** avec historique

### Rapports et Export/Import
- **Export multi-format** : PDF, Excel, CSV
- **Rapports spécialisés** : charge enseignants, utilisation salles
- **Import Excel** avec validation et templates
- **Génération automatique** de rapports périodiques

## 🏗️ Architecture

### Backend (Django + DRF)
```
backend/
├── gestion_edt/          # Configuration Django
├── core/                 # Modèles et utilitaires de base
├── users/                # Gestion des utilisateurs
├── academic/             # Gestion académique
├── scheduling/           # Planification et emplois du temps
├── notifications/        # Système de notifications
├── api/                  # Endpoints d'export/import
└── utils/                # Utilitaires (export, import)
```

### Frontend (React + TypeScript)
```
frontend/src/
├── components/           # Composants réutilisables
│   ├── auth/            # Authentification
│   ├── layout/          # Layout et navigation
│   ├── common/          # Composants génériques
│   ├── academic/        # Gestion académique
│   ├── scheduling/      # Planification
│   ├── notifications/   # Notifications
│   └── reports/         # Rapports
├── pages/               # Pages de l'application
├── store/               # Gestion d'état Redux
├── services/            # Services API
├── types/               # Types TypeScript
└── hooks/               # Hooks personnalisés
```

## 🛠️ Technologies

### Backend
- **Django 4.2** + **Django REST Framework**
- **PostgreSQL** pour la base de données
- **Redis** pour le cache et Celery
- **JWT** pour l'authentification
- **Celery** pour les tâches asynchrones
- **ReportLab** et **OpenPyXL** pour les exports

### Frontend
- **React 18** + **TypeScript**
- **Redux Toolkit** pour la gestion d'état
- **TailwindCSS** pour le design
- **React Hook Form** pour les formulaires
- **Axios** pour les appels API
- **Date-fns** pour la gestion des dates

## 🚀 Démarrage

### Prérequis
- Docker et Docker Compose
- Node.js 18+ (pour le développement frontend)
- Python 3.11+ (pour le développement backend)

### Installation avec Docker
```bash
# Cloner le projet
git clone <repository-url>
cd gestion-edt

# Démarrer tous les services
docker-compose up -d

# Créer les migrations et la base de données
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Créer un superutilisateur
docker-compose exec backend python manage.py createsuperuser

# L'application sera accessible sur :
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin
```

### Développement local

#### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Utilisation

### Rôles et Permissions

#### Administrateur Pédagogique
- Accès complet à toutes les fonctionnalités
- Gestion des départements, utilisateurs, salles
- Configuration système et rapports globaux

#### Chef de Département
- Gestion de son département
- Création/modification des emplois du temps
- Gestion des enseignants et filières

#### Chef de Filière
- Gestion de sa filière
- Planification des cours
- Suivi des étudiants

#### Enseignant
- Consultation de son emploi du temps
- Déclaration d'indisponibilités
- Demandes de rattrapage

#### Étudiant
- Consultation de l'emploi du temps de sa filière
- Notifications des changements
- Accès aux informations de cours

### Workflow de Planification

1. **Configuration initiale**
   - Créer les départements et filières
   - Ajouter les enseignants et étudiants
   - Configurer les salles et créneaux horaires

2. **Planification des cours**
   - Créer les emplois du temps via l'interface
   - Le système détecte automatiquement les conflits
   - Validation et résolution des conflits

3. **Gestion des changements**
   - Modifications avec notifications automatiques
   - Gestion des annulations et rattrapages
   - Suivi des indisponibilités

## 🔧 Configuration

### Variables d'environnement
Créer un fichier `.env` dans le dossier backend :
```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=gestion_edt_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

### Configuration de production
- Configurer HTTPS et certificats SSL
- Ajuster les paramètres de sécurité Django
- Configurer les services de notification (email, SMS)
- Optimiser les performances avec cache Redis

## 📈 Monitoring et Maintenance

### Tâches automatisées (Celery)
- Détection des conflits de planning
- Envoi de rappels de cours
- Nettoyage des anciennes notifications
- Génération de rapports hebdomadaires

### Logs et Monitoring
- Logs Django configurés
- Monitoring des performances API
- Alertes pour les erreurs critiques

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation API : http://localhost:8000/api/docs/
- Vérifier les logs : `docker-compose logs backend frontend`"# project_m" 
