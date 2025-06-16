"""
Fuzzy Direct Risk Classifier for asset risk assessment
"""
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


class FuzzyDirectRiskClassifier:
    """
    Direct fuzzy logic classifier for risk assessment without training data
    """
    
    def __init__(self):
        self.risk_system = None
        self.risk_simulation = None
        self._setup_fuzzy_system()
    
    def _setup_fuzzy_system(self):
        """Set up the fuzzy logic system for risk classification."""
        try:
            # Define input variables (ALL 0-1 SCALE for consistency)
            asset_value = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'asset_value')
            confidentiality = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'confidentiality')
            integrity = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'integrity')
            availability = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'availability')
            
            risk_level = ctrl.Consequent(np.arange(0, 1.01, 0.01), 'risk_level')
            
            asset_value['low'] = fuzz.trimf(asset_value.universe, [0, 0, 0.3])
            asset_value['medium'] = fuzz.trimf(asset_value.universe, [0.2, 0.5, 0.8])
            asset_value['high'] = fuzz.trimf(asset_value.universe, [0.7, 1.0, 1.0])
            
            for var in [confidentiality, integrity, availability]:
                var['low'] = fuzz.trimf(var.universe, [0, 0, 0.3])
                var['medium'] = fuzz.trimf(var.universe, [0.2, 0.5, 0.8])
                var['high'] = fuzz.trimf(var.universe, [0.7, 1.0, 1.0])
            
            risk_level['low'] = fuzz.trimf(risk_level.universe, [0, 0, 0.3])
            risk_level['medium'] = fuzz.trimf(risk_level.universe, [0.2, 0.5, 0.8])
            risk_level['high'] = fuzz.trimf(risk_level.universe, [0.7, 1.0, 1.0])
            
            rules = []
            
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['high'] & integrity['high'], risk_level['high']))
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['high'] & availability['high'], risk_level['high']))
            rules.append(ctrl.Rule(asset_value['high'] & integrity['high'] & availability['high'], risk_level['high']))
            rules.append(ctrl.Rule(confidentiality['high'] & integrity['high'] & availability['high'], risk_level['high']))
            
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['medium'] & integrity['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['high'] & integrity['high'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['high'] & availability['high'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & integrity['high'] & availability['high'], risk_level['medium']))
            
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['medium'] & integrity['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['medium'] & availability['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['high'] & integrity['medium'], risk_level['medium']))
            
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['low'] & integrity['low'], risk_level['low']))
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['low'] & availability['low'], risk_level['low']))
            rules.append(ctrl.Rule(asset_value['low'] & integrity['low'] & availability['low'], risk_level['low']))
            rules.append(ctrl.Rule(confidentiality['low'] & integrity['low'] & availability['low'], risk_level['low']))
            
            self.risk_system = ctrl.ControlSystem(rules)
            self.risk_simulation = ctrl.ControlSystemSimulation(self.risk_system)
            
        except Exception as e:
            print(f"Error setting up fuzzy system: {e}")
            self.risk_system = None
            self.risk_simulation = None
    
    def predict(self, asset_value, confidentiality, integrity, availability):
        """
        Predict risk level using fuzzy logic.
        
        Args:
            asset_value (float): Asset value (0-1 scale)
            confidentiality (float): Confidentiality impact (0-1 scale)
            integrity (float): Integrity impact (0-1 scale)
            availability (float): Availability impact (0-1 scale)
        
        Returns:
            float: Predicted risk level (0-1 scale)
        """
        if self.risk_simulation is None:
            # Fallback calculation
            return self._fallback_prediction(asset_value, confidentiality, integrity, availability)
        
        try:
            # Set inputs (all 0-1 scale)
            self.risk_simulation.input['asset_value'] = min(max(asset_value, 0), 1.0)
            self.risk_simulation.input['confidentiality'] = min(max(confidentiality, 0), 1.0)
            self.risk_simulation.input['integrity'] = min(max(integrity, 0), 1.0)
            self.risk_simulation.input['availability'] = min(max(availability, 0), 1.0)
            
            self.risk_simulation.compute()
            
            return round(float(self.risk_simulation.output['risk_level']), 3)
            
        except Exception as e:
            print(f"Error in fuzzy prediction: {e}")
            return self._fallback_prediction(asset_value, confidentiality, integrity, availability)
    
    def _fallback_prediction(self, asset_value, confidentiality, integrity, availability):
        """Fallback prediction method when fuzzy logic fails (0-1 scale)."""
        # All inputs are already 0-1 scale, just validate
        normalized_value = min(max(asset_value, 0), 1.0)
        normalized_c = min(max(confidentiality, 0), 1.0)
        normalized_i = min(max(integrity, 0), 1.0)
        normalized_a = min(max(availability, 0), 1.0)
        
        risk_score = (
            normalized_value * 0.3 +
            normalized_c * 0.25 +
            normalized_i * 0.25 +
            normalized_a * 0.2
        )
        
        return round(risk_score, 3)
    
    def predict_batch(self, data):
        """
        Predict risk levels for a batch of assets.
        
        Args:
            data (list): List of dictionaries with keys: asset_value, confidentiality, integrity, availability
        
        Returns:
            list: List of predicted risk levels
        """
        predictions = []
        
        for item in data:
            try:
                prediction = self.predict(
                    item.get('asset_value', 0),
                    item.get('confidentiality', 0),
                    item.get('integrity', 0),
                    item.get('availability', 0)
                )
                predictions.append(prediction)
            except Exception as e:
                print(f"Error predicting for item {item}: {e}")
                predictions.append(0.0)
        
        return predictions
    
    def get_risk_category(self, risk_level):
        """
        Convert numeric risk level to government classification level.
        
        Args:
            risk_level (float): Numeric risk level (0-1 scale)
        
        Returns:
            str: Classification category (Public, Official, Confidential, Restricted)
        """
        if risk_level <= 0.25:
            return "Public"
        elif risk_level <= 0.50:
            return "Official"
        elif risk_level <= 0.75:
            return "Confidential"
        else:
            return "Restricted"
    
    def explain_prediction(self, asset_value, confidentiality, integrity, availability):
        """
        Provide explanation for the risk prediction.
        
        Args:
            asset_value (float): Asset value (0-1 scale)
            confidentiality (float): Confidentiality impact (0-1 scale)
            integrity (float): Integrity impact (0-1 scale)
            availability (float): Availability impact (0-1 scale)
        
        Returns:
            dict: Explanation of the prediction
        """
        risk_level = self.predict(asset_value, confidentiality, integrity, availability)
        risk_category = self.get_risk_category(risk_level)
        
        factors = []
        
        if asset_value > 0.75:
            factors.append("High asset value increases risk")
        elif asset_value < 0.25:
            factors.append("Low asset value reduces risk")
        else:
            factors.append("Medium asset value has moderate risk impact")
        
        if confidentiality > 0.7:
            factors.append("High confidentiality impact increases risk")
        elif confidentiality < 0.3:
            factors.append("Low confidentiality impact reduces risk")
        
        if integrity > 0.7:
            factors.append("High integrity impact increases risk")
        elif integrity < 0.3:
            factors.append("Low integrity impact reduces risk")
        
        if availability > 0.7:
            factors.append("High availability impact increases risk")
        elif availability < 0.3:
            factors.append("Low availability impact reduces risk")
        
        return {
            "risk_level": risk_level,
            "risk_category": risk_category,
            "contributing_factors": factors,
            "inputs": {
                "asset_value": asset_value,
                "confidentiality": confidentiality,
                "integrity": integrity,
                "availability": availability
            }
        }


def classify_risk_level(confidentiality, integrity, availability, asset_value=0.5):
    """
    Standalone function to classify impact level using fuzzy logic.
    This provides backward compatibility and easy access for model comparison.
    
    Args:
        confidentiality (float): Confidentiality impact (0-1 scale)
        integrity (float): Integrity impact (0-1 scale)
        availability (float): Availability impact (0-1 scale)
        asset_value (float): Asset value (0-1 scale, default: 0.5)
    
    Returns:
        str: Impact category ('Low Impact', 'Moderate Impact', 'High Impact')
    """
    try:
        # Initialize fuzzy classifier
        classifier = FuzzyDirectRiskClassifier()
        
        confidentiality = min(max(confidentiality, 0), 1.0)
        integrity = min(max(integrity, 0), 1.0)
        availability = min(max(availability, 0), 1.0)
        asset_value = min(max(asset_value, 0), 1.0)
            
        risk_level = classifier.predict(asset_value, confidentiality, integrity, availability)
        
        return classifier.get_risk_category(risk_level)
        
    except Exception as e:
        # No fallback - raise the error to ensure proper fuzzy logic implementation
        raise ValueError(f"Fuzzy risk classification failed: {str(e)}. Please check input parameters and fuzzy system configuration.")