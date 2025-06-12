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
            # Define input variables
            asset_value = ctrl.Antecedent(np.arange(0, 100001, 1), 'asset_value')
            confidentiality = ctrl.Antecedent(np.arange(0, 11, 1), 'confidentiality')
            integrity = ctrl.Antecedent(np.arange(0, 11, 1), 'integrity')
            availability = ctrl.Antecedent(np.arange(0, 11, 1), 'availability')
            
            # Define output variable
            risk_level = ctrl.Consequent(np.arange(0, 11, 1), 'risk_level')
            
            # Define membership functions for asset value
            asset_value['low'] = fuzz.trimf(asset_value.universe, [0, 0, 25000])
            asset_value['medium'] = fuzz.trimf(asset_value.universe, [20000, 50000, 80000])
            asset_value['high'] = fuzz.trimf(asset_value.universe, [75000, 100000, 100000])
            
            # Define membership functions for CIA triad
            for var in [confidentiality, integrity, availability]:
                var['low'] = fuzz.trimf(var.universe, [0, 0, 3])
                var['medium'] = fuzz.trimf(var.universe, [2, 5, 8])
                var['high'] = fuzz.trimf(var.universe, [7, 10, 10])
            
            # Define membership functions for risk level
            risk_level['low'] = fuzz.trimf(risk_level.universe, [0, 0, 3])
            risk_level['medium'] = fuzz.trimf(risk_level.universe, [2, 5, 8])
            risk_level['high'] = fuzz.trimf(risk_level.universe, [7, 10, 10])
            
            # Define comprehensive fuzzy rules
            rules = []
            
            # High risk rules
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['high'] & integrity['high'], risk_level['high']))
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['high'] & availability['high'], risk_level['high']))
            rules.append(ctrl.Rule(asset_value['high'] & integrity['high'] & availability['high'], risk_level['high']))
            rules.append(ctrl.Rule(confidentiality['high'] & integrity['high'] & availability['high'], risk_level['high']))
            
            # Medium-high risk rules
            rules.append(ctrl.Rule(asset_value['high'] & confidentiality['medium'] & integrity['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['high'] & integrity['high'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['high'] & availability['high'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & integrity['high'] & availability['high'], risk_level['medium']))
            
            # Medium risk rules
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['medium'] & integrity['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['medium'] & confidentiality['medium'] & availability['medium'], risk_level['medium']))
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['high'] & integrity['medium'], risk_level['medium']))
            
            # Low risk rules
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['low'] & integrity['low'], risk_level['low']))
            rules.append(ctrl.Rule(asset_value['low'] & confidentiality['low'] & availability['low'], risk_level['low']))
            rules.append(ctrl.Rule(asset_value['low'] & integrity['low'] & availability['low'], risk_level['low']))
            rules.append(ctrl.Rule(confidentiality['low'] & integrity['low'] & availability['low'], risk_level['low']))
            
            # Create control system
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
            asset_value (float): Asset monetary value
            confidentiality (float): Confidentiality impact (0-10)
            integrity (float): Integrity impact (0-10)
            availability (float): Availability impact (0-10)
        
        Returns:
            float: Predicted risk level (0-10)
        """
        if self.risk_simulation is None:
            # Fallback calculation
            return self._fallback_prediction(asset_value, confidentiality, integrity, availability)
        
        try:
            # Set inputs
            self.risk_simulation.input['asset_value'] = min(asset_value, 100000)
            self.risk_simulation.input['confidentiality'] = min(max(confidentiality, 0), 10)
            self.risk_simulation.input['integrity'] = min(max(integrity, 0), 10)
            self.risk_simulation.input['availability'] = min(max(availability, 0), 10)
            
            # Compute result
            self.risk_simulation.compute()
            
            return round(float(self.risk_simulation.output['risk_level']), 2)
            
        except Exception as e:
            print(f"Error in fuzzy prediction: {e}")
            return self._fallback_prediction(asset_value, confidentiality, integrity, availability)
    
    def _fallback_prediction(self, asset_value, confidentiality, integrity, availability):
        """Fallback prediction method when fuzzy logic fails."""
        # Normalize asset value
        normalized_value = min(asset_value / 100000, 1.0)
        
        # Normalize CIA values
        normalized_c = min(max(confidentiality / 10, 0), 1.0)
        normalized_i = min(max(integrity / 10, 0), 1.0)
        normalized_a = min(max(availability / 10, 0), 1.0)
        
        # Weighted combination
        risk_score = (
            normalized_value * 0.3 +
            normalized_c * 0.25 +
            normalized_i * 0.25 +
            normalized_a * 0.2
        ) * 10
        
        return round(risk_score, 2)
    
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
        Convert numeric risk level to categorical risk.
        
        Args:
            risk_level (float): Numeric risk level (0-10)
        
        Returns:
            str: Risk category (Low, Medium, High)
        """
        if risk_level <= 3:
            return "Low"
        elif risk_level <= 7:
            return "Medium"
        else:
            return "High"
    
    def explain_prediction(self, asset_value, confidentiality, integrity, availability):
        """
        Provide explanation for the risk prediction.
        
        Args:
            asset_value (float): Asset monetary value
            confidentiality (float): Confidentiality impact (0-10)
            integrity (float): Integrity impact (0-10)
            availability (float): Availability impact (0-10)
        
        Returns:
            dict: Explanation of the prediction
        """
        risk_level = self.predict(asset_value, confidentiality, integrity, availability)
        risk_category = self.get_risk_category(risk_level)
        
        # Analyze contributing factors
        factors = []
        
        if asset_value > 75000:
            factors.append("High asset value increases risk")
        elif asset_value < 25000:
            factors.append("Low asset value reduces risk")
        else:
            factors.append("Medium asset value has moderate risk impact")
        
        if confidentiality > 7:
            factors.append("High confidentiality impact increases risk")
        elif confidentiality < 3:
            factors.append("Low confidentiality impact reduces risk")
        
        if integrity > 7:
            factors.append("High integrity impact increases risk")
        elif integrity < 3:
            factors.append("Low integrity impact reduces risk")
        
        if availability > 7:
            factors.append("High availability impact increases risk")
        elif availability < 3:
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