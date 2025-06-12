from django.core.management.base import BaseCommand
from assets_management.models import AssessmentCategory, AssessmentQuestion

class Command(BaseCommand):
    help = 'Seed the AssessmentQuestion model with initial data'

    def handle(self, *args, **kwargs):
        cia_categories = {
            'Confidentiality': [
                'To what degree should the information be protected from disclosure to unauthorized parties?',
                'What is the degree of encryption on the information asset?',
                'To what extent should file permission and access control list to restrict access to sensitive information be enforced?',
                'To what extent can information be made available to the internal staff only and is non-available to the public?',
            ],
            'Integrity': [
                'What is the level of sensitivity to the organization operations?',
                'To what extent should information be protected from being modified by unauthorized parties?',
                'What is the degree of cryptographic?',
                'To what extent is the information accurate and consistent?',
            ],
            'Availability': [
                'To what extent is the information accessible only to information owners and top managers?',
                'What is the degree of criticality to the organization?',
                'What is the impact level to the organization should the information be changed in transit, storage, or usage?',
                'To what extent should backup or redundancies be available to restore the affected data to its correct state?',
            ],
        }

        for category_name, questions in cia_categories.items():
            category, created = AssessmentCategory.objects.get_or_create(name=category_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {category_name}'))
            
            for question_text in questions:
                if not AssessmentQuestion.objects.filter(question_text=question_text, category=category).exists():
                    AssessmentQuestion.objects.create(category=category, question_text=question_text)
                    self.stdout.write(self.style.SUCCESS(f'Created question: "{question_text}" in category: {category_name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Question already exists: "{question_text}"'))
