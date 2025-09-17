# backend/skillswap_app/admin.py
from django.contrib import admin
from .models import Category, Skill, Profile, UserSkill, SwapRequest, Review

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'created_at')
    search_fields = ('user__username', 'location')
    list_filter = ('location', 'created_at')

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'can_teach', 'experience_level')
    list_filter = ('can_teach', 'experience_level', 'skill__category')
    search_fields = ('user__username', 'skill__name')

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'requested_skill', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('from_user__username', 'to_user__username', 'requested_skill__name')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('from_user__username', 'to_user__username')