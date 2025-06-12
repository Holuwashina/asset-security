"""
Machine Learning Views for CSV Upload and Model Training

This module provides API endpoints for:
1. Uploading CSV training datasets
2. Training ML models with uploaded data
3. Testing/evaluating trained models
4. Downloading model performance reports

Author: Asset Classification Framework
Date: 2024
License: MIT
"""

import pandas as pd
import numpy as np
import os
import json
import pickle
import tempfile
from datetime import datetime
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from django.conf import settings

# ML libraries
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.metrics import precision_recall_fscore_support

from rest_framework import serializers


class CSVUploadSerializer(serializers.Serializer):
    """Serializer for CSV file upload"""
    csv_file = serializers.FileField()
    dataset_type = serializers.ChoiceField(
        choices=[('training', 'Training'), ('testing', 'Testing')],
        default='training'
    )
    model_name = serializers.CharField(max_length=100, default='Asset_Classification_Model')


class ModelTrainingResultSerializer(serializers.Serializer):
    """Serializer for model training results"""
    model_id = serializers.CharField()
    model_name = serializers.CharField()
    training_accuracy = serializers.FloatField()
    validation_accuracy = serializers.FloatField()
    training_samples = serializers.IntegerField()
    features_used = serializers.ListField()
    target_classes = serializers.ListField()
    training_time = serializers.FloatField()
    model_path = serializers.CharField()


class MLTrainingViewSet(viewsets.ViewSet):
    """ViewSet for ML training operations"""
    
    parser_classes = (MultiPartParser, FormParser)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.models_dir = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(self.models_dir, exist_ok=True)
    
    @action(detail=False, methods=['post'])
    def upload_dataset(self, request):
        """
        Upload CSV dataset for training
        POST /api/ml/upload_dataset/
        """
        try:
            serializer = CSVUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            csv_file = serializer.validated_data['csv_file']
            dataset_type = serializer.validated_data['dataset_type']
            model_name = serializer.validated_data['model_name']
            
            # Validate file type
            if not csv_file.name.endswith('.csv'):
                return Response({
                    'error': 'File must be a CSV file'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Read and validate CSV
            try:
                df = pd.read_csv(csv_file)
            except Exception as e:
                return Response({
                    'error': f'Error reading CSV file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate required columns
            required_columns = [
                'asset_category', 'business_context', 'asset_value', 
                'confidentiality', 'integrity', 'availability', 'risk_category'
            ]
            
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response({
                    'error': f'Missing required columns: {missing_columns}',
                    'required_columns': required_columns,
                    'found_columns': list(df.columns)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save dataset
            dataset_id = f"{model_name}_{dataset_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            dataset_path = os.path.join(self.models_dir, f"{dataset_id}.csv")
            df.to_csv(dataset_path, index=False)
            
            # Generate dataset statistics
            stats = {
                'dataset_id': dataset_id,
                'dataset_type': dataset_type,
                'model_name': model_name,
                'upload_date': datetime.now().isoformat(),
                'total_records': len(df),
                'features_count': len(df.columns) - 1,  # Exclude target column
                'target_classes': sorted(df['risk_category'].unique().tolist()),
                'class_distribution': df['risk_category'].value_counts().to_dict(),
                'feature_statistics': {
                    'confidentiality': {
                        'min': float(df['confidentiality'].min()),
                        'max': float(df['confidentiality'].max()),
                        'mean': float(df['confidentiality'].mean())
                    },
                    'integrity': {
                        'min': float(df['integrity'].min()),
                        'max': float(df['integrity'].max()),
                        'mean': float(df['integrity'].mean())
                    },
                    'availability': {
                        'min': float(df['availability'].min()),
                        'max': float(df['availability'].max()),
                        'mean': float(df['availability'].mean())
                    }
                },
                'file_path': dataset_path
            }
            
            # Save dataset metadata
            metadata_path = os.path.join(self.models_dir, f"{dataset_id}_metadata.json")
            with open(metadata_path, 'w') as f:
                json.dump(stats, f, indent=2)
            
            return Response({
                'message': 'Dataset uploaded successfully',
                'dataset_id': dataset_id,
                'statistics': stats
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Upload failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def train_models(self, request):
        """
        Train ML models using uploaded dataset
        POST /api/ml/train_models/
        Body: {"dataset_id": "...", "models": ["random_forest", "svm", "decision_tree"]}
        """
        try:
            dataset_id = request.data.get('dataset_id')
            models_to_train = request.data.get('models', ['random_forest', 'svm', 'decision_tree'])
            
            if not dataset_id:
                return Response({
                    'error': 'dataset_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Load dataset
            dataset_path = os.path.join(self.models_dir, f"{dataset_id}.csv")
            if not os.path.exists(dataset_path):
                return Response({
                    'error': f'Dataset {dataset_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            df = pd.read_csv(dataset_path)
            
            # Prepare features and target
            feature_columns = [
                'confidentiality', 'integrity', 'availability', 
                'cia_average', 'cia_max', 'value_impact'
            ]
            
            # Use available feature columns
            available_features = [col for col in feature_columns if col in df.columns]
            if not available_features:
                return Response({
                    'error': 'No valid feature columns found',
                    'expected': feature_columns,
                    'available': list(df.columns)
                }, status=status.HTTP_400_BAD_REQUEST)
            
            X = df[available_features].values
            y = df['risk_category'].values
            
            # Encode categorical target
            label_encoder = LabelEncoder()
            y_encoded = label_encoder.fit_transform(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train models
            training_results = {}
            
            for model_type in models_to_train:
                start_time = datetime.now()
                
                # Initialize model
                if model_type == 'random_forest':
                    model = RandomForestClassifier(n_estimators=100, random_state=42)
                    X_train_use = X_train
                    X_test_use = X_test
                elif model_type == 'svm':
                    model = SVC(kernel='rbf', random_state=42, probability=True)
                    X_train_use = X_train_scaled
                    X_test_use = X_test_scaled
                elif model_type == 'decision_tree':
                    model = DecisionTreeClassifier(random_state=42, max_depth=10)
                    X_train_use = X_train
                    X_test_use = X_test
                else:
                    continue
                
                # Train model
                model.fit(X_train_use, y_train)
                
                # Evaluate
                train_accuracy = model.score(X_train_use, y_train)
                test_accuracy = model.score(X_test_use, y_test)
                
                # Cross validation
                cv_scores = cross_val_score(model, X_train_use, y_train, cv=5)
                cv_accuracy = cv_scores.mean()
                
                training_time = (datetime.now() - start_time).total_seconds()
                
                # Save model
                model_id = f"{dataset_id}_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                model_path = os.path.join(self.models_dir, f"{model_id}.pkl")
                
                model_data = {
                    'model': model,
                    'scaler': scaler if model_type == 'svm' else None,
                    'label_encoder': label_encoder,
                    'feature_columns': available_features,
                    'model_type': model_type,
                    'training_date': datetime.now().isoformat(),
                    'dataset_id': dataset_id
                }
                
                with open(model_path, 'wb') as f:
                    pickle.dump(model_data, f)
                
                # Store results
                training_results[model_type] = {
                    'model_id': model_id,
                    'model_type': model_type,
                    'training_accuracy': round(train_accuracy, 4),
                    'testing_accuracy': round(test_accuracy, 4),
                    'cv_accuracy': round(cv_accuracy, 4),
                    'cv_std': round(cv_scores.std(), 4),
                    'training_samples': len(X_train),
                    'testing_samples': len(X_test),
                    'features_used': available_features,
                    'target_classes': label_encoder.classes_.tolist(),
                    'training_time': round(training_time, 2),
                    'model_path': model_path
                }
            
            # Save training results
            results_path = os.path.join(self.models_dir, f"{dataset_id}_training_results.json")
            with open(results_path, 'w') as f:
                json.dump(training_results, f, indent=2)
            
            return Response({
                'message': 'Models trained successfully',
                'dataset_id': dataset_id,
                'results': training_results
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Training failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def test_model(self, request):
        """
        Test trained model with new data
        POST /api/ml/test_model/
        Body: {"model_id": "...", "test_data": [...]}
        """
        try:
            model_id = request.data.get('model_id')
            test_data = request.data.get('test_data', [])
            
            if not model_id:
                return Response({
                    'error': 'model_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Load model
            model_path = os.path.join(self.models_dir, f"{model_id}.pkl")
            if not os.path.exists(model_path):
                return Response({
                    'error': f'Model {model_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            model = model_data['model']
            scaler = model_data.get('scaler')
            label_encoder = model_data['label_encoder']
            feature_columns = model_data['feature_columns']
            
            # Prepare test data
            if isinstance(test_data, dict):
                test_data = [test_data]
            
            predictions = []
            
            for data_point in test_data:
                # Extract features
                features = [data_point.get(col, 0.0) for col in feature_columns]
                features_array = np.array(features).reshape(1, -1)
                
                # Scale if needed
                if scaler:
                    features_array = scaler.transform(features_array)
                
                # Predict
                prediction_encoded = model.predict(features_array)[0]
                prediction = label_encoder.inverse_transform([prediction_encoded])[0]
                
                # Get prediction probability if available
                try:
                    probabilities = model.predict_proba(features_array)[0]
                    prob_dict = {
                        label_encoder.classes_[i]: float(prob) 
                        for i, prob in enumerate(probabilities)
                    }
                except:
                    prob_dict = {}
                
                predictions.append({
                    'input': data_point,
                    'prediction': prediction,
                    'probabilities': prob_dict
                })
            
            return Response({
                'model_id': model_id,
                'predictions': predictions,
                'model_info': {
                    'model_type': model_data['model_type'],
                    'features_used': feature_columns,
                    'target_classes': label_encoder.classes_.tolist(),
                    'training_date': model_data['training_date']
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Testing failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def list_datasets(self, request):
        """
        List uploaded datasets
        GET /api/ml/list_datasets/
        """
        try:
            datasets = []
            
            for filename in os.listdir(self.models_dir):
                if filename.endswith('_metadata.json'):
                    metadata_path = os.path.join(self.models_dir, filename)
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                    datasets.append(metadata)
            
            # Sort by upload date
            datasets.sort(key=lambda x: x['upload_date'], reverse=True)
            
            return Response({
                'datasets': datasets,
                'count': len(datasets)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to list datasets: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def list_models(self, request):
        """
        List trained models
        GET /api/ml/list_models/
        """
        try:
            models = []
            
            for filename in os.listdir(self.models_dir):
                if filename.endswith('_training_results.json'):
                    results_path = os.path.join(self.models_dir, filename)
                    with open(results_path, 'r') as f:
                        results = json.load(f)
                    
                    dataset_id = filename.replace('_training_results.json', '')
                    
                    for model_type, model_info in results.items():
                        models.append({
                            'dataset_id': dataset_id,
                            **model_info
                        })
            
            # Sort by training date
            models.sort(key=lambda x: x.get('training_date', ''), reverse=True)
            
            return Response({
                'models': models,
                'count': len(models)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to list models: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def download_model_report(self, request):
        """
        Download model performance report
        GET /api/ml/download_model_report/?model_id=...
        """
        try:
            model_id = request.query_params.get('model_id')
            
            if not model_id:
                return Response({
                    'error': 'model_id parameter is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find training results
            dataset_id = '_'.join(model_id.split('_')[:-2])  # Extract dataset_id from model_id
            results_path = os.path.join(self.models_dir, f"{dataset_id}_training_results.json")
            
            if not os.path.exists(results_path):
                return Response({
                    'error': f'Training results for model {model_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            with open(results_path, 'r') as f:
                results = json.load(f)
            
            # Generate report
            report = {
                'model_performance_report': {
                    'generated_at': datetime.now().isoformat(),
                    'model_id': model_id,
                    'dataset_id': dataset_id,
                    'training_results': results
                }
            }
            
            # Create downloadable JSON response
            response = HttpResponse(
                json.dumps(report, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="{model_id}_report.json"'
            
            return response
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate report: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)