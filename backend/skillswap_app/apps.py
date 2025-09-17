# backend/skillswap_app/apps.py
from django.apps import AppConfig


class SkillswapAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'skillswap_app'
    verbose_name = 'Skill Swap Application'