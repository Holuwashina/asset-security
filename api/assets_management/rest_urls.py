"""
URL routing for Django REST Framework API endpoints

This module defines the RESTful API routes for the cloud asset classification system.
Updated to include ML training endpoints for CSV upload and model training.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from .views import (
    AssetListingViewSet,
    DepartmentViewSet,
    # AssetValueMappingViewSet, # Removed as model is deleted
    AssetTypeViewSet,
    AssetViewSet,
    AssessmentCategoryViewSet,
    AssessmentQuestionViewSet,
    ClassificationReportViewSet,
    ConfusionMatrixViewSet,
    ModelComparisonViewSet,
    ModelPerformanceComparisonViewSet
)

from .views_ml import MLTrainingViewSet

# Create a router and register our viewsets
router = DefaultRouter()

# Asset management endpoints
router.register(r'assets', AssetListingViewSet, basename='assetlisting')
router.register(r'departments', DepartmentViewSet, basename='department')
# router.register(r'asset-value-mappings', AssetValueMappingViewSet, basename='assetvaluemapping') # Removed
router.register(r'asset-types', AssetTypeViewSet, basename='assettype')
router.register(r'base-assets', AssetViewSet, basename='asset')

# Assessment endpoints
router.register(r'assessment-categories', AssessmentCategoryViewSet, basename='assessmentcategory')
router.register(r'assessment-questions', AssessmentQuestionViewSet, basename='assessmentquestion')

# Model performance and comparison endpoints
router.register(r'classification-reports', ClassificationReportViewSet, basename='classificationreport')
router.register(r'confusion-matrices', ConfusionMatrixViewSet, basename='confusionmatrix')
router.register(r'model-comparisons', ModelComparisonViewSet, basename='modelcomparison')
router.register(r'performance-comparisons', ModelPerformanceComparisonViewSet, basename='modelperformancecomparison')

# ML Training endpoints
router.register(r'ml', MLTrainingViewSet, basename='ml-training')

# URL patterns - no api/ prefix here as it's added in main urls.py
urlpatterns = [
    # API root - router provides the endpoints
    path('', include(router.urls)),
    
    # API documentation available via Spectacular URLs below
    
    # OpenAPI schema endpoints
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

"""
API Endpoint Documentation:

ASSET MANAGEMENT:
- GET    /api/assets/                     - List all assets
- POST   /api/assets/                     - Create new asset
- GET    /api/assets/{id}/                - Get specific asset
- PUT    /api/assets/{id}/                - Update asset
- DELETE /api/assets/{id}/                - Delete asset

ASSET CLASSIFICATION (5-Phase Framework):
- POST   /api/assets/{id}/classify_asset/         - Phase 1: Classify asset using fuzzy logic
- POST   /api/assets/{id}/classify_asset_ensemble/ - Phase 1: Enhanced classification using fuzzy logic + ML models
- POST   /api/assets/{id}/identify_risk/          - Phase 2: Identify risk using CIA triad
- POST   /api/assets/{id}/analyze_risk/           - Phase 3: Analyze risk using mathematical formula
- POST   /api/assets/{id}/compare_models/         - Phase 4: Compare all three approaches
# Phase 5: Risk handling available through frontend interface

BATCH OPERATIONS:
- POST   /api/assets/batch_compare/           - Batch comparison of multiple assets
- GET    /api/assets/performance_metrics/     - Get overall performance metrics

ML TRAINING & TESTING:
- POST   /api/ml/upload_dataset/              - Upload CSV training dataset
- GET    /api/ml/list_datasets/               - List uploaded datasets
- POST   /api/ml/train_models/                - Train ML models with uploaded data
- POST   /api/ml/test_model/                  - Test trained model with new data
- GET    /api/ml/list_models/                 - List trained models
- GET    /api/ml/download_model_report/       - Download model performance report

SUPPORTING DATA:
- GET    /api/departments/                    - List departments
# - GET    /api/asset-value-mappings/           - List asset value mappings # Removed
- GET    /api/asset-types/                    - List asset types
- GET    /api/assessment-categories/          - List assessment categories
- GET    /api/assessment-questions/           - List assessment questions

MODEL PERFORMANCE:
- GET    /api/classification-reports/         - List classification reports
- GET    /api/confusion-matrices/             - List confusion matrices
- GET    /api/model-comparisons/              - List model comparisons
- GET    /api/performance-comparisons/        - List performance comparisons

FILTERING & SEARCH:
Most endpoints support filtering, searching, and ordering:
- ?search=term                               - Search in relevant fields
- ?ordering=field                            - Order by field (add - for descending)
- ?field=value                               - Filter by field value

EXAMPLE USAGE:

1. Upload training dataset:
   POST /api/ml/upload_dataset/
   Content-Type: multipart/form-data
   {
     "csv_file": file,
     "dataset_type": "training",
     "model_name": "Asset_Classification_Model"
   }

2. Train models:
   POST /api/ml/train_models/
   {
     "dataset_id": "Asset_Classification_Model_training_20241106_101530",
     "models": ["random_forest", "svm", "decision_tree"]
   }

3. Test model:
   POST /api/ml/test_model/
   {
     "model_id": "Asset_Classification_Model_training_20241106_101530_random_forest_20241106_102045",
     "test_data": [
       {
         "confidentiality": 0.8,
         "integrity": 0.9,
         "availability": 0.7,
         "cia_average": 0.8,
         "cia_max": 0.9,
         "value_impact": 0.7
       }
     ]
   }

4. Create an asset:
   POST /api/assets/
   {
     "asset": "Database Server",
     "description": "Production database",
     "asset_type": "Database",
     "owner_department": "uuid-here",
     "asset_value": "uuid-here",
     "confidentiality": 0.8,
     "integrity": 0.9,
     "availability": 0.7
   }

5. Classify the asset (Phase 1):
   POST /api/assets/{asset-id}/classify_asset/

6. Identify risk (Phase 2):
   POST /api/assets/{asset-id}/identify_risk/
   {
     "confidentiality": 0.8,
     "integrity": 0.9,
     "availability": 0.7
   }

7. Analyze risk (Phase 3):
   POST /api/assets/{asset-id}/analyze_risk/

8. Compare models (Phase 4):
   POST /api/assets/{asset-id}/compare_models/
   {
     "experiment_name": "Frontend Comparison"
   }

9. Batch comparison:
   POST /api/assets/batch_compare/
   {
     "asset_ids": ["uuid1", "uuid2", "uuid3"],
     "experiment_name": "Batch Test"
   }

10. Get performance metrics:
    GET /api/assets/performance_metrics/

11. List uploaded datasets:
    GET /api/ml/list_datasets/

12. List trained models:
    GET /api/ml/list_models/

13. Download model report:
    GET /api/ml/download_model_report/?model_id=model_id_here
"""