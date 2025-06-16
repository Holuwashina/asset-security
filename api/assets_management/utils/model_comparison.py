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
    
    def compare_all_approaches(self, business_criticality, data_sensitivity, operational_dependency, regulatory_impact, confidentiality, integrity, availability):
        """
        Compare Enhanced 7-Parameter Fuzzy Logic vs Modern ML approaches for asset classification
        This is the method called by views.py for Phase 4 model comparison
        
        Args:
            business_criticality (float): Business impact if asset is compromised (0-1 scale)
            data_sensitivity (float): Sensitivity level of data handled by asset (0-1 scale)
            operational_dependency (float): Dependency of operations on this asset (0-1 scale)
            regulatory_impact (float): Regulatory/compliance impact if compromised (0-1 scale)
            confidentiality (float): Confidentiality requirement level (0-1 scale)
            integrity (float): Integrity requirement level (0-1 scale)
            availability (float): Availability requirement level (0-1 scale)
            
        Returns:
            dict: Comprehensive comparison results
        """
        try:
            # Import required modules for model implementations
            from .classification import classify_asset_fuzzy
            from sklearn.svm import SVC
            from sklearn.tree import DecisionTreeClassifier
            import numpy as np
            
            # Prepare input features for ML models (7 parameters, 0-1 scale)
            features = np.array([[business_criticality, data_sensitivity, operational_dependency, 
                                regulatory_impact, confidentiality, integrity, availability]])
            
            # 1. Enhanced 7-Parameter Fuzzy Logic Approach
            try:
                # Use the updated fuzzy classification function
                fuzzy_result = classify_asset_fuzzy(
                    business_criticality=business_criticality,
                    data_sensitivity=data_sensitivity,
                    operational_dependency=operational_dependency,
                    regulatory_impact=regulatory_impact,
                    confidentiality=confidentiality,
                    integrity=integrity,
                    availability=availability
                )
                
                # Extract prediction from fuzzy result
                traditional_fuzzy_prediction = fuzzy_result.get('classification_category', 'Error')
                fuzzy_confidence = fuzzy_result.get('classification_score', 0.0)
                
            except Exception as e:
                raise ValueError(f"Enhanced fuzzy logic classification failed: {str(e)}")
            
            # 2. Modern SVM Approach - Enhanced with 7-parameter training data
            try:
                # Enhanced SVM classifier with comprehensive 7-parameter training data
                svm_model = SVC(kernel='rbf', gamma='scale', C=1.0, random_state=42)
                
                # Comprehensive 7-parameter training data based on industry patterns (24 samples)
                X_train = np.array([
                    # Public patterns - Very low risk (6 samples)
                    [0.1, 0.2, 0.1, 0.1, 0.2, 0.2, 0.3], [0.2, 0.1, 0.2, 0.2, 0.1, 0.3, 0.2], 
                    [0.3, 0.2, 0.1, 0.1, 0.3, 0.2, 0.1], [0.2, 0.3, 0.2, 0.1, 0.2, 0.1, 0.2],
                    [0.1, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3], [0.2, 0.2, 0.1, 0.3, 0.3, 0.1, 0.2],
                    
                    # Official patterns - Low-moderate risk (6 samples)
                    [0.3, 0.4, 0.3, 0.2, 0.4, 0.4, 0.3], [0.4, 0.3, 0.4, 0.3, 0.3, 0.5, 0.4], 
                    [0.5, 0.4, 0.2, 0.4, 0.4, 0.3, 0.5], [0.2, 0.5, 0.4, 0.3, 0.5, 0.4, 0.3],
                    [0.3, 0.3, 0.5, 0.4, 0.3, 0.4, 0.4], [0.4, 0.2, 0.3, 0.5, 0.4, 0.5, 0.3],
                    
                    # Confidential patterns - Moderate-high risk (6 samples)
                    [0.6, 0.7, 0.6, 0.5, 0.7, 0.7, 0.6], [0.7, 0.6, 0.7, 0.6, 0.6, 0.8, 0.7], 
                    [0.8, 0.7, 0.5, 0.7, 0.7, 0.6, 0.8], [0.5, 0.8, 0.7, 0.6, 0.8, 0.7, 0.6],
                    [0.6, 0.6, 0.8, 0.7, 0.6, 0.7, 0.7], [0.7, 0.5, 0.6, 0.8, 0.7, 0.8, 0.6],
                    
                    # Restricted patterns - High risk (6 samples)
                    [0.8, 0.9, 0.8, 0.8, 0.9, 0.8, 0.7], [0.9, 0.8, 0.9, 0.8, 0.7, 0.9, 0.8], 
                    [0.9, 0.9, 0.8, 0.9, 0.8, 0.7, 0.9], [0.8, 0.8, 0.9, 0.7, 0.8, 0.8, 0.8],
                    [0.9, 0.7, 0.8, 0.8, 0.9, 0.9, 0.7], [0.7, 0.8, 0.9, 0.9, 0.7, 0.8, 0.9]
                ])
                y_train = ['Public', 'Public', 'Public', 'Public', 'Public', 'Public',
                          'Official', 'Official', 'Official', 'Official', 'Official', 'Official',
                          'Confidential', 'Confidential', 'Confidential', 'Confidential', 'Confidential', 'Confidential',
                          'Restricted', 'Restricted', 'Restricted', 'Restricted', 'Restricted', 'Restricted']
                
                svm_model.fit(X_train, y_train)
                svm_prediction = svm_model.predict(features)[0]
                modern_svm_prediction = svm_prediction
            except Exception as e:
                raise ValueError(f"SVM classification failed: {str(e)}")
            
            # 3. Modern Decision Tree Approach - Enhanced with same 7-parameter training data
            try:
                # Enhanced Decision Tree with optimal parameters for 7-parameter input
                dt_model = DecisionTreeClassifier(
                    criterion='gini',
                    max_depth=6,  # Increased depth for 7 parameters
                    min_samples_split=2,
                    min_samples_leaf=1,
                    random_state=42
                )
                
                # Use same comprehensive 7-parameter training data as SVM for fair comparison (24 samples)
                X_train = np.array([
                    # Public patterns - Very low risk (6 samples)
                    [0.1, 0.2, 0.1, 0.1, 0.2, 0.2, 0.3], [0.2, 0.1, 0.2, 0.2, 0.1, 0.3, 0.2], 
                    [0.3, 0.2, 0.1, 0.1, 0.3, 0.2, 0.1], [0.2, 0.3, 0.2, 0.1, 0.2, 0.1, 0.2],
                    [0.1, 0.1, 0.3, 0.2, 0.1, 0.2, 0.3], [0.2, 0.2, 0.1, 0.3, 0.3, 0.1, 0.2],
                    
                    # Official patterns - Low-moderate risk (6 samples)
                    [0.3, 0.4, 0.3, 0.2, 0.4, 0.4, 0.3], [0.4, 0.3, 0.4, 0.3, 0.3, 0.5, 0.4], 
                    [0.5, 0.4, 0.2, 0.4, 0.4, 0.3, 0.5], [0.2, 0.5, 0.4, 0.3, 0.5, 0.4, 0.3],
                    [0.3, 0.3, 0.5, 0.4, 0.3, 0.4, 0.4], [0.4, 0.2, 0.3, 0.5, 0.4, 0.5, 0.3],
                    
                    # Confidential patterns - Moderate-high risk (6 samples)
                    [0.6, 0.7, 0.6, 0.5, 0.7, 0.7, 0.6], [0.7, 0.6, 0.7, 0.6, 0.6, 0.8, 0.7], 
                    [0.8, 0.7, 0.5, 0.7, 0.7, 0.6, 0.8], [0.5, 0.8, 0.7, 0.6, 0.8, 0.7, 0.6],
                    [0.6, 0.6, 0.8, 0.7, 0.6, 0.7, 0.7], [0.7, 0.5, 0.6, 0.8, 0.7, 0.8, 0.6],
                    
                    # Restricted patterns - High risk (6 samples)
                    [0.8, 0.9, 0.8, 0.8, 0.9, 0.8, 0.7], [0.9, 0.8, 0.9, 0.8, 0.7, 0.9, 0.8], 
                    [0.9, 0.9, 0.8, 0.9, 0.8, 0.7, 0.9], [0.8, 0.8, 0.9, 0.7, 0.8, 0.8, 0.8],
                    [0.9, 0.7, 0.8, 0.8, 0.9, 0.9, 0.7], [0.7, 0.8, 0.9, 0.9, 0.7, 0.8, 0.9]
                ])
                y_train = ['Public', 'Public', 'Public', 'Public', 'Public', 'Public',
                          'Official', 'Official', 'Official', 'Official', 'Official', 'Official',
                          'Confidential', 'Confidential', 'Confidential', 'Confidential', 'Confidential', 'Confidential',
                          'Restricted', 'Restricted', 'Restricted', 'Restricted', 'Restricted', 'Restricted']
                
                dt_model.fit(X_train, y_train)
                dt_prediction = dt_model.predict(features)[0]
                modern_dt_prediction = dt_prediction
            except Exception as e:
                raise ValueError(f"Decision Tree classification failed: {str(e)}")
            
            # Calculate consensus - all predictions should be valid since we removed fallbacks
            predictions = [traditional_fuzzy_prediction, modern_svm_prediction, modern_dt_prediction]
            
            # Count occurrences
            from collections import Counter
            prediction_counts = Counter(predictions)
            consensus_prediction = prediction_counts.most_common(1)[0][0]
            
            # Calculate classification scores for SVM and DT models
            svm_score = self._calculate_classification_score(modern_svm_prediction)
            dt_score = self._calculate_classification_score(modern_dt_prediction)
            
            # Return comprehensive results
            return {
                'input_features': {
                    'business_criticality': business_criticality,
                    'data_sensitivity': data_sensitivity,
                    'operational_dependency': operational_dependency,
                    'regulatory_impact': regulatory_impact,
                    'confidentiality': confidentiality,
                    'integrity': integrity,
                    'availability': availability
                },
                'predictions': {
                    'enhanced_fuzzy': traditional_fuzzy_prediction,
                    'modern_svm': modern_svm_prediction,
                    'modern_dt': modern_dt_prediction
                },
                'classification_scores': {
                    'enhanced_fuzzy': fuzzy_confidence,
                    'modern_svm': svm_score,
                    'modern_dt': dt_score
                },

                'consensus': {
                    'prediction': consensus_prediction,
                    'agreement_level': f"3/3 models successful"
                },
                'approach_details': {
                    'enhanced_fuzzy': 'Enhanced 7-Parameter Fuzzy Logic (NIST SP 800-60 & ISO 27005 Compliant)',
                    'modern_svm': 'Support Vector Machine with RBF kernel (7-parameter)',
                    'modern_dt': 'Decision Tree with Gini impurity (7-parameter)'
                },
                'methodology_comparison': {
                    'parameters_used': 7,
                    'standards_compliance': ['NIST SP 800-60', 'ISO 27005', 'ISO 27001'],
                    'feature_categories': {
                        'business_factors': ['business_criticality', 'operational_dependency', 'regulatory_impact'],
                        'technical_factors': ['confidentiality', 'integrity', 'availability'],
                        'data_factors': ['data_sensitivity']
                    }
                }
            }
            
        except Exception as e:
            # No fallback - raise the error to ensure proper implementation
            raise ValueError(f"Model comparison failed: {str(e)}. Please check input parameters and model configurations.")
    



    

    
    def _calculate_classification_score(self, prediction):
        """Convert categorical prediction to classification score (0-1 scale)"""
        # Map government classification categories to their score ranges
        classification_mapping = {
            'Public': 0.125,        # Midpoint of 0.0-0.25 range
            'Official': 0.375,      # Midpoint of 0.26-0.50 range  
            'Confidential': 0.625,  # Midpoint of 0.51-0.75 range
            'Restricted': 0.875     # Midpoint of 0.76-1.0 range
        }
        
        return classification_mapping.get(prediction, 0.5)  # Default to middle if unknown
    
    def _convert_to_risk_category(self, fuzzy_result):
        """
        Convert fuzzy logic result to government classification format
        
        Args:
            fuzzy_result: Output from fuzzy classifier
            
        Returns:
            str: Government classification category ('Public', 'Official', 'Confidential', 'Restricted')
        """
        try:
            # Handle different possible formats from fuzzy classifier
            if isinstance(fuzzy_result, (int, float)):
                # Numeric result (0-1 scale from FuzzyDirectRiskClassifier)
                if fuzzy_result <= 0.25:
                    return 'Public'
                elif fuzzy_result <= 0.50:
                    return 'Official'
                elif fuzzy_result <= 0.75:
                    return 'Confidential'
                else:
                    return 'Restricted'
            elif isinstance(fuzzy_result, str):
                # String result - standardize format to government classification
                result_lower = fuzzy_result.lower()
                if 'public' in result_lower:
                    return 'Public'
                elif 'official' in result_lower:
                    return 'Official'
                elif 'confidential' in result_lower:
                    return 'Confidential'
                elif 'restricted' in result_lower:
                    return 'Restricted'
                else:
                    raise ValueError(f"Unknown fuzzy result format: {fuzzy_result}")
            else:
                raise ValueError(f"Invalid fuzzy result type: {type(fuzzy_result)}")
                
        except Exception as e:
            raise ValueError(f"Risk category conversion failed: {str(e)}")
    
    def batch_comparison(self, test_data_list):
        """
        Perform batch comparison on multiple assets
        
        Args:
            test_data_list: List of tuples (business_criticality, data_sensitivity, operational_dependency, 
                           regulatory_impact, confidentiality, integrity, availability)
            
        Returns:
            dict: Batch comparison results
        """
        try:
            individual_results = []
            successful_comparisons = 0
            
            for test_data in test_data_list:
                if len(test_data) >= 7:
                    business_criticality, data_sensitivity, operational_dependency, regulatory_impact, confidentiality, integrity, availability = test_data[:7]
                    
                    # Perform individual comparison using 7-parameter approach
                    result = self.compare_all_approaches(
                        business_criticality=business_criticality,
                        data_sensitivity=data_sensitivity,
                        operational_dependency=operational_dependency,
                        regulatory_impact=regulatory_impact,
                        confidentiality=confidentiality,
                        integrity=integrity,
                        availability=availability
                    )
                    
                    individual_results.append(result)
                    successful_comparisons += 1
                else:
                    raise ValueError(f"Invalid test data format - requires 7 parameters, got {len(test_data)}")
            
            # Calculate overall performance metrics
            performance_metrics = {
                'total_assets': len(test_data_list),
                'successful_comparisons': successful_comparisons,
                'success_rate': successful_comparisons / len(test_data_list) if test_data_list else 0
            }
            
            return {
                'individual_results': individual_results,
                'performance_metrics': performance_metrics,
                'batch_summary': {
                    'total_processed': len(test_data_list),
                    'successful': successful_comparisons,
                    'failed': len(test_data_list) - successful_comparisons
                }
            }
            
        except Exception as e:
            return {
                'error': f"Batch comparison failed: {str(e)}",
                'individual_results': [],
                'performance_metrics': {}
            }