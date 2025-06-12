"""
Django REST Framework Serializers for Cloud Asset Classification API

This module defines serializers for converting model instances to JSON
and handling request/response data for the RESTful API.
Updated for standards compliance (NIST CSF, ISO 27001/27005).
"""

from rest_framework import serializers
from .models import (
    AssetListing,
    Department,
    AssetValueMapping,
    AssetType,
    Asset,
    AssessmentCategory,
    AssessmentQuestion,
    ClassificationReport,
    ConfusionMatrix,
    ModelComparison,
    ModelPerformanceComparison
)


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model with ISO 27001 compliance"""
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'asset_value_mapping', 'reason', 
            'risk_appetite', 'compliance_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetValueMappingSerializer(serializers.ModelSerializer):
    """Serializer for AssetValueMapping model"""
    
    class Meta:
        model = AssetValueMapping
        fields = ['id', 'qualitative_value', 'crisp_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetTypeSerializer(serializers.ModelSerializer):
    """Serializer for AssetType model"""
    
    class Meta:
        model = AssetType
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetSerializer(serializers.ModelSerializer):
    """Serializer for Asset model"""
    
    class Meta:
        model = Asset
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssetListingSerializer(serializers.ModelSerializer):
    """Standards-compliant serializer for AssetListing model with all comparison fields"""
    
    owner_department_name = serializers.CharField(source='owner_department.name', read_only=True)
    asset_value_name = serializers.CharField(source='asset_value.qualitative_value', read_only=True)
    
    # Computed fields based on standards
    nist_impact_level = serializers.SerializerMethodField()
    iso27005_risk_level = serializers.SerializerMethodField()
    standards_compliant = serializers.SerializerMethodField()
    
    class Meta:
        model = AssetListing
        fields = [
            'id', 'asset', 'description', 'asset_type',
            'owner_department', 'owner_department_name',
            'asset_value', 'asset_value_name',
            
            # NIST CSF Asset Categorization
            'asset_category', 'industry_sector', 'compliance_framework',
            'nist_function',
            
            # Phase 1: Asset Classification (NIST SP 800-60)
            'classification', 'classification_value',
            
            # Phase 2: Risk Identification (CIA Triad - NIST SP 800-60)
            'confidentiality', 'integrity', 'availability', 'risk_index',
            
            # ISO 27005 Risk Assessment Components
            'likelihood', 'consequence', 'compliance_factor', 'industry_factor',
            
            # Phase 3: Mathematical Risk Analysis (ISO 27005)
            'calculated_risk_level', 'harm_value', 'mathematical_risk_category',
            
            # Phase 4: Model Comparison Results (Standards-compliant)
            'traditional_fuzzy_prediction', 'modern_svm_prediction', 'modern_dt_prediction',
            
            # Standards and Methodology Tracking
            'standards_version', 'methodology',
            
            # Legacy ML predictions (backward compatibility)
            'dt_predicted_risk_level', 'rf_predicted_risk_level', 'ensemble_predicted_risk_level',
            
            # Risk treatment and metadata
            'risk_treatment', 'comparison_performed_date', 'last_analysis_date',
            'created_at', 'updated_at',
            
            # Computed fields
            'nist_impact_level', 'iso27005_risk_level', 'standards_compliant'
        ]
        read_only_fields = [
            'id', 'classification', 'classification_value', 'risk_index',
            'likelihood', 'consequence', 'compliance_factor', 'industry_factor',
            'calculated_risk_level', 'harm_value', 'mathematical_risk_category',
            'traditional_fuzzy_prediction', 'modern_svm_prediction', 'modern_dt_prediction',
            'dt_predicted_risk_level', 'rf_predicted_risk_level', 'ensemble_predicted_risk_level',
            'standards_version', 'methodology',
            'comparison_performed_date', 'last_analysis_date', 'created_at', 'updated_at',
            'nist_impact_level', 'iso27005_risk_level', 'standards_compliant'
        ]
    
    def get_nist_impact_level(self, obj):
        """Get NIST SP 800-60 impact level"""
        return obj.get_nist_impact_level()
    
    def get_iso27005_risk_level(self, obj):
        """Get ISO 27005 risk level"""
        return obj.get_iso27005_risk_level()
    
    def get_standards_compliant(self, obj):
        """Check if asset meets standards compliance"""
        return obj.is_standards_compliant()


class AssetListingCreateSerializer(serializers.ModelSerializer):
    """Standards-compliant serializer for creating new AssetListing instances"""
    
    class Meta:
        model = AssetListing
        fields = [
            'asset', 'description', 'asset_type', 'owner_department', 'asset_value',
            'asset_category', 'industry_sector', 'compliance_framework', 'nist_function',
            'confidentiality', 'integrity', 'availability', 'risk_treatment'
        ]
    
    def validate(self, data):
        """Validate standards compliance requirements"""
        # Ensure asset_category is provided for standards compliance
        if not data.get('asset_category'):
            raise serializers.ValidationError({
                'asset_category': 'NIST CSF asset category is required for standards compliance.'
            })
        
        # Ensure industry_sector is provided
        if not data.get('industry_sector'):
            raise serializers.ValidationError({
                'industry_sector': 'Industry sector is required for regulatory context.'
            })
        
        return data


class AssetListingStandardsSerializer(serializers.ModelSerializer):
    """Specialized serializer focused on standards compliance fields"""
    
    owner_department_name = serializers.CharField(source='owner_department.name', read_only=True)
    asset_value_name = serializers.CharField(source='asset_value.qualitative_value', read_only=True)
    
    class Meta:
        model = AssetListing
        fields = [
            'id', 'asset', 'asset_category', 'industry_sector', 'compliance_framework',
            'owner_department_name', 'asset_value_name', 'nist_function',
            'classification', 'likelihood', 'consequence', 'calculated_risk_level',
            'mathematical_risk_category', 'standards_version', 'methodology'
        ]
        read_only_fields = ['id', 'standards_version', 'methodology']


class AssessmentCategorySerializer(serializers.ModelSerializer):
    """Serializer for AssessmentCategory model with NIST CSF alignment"""
    
    class Meta:
        model = AssessmentCategory
        fields = ['id', 'name', 'nist_subcategory', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    """Serializer for AssessmentQuestion model with ISO 27001 control mapping"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = AssessmentQuestion
        fields = [
            'id', 'category', 'category_name', 'question_text', 
            'iso27001_control', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassificationReportSerializer(serializers.ModelSerializer):
    """Serializer for ClassificationReport model with standards baseline tracking"""
    
    class Meta:
        model = ClassificationReport
        fields = [
            'id', 'model_name', 'precision', 'recall', 'f1_score', 'support', 
            'standards_baseline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConfusionMatrixSerializer(serializers.ModelSerializer):
    """Serializer for ConfusionMatrix model"""
    
    class Meta:
        model = ConfusionMatrix
        fields = ['id', 'model_name', 'true_label', 'predicted_label', 'count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ModelComparisonSerializer(serializers.ModelSerializer):
    """Standards-compliant serializer for ModelComparison model"""
    
    asset_name = serializers.CharField(source='asset.asset', read_only=True)
    
    class Meta:
        model = ModelComparison
        fields = [
            'id', 'asset', 'asset_name', 'experiment_name',
            'input_confidentiality', 'input_integrity', 'input_availability', 'input_asset_classification',
            'fuzzy_prediction', 'svm_prediction', 'dt_prediction',
            'fuzzy_confidence', 'svm_confidence', 'dt_confidence',
            'expert_label', 'standards_compliant', 'comparison_date', 'comparison_version',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'comparison_date', 'created_at', 'updated_at']


class ModelPerformanceComparisonSerializer(serializers.ModelSerializer):
    """Standards-compliant serializer for ModelPerformanceComparison model"""
    
    class Meta:
        model = ModelPerformanceComparison
        fields = [
            'id', 'experiment_name', 'test_date', 'total_test_cases', 'dataset_name',
            'standards_followed', 'methodology_version', 'standards_compliance_score',
            'fuzzy_accuracy', 'fuzzy_precision', 'fuzzy_recall', 'fuzzy_f1_score',
            'svm_accuracy', 'svm_precision', 'svm_recall', 'svm_f1_score',
            'dt_accuracy', 'dt_precision', 'dt_recall', 'dt_f1_score',
            'statistical_significance_p_value', 'best_performing_model', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'test_date', 'created_at', 'updated_at']


# Specialized serializers for API operations

class AssetClassificationRequestSerializer(serializers.Serializer):
    """Standards-compliant serializer for asset classification requests"""
    
    asset_id = serializers.UUIDField()
    use_nist_methodology = serializers.BooleanField(default=True)
    
    def validate_asset_id(self, value):
        """Validate that the asset exists"""
        if not AssetListing.objects.filter(id=value).exists():
            raise serializers.ValidationError("Asset with this ID does not exist.")
        return value


class RiskIdentificationRequestSerializer(serializers.Serializer):
    """ISO 27005 compliant serializer for risk identification requests"""
    
    asset_id = serializers.UUIDField()
    confidentiality = serializers.FloatField(min_value=0.0, max_value=1.0)
    integrity = serializers.FloatField(min_value=0.0, max_value=1.0)
    availability = serializers.FloatField(min_value=0.0, max_value=1.0)
    use_iso27005_methodology = serializers.BooleanField(default=True)
    
    def validate_asset_id(self, value):
        """Validate that the asset exists"""
        if not AssetListing.objects.filter(id=value).exists():
            raise serializers.ValidationError("Asset with this ID does not exist.")
        return value


class RiskAnalysisRequestSerializer(serializers.Serializer):
    """ISO 27005 compliant serializer for risk analysis requests"""
    
    asset_id = serializers.UUIDField()
    use_iso27005_methodology = serializers.BooleanField(default=True)
    
    def validate_asset_id(self, value):
        """Validate that the asset exists and has risk_index"""
        try:
            asset = AssetListing.objects.get(id=value)
            if asset.risk_index is None:
                raise serializers.ValidationError("Asset must have risk identification completed first.")
        except AssetListing.DoesNotExist:
            raise serializers.ValidationError("Asset with this ID does not exist.")
        return value


class ModelComparisonRequestSerializer(serializers.Serializer):
    """Standards-compliant serializer for model comparison requests"""
    
    asset_id = serializers.UUIDField()
    experiment_name = serializers.CharField(max_length=100, default='Standards_Compliant_Comparison')
    use_standards_baseline = serializers.BooleanField(default=True)
    
    def validate_asset_id(self, value):
        """Validate that the asset exists and has required data"""
        try:
            asset = AssetListing.objects.get(id=value)
            required_fields = ['confidentiality', 'integrity', 'availability', 'classification_value']
            missing_fields = [field for field in required_fields if getattr(asset, field) is None]
            
            if missing_fields:
                raise serializers.ValidationError(
                    f"Asset must have the following fields completed: {', '.join(missing_fields)}"
                )
        except AssetListing.DoesNotExist:
            raise serializers.ValidationError("Asset with this ID does not exist.")
        return value


class BatchComparisonRequestSerializer(serializers.Serializer):
    """Standards-compliant serializer for batch model comparison requests"""
    
    asset_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=100  # Limit batch size
    )
    experiment_name = serializers.CharField(max_length=100, default='Standards_Compliant_Batch_Comparison')
    use_standards_baseline = serializers.BooleanField(default=True)
    
    def validate_asset_ids(self, value):
        """Validate that all assets exist and have required data"""
        missing_assets = []
        incomplete_assets = []
        
        for asset_id in value:
            try:
                asset = AssetListing.objects.get(id=asset_id)
                required_fields = ['confidentiality', 'integrity', 'availability', 'classification_value']
                missing_fields = [field for field in required_fields if getattr(asset, field) is None]
                
                if missing_fields:
                    incomplete_assets.append(str(asset_id))
            except AssetListing.DoesNotExist:
                missing_assets.append(str(asset_id))
        
        if missing_assets:
            raise serializers.ValidationError(f"Assets not found: {', '.join(missing_assets)}")
        
        if incomplete_assets:
            raise serializers.ValidationError(
                f"Assets with incomplete data: {', '.join(incomplete_assets)}"
            )
        
        return value


# Response serializers

class AssetClassificationResponseSerializer(serializers.Serializer):
    """Standards-compliant serializer for asset classification responses"""
    
    asset_id = serializers.UUIDField()
    classification = serializers.CharField()
    classification_value = serializers.FloatField()
    nist_impact_level = serializers.CharField()
    methodology = serializers.CharField()
    standards_version = serializers.CharField()
    timestamp = serializers.DateTimeField()


class RiskIdentificationResponseSerializer(serializers.Serializer):
    """ISO 27005 compliant serializer for risk identification responses"""
    
    asset_id = serializers.UUIDField()
    risk_index = serializers.FloatField()
    likelihood = serializers.FloatField()
    probability_of_harm = serializers.FloatField()
    methodology = serializers.CharField()
    iso27005_compliant = serializers.BooleanField()
    timestamp = serializers.DateTimeField()


class RiskAnalysisResponseSerializer(serializers.Serializer):
    """ISO 27005 compliant serializer for risk analysis responses"""
    
    asset_id = serializers.UUIDField()
    likelihood = serializers.FloatField()
    consequence = serializers.FloatField()
    compliance_factor = serializers.FloatField()
    industry_factor = serializers.FloatField()
    calculated_risk_level = serializers.FloatField()
    risk_category = serializers.CharField()
    methodology = serializers.CharField()
    iso27005_compliant = serializers.BooleanField()
    timestamp = serializers.DateTimeField()


class ModelComparisonResponseSerializer(serializers.Serializer):
    """Standards-compliant serializer for model comparison responses"""
    
    asset_id = serializers.UUIDField()
    input_features = serializers.DictField()
    predictions = serializers.DictField()
    confidence_scores = serializers.DictField()
    approach_details = serializers.DictField()
    consensus = serializers.DictField()
    standards_compliant = serializers.BooleanField()
    methodology_version = serializers.CharField()
    timestamp = serializers.DateTimeField()


class PerformanceMetricsSerializer(serializers.Serializer):
    """Standards-compliant serializer for performance metrics responses"""
    
    approach = serializers.CharField()
    accuracy = serializers.FloatField()
    precision = serializers.FloatField()
    recall = serializers.FloatField()
    f1_score = serializers.FloatField()
    training_time = serializers.FloatField(required=False)
    prediction_time = serializers.FloatField(required=False)
    standards_baseline = serializers.CharField(required=False)


class BatchComparisonResponseSerializer(serializers.Serializer):
    """Standards-compliant serializer for batch comparison responses"""
    
    batch_size = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
    performance_metrics = serializers.DictField()
    individual_results = serializers.ListField()
    summary = serializers.DictField()
    standards_compliance_score = serializers.FloatField()
    methodology_version = serializers.CharField()


class StandardsComplianceReportSerializer(serializers.Serializer):
    """Serializer for standards compliance validation reports"""
    
    asset_id = serializers.UUIDField()
    nist_csf_compliant = serializers.BooleanField()
    iso27001_compliant = serializers.BooleanField()
    iso27005_compliant = serializers.BooleanField()
    nist_sp800_compliant = serializers.BooleanField()
    overall_compliance_score = serializers.FloatField()
    missing_requirements = serializers.ListField(child=serializers.CharField())
    recommendations = serializers.ListField(child=serializers.CharField())
    standards_version = serializers.CharField()
    assessment_date = serializers.DateTimeField()