#!/usr/bin/env python3
"""
ML Training Dataset Generator for Asset Classification

This script generates training and testing datasets that can be uploaded
via the frontend to train machine learning models. Creates CSV files
optimized for model training with proper train/test splits.

Updated to match the new 7-parameter implementation:
- business_criticality, data_sensitivity, operational_dependency, regulatory_impact
- confidentiality, integrity, availability
- Government classification levels: Public, Official, Confidential, Restricted

Author: Asset Classification Framework
Date: 2024
License: MIT
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime
from typing import List, Dict, Tuple
from sklearn.model_selection import train_test_split
import os
import json

# Set random seeds for reproducibility
np.random.seed(42)
random.seed(42)

class MLTrainingDatasetGenerator:
    """Generate ML training and testing datasets with 7-parameter approach"""
    
    def __init__(self, total_samples: int = 2000):
        self.total_samples = total_samples
        self.setup_ml_features()
    
    def setup_ml_features(self):
        """Setup features optimized for 7-parameter ML training"""
        
        # Asset categories with strategically designed profiles for balanced class distribution
        # Designed to generate roughly equal distribution across all 4 government classification levels
        self.asset_categories = {
            'Data': {
                'examples': [
                    'Customer Database', 'Financial Records', 'Employee Data', 
                    'Intellectual Property', 'Medical Records', 'Legal Documents',
                    'Business Plans', 'Research Data', 'Trade Secrets'
                ],
                'base_profile': {
                    'business_criticality': 0.65,  # High-value data assets
                    'data_sensitivity': 0.70,
                    'operational_dependency': 0.55,
                    'regulatory_impact': 0.65,
                    'confidentiality': 0.70,
                    'integrity': 0.65,
                    'availability': 0.50
                }
            },
            'Applications': {
                'examples': [
                    'ERP System', 'CRM Software', 'Email System', 'Web Application',
                    'Mobile App', 'Database System', 'Analytics Platform'
                ],
                'base_profile': {
                    'business_criticality': 0.45,  # Medium business impact
                    'data_sensitivity': 0.35,
                    'operational_dependency': 0.55,
                    'regulatory_impact': 0.35,
                    'confidentiality': 0.35,
                    'integrity': 0.50,
                    'availability': 0.60
                }
            },
            'Systems': {
                'examples': [
                    'Database Server', 'Web Server', 'Domain Controller', 'File Server',
                    'Application Server', 'Workstation', 'Mobile Device'
                ],
                'base_profile': {
                    'business_criticality': 0.35,  # Infrastructure - lower direct business impact
                    'data_sensitivity': 0.25,
                    'operational_dependency': 0.45,
                    'regulatory_impact': 0.25,
                    'confidentiality': 0.25,
                    'integrity': 0.40,
                    'availability': 0.50
                }
            },
            'Networks': {
                'examples': [
                    'Core Network', 'DMZ Network', 'Internal LAN', 'Wireless Network',
                    'VPN Infrastructure', 'Firewall', 'Router'
                ],
                'base_profile': {
                    'business_criticality': 0.50,  # Critical for operations but lower data sensitivity
                    'data_sensitivity': 0.15,
                    'operational_dependency': 0.65,
                    'regulatory_impact': 0.30,
                    'confidentiality': 0.30,
                    'integrity': 0.40,
                    'availability': 0.70
                }
            },
            'Services': {
                'examples': [
                    'Authentication Service', 'DNS Service', 'Backup Service',
                    'Monitoring Service', 'Cloud Storage', 'Email Service'
                ],
                'base_profile': {
                    'business_criticality': 0.25,  # Support services - lowest baseline
                    'data_sensitivity': 0.15,
                    'operational_dependency': 0.35,
                    'regulatory_impact': 0.15,
                    'confidentiality': 0.15,
                    'integrity': 0.30,
                    'availability': 0.40
                }
            }
        }
        
        # Business contexts with carefully calibrated multipliers for balanced distribution
        # Designed to spread final scores across all 4 classification levels
        self.business_contexts = {
            'Finance': {'risk_multiplier': 1.25, 'compliance_req': 'High'},
            'Healthcare': {'risk_multiplier': 1.20, 'compliance_req': 'Very High'},
            'Government': {'risk_multiplier': 1.30, 'compliance_req': 'Very High'},
            'Technology': {'risk_multiplier': 0.95, 'compliance_req': 'Medium'},
            'Manufacturing': {'risk_multiplier': 0.85, 'compliance_req': 'Medium'},
            'Retail': {'risk_multiplier': 0.75, 'compliance_req': 'Medium'},
            'Education': {'risk_multiplier': 0.65, 'compliance_req': 'Low'}
        }
        
        # Compliance frameworks
        self.compliance_frameworks = [
            'GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'ISO27001', 'NIST', 'None'
        ]
    
    def generate_7_parameter_features(self, asset_category: str, business_context: str, 
                                    compliance: str) -> Dict:
        """Generate 7-parameter ML features for a single record"""
        
        # Get base profile for asset category
        base_profile = self.asset_categories[asset_category]['base_profile']
        
        # Apply business context multiplier
        context_multiplier = self.business_contexts[business_context]['risk_multiplier']
        
        # Apply compliance factor
        compliance_factor = 1.2 if compliance != 'None' else 1.0
        
        # Generate 7 parameters with controlled variation for balanced class distribution
        # Increased standard deviation to create more spread across classification levels
        business_criticality = np.clip(
            base_profile['business_criticality'] * context_multiplier + 
            np.random.normal(0, 0.15), 0.0, 1.0
        )
        
        data_sensitivity = np.clip(
            base_profile['data_sensitivity'] * compliance_factor + 
            np.random.normal(0, 0.15), 0.0, 1.0
        )
        
        operational_dependency = np.clip(
            base_profile['operational_dependency'] * context_multiplier + 
            np.random.normal(0, 0.12), 0.0, 1.0
        )
        
        regulatory_impact = np.clip(
            base_profile['regulatory_impact'] * compliance_factor + 
            np.random.normal(0, 0.15), 0.0, 1.0
        )
        
        confidentiality = np.clip(
            base_profile['confidentiality'] * compliance_factor + 
            np.random.normal(0, 0.12), 0.0, 1.0
        )
        
        integrity = np.clip(
            base_profile['integrity'] * context_multiplier + 
            np.random.normal(0, 0.12), 0.0, 1.0
        )
        
        availability = np.clip(
            base_profile['availability'] * context_multiplier + 
            np.random.normal(0, 0.12), 0.0, 1.0
        )
        
        # Calculate overall risk score using proper weighted approach
        # This matches the enhanced fuzzy system logic but ensures balanced distribution
        
        # Method 1: Weighted Component Approach (Primary)
        # Business factors (60%): Business criticality, operational dependency, regulatory impact
        business_component = (business_criticality * 0.4 + operational_dependency * 0.3 + regulatory_impact * 0.3) * 0.6
        
        # Technical factors (25%): CIA triad
        technical_component = (confidentiality * 0.33 + integrity * 0.33 + availability * 0.34) * 0.25
        
        # Data sensitivity (15%): Standalone critical factor
        data_component = data_sensitivity * 0.15
        
        # Primary score calculation
        weighted_score = business_component + technical_component + data_component
        
        # Method 2: Simple Average (Secondary for validation)
        simple_average = (business_criticality + data_sensitivity + operational_dependency + 
                         regulatory_impact + confidentiality + integrity + availability) / 7
        
        # Combine both methods with slight preference for weighted approach
        # This ensures more nuanced scoring while maintaining interpretability
        final_score = min(max(weighted_score * 0.8 + simple_average * 0.2, 0.0), 1.0)
        
        # Determine government classification levels (matching new system)
        if final_score <= 0.25:
            risk_category = "Public"
        elif final_score <= 0.50:
            risk_category = "Official"
        elif final_score <= 0.75:
            risk_category = "Confidential"
        else:
            risk_category = "Restricted"
        
        return {
            # 7 core parameters for ML training
            'business_criticality': round(business_criticality, 3),
            'data_sensitivity': round(data_sensitivity, 3),
            'operational_dependency': round(operational_dependency, 3),
            'regulatory_impact': round(regulatory_impact, 3),
            'confidentiality': round(confidentiality, 3),
            'integrity': round(integrity, 3),
            'availability': round(availability, 3),
            
            # Target variable (government classification)
            'risk_category': risk_category,
            
            # Metadata for context
            'asset_category': asset_category,
            'business_context': business_context,
            'compliance_framework': compliance,
            'final_score': round(final_score, 3),
            'context_multiplier': context_multiplier,
            'compliance_factor': compliance_factor
        }
    
    def generate_training_dataset(self) -> pd.DataFrame:
        """Generate complete ML training dataset with 7-parameter approach"""
        
        print(f"Generating {self.total_samples} ML training records with 7-parameter approach...")
        
        records = []
        
        for i in range(self.total_samples):
            # Select features based on realistic distributions
            asset_category = np.random.choice(
                list(self.asset_categories.keys()),
                p=[0.35, 0.25, 0.20, 0.12, 0.08]  # Realistic distribution
            )
            
            business_context = random.choice(list(self.business_contexts.keys()))
            compliance = random.choice(self.compliance_frameworks)
            
            # Generate asset name
            asset_examples = self.asset_categories[asset_category]['examples']
            asset_name = f"{business_context} {random.choice(asset_examples)} {i+1:04d}"
            
            # Generate 7-parameter ML features
            features = self.generate_7_parameter_features(
                asset_category, business_context, compliance
            )
            
            # Add metadata
            features['asset_id'] = f"ASSET_{i+1:04d}"
            features['asset_name'] = asset_name
            
            records.append(features)
            
            # Progress indicator
            if (i + 1) % 200 == 0:
                print(f"Generated {i + 1}/{self.total_samples} records...")
        
        df = pd.DataFrame(records)
        
        # Reorder columns for ML workflow (7 parameters + target + metadata)
        feature_columns = [
            'asset_id', 'asset_name', 'asset_category', 'business_context', 'compliance_framework',
            'business_criticality', 'data_sensitivity', 'operational_dependency', 'regulatory_impact',
            'confidentiality', 'integrity', 'availability', 'risk_category',
            'final_score', 'context_multiplier', 'compliance_factor'
        ]
        
        df = df[feature_columns]
        
        print(f"✅ Generated {len(df)} ML training records with 7-parameter approach")
        
        # Validate class distribution
        class_distribution = df['risk_category'].value_counts().sort_index()
        print(f"\n📊 Class Distribution:")
        for category, count in class_distribution.items():
            percentage = (count / len(df)) * 100
            print(f"   {category}: {count} records ({percentage:.1f}%)")
        
        # Check if we have all 4 classes
        expected_classes = ['Public', 'Official', 'Confidential', 'Restricted']
        missing_classes = set(expected_classes) - set(class_distribution.index)
        if missing_classes:
            print(f"⚠️  Warning: Missing classes: {missing_classes}")
        else:
            print(f"✅ All 4 classification levels represented")
        
        return df
    
    def create_train_test_split(self, df: pd.DataFrame, test_size: float = 0.2) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split dataset into training and testing sets"""
        
        # Stratified split to maintain class distribution
        train_df, test_df = train_test_split(
            df, 
            test_size=test_size, 
            random_state=42, 
            stratify=df['risk_category']
        )
        
        # Reset indices
        train_df = train_df.reset_index(drop=True)
        test_df = test_df.reset_index(drop=True)
        
        print(f"📊 Dataset split:")
        print(f"   Training set: {len(train_df)} records ({100*(1-test_size):.0f}%)")
        print(f"   Testing set: {len(test_df)} records ({100*test_size:.0f}%)")
        
        return train_df, test_df
    
    def generate_dataset_info(self, train_df: pd.DataFrame, test_df: pd.DataFrame) -> Dict:
        """Generate dataset information for documentation"""
        
        combined_df = pd.concat([train_df, test_df])
        
        info = {
            'generation_info': {
                'generation_date': datetime.now().isoformat(),
                'total_records': len(combined_df),
                'training_records': len(train_df),
                'testing_records': len(test_df),
                'random_seed': 42,
                'purpose': 'Machine Learning Training and Testing'
            },
            'feature_info': {
                'input_features': [
                    'asset_category', 'business_context', 'compliance_framework',
                    'business_criticality', 'data_sensitivity', 'operational_dependency', 'regulatory_impact'
                ],
                'derived_features': [
                    'confidentiality', 'integrity', 'availability', 'final_score',
                    'context_multiplier', 'compliance_factor'
                ],
                'target_variable': 'risk_category',
                'feature_count': len(combined_df.columns) - 2,  # Exclude asset_id, asset_name
                'target_classes': sorted(combined_df['risk_category'].unique())
            },
            'data_distribution': {
                'asset_categories': combined_df['asset_category'].value_counts().to_dict(),
                'business_contexts': combined_df['business_context'].value_counts().to_dict(),
                'risk_categories': combined_df['risk_category'].value_counts().to_dict()
            },
            'statistics': {
                'confidentiality': {
                    'min': combined_df['confidentiality'].min(),
                    'max': combined_df['confidentiality'].max(),
                    'mean': combined_df['confidentiality'].mean(),
                    'std': combined_df['confidentiality'].std()
                },
                'integrity': {
                    'min': combined_df['integrity'].min(),
                    'max': combined_df['integrity'].max(),
                    'mean': combined_df['integrity'].mean(),
                    'std': combined_df['integrity'].std()
                },
                'availability': {
                    'min': combined_df['availability'].min(),
                    'max': combined_df['availability'].max(),
                    'mean': combined_df['availability'].mean(),
                    'std': combined_df['availability'].std()
                }
            },
            'usage_instructions': {
                'training': 'Use training_dataset.csv to train ML models',
                'testing': 'Use testing_dataset.csv to evaluate model performance',
                'upload': 'Upload either dataset via frontend for model training',
                'features': 'Use columns: asset_category through final_score for training',
                'target': 'Use risk_category as target variable for classification'
            }
        }
        
        return info
    
    def save_ml_datasets(self, train_df: pd.DataFrame, test_df: pd.DataFrame):
        """Save training and testing datasets"""
        
        # Create output directory
        output_dir = 'ml_datasets'
        os.makedirs(output_dir, exist_ok=True)
        
        # Save training dataset
        train_path = os.path.join(output_dir, 'training_dataset.csv')
        train_df.to_csv(train_path, index=False)
        print(f"✅ Training dataset saved: {train_path}")
        
        # Save testing dataset  
        test_path = os.path.join(output_dir, 'testing_dataset.csv')
        test_df.to_csv(test_path, index=False)
        print(f"✅ Testing dataset saved: {test_path}")
        
        # Save combined dataset
        combined_df = pd.concat([train_df, test_df])
        combined_path = os.path.join(output_dir, 'complete_dataset.csv')
        combined_df.to_csv(combined_path, index=False)
        print(f"✅ Complete dataset saved: {combined_path}")
        
        # Save dataset info
        dataset_info = self.generate_dataset_info(train_df, test_df)
        info_path = os.path.join(output_dir, 'dataset_info.json')
        with open(info_path, 'w') as f:
            json.dump(dataset_info, f, indent=2, default=str)
        print(f"✅ Dataset info saved: {info_path}")
        
        return {
            'training_dataset': train_path,
            'testing_dataset': test_path,
            'complete_dataset': combined_path,
            'dataset_info': info_path
        }


def main():
    """Generate ML training and testing datasets"""
    
    print("🤖 ML Training Dataset Generator")
    print("=" * 50)
    print("Generating datasets for frontend upload and model training")
    print("=" * 50)
    
    # Configuration
    total_samples = 2000
    test_split = 0.2
    
    # Generate datasets
    generator = MLTrainingDatasetGenerator(total_samples)
    
    start_time = datetime.now()
    
    # Generate complete dataset
    complete_df = generator.generate_training_dataset()
    
    # Create train/test split
    train_df, test_df = generator.create_train_test_split(complete_df, test_split)
    
    # Save datasets
    saved_files = generator.save_ml_datasets(train_df, test_df)
    
    end_time = datetime.now()
    
    # Display summary
    print(f"\n⏱️  Generation completed in: {end_time - start_time}")
    
    print(f"\n📊 Dataset Summary:")
    print(f"   Total Records: {len(complete_df)}")
    print(f"   Training Set: {len(train_df)} records")
    print(f"   Testing Set: {len(test_df)} records")
    print(f"   Features: {len(complete_df.columns) - 2} (excluding ID and name)")
    print(f"   Target Classes: {len(complete_df['risk_category'].unique())}")
    
    print(f"\n📈 Class Distribution:")
    for category, count in complete_df['risk_category'].value_counts().items():
        percentage = (count / len(complete_df)) * 100
        print(f"   {category}: {count} ({percentage:.1f}%)")
    
    print(f"\n📁 Generated Files:")
    for name, path in saved_files.items():
        print(f"   {name}: {path}")
    
    print(f"\n🎯 Usage Instructions:")
    print(f"   1. Upload training_dataset.csv via frontend to train models")
    print(f"   2. Upload testing_dataset.csv to evaluate model performance")
    print(f"   3. Use complete_dataset.csv for comprehensive training")
    print(f"   4. Check dataset_info.json for detailed documentation")
    
    print(f"\n🚀 Ready for ML model training via frontend upload!")


if __name__ == "__main__":
    main()