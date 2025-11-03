# backend/skillswap_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),

    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.user_login, name='login'),
    path('auth/logout/', views.user_logout, name='logout'),
    
    # Profile management
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/add-skill/', views.add_user_skill, name='add_user_skill'),
    
    # Skills and categories
    path('categories/', views.get_categories, name='get_categories'),
    path('skills/', views.get_skills, name='get_skills'),
    path('skills/browse/', views.browse_skills, name='browse_skills'),
    
    # Swap requests
    path('requests/', views.get_swap_requests, name='get_swap_requests'),
    path('requests/send/', views.send_swap_request, name='send_swap_request'),
    path('requests/<int:request_id>/update/', views.update_swap_request, name='update_swap_request'),
    
    # Reviews
    path('reviews/create/', views.create_review, name='create_review'),
    path('reviews/user/<int:user_id>/', views.get_reviews, name='get_reviews'),
]