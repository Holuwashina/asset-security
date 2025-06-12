# signals.py
from django.db.models.signals import post_migrate
from django.core.management import call_command
from django.dispatch import receiver

@receiver(post_migrate)
def run_seeders(sender, **kwargs):
    if kwargs.get('app_config').name == 'assets_management':
        try:
            call_command('seed_basic_data')
            call_command('seed_assessment_questions')
        except Exception as e:
            # Silently handle seeding errors for development
            pass
