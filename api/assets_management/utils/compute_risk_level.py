"""
Risk level computation utilities using fuzzy logic
"""
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def compute_risk_level(confidentiality, integrity, availability, classification_value):
    """
    Compute risk level using fuzzy logic based on CIA triad and asset classification.
    
    Args:
        confidentiality (float): Confidentiality impact (0-1 scale)
        integrity (float): Integrity impact (0-1 scale)
        availability (float): Availability impact (0-1 scale)
        classification_value (float): Asset classification value (0-1 scale)
    
    Returns:
        float: Risk index between 0 and 1
    """
    try:
        # Define fuzzy variables (0-1 scale)
        conf = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'confidentiality')
        integ = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'integrity')
        avail = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'availability')
        classif = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'classification')
        risk_index = ctrl.Consequent(np.arange(0, 1.01, 0.01), 'risk_index')
        
        # Define membership functions for CIA triad (0-1 scale)
        for var in [conf, integ, avail, classif]:
            var['low'] = fuzz.trimf(var.universe, [0, 0, 0.3])
            var['medium'] = fuzz.trimf(var.universe, [0.2, 0.5, 0.8])
            var['high'] = fuzz.trimf(var.universe, [0.7, 1.0, 1.0])
        
        # Define membership functions for risk index (0-1 scale)
        risk_index['low'] = fuzz.trimf(risk_index.universe, [0, 0, 0.3])
        risk_index['medium'] = fuzz.trimf(risk_index.universe, [0.2, 0.5, 0.8])
        risk_index['high'] = fuzz.trimf(risk_index.universe, [0.7, 1.0, 1.0])
        
        # Define comprehensive fuzzy rules
        rules = []
        
        # High risk scenarios
        rules.append(ctrl.Rule(conf['high'] & integ['high'] & avail['high'], risk_index['high']))
        rules.append(ctrl.Rule(conf['high'] & integ['high'] & classif['high'], risk_index['high']))
        rules.append(ctrl.Rule(integ['high'] & avail['high'] & classif['high'], risk_index['high']))
        rules.append(ctrl.Rule(conf['high'] & avail['high'] & classif['high'], risk_index['high']))
        
        # Medium-high risk scenarios
        rules.append(ctrl.Rule(conf['high'] & integ['medium'] & avail['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(conf['medium'] & integ['high'] & avail['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(conf['medium'] & integ['medium'] & avail['high'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['high'] & conf['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['high'] & integ['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['high'] & avail['medium'], risk_index['medium']))
        
        # Medium risk scenarios
        rules.append(ctrl.Rule(conf['medium'] & integ['medium'] & avail['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['medium'] & conf['medium'] & integ['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['medium'] & conf['medium'] & avail['medium'], risk_index['medium']))
        rules.append(ctrl.Rule(classif['medium'] & integ['medium'] & avail['medium'], risk_index['medium']))
        
        # Low risk scenarios
        rules.append(ctrl.Rule(conf['low'] & integ['low'] & avail['low'], risk_index['low']))
        rules.append(ctrl.Rule(classif['low'] & conf['low'], risk_index['low']))
        rules.append(ctrl.Rule(classif['low'] & integ['low'], risk_index['low']))
        rules.append(ctrl.Rule(classif['low'] & avail['low'], risk_index['low']))
        
        # Create control system
        risk_ctrl = ctrl.ControlSystem(rules)
        
        # Create simulation
        risk_sim = ctrl.ControlSystemSimulation(risk_ctrl)
        
        # Set inputs (ensure they're within valid range 0-1)
        risk_sim.input['confidentiality'] = min(max(confidentiality, 0), 1.0)
        risk_sim.input['integrity'] = min(max(integrity, 0), 1.0)
        risk_sim.input['availability'] = min(max(availability, 0), 1.0)
        risk_sim.input['classification'] = min(max(classification_value, 0), 1.0)
        
        # Compute result
        risk_sim.compute()
        
        return round(float(risk_sim.output['risk_index']), 3)
        
    except Exception as e:
        print(f"Fuzzy risk computation error: {e}")
        # Fallback to weighted average using 0-1 scale
        weights = [0.25, 0.25, 0.25, 0.25]  # Equal weights for CIA and classification
        values = [
            min(max(confidentiality, 0), 1.0),
            min(max(integrity, 0), 1.0),
            min(max(availability, 0), 1.0),
            min(max(classification_value, 0), 1.0)
        ]
        return round(sum(w * v for w, v in zip(weights, values)), 3)