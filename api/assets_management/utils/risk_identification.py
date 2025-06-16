"""
Enhanced Risk Identification Utilities
Implements multiple standardized methodologies:
- ISO 27005:2022 (existing implementation)
- NIST SP 800-30 Rev 1 
- OCTAVE (Operationally Critical Threat, Asset, and Vulnerability Evaluation)
- Integrated Multi-Framework Approach

Provides comprehensive risk identification following industry best practices
"""
import math
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Union
from dataclasses import dataclass
from enum import Enum


class RiskMethodology(Enum):
    """Supported Risk Identification Methodologies"""
    ISO_27005 = "iso_27005"
    NIST_SP_800_30 = "nist_sp_800_30"
    OCTAVE = "octave"
    INTEGRATED = "integrated"


@dataclass
class ThreatScenario:
    """Represents a threat scenario for event-based risk identification"""
    threat_id: str
    threat_name: str
    threat_source: str
    threat_category: str
    likelihood: float
    impact_confidentiality: float
    impact_integrity: float
    impact_availability: float
    description: str


@dataclass
class StandardizedRiskResult:
    """Unified result structure for all methodologies"""
    asset_id: str
    methodology: RiskMethodology
    risk_score: float  # 0-1 scale
    risk_level: str    # Very Low, Low, Moderate, High, Very High
    likelihood: float
    impact: float
    threats_identified: List[Dict]
    vulnerabilities_identified: List[Dict]
    recommendations: List[str]
    compliance_frameworks: List[str]
    assessment_timestamp: datetime
    additional_data: Dict


@dataclass
class RiskIdentificationResult:
    """Standardized result structure for risk identification (backward compatibility)"""
    asset_id: str
    risk_index: float
    likelihood: float
    probability_of_harm: float
    identified_threats: List[ThreatScenario]
    vulnerabilities: List[str]
    methodology: str
    iso27005_compliant: bool
    timestamp: datetime


class ISO27005RiskIdentification:
    """
    ISO 27005:2022 compliant risk identification framework
    Implements both asset-based and event-based approaches
    """
    
    # ISO 27005 Standard Threat Categories
    THREAT_CATEGORIES = {
        'physical': 'Physical and Environmental Threats',
        'technical': 'Technical Threats',
        'human': 'Human Threats',
        'organizational': 'Organizational Threats'
    }
    
    # Common threat scenarios based on ISO 27005 Annex C
    STANDARD_THREATS = [
        ThreatScenario(
            threat_id="T001",
            threat_name="Unauthorized Access",
            threat_source="External Attacker",
            threat_category="technical",
            likelihood=0.6,
            impact_confidentiality=0.8,
            impact_integrity=0.3,
            impact_availability=0.2,
            description="Unauthorized individuals gaining access to information systems"
        ),
        ThreatScenario(
            threat_id="T002",
            threat_name="Data Breach",
            threat_source="Internal/External",
            threat_category="technical",
            likelihood=0.4,
            impact_confidentiality=0.9,
            impact_integrity=0.7,
            impact_availability=0.3,
            description="Unauthorized disclosure of sensitive information"
        ),
        ThreatScenario(
            threat_id="T003",
            threat_name="System Failure",
            threat_source="Technical Failure",
            threat_category="technical",
            likelihood=0.3,
            impact_confidentiality=0.1,
            impact_integrity=0.6,
            impact_availability=0.9,
            description="Hardware or software system failures affecting availability"
        ),
        ThreatScenario(
            threat_id="T004",
            threat_name="Malware Attack",
            threat_source="External Attacker",
            threat_category="technical",
            likelihood=0.7,
            impact_confidentiality=0.6,
            impact_integrity=0.8,
            impact_availability=0.7,
            description="Malicious software compromising system integrity and availability"
        ),
        ThreatScenario(
            threat_id="T005",
            threat_name="Insider Threat",
            threat_source="Internal Employee",
            threat_category="human",
            likelihood=0.2,
            impact_confidentiality=0.8,
            impact_integrity=0.7,
            impact_availability=0.4,
            description="Malicious or negligent actions by authorized personnel"
        ),
        ThreatScenario(
            threat_id="T006",
            threat_name="Natural Disaster",
            threat_source="Environmental",
            threat_category="physical",
            likelihood=0.1,
            impact_confidentiality=0.2,
            impact_integrity=0.3,
            impact_availability=0.9,
            description="Natural disasters affecting physical infrastructure"
        )
    ]
    
    def __init__(self):
        self.threats = self.STANDARD_THREATS.copy()
    
    def asset_based_identification(
        self,
        asset_id: str,
        confidentiality: float,
        integrity: float,
        availability: float,
        classification_value: float,
        asset_category: str = None,
        industry_sector: str = None
    ) -> RiskIdentificationResult:
        """
        ISO 27005 Asset-based risk identification approach
        
        Args:
            asset_id: Unique asset identifier
            confidentiality: CIA confidentiality score (0-1)
            integrity: CIA integrity score (0-1)
            availability: CIA availability score (0-1)
            classification_value: Asset classification score (0-1)
            asset_category: Optional asset category for threat filtering
            industry_sector: Optional industry for threat customization
            
        Returns:
            RiskIdentificationResult with comprehensive risk assessment
        """
        # Step 1: Calculate base risk index using fuzzy logic (existing implementation)
        from .compute_risk_level import compute_risk_level
        risk_index = compute_risk_level(confidentiality, integrity, availability, classification_value)
        
        # Step 2: Identify relevant threats based on asset characteristics
        relevant_threats = self._identify_asset_threats(
            confidentiality, integrity, availability, asset_category, industry_sector
        )
        
        # Step 3: Identify vulnerabilities based on CIA scores
        vulnerabilities = self._identify_vulnerabilities(confidentiality, integrity, availability)
        
        # Step 4: Calculate likelihood based on threat landscape and asset exposure
        likelihood = self._calculate_asset_likelihood(
            confidentiality, integrity, availability, relevant_threats
        )
        
        # Step 5: Calculate probability of harm (ISO 27005 requirement)
        probability_of_harm = self._calculate_probability_of_harm(
            risk_index, likelihood, relevant_threats
        )
        
        return RiskIdentificationResult(
            asset_id=asset_id,
            risk_index=risk_index,
            likelihood=likelihood,
            probability_of_harm=probability_of_harm,
            identified_threats=relevant_threats,
            vulnerabilities=vulnerabilities,
            methodology="ISO 27005:2022 Asset-based Risk Identification",
            iso27005_compliant=True,
            timestamp=datetime.now()
        )
    
    def event_based_identification(
        self,
        asset_id: str,
        threat_scenarios: List[str] = None,
        organizational_context: Dict = None
    ) -> RiskIdentificationResult:
        """
        ISO 27005 Event-based risk identification approach
        Focuses on threat scenarios and their potential consequences
        
        Args:
            asset_id: Unique asset identifier
            threat_scenarios: List of specific threat scenario IDs to evaluate
            organizational_context: Context about organization (industry, size, etc.)
            
        Returns:
            RiskIdentificationResult with event-based risk assessment
        """
        # Step 1: Select relevant threat scenarios
        if threat_scenarios:
            relevant_threats = [t for t in self.threats if t.threat_id in threat_scenarios]
        else:
            relevant_threats = self._select_contextual_threats(organizational_context)
        
        # Step 2: Calculate aggregate risk metrics from threat scenarios
        risk_metrics = self._calculate_event_based_metrics(relevant_threats)
        
        # Step 3: Identify systemic vulnerabilities from threat analysis
        vulnerabilities = self._identify_systemic_vulnerabilities(relevant_threats)
        
        return RiskIdentificationResult(
            asset_id=asset_id,
            risk_index=risk_metrics['risk_index'],
            likelihood=risk_metrics['likelihood'],
            probability_of_harm=risk_metrics['probability_of_harm'],
            identified_threats=relevant_threats,
            vulnerabilities=vulnerabilities,
            methodology="ISO 27005:2022 Event-based Risk Identification",
            iso27005_compliant=True,
            timestamp=datetime.now()
        )
    
    def hybrid_identification(
        self,
        asset_id: str,
        confidentiality: float,
        integrity: float,
        availability: float,
        classification_value: float,
        threat_scenarios: List[str] = None,
        organizational_context: Dict = None
    ) -> RiskIdentificationResult:
        """
        Combined asset-based and event-based risk identification
        Provides the most comprehensive risk assessment per ISO 27005:2022
        """
        # Perform both approaches
        asset_result = self.asset_based_identification(
            asset_id, confidentiality, integrity, availability, classification_value
        )
        
        event_result = self.event_based_identification(
            asset_id, threat_scenarios, organizational_context
        )
        
        # Combine results using weighted approach
        combined_risk_index = (asset_result.risk_index * 0.6) + (event_result.risk_index * 0.4)
        combined_likelihood = (asset_result.likelihood * 0.6) + (event_result.likelihood * 0.4)
        combined_probability = (asset_result.probability_of_harm * 0.6) + (event_result.probability_of_harm * 0.4)
        
        # Merge threat lists (remove duplicates)
        all_threats = asset_result.identified_threats + [
            t for t in event_result.identified_threats 
            if t.threat_id not in [at.threat_id for at in asset_result.identified_threats]
        ]
        
        # Merge vulnerability lists
        all_vulnerabilities = list(set(asset_result.vulnerabilities + event_result.vulnerabilities))
        
        return RiskIdentificationResult(
            asset_id=asset_id,
            risk_index=round(combined_risk_index, 3),
            likelihood=round(combined_likelihood, 3),
            probability_of_harm=round(combined_probability, 3),
            identified_threats=all_threats,
            vulnerabilities=all_vulnerabilities,
            methodology="ISO 27005:2022 Hybrid Risk Identification (Asset-based + Event-based)",
            iso27005_compliant=True,
            timestamp=datetime.now()
        )
    
    def _identify_asset_threats(
        self, 
        confidentiality: float, 
        integrity: float, 
        availability: float,
        asset_category: str = None,
        industry_sector: str = None
    ) -> List[ThreatScenario]:
        """Identify threats relevant to specific asset characteristics"""
        relevant_threats = []
        
        for threat in self.threats:
            # Calculate threat relevance based on CIA impact alignment
            relevance_score = (
                threat.impact_confidentiality * confidentiality +
                threat.impact_integrity * integrity +
                threat.impact_availability * availability
            ) / 3
            
            # Include threats with relevance above threshold
            if relevance_score >= 0.3:
                relevant_threats.append(threat)
        
        return relevant_threats
    
    def _identify_vulnerabilities(
        self, 
        confidentiality: float, 
        integrity: float, 
        availability: float
    ) -> List[str]:
        """Identify vulnerabilities based on CIA assessment"""
        vulnerabilities = []
        
        if confidentiality < 0.5:
            vulnerabilities.extend([
                "Weak access controls",
                "Insufficient data encryption",
                "Inadequate user authentication"
            ])
        
        if integrity < 0.5:
            vulnerabilities.extend([
                "Lack of data validation",
                "Insufficient change management",
                "Weak data integrity controls"
            ])
        
        if availability < 0.5:
            vulnerabilities.extend([
                "Single points of failure",
                "Inadequate backup systems",
                "Insufficient redundancy"
            ])
        
        return vulnerabilities
    
    def _calculate_asset_likelihood(
        self, 
        confidentiality: float, 
        integrity: float, 
        availability: float,
        threats: List[ThreatScenario]
    ) -> float:
        """Calculate likelihood based on asset exposure and threat landscape"""
        if not threats:
            return 0.0
        
        # Base likelihood from CIA scores (higher scores = higher exposure)
        base_likelihood = (confidentiality + integrity + availability) / 3
        
        # Adjust based on threat likelihood
        threat_likelihood = sum(t.likelihood for t in threats) / len(threats)
        
        # Combined likelihood using ISO 27005 approach
        combined_likelihood = min((base_likelihood * 0.4) + (threat_likelihood * 0.6), 1.0)
        
        return round(combined_likelihood, 3)
    
    def _calculate_probability_of_harm(
        self, 
        risk_index: float, 
        likelihood: float, 
        threats: List[ThreatScenario]
    ) -> float:
        """Calculate probability of harm per ISO 27005 methodology"""
        if not threats:
            return risk_index
        
        # Average impact across all CIA dimensions for identified threats
        avg_impact = sum(
            (t.impact_confidentiality + t.impact_integrity + t.impact_availability) / 3
            for t in threats
        ) / len(threats)
        
        # ISO 27005 probability of harm formula
        probability_of_harm = min(likelihood * avg_impact * (1 + risk_index * 0.2), 1.0)
        
        return round(probability_of_harm, 3)
    
    def _select_contextual_threats(self, organizational_context: Dict = None) -> List[ThreatScenario]:
        """Select threats based on organizational context"""
        if not organizational_context:
            return self.threats
        
        # Filter threats based on industry, size, etc.
        # This is a simplified implementation - can be expanded based on specific needs
        relevant_threats = []
        
        industry = organizational_context.get('industry_sector', '').lower()
        
        # Industry-specific threat prioritization
        if 'financial' in industry or 'banking' in industry:
            # Financial sector faces higher cyber threats
            relevant_threats = [t for t in self.threats if t.threat_category in ['technical', 'human']]
        elif 'healthcare' in industry:
            # Healthcare faces data privacy and availability threats
            relevant_threats = [t for t in self.threats if 'data' in t.threat_name.lower() or 'system' in t.threat_name.lower()]
        else:
            # Default to all threats
            relevant_threats = self.threats
        
        return relevant_threats
    
    def _calculate_event_based_metrics(self, threats: List[ThreatScenario]) -> Dict[str, float]:
        """Calculate risk metrics from threat scenarios"""
        if not threats:
            return {'risk_index': 0.0, 'likelihood': 0.0, 'probability_of_harm': 0.0}
        
        # Aggregate threat likelihoods
        avg_likelihood = sum(t.likelihood for t in threats) / len(threats)
        
        # Calculate composite impact
        avg_confidentiality_impact = sum(t.impact_confidentiality for t in threats) / len(threats)
        avg_integrity_impact = sum(t.impact_integrity for t in threats) / len(threats)
        avg_availability_impact = sum(t.impact_availability for t in threats) / len(threats)
        
        # Risk index from threat analysis
        risk_index = (avg_confidentiality_impact + avg_integrity_impact + avg_availability_impact) / 3
        
        # Probability of harm
        probability_of_harm = min(avg_likelihood * risk_index, 1.0)
        
        return {
            'risk_index': round(risk_index, 3),
            'likelihood': round(avg_likelihood, 3),
            'probability_of_harm': round(probability_of_harm, 3)
        }
    
    def _identify_systemic_vulnerabilities(self, threats: List[ThreatScenario]) -> List[str]:
        """Identify systemic vulnerabilities from threat analysis"""
        vulnerabilities = set()
        
        for threat in threats:
            if threat.threat_category == 'technical':
                vulnerabilities.update([
                    "Outdated software systems",
                    "Insufficient network security",
                    "Weak endpoint protection"
                ])
            elif threat.threat_category == 'human':
                vulnerabilities.update([
                    "Inadequate security awareness training",
                    "Weak access management processes",
                    "Insufficient background checks"
                ])
            elif threat.threat_category == 'physical':
                vulnerabilities.update([
                    "Inadequate physical security controls",
                    "Insufficient environmental monitoring",
                    "Lack of disaster recovery planning"
                ])
            elif threat.threat_category == 'organizational':
                vulnerabilities.update([
                    "Weak security governance",
                    "Insufficient security policies",
                    "Inadequate incident response procedures"
                ])
        
        return list(vulnerabilities)


def validate_iso27005_compliance(result: RiskIdentificationResult) -> Dict[str, any]:
    """
    Validate that risk identification results comply with ISO 27005:2022 requirements
    
    Args:
        result: RiskIdentificationResult to validate
        
    Returns:
        Dict with compliance status and recommendations
    """
    compliance_issues = []
    recommendations = []
    
    # Check required components
    if result.risk_index is None or not (0 <= result.risk_index <= 1):
        compliance_issues.append("Risk index must be between 0 and 1")
    
    if result.likelihood is None or not (0 <= result.likelihood <= 1):
        compliance_issues.append("Likelihood must be between 0 and 1")
    
    if result.probability_of_harm is None or not (0 <= result.probability_of_harm <= 1):
        compliance_issues.append("Probability of harm must be between 0 and 1")
    
    if not result.identified_threats:
        recommendations.append("Consider identifying specific threat scenarios for more comprehensive assessment")
    
    if not result.vulnerabilities:
        recommendations.append("Vulnerability identification would enhance risk assessment completeness")
    
    # Check methodology compliance
    if "ISO 27005" not in result.methodology:
        compliance_issues.append("Methodology should reference ISO 27005 standard")
    
    return {
        "compliant": len(compliance_issues) == 0,
        "iso27005_version": "2022",
        "methodology": result.methodology,
        "compliance_issues": compliance_issues,
        "recommendations": recommendations,
        "assessment_completeness": {
            "threats_identified": len(result.identified_threats),
            "vulnerabilities_identified": len(result.vulnerabilities),
            "risk_metrics_calculated": all([
                result.risk_index is not None,
                result.likelihood is not None,
                result.probability_of_harm is not None
            ])
        }
    }


class NISTRiskIdentification:
    """
    NIST SP 800-30 Rev 1 Implementation
    Three-tiered risk assessment approach
    """
    
    def __init__(self):
        self.threat_sources = [
            {
                "id": "TS-1",
                "name": "Cyber Criminals",
                "type": "adversarial",
                "capability": "high",
                "intent": "financial_gain",
                "targeting": "opportunistic"
            },
            {
                "id": "TS-2", 
                "name": "Nation State Actors",
                "type": "adversarial",
                "capability": "very_high",
                "intent": "espionage",
                "targeting": "targeted"
            },
            {
                "id": "TS-3",
                "name": "Insider Threats",
                "type": "adversarial", 
                "capability": "variable",
                "intent": "malicious_negligent",
                "targeting": "insider_knowledge"
            },
            {
                "id": "TS-4",
                "name": "Natural Disasters",
                "type": "environmental",
                "capability": "high",
                "intent": "none",
                "targeting": "geographic"
            }
        ]
    
    def assess_risk(
        self, 
        asset_id: str, 
        asset_context: Dict
    ) -> StandardizedRiskResult:
        """
        NIST SP 800-30 Risk Assessment
        
        Steps:
        1. Prepare for Assessment
        2. Conduct Assessment  
        3. Communicate Results
        """
        
        # Step 1: Prepare for Assessment
        preparation = self._prepare_assessment(asset_context)
        
        # Step 2: Conduct Assessment
        assessment = self._conduct_assessment(asset_context)
        
        # Step 3: Calculate Risk
        risk_calculation = self._calculate_nist_risk(assessment)
        
        return StandardizedRiskResult(
            asset_id=asset_id,
            methodology=RiskMethodology.NIST_SP_800_30,
            risk_score=risk_calculation["risk_score"],
            risk_level=risk_calculation["risk_level"],
            likelihood=assessment["likelihood"],
            impact=assessment["impact"],
            threats_identified=assessment["threats"],
            vulnerabilities_identified=assessment["vulnerabilities"],
            recommendations=self._generate_nist_recommendations(risk_calculation),
            compliance_frameworks=["NIST SP 800-30 Rev 1", "NIST Cybersecurity Framework"],
            assessment_timestamp=datetime.now(),
            additional_data={
                "preparation": preparation,
                "threat_sources": self.threat_sources,
                "nist_tier": self._determine_nist_tier(asset_context)
            }
        )
    
    def _prepare_assessment(self, asset_context: Dict) -> Dict:
        """NIST Step 1: Prepare for Assessment"""
        return {
            "assessment_purpose": "Asset Security Risk Assessment",
            "scope": asset_context.get("scope", "single_asset"),
            "assumptions": [
                "Asset inventory is current and accurate",
                "Threat intelligence is up to date",
                "Security controls are properly documented"
            ],
            "data_sources": [
                "Asset inventory",
                "Vulnerability assessments",
                "Threat intelligence feeds",
                "Security control assessments"
            ]
        }
    
    def _conduct_assessment(self, asset_context: Dict) -> Dict:
        """NIST Step 2: Conduct Assessment"""
        # Identify relevant threat sources
        relevant_threats = self._identify_relevant_threats(asset_context)
        
        # Identify vulnerabilities
        vulnerabilities = self._identify_nist_vulnerabilities(asset_context)
        
        # Calculate likelihood
        likelihood = self._calculate_nist_likelihood(relevant_threats, vulnerabilities)
        
        # Calculate impact
        impact = self._calculate_nist_impact(asset_context)
        
        return {
            "threats": relevant_threats,
            "vulnerabilities": vulnerabilities,
            "likelihood": likelihood,
            "impact": impact
        }
    
    def _identify_relevant_threats(self, asset_context: Dict) -> List[Dict]:
        """Identify threats relevant to the asset"""
        relevant_threats = []
        
        asset_criticality = asset_context.get("criticality", "moderate").lower()
        asset_type = asset_context.get("asset_type", "").lower()
        
        for threat_source in self.threat_sources:
            # Include adversarial threats for critical assets
            if asset_criticality in ["high", "critical"] and threat_source["type"] == "adversarial":
                relevant_threats.append({
                    "threat_id": threat_source["id"],
                    "threat_name": threat_source["name"],
                    "threat_type": threat_source["type"],
                    "likelihood": self._estimate_threat_likelihood(threat_source, asset_context),
                    "description": f"{threat_source['name']} targeting {asset_type} assets"
                })
        
        # Always include environmental threats
        environmental_threats = [ts for ts in self.threat_sources if ts["type"] == "environmental"]
        for threat_source in environmental_threats:
            relevant_threats.append({
                "threat_id": threat_source["id"],
                "threat_name": threat_source["name"], 
                "threat_type": threat_source["type"],
                "likelihood": 0.2,  # Low likelihood for environmental
                "description": f"Environmental threats affecting {asset_type} availability"
            })
        
        return relevant_threats
    
    def _identify_nist_vulnerabilities(self, asset_context: Dict) -> List[Dict]:
        """Identify vulnerabilities using NIST methodology"""
        vulnerabilities = []
        
        # Extract CIA scores
        confidentiality = asset_context.get("confidentiality", 0.5)
        integrity = asset_context.get("integrity", 0.5)
        availability = asset_context.get("availability", 0.5)
        
        # NIST vulnerability categories
        if confidentiality < 0.6:
            vulnerabilities.append({
                "vuln_id": "V-001",
                "name": "Access Control Deficiencies",
                "category": "confidentiality",
                "severity": "high" if confidentiality < 0.4 else "moderate",
                "description": "Inadequate access control mechanisms",
                "predisposing_conditions": ["Weak authentication", "Excessive privileges"]
            })
        
        if integrity < 0.6:
            vulnerabilities.append({
                "vuln_id": "V-002", 
                "name": "Data Integrity Weaknesses",
                "category": "integrity",
                "severity": "high" if integrity < 0.4 else "moderate",
                "description": "Insufficient data validation and integrity controls",
                "predisposing_conditions": ["Unvalidated inputs", "Weak change controls"]
            })
        
        if availability < 0.6:
            vulnerabilities.append({
                "vuln_id": "V-003",
                "name": "Availability Risks", 
                "category": "availability",
                "severity": "high" if availability < 0.4 else "moderate",
                "description": "Single points of failure and insufficient redundancy",
                "predisposing_conditions": ["No backup systems", "Inadequate monitoring"]
            })
        
        return vulnerabilities
    
    def _calculate_nist_likelihood(self, threats: List[Dict], vulnerabilities: List[Dict]) -> float:
        """Calculate likelihood using NIST methodology"""
        if not threats:
            return 0.0
        
        # Average threat likelihood
        threat_likelihood = sum(t["likelihood"] for t in threats) / len(threats)
        
        # Vulnerability factor
        high_severity_vulns = [v for v in vulnerabilities if v.get("severity") == "high"]
        vuln_factor = 1.0 + (len(high_severity_vulns) * 0.15)
        
        # Combined likelihood
        overall_likelihood = min(threat_likelihood * vuln_factor, 1.0)
        
        return round(overall_likelihood, 3)
    
    def _calculate_nist_impact(self, asset_context: Dict) -> float:
        """Calculate impact using NIST methodology"""
        # Use CIA triad scores
        confidentiality = asset_context.get("confidentiality", 0.5)
        integrity = asset_context.get("integrity", 0.5)
        availability = asset_context.get("availability", 0.5)
        
        # NIST impact calculation - weighted average with business criticality
        criticality_weight = {
            "low": 0.8,
            "moderate": 1.0,
            "high": 1.2,
            "critical": 1.4
        }
        
        weight = criticality_weight.get(asset_context.get("criticality", "moderate").lower(), 1.0)
        base_impact = (confidentiality + integrity + availability) / 3
        
        return round(min(base_impact * weight, 1.0), 3)
    
    def _calculate_nist_risk(self, assessment: Dict) -> Dict:
        """Calculate overall risk using NIST methodology"""
        likelihood = assessment["likelihood"]
        impact = assessment["impact"]
        
        # NIST Risk = Likelihood × Impact
        risk_score = likelihood * impact
        
        # NIST Risk Levels
        if risk_score >= 0.64:
            risk_level = "Very High"
        elif risk_score >= 0.36:
            risk_level = "High"
        elif risk_score >= 0.16:
            risk_level = "Moderate"
        elif risk_score >= 0.04:
            risk_level = "Low"
        else:
            risk_level = "Very Low"
        
        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "likelihood_component": likelihood,
            "impact_component": impact
        }
    
    def _estimate_threat_likelihood(self, threat_source: Dict, asset_context: Dict) -> float:
        """Estimate threat likelihood based on threat source and asset context"""
        base_likelihood_map = {
            "Cyber Criminals": 0.7,
            "Nation State Actors": 0.3,
            "Insider Threats": 0.2,
            "Natural Disasters": 0.1
        }
        
        base_likelihood = base_likelihood_map.get(threat_source["name"], 0.5)
        
        # Adjust based on asset criticality
        criticality = asset_context.get("criticality", "moderate").lower()
        if criticality in ["high", "critical"]:
            base_likelihood *= 1.3
        
        return min(base_likelihood, 1.0)
    
    def _generate_nist_recommendations(self, risk_calculation: Dict) -> List[str]:
        """Generate NIST-based recommendations"""
        risk_level = risk_calculation["risk_level"]
        
        recommendations_map = {
            "Very High": [
                "Implement immediate security controls",
                "Activate incident response procedures",
                "Conduct emergency risk review",
                "Consider asset isolation if necessary"
            ],
            "High": [
                "Prioritize security control implementation",
                "Increase monitoring frequency", 
                "Review and update security policies",
                "Conduct quarterly risk assessments"
            ],
            "Moderate": [
                "Implement recommended security controls",
                "Conduct semi-annual risk reviews",
                "Maintain current monitoring levels",
                "Update security awareness training"
            ],
            "Low": [
                "Continue routine monitoring",
                "Annual risk assessment",
                "Maintain current security controls",
                "Document risk acceptance"
            ],
            "Very Low": [
                "Routine monitoring sufficient",
                "Biennial risk review",
                "Standard security controls adequate"
            ]
        }
        
        return recommendations_map.get(risk_level, recommendations_map["Moderate"])
    
    def _determine_nist_tier(self, asset_context: Dict) -> int:
        """Determine NIST tier (1=Organization, 2=Mission/Business, 3=Information System)"""
        asset_scope = asset_context.get("scope", "single_asset")
        
        if asset_scope == "organization":
            return 1
        elif asset_scope == "mission_business_process":
            return 2
        else:
            return 3


class OCTAVERiskIdentification:
    """
    OCTAVE (Operationally Critical Threat, Asset, and Vulnerability Evaluation)
    Simplified implementation focusing on organizational risk perspective
    """
    
    def assess_risk(
        self, 
        asset_id: str, 
        asset_context: Dict
    ) -> StandardizedRiskResult:
        """
        OCTAVE Risk Assessment
        
        Focus areas:
        1. Asset-based analysis
        2. Threat identification
        3. Organizational impact
        """
        
        # OCTAVE Phase 1: Organizational View
        organizational_analysis = self._analyze_organizational_view(asset_context)
        
        # OCTAVE Phase 2: Technological View  
        technological_analysis = self._analyze_technological_view(asset_context)
        
        # OCTAVE Phase 3: Risk Analysis
        risk_analysis = self._analyze_octave_risk(organizational_analysis, technological_analysis)
        
        return StandardizedRiskResult(
            asset_id=asset_id,
            methodology=RiskMethodology.OCTAVE,
            risk_score=risk_analysis["risk_score"],
            risk_level=risk_analysis["risk_level"],
            likelihood=risk_analysis["likelihood"],
            impact=risk_analysis["impact"],
            threats_identified=risk_analysis["threats"],
            vulnerabilities_identified=risk_analysis["vulnerabilities"],
            recommendations=self._generate_octave_recommendations(risk_analysis),
            compliance_frameworks=["OCTAVE", "Asset-Centric Risk Management"],
            assessment_timestamp=datetime.now(),
            additional_data={
                "organizational_analysis": organizational_analysis,
                "technological_analysis": technological_analysis,
                "octave_approach": "Simplified OCTAVE-S"
            }
        )
    
    def _analyze_organizational_view(self, asset_context: Dict) -> Dict:
        """OCTAVE Phase 1: Organizational View"""
        return {
            "asset_criticality": asset_context.get("criticality", "moderate"),
            "business_impact": self._assess_business_impact(asset_context),
            "organizational_vulnerabilities": self._identify_org_vulnerabilities(asset_context),
            "security_requirements": self._define_security_requirements(asset_context)
        }
    
    def _analyze_technological_view(self, asset_context: Dict) -> Dict:
        """OCTAVE Phase 2: Technological View"""
        return {
            "technical_vulnerabilities": self._identify_technical_vulnerabilities(asset_context),
            "infrastructure_analysis": self._analyze_infrastructure(asset_context),
            "technology_threats": self._identify_technology_threats(asset_context)
        }
    
    def _analyze_octave_risk(self, org_analysis: Dict, tech_analysis: Dict) -> Dict:
        """OCTAVE Phase 3: Risk Analysis"""
        # Combine organizational and technological perspectives
        combined_threats = org_analysis.get("organizational_vulnerabilities", []) + \
                          tech_analysis.get("technology_threats", [])
        
        combined_vulnerabilities = tech_analysis.get("technical_vulnerabilities", [])
        
        # OCTAVE risk calculation (simplified)
        business_impact = org_analysis.get("business_impact", 0.5)
        technical_likelihood = len(tech_analysis.get("technical_vulnerabilities", [])) * 0.2
        
        likelihood = min(technical_likelihood, 1.0)
        impact = business_impact
        risk_score = likelihood * impact
        
        # Risk level determination
        if risk_score >= 0.7:
            risk_level = "High"
        elif risk_score >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "likelihood": round(likelihood, 3),
            "impact": round(impact, 3),
            "threats": combined_threats,
            "vulnerabilities": combined_vulnerabilities
        }
    
    def _assess_business_impact(self, asset_context: Dict) -> float:
        """Assess business impact from organizational perspective"""
        criticality_map = {
            "low": 0.3,
            "moderate": 0.5, 
            "high": 0.8,
            "critical": 1.0
        }
        
        criticality = asset_context.get("criticality", "moderate").lower()
        return criticality_map.get(criticality, 0.5)
    
    def _identify_org_vulnerabilities(self, asset_context: Dict) -> List[Dict]:
        """Identify organizational vulnerabilities"""
        return [
            {
                "type": "organizational",
                "name": "Inadequate Security Awareness",
                "description": "Lack of security awareness among staff"
            },
            {
                "type": "organizational", 
                "name": "Insufficient Security Policies",
                "description": "Inadequate or outdated security policies"
            }
        ]
    
    def _define_security_requirements(self, asset_context: Dict) -> List[str]:
        """Define security requirements based on asset characteristics"""
        requirements = ["Confidentiality Protection", "Integrity Assurance", "Availability Maintenance"]
        
        # Add specific requirements based on asset type
        asset_type = asset_context.get("asset_type", "").lower()
        if "database" in asset_type:
            requirements.append("Data Loss Prevention")
        if "server" in asset_type:
            requirements.append("System Hardening")
        
        return requirements
    
    def _identify_technical_vulnerabilities(self, asset_context: Dict) -> List[Dict]:
        """Identify technical vulnerabilities"""
        vulnerabilities = []
        
        # Based on CIA scores
        if asset_context.get("confidentiality", 0.5) < 0.5:
            vulnerabilities.append({
                "type": "technical",
                "name": "Weak Encryption",
                "description": "Insufficient encryption implementation"
            })
        
        if asset_context.get("integrity", 0.5) < 0.5:
            vulnerabilities.append({
                "type": "technical",
                "name": "Inadequate Input Validation", 
                "description": "Lack of proper input validation controls"
            })
        
        if asset_context.get("availability", 0.5) < 0.5:
            vulnerabilities.append({
                "type": "technical",
                "name": "Insufficient Redundancy",
                "description": "Lack of system redundancy and backup"
            })
        
        return vulnerabilities
    
    def _analyze_infrastructure(self, asset_context: Dict) -> Dict:
        """Analyze infrastructure from OCTAVE perspective"""
        return {
            "network_architecture": "Standard enterprise network",
            "access_points": asset_context.get("access_points", "multiple"),
            "security_controls": asset_context.get("security_controls", []),
            "monitoring_capabilities": asset_context.get("monitoring", "basic")
        }
    
    def _identify_technology_threats(self, asset_context: Dict) -> List[Dict]:
        """Identify technology-specific threats"""
        return [
            {
                "threat_id": "OCTAVE-T1",
                "name": "System Compromise",
                "description": "Unauthorized access to system resources",
                "likelihood": 0.6
            },
            {
                "threat_id": "OCTAVE-T2", 
                "name": "Data Corruption",
                "description": "Intentional or accidental data corruption",
                "likelihood": 0.3
            }
        ]
    
    def _generate_octave_recommendations(self, risk_analysis: Dict) -> List[str]:
        """Generate OCTAVE-based recommendations"""
        risk_level = risk_analysis["risk_level"]
        
        base_recommendations = [
            "Develop comprehensive security awareness program",
            "Implement asset-centric security controls",
            "Establish regular risk assessment procedures",
            "Create incident response capabilities"
        ]
        
        if risk_level == "High":
            base_recommendations.extend([
                "Immediate security control implementation",
                "Enhanced monitoring and detection",
                "Executive-level risk communication"
            ])
        elif risk_level == "Moderate":
            base_recommendations.extend([
                "Prioritized security improvements",
                "Quarterly risk reviews",
                "Staff security training"
            ])
        
        return base_recommendations


class IntegratedRiskIdentification:
    """
    Integrated Risk Identification combining multiple methodologies
    Provides comprehensive risk assessment using best practices from all frameworks
    """
    
    def __init__(self):
        self.iso27005 = ISO27005RiskIdentification()
        self.nist = NISTRiskIdentification()
        self.octave = OCTAVERiskIdentification()
    
    def comprehensive_assessment(
        self,
        asset_id: str,
        asset_context: Dict,
        methodologies_to_use: List[RiskMethodology] = None
    ) -> Dict:
        """
        Perform comprehensive risk identification using multiple methodologies
        
        Args:
            asset_id: Asset identifier
            asset_context: Asset context including CIA scores, criticality, etc.
            methodologies_to_use: List of methodologies to apply
            
        Returns:
            Comprehensive risk assessment results
        """
        
        if methodologies_to_use is None:
            methodologies_to_use = [
                RiskMethodology.ISO_27005,
                RiskMethodology.NIST_SP_800_30,
                RiskMethodology.OCTAVE
            ]
        
        results = {}
        
        # ISO 27005 Assessment (existing implementation)
        if RiskMethodology.ISO_27005 in methodologies_to_use:
            iso_result = self.iso27005.hybrid_identification(
                asset_id=asset_id,
                confidentiality=asset_context.get("confidentiality", 0.5),
                integrity=asset_context.get("integrity", 0.5),
                availability=asset_context.get("availability", 0.5),
                classification_value=asset_context.get("classification_value", 0.5),
                organizational_context=asset_context
            )
            results["iso_27005"] = self._convert_iso_result(iso_result)
        
        # NIST SP 800-30 Assessment
        if RiskMethodology.NIST_SP_800_30 in methodologies_to_use:
            results["nist_sp_800_30"] = self.nist.assess_risk(asset_id, asset_context)
        
        # OCTAVE Assessment
        if RiskMethodology.OCTAVE in methodologies_to_use:
            results["octave"] = self.octave.assess_risk(asset_id, asset_context)
        
        # Generate integrated assessment
        integrated_result = self._integrate_results(asset_id, results, asset_context)
        
        return {
            "asset_id": asset_id,
            "individual_assessments": results,
            "integrated_assessment": integrated_result,
            "methodologies_used": [m.value for m in methodologies_to_use],
            "assessment_timestamp": datetime.now().isoformat(),
            "compliance_status": self._check_compliance_status(results)
        }
    
    def _convert_iso_result(self, iso_result: RiskIdentificationResult) -> StandardizedRiskResult:
        """Convert ISO 27005 result to standardized format"""
        # Convert risk index to risk level
        risk_level_map = {
            (0.0, 0.25): "Very Low",
            (0.25, 0.5): "Low", 
            (0.5, 0.75): "Moderate",
            (0.75, 0.9): "High",
            (0.9, 1.0): "Very High"
        }
        
        risk_level = "Moderate"
        for (low, high), level in risk_level_map.items():
            if low <= iso_result.risk_index < high:
                risk_level = level
                break
        
        return StandardizedRiskResult(
            asset_id=iso_result.asset_id,
            methodology=RiskMethodology.ISO_27005,
            risk_score=iso_result.risk_index,
            risk_level=risk_level,
            likelihood=iso_result.likelihood,
            impact=iso_result.risk_index,  # Simplified mapping
            threats_identified=[{
                "threat_id": t.threat_id,
                "name": t.threat_name,
                "source": t.threat_source,
                "category": t.threat_category,
                "likelihood": t.likelihood,
                "description": t.description
            } for t in iso_result.identified_threats],
            vulnerabilities_identified=[{
                "name": v,
                "category": "general",
                "severity": "moderate"
            } for v in iso_result.vulnerabilities],
            recommendations=[
                "Follow ISO 27005:2022 risk treatment procedures",
                "Implement appropriate security controls",
                "Monitor and review risk status regularly"
            ],
            compliance_frameworks=["ISO 27005:2022", "ISO 27001"],
            assessment_timestamp=iso_result.timestamp,
            additional_data={
                "probability_of_harm": iso_result.probability_of_harm,
                "methodology_details": iso_result.methodology
            }
        )
    
    def _integrate_results(
        self, 
        asset_id: str, 
        results: Dict[str, StandardizedRiskResult], 
        asset_context: Dict
    ) -> StandardizedRiskResult:
        """Integrate results from multiple methodologies"""
        
        if not results:
            # Fallback to basic assessment
            return StandardizedRiskResult(
                asset_id=asset_id,
                methodology=RiskMethodology.INTEGRATED,
                risk_score=0.5,
                risk_level="Moderate",
                likelihood=0.5,
                impact=0.5,
                threats_identified=[],
                vulnerabilities_identified=[],
                recommendations=["No assessment results available"],
                compliance_frameworks=[],
                assessment_timestamp=datetime.now(),
                additional_data={}
            )
        
        # Calculate weighted average risk scores
        risk_scores = [r.risk_score for r in results.values()]
        likelihoods = [r.likelihood for r in results.values()]
        impacts = [r.impact for r in results.values()]
        
        # Weighted integration (prefer ISO 27005 if available)
        weights = {
            "iso_27005": 0.4,
            "nist_sp_800_30": 0.35,
            "octave": 0.25
        }
        
        weighted_risk = 0.0
        weighted_likelihood = 0.0
        weighted_impact = 0.0
        total_weight = 0.0
        
        for method_name, result in results.items():
            weight = weights.get(method_name, 1.0 / len(results))
            weighted_risk += result.risk_score * weight
            weighted_likelihood += result.likelihood * weight
            weighted_impact += result.impact * weight
            total_weight += weight
        
        # Normalize if needed
        if total_weight > 0:
            integrated_risk = weighted_risk / total_weight
            integrated_likelihood = weighted_likelihood / total_weight
            integrated_impact = weighted_impact / total_weight
        else:
            integrated_risk = sum(risk_scores) / len(risk_scores)
            integrated_likelihood = sum(likelihoods) / len(likelihoods)
            integrated_impact = sum(impacts) / len(impacts)
        
        # Determine integrated risk level
        if integrated_risk >= 0.8:
            risk_level = "Very High"
        elif integrated_risk >= 0.6:
            risk_level = "High"
        elif integrated_risk >= 0.4:
            risk_level = "Moderate"
        elif integrated_risk >= 0.2:
            risk_level = "Low"
        else:
            risk_level = "Very Low"
        
        # Combine threats and vulnerabilities
        all_threats = []
        all_vulnerabilities = []
        all_recommendations = []
        all_frameworks = []
        
        for result in results.values():
            all_threats.extend(result.threats_identified)
            all_vulnerabilities.extend(result.vulnerabilities_identified)
            all_recommendations.extend(result.recommendations)
            all_frameworks.extend(result.compliance_frameworks)
        
        # Remove duplicates while preserving order
        unique_threats = []
        seen_threat_ids = set()
        for threat in all_threats:
            threat_id = threat.get("threat_id") or threat.get("name")
            if threat_id not in seen_threat_ids:
                unique_threats.append(threat)
                seen_threat_ids.add(threat_id)
        
        unique_vulnerabilities = []
        seen_vuln_names = set()
        for vuln in all_vulnerabilities:
            vuln_name = vuln.get("name", "")
            if vuln_name and vuln_name not in seen_vuln_names:
                unique_vulnerabilities.append(vuln)
                seen_vuln_names.add(vuln_name)
        
        unique_recommendations = list(set(all_recommendations))
        unique_frameworks = list(set(all_frameworks))
        
        return StandardizedRiskResult(
            asset_id=asset_id,
            methodology=RiskMethodology.INTEGRATED,
            risk_score=round(integrated_risk, 3),
            risk_level=risk_level,
            likelihood=round(integrated_likelihood, 3),
            impact=round(integrated_impact, 3),
            threats_identified=unique_threats,
            vulnerabilities_identified=unique_vulnerabilities,
            recommendations=self._generate_integrated_recommendations(risk_level, unique_recommendations),
            compliance_frameworks=unique_frameworks,
            assessment_timestamp=datetime.now(),
            additional_data={
                "integration_weights": weights,
                "methodologies_count": len(results),
                "risk_score_range": f"{min(risk_scores):.3f} - {max(risk_scores):.3f}",
                "consensus_level": self._calculate_consensus_level(risk_scores)
            }
        )
    
    def _generate_integrated_recommendations(
        self, 
        risk_level: str, 
        existing_recommendations: List[str]
    ) -> List[str]:
        """Generate integrated recommendations based on all methodologies"""
        
        integrated_recommendations = [
            "Implement multi-framework risk management approach",
            "Regular cross-methodology risk assessments",
            "Maintain compliance with multiple standards"
        ]
        
        # Add risk-level specific recommendations
        if risk_level in ["Very High", "High"]:
            integrated_recommendations.extend([
                "Immediate implementation of critical security controls",
                "Executive escalation and oversight required",
                "Continuous monitoring and assessment",
                "Consider multiple risk treatment options"
            ])
        elif risk_level == "Moderate":
            integrated_recommendations.extend([
                "Systematic implementation of security improvements",
                "Regular monitoring and periodic reassessment",
                "Balance risk treatment costs with benefits"
            ])
        else:
            integrated_recommendations.extend([
                "Maintain current security posture",
                "Routine monitoring and annual assessment",
                "Document risk acceptance decisions"
            ])
        
        # Add unique recommendations from individual assessments
        prioritized_recommendations = list(set(existing_recommendations))[:5]
        integrated_recommendations.extend(prioritized_recommendations)
        
        return integrated_recommendations
    
    def _calculate_consensus_level(self, risk_scores: List[float]) -> str:
        """Calculate consensus level between different methodologies"""
        if not risk_scores or len(risk_scores) < 2:
            return "Single Assessment"
        
        # Calculate standard deviation
        mean_score = sum(risk_scores) / len(risk_scores)
        variance = sum((score - mean_score) ** 2 for score in risk_scores) / len(risk_scores)
        std_dev = variance ** 0.5
        
        # Determine consensus level
        if std_dev <= 0.1:
            return "High Consensus"
        elif std_dev <= 0.2:
            return "Moderate Consensus"
        elif std_dev <= 0.3:
            return "Low Consensus"
        else:
            return "Significant Disagreement"
    
    def _check_compliance_status(self, results: Dict[str, StandardizedRiskResult]) -> Dict:
        """Check compliance status across all frameworks"""
        compliance_status = {
            "overall_compliant": True,
            "framework_compliance": {},
            "compliance_gaps": [],
            "recommendations": []
        }
        
        for method_name, result in results.items():
            frameworks = result.compliance_frameworks
            compliance_status["framework_compliance"][method_name] = {
                "frameworks": frameworks,
                "compliant": len(frameworks) > 0,
                "assessment_quality": "good" if result.risk_score > 0 else "needs_improvement"
            }
        
        # Add compliance recommendations
        if len(results) < 2:
            compliance_status["recommendations"].append(
                "Consider using multiple risk assessment methodologies for comprehensive coverage"
            )
        
        return compliance_status


# Utility functions for standardized risk identification
def standardize_asset_context(asset_data: Dict) -> Dict:
    """
    Standardize asset context for use across different methodologies
    
    Args:
        asset_data: Raw asset data from database
        
    Returns:
        Standardized asset context
    """
    
    # Map business_criticality to criticality level
    business_criticality = asset_data.get("business_criticality", 0.5)
    if business_criticality >= 0.8:
        criticality_level = "critical"
    elif business_criticality >= 0.6:
        criticality_level = "high"
    elif business_criticality >= 0.4:
        criticality_level = "moderate"
    else:
        criticality_level = "low"
    
    return {
        "asset_id": asset_data.get("id"),
        "asset_name": asset_data.get("asset", asset_data.get("name", "Unknown Asset")),
        "asset_type": asset_data.get("asset_type", "General"),
        "confidentiality": float(asset_data.get("confidentiality", 0.5)),
        "integrity": float(asset_data.get("integrity", 0.5)),
        "availability": float(asset_data.get("availability", 0.5)),
        "classification_value": float(asset_data.get("classification_value", 0.5)),
        "criticality": criticality_level,
        "department": asset_data.get("owner_department_name", "Unknown"),
        "scope": "single_asset",
        "industry": "general",
        "exposure_level": "moderate",
        "access_points": "multiple",
        "security_controls": [],
        "monitoring": "basic"
    }


def validate_risk_identification_result(result: Union[StandardizedRiskResult, Dict]) -> Dict:
    """
    Validate risk identification result for completeness and accuracy
    
    Args:
        result: Risk identification result to validate
        
    Returns:
        Validation report
    """
    
    validation_report = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "completeness_score": 0.0,
        "recommendations": []
    }
    
    if isinstance(result, dict):
        # Handle dictionary format
        required_fields = ["asset_id", "risk_score", "risk_level", "methodology"]
        for field in required_fields:
            if field not in result:
                validation_report["errors"].append(f"Missing required field: {field}")
                validation_report["valid"] = False
    
    elif isinstance(result, StandardizedRiskResult):
        # Handle StandardizedRiskResult object
        if not result.asset_id:
            validation_report["errors"].append("Asset ID is required")
            validation_report["valid"] = False
        
        if not (0 <= result.risk_score <= 1):
            validation_report["errors"].append("Risk score must be between 0 and 1")
            validation_report["valid"] = False
        
        if not result.threats_identified:
            validation_report["warnings"].append("No threats identified - consider reviewing threat identification process")
        
        if not result.vulnerabilities_identified:
            validation_report["warnings"].append("No vulnerabilities identified - consider comprehensive vulnerability assessment")
        
        # Calculate completeness score
        completeness_factors = [
            1.0 if result.asset_id else 0.0,
            1.0 if 0 <= result.risk_score <= 1 else 0.0,
            1.0 if result.risk_level else 0.0,
            1.0 if result.threats_identified else 0.0,
            1.0 if result.vulnerabilities_identified else 0.0,
            1.0 if result.recommendations else 0.0
        ]
        
        validation_report["completeness_score"] = sum(completeness_factors) / len(completeness_factors)
    
    else:
        validation_report["errors"].append("Invalid result format")
        validation_report["valid"] = False
    
    # Add recommendations based on validation results
    if validation_report["completeness_score"] < 0.8:
        validation_report["recommendations"].append("Consider more comprehensive risk assessment")
    
    if len(validation_report["warnings"]) > 2:
        validation_report["recommendations"].append("Review risk identification methodology for completeness")
    
    return validation_report


# Factory function to create appropriate risk identification instance
def create_risk_identifier(methodology: RiskMethodology = RiskMethodology.INTEGRATED):
    """
    Factory function to create risk identification instance
    
    Args:
        methodology: Desired risk identification methodology
        
    Returns:
        Risk identification instance
    """
    
    if methodology == RiskMethodology.ISO_27005:
        return ISO27005RiskIdentification()
    elif methodology == RiskMethodology.NIST_SP_800_30:
        return NISTRiskIdentification()
    elif methodology == RiskMethodology.OCTAVE:
        return OCTAVERiskIdentification()
    elif methodology == RiskMethodology.INTEGRATED:
        return IntegratedRiskIdentification()
    else:
        # Default to integrated approach
        return IntegratedRiskIdentification() 