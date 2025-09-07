@echo off

REM Script de démarrage rapide pour l'application GestionEDT (Windows)

echo 🚀 Démarrage de l'application GestionEDT...

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé. Veuillez installer Docker Desktop.
    pause
    exit /b 1
)

REM Vérifier si Docker Compose est installé
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose n'est pas installé.
    pause
    exit /b 1
)

REM Arrêter tous les conteneurs existants
echo 🛑 Arrêt des conteneurs existants...
docker-compose down

REM Construire et démarrer les services
echo 🔨 Construction et démarrage des services...
docker-compose up --build -d

REM Attendre que les services soient prêts
echo ⏳ Attente du démarrage des services...
timeout /t 10 /nobreak >nul

REM Exécuter les migrations
echo 📝 Exécution des migrations...
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

REM Créer un superutilisateur
echo 👤 Création du superutilisateur...
docker-compose exec backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@gestionedt.com', 'password', first_name='Admin', last_name='System', role='ADMIN') if not User.objects.filter(email='admin@gestionedt.com').exists() else print('Superutilisateur existe déjà')"

echo.
echo ✅ Application démarrée avec succès !
echo.
echo 🌐 URLs disponibles :
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8000
echo    Admin Django: http://localhost:8000/admin
echo.
echo 👤 Compte admin : admin@gestionedt.com / password
echo.
echo 📝 Pour voir les logs : docker-compose logs -f
echo 🛑 Pour arrêter : docker-compose down
echo.
pause
