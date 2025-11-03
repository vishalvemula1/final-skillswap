#!/usr/bin/env python
"""Create admin superuser and demo users for Render deployment"""
import os
import sys
import django

print('=' * 60)
print('🚀 Starting user creation script...')
print('=' * 60)

try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_project.settings')
    print('✅ Django settings module configured')

    django.setup()
    print('✅ Django setup complete')

    from django.contrib.auth.models import User
    from skillswap_app.models import Profile
    print('✅ Models imported successfully')

    def create_admin():
        """Create admin superuser"""
        print('\n📝 Checking for admin user...')
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
        print('\n📝 Creating demo users...')
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

    print('\n🔧 Creating users...')
    create_admin()
    create_demo_users()

    total_users = User.objects.count()
    print(f'\n✅ Done! Total users in database: {total_users}')
    print('\n📝 Demo credentials:')
    print('   - admin / admin')
    print('   - user1 / password')
    print('   - user2 / password')
    print('=' * 60)
    print('✅ User creation script completed successfully!')
    print('=' * 60)

except Exception as e:
    print(f'\n❌ ERROR: {str(e)}', file=sys.stderr)
    import traceback
    traceback.print_exc()
    print('=' * 60)
    print('❌ User creation script FAILED!')
    print('=' * 60)
    sys.exit(1)
