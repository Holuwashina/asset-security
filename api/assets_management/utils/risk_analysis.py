"""
Risk analysis utilities for mathematical risk calculations
"""
import math


def calculate_risk_level(risk_index):
    """
    Calculate risk level using mathematical formula based on risk index.
    
    Args:
        risk_index (float): Risk index value (0-1 scale)
    
    Returns:
        dict: Risk analysis with level, score, and recommendations
    """
    try:
        # Ensure risk_index is within valid range
        risk_index = min(max(float(risk_index), 0), 1)
        
        # Calculate risk score using logarithmic scaling
        if risk_index == 0:
            risk_score = 0
        else:
            # Use logarithmic scaling to provide better differentiation (scale to 0-1)
            risk_score = min(risk_index * (1 + math.log10(risk_index * 10 + 1)) / 10, 1)
        
        # Determine risk level based on score (0-1 scale)
        if risk_score <= 0.25:
            risk_level = "Low"
            priority = "Low"
            recommendations = [
                "Monitor asset regularly",
                "Maintain current security measures",
                "Review security annually"
            ]
        elif risk_score <= 0.5:
            risk_level = "Medium"
            priority = "Medium"
            recommendations = [
                "Implement additional security controls",
                "Increase monitoring frequency",
                "Conduct quarterly security reviews",
                "Consider backup and recovery procedures"
            ]
        elif risk_score <= 0.75:
            risk_level = "High"
            priority = "High"
            recommendations = [
                "Immediate security assessment required",
                "Implement comprehensive security controls",
                "Daily monitoring and alerts",
                "Develop incident response plan",
                "Consider asset isolation or segmentation"
            ]
        else:
            risk_level = "Critical"
            priority = "Critical"
            recommendations = [
                "Emergency security measures required",
                "Immediate isolation if necessary",
                "Continuous monitoring",
                "Executive notification required",
                "Comprehensive incident response plan",
                "Consider asset replacement or upgrade"
            ]
        
        # Calculate additional metrics
        vulnerability_factor = min(risk_score / 10, 1.0)
        threat_probability = min((risk_score * 0.8) / 10, 1.0)
        impact_severity = min((risk_score * 1.2) / 10, 1.0)
        
        return {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2),
            "risk_index": round(risk_index, 2),
            "priority": priority,
            "vulnerability_factor": round(vulnerability_factor, 3),
            "threat_probability": round(threat_probability, 3),
            "impact_severity": round(impact_severity, 3),
            "recommendations": recommendations,
            "risk_matrix": {
                "probability": _get_probability_rating(threat_probability),
                "impact": _get_impact_rating(impact_severity),
                "overall": risk_level
            }
        }
        
    except Exception as e:
        # Fallback response
        return {
            "risk_level": "Unknown",
            "risk_score": 0,
            "risk_index": 0,
            "priority": "Medium",
            "vulnerability_factor": 0.5,
            "threat_probability": 0.5,
            "impact_severity": 0.5,
            "recommendations": ["Manual risk assessment required"],
            "risk_matrix": {
                "probability": "Medium",
                "impact": "Medium",
                "overall": "Unknown"
            },
            "error": str(e)
        }


def _get_probability_rating(probability):
    """Get probability rating based on numeric value."""
    if probability <= 0.2:
        return "Very Low"
    elif probability <= 0.4:
        return "Low"
    elif probability <= 0.6:
        return "Medium"
    elif probability <= 0.8:
        return "High"
    else:
        return "Very High"


def _get_impact_rating(impact):
    """Get impact rating based on numeric value."""
    if impact <= 0.2:
        return "Minimal"
    elif impact <= 0.4:
        return "Minor"
    elif impact <= 0.6:
        return "Moderate"
    elif impact <= 0.8:
        return "Major"
    else:
        return "Severe"


def calculate_risk_mitigation_priority(risk_analysis):
    """
    Calculate mitigation priority based on risk analysis.
    
    Args:
        risk_analysis (dict): Risk analysis results
    
    Returns:
        dict: Mitigation priority information
    """
    risk_score = risk_analysis.get("risk_score", 0)
    
    if risk_score >= 7.5:
        return {
            "priority": "Immediate",
            "timeframe": "Within 24 hours",
            "resources": "High",
            "escalation": "Executive level"
        }
    elif risk_score >= 5.0:
        return {
            "priority": "High",
            "timeframe": "Within 1 week",
            "resources": "Medium-High",
            "escalation": "Management level"
        }
    elif risk_score >= 2.5:
        return {
            "priority": "Medium",
            "timeframe": "Within 1 month",
            "resources": "Medium",
            "escalation": "Department level"
        }
    else:
        return {
            "priority": "Low",
            "timeframe": "Within 3 months",
            "resources": "Low",
            "escalation": "Team level"
        }