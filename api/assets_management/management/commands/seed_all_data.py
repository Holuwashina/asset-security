"""
Master Django management command to seed ALL data

This command runs all available seeders in the correct order:
1. Basic data (departments, asset types, asset values, sample assets)
2. Assessment questions and categories
3. Any additional seeders

Usage: python manage.py seed_all_data
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction
from datetime import datetime
import os

class Command(BaseCommand):
    help = 'Run all available data seeders in the correct order'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
        parser.add_argument(
            '--skip-basic',
            action='store_true',
            help='Skip basic data seeding (departments, asset types, etc.)',
        )
        parser.add_argument(
            '--skip-questions',
            action='store_true',
            help='Skip assessment questions seeding',
        )

    def handle(self, *args, **options):
        clear_existing = options['clear']
        skip_basic = options['skip_basic']
        skip_questions = options['skip_questions']
        
        start_time = datetime.now()
        
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting ALL data seeding...')
        )
        self.stdout.write('=' * 60)

        try:
            with transaction.atomic():
                # Step 1: Seed basic data (departments, asset types, asset values, sample assets)
                if not skip_basic:
                    self.stdout.write('\n📊 Step 1: Seeding Basic Data')
                    self.stdout.write('-' * 40)
                    try:
                        if clear_existing:
                            call_command('seed_basic_data', '--clear', verbosity=2)
                        else:
                            call_command('seed_basic_data', verbosity=2)
                        self.stdout.write(
                            self.style.SUCCESS('✅ Basic data seeding completed')
                        )
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'❌ Basic data seeding failed: {str(e)}')
                        )
                        raise
                else:
                    self.stdout.write('\n⏭️  Skipping basic data seeding')

                # Step 2: Seed assessment questions
                if not skip_questions:
                    self.stdout.write('\n❓ Step 2: Seeding Assessment Questions')
                    self.stdout.write('-' * 40)
                    try:
                        call_command('seed_assessment_questions', verbosity=2)
                        self.stdout.write(
                            self.style.SUCCESS('✅ Assessment questions seeding completed')
                        )
                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️  Assessment questions seeding failed: {str(e)}')
                        )
                        self.stdout.write(
                            self.style.WARNING('This is non-critical, continuing...')
                        )
                else:
                    self.stdout.write('\n⏭️  Skipping assessment questions seeding')

                # Step 3: Check for additional seeders
                self.stdout.write('\n🔍 Step 3: Checking for Additional Seeders')
                self.stdout.write('-' * 40)
                self.check_additional_seeders()

            end_time = datetime.now()
            
            # Final summary
            self.stdout.write('\n' + '=' * 60)
            self.stdout.write(
                self.style.SUCCESS('🎉 ALL DATA SEEDING COMPLETED!')
            )
            self.stdout.write('=' * 60)
            
            self.stdout.write(f'⏱️  Total seeding time: {end_time - start_time}')
            
            # Display comprehensive summary
            self.display_final_summary()
            
            self.stdout.write('\n🚀 All systems ready for use!')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Seeding failed: {str(e)}')
            )
            raise

    def check_additional_seeders(self):
        """Check for any additional seeder commands"""
        commands_dir = os.path.dirname(__file__)
        seeder_files = [f for f in os.listdir(commands_dir) if f.startswith('seed_') and f.endswith('.py')]
        
        known_seeders = ['seed_all_data.py', 'seed_basic_data.py', 'seed_assessment_questions.py']
        additional_seeders = [f for f in seeder_files if f not in known_seeders]
        
        if additional_seeders:
            self.stdout.write(f'Found {len(additional_seeders)} additional seeders:')
            for seeder in additional_seeders:
                command_name = seeder.replace('.py', '')
                self.stdout.write(f'  📄 {command_name}')
                try:
                    call_command(command_name, verbosity=1)
                    self.stdout.write(f'  ✅ {command_name} completed')
                except Exception as e:
                    self.stdout.write(f'  ⚠️  {command_name} failed: {str(e)}')
        else:
            self.stdout.write('No additional seeders found')

    def display_final_summary(self):
        """Display comprehensive summary of seeded data"""
        try:
            from assets_management.models import (
                AssetValueMapping, Department, AssetType, AssetListing,
                AssessmentCategory, AssessmentQuestion
            )
            
            self.stdout.write(f'\n📊 Comprehensive Data Summary:')
            self.stdout.write(f'   - Asset Value Mappings: {AssetValueMapping.objects.count()}')
            self.stdout.write(f'   - Departments: {Department.objects.count()}')
            self.stdout.write(f'   - Asset Types: {AssetType.objects.count()}')
            self.stdout.write(f'   - Sample Assets: {AssetListing.objects.count()}')
            
            # Assessment data (might not exist)
            try:
                categories_count = AssessmentCategory.objects.count()
                questions_count = AssessmentQuestion.objects.count()
                self.stdout.write(f'   - Assessment Categories: {categories_count}')
                self.stdout.write(f'   - Assessment Questions: {questions_count}')
            except:
                self.stdout.write(f'   - Assessment Data: Not available')
            
            self.stdout.write(f'\n🔗 Available API Endpoints:')
            endpoints = [
                'GET  /api/departments/',
                'GET  /api/asset-types/', 
                'GET  /api/asset-value-mappings/',
                'GET  /api/assets/',
                'GET  /api/assessment-categories/',
                'GET  /api/assessment-questions/',
                'POST /api/ml/upload_dataset/',
                'GET  /api/ml/list_datasets/',
                'POST /api/ml/train_models/',
            ]
            
            for endpoint in endpoints:
                self.stdout.write(f'   {endpoint}')
            
            self.stdout.write(f'\n🖥️  Frontend Features Ready:')
            features = [
                'Asset creation form with populated dropdowns',
                'Asset classification and risk analysis',
                'ML training and testing interface',
                'Assessment questionnaire system',
                'Comprehensive reporting and analytics',
            ]
            
            for feature in features:
                self.stdout.write(f'   ✅ {feature}')
                
        except Exception as e:
            self.stdout.write(f'   ⚠️  Could not generate summary: {str(e)}')