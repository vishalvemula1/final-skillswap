# backend\skillswap_app\models.py
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    """Skill categories like Programming, Languages, etc."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Skill(models.Model):
    """Individual skills like Python, Guitar, etc."""
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'skills'
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Profile(models.Model):
    """Extended user profile with location and bio"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        indexes = [
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return f"{self.user.username}'s Profile"

class UserSkill(models.Model):
    """Many-to-many relationship: Users and Skills they can teach/want to learn"""
    EXPERIENCE_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    can_teach = models.BooleanField(default=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='Intermediate')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_skills'
        unique_together = ['user', 'skill']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['skill']),
            models.Index(fields=['can_teach']),
        ]

    def __str__(self):
        action = "teaches" if self.can_teach else "wants to learn"
        return f"{self.user.username} {action} {self.skill.name}"

class SwapRequest(models.Model):
    """Skill swap requests between users"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    requested_skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requested_for')
    offered_skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True, blank=True, related_name='offered_for')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'swap_requests'
        indexes = [
            models.Index(fields=['from_user']),
            models.Index(fields=['to_user']),
            models.Index(fields=['status']),
            models.Index(fields=['requested_skill']),
        ]

    def __str__(self):
        return f"{self.from_user.username} â†’ {self.to_user.username}: {self.requested_skill.name}"

class Review(models.Model):
    """Reviews and ratings after completed skill swaps"""
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    swap_request = models.ForeignKey(SwapRequest, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ['from_user', 'swap_request']
        indexes = [
            models.Index(fields=['to_user']),
            models.Index(fields=['rating']),
            models.Index(fields=['swap_request']),
        ]

    def __str__(self):
        return f"{self.from_user.username} â†’ {self.to_user.username}: {self.rating}/5"