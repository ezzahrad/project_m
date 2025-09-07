#!/usr/bin/env python3
"""
Script pour créer la base de données PostgreSQL pour GestionEDT
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

def create_database():
    """Créer la base de données PostgreSQL"""
    
    # Paramètres de connexion
    host = 'localhost'
    port = '5432'
    user = 'postgres'
    password = 'postgres123'
    database_name = 'gestion_edt'
    
    try:
        # Connexion au serveur PostgreSQL (base postgres par défaut)
        print("🔌 Connexion au serveur PostgreSQL...")
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérifier si la base de données existe déjà
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database_name,))
        exists = cursor.fetchone()
        
        if exists:
            print(f"✅ La base de données '{database_name}' existe déjà")
        else:
            # Créer la base de données
            print(f"🏗️  Création de la base de données '{database_name}'...")
            cursor.execute(f'CREATE DATABASE "{database_name}"')
            print(f"✅ Base de données '{database_name}' créée avec succès")
        
        cursor.close()
        conn.close()
        
        # Tester la connexion à la nouvelle base
        print("🔍 Test de connexion à la base de données...")
        test_conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database_name
        )
        test_conn.close()
        print("✅ Connexion à la base de données réussie")
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"❌ Erreur de connexion PostgreSQL: {e}")
        print("\n💡 Solutions possibles:")
        print("1. Vérifiez que PostgreSQL est installé et démarré")
        print("2. Vérifiez les paramètres de connexion (host, port, user, password)")
        print("3. Installez PostgreSQL depuis: https://www.postgresql.org/download/")
        print("4. Ou utilisez Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres123 -p 5432:5432 -d postgres:15")
        return False
        
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Configuration de PostgreSQL pour GestionEDT")
    print("=" * 50)
    
    if create_database():
        print("\n🎉 Configuration PostgreSQL terminée avec succès!")
        print("\n📋 Prochaines étapes:")
        print("1. cd backend")
        print("2. pip install -r requirements.txt")
        print("3. python manage.py makemigrations")
        print("4. python manage.py migrate")
        print("5. python manage.py createsuperuser")
        print("6. python manage.py runserver")
    else:
        print("\n❌ Échec de la configuration PostgreSQL")
        sys.exit(1)

if __name__ == "__main__":
    main()