#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print(f'Password set for {user.username}')
