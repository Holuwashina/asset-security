"""
Model comparison utilities for ML model performance evaluation
"""
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from collections import defaultdict
import json


class ModelComparisonFramework:
    """
    Framework for comparing machine learning model performances
    """
    
    def __init__(self):
        self.models = {}
        self.comparison_results = {}
    
    def add_model_results(self, model_name, y_true, y_pred, training_time=None, model_params=None):
        """
        Add model results for comparison.
        
        Args:
            model_name (str): Name of the model
            y_true (array): True labels
            y_pred (array): Predicted labels
            training_time (float): Training time in seconds
            model_params (dict): Model parameters
        
        Returns:
            dict: Model performance metrics
        """
        try:
            # Convert to numpy arrays
            y_true = np.array(y_true)
            y_pred = np.array(y_pred)
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_true, y_pred)
            
            # Add additional information
            if training_time is not None:
                metrics['training_time'] = training_time
            
            if model_params is not None:
                metrics['model_params'] = model_params
            
            # Store results
            self.models[model_name] = {
                'metrics': metrics,
                'y_true': y_true.tolist(),
                'y_pred': y_pred.tolist(),
                'confusion_matrix': confusion_matrix(y_true, y_pred).tolist()
            }
            
            return metrics
            
        except Exception as e:
            return {
                'error': str(e),
                'model_name': model_name
            }
    
    def _calculate_metrics(self, y_true, y_pred):
        """Calculate comprehensive performance metrics."""
        try:
            # Basic metrics
            accuracy = accuracy_score(y_true, y_pred)
            
            # Handle multiclass vs binary classification
            average_method = 'weighted' if len(np.unique(y_true)) > 2 else 'binary'
            
            precision = precision_score(y_true, y_pred, average=average_method, zero_division=0)
            recall = recall_score(y_true, y_pred, average=average_method, zero_division=0)
            f1 = f1_score(y_true, y_pred, average=average_method, zero_division=0)
            
            # Confusion matrix
            cm = confusion_matrix(y_true, y_pred)
            
            # Classification report
            report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
            
            return {
                'accuracy': round(accuracy, 4),
                'precision': round(precision, 4),
                'recall': round(recall, 4),
                'f1_score': round(f1, 4),
                'confusion_matrix': cm.tolist(),
                'classification_report': report,
                'support': len(y_true)
            }
            
        except Exception as e:
            return {
                'error': f"Error calculating metrics: {str(e)}",
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0
            }
    
    def compare_models(self):
        """
        Compare all added models and return comprehensive comparison.
        
        Returns:
            dict: Comprehensive model comparison results
        """
        if not self.models:
            return {'error': 'No models added for comparison'}
        
        try:
            comparison = {
                'model_count': len(self.models),
                'models': {},
                'ranking': {},
                'best_model': {},
                'summary': {}
            }
            
            # Extract metrics for all models
            for model_name, model_data in self.models.items():
                metrics = model_data['metrics']
                comparison['models'][model_name] = metrics
            
            # Rank models by different metrics
            metrics_to_rank = ['accuracy', 'precision', 'recall', 'f1_score']
            
            for metric in metrics_to_rank:
                model_scores = []
                for model_name, model_data in self.models.items():
                    score = model_data['metrics'].get(metric, 0)
                    model_scores.append((model_name, score))
                
                # Sort by score (descending)
                model_scores.sort(key=lambda x: x[1], reverse=True)
                comparison['ranking'][metric] = model_scores
            
            # Determine best overall model (using F1 score as primary metric)
            if 'f1_score' in comparison['ranking']:
                best_model_name = comparison['ranking']['f1_score'][0][0]
                comparison['best_model'] = {
                    'name': best_model_name,
                    'metrics': self.models[best_model_name]['metrics']
                }
            
            # Create summary statistics
            all_accuracies = [model_data['metrics'].get('accuracy', 0) 
                            for model_data in self.models.values()]
            all_f1_scores = [model_data['metrics'].get('f1_score', 0) 
                           for model_data in self.models.values()]
            
            comparison['summary'] = {
                'avg_accuracy': round(np.mean(all_accuracies), 4),
                'max_accuracy': round(np.max(all_accuracies), 4),
                'min_accuracy': round(np.min(all_accuracies), 4),
                'avg_f1_score': round(np.mean(all_f1_scores), 4),
                'max_f1_score': round(np.max(all_f1_scores), 4),
                'min_f1_score': round(np.min(all_f1_scores), 4)
            }
            
            self.comparison_results = comparison
            return comparison
            
        except Exception as e:
            return {'error': f"Error comparing models: {str(e)}"}
    
    def get_model_details(self, model_name):
        """Get detailed information about a specific model."""
        if model_name not in self.models:
            return {'error': f'Model {model_name} not found'}
        
        return self.models[model_name]
    
    def export_results(self, format='json'):
        """
        Export comparison results in specified format.
        
        Args:
            format (str): Export format ('json', 'dict')
        
        Returns:
            str or dict: Exported results
        """
        if not self.comparison_results:
            self.compare_models()
        
        if format == 'json':
            return json.dumps(self.comparison_results, indent=2)
        else:
            return self.comparison_results
    
    def clear_models(self):
        """Clear all stored models and results."""
        self.models = {}
        self.comparison_results = {}
    
    def get_performance_insights(self):
        """
        Get insights about model performance patterns.
        
        Returns:
            dict: Performance insights and recommendations
        """
        if not self.models:
            return {'error': 'No models available for analysis'}
        
        insights = {
            'observations': [],
            'recommendations': [],
            'performance_patterns': {}
        }
        
        try:
            # Analyze performance patterns
            accuracies = []
            f1_scores = []
            
            for model_name, model_data in self.models.items():
                metrics = model_data['metrics']
                accuracies.append(metrics.get('accuracy', 0))
                f1_scores.append(metrics.get('f1_score', 0))
            
            avg_accuracy = np.mean(accuracies)
            avg_f1 = np.mean(f1_scores)
            
            # Performance observations
            if avg_accuracy > 0.8:
                insights['observations'].append("Overall model performance is good (accuracy > 80%)")
            elif avg_accuracy > 0.6:
                insights['observations'].append("Model performance is moderate (accuracy 60-80%)")
            else:
                insights['observations'].append("Model performance needs improvement (accuracy < 60%)")
            
            # F1 score analysis
            if avg_f1 > 0.8:
                insights['observations'].append("Models show good balance between precision and recall")
            elif avg_f1 < 0.5:
                insights['observations'].append("Models may have class imbalance issues")
            
            # Recommendations
            if avg_accuracy < 0.7:
                insights['recommendations'].extend([
                    "Consider feature engineering to improve model performance",
                    "Try different algorithms or ensemble methods",
                    "Increase training data if possible"
                ])
            
            if len(self.models) < 3:
                insights['recommendations'].append("Try comparing more diverse algorithms")
            
            insights['performance_patterns'] = {
                'average_accuracy': round(avg_accuracy, 4),
                'average_f1_score': round(avg_f1, 4),
                'accuracy_variance': round(np.var(accuracies), 4),
                'f1_variance': round(np.var(f1_scores), 4)
            }
            
            return insights
            
        except Exception as e:
            return {'error': f"Error generating insights: {str(e)}"}