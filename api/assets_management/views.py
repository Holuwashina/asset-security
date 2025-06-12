"""
Django REST Framework Views for Cloud Asset Classification API

This module defines RESTful API endpoints for the cloud asset classification system,
replacing the GraphQL implementation with standard REST endpoints.
"""

from datetime import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import transaction

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

from .serializers import (
    AssetListingSerializer,
    AssetListingCreateSerializer,
    DepartmentSerializer,
    AssetValueMappingSerializer,
    AssetTypeSerializer,
    AssetSerializer,
    AssessmentCategorySerializer,
    AssessmentQuestionSerializer,
    ClassificationReportSerializer,
    ConfusionMatrixSerializer,
    ModelComparisonSerializer,
    ModelPerformanceComparisonSerializer,
    
    # Request/Response serializers
    AssetClassificationRequestSerializer,
    RiskIdentificationRequestSerializer,
    RiskAnalysisRequestSerializer,
    ModelComparisonRequestSerializer,
    BatchComparisonRequestSerializer,
    AssetClassificationResponseSerializer,
    RiskIdentificationResponseSerializer,
    RiskAnalysisResponseSerializer,
    ModelComparisonResponseSerializer,
    BatchComparisonResponseSerializer,
    PerformanceMetricsSerializer
)

# Import our utility functions
from .utils.classification import classify_asset
from .utils.compute_risk_level import compute_risk_level
from .utils.risk_analysis import calculate_risk_level
from .utils.model_comparison import ModelComparisonFramework


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['asset_value_mapping']


class AssetValueMappingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing asset value mappings
    """
    queryset = AssetValueMapping.objects.all()
    serializer_class = AssetValueMappingSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['qualitative_value']


class AssetTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing asset types
    """
    queryset = AssetType.objects.all()
    serializer_class = AssetTypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class AssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assets
    """
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class AssetListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing asset listings with classification and risk analysis
    """
    queryset = AssetListing.objects.all().select_related('owner_department', 'asset_value')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'asset_type', 'owner_department', 'asset_value',
        'classification', 'mathematical_risk_category',
        'traditional_fuzzy_prediction', 'modern_svm_prediction', 'modern_dt_prediction'
    ]
    search_fields = ['asset', 'description']
    ordering_fields = ['created_at', 'updated_at', 'classification_value', 'risk_index']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return AssetListingCreateSerializer
        return AssetListingSerializer

    @action(detail=True, methods=['post'])
    def classify_asset(self, request, pk=None):
        """
        Phase 1: Classify an asset using fuzzy logic
        POST /api/assets/{id}/classify_asset/
        """
        try:
            asset = self.get_object()
            
            # Get asset value and department impact (ensure 0-1 scale)
            asset_value = asset.asset_value.crisp_value
            # Convert department impact to 0-1 scale if it's in 0-10 scale
            department_impact = asset.owner_department.asset_value_mapping.crisp_value
            if department_impact > 1:
                department_impact = department_impact / 10
            
            # Perform fuzzy classification (function returns 0-1 scale)
            classification_value = classify_asset(asset_value, department_impact)
            
            # Determine classification category based on 0-1 scale
            if classification_value <= 0.25:
                classification = "Low"
            elif classification_value <= 0.5:
                classification = "Medium"
            elif classification_value <= 0.75:
                classification = "High"
            else:
                classification = "Very High"
            
            # Update asset
            asset.classification_value = classification_value
            asset.classification = classification
            asset.last_analysis_date = datetime.now()
            asset.save()
            
            response_data = {
                'asset_id': asset.id,
                'classification': classification,
                'classification_value': classification_value,
                'methodology': 'Fuzzy Logic',
                'timestamp': asset.last_analysis_date
            }
            
            return Response(
                AssetClassificationResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Classification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def identify_risk(self, request, pk=None):
        """
        Phase 2: Identify risk using CIA triad assessment
        POST /api/assets/{id}/identify_risk/
        Body: {"confidentiality": 0.8, "integrity": 0.7, "availability": 0.9}
        """
        try:
            asset = self.get_object()
            serializer = RiskIdentificationRequestSerializer(data={
                'asset_id': asset.id,
                **request.data
            })
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure asset has classification
            if asset.classification_value is None:
                return Response(
                    {'error': 'Asset must be classified first (Phase 1)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Extract CIA values
            confidentiality = serializer.validated_data['confidentiality']
            integrity = serializer.validated_data['integrity']
            availability = serializer.validated_data['availability']
            
            # Compute risk index using fuzzy logic (all values are 0-1 scale)
            risk_index = compute_risk_level(
                confidentiality, integrity, availability, asset.classification_value
            )
            
            # Update asset
            asset.confidentiality = confidentiality
            asset.integrity = integrity
            asset.availability = availability
            asset.risk_index = risk_index
            asset.last_analysis_date = datetime.now()
            asset.save()
            
            response_data = {
                'asset_id': asset.id,
                'risk_index': risk_index,
                'probability_of_harm': risk_index,
                'methodology': 'Fuzzy Logic CIA Assessment',
                'timestamp': asset.last_analysis_date
            }
            
            return Response(
                RiskIdentificationResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Risk identification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def analyze_risk(self, request, pk=None):
        """
        Phase 3: Analyze risk using mathematical formula
        POST /api/assets/{id}/analyze_risk/
        """
        try:
            asset = self.get_object()
            
            # Ensure asset has risk index
            if asset.risk_index is None:
                return Response(
                    {'error': 'Asset must have risk identification completed first (Phase 2)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate risk using mathematical formula (0-1 scale)
            risk_analysis = calculate_risk_level(asset.risk_index)
            
            # Update asset
            asset.calculated_risk_level = risk_analysis['calculated_risk_level']
            asset.harm_value = risk_analysis['harm_value']
            asset.mathematical_risk_category = risk_analysis['risk_category']
            asset.last_analysis_date = datetime.now()
            asset.save()
            
            response_data = {
                'asset_id': asset.id,
                'probability': risk_analysis['probability'],
                'harm_value': risk_analysis['harm_value'],
                'calculated_risk_level': risk_analysis['calculated_risk_level'],
                'risk_category': risk_analysis['risk_category'],
                'methodology': risk_analysis['methodology'],
                'timestamp': asset.last_analysis_date
            }
            
            return Response(
                RiskAnalysisResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Risk analysis failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def compare_models(self, request, pk=None):
        """
        Phase 4: Compare all three approaches (Fuzzy Logic, SVM, Decision Tree)
        POST /api/assets/{id}/compare_models/
        Body: {"experiment_name": "Standard Comparison"}
        """
        try:
            asset = self.get_object()
            serializer = ModelComparisonRequestSerializer(data={
                'asset_id': asset.id,
                **request.data
            })
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize comparison framework
            comparison_framework = ModelComparisonFramework()
            
            # Perform comparison
            comparison_result = comparison_framework.compare_all_approaches(
                asset.confidentiality,
                asset.integrity,
                asset.availability,
                asset.classification_value
            )
            
            # Update asset with predictions
            predictions = comparison_result['predictions']
            asset.traditional_fuzzy_prediction = predictions.get('traditional_fuzzy')
            asset.modern_svm_prediction = predictions.get('modern_svm')
            asset.modern_dt_prediction = predictions.get('modern_dt')
            asset.comparison_performed_date = datetime.now()
            asset.save()
            
            # Save detailed comparison record
            ModelComparison.objects.create(
                asset=asset,
                experiment_name=serializer.validated_data.get('experiment_name', 'Standard Comparison'),
                input_confidentiality=asset.confidentiality,
                input_integrity=asset.integrity,
                input_availability=asset.availability,
                input_asset_classification=asset.classification_value,
                fuzzy_prediction=predictions.get('traditional_fuzzy', 'Error'),
                svm_prediction=predictions.get('modern_svm', 'Error'),
                dt_prediction=predictions.get('modern_dt', 'Error'),
                fuzzy_confidence=comparison_result.get('confidence_scores', {}).get('traditional_fuzzy'),
                svm_confidence=comparison_result.get('confidence_scores', {}).get('modern_svm'),
                dt_confidence=comparison_result.get('confidence_scores', {}).get('modern_dt'),
            )
            
            response_data = {
                'asset_id': asset.id,
                'input_features': comparison_result['input_features'],
                'predictions': comparison_result['predictions'],
                'confidence_scores': comparison_result.get('confidence_scores', {}),
                'approach_details': comparison_result.get('approach_details', {}),
                'consensus': comparison_result.get('consensus', {}),
                'timestamp': asset.comparison_performed_date
            }
            
            return Response(
                ModelComparisonResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Model comparison failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def batch_compare(self, request):
        """
        Batch comparison of multiple assets
        POST /api/assets/batch_compare/
        Body: {"asset_ids": [...], "experiment_name": "Batch Test"}
        """
        try:
            serializer = BatchComparisonRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            asset_ids = serializer.validated_data['asset_ids']
            experiment_name = serializer.validated_data.get('experiment_name', 'Batch Comparison')
            
            # Get assets
            assets = AssetListing.objects.filter(id__in=asset_ids)
            
            # Prepare test data
            test_data = []
            for asset in assets:
                test_data.append((
                    asset.confidentiality,
                    asset.integrity,
                    asset.availability,
                    asset.classification_value
                ))
            
            # Initialize comparison framework
            comparison_framework = ModelComparisonFramework()
            
            # Perform batch comparison
            batch_results = comparison_framework.batch_comparison(test_data)
            
            # Update assets with results
            for i, asset in enumerate(assets):
                individual_result = batch_results['individual_results'][i]
                if 'predictions' in individual_result:
                    predictions = individual_result['predictions']
                    asset.traditional_fuzzy_prediction = predictions.get('traditional_fuzzy')
                    asset.modern_svm_prediction = predictions.get('modern_svm')
                    asset.modern_dt_prediction = predictions.get('modern_dt')
                    asset.comparison_performed_date = datetime.now()
                    asset.save()
                    
                    # Save detailed comparison record
                    ModelComparison.objects.create(
                        asset=asset,
                        experiment_name=experiment_name,
                        input_confidentiality=asset.confidentiality,
                        input_integrity=asset.integrity,
                        input_availability=asset.availability,
                        input_asset_classification=asset.classification_value,
                        fuzzy_prediction=predictions.get('traditional_fuzzy', 'Error'),
                        svm_prediction=predictions.get('modern_svm', 'Error'),
                        dt_prediction=predictions.get('modern_dt', 'Error'),
                    )
            
            # Prepare response
            response_data = {
                'batch_size': len(asset_ids),
                'timestamp': datetime.now(),
                'performance_metrics': batch_results.get('performance_metrics', {}),
                'individual_results': batch_results['individual_results'],
                'summary': {
                    'completed': len([r for r in batch_results['individual_results'] if 'predictions' in r]),
                    'errors': len([r for r in batch_results['individual_results'] if 'error' in r])
                }
            }
            
            return Response(
                BatchComparisonResponseSerializer(response_data).data,
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'error': f'Batch comparison failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def performance_metrics(self, request):
        """
        Get overall performance metrics for all approaches
        GET /api/assets/performance_metrics/
        """
        try:
            # Get latest performance comparison
            latest_performance = ModelPerformanceComparison.objects.order_by('-test_date').first()
            
            if not latest_performance:
                return Response(
                    {'error': 'No performance data available. Run batch comparison first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            performance_data = [
                {
                    'approach': 'Traditional Fuzzy Logic',
                    'accuracy': latest_performance.fuzzy_accuracy,
                    'precision': latest_performance.fuzzy_precision,
                    'recall': latest_performance.fuzzy_recall,
                    'f1_score': latest_performance.fuzzy_f1_score,
                },
                {
                    'approach': 'Modern SVM',
                    'accuracy': latest_performance.svm_accuracy,
                    'precision': latest_performance.svm_precision,
                    'recall': latest_performance.svm_recall,
                    'f1_score': latest_performance.svm_f1_score,
                },
                {
                    'approach': 'Modern Decision Tree',
                    'accuracy': latest_performance.dt_accuracy,
                    'precision': latest_performance.dt_precision,
                    'recall': latest_performance.dt_recall,
                    'f1_score': latest_performance.dt_f1_score,
                }
            ]
            
            return Response({
                'experiment_name': latest_performance.experiment_name,
                'test_date': latest_performance.test_date,
                'total_test_cases': latest_performance.total_test_cases,
                'best_performing_model': latest_performance.best_performing_model,
                'statistical_significance_p_value': latest_performance.statistical_significance_p_value,
                'performance_metrics': PerformanceMetricsSerializer(performance_data, many=True).data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to retrieve performance metrics: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class AssessmentCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assessment categories
    """
    queryset = AssessmentCategory.objects.all()
    serializer_class = AssessmentCategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class AssessmentQuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing assessment questions
    """
    queryset = AssessmentQuestion.objects.all().select_related('category')
    serializer_class = AssessmentQuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['question_text']


class ClassificationReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing classification reports
    """
    queryset = ClassificationReport.objects.all()
    serializer_class = ClassificationReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['model_name']
    ordering = ['-created_at']


class ConfusionMatrixViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing confusion matrices
    """
    queryset = ConfusionMatrix.objects.all()
    serializer_class = ConfusionMatrixSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['model_name', 'true_label', 'predicted_label']
    ordering = ['-created_at']


class ModelComparisonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing model comparisons
    """
    queryset = ModelComparison.objects.all().select_related('asset')
    serializer_class = ModelComparisonSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['experiment_name', 'asset', 'fuzzy_prediction', 'svm_prediction', 'dt_prediction']
    ordering = ['-comparison_date']


class ModelPerformanceComparisonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing model performance comparisons
    """
    queryset = ModelPerformanceComparison.objects.all()
    serializer_class = ModelPerformanceComparisonSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['experiment_name', 'best_performing_model']
    ordering = ['-test_date']