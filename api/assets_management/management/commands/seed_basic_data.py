"""
Django management command to seed comprehensive asset management data

This command creates extensive data for the asset classification system:
- AssetValueMapping records (5 levels)
- Department records (comprehensive business departments)
- AssetType records (comprehensive IT and business asset types)
- Sample asset records (diverse examples)

Usage: python manage.py seed_basic_data
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from assets_management.models import (
    AssetValueMapping, Department, AssetType, AssetListing
)
import uuid

class Command(BaseCommand):
    help = 'Seed comprehensive asset management data for the application'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        clear_existing = options['clear']
        
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting comprehensive data seeding...')
        )

        if clear_existing:
            self.stdout.write('🗑️  Clearing existing data...')
            AssetListing.objects.all().delete()
            Department.objects.all().delete()
            AssetValueMapping.objects.all().delete()
            AssetType.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Existing data cleared')
            )

        with transaction.atomic():
            # Seed Asset Value Mappings
            self.seed_asset_value_mappings()
            
            # Seed Comprehensive Departments
            self.seed_comprehensive_departments()
            
            # Seed Comprehensive Asset Types
            self.seed_comprehensive_asset_types()
            
            # Seed Sample Assets
            self.seed_sample_assets()

        self.stdout.write(
            self.style.SUCCESS('✅ Comprehensive data seeding completed successfully!')
        )

    def seed_asset_value_mappings(self):
        """Create comprehensive asset value mappings"""
        self.stdout.write('📊 Seeding asset value mappings...')
        
        mappings = [
            ('Very Low', 0.2),
            ('Low', 0.4),
            ('Medium', 0.6),
            ('High', 0.8),
            ('Very High', 1.0),
        ]
        
        for qualitative_value, crisp_value in mappings:
            mapping, created = AssetValueMapping.objects.get_or_create(
                qualitative_value=qualitative_value,
                defaults={'crisp_value': crisp_value}
            )
            if created:
                self.stdout.write(f'  ✅ Created: {qualitative_value} ({crisp_value})')
            else:
                self.stdout.write(f'  ⚠️  Exists: {qualitative_value}')

    def seed_comprehensive_departments(self):
        """Create comprehensive department records covering all business areas"""
        self.stdout.write('🏢 Seeding comprehensive departments...')
        
        # Get asset value mappings
        very_low_value = AssetValueMapping.objects.get(qualitative_value='Very Low')
        low_value = AssetValueMapping.objects.get(qualitative_value='Low')
        medium_value = AssetValueMapping.objects.get(qualitative_value='Medium')
        high_value = AssetValueMapping.objects.get(qualitative_value='High')
        very_high_value = AssetValueMapping.objects.get(qualitative_value='Very High')
        
        departments = [
            # Core IT and Technology
            {
                'name': 'Information Technology',
                'asset_value_mapping': very_high_value,
                'reason': 'Manages critical IT infrastructure, systems, and cybersecurity',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Cybersecurity',
                'asset_value_mapping': very_high_value,
                'reason': 'Responsible for information security and threat management',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Data Management',
                'asset_value_mapping': very_high_value,
                'reason': 'Manages data governance, databases, and data analytics',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Network Operations',
                'asset_value_mapping': high_value,
                'reason': 'Maintains network infrastructure and telecommunications',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            
            # Financial and Compliance
            {
                'name': 'Finance',
                'asset_value_mapping': very_high_value,
                'reason': 'Handles financial data, transactions, and reporting',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Accounting',
                'asset_value_mapping': high_value,
                'reason': 'Manages financial records and accounting systems',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Compliance & Risk',
                'asset_value_mapping': very_high_value,
                'reason': 'Ensures regulatory compliance and risk management',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Legal',
                'asset_value_mapping': high_value,
                'reason': 'Manages legal documents and regulatory affairs',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            
            # Human Resources and Administration
            {
                'name': 'Human Resources',
                'asset_value_mapping': high_value,
                'reason': 'Manages employee information, records, and HR systems',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            {
                'name': 'Administration',
                'asset_value_mapping': medium_value,
                'reason': 'Handles administrative functions and office management',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Facilities Management',
                'asset_value_mapping': medium_value,
                'reason': 'Manages physical facilities and building systems',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            
            # Operations and Business
            {
                'name': 'Operations',
                'asset_value_mapping': high_value,
                'reason': 'Oversees daily business operations and processes',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
            {
                'name': 'Business Intelligence',
                'asset_value_mapping': high_value,
                'reason': 'Manages business analytics and reporting systems',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            {
                'name': 'Quality Assurance',
                'asset_value_mapping': medium_value,
                'reason': 'Ensures quality standards and testing procedures',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            
            # Customer and Sales
            {
                'name': 'Sales',
                'asset_value_mapping': medium_value,
                'reason': 'Manages sales processes and customer acquisition',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Marketing',
                'asset_value_mapping': medium_value,
                'reason': 'Handles marketing campaigns and brand management',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Customer Service',
                'asset_value_mapping': medium_value,
                'reason': 'Manages customer support and service systems',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Customer Relations',
                'asset_value_mapping': medium_value,
                'reason': 'Maintains customer relationships and communications',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            
            # Development and Innovation
            {
                'name': 'Research & Development',
                'asset_value_mapping': high_value,
                'reason': 'Develops new products and innovative solutions',
                'risk_appetite': 'High',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Product Development',
                'asset_value_mapping': high_value,
                'reason': 'Manages product lifecycle and development processes',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Software Development',
                'asset_value_mapping': high_value,
                'reason': 'Develops and maintains software applications',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
            
            # Supply Chain and Procurement
            {
                'name': 'Procurement',
                'asset_value_mapping': medium_value,
                'reason': 'Manages purchasing and vendor relationships',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Supply Chain',
                'asset_value_mapping': medium_value,
                'reason': 'Oversees supply chain and logistics operations',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Vendor Management',
                'asset_value_mapping': medium_value,
                'reason': 'Manages third-party vendors and contractors',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
        ]
        
        for dept_data in departments:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults=dept_data
            )
            if created:
                self.stdout.write(f'  ✅ Created: {dept_data["name"]}')
            else:
                self.stdout.write(f'  ⚠️  Exists: {dept_data["name"]}')

    def seed_comprehensive_asset_types(self):
        """Create comprehensive asset type records covering all IT and business assets"""
        self.stdout.write('💾 Seeding comprehensive asset types...')
        
        asset_types = [
            # Server and Infrastructure
            ('Database Server', 'Database management systems and database servers'),
            ('Web Server', 'Web application servers and HTTP services'),
            ('Application Server', 'Enterprise application servers and middleware'),
            ('File Server', 'File storage and sharing systems'),
            ('Mail Server', 'Email servers and messaging systems'),
            ('Domain Controller', 'Active Directory and authentication servers'),
            ('Backup Server', 'Data backup and recovery systems'),
            ('Monitoring Server', 'System monitoring and alerting platforms'),
            ('Virtualization Host', 'Virtual machine host servers and hypervisors'),
            ('Cloud Server', 'Cloud-based virtual servers and instances'),
            
            # Network Infrastructure
            ('Router', 'Network routing equipment and devices'),
            ('Switch', 'Network switching equipment and managed switches'),
            ('Firewall', 'Network security and firewall appliances'),
            ('Load Balancer', 'Traffic load balancing and distribution systems'),
            ('VPN Gateway', 'Virtual private network access points'),
            ('Wireless Access Point', 'WiFi and wireless network equipment'),
            ('Network Storage', 'NAS and SAN storage systems'),
            ('Network Appliance', 'Specialized network hardware and appliances'),
            
            # Security Systems
            ('Antivirus System', 'Endpoint protection and antivirus solutions'),
            ('Intrusion Detection System', 'Network and host-based intrusion detection'),
            ('SIEM System', 'Security information and event management'),
            ('Identity Management System', 'User identity and access management'),
            ('Certificate Authority', 'PKI and digital certificate management'),
            ('Security Scanner', 'Vulnerability scanning and assessment tools'),
            ('DLP System', 'Data loss prevention and protection systems'),
            ('Encryption System', 'Data encryption and key management'),
            
            # Data and Databases
            ('Production Database', 'Live production database systems'),
            ('Development Database', 'Development and testing databases'),
            ('Data Warehouse', 'Enterprise data warehousing systems'),
            ('Big Data Platform', 'Big data processing and analytics platforms'),
            ('Data Lake', 'Unstructured data storage and processing'),
            ('Analytics Platform', 'Business intelligence and analytics tools'),
            ('Reporting System', 'Business reporting and dashboard systems'),
            ('ETL System', 'Extract, transform, and load data processing'),
            
            # Business Applications
            ('ERP System', 'Enterprise resource planning applications'),
            ('CRM System', 'Customer relationship management systems'),
            ('HR System', 'Human resources management applications'),
            ('Financial System', 'Financial and accounting applications'),
            ('Document Management', 'Document storage and management systems'),
            ('Content Management', 'Web content management and publishing'),
            ('Project Management', 'Project tracking and management tools'),
            ('Collaboration Platform', 'Team collaboration and communication tools'),
            ('Video Conferencing', 'Video meeting and conferencing systems'),
            ('VoIP System', 'Voice over IP and telephony systems'),
            
            # Development and Testing
            ('Development Environment', 'Software development platforms and tools'),
            ('Testing Environment', 'Quality assurance and testing systems'),
            ('Source Code Repository', 'Version control and code management'),
            ('CI/CD Pipeline', 'Continuous integration and deployment tools'),
            ('Container Platform', 'Docker and container orchestration systems'),
            ('API Gateway', 'API management and gateway services'),
            
            # End User Devices
            ('Desktop Computer', 'Employee desktop computers and workstations'),
            ('Laptop Computer', 'Portable computers and mobile workstations'),
            ('Mobile Device', 'Smartphones and tablets for business use'),
            ('Printer', 'Network printers and multifunction devices'),
            ('Scanner', 'Document scanning and digitization equipment'),
            ('Point of Sale', 'POS terminals and retail systems'),
            
            # Cloud and SaaS
            ('Cloud Service', 'Software as a Service (SaaS) applications'),
            ('Cloud Storage', 'Cloud-based storage and backup services'),
            ('Cloud Platform', 'Platform as a Service (PaaS) offerings'),
            ('Cloud Infrastructure', 'Infrastructure as a Service (IaaS) resources'),
            ('CDN Service', 'Content delivery network services'),
            
            # IoT and Specialized
            ('IoT Device', 'Internet of Things sensors and devices'),
            ('Industrial Control', 'SCADA and industrial control systems'),
            ('Building Management', 'Facility and building automation systems'),
            ('Surveillance System', 'Security cameras and monitoring equipment'),
            ('Audio/Video System', 'Conference room and presentation equipment'),
            
            # Data Types
            ('Customer Data', 'Customer personal information and records'),
            ('Employee Data', 'Human resources and employee information'),
            ('Financial Data', 'Financial records and transaction data'),
            ('Intellectual Property', 'Patents, trademarks, and proprietary information'),
            ('Legal Documents', 'Contracts, agreements, and legal records'),
            ('Business Plans', 'Strategic plans and business documentation'),
            ('Technical Documentation', 'System documentation and procedures'),
            ('Compliance Records', 'Regulatory and compliance documentation'),
        ]
        
        for name, description in asset_types:
            asset_type, created = AssetType.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(f'  ✅ Created: {name}')
            else:
                self.stdout.write(f'  ⚠️  Exists: {name}')

    def seed_sample_assets(self):
        """Create diverse sample asset records"""
        self.stdout.write('🏗️  Seeding sample assets...')
        
        # Get required objects
        it_dept = Department.objects.get(name='Information Technology')
        finance_dept = Department.objects.get(name='Finance')
        hr_dept = Department.objects.get(name='Human Resources')
        security_dept = Department.objects.get(name='Cybersecurity')
        data_dept = Department.objects.get(name='Data Management')
        
        very_high_value = AssetValueMapping.objects.get(qualitative_value='Very High')
        high_value = AssetValueMapping.objects.get(qualitative_value='High')
        medium_value = AssetValueMapping.objects.get(qualitative_value='Medium')
        
        sample_assets = [
            {
                'asset': 'Production Database Server',
                'description': 'Main production database containing customer and business data',
                'asset_type': 'Production Database',
                'owner_department': data_dept,
                'asset_value': very_high_value,
                'asset_category': 'Systems',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                'classification': 'High',
                'confidentiality': 0.9,
                'integrity': 0.95,
                'availability': 0.9,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.3,
                'consequence': 0.9,
                'compliance_factor': 1.2,
                'industry_factor': 1.1,
                'calculated_risk_level': 0.35,
                'mathematical_risk_category': 'Medium Risk',
            },
            {
                'asset': 'Customer Database',
                'description': 'Database containing customer personal information and transaction history',
                'asset_type': 'Customer Data',
                'owner_department': finance_dept,
                'asset_value': very_high_value,
                'asset_category': 'Data',
                'industry_sector': 'Financial Services',
                'compliance_framework': 'GDPR',
                'nist_function': 'Protect',
                'classification': 'High',
                'confidentiality': 0.95,
                'integrity': 0.9,
                'availability': 0.8,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.4,
                'consequence': 0.95,
                'compliance_factor': 1.3,
                'industry_factor': 1.4,
                'calculated_risk_level': 0.68,
                'mathematical_risk_category': 'High Risk',
            },
            {
                'asset': 'Employee Records System',
                'description': 'HR system containing employee personal and employment information',
                'asset_type': 'HR System',
                'owner_department': hr_dept,
                'asset_value': high_value,
                'asset_category': 'Applications',
                'industry_sector': 'Technology',
                'compliance_framework': 'HIPAA',
                'nist_function': 'Protect',
                'classification': 'Moderate',
                'confidentiality': 0.8,
                'integrity': 0.85,
                'availability': 0.7,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.2,
                'consequence': 0.8,
                'compliance_factor': 1.1,
                'industry_factor': 1.0,
                'calculated_risk_level': 0.18,
                'mathematical_risk_category': 'Low Risk',
            },
            {
                'asset': 'Web Application Server',
                'description': 'Main web server hosting customer-facing applications',
                'asset_type': 'Web Server',
                'owner_department': it_dept,
                'asset_value': high_value,
                'asset_category': 'Systems',
                'industry_sector': 'Technology',
                'compliance_framework': 'NIST CSF',
                'nist_function': 'Detect',
                'classification': 'High',
                'confidentiality': 0.7,
                'integrity': 0.8,
                'availability': 0.95,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.5,
                'consequence': 0.8,
                'compliance_factor': 1.0,
                'industry_factor': 1.1,
                'calculated_risk_level': 0.44,
                'mathematical_risk_category': 'Medium Risk',
            },
            {
                'asset': 'Firewall System',
                'description': 'Network security firewall protecting internal systems',
                'asset_type': 'Firewall',
                'owner_department': security_dept,
                'asset_value': very_high_value,
                'asset_category': 'Networks',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                'classification': 'High',
                'confidentiality': 0.6,
                'integrity': 0.9,
                'availability': 0.95,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.3,
                'consequence': 0.9,
                'compliance_factor': 1.2,
                'industry_factor': 1.1,
                'calculated_risk_level': 0.36,
                'mathematical_risk_category': 'Medium Risk',
            },
            {
                'asset': 'Email Server',
                'description': 'Corporate email system for internal and external communications',
                'asset_type': 'Mail Server',
                'owner_department': it_dept,
                'asset_value': medium_value,
                'asset_category': 'Services',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                'classification': 'Moderate',
                'confidentiality': 0.75,
                'integrity': 0.8,
                'availability': 0.85,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.3,
                'consequence': 0.75,
                'compliance_factor': 1.1,
                'industry_factor': 1.0,
                'calculated_risk_level': 0.25,
                'mathematical_risk_category': 'Medium Risk',
            },
        ]
        
        for asset_data in sample_assets:
            asset, created = AssetListing.objects.get_or_create(
                asset=asset_data['asset'],
                defaults=asset_data
            )
            if created:
                self.stdout.write(f'  ✅ Created: {asset_data["asset"]}')
            else:
                self.stdout.write(f'  ⚠️  Exists: {asset_data["asset"]}')

        self.stdout.write(
            self.style.SUCCESS(f'📊 Comprehensive data summary:')
        )
        self.stdout.write(f'   - Asset Value Mappings: {AssetValueMapping.objects.count()}')
        self.stdout.write(f'   - Departments: {Department.objects.count()}')
        self.stdout.write(f'   - Asset Types: {AssetType.objects.count()}')
        self.stdout.write(f'   - Assets: {AssetListing.objects.count()}')