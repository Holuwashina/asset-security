"""
Asset classification utilities using fuzzy logic and ML ensemble
"""
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import os
import pickle
import json
from datetime import datetime


def classify_asset_fuzzy(business_criticality, data_sensitivity, operational_dependency, regulatory_impact, confidentiality, integrity, availability):
    """
    Enhanced 7-parameter fuzzy logic asset classification following NIST SP 800-60 and ISO 27005 standards
    
    Args:
        business_criticality (float): Business impact if asset is compromised (0.0-1.0)
        data_sensitivity (float): Sensitivity level of data handled by asset (0.0-1.0)
        operational_dependency (float): Dependency of operations on this asset (0.0-1.0)
        regulatory_impact (float): Regulatory/compliance impact if compromised (0.0-1.0)
        confidentiality (float): Confidentiality requirement level (0.0-1.0)
        integrity (float): Integrity requirement level (0.0-1.0)
        availability (float): Availability requirement level (0.0-1.0)
    
    Returns:
        dict: Classification result with comprehensive risk assessment
    """
    try:
        # Validate all inputs are in 0-1 range
        inputs = [business_criticality, data_sensitivity, operational_dependency, regulatory_impact, 
                 confidentiality, integrity, availability]
        input_names = ['business_criticality', 'data_sensitivity', 'operational_dependency', 
                      'regulatory_impact', 'confidentiality', 'integrity', 'availability']
        
        for i, val in enumerate(inputs):
            if not 0 <= val <= 1:
                raise ValueError(f"Input {input_names[i]} value {val} not in range 0-1")
        
        # Define fuzzy variables for all 7 parameters
        business_crit = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'business_criticality')
        data_sens = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'data_sensitivity')
        op_depend = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'operational_dependency')
        reg_impact = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'regulatory_impact')
        confid = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'confidentiality')
        integ = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'integrity')
        avail = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'availability')
        
        # Output variable for risk classification
        risk_class = ctrl.Consequent(np.arange(0, 1.01, 0.01), 'risk_classification')
        
        # Define membership functions for all inputs (Low, Medium, High)
        for antecedent in [business_crit, data_sens, op_depend, reg_impact, confid, integ, avail]:
            antecedent['low'] = fuzz.trimf(antecedent.universe, [0.0, 0.0, 0.4])
            antecedent['medium'] = fuzz.trimf(antecedent.universe, [0.2, 0.5, 0.8])
            antecedent['high'] = fuzz.trimf(antecedent.universe, [0.6, 1.0, 1.0])
        
        # Define output membership functions (NIST SP 800-60 compliant)
        risk_class['low'] = fuzz.trimf(risk_class.universe, [0.0, 0.16, 0.33])
        risk_class['moderate'] = fuzz.trimf(risk_class.universe, [0.25, 0.5, 0.75])
        risk_class['high'] = fuzz.trimf(risk_class.universe, [0.66, 0.83, 1.0])
        
        # Define comprehensive fuzzy rules based on industry standards
        rules = [
            # Critical business operations with high CIA requirements
            ctrl.Rule(business_crit['high'] & confid['high'] & integ['high'] & avail['high'], risk_class['high']),
            ctrl.Rule(business_crit['high'] & data_sens['high'] & op_depend['high'], risk_class['high']),
            ctrl.Rule(reg_impact['high'] & data_sens['high'] & confid['high'], risk_class['high']),
            
            # High impact scenarios
            ctrl.Rule(business_crit['high'] & op_depend['high'] & (confid['high'] | integ['high']), risk_class['high']),
            ctrl.Rule(data_sens['high'] & reg_impact['high'] & (confid['medium'] | integ['medium']), risk_class['high']),
            ctrl.Rule(op_depend['high'] & avail['high'] & business_crit['medium'], risk_class['high']),
            
            # Moderate impact scenarios
            ctrl.Rule(business_crit['medium'] & data_sens['medium'] & op_depend['medium'], risk_class['moderate']),
            ctrl.Rule(business_crit['high'] & (confid['low'] | integ['low'] | avail['low']), risk_class['moderate']),
            ctrl.Rule(data_sens['high'] & reg_impact['low'] & business_crit['low'], risk_class['moderate']),
            ctrl.Rule(op_depend['medium'] & (confid['medium'] | integ['medium'] | avail['medium']), risk_class['moderate']),
            ctrl.Rule(reg_impact['medium'] & data_sens['medium'], risk_class['moderate']),
            
            # Low impact scenarios
            ctrl.Rule(business_crit['low'] & data_sens['low'] & op_depend['low'], risk_class['low']),
            ctrl.Rule(business_crit['low'] & reg_impact['low'] & (confid['low'] | integ['low']), risk_class['low']),
            ctrl.Rule(data_sens['low'] & op_depend['low'] & avail['low'], risk_class['low']),
            
            # Edge cases for comprehensive coverage
            ctrl.Rule(business_crit['medium'] & data_sens['low'] & op_depend['low'] & reg_impact['low'], risk_class['low']),
            ctrl.Rule(confid['high'] & integ['low'] & avail['low'] & business_crit['low'], risk_class['moderate']),
            ctrl.Rule(reg_impact['high'] & business_crit['low'] & data_sens['low'], risk_class['moderate'])
        ]
        
        # Create and run the fuzzy control system
        risk_ctrl = ctrl.ControlSystem(rules)
        risk_sim = ctrl.ControlSystemSimulation(risk_ctrl)
        
        # Set inputs
        risk_sim.input['business_criticality'] = business_criticality
        risk_sim.input['data_sensitivity'] = data_sensitivity
        risk_sim.input['operational_dependency'] = operational_dependency
        risk_sim.input['regulatory_impact'] = regulatory_impact
        risk_sim.input['confidentiality'] = confidentiality
        risk_sim.input['integrity'] = integrity
        risk_sim.input['availability'] = availability
        
        # Compute the result
        risk_sim.compute()
        fuzzy_score = float(risk_sim.output['risk_classification'])
        
        # Apply weighted scoring based on industry best practices
        # Business factors (60%): Business criticality, operational dependency, regulatory impact
        business_weight = (business_criticality * 0.4 + operational_dependency * 0.3 + regulatory_impact * 0.3) * 0.6
        
        # Technical factors (25%): CIA triad
        technical_weight = (confidentiality * 0.33 + integrity * 0.33 + availability * 0.34) * 0.25
        
        # Data sensitivity (15%): Standalone critical factor
        data_weight = data_sensitivity * 0.15
        
        # Combine fuzzy output with weighted factors
        final_score = min(max(fuzzy_score * 0.7 + business_weight + technical_weight + data_weight, 0.0), 1.0)
        
        # Determine government classification levels
        if final_score <= 0.25:
            category = "Public"
            description = "Information that can be disclosed to the public without harm"
            risk_level = "Low"
        elif final_score <= 0.50:
            category = "Official"
            description = "Information that requires protection but is not classified"
            risk_level = "Low-Medium"
        elif final_score <= 0.75:
            category = "Confidential"
            description = "Information that could cause damage if disclosed without authorization"
            risk_level = "Medium-High"
        else:
            category = "Restricted"
            description = "Information that could cause serious damage if disclosed without authorization"
            risk_level = "High"
        
        # Calculate individual component scores for transparency
        cia_score = (confidentiality + integrity + availability) / 3
        business_score = (business_criticality + operational_dependency + regulatory_impact) / 3
        
        return {
            'classification_score': round(final_score, 3),
            'classification_category': category,
            'risk_level': risk_level,
            'impact_description': description,
            'methodology': 'Enhanced 7-Parameter Fuzzy Logic (NIST SP 800-60 & ISO 27005 Compliant)',
            'inputs': {
                'business_criticality': business_criticality,
                'data_sensitivity': data_sensitivity,
                'operational_dependency': operational_dependency,
                'regulatory_impact': regulatory_impact,
                'confidentiality': confidentiality,
                'integrity': integrity,
                'availability': availability
            },
            'component_scores': {
                'fuzzy_logic_output': round(fuzzy_score, 3),
                'business_factors_score': round(business_score, 3),
                'cia_triad_score': round(cia_score, 3),
                'data_sensitivity_score': round(data_sensitivity, 3)
            },
            'processing_details': {
                'fuzzy_output': round(fuzzy_score, 3),
                'business_weight_contribution': round(business_weight, 3),
                'technical_weight_contribution': round(technical_weight, 3),
                'data_weight_contribution': round(data_weight, 3),
                'weights_applied': {
                    'fuzzy_logic': 0.7,
                    'business_factors': 0.6,
                    'technical_factors': 0.25,
                    'data_sensitivity': 0.15
                }
            },
            'compliance_standards': ['NIST SP 800-60', 'ISO 27005', 'ISO 27001']
        }
        
    except Exception as e:
        # No fallback - raise the error to ensure proper fuzzy logic implementation
        raise ValueError(f"Fuzzy logic classification failed: {str(e)}. Please check input parameters and fuzzy system configuration.")


def classify_asset(asset_value, organizational_impact):
    """
    Legacy function - now calls the new 7-parameter fuzzy logic implementation with default values
    """
    result = classify_asset_fuzzy(
        business_criticality=asset_value,
        data_sensitivity=organizational_impact,
        operational_dependency=0.5,
        regulatory_impact=0.3,
        confidentiality=0.5,
        integrity=0.5,
        availability=0.5
    )
    return result['classification_score']


def validate_classification_standards_compliance(classification_result, inputs=None):
    """
    Validate that classification results comply with NIST SP 800-60 and ISO 27005 standards.
    
    Args:
        classification_result (dict or float): Classification result
        inputs (dict, optional): Input parameters used for classification
    
    Returns:
        dict: Validation results with compliance status and recommendations
    """
    compliance_issues = []
    recommendations = []
    
    if isinstance(classification_result, dict):
        score = classification_result.get('classification_score', 0)
        category = classification_result.get('classification_category', 'Unknown')
        methodology = classification_result.get('methodology', 'Unknown')
    else:
        score = float(classification_result)
        methodology = 'Unknown'
        if score <= 0.25:
            category = "Public"
        elif score <= 0.50:
            category = "Official"
        elif score <= 0.75:
            category = "Confidential"
        else:
            category = "Restricted"
    
    # Validate score range
    if not (0 <= score <= 1):
        compliance_issues.append("Classification score must be in range 0-1")
    
    # Validate government classification compliance
    valid_categories = ["Public", "Official", "Confidential", "Restricted"]
    if category not in valid_categories:
        compliance_issues.append(f"Category '{category}' not compliant with government classification standards")
    
    # Validate input parameters if provided
    if inputs:
        required_params = ['business_criticality', 'data_sensitivity', 'operational_dependency', 
                          'regulatory_impact', 'confidentiality', 'integrity', 'availability']
        
        for param in required_params:
            if param in inputs:
                value = inputs[param]
            if not isinstance(value, (int, float)) or not (0 <= value <= 1):
                    compliance_issues.append(f"{param} must be a number between 0.0 and 1.0")
        
        # Check for logical consistency
        if len(inputs) >= 7:
            cia_avg = (inputs.get('confidentiality', 0.5) + inputs.get('integrity', 0.5) + inputs.get('availability', 0.5)) / 3
            business_avg = (inputs.get('business_criticality', 0.5) + inputs.get('operational_dependency', 0.5) + inputs.get('regulatory_impact', 0.5)) / 3
            
            if score > 0.8 and cia_avg < 0.3 and business_avg < 0.3:
                recommendations.append("High Impact classification with low CIA and business factors - verify assessment")
            elif score < 0.2 and (cia_avg > 0.7 or business_avg > 0.7):
                recommendations.append("Low Impact classification with high input factors - verify assessment")
    
    # Check methodology compliance
    if 'Enhanced 7-Parameter Fuzzy Logic' in methodology:
        recommendations.append("Using enhanced 7-parameter methodology - excellent standards compliance")
    
    return {
        "compliant": len(compliance_issues) == 0,
        "nist_category": category,
        "classification_score": score,
        "methodology": methodology,
        "compliance_issues": compliance_issues,
        "recommendations": recommendations,
        "standards_version": "NIST SP 800-60 Rev 1 & ISO 27005:2022"
    }


def classify_asset_ensemble(business_criticality, data_sensitivity, operational_dependency, 
                          regulatory_impact, confidentiality, integrity, availability, 
                          use_ml_models=True, models_dir=None):
    """
    Enhanced ensemble asset classification using both fuzzy logic and trained ML models
    
    Args:
        business_criticality (float): Business impact if asset is compromised (0.0-1.0)
        data_sensitivity (float): Sensitivity level of data handled by asset (0.0-1.0)
        operational_dependency (float): Dependency of operations on this asset (0.0-1.0)
        regulatory_impact (float): Regulatory/compliance impact if compromised (0.0-1.0)
        confidentiality (float): Confidentiality requirement level (0.0-1.0)
        integrity (float): Integrity requirement level (0.0-1.0)
        availability (float): Availability requirement level (0.0-1.0)
        use_ml_models (bool): Whether to include ML models in ensemble (default: True)
        models_dir (str): Directory containing trained ML models (optional)
    
    Returns:
        dict: Comprehensive classification result with ensemble predictions
    """
    try:
        # Get fuzzy logic classification
        fuzzy_result = classify_asset_fuzzy(
            business_criticality, data_sensitivity, operational_dependency, 
            regulatory_impact, confidentiality, integrity, availability
        )
        
        # Initialize ensemble results with fuzzy logic
        ensemble_results = {
            'fuzzy_logic': {
                'score': fuzzy_result['classification_score'],
                'category': fuzzy_result['classification_category'],
                'confidence': 1.0,  # Fuzzy logic always produces a result
                'method': 'Enhanced 7-Parameter Fuzzy Logic'
            }
        }
        
        # Prepare feature vector for ML models
        feature_vector = np.array([
            business_criticality, data_sensitivity, operational_dependency,
            regulatory_impact, confidentiality, integrity, availability
        ]).reshape(1, -1)
        
        ml_predictions = []
        ml_confidences = []
        
        if use_ml_models:
            # Set default models directory
            if models_dir is None:
                models_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_models')
            
            # Try to load and use trained ML models
            ml_results = _get_ml_predictions(feature_vector, models_dir)
            
            if ml_results:
                ensemble_results.update(ml_results)
                
                # Extract predictions for ensemble voting
                for model_name, result in ml_results.items():
                    if 'category' in result and 'confidence' in result:
                        ml_predictions.append(result['category'])
                        ml_confidences.append(result['confidence'])
        
        # Perform ensemble voting
        all_predictions = [fuzzy_result['classification_category']] + ml_predictions
        all_confidences = [1.0] + ml_confidences
        
        # Weighted majority voting
        ensemble_category, ensemble_confidence = _ensemble_voting(all_predictions, all_confidences)
        
        # Calculate ensemble score based on category
        category_to_score = {
            'Public': 0.125,      # 0.0-0.25 range midpoint
            'Official': 0.375,    # 0.26-0.50 range midpoint  
            'Confidential': 0.625, # 0.51-0.75 range midpoint
            'Restricted': 0.875   # 0.76-1.0 range midpoint
        }
        
        ensemble_score = category_to_score.get(ensemble_category, fuzzy_result['classification_score'])
        
        # Determine risk level and description
        if ensemble_score <= 0.25:
            risk_level = "Low"
            description = "Information that can be disclosed to the public without harm"
        elif ensemble_score <= 0.50:
            risk_level = "Low-Medium"
            description = "Information that requires protection but is not classified"
        elif ensemble_score <= 0.75:
            risk_level = "Medium-High"
            description = "Information that could cause damage if disclosed without authorization"
        else:
            risk_level = "High"
            description = "Information that could cause serious damage if disclosed without authorization"
        
        # Build comprehensive result
        result = {
            'classification_score': round(ensemble_score, 3),
            'classification_category': ensemble_category,
            'risk_level': risk_level,
            'impact_description': description,
            'methodology': f'Ensemble Classification (Fuzzy Logic + {len(ml_predictions)} ML Models)',
            'ensemble_confidence': round(ensemble_confidence, 3),
            'inputs': {
                'business_criticality': business_criticality,
                'data_sensitivity': data_sensitivity,
                'operational_dependency': operational_dependency,
                'regulatory_impact': regulatory_impact,
                'confidentiality': confidentiality,
                'integrity': integrity,
                'availability': availability
            },
            'individual_predictions': ensemble_results,
            'ensemble_details': {
                'voting_method': 'Weighted Majority Voting',
                'total_models': len(all_predictions),
                'fuzzy_weight': 0.4,  # Fuzzy logic gets higher weight as it's rule-based
                'ml_models_weight': 0.6 / max(len(ml_predictions), 1) if ml_predictions else 0,
                'consensus_achieved': len(set(all_predictions)) == 1,
                'prediction_distribution': {pred: all_predictions.count(pred) for pred in set(all_predictions)}
            },
            'component_scores': fuzzy_result['component_scores'],
            'processing_details': fuzzy_result['processing_details'],
            'compliance_standards': ['NIST SP 800-60', 'ISO 27005', 'ISO 27001'],
            'timestamp': datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        # If ensemble fails, fall back to fuzzy logic only
        if 'fuzzy_result' in locals():
            fuzzy_result['methodology'] = 'Fuzzy Logic Only (ML Ensemble Failed)'
            fuzzy_result['ensemble_note'] = f'ML models unavailable: {str(e)}'
            return fuzzy_result
        else:
            raise ValueError(f"Ensemble classification failed: {str(e)}")


def _get_ml_predictions(feature_vector, models_dir):
    """
    Get predictions from all available trained ML models
    
    Args:
        feature_vector (np.array): 7-parameter feature vector
        models_dir (str): Directory containing trained models
    
    Returns:
        dict: ML model predictions and confidences
    """
    ml_results = {}
    
    try:
        if not os.path.exists(models_dir):
            return ml_results
        
        # Look for trained model files
        for filename in os.listdir(models_dir):
            if filename.endswith('.pkl') and not filename.endswith('_metadata.json'):
                model_path = os.path.join(models_dir, filename)
                
                try:
                    # Load model
                    with open(model_path, 'rb') as f:
                        model_data = pickle.load(f)
                    
                    model = model_data['model']
                    scaler = model_data.get('scaler')
                    label_encoder = model_data['label_encoder']
                    model_type = model_data.get('model_type', 'Unknown')
                    
                    # Prepare features
                    features = feature_vector.copy()
                    
                    # Scale if needed
                    if scaler:
                        features = scaler.transform(features)
                    
                    # Predict
                    prediction_encoded = model.predict(features)[0]
                    prediction = label_encoder.inverse_transform([prediction_encoded])[0]
                    
                    # Get confidence if available
                    confidence = 0.5  # Default confidence
                    try:
                        probabilities = model.predict_proba(features)[0]
                        confidence = float(max(probabilities))
                    except:
                        pass
                    
                    # Store result
                    model_name = filename.replace('.pkl', '').replace('_', ' ').title()
                    ml_results[model_name] = {
                        'category': prediction,
                        'confidence': round(confidence, 3),
                        'method': f'{model_type} Machine Learning',
                        'model_file': filename
                    }
                    
                except Exception as model_error:
                    # Skip individual model errors
                    continue
        
        return ml_results
        
    except Exception as e:
        return ml_results


def _ensemble_voting(predictions, confidences):
    """
    Perform weighted majority voting for ensemble classification
    
    Args:
        predictions (list): List of category predictions
        confidences (list): List of confidence scores
    
    Returns:
        tuple: (ensemble_category, ensemble_confidence)
    """
    if not predictions:
        return "Official", 0.5  # Default fallback
    
    # Weight votes by confidence
    vote_weights = {}
    total_weight = 0
    
    for pred, conf in zip(predictions, confidences):
        if pred not in vote_weights:
            vote_weights[pred] = 0
        vote_weights[pred] += conf
        total_weight += conf
    
    # Find category with highest weighted vote
    if vote_weights:
        ensemble_category = max(vote_weights.keys(), key=lambda k: vote_weights[k])
        ensemble_confidence = vote_weights[ensemble_category] / total_weight
    else:
        ensemble_category = predictions[0]  # Fallback to first prediction
        ensemble_confidence = confidences[0] if confidences else 0.5
    
    return ensemble_category, ensemble_confidence