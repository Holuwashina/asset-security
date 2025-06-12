"""
Asset classification utilities using fuzzy logic
"""
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl


def classify_asset(asset_value, department_impact):
    """
    Classify an asset using fuzzy logic based on asset value and department impact.
    
    Args:
        asset_value (float): The monetary value of the asset
        department_impact (float): The impact on department operations (0-1 scale)
    
    Returns:
        float: Classification value between 0 and 1
    """
    try:
        # Define fuzzy variables (using 0-1 scale)
        asset_val = ctrl.Antecedent(np.arange(0, 100001, 1), 'asset_value')
        dept_impact = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'department_impact')
        classification = ctrl.Consequent(np.arange(0, 1.01, 0.01), 'classification')
        
        # Define membership functions for asset value
        asset_val['low'] = fuzz.trimf(asset_val.universe, [0, 0, 25000])
        asset_val['medium'] = fuzz.trimf(asset_val.universe, [20000, 50000, 80000])
        asset_val['high'] = fuzz.trimf(asset_val.universe, [75000, 100000, 100000])
        
        # Define membership functions for department impact (0-1 scale)
        dept_impact['low'] = fuzz.trimf(dept_impact.universe, [0, 0, 0.3])
        dept_impact['medium'] = fuzz.trimf(dept_impact.universe, [0.2, 0.5, 0.8])
        dept_impact['high'] = fuzz.trimf(dept_impact.universe, [0.7, 1.0, 1.0])
        
        # Define membership functions for classification (0-1 scale)
        classification['low'] = fuzz.trimf(classification.universe, [0, 0, 0.3])
        classification['medium'] = fuzz.trimf(classification.universe, [0.2, 0.5, 0.8])
        classification['high'] = fuzz.trimf(classification.universe, [0.7, 1.0, 1.0])
        
        # Define fuzzy rules
        rule1 = ctrl.Rule(asset_val['low'] & dept_impact['low'], classification['low'])
        rule2 = ctrl.Rule(asset_val['low'] & dept_impact['medium'], classification['low'])
        rule3 = ctrl.Rule(asset_val['low'] & dept_impact['high'], classification['medium'])
        rule4 = ctrl.Rule(asset_val['medium'] & dept_impact['low'], classification['low'])
        rule5 = ctrl.Rule(asset_val['medium'] & dept_impact['medium'], classification['medium'])
        rule6 = ctrl.Rule(asset_val['medium'] & dept_impact['high'], classification['high'])
        rule7 = ctrl.Rule(asset_val['high'] & dept_impact['low'], classification['medium'])
        rule8 = ctrl.Rule(asset_val['high'] & dept_impact['medium'], classification['high'])
        rule9 = ctrl.Rule(asset_val['high'] & dept_impact['high'], classification['high'])
        
        # Create control system
        classification_ctrl = ctrl.ControlSystem([
            rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9
        ])
        
        # Create simulation
        classification_sim = ctrl.ControlSystemSimulation(classification_ctrl)
        
        # Set inputs
        classification_sim.input['asset_value'] = min(asset_value, 100000)
        classification_sim.input['department_impact'] = min(max(department_impact, 0), 10)
        
        # Compute result
        classification_sim.compute()
        
        return round(float(classification_sim.output['classification']), 2)
        
    except Exception as e:
        # Fallback to simple calculation if fuzzy logic fails
        normalized_value = min(asset_value / 100000, 1.0)
        normalized_impact = min(max(department_impact / 10, 0), 1.0)
        return round((normalized_value * 0.6 + normalized_impact * 0.4) * 10, 2)