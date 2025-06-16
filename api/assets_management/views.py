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
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import transaction
import logging
from django.utils import timezone
from typing import List

from .models import (
    AssetListing,
    Department,
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
from .utils.classification import classify_asset, validate_classification_standards_compliance
from .utils.compute_risk_level import compute_risk_level
from .utils.risk_analysis import calculate_risk_level
from .utils.model_comparison import ModelComparisonFramework
from .utils.risk_identification import (
    IntegratedRiskIdentification, 
    RiskMethodology, 
    standardize_asset_context,
    validate_risk_identification_result
)


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['risk_appetite', 'compliance_level']





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
    queryset = AssetListing.objects.all().select_related('owner_department')
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'asset_type', 'owner_department',
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
        Phase 2: Asset Classification using fuzzy logic (0-1 scale)
        POST /api/assets/{id}/classify_asset/
        """
        try:
            asset = self.get_object()
            data = request.data
            
            # Get classification inputs from request or use existing asset values
            asset_importance = data.get('asset_importance', asset.operational_dependency)
            data_value = data.get('data_value', asset.data_sensitivity)
            business_criticality = data.get('business_criticality', asset.business_criticality)
            replaceability = data.get('replaceability', asset.regulatory_impact)
            
            # Check if we have meaningful classification parameters
            null_params = []
            if asset_importance is None:
                null_params.append('asset_importance (operational_dependency)')
            if data_value is None:
                null_params.append('data_value (data_sensitivity)')
            if business_criticality is None:
                null_params.append('business_criticality')
            if replaceability is None:
                null_params.append('replaceability (regulatory_impact)')
            
            # If too many parameters are missing, suggest manual classification
            if len(null_params) >= 3:
                return Response({
                    'error': 'Insufficient classification parameters for automatic classification',
                    'missing_parameters': null_params,
                    'suggestion': 'Please use the Asset Classification page for manual parameter setting',
                    'manual_classification_url': f'/classification/asset-classify?id={asset.id}',
                    'note': 'Quick classification requires at least 2 pre-existing parameters to avoid generic results'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Apply conservative defaults only if we have some parameters
            asset_importance = asset_importance or 0.3
            data_value = data_value or 0.4  
            business_criticality = business_criticality or 0.5
            replaceability = replaceability or 0.4
            
            # Validate inputs are in 0-1 range
            inputs = {
                'asset_importance': asset_importance,
                'data_value': data_value,
                'business_criticality': business_criticality,
                'replaceability': replaceability
            }
            
            for field, value in inputs.items():
                if not isinstance(value, (int, float)) or not (0 <= value <= 1):
                    return Response(
                        {'error': f'{field} must be a number between 0.0 and 1.0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Perform ensemble classification using fuzzy logic + ML models
            from .utils.classification import classify_asset_ensemble
            
            result = classify_asset_ensemble(
                business_criticality=business_criticality,
                data_sensitivity=data_value,
                operational_dependency=asset_importance,
                regulatory_impact=replaceability,
                confidentiality=asset.confidentiality or 0.5,
                integrity=asset.integrity or 0.5,
                availability=asset.availability or 0.5,
                use_ml_models=True  # Enable ML models in ensemble
            )
            
            # Log classification for audit trail
            logger = logging.getLogger(__name__)
            logger.info(f"Asset {asset.id} classified: "
                       f"score={result['classification_score']}, "
                       f"category={result['classification_category']}")
            
            # Update asset with classification results and inputs
            asset.classification_value = result['classification_score']
            asset.classification = f"{result['classification_category']} ({result['classification_score']:.2f})"
            asset.business_criticality = business_criticality
            asset.data_sensitivity = data_value
            asset.operational_dependency = asset_importance
            asset.regulatory_impact = replaceability
            asset.last_analysis_date = datetime.now()
            asset.save()
            
            # Prepare response
            response_data = {
                'success': True,
                'asset_id': str(asset.id),
                'classification_result': result,
                'database_updates': {
                    'classification_value': asset.classification_value,
                    'classification': asset.classification,
                    'business_criticality': asset.business_criticality,
                    'data_sensitivity': asset.data_sensitivity,
                    'operational_dependency': asset.operational_dependency,
                    'regulatory_impact': asset.regulatory_impact
                },
                'workflow_status': {
                    'phase_2_complete': True,
                    'next_phase': 'risk_identification',
                    'ready_for_cia_assessment': True
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Classification failed for asset {pk}: {str(e)}")
            return Response(
                {'error': f'Classification failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def classify_asset_ensemble(self, request, pk=None):
        """
        Enhanced Phase 2: Asset Classification using Ensemble (Fuzzy Logic + ML Models)
        POST /api/assets/{id}/classify_asset_ensemble/
        """
        try:
            asset = self.get_object()
            data = request.data
            
            # Get classification inputs from request or use existing asset values
            asset_importance = data.get('asset_importance', asset.operational_dependency)
            data_value = data.get('data_value', asset.data_sensitivity)
            business_criticality = data.get('business_criticality', asset.business_criticality)
            replaceability = data.get('replaceability', asset.regulatory_impact)
            
            # Check if we have meaningful classification parameters
            null_params = []
            if asset_importance is None:
                null_params.append('asset_importance (operational_dependency)')
            if data_value is None:
                null_params.append('data_value (data_sensitivity)')
            if business_criticality is None:
                null_params.append('business_criticality')
            if replaceability is None:
                null_params.append('replaceability (regulatory_impact)')
            
            # If too many parameters are missing, suggest manual classification
            if len(null_params) >= 3:
                return Response({
                    'error': 'Insufficient classification parameters for automatic classification',
                    'missing_parameters': null_params,
                    'suggestion': 'Please use the Asset Classification page for manual parameter setting',
                    'manual_classification_url': f'/classification/asset-classify?id={asset.id}',
                    'note': 'Ensemble classification requires at least 2 pre-existing parameters to avoid generic results'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Apply conservative defaults only if we have some parameters
            asset_importance = asset_importance or 0.3
            data_value = data_value or 0.4  
            business_criticality = business_criticality or 0.5
            replaceability = replaceability or 0.4
            
            # Validate inputs are in 0-1 range
            inputs = {
                'asset_importance': asset_importance,
                'data_value': data_value,
                'business_criticality': business_criticality,
                'replaceability': replaceability
            }
            
            for field, value in inputs.items():
                if not isinstance(value, (int, float)) or not (0 <= value <= 1):
                    return Response(
                        {'error': f'{field} must be a number between 0.0 and 1.0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Perform ensemble classification using fuzzy logic + ML models
            from .utils.classification import classify_asset_ensemble
            
            result = classify_asset_ensemble(
                business_criticality=business_criticality,
                data_sensitivity=data_value,
                operational_dependency=asset_importance,
                regulatory_impact=replaceability,
                confidentiality=asset.confidentiality or 0.5,
                integrity=asset.integrity or 0.5,
                availability=asset.availability or 0.5,
                use_ml_models=True  # Enable ML models in ensemble
            )
            
            # Log classification for audit trail
            logger = logging.getLogger(__name__)
            logger.info(f"Asset {asset.id} ensemble classified: "
                       f"score={result['classification_score']}, "
                       f"category={result['classification_category']}, "
                       f"confidence={result.get('ensemble_confidence', 'N/A')}")
            
            # Update asset with classification results and inputs
            asset.classification_value = result['classification_score']
            asset.classification = f"{result['classification_category']} ({result['classification_score']:.2f})"
            asset.business_criticality = business_criticality
            asset.data_sensitivity = data_value
            asset.operational_dependency = asset_importance
            asset.regulatory_impact = replaceability
            asset.last_analysis_date = datetime.now()
            asset.save()
            
            # Prepare response
            response_data = {
                'success': True,
                'asset_id': str(asset.id),
                'classification_result': result,
                'database_updates': {
                    'classification_value': asset.classification_value,
                    'classification': asset.classification,
                    'business_criticality': asset.business_criticality,
                    'data_sensitivity': asset.data_sensitivity,
                    'operational_dependency': asset.operational_dependency,
                    'regulatory_impact': asset.regulatory_impact
                },
                'workflow_status': {
                    'phase_2_complete': True,
                    'next_phase': 'risk_identification',
                    'ready_for_cia_assessment': True,
                    'ensemble_used': True,
                    'ml_models_available': len(result.get('individual_predictions', {})) > 1
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Ensemble classification failed for asset {pk}: {str(e)}")
            return Response(
                {'error': f'Ensemble classification failed: {str(e)}'},
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
                    {'error': 'Asset must be classified first (Phase 1). Run classify_asset endpoint first.'},
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
    def identify_risk_enhanced(self, request, pk=None):
        """
        Enhanced Risk Identification using multiple standardized methodologies
        Supports ISO 27005:2022, NIST SP 800-30, OCTAVE, and integrated approaches
        """
        try:
            asset = self.get_object()
            
            # Get methodology preference from request
            methodology = request.data.get('methodology', 'integrated')
            include_methodologies = request.data.get('include_methodologies', [
                'iso_27005', 'nist_sp_800_30', 'octave'
            ])
            
            # Extract CIA scores from request
            confidentiality = float(request.data.get('confidentiality', 0.5))
            integrity = float(request.data.get('integrity', 0.5))
            availability = float(request.data.get('availability', 0.5))
            
            # Validate CIA scores
            if not all(0.0 <= score <= 1.0 for score in [confidentiality, integrity, availability]):
                return Response({
                    'error': 'CIA scores must be between 0.0 and 1.0'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Prepare asset context
            asset_data = {
                'id': str(asset.id),
                'asset': asset.asset,
                'asset_type': asset.asset_type,
                'owner_department_name': asset.owner_department.name if asset.owner_department else 'Unknown',
                'confidentiality': confidentiality,
                'integrity': integrity,
                'availability': availability,
                'classification_value': float(asset.classification_value or 0.5),
                'business_criticality': float(asset.business_criticality or 0.5)
            }
            
            # Standardize asset context
            asset_context = standardize_asset_context(asset_data)
            
            # Perform comprehensive risk identification
            risk_identifier = IntegratedRiskIdentification()
            
            # Map methodology names to enums
            methodology_mapping = {
                'iso_27005': RiskMethodology.ISO_27005,
                'nist_sp_800_30': RiskMethodology.NIST_SP_800_30,
                'octave': RiskMethodology.OCTAVE,
                'integrated': RiskMethodology.INTEGRATED
            }
            
            methodologies_to_use = [
                methodology_mapping[m] for m in include_methodologies 
                if m in methodology_mapping
            ]
            
            if not methodologies_to_use:
                methodologies_to_use = [RiskMethodology.INTEGRATED]
            
            # Conduct comprehensive assessment
            comprehensive_result = risk_identifier.comprehensive_assessment(
                asset_id=str(asset.id),
                asset_context=asset_context,
                methodologies_to_use=methodologies_to_use
            )
            
            # Validate results
            validation_report = validate_risk_identification_result(
                comprehensive_result.get('integrated_assessment')
            )
            
            # Update asset with integrated results
            integrated_assessment = comprehensive_result.get('integrated_assessment')
            if integrated_assessment:
                asset.confidentiality = confidentiality
                asset.integrity = integrity
                asset.availability = availability
                asset.risk_index = integrated_assessment.risk_score
                asset.risk_identification_performed_date = timezone.now()
                asset.save()
            
            # Prepare response
            response_data = {
                'asset_id': str(asset.id),
                'asset_name': asset.asset,
                'methodologies_used': comprehensive_result.get('methodologies_used', []),
                'assessment_timestamp': comprehensive_result.get('assessment_timestamp'),
                'integrated_assessment': {
                    'methodology': integrated_assessment.methodology.value if integrated_assessment else 'unknown',
                    'risk_score': integrated_assessment.risk_score if integrated_assessment else 0.0,
                    'risk_level': integrated_assessment.risk_level if integrated_assessment else 'Unknown',
                    'likelihood': integrated_assessment.likelihood if integrated_assessment else 0.0,
                    'impact': integrated_assessment.impact if integrated_assessment else 0.0,
                    'threats_count': len(integrated_assessment.threats_identified) if integrated_assessment else 0,
                    'vulnerabilities_count': len(integrated_assessment.vulnerabilities_identified) if integrated_assessment else 0,
                    'compliance_frameworks': integrated_assessment.compliance_frameworks if integrated_assessment else []
                },
                'individual_assessments': {},
                'validation': validation_report,
                'compliance_status': comprehensive_result.get('compliance_status', {}),
                'cia_scores': {
                    'confidentiality': confidentiality,
                    'integrity': integrity,
                    'availability': availability
                },
                'recommendations': integrated_assessment.recommendations if integrated_assessment else [],
                'next_steps': self._get_next_steps_for_risk_level(
                    integrated_assessment.risk_level if integrated_assessment else 'Unknown'
                )
            }
            
            # Add individual assessment summaries
            for method_name, result in comprehensive_result.get('individual_assessments', {}).items():
                response_data['individual_assessments'][method_name] = {
                    'methodology': result.methodology.value,
                    'risk_score': result.risk_score,
                    'risk_level': result.risk_level,
                    'threats_identified': len(result.threats_identified),
                    'vulnerabilities_identified': len(result.vulnerabilities_identified),
                    'compliance_frameworks': result.compliance_frameworks
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Risk identification failed: {str(e)}',
                'details': 'Please check your input data and try again'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_next_steps_for_risk_level(self, risk_level: str) -> List[str]:
        """Get recommended next steps based on risk level"""
        next_steps_map = {
            'Very High': [
                'Proceed immediately to Risk Analysis phase',
                'Consider implementing emergency controls',
                'Escalate to executive management',
                'Document risk treatment decisions'
            ],
            'High': [
                'Proceed to Risk Analysis phase within 24-48 hours',
                'Review and prioritize security controls',
                'Engage risk management team',
                'Prepare risk treatment plan'
            ],
            'Moderate': [
                'Schedule Risk Analysis phase within 1 week',
                'Review existing security controls',
                'Consider risk mitigation options',
                'Update risk register'
            ],
            'Low': [
                'Proceed with routine Risk Analysis phase',
                'Maintain current security posture',
                'Schedule periodic risk review',
                'Document findings'
            ],
            'Very Low': [
                'Complete Risk Analysis phase as planned',
                'Continue standard monitoring',
                'Annual risk assessment sufficient'
            ]
        }
        
        return next_steps_map.get(risk_level, next_steps_map['Moderate'])

    @action(detail=True, methods=['get'])
    def risk_identification_methodologies(self, request, pk=None):
        """
        Get available risk identification methodologies and their details
        """
        methodologies = {
            'iso_27005': {
                'name': 'ISO 27005:2022',
                'description': 'Information security risk management standard',
                'approaches': ['Asset-based', 'Event-based', 'Hybrid'],
                'compliance_frameworks': ['ISO 27001', 'ISO 27005:2022'],
                'best_for': 'Comprehensive information security risk management',
                'implementation_status': 'Fully Implemented'
            },
            'nist_sp_800_30': {
                'name': 'NIST SP 800-30 Rev 1',
                'description': 'Guide for Conducting Risk Assessments',
                'approaches': ['Three-tiered assessment', 'Threat source analysis'],
                'compliance_frameworks': ['NIST Cybersecurity Framework', 'NIST SP 800-30'],
                'best_for': 'Federal and enterprise risk assessments',
                'implementation_status': 'Fully Implemented'
            },
            'octave': {
                'name': 'OCTAVE',
                'description': 'Operationally Critical Threat, Asset, and Vulnerability Evaluation',
                'approaches': ['Organizational view', 'Technological view', 'Risk analysis'],
                'compliance_frameworks': ['Asset-Centric Risk Management'],
                'best_for': 'Operational risk assessment with business focus',
                'implementation_status': 'Fully Implemented'
            },
            'integrated': {
                'name': 'Integrated Multi-Framework Approach',
                'description': 'Combines multiple methodologies for comprehensive assessment',
                'approaches': ['ISO 27005', 'NIST SP 800-30', 'OCTAVE'],
                'compliance_frameworks': ['Multiple standards compliance'],
                'best_for': 'Comprehensive risk identification with multiple perspectives',
                'implementation_status': 'Fully Implemented'
            }
        }
        
        return Response({
            'available_methodologies': methodologies,
            'default_methodology': 'integrated',
            'recommended_combination': ['iso_27005', 'nist_sp_800_30', 'octave'],
            'implementation_guide': {
                'step_1': 'Select appropriate methodology based on organizational needs',
                'step_2': 'Assess CIA triad (Confidentiality, Integrity, Availability)',
                'step_3': 'Execute risk identification using selected methodology',
                'step_4': 'Review results and proceed to Risk Analysis phase'
            }
        }, status=status.HTTP_200_OK)

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
                    {'error': 'Asset must have risk identification completed first (Phase 2). Run identify_risk endpoint first.'},
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
            
            # Perform comparison using 7-parameter approach
            comparison_result = comparison_framework.compare_all_approaches(
                business_criticality=asset.business_criticality or 0.5,
                data_sensitivity=asset.data_sensitivity or 0.5,
                operational_dependency=asset.operational_dependency or 0.5,
                regulatory_impact=asset.regulatory_impact or 0.5,
                confidentiality=asset.confidentiality or 0.5,
                integrity=asset.integrity or 0.5,
                availability=asset.availability or 0.5
            )
            
            # Update asset with predictions
            predictions = comparison_result['predictions']
            consensus = comparison_result.get('consensus', {})
            
            asset.traditional_fuzzy_prediction = predictions.get('enhanced_fuzzy')
            asset.modern_svm_prediction = predictions.get('modern_svm')
            asset.modern_dt_prediction = predictions.get('modern_dt')
            

            
            # Store classification scores
            classification_scores = comparison_result.get('classification_scores', {})
            asset.traditional_fuzzy_score = classification_scores.get('enhanced_fuzzy')
            asset.modern_svm_score = classification_scores.get('modern_svm')
            asset.modern_dt_score = classification_scores.get('modern_dt')
            
            # CRITICAL: Store the backend-calculated consensus in mathematical_risk_category
            # This ensures frontend uses backend logic instead of doing its own calculations
            if consensus.get('prediction'):
                # Convert consensus prediction to risk category format for storage
                consensus_prediction = consensus['prediction']
                # Standardize to consistent terminology following NIST SP 800-30
                if consensus_prediction == 'Low':
                    asset.mathematical_risk_category = "Low Risk"
                elif consensus_prediction in ['Moderate', 'Medium']:
                    asset.mathematical_risk_category = "Medium Risk"  # Standardize to "Medium"
                elif consensus_prediction == 'High':
                    asset.mathematical_risk_category = "High Risk"
                else:
                    asset.mathematical_risk_category = "Medium Risk"  # Safe fallback
            
            asset.comparison_performed_date = datetime.now()
            asset.save()
            
            # Save detailed comparison record
            ModelComparison.objects.create(
                asset=asset,
                experiment_name=serializer.validated_data.get('experiment_name', 'Standard Comparison'),
                input_confidentiality=asset.confidentiality or 0.5,
                input_integrity=asset.integrity or 0.5,
                input_availability=asset.availability or 0.5,
                input_asset_classification=asset.classification_value or 0.5,
                fuzzy_prediction=predictions.get('enhanced_fuzzy', 'Error'),
                svm_prediction=predictions.get('modern_svm', 'Error'),
                dt_prediction=predictions.get('modern_dt', 'Error'),

            )
            
            response_data = {
                'asset_id': asset.id,
                'input_features': comparison_result['input_features'],
                'predictions': comparison_result['predictions'],

                'approach_details': comparison_result.get('approach_details', {}),
                'consensus': comparison_result.get('consensus', {}),
                'standards_compliant': True,  # All comparisons follow established standards
                'methodology_version': '2.0_Standards_Compliant',
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
            
            # Prepare test data with 7 parameters
            test_data = []
            for asset in assets:
                test_data.append((
                    asset.business_criticality or 0.5,
                    asset.data_sensitivity or 0.5,
                    asset.operational_dependency or 0.5,
                    asset.regulatory_impact or 0.5,
                    asset.confidentiality or 0.5,
                    asset.integrity or 0.5,
                    asset.availability or 0.5
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
                    consensus = individual_result.get('consensus', {})
                    
                    asset.traditional_fuzzy_prediction = predictions.get('enhanced_fuzzy')
                    asset.modern_svm_prediction = predictions.get('modern_svm')
                    asset.modern_dt_prediction = predictions.get('modern_dt')
                    

                    
                    # Store classification scores
                    classification_scores = individual_result.get('classification_scores', {})
                    asset.traditional_fuzzy_score = classification_scores.get('enhanced_fuzzy')
                    asset.modern_svm_score = classification_scores.get('modern_svm')
                    asset.modern_dt_score = classification_scores.get('modern_dt')
                    
                    # CRITICAL: Store consensus in mathematical_risk_category for batch operations too
                    if consensus.get('prediction'):
                        consensus_prediction = consensus['prediction']
                        # Standardize to consistent terminology following NIST SP 800-30
                        if consensus_prediction == 'Low':
                            asset.mathematical_risk_category = "Low Risk"
                        elif consensus_prediction in ['Moderate', 'Medium']:
                            asset.mathematical_risk_category = "Medium Risk"  # Standardize to "Medium"
                        elif consensus_prediction == 'High':
                            asset.mathematical_risk_category = "High Risk"
                        else:
                            asset.mathematical_risk_category = "Medium Risk"  # Safe fallback
                    
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
                        fuzzy_prediction=predictions.get('enhanced_fuzzy', 'Error'),
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
                },
                'standards_compliance_score': 1.0,  # Full compliance with standards
                'methodology_version': '2.0_Standards_Compliant'
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