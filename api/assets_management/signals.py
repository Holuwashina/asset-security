# signals.py
from django.db.models.signals import post_migrate
from django.core.management import call_command
from django.dispatch import receiver

@receiver(post_migrate)
def run_seeders(sender, **kwargs):
    if kwargs.get('app_config').name == 'assets_management':
        call_command('seed_asset_value_mapping')
        call_command('seed_asset_types')
        call_command('seed_departments')
        call_command('seed_assets')
        call_command('seed_assessment_questions')
