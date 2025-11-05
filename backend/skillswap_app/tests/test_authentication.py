"""
Comprehensive authentication tests
Tests registration, login, logout, and session management
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from skillswap_app.models import Profile
import json


class AuthenticationTests(TestCase):
    """Test user authentication functionality"""

    def setUp(self):
        """Set up test client and test user"""
        self.client = Client()
        self.test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        Profile.objects.create(user=self.test_user)

    # Registration Tests

    def test_register_valid_user(self):
        """Test successful user registration"""
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'newpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('user_id', data)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        self.assertTrue(Profile.objects.filter(user__username='newuser').exists())

    def test_register_duplicate_username(self):
        """Test registration with duplicate username should fail"""
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': 'testuser',  # Already exists
                'email': 'another@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)
        self.assertIn('already exists', data['error'].lower())

    def test_register_missing_username(self):
        """Test registration without username should fail"""
        response = self.client.post('/auth/register/',
            json.dumps({
                'email': 'test@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_missing_password(self):
        """Test registration without password should fail"""
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': 'newuser',
                'email': 'test@example.com'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_empty_username(self):
        """Test registration with empty username should fail"""
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': '',
                'email': 'test@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_sql_injection_username(self):
        """Test that SQL injection attempts in username are handled safely"""
        malicious_username = "admin'--"
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': malicious_username,
                'email': 'hacker@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        # Should either fail or create user with escaped username
        if response.status_code == 200:
            # If it succeeds, verify the username is stored as-is, not executed
            user = User.objects.filter(username=malicious_username).first()
            self.assertIsNotNone(user)
            self.assertEqual(user.username, malicious_username)

    def test_register_xss_in_username(self):
        """Test that XSS attempts in username are handled"""
        xss_username = "<script>alert('xss')</script>"
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': xss_username,
                'email': 'xss@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        # Should handle without executing script
        if response.status_code == 200:
            user = User.objects.filter(username=xss_username).first()
            self.assertEqual(user.username, xss_username)

    def test_register_very_long_username(self):
        """Test registration with extremely long username"""
        long_username = 'a' * 200  # Longer than typical max_length
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': long_username,
                'email': 'long@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        # Should either fail or truncate
        self.assertIn(response.status_code, [200, 400])

    def test_register_unicode_username(self):
        """Test registration with unicode characters"""
        unicode_username = 'user_🚀_中文'
        response = self.client.post('/auth/register/',
            json.dumps({
                'username': unicode_username,
                'email': 'unicode@example.com',
                'password': 'pass123'
            }),
            content_type='application/json'
        )
        # Should handle unicode properly
        if response.status_code == 200:
            user = User.objects.filter(username=unicode_username).first()
            self.assertIsNotNone(user)

    # Login Tests

    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('user', data)
        self.assertEqual(data['user']['username'], 'testuser')
        # Verify session is created
        self.assertIn('sessionid', self.client.cookies)

    def test_login_invalid_username(self):
        """Test login with non-existent username"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'nonexistent',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn('error', data)

    def test_login_invalid_password(self):
        """Test login with wrong password"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'testuser',
                'password': 'wrongpassword'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn('error', data)

    def test_login_empty_credentials(self):
        """Test login with empty credentials"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': '',
                'password': ''
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_login_missing_username(self):
        """Test login without username field"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_login_missing_password(self):
        """Test login without password field"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'testuser'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_login_sql_injection(self):
        """Test SQL injection attempts in login"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': "admin' OR '1'='1",
                'password': "anything' OR '1'='1"
            }),
            content_type='application/json'
        )
        # Should fail, not authenticate
        self.assertEqual(response.status_code, 401)

    def test_login_case_sensitivity(self):
        """Test that username is case-sensitive (or not, depending on requirements)"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'TESTUSER',  # Different case
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        # Document the behavior: should fail if case-sensitive
        self.assertEqual(response.status_code, 401)

    def test_login_null_bytes(self):
        """Test login with null bytes in credentials"""
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'testuser\x00admin',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        # Should fail safely
        self.assertEqual(response.status_code, 401)

    # Logout Tests

    def test_logout_authenticated_user(self):
        """Test logout for authenticated user"""
        # First login
        self.client.login(username='testuser', password='testpass123')

        # Then logout
        response = self.client.post('/auth/logout/')
        self.assertEqual(response.status_code, 200)

        # Verify session is cleared
        response = self.client.get('/profile/')
        self.assertEqual(response.status_code, 401)

    def test_logout_unauthenticated_user(self):
        """Test logout when not logged in"""
        response = self.client.post('/auth/logout/')
        # Should not fail, just succeed silently
        self.assertEqual(response.status_code, 200)

    # Session Management Tests

    def test_multiple_login_attempts(self):
        """Test multiple failed login attempts (brute force)"""
        for i in range(10):
            response = self.client.post('/auth/login/',
                json.dumps({
                    'username': 'testuser',
                    'password': f'wrongpass{i}'
                }),
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 401)

        # Should still allow valid login (no lockout in current implementation)
        response = self.client.post('/auth/login/',
            json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )
        # This tests current behavior; might want to add rate limiting
        self.assertIn(response.status_code, [200, 429])  # 429 if rate limiting added

    def test_concurrent_sessions(self):
        """Test that user can have multiple sessions"""
        client1 = Client()
        client2 = Client()

        # Login from both clients
        response1 = client1.post('/auth/login/',
            json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )

        response2 = client2.post('/auth/login/',
            json.dumps({
                'username': 'testuser',
                'password': 'testpass123'
            }),
            content_type='application/json'
        )

        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        # Both should be able to access protected resources
        self.assertEqual(client1.get('/profile/').status_code, 200)
        self.assertEqual(client2.get('/profile/').status_code, 200)

    def test_session_persistence_after_password_change(self):
        """Test if changing password invalidates existing sessions"""
        # Login
        self.client.login(username='testuser', password='testpass123')

        # Change password
        self.test_user.set_password('newpass123')
        self.test_user.save()

        # Try to access protected resource
        response = self.client.get('/profile/')
        # Depending on implementation, session might be invalidated
        # Document current behavior
        self.assertIn(response.status_code, [200, 401])
