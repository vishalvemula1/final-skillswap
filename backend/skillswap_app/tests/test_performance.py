"""
Performance tests
Tests for N+1 queries, query optimization, and performance issues
"""
from django.test import TestCase, Client, override_settings
from django.contrib.auth.models import User
from django.db import connection
from django.test.utils import override_settings
from skillswap_app.models import Profile, Category, Skill, UserSkill, SwapRequest, Review
import json


class PerformanceTests(TestCase):
    """Test query performance and optimization"""

    def setUp(self):
        """Set up test data with multiple users and skills"""
        self.client = Client()

        # Create category
        self.category = Category.objects.create(name='Programming')

        # Create skills
        self.skills = []
        for i in range(10):
            skill = Skill.objects.create(
                name=f'Skill{i}',
                category=self.category,
                description=f'Description for skill {i}'
            )
            self.skills.append(skill)

        # Create users
        self.users = []
        for i in range(20):
            user = User.objects.create_user(
                username=f'user{i}',
                email=f'user{i}@example.com',
                password='pass123'
            )
            Profile.objects.create(
                user=user,
                bio=f'Bio for user {i}',
                location=f'City{i % 5}'  # 5 different cities
            )
            self.users.append(user)

            # Each user teaches 2-3 skills
            for j in range(2 + (i % 2)):
                UserSkill.objects.create(
                    user=user,
                    skill=self.skills[j],
                    can_teach=True,
                    experience_level=['Beginner', 'Intermediate', 'Advanced'][i % 3]
                )

        # Create some reviews
        for i in range(10):
            request = SwapRequest.objects.create(
                from_user=self.users[i],
                to_user=self.users[i + 1],
                requested_skill=self.skills[i % 10],
                status='completed'
            )
            Review.objects.create(
                from_user=self.users[i],
                to_user=self.users[i + 1],
                swap_request=request,
                rating=(i % 5) + 1,
                comment=f'Review {i}'
            )

    def count_queries(self, func):
        """Helper to count database queries"""
        with self.assertNumQueries as queries:
            func()
        return len(queries)

    def test_browse_skills_query_count(self):
        """Test that browse skills doesn't have N+1 query problem"""
        self.client.login(username='user0', password='pass123')

        # Count queries for browse
        with self.assertNumQueries(3) as queries:  # Should be ~2-3 queries max
            response = self.client.get('/skills/browse/')

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should return skills
        self.assertGreater(len(data['skills']), 0)

        # The number of queries should NOT scale with number of skills or teachers
        # This verifies the N+1 fix is working
        num_queries = len(queries)
        self.assertLess(num_queries, 10,
            f"Too many queries ({num_queries}). Possible N+1 problem!")

    def test_browse_skills_no_scaling_with_teachers(self):
        """Test that query count doesn't increase with more teachers"""
        self.client.login(username='user0', password='pass123')

        # Count queries with current data
        with self.assertNumQueries(10) as queries1:
            response1 = self.client.get('/skills/browse/')
        query_count_1 = len(queries1)

        # Add more teachers
        for i in range(20, 40):  # Add 20 more users
            user = User.objects.create_user(
                username=f'user{i}',
                password='pass123'
            )
            Profile.objects.create(user=user)
            UserSkill.objects.create(
                user=user,
                skill=self.skills[0],
                can_teach=True
            )

        # Count queries again
        with self.assertNumQueries(10) as queries2:
            response2 = self.client.get('/skills/browse/')
        query_count_2 = len(queries2)

        # Query count should not significantly increase
        self.assertLessEqual(
            query_count_2 - query_count_1,
            2,
            "Query count increased with more data - possible N+1 problem!"
        )

    def test_get_profile_query_count(self):
        """Test profile endpoint query efficiency"""
        self.client.login(username='user0', password='pass123')

        with self.assertNumQueries(5) as queries:  # Should be minimal queries
            response = self.client.get('/profile/')

        self.assertEqual(response.status_code, 200)
        num_queries = len(queries)
        self.assertLess(num_queries, 10,
            f"Profile endpoint uses {num_queries} queries - should be optimized")

    def test_get_requests_query_count(self):
        """Test requests endpoint doesn't have N+1 issue"""
        # Create several requests for user0
        for i in range(10):
            SwapRequest.objects.create(
                from_user=self.users[0],
                to_user=self.users[i + 1],
                requested_skill=self.skills[i % 10],
                message=f'Request {i}'
            )

        self.client.login(username='user0', password='pass123')

        with self.assertNumQueries(5) as queries:  # Should use select_related
            response = self.client.get('/requests/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['sent_requests']), 10)

        num_queries = len(queries)
        self.assertLess(num_queries, 10,
            f"Requests endpoint uses {num_queries} queries - check for N+1")

    def test_dashboard_performance(self):
        """Test dashboard loads efficiently"""
        # Create various data for user0
        for i in range(5):
            SwapRequest.objects.create(
                from_user=self.users[0],
                to_user=self.users[i + 1],
                requested_skill=self.skills[i],
                status=['pending', 'accepted', 'completed'][i % 3]
            )

        self.client.login(username='user0', password='pass123')

        # Dashboard makes profile and requests calls
        with self.assertNumQueries(10) as queries:
            profile_response = self.client.get('/profile/')
            requests_response = self.client.get('/requests/')

        self.assertEqual(profile_response.status_code, 200)
        self.assertEqual(requests_response.status_code, 200)

    def test_browse_with_filters_performance(self):
        """Test that filters don't add excessive queries"""
        self.client.login(username='user0', password='pass123')

        # Test search filter
        with self.assertNumQueries(5) as queries:
            response = self.client.get('/skills/browse/?search=Skill1')
        self.assertEqual(response.status_code, 200)

        # Test location filter
        with self.assertNumQueries(5) as queries:
            response = self.client.get('/skills/browse/?location=City1')
        self.assertEqual(response.status_code, 200)

        # Test category filter
        with self.assertNumQueries(5) as queries:
            response = self.client.get(f'/skills/browse/?category_id={self.category.id}')
        self.assertEqual(response.status_code, 200)

        # Test combined filters
        with self.assertNumQueries(5) as queries:
            response = self.client.get(
                f'/skills/browse/?search=Skill&location=City1&category_id={self.category.id}'
            )
        self.assertEqual(response.status_code, 200)

    def test_review_aggregation_performance(self):
        """Test that getting reviews with average is efficient"""
        # Add more reviews for user1
        for i in range(20):
            request = SwapRequest.objects.create(
                from_user=self.users[i],
                to_user=self.users[1],
                requested_skill=self.skills[i % 10],
                status='completed'
            )
            Review.objects.create(
                from_user=self.users[i],
                to_user=self.users[1],
                swap_request=request,
                rating=(i % 5) + 1
            )

        with self.assertNumQueries(5) as queries:
            response = self.client.get(f'/reviews/{self.users[1].id}/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('average_rating', data)
        self.assertGreater(data['total_reviews'], 0)

    def test_bulk_skill_load(self):
        """Test loading many skills is efficient"""
        # Add many more skills
        for i in range(50):
            skill = Skill.objects.create(
                name=f'BulkSkill{i}',
                category=self.category
            )
            # Add teachers
            for j in range(5):
                UserSkill.objects.create(
                    user=self.users[j],
                    skill=skill,
                    can_teach=True
                )

        self.client.login(username='user0', password='pass123')

        with self.assertNumQueries(10) as queries:
            response = self.client.get('/skills/browse/')

        self.assertEqual(response.status_code, 200)
        # Should still be efficient despite more data

    def test_categories_query_count(self):
        """Test getting categories is efficient"""
        # Add more categories
        for i in range(20):
            Category.objects.create(name=f'Category{i}')

        with self.assertNumQueries(2) as queries:
            response = self.client.get('/categories/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data['categories']), 0)

    def test_skills_list_query_count(self):
        """Test skills list endpoint efficiency"""
        with self.assertNumQueries(3) as queries:
            response = self.client.get('/skills/')

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data['skills']), 0)

    def test_concurrent_request_performance(self):
        """Test system handles concurrent requests"""
        clients = [Client() for _ in range(5)]

        # Login all clients
        for i, client in enumerate(clients):
            client.login(username=f'user{i}', password='pass123')

        # Make concurrent requests
        responses = []
        for client in clients:
            response = client.get('/skills/browse/')
            responses.append(response)

        # All should succeed
        for response in responses:
            self.assertEqual(response.status_code, 200)

    def test_no_unnecessary_queries_when_unauthenticated(self):
        """Test that unauthenticated requests don't make unnecessary queries"""
        with self.assertNumQueries(1) as queries:  # Just auth check
            response = self.client.get('/profile/')

        self.assertEqual(response.status_code, 401)

    def test_select_related_in_swap_requests(self):
        """Verify swap requests use select_related for related objects"""
        SwapRequest.objects.create(
            from_user=self.users[0],
            to_user=self.users[1],
            requested_skill=self.skills[0]
        )

        self.client.login(username='user0', password='pass123')

        # This should use select_related to avoid extra queries
        with self.assertNumQueries(5) as queries:
            response = self.client.get('/requests/')

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify data includes related objects (means select_related worked)
        if len(data['sent_requests']) > 0:
            self.assertIn('requested_skill', data['sent_requests'][0])
            self.assertIn('to_user', data['sent_requests'][0])

    def test_response_size_reasonable(self):
        """Test that response sizes are reasonable"""
        self.client.login(username='user0', password='pass123')

        response = self.client.get('/skills/browse/')
        self.assertEqual(response.status_code, 200)

        # Response should not be excessively large
        response_size = len(response.content)
        self.assertLess(response_size, 1000000,  # 1MB
            f"Response size is {response_size} bytes - may be too large")

    def test_query_count_with_empty_database(self):
        """Test query count with minimal data"""
        # Create new user with no additional data
        user = User.objects.create_user(username='newuser', password='pass123')
        Profile.objects.create(user=user)

        self.client.login(username='newuser', password='pass123')

        # Should still be efficient even with no data
        with self.assertNumQueries(5) as queries:
            response = self.client.get('/skills/browse/')

        self.assertEqual(response.status_code, 200)
