from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from skillswap_app.models import Profile


class Command(BaseCommand):
    help = 'Create admin and demo user accounts for deployment'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('🚀 Creating demo users...'))
        self.stdout.write('=' * 60)

        # Create admin superuser
        self.stdout.write('\n📝 Checking for admin user...')
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@skillswap.com',
                password='admin'
            )
            Profile.objects.get_or_create(
                user=admin,
                defaults={
                    'bio': 'System Administrator',
                    'location': 'System',
                }
            )
            self.stdout.write(self.style.SUCCESS('✅ Created admin user (admin/admin)'))
        else:
            self.stdout.write(self.style.WARNING('⏭️  Admin user already exists'))

        # Create demo users
        self.stdout.write('\n📝 Creating demo users...')
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
                Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'bio': f'Demo user {user_data["username"]}',
                        'location': 'Demo',
                    }
                )
                self.stdout.write(self.style.SUCCESS(
                    f'✅ Created {user_data["username"]} ({user_data["username"]}/{user_data["password"]})'
                ))
            else:
                self.stdout.write(self.style.WARNING(
                    f'⏭️  {user_data["username"]} already exists'
                ))

        total_users = User.objects.count()
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(f'✅ Done! Total users in database: {total_users}'))
        self.stdout.write('\n📝 Demo credentials:')
        self.stdout.write('   - admin / admin')
        self.stdout.write('   - user1 / password')
        self.stdout.write('   - user2 / password')
        self.stdout.write('=' * 60)
