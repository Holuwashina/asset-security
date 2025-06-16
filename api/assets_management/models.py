from django.db import models
import uuid

class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Department(TimeStampedModel):
    name = models.CharField(max_length=255)
    reason = models.TextField()
    

    
    # Standards-compliant additions
    risk_appetite = models.CharField(
        max_length=20, 
        choices=[
            ('Very Low', 'Very Low'),
            ('Low', 'Low'),
            ('Medium', 'Medium'),
            ('High', 'High'),
            ('Very High', 'Very High')
        ],
        default='Medium',
        help_text='ISO 27001 organizational risk appetite'
    )
    compliance_level = models.CharField(
        max_length=20,
        choices=[
            ('Very High', 'Very High'),
            ('High', 'High'),
            ('Medium', 'Medium'),
            ('Low', 'Low')
        ],
        default='Medium',
        help_text='ISO 27001 compliance maturity level'
    )



    def __str__(self):
        return self.name

class AssetType(TimeStampedModel):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Asset(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class AssetListing(TimeStampedModel):
    asset = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True) 
    asset_type = models.CharField(max_length=255)
    owner_department = models.ForeignKey(Department, on_delete=models.CASCADE)
    
    asset_category = models.CharField(
        max_length=50, 
        choices=[
            ('Data', 'Data'),
            ('Applications', 'Applications'),
            ('Systems', 'Systems'),
            ('Networks', 'Networks'),
            ('Services', 'Services')
        ],
        null=True, 
        blank=True,
        help_text='NIST Cybersecurity Framework asset category'
    )
    
    industry_sector = models.CharField(
        max_length=100, 
        choices=[
            ('Financial Services', 'Financial Services'),
            ('Healthcare', 'Healthcare'),
            ('Government', 'Government'),
            ('Energy & Utilities', 'Energy & Utilities'),
            ('Manufacturing', 'Manufacturing'),
            ('Technology', 'Technology'),
            ('Retail', 'Retail'),
            ('Education', 'Education'),
            ('Transportation', 'Transportation'),
            ('Telecommunications', 'Telecommunications')
        ],
        null=True, 
        blank=True,
        help_text='Industry sector for regulatory context'
    )
    
    compliance_framework = models.CharField(
        max_length=20,
        choices=[
            ('SOX', 'Sarbanes-Oxley Act'),
            ('HIPAA', 'Health Insurance Portability and Accountability Act'),
            ('PCI-DSS', 'Payment Card Industry Data Security Standard'),
            ('GDPR', 'General Data Protection Regulation'),
            ('FISMA', 'Federal Information Security Management Act'),
            ('ISO 27001', 'ISO/IEC 27001:2013'),
            ('NIST CSF', 'NIST Cybersecurity Framework'),
            ('COBIT', 'Control Objectives for Information Technology'),
            ('None', 'No specific compliance requirement')
        ],
        default='None',
        help_text='Primary regulatory/compliance framework'
    )
    
    business_criticality = models.FloatField(
        null=True,
        blank=True,
        help_text='Business criticality level (0-1 scale): How critical is this asset to core business operations'
    )
    regulatory_impact = models.FloatField(
        null=True,
        blank=True,
        help_text='Regulatory impact level (0-1 scale): Level of regulatory oversight for this specific asset'
    )
    operational_dependency = models.FloatField(
        null=True,
        blank=True,
        help_text='Operational dependency level (0-1 scale): How much other systems/processes depend on this asset'
    )
    data_sensitivity = models.FloatField(
        null=True,
        blank=True,
        help_text='Data sensitivity level (0-1 scale): Sensitivity of data handled/stored by this asset'
    )
    
    classification = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text='NIST SP 800-60 information impact level with value (e.g., "High (0.85)")'
    )
    classification_value = models.FloatField(
        null=True, 
        blank=True,
        help_text='Quantitative classification score (0-1 scale)'
    )
    
    confidentiality = models.FloatField(
        null=True, 
        blank=True,
        help_text='Confidentiality impact score (0-1 scale)'
    )
    integrity = models.FloatField(
        null=True, 
        blank=True,
        help_text='Integrity impact score (0-1 scale)'
    )
    availability = models.FloatField(
        null=True, 
        blank=True,
        help_text='Availability impact score (0-1 scale)'
    )
    risk_index = models.FloatField(
        null=True, 
        blank=True,
        help_text='Probability component from fuzzy logic (0-1 scale)'
    )
    
    likelihood = models.FloatField(
        null=True, 
        blank=True,
        help_text='ISO 27005 likelihood of threat occurrence (0-1 scale)'
    )
    consequence = models.FloatField(
        null=True, 
        blank=True,
        help_text='ISO 27005 consequence/impact level (0-1 scale)'
    )
    compliance_factor = models.FloatField(
        null=True, 
        blank=True,
        help_text='Regulatory compliance impact multiplier'
    )
    industry_factor = models.FloatField(
        null=True, 
        blank=True,
        help_text='Industry-specific risk factor'
    )
    
    calculated_risk_level = models.FloatField(
        null=True, 
        blank=True,
        help_text='ISO 27005 calculated risk = Likelihood × Consequence × Environmental factors'
    )
    harm_value = models.FloatField(
        null=True, 
        blank=True,
        help_text='Potential harm/impact value used in risk calculation'
    )
    mathematical_risk_category = models.CharField(
        max_length=20, 
        choices=[
            ('Very Low Risk', 'Very Low Risk'),
            ('Low Risk', 'Low Risk'),
            ('Medium Risk', 'Medium Risk'),
            ('High Risk', 'High Risk'),
            ('Very High Risk', 'Very High Risk')
        ],
        null=True, 
        blank=True,
        help_text='ISO 27005 risk category based on calculated risk level'
    )
    
    traditional_fuzzy_prediction = models.CharField(
        max_length=20, 
        choices=[
            ('Public', 'Public'),
            ('Official', 'Official'),
            ('Confidential', 'Confidential'),
            ('Restricted', 'Restricted')
        ],
        null=True, 
        blank=True,
        help_text='Traditional fuzzy logic classification prediction (Government Classification)'
    )
    modern_svm_prediction = models.CharField(
        max_length=20, 
        choices=[
            ('Public', 'Public'),
            ('Official', 'Official'),
            ('Confidential', 'Confidential'),
            ('Restricted', 'Restricted')
        ],
        null=True, 
        blank=True,
        help_text='Modern SVM classification prediction (Government Classification)'
    )
    modern_dt_prediction = models.CharField(
        max_length=20, 
        choices=[
            ('Public', 'Public'),
            ('Official', 'Official'),
            ('Confidential', 'Confidential'),
            ('Restricted', 'Restricted')
        ],
        null=True, 
        blank=True,
        help_text='Modern Decision Tree classification prediction (Government Classification)'
    )
    

    
    # Model classification scores
    traditional_fuzzy_score = models.FloatField(
        null=True, 
        blank=True,
        help_text='Classification score for traditional fuzzy logic prediction (0-1 scale)'
    )
    modern_svm_score = models.FloatField(
        null=True, 
        blank=True,
        help_text='Classification score for modern SVM prediction (0-1 scale)'
    )
    modern_dt_score = models.FloatField(
        null=True, 
        blank=True,
        help_text='Classification score for modern Decision Tree prediction (0-1 scale)'
    )
    
    standards_version = models.CharField(
        max_length=100, 
        default='NIST_CSF_1.1_ISO27001_2013_ISO27005_2018',
        help_text='Version of cybersecurity standards followed'
    )
    methodology = models.CharField(
        max_length=100, 
        default='Standards_Compliant_Risk_Assessment',
        help_text='Risk assessment methodology used'
    )
    
    dt_predicted_risk_level = models.CharField(max_length=10, null=True, blank=True)
    rf_predicted_risk_level = models.CharField(max_length=10, null=True, blank=True)
    ensemble_predicted_risk_level = models.CharField(max_length=10, null=True, blank=True)
    
    risk_treatment = models.TextField(
        null=True, 
        blank=True,
        help_text='ISO 27005 risk treatment plan (Accept/Avoid/Transfer/Mitigate)'
    )
    comparison_performed_date = models.DateTimeField(null=True, blank=True)
    last_analysis_date = models.DateTimeField(null=True, blank=True)
    
    nist_function = models.CharField(
        max_length=20,
        choices=[
            ('Identify', 'Identify'),
            ('Protect', 'Protect'),
            ('Detect', 'Detect'),
            ('Respond', 'Respond'),
            ('Recover', 'Recover')
        ],
        default='Identify',
        help_text='Primary NIST CSF function for this asset'
    )

    class Meta:
        indexes = [
            models.Index(fields=['asset_category']),
            models.Index(fields=['industry_sector']),
            models.Index(fields=['compliance_framework']),
            models.Index(fields=['classification']),
            models.Index(fields=['mathematical_risk_category']),
            models.Index(fields=['standards_version']),
        ]
        
    def __str__(self):
        return f"{self.asset} - {self.classification or 'Unclassified'}"
    
    def get_nist_impact_level(self):
        """Get NIST SP 800-60 impact level based on CIA scores"""
        if not all([self.confidentiality, self.integrity, self.availability]):
            return None
        
        # NIST high water mark principle
        max_impact = max(self.confidentiality, self.integrity, self.availability)
        
        if max_impact >= 0.7:
            return 'High'
        elif max_impact >= 0.5:
            return 'Moderate'
        else:
            return 'Low'
    
    def get_iso27005_risk_level(self):
        """Get ISO 27005 risk level based on calculated risk"""
        if not self.calculated_risk_level:
            return None
            
        if self.calculated_risk_level >= 0.8:
            return 'Very High Risk'
        elif self.calculated_risk_level >= 0.6:
            return 'High Risk'
        elif self.calculated_risk_level >= 0.4:
            return 'Medium Risk'
        elif self.calculated_risk_level >= 0.2:
            return 'Low Risk'
        else:
            return 'Very Low Risk'
    
    def is_standards_compliant(self):
        """Check if asset data meets standards compliance requirements"""
        required_fields = [
            self.asset_category,
            self.industry_sector,
            self.compliance_framework,
            self.confidentiality,
            self.integrity,
            self.availability,
            self.classification
        ]
        return all(field is not None for field in required_fields)


class AssessmentCategory(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    
    # NIST CSF alignment
    nist_subcategory = models.CharField(
        max_length=20,
        help_text='NIST CSF subcategory identifier (e.g., ID.AM-1)',
        null=True,
        blank=True
    )
    
    def __str__(self):
        return self.name
    

class AssessmentQuestion(TimeStampedModel):
    category = models.ForeignKey(
        AssessmentCategory, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    question_text = models.TextField()
    
    # Standards alignment
    iso27001_control = models.CharField(
        max_length=20,
        help_text='ISO 27001 control reference (e.g., A.8.1.1)',
        null=True,
        blank=True
    )
    
    def __str__(self):
        return self.question_text
    

class ClassificationReport(TimeStampedModel):
    model_name = models.CharField(max_length=255)
    precision = models.FloatField()
    recall = models.FloatField()
    f1_score = models.FloatField()
    support = models.IntegerField()
    
    standards_baseline = models.CharField(
        max_length=100,
        help_text='Standards benchmark used for comparison',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.model_name} - Precision: {self.precision}, Recall: {self.recall}"


class ConfusionMatrix(TimeStampedModel):
    model_name = models.CharField(max_length=255)
    true_label = models.CharField(max_length=255)
    predicted_label = models.CharField(max_length=255)
    count = models.IntegerField()

    def __str__(self):
        return f"{self.model_name} - True: {self.true_label}, Predicted: {self.predicted_label}, Count: {self.count}"


class ModelComparison(TimeStampedModel):
    asset = models.ForeignKey(AssetListing, on_delete=models.CASCADE, related_name='comparisons')
    experiment_name = models.CharField(max_length=100, default='Standard Comparison')
    
    input_confidentiality = models.FloatField()
    input_integrity = models.FloatField()
    input_availability = models.FloatField()
    input_asset_classification = models.FloatField()
    
    fuzzy_prediction = models.CharField(max_length=20)
    svm_prediction = models.CharField(max_length=20)
    dt_prediction = models.CharField(max_length=20)
    

    
    expert_label = models.CharField(max_length=20, null=True, blank=True)
    
    standards_compliant = models.BooleanField(
        default=True,
        help_text='Whether this comparison follows established standards'
    )
    
    comparison_date = models.DateTimeField(auto_now_add=True)
    comparison_version = models.CharField(max_length=50, default='2.0_Standards_Compliant')
    
    def __str__(self):
        return f"Comparison for {self.asset.asset} - {self.comparison_date}"


class ModelPerformanceComparison(TimeStampedModel):
    experiment_name = models.CharField(max_length=100)
    test_date = models.DateTimeField(auto_now_add=True)
    
    total_test_cases = models.IntegerField()
    dataset_name = models.CharField(max_length=100, default='Standards_Compliant_Dataset')
    
    standards_followed = models.JSONField(
        default=list,
        help_text='List of cybersecurity standards followed'
    )
    methodology_version = models.CharField(
        max_length=50,
        default='2.0_Standards_Compliant'
    )
    
    fuzzy_accuracy = models.FloatField()
    fuzzy_precision = models.FloatField()
    fuzzy_recall = models.FloatField()
    fuzzy_f1_score = models.FloatField()
    
    svm_accuracy = models.FloatField()
    svm_precision = models.FloatField()
    svm_recall = models.FloatField()
    svm_f1_score = models.FloatField()
    
    dt_accuracy = models.FloatField()
    dt_precision = models.FloatField()
    dt_recall = models.FloatField()
    dt_f1_score = models.FloatField()
    
    statistical_significance_p_value = models.FloatField(null=True, blank=True)
    best_performing_model = models.CharField(max_length=50)
    
    # Standards validation
    standards_compliance_score = models.FloatField(
        default=1.0,
        help_text='Compliance score against cybersecurity standards (0-1)'
    )
    
    # Additional metadata
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Standards-Compliant Performance Comparison - {self.experiment_name} ({self.test_date.date()})"