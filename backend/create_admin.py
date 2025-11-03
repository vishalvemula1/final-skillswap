#!/usr/bin/env python
"""Create admin superuser and demo users for Render deployment"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_project.settings')
django.setup()

from django.contrib.auth.models import User
from skillswap_app.models import Profile

def create_admin():
    """Create admin superuser"""
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@skillswap.com',
            password='admin'
        )
        # Create profile for admin
        Profile.objects.get_or_create(
            user=admin,
            defaults={
                'bio': 'System Administrator',
                'location': 'System',
            }
        )
        print('✅ Created admin user (username: admin, password: admin)')
    else:
        print('⏭️  Admin user already exists')

def create_demo_users():
    """Create user1 and user2 demo accounts"""
    demo_users = [
        {'username': 'user1', 'email': 'user1@example.com', 'password': 'password'},
        {'username': 'user2', 'email': 'user2@example.com', 'password': 'password'},
    ]

    for user_data in demo_users:
        if not User.objects.filter(username=user_data['username']).exists():
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password']
            )
            # Create profile
            Profile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': f'Demo user {user_data["username"]}',
                    'location': 'Demo',
                }
            )
            print(f'✅ Created {user_data["username"]} (password: {user_data["password"]})')
        else:
            print(f'⏭️  {user_data["username"]} already exists')

if __name__ == '__main__':
    print('🔧 Creating admin and demo users...')
    create_admin()
    create_demo_users()
    print(f'✅ Done! Total users: {User.objects.count()}')
    print('\n📝 Demo credentials:')
    print('   - admin / admin')
    print('   - user1 / password')
    print('   - user2 / password')
