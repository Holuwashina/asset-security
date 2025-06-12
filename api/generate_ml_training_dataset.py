#!/usr/bin/env python3
"""
ML Training Dataset Generator for Asset Classification

This script generates training and testing datasets that can be uploaded
via the frontend to train machine learning models. Creates CSV files
optimized for model training with proper train/test splits.

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
    """Generate ML training and testing datasets"""
    
    def __init__(self, total_samples: int = 2000):
        self.total_samples = total_samples
        self.setup_ml_features()
    
    def setup_ml_features(self):
        """Setup features optimized for ML training"""
        
        # Asset categories (target for classification)
        self.asset_categories = {
            'Data': {
                'examples': [
                    'Customer Database', 'Financial Records', 'Employee Data', 
                    'Intellectual Property', 'Medical Records', 'Legal Documents',
                    'Business Plans', 'Research Data', 'Trade Secrets'
                ],
                'cia_profile': {'C': 0.8, 'I': 0.9, 'A': 0.6}
            },
            'Applications': {
                'examples': [
                    'ERP System', 'CRM Software', 'Email System', 'Web Application',
                    'Mobile App', 'Database System', 'Analytics Platform'
                ],
                'cia_profile': {'C': 0.6, 'I': 0.8, 'A': 0.9}
            },
            'Systems': {
                'examples': [
                    'Database Server', 'Web Server', 'Domain Controller', 'File Server',
                    'Application Server', 'Workstation', 'Mobile Device'
                ],
                'cia_profile': {'C': 0.5, 'I': 0.7, 'A': 0.95}
            },
            'Networks': {
                'examples': [
                    'Core Network', 'DMZ Network', 'Internal LAN', 'Wireless Network',
                    'VPN Infrastructure', 'Firewall', 'Router'
                ],
                'cia_profile': {'C': 0.6, 'I': 0.7, 'A': 0.98}
            },
            'Services': {
                'examples': [
                    'Authentication Service', 'DNS Service', 'Backup Service',
                    'Monitoring Service', 'Cloud Storage', 'Email Service'
                ],
                'cia_profile': {'C': 0.5, 'I': 0.8, 'A': 0.85}
            }
        }
        
        # Business contexts
        self.business_contexts = {
            'Finance': {'risk_multiplier': 1.4, 'compliance_req': 'High'},
            'Healthcare': {'risk_multiplier': 1.3, 'compliance_req': 'Very High'},
            'Technology': {'risk_multiplier': 1.1, 'compliance_req': 'Medium'},
            'Manufacturing': {'risk_multiplier': 1.0, 'compliance_req': 'Medium'},
            'Retail': {'risk_multiplier': 0.9, 'compliance_req': 'Medium'},
            'Education': {'risk_multiplier': 0.8, 'compliance_req': 'Low'},
            'Government': {'risk_multiplier': 1.5, 'compliance_req': 'Very High'}
        }
        
        # Asset values (business impact)
        self.asset_values = {
            'Very Low': {'score': 0.1, 'weight': 0.15},
            'Low': {'score': 0.3, 'weight': 0.25},
            'Medium': {'score': 0.5, 'weight': 0.30},
            'High': {'score': 0.7, 'weight': 0.20},
            'Very High': {'score': 0.9, 'weight': 0.10}
        }
        
        # Compliance frameworks
        self.compliance_frameworks = [
            'GDPR', 'HIPAA', 'SOX', 'PCI-DSS', 'ISO27001', 'NIST', 'None'
        ]
    
    def generate_ml_features(self, asset_category: str, business_context: str, 
                           asset_value: str, compliance: str) -> Dict:
        """Generate ML features for a single record"""
        
        # Get base CIA scores
        base_cia = self.asset_categories[asset_category]['cia_profile']
        
        # Apply business context multiplier
        context_multiplier = self.business_contexts[business_context]['risk_multiplier']
        
        # Get asset value impact
        value_impact = self.asset_values[asset_value]['score']
        
        # Apply compliance factor
        compliance_factor = 1.2 if compliance != 'None' else 1.0
        
        # Calculate CIA scores with variation
        confidentiality = np.clip(
            base_cia['C'] * context_multiplier * value_impact * compliance_factor + 
            np.random.normal(0, 0.05), 0.0, 1.0
        )
        
        integrity = np.clip(
            base_cia['I'] * context_multiplier * value_impact * compliance_factor + 
            np.random.normal(0, 0.05), 0.0, 1.0
        )
        
        availability = np.clip(
            base_cia['A'] * value_impact * compliance_factor + 
            np.random.normal(0, 0.05), 0.0, 1.0
        )
        
        # Calculate derived features
        cia_average = (confidentiality + integrity + availability) / 3
        cia_max = max(confidentiality, integrity, availability)
        cia_variance = np.var([confidentiality, integrity, availability])
        
        # Risk calculation
        risk_score = cia_average * value_impact * context_multiplier
        risk_score = np.clip(risk_score, 0.0, 1.0)
        
        # Determine risk category (target variable)
        if risk_score >= 0.8:
            risk_category = 'Very High'
        elif risk_score >= 0.6:
            risk_category = 'High'
        elif risk_score >= 0.4:
            risk_category = 'Medium'
        elif risk_score >= 0.2:
            risk_category = 'Low'
        else:
            risk_category = 'Very Low'
        
        return {
            # Input features
            'asset_category': asset_category,
            'business_context': business_context,
            'asset_value': asset_value,
            'compliance_framework': compliance,
            'confidentiality': round(confidentiality, 3),
            'integrity': round(integrity, 3),
            'availability': round(availability, 3),
            
            # Derived features  
            'cia_average': round(cia_average, 3),
            'cia_max': round(cia_max, 3),
            'cia_variance': round(cia_variance, 4),
            'value_impact': value_impact,
            'context_multiplier': context_multiplier,
            'compliance_factor': compliance_factor,
            'risk_score': round(risk_score, 3),
            
            # Target variable
            'risk_category': risk_category
        }
    
    def generate_training_dataset(self) -> pd.DataFrame:
        """Generate complete ML training dataset"""
        
        print(f"Generating {self.total_samples} ML training records...")
        
        records = []
        
        for i in range(self.total_samples):
            # Select features based on realistic distributions
            asset_category = np.random.choice(
                list(self.asset_categories.keys()),
                p=[0.35, 0.25, 0.20, 0.12, 0.08]  # Realistic distribution
            )
            
            business_context = random.choice(list(self.business_contexts.keys()))
            
            asset_value = np.random.choice(
                list(self.asset_values.keys()),
                p=[v['weight'] for v in self.asset_values.values()]
            )
            
            compliance = random.choice(self.compliance_frameworks)
            
            # Generate asset name
            asset_examples = self.asset_categories[asset_category]['examples']
            asset_name = f"{business_context} {random.choice(asset_examples)} {i+1:04d}"
            
            # Generate ML features
            features = self.generate_ml_features(
                asset_category, business_context, asset_value, compliance
            )
            
            # Add metadata
            features['asset_id'] = f"ASSET_{i+1:04d}"
            features['asset_name'] = asset_name
            
            records.append(features)
            
            # Progress indicator
            if (i + 1) % 200 == 0:
                print(f"Generated {i + 1}/{self.total_samples} records...")
        
        df = pd.DataFrame(records)
        
        # Reorder columns for ML workflow
        feature_columns = [
            'asset_id', 'asset_name', 'asset_category', 'business_context', 
            'asset_value', 'compliance_framework', 'confidentiality', 'integrity', 
            'availability', 'cia_average', 'cia_max', 'cia_variance', 
            'value_impact', 'context_multiplier', 'compliance_factor', 
            'risk_score', 'risk_category'
        ]
        
        df = df[feature_columns]
        
        print(f"✅ Generated {len(df)} ML training records")
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
                    'asset_category', 'business_context', 'asset_value', 
                    'compliance_framework', 'confidentiality', 'integrity', 'availability'
                ],
                'derived_features': [
                    'cia_average', 'cia_max', 'cia_variance', 'value_impact', 
                    'context_multiplier', 'compliance_factor', 'risk_score'
                ],
                'target_variable': 'risk_category',
                'feature_count': len(combined_df.columns) - 2,  # Exclude asset_id, asset_name
                'target_classes': sorted(combined_df['risk_category'].unique())
            },
            'data_distribution': {
                'asset_categories': combined_df['asset_category'].value_counts().to_dict(),
                'business_contexts': combined_df['business_context'].value_counts().to_dict(),
                'asset_values': combined_df['asset_value'].value_counts().to_dict(),
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
                'features': 'Use columns: asset_category through risk_score for training',
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