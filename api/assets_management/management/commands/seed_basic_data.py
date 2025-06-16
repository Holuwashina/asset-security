"""
Django management command to seed comprehensive asset management data

This command creates extensive data for the asset classification system:
- Department records (comprehensive business departments)
- AssetType records (comprehensive IT and business asset types)
- Sample asset records (diverse examples)

Usage: python manage.py seed_basic_data
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from assets_management.models import (
    Department, AssetType, AssetListing
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
            AssetType.objects.all().delete()
            self.stdout.write(
                self.style.WARNING('Existing data cleared')
            )

        with transaction.atomic():
            # Seed Comprehensive Departments
            self.seed_comprehensive_departments()
            
            # Seed Comprehensive Asset Types
            self.seed_comprehensive_asset_types()
            
            # Seed Sample Assets
            self.seed_sample_assets()

        self.stdout.write(
            self.style.SUCCESS('✅ Comprehensive data seeding completed successfully!')
        )



    def seed_comprehensive_departments(self):
        """Create comprehensive department records covering all business areas"""
        self.stdout.write('🏢 Seeding comprehensive departments...')
        
        # Department seeding without asset value mappings
        
        departments = [
            # Core IT and Technology
            {
                'name': 'Information Technology',
                'reason': 'Manages critical IT infrastructure, systems, and cybersecurity',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Cybersecurity',
                'reason': 'Responsible for information security and threat management',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Data Management',
                'reason': 'Manages data governance, databases, and data analytics',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Network Operations',
                'reason': 'Maintains network infrastructure and telecommunications',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            
            # Financial and Compliance
            {
                'name': 'Finance',
                'reason': 'Handles financial data, transactions, and reporting',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Accounting',
                'reason': 'Manages financial records and accounting systems',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Compliance & Risk',
                'reason': 'Ensures regulatory compliance and risk management',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            {
                'name': 'Legal',
                'reason': 'Manages legal documents and regulatory affairs',
                'risk_appetite': 'Very Low',
                'compliance_level': 'Very High'
            },
            
            # Human Resources and Administration
            {
                'name': 'Human Resources',
                'reason': 'Manages employee information, records, and HR systems',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            {
                'name': 'Administration',
                'reason': 'Handles administrative functions and office management',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Facilities Management',
                'reason': 'Manages physical facilities and building systems',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            
            # Operations and Business
            {
                'name': 'Operations',
                'reason': 'Oversees daily business operations and processes',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
            {
                'name': 'Business Intelligence',
                'reason': 'Manages business analytics and reporting systems',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            {
                'name': 'Quality Assurance',
                'reason': 'Ensures quality standards and testing procedures',
                'risk_appetite': 'Low',
                'compliance_level': 'High'
            },
            
            # Customer and Sales
            {
                'name': 'Sales',
                'reason': 'Manages sales processes and customer acquisition',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Marketing',
                'reason': 'Handles marketing campaigns and brand management',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Customer Service',
                'reason': 'Manages customer support and service systems',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Customer Relations',
                'reason': 'Maintains customer relationships and communications',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            
            # Development and Innovation
            {
                'name': 'Research & Development',
                'reason': 'Develops new products and innovative solutions',
                'risk_appetite': 'High',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Product Development',
                'reason': 'Manages product lifecycle and development processes',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Engineering',
                'reason': 'Technical engineering and system design',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
            
            # Supply Chain and Procurement
            {
                'name': 'Procurement',
                'reason': 'Manages purchasing and supplier relationships',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Supply Chain',
                'reason': 'Oversees supply chain and logistics operations',
                'risk_appetite': 'Medium',
                'compliance_level': 'Medium'
            },
            {
                'name': 'Vendor Management',
                'reason': 'Manages third-party vendors and contractors',
                'risk_appetite': 'Medium',
                'compliance_level': 'High'
            },
        ]
        
        for dept_data in departments:
            department, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={
                    'reason': dept_data['reason'],
                    'risk_appetite': dept_data['risk_appetite'],
                    'compliance_level': dept_data['compliance_level']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created department: {department.name}')
                )

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
            
            # Additional Asset Types for Enhanced Testing
            ('Test Database', 'Non-production databases used for testing and development'),
            ('Payment System', 'Systems that process financial transactions and payments'),
            ('Office Equipment', 'Standard office hardware like printers, copiers, and peripherals'),
            ('Backup System', 'Data backup and disaster recovery systems'),
            ('Documentation System', 'Knowledge bases, wikis, and documentation platforms'),
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
        """Seed sample assets with diverse parameters for thesis research"""
        self.stdout.write('🏗️  Seeding sample assets...')
        
        # Get departments
        it_dept = Department.objects.get(name='Information Technology')
        finance_dept = Department.objects.get(name='Finance')
        hr_dept = Department.objects.get(name='Human Resources')
        security_dept = Department.objects.get(name='Cybersecurity')
        
        # Clean asset data without pre-set classification fields
        sample_assets = [
            {
                'asset': 'Production Database Server',
                'description': 'Primary production database server hosting critical business data',
                'asset_type': 'Production Database',
                'owner_department': it_dept,
                'asset_category': 'Data',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                # Input parameters for classification algorithm
                'business_criticality': 0.9,
                'regulatory_impact': 0.8,
                'operational_dependency': 0.85,
                'data_sensitivity': 0.95,
                # CIA triad for risk assessment
                'confidentiality': 0.9,
                'integrity': 0.95,
                'availability': 0.9,
                # Standards compliance
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                # Risk assessment parameters
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
                'asset_category': 'Data',
                'industry_sector': 'Financial Services',
                'compliance_framework': 'GDPR',
                'nist_function': 'Protect',
                'business_criticality': 0.95,
                'regulatory_impact': 0.9,
                'operational_dependency': 0.8,
                'data_sensitivity': 0.95,
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
                'asset_category': 'Applications',
                'industry_sector': 'Technology',
                'compliance_framework': 'HIPAA',
                'nist_function': 'Protect',
                'business_criticality': 0.7,
                'regulatory_impact': 0.8,
                'operational_dependency': 0.6,
                'data_sensitivity': 0.85,
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
                'asset_category': 'Systems',
                'industry_sector': 'Technology',
                'compliance_framework': 'NIST CSF',
                'nist_function': 'Detect',
                'business_criticality': 0.8,
                'regulatory_impact': 0.6,
                'operational_dependency': 0.9,
                'data_sensitivity': 0.7,
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
                'asset_category': 'Networks',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                'business_criticality': 0.9,
                'regulatory_impact': 0.8,
                'operational_dependency': 0.95,
                'data_sensitivity': 0.6,
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
                'asset_category': 'Services',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Protect',
                'business_criticality': 0.6,
                'regulatory_impact': 0.5,
                'operational_dependency': 0.8,
                'data_sensitivity': 0.7,
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
            {
                'asset': 'Development Test Database',
                'description': 'Non-production test database with sanitized data',
                'asset_type': 'Test Database',
                'owner_department': it_dept,
                'asset_category': 'Systems',
                'industry_sector': 'Technology',
                'compliance_framework': 'None',
                'nist_function': 'Identify',
                'business_criticality': 0.2,
                'regulatory_impact': 0.1,
                'operational_dependency': 0.3,
                'data_sensitivity': 0.2,
                'confidentiality': 0.3,
                'integrity': 0.4,
                'availability': 0.3,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.1,
                'consequence': 0.2,
                'compliance_factor': 0.8,
                'industry_factor': 0.9,
                'calculated_risk_level': 0.07,
                'mathematical_risk_category': 'Low Risk',
            },
            {
                'asset': 'Financial Reporting System',
                'description': 'Critical system for generating financial reports and statements',
                'asset_type': 'Financial System',
                'owner_department': finance_dept,
                'asset_category': 'Applications',
                'industry_sector': 'Financial Services',
                'compliance_framework': 'SOX',
                'nist_function': 'Protect',
                'business_criticality': 0.95,
                'regulatory_impact': 0.95,
                'operational_dependency': 0.9,
                'data_sensitivity': 0.9,
                'confidentiality': 0.9,
                'integrity': 0.95,
                'availability': 0.9,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.2,
                'consequence': 0.95,
                'compliance_factor': 1.4,
                'industry_factor': 1.3,
                'calculated_risk_level': 0.35,
                'mathematical_risk_category': 'Medium Risk',
            },
            {
                'asset': 'Office Printer Network',
                'description': 'Standard office printers and printing services',
                'asset_type': 'Office Equipment',
                'owner_department': it_dept,
                'asset_category': 'Hardware',
                'industry_sector': 'Technology',
                'compliance_framework': 'None',
                'nist_function': 'Identify',
                'business_criticality': 0.3,
                'regulatory_impact': 0.2,
                'operational_dependency': 0.4,
                'data_sensitivity': 0.3,
                'confidentiality': 0.4,
                'integrity': 0.3,
                'availability': 0.5,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.2,
                'consequence': 0.3,
                'compliance_factor': 0.9,
                'industry_factor': 0.8,
                'calculated_risk_level': 0.04,
                'mathematical_risk_category': 'Low Risk',
            },
            {
                'asset': 'Backup Storage System',
                'description': 'Centralized backup and disaster recovery storage',
                'asset_type': 'Backup System',
                'owner_department': it_dept,
                'asset_category': 'Infrastructure',
                'industry_sector': 'Technology',
                'compliance_framework': 'ISO 27001',
                'nist_function': 'Recover',
                'business_criticality': 0.75,
                'regulatory_impact': 0.7,
                'operational_dependency': 0.8,
                'data_sensitivity': 0.85,
                'confidentiality': 0.8,
                'integrity': 0.9,
                'availability': 0.7,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.3,
                'consequence': 0.8,
                'compliance_factor': 1.1,
                'industry_factor': 1.0,
                'calculated_risk_level': 0.26,
                'mathematical_risk_category': 'Medium Risk',
            },
            {
                'asset': 'Payment Processing Gateway',
                'description': 'Critical payment processing system for customer transactions',
                'asset_type': 'Payment System',
                'owner_department': finance_dept,
                'asset_category': 'Applications',
                'industry_sector': 'Financial Services',
                'compliance_framework': 'PCI DSS',
                'nist_function': 'Protect',
                'business_criticality': 0.98,
                'regulatory_impact': 0.95,
                'operational_dependency': 0.95,
                'data_sensitivity': 0.98,
                'confidentiality': 0.95,
                'integrity': 0.98,
                'availability': 0.95,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.4,
                'consequence': 0.98,
                'compliance_factor': 1.5,
                'industry_factor': 1.4,
                'calculated_risk_level': 0.82,
                'mathematical_risk_category': 'High Risk',
            },
            {
                'asset': 'Internal Wiki System',
                'description': 'Internal knowledge base and documentation system',
                'asset_type': 'Documentation System',
                'owner_department': it_dept,
                'asset_category': 'Applications',
                'industry_sector': 'Technology',
                'compliance_framework': 'None',
                'nist_function': 'Identify',
                'business_criticality': 0.4,
                'regulatory_impact': 0.2,
                'operational_dependency': 0.5,
                'data_sensitivity': 0.4,
                'confidentiality': 0.5,
                'integrity': 0.6,
                'availability': 0.4,
                'standards_version': 'NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
                'methodology': 'Standards_Compliant_Risk_Assessment',
                'likelihood': 0.2,
                'consequence': 0.4,
                'compliance_factor': 0.8,
                'industry_factor': 0.9,
                'calculated_risk_level': 0.06,
                'mathematical_risk_category': 'Low Risk',
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
        self.stdout.write(f'   - Departments: {Department.objects.count()}')
        self.stdout.write(f'   - Asset Types: {AssetType.objects.count()}')
        self.stdout.write(f'   - Assets: {AssetListing.objects.count()}')