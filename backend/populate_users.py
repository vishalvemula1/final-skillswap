#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Sample users data
users_data = [
    {'username': 'raj_dev', 'email': 'raj@example.com', 'password': 'demo123', 'first_name': 'Raj'},
    {'username': 'maria_lang', 'email': 'maria@example.com', 'password': 'demo123', 'first_name': 'Maria'},
    {'username': 'arjun_music', 'email': 'arjun@example.com', 'password': 'demo123', 'first_name': 'Arjun'},
    {'username': 'priya_art', 'email': 'priya@example.com', 'password': 'demo123', 'first_name': 'Priya'},
    {'username': 'aisha_fitness', 'email': 'aisha@example.com', 'password': 'demo123', 'first_name': 'Aisha'},
    {'username': 'vikram_chef', 'email': 'vikram@example.com', 'password': 'demo123', 'first_name': 'Vikram'},
    {'username': 'neha_dev', 'email': 'neha@example.com', 'password': 'demo123', 'first_name': 'Neha'},
    {'username': 'rohan_student', 'email': 'rohan@example.com', 'password': 'demo123', 'first_name': 'Rohan'},
]

created_count = 0
for user_data in users_data:
    username = user_data['username']
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(
            username=username,
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name']
        )
        created_count += 1
        print(f"✅ Created user: {username}")
    else:
        print(f"⏭️  User {username} already exists")

print(f"\n🎉 Total new users created: {created_count}")
print(f"📊 Total users in database: {User.objects.count()}")
print(f"\n📝 Demo credentials (all passwords are 'demo123'):")
for user_data in users_data:
    print(f"   - {user_data['username']}")
