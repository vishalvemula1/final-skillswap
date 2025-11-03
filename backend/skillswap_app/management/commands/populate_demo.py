from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from skillswap_app.models import Profile, Category, Skill, UserSkill, SwapRequest, Review

class Command(BaseCommand):
    help = 'Populate database with demo data for faculty presentation'

    def handle(self, *args, **options):
        self.stdout.write('=' * 70)
        self.stdout.write(self.style.SUCCESS('🚀 Populating database with demo data...'))
        self.stdout.write('=' * 70)

        # First create admin and simple demo users
        self.stdout.write('\n📝 Creating admin and basic demo users...')
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin', email='admin@skillswap.com', password='admin'
            )
            Profile.objects.get_or_create(user=admin, defaults={
                'bio': 'System Administrator', 'location': 'System'
            })
            self.stdout.write(self.style.SUCCESS('✅ Created admin/admin'))
        else:
            self.stdout.write(self.style.WARNING('⏭️  admin already exists'))

        for username in ['user1', 'user2']:
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password='password'
                )
                Profile.objects.get_or_create(user=user, defaults={
                    'bio': f'Demo user {username}', 'location': 'Demo'
                })
                self.stdout.write(self.style.SUCCESS(f'✅ Created {username}/password'))
            else:
                self.stdout.write(self.style.WARNING(f'⏭️  {username} already exists'))

        self.stdout.write('\n📝 Creating demo users with skills...')

        # Demo users with realistic profiles
        demo_users = [
            {
                'username': 'raj_dev', 'email': 'raj@example.com', 'password': 'demo123',
                'bio': 'Full-stack developer passionate about teaching coding',
                'location': 'Mumbai', 'phone': '+91-9876543210'
            },
            {
                'username': 'maria_lang', 'email': 'maria@example.com', 'password': 'demo123',
                'bio': 'Polyglot who loves sharing languages',
                'location': 'Delhi', 'phone': '+91-9876543211'
            },
            {
                'username': 'arjun_music', 'email': 'arjun@example.com', 'password': 'demo123',
                'bio': 'Professional musician and music teacher',
                'location': 'Bangalore', 'phone': '+91-9876543212'
            },
            {
                'username': 'priya_art', 'email': 'priya@example.com', 'password': 'demo123',
                'bio': 'Artist and photography enthusiast',
                'location': 'Chennai', 'phone': '+91-9876543213'
            },
            {
                'username': 'vikram_fit', 'email': 'vikram@example.com', 'password': 'demo123',
                'bio': 'Fitness instructor and sports coach',
                'location': 'Pune', 'phone': '+91-9876543214'
            },
            {
                'username': 'chef_anita', 'email': 'anita@example.com', 'password': 'demo123',
                'bio': 'Chef specializing in multiple cuisines',
                'location': 'Hyderabad', 'phone': '+91-9876543215'
            },
            {
                'username': 'dev_student', 'email': 'student@example.com', 'password': 'demo123',
                'bio': 'Software engineering student learning new skills',
                'location': 'Mumbai', 'phone': '+91-9876543216'
            },
            {
                'username': 'learner_sam', 'email': 'sam@example.com', 'password': 'demo123',
                'bio': 'Curious learner interested in skill exchange',
                'location': 'Delhi', 'phone': '+91-9876543217'
            }
        ]

        # Create users and profiles
        created_users = []
        for user_data in demo_users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                
                Profile.objects.create(
                    user=user,
                    bio=user_data['bio'],
                    location=user_data['location'],
                    phone=user_data['phone']
                )
                created_users.append(user)
                self.stdout.write(f'Created user: {user.username}')

        # Ensure categories exist
        categories_data = [
            ('Programming', 'Software development and coding skills'),
            ('Languages', 'Spoken languages and communication'),
            ('Music', 'Musical instruments and theory'),
            ('Arts & Crafts', 'Visual arts, painting, crafts'),
            ('Sports', 'Physical activities and sports'),
            ('Cooking', 'Culinary skills and cuisine types'),
        ]

        for name, desc in categories_data:
            Category.objects.get_or_create(name=name, defaults={'description': desc})

        # Ensure skills exist
        skills_data = [
            ('Python', 'Programming', 'Python programming language'),
            ('JavaScript', 'Programming', 'JavaScript and web development'),
            ('React', 'Programming', 'React.js framework'),
            ('Django', 'Programming', 'Django web framework'),
            ('MySQL', 'Programming', 'MySQL database management'),
            ('Spanish', 'Languages', 'Spanish language conversation'),
            ('French', 'Languages', 'French language and culture'),
            ('Mandarin', 'Languages', 'Mandarin Chinese'),
            ('Guitar', 'Music', 'Acoustic and electric guitar'),
            ('Piano', 'Music', 'Piano and keyboard'),
            ('Singing', 'Music', 'Vocal techniques'),
            ('Photography', 'Arts & Crafts', 'Digital photography'),
            ('Painting', 'Arts & Crafts', 'Watercolor and acrylic painting'),
            ('Pottery', 'Arts & Crafts', 'Ceramic arts'),
            ('Tennis', 'Sports', 'Tennis techniques and strategy'),
            ('Yoga', 'Sports', 'Yoga poses and meditation'),
            ('Swimming', 'Sports', 'Swimming strokes and techniques'),
            ('Italian Cuisine', 'Cooking', 'Italian cooking and pasta'),
            ('Baking', 'Cooking', 'Bread and pastry baking'),
            ('Indian Cuisine', 'Cooking', 'Indian spices and dishes'),
        ]

        for skill_name, cat_name, desc in skills_data:
            category = Category.objects.get(name=cat_name)
            Skill.objects.get_or_create(
                name=skill_name,
                category=category,
                defaults={'description': desc}
            )

        # Add skills to users
        if created_users:
            self.assign_skills_to_users(created_users)
            self.create_sample_requests(created_users)

        # Final summary
        total_users = User.objects.count()
        total_skills = Skill.objects.count()
        total_categories = Category.objects.count()
        total_user_skills = UserSkill.objects.count()

        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('✅ Demo data populated successfully!'))
        self.stdout.write('=' * 70)
        self.stdout.write(f'\n📊 Database Summary:')
        self.stdout.write(f'   - Total Users: {total_users}')
        self.stdout.write(f'   - Total Skills: {total_skills}')
        self.stdout.write(f'   - Total Categories: {total_categories}')
        self.stdout.write(f'   - User-Skill Assignments: {total_user_skills}')
        self.stdout.write('\n📝 Login Credentials:')
        self.stdout.write('   SIMPLE USERS:')
        self.stdout.write('   - admin / admin (superuser)')
        self.stdout.write('   - user1 / password')
        self.stdout.write('   - user2 / password')
        self.stdout.write('\n   DEMO USERS WITH SKILLS:')
        for user_data in demo_users:
            self.stdout.write(f'   - {user_data["username"]} / demo123')
        self.stdout.write('=' * 70)

    def assign_skills_to_users(self, users):
        """Assign skills to demo users"""
        skills = Skill.objects.all()
        
        # Predefined skill assignments for realistic demo
        skill_assignments = [
            # raj_dev (Programming expert)
            (users[0], ['Python', 'Django', 'MySQL'], True, 'Advanced'),
            (users[0], ['Photography'], False, 'Beginner'),
            
            # maria_lang (Language teacher)
            (users[1], ['Spanish', 'French'], True, 'Advanced'),
            (users[1], ['Piano'], False, 'Beginner'),
            
            # arjun_music (Musician)
            (users[2], ['Guitar', 'Piano', 'Singing'], True, 'Advanced'),
            (users[2], ['Python'], False, 'Beginner'),
            
            # priya_art (Artist)
            (users[3], ['Photography', 'Painting'], True, 'Advanced'),
            (users[3], ['Spanish'], False, 'Beginner'),
            
            # vikram_fit (Fitness)
            (users[4], ['Tennis', 'Yoga', 'Swimming'], True, 'Advanced'),
            (users[4], ['Italian Cuisine'], False, 'Beginner'),
            
            # chef_anita (Chef)
            (users[5], ['Italian Cuisine', 'Baking', 'Indian Cuisine'], True, 'Advanced'),
            (users[5], ['Guitar'], False, 'Beginner'),
            
            # dev_student (Learning developer)
            (users[6], ['JavaScript', 'React'], True, 'Intermediate'),
            (users[6], ['Yoga'], False, 'Beginner'),
            
            # learner_sam (General learner)
            (users[7], ['Pottery'], True, 'Beginner'),
            (users[7], ['JavaScript', 'Singing'], False, 'Beginner'),
        ]

        for user, skill_names, can_teach, level in skill_assignments:
            for skill_name in skill_names:
                try:
                    skill = Skill.objects.get(name=skill_name)
                    UserSkill.objects.get_or_create(
                        user=user,
                        skill=skill,
                        defaults={
                            'can_teach': can_teach,
                            'experience_level': level
                        }
                    )
                except Skill.DoesNotExist:
                    self.stdout.write(f'Skill {skill_name} not found')

    def create_sample_requests(self, users):
        """Create sample swap requests for demo"""
        if len(users) < 4:
            return

        # Sample requests
        python_skill = Skill.objects.get(name='Python')
        guitar_skill = Skill.objects.get(name='Guitar')
        spanish_skill = Skill.objects.get(name='Spanish')
        photography_skill = Skill.objects.get(name='Photography')
        javascript_skill = Skill.objects.get(name='JavaScript')

        sample_requests = [
            {
                'from_user': users[6], 'to_user': users[0],
                'requested_skill': python_skill, 'offered_skill': javascript_skill,
                'message': 'Hi! I can teach JavaScript in exchange for Python lessons',
                'status': 'accepted'
            },
            {
                'from_user': users[7], 'to_user': users[2],
                'requested_skill': guitar_skill, 'offered_skill': None,
                'message': 'Would love to learn guitar! I am a beginner.',
                'status': 'pending'
            },
            {
                'from_user': users[0], 'to_user': users[1],
                'requested_skill': spanish_skill, 'offered_skill': python_skill,
                'message': 'Interested in learning Spanish, can teach Python',
                'status': 'accepted'
            },
            {
                'from_user': users[4], 'to_user': users[3],
                'requested_skill': photography_skill, 'offered_skill': None,
                'message': 'Photography for fitness training exchange?',
                'status': 'completed'
            },
        ]

        for req_data in sample_requests:
            SwapRequest.objects.get_or_create(
                from_user=req_data['from_user'],
                to_user=req_data['to_user'],
                requested_skill=req_data['requested_skill'],
                defaults={
                    'offered_skill': req_data['offered_skill'],
                    'message': req_data['message'],
                    'status': req_data['status']
                }
            )

        # Add some reviews for completed requests
        completed_request = SwapRequest.objects.filter(status='completed').first()
        if completed_request:
            Review.objects.get_or_create(
                from_user=completed_request.from_user,
                to_user=completed_request.to_user,
                swap_request=completed_request,
                defaults={
                    'rating': 5,
                    'comment': 'Amazing teacher! Very patient and knowledgeable.'
                }
            )