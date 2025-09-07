#!/bin/bash

# Script de démarrage rapide pour l'application GestionEDT

echo "🚀 Démarrage de l'application GestionEDT..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker Desktop."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

# Arrêter tous les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire et démarrer les services
echo "🔨 Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier si la base de données est prête
echo "🗄️  Vérification de la base de données..."
until docker-compose exec db pg_isready -U postgres; do
  echo "⏳ Attente de la base de données..."
  sleep 2
done

# Exécuter les migrations
echo "📝 Exécution des migrations..."
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Créer un superutilisateur (optionnel)
echo "👤 Création du superutilisateur..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@gestionedt.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@gestionedt.com',
        password='password',
        first_name='Admin',
        last_name='System',
        role='ADMIN'
    )
    print('Superutilisateur créé: admin@gestionedt.com / password')
else:
    print('Superutilisateur existe déjà')
"

# Créer quelques utilisateurs de test
echo "👥 Création des utilisateurs de test..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()

# Chef de département
if not User.objects.filter(email='dept@gestionedt.com').exists():
    User.objects.create_user(
        username='dept_head',
        email='dept@gestionedt.com',
        password='password',
        first_name='Jean',
        last_name='Dupont',
        role='DEPT_HEAD'
    )
    print('Chef de département créé: dept@gestionedt.com / password')

# Enseignant
if not User.objects.filter(email='teacher@gestionedt.com').exists():
    User.objects.create_user(
        username='teacher',
        email='teacher@gestionedt.com',
        password='password',
        first_name='Marie',
        last_name='Martin',
        role='TEACHER'
    )
    print('Enseignant créé: teacher@gestionedt.com / password')

# Étudiant
if not User.objects.filter(email='student@gestionedt.com').exists():
    User.objects.create_user(
        username='student',
        email='student@gestionedt.com',
        password='password',
        first_name='Pierre',
        last_name='Durand',
        role='STUDENT'
    )
    print('Étudiant créé: student@gestionedt.com / password')
"

echo ""
echo "✅ Application démarrée avec succès !"
echo ""
echo "🌐 URLs disponibles :"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   Admin Django: http://localhost:8000/admin"
echo ""
echo "👤 Comptes de test :"
echo "   Admin: admin@gestionedt.com / password"
echo "   Chef département: dept@gestionedt.com / password"
echo "   Enseignant: teacher@gestionedt.com / password"
echo "   Étudiant: student@gestionedt.com / password"
echo ""
echo "📝 Pour voir les logs : docker-compose logs -f"
echo "🛑 Pour arrêter : docker-compose down"
