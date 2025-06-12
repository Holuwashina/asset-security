import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assets_management.settings')

# Initialize Django
django.setup()


import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.svm import SVC  # ADD SVM SUPPORT
from sklearn.metrics import accuracy_score, classification_report, precision_recall_fscore_support
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from sklearn.metrics import confusion_matrix

# Import custom functions to save the classification report and confusion matrix
from assets_management.utils.save_classification_report import save_classification_report
from assets_management.utils.save_confusion_matrix import save_confusion_matrix

# Import new utilities for comparison framework
from assets_management.utils.fuzzy_direct_classifier import FuzzyDirectRiskClassifier
from assets_management.utils.risk_analysis import calculate_risk_level

print("Starting Enhanced Model Training with SVM and Fair Comparison Framework...")
print("=" * 80)

# Load the synthetic data
synthetic_data = pd.read_csv('adjusted_synthetic_data.csv')
print(f"Loaded synthetic data with {len(synthetic_data)} samples")
print(f"Data columns: {list(synthetic_data.columns)}")

# Encode the 'Risk Level' to numeric values for ML models
label_encoder = LabelEncoder()
synthetic_data['Risk Level'] = label_encoder.fit_transform(synthetic_data['Risk Level'])

# Save the label encoder
joblib.dump(label_encoder, 'label_encoder.pkl')
print(f"Risk level classes: {label_encoder.classes_}")

# Define features for fair comparison (same input for all models)
# Features: [Confidentiality, Integrity, Availability, Asset_Classification]
# Note: Using 'Risk Index' as a proxy for Asset_Classification for now
X = synthetic_data[['Confidentiality', 'Integrity', 'Availability', 'Risk Index']]
y = synthetic_data['Risk Level']

print(f"Feature matrix shape: {X.shape}")
print(f"Target vector shape: {y.shape}")
print(f"Target distribution: {np.bincount(y)}")

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

# Apply SMOTE for handling class imbalance
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

print(f"Training set shape after SMOTE: {X_train_res.shape}")
print(f"Training target distribution after SMOTE: {np.bincount(y_train_res)}")

print("\n" + "=" * 80)
print("TRAINING MODELS FOR FAIR COMPARISON")
print("=" * 80)

# Initialize models
print("\n1. Initializing Decision Tree...")
decision_tree = DecisionTreeClassifier(random_state=42)

print("2. Initializing Random Forest...")
random_forest = RandomForestClassifier(random_state=42)

print("3. Initializing SVM (NEW)...")
svm_model = SVC(random_state=42, probability=True)  # Enable probability for ensemble

print("4. Initializing Fuzzy Logic Classifier...")
fuzzy_classifier = FuzzyDirectRiskClassifier()

# Define hyperparameter grids
dt_param_grid = {
    'criterion': ['gini', 'entropy'],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
}

rf_param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
}

# SVM hyperparameter grid for fair comparison
svm_param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': ['scale', 'auto', 0.01, 0.1],
    'kernel': ['rbf', 'linear', 'poly']
}

print("\n" + "=" * 80)
print("HYPERPARAMETER TUNING")
print("=" * 80)

# Perform GridSearchCV for Decision Tree
print("\nTuning Decision Tree hyperparameters...")
dt_grid_search = GridSearchCV(estimator=decision_tree, param_grid=dt_param_grid, cv=5, scoring='accuracy', n_jobs=-1)
dt_grid_search.fit(X_train_res, y_train_res)
best_dt_model = dt_grid_search.best_estimator_
print(f"Best DT parameters: {dt_grid_search.best_params_}")
print(f"Best DT CV score: {dt_grid_search.best_score_:.4f}")

# Perform GridSearchCV for Random Forest
print("\nTuning Random Forest hyperparameters...")
rf_grid_search = GridSearchCV(estimator=random_forest, param_grid=rf_param_grid, cv=5, scoring='accuracy', n_jobs=-1)
rf_grid_search.fit(X_train_res, y_train_res)
best_rf_model = rf_grid_search.best_estimator_
print(f"Best RF parameters: {rf_grid_search.best_params_}")
print(f"Best RF CV score: {rf_grid_search.best_score_:.4f}")

# Perform GridSearchCV for SVM (NEW)
print("\nTuning SVM hyperparameters...")
svm_grid_search = GridSearchCV(estimator=svm_model, param_grid=svm_param_grid, cv=5, scoring='accuracy', n_jobs=-1)
svm_grid_search.fit(X_train_res, y_train_res)
best_svm_model = svm_grid_search.best_estimator_
print(f"Best SVM parameters: {svm_grid_search.best_params_}")
print(f"Best SVM CV score: {svm_grid_search.best_score_:.4f}")

# Define and fit the enhanced ensemble model (including SVM)
print("\nTraining Enhanced Ensemble Model...")
ensemble_model = VotingClassifier(estimators=[
    ('dt', best_dt_model),
    ('rf', best_rf_model),
    ('svm', best_svm_model)  # ADD SVM TO ENSEMBLE
], voting='soft')

ensemble_model.fit(X_train_res, y_train_res)

print("\n" + "=" * 80)
print("CROSS-VALIDATION EVALUATION")
print("=" * 80)

# Perform cross-validation
dt_cv_scores = cross_val_score(best_dt_model, X_train_res, y_train_res, cv=5, scoring='accuracy')
rf_cv_scores = cross_val_score(best_rf_model, X_train_res, y_train_res, cv=5, scoring='accuracy')
svm_cv_scores = cross_val_score(best_svm_model, X_train_res, y_train_res, cv=5, scoring='accuracy')
ensemble_cv_scores = cross_val_score(ensemble_model, X_train_res, y_train_res, cv=5, scoring='accuracy')

print(f"Decision Tree CV Scores: {dt_cv_scores}")
print(f"Decision Tree CV Mean: {dt_cv_scores.mean():.4f} (+/- {dt_cv_scores.std() * 2:.4f})")

print(f"Random Forest CV Scores: {rf_cv_scores}")
print(f"Random Forest CV Mean: {rf_cv_scores.mean():.4f} (+/- {rf_cv_scores.std() * 2:.4f})")

print(f"SVM CV Scores: {svm_cv_scores}")
print(f"SVM CV Mean: {svm_cv_scores.mean():.4f} (+/- {svm_cv_scores.std() * 2:.4f})")

print(f"Ensemble CV Scores: {ensemble_cv_scores}")
print(f"Ensemble CV Mean: {ensemble_cv_scores.mean():.4f} (+/- {ensemble_cv_scores.std() * 2:.4f})")

print("\n" + "=" * 80)
print("TEST SET EVALUATION")
print("=" * 80)

# Train final models and make predictions
print("Training final models...")
best_dt_model.fit(X_train_res, y_train_res)
best_rf_model.fit(X_train_res, y_train_res)
best_svm_model.fit(X_train_res, y_train_res)

# Make predictions with ML models
dt_predictions = best_dt_model.predict(X_test)
rf_predictions = best_rf_model.predict(X_test)
svm_predictions = best_svm_model.predict(X_test)
ensemble_predictions = ensemble_model.predict(X_test)

print("Making predictions...")

# Make predictions with Fuzzy Logic (for fair comparison)
print("Making Fuzzy Logic predictions...")
fuzzy_predictions = []
for i in range(len(X_test)):
    # Extract features for fuzzy classification
    confidentiality = X_test.iloc[i]['Confidentiality']
    integrity = X_test.iloc[i]['Integrity']
    availability = X_test.iloc[i]['Availability']
    asset_classification = X_test.iloc[i]['Risk Index']  # Using Risk Index as proxy
    
    try:
        fuzzy_pred = fuzzy_classifier.classify_risk(confidentiality, integrity, availability, asset_classification)
        # Convert string prediction to numeric for comparison
        fuzzy_pred_numeric = label_encoder.transform([fuzzy_pred])[0]
        fuzzy_predictions.append(fuzzy_pred_numeric)
    except Exception as e:
        print(f"Fuzzy prediction error for sample {i}: {e}")
        # Fallback to most common class
        fuzzy_predictions.append(0)

fuzzy_predictions = np.array(fuzzy_predictions)

print("\n" + "=" * 80)
print("PERFORMANCE COMPARISON - ALL APPROACHES")
print("=" * 80)

# Calculate accuracy scores
dt_accuracy = accuracy_score(y_test, dt_predictions)
rf_accuracy = accuracy_score(y_test, rf_predictions)
svm_accuracy = accuracy_score(y_test, svm_predictions)
ensemble_accuracy = accuracy_score(y_test, ensemble_predictions)
fuzzy_accuracy = accuracy_score(y_test, fuzzy_predictions)

print("ACCURACY COMPARISON:")
print(f"Traditional Fuzzy Logic:    {fuzzy_accuracy:.4f}")
print(f"Modern Decision Tree:       {dt_accuracy:.4f}")
print(f"Modern SVM:                 {svm_accuracy:.4f}")
print(f"Modern Random Forest:       {rf_accuracy:.4f}")
print(f"Enhanced Ensemble:          {ensemble_accuracy:.4f}")

# Calculate detailed metrics for all approaches
def calculate_detailed_metrics(y_true, y_pred, approach_name):
    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted')
    
    return {
        'approach': approach_name,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }

# Calculate metrics for all approaches
metrics_results = []
metrics_results.append(calculate_detailed_metrics(y_test, fuzzy_predictions, 'Traditional Fuzzy Logic'))
metrics_results.append(calculate_detailed_metrics(y_test, dt_predictions, 'Modern Decision Tree'))
metrics_results.append(calculate_detailed_metrics(y_test, svm_predictions, 'Modern SVM'))
metrics_results.append(calculate_detailed_metrics(y_test, rf_predictions, 'Modern Random Forest'))
metrics_results.append(calculate_detailed_metrics(y_test, ensemble_predictions, 'Enhanced Ensemble'))

print("\nDETAILED PERFORMANCE METRICS:")
print("-" * 100)
print(f"{'Approach':<25} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}")
print("-" * 100)
for metrics in metrics_results:
    print(f"{metrics['approach']:<25} {metrics['accuracy']:<12.4f} {metrics['precision']:<12.4f} "
          f"{metrics['recall']:<12.4f} {metrics['f1_score']:<12.4f}")

# Find best performing approach
best_approach = max(metrics_results, key=lambda x: x['accuracy'])
print(f"\nBest Performing Approach: {best_approach['approach']} (Accuracy: {best_approach['accuracy']:.4f})")

print("\n" + "=" * 80)
print("SAVING MODELS AND REPORTS")
print("=" * 80)

# Generate and save classification reports
dt_report = classification_report(y_test, dt_predictions, output_dict=True)
rf_report = classification_report(y_test, rf_predictions, output_dict=True)
svm_report = classification_report(y_test, svm_predictions, output_dict=True)
ensemble_report = classification_report(y_test, ensemble_predictions, output_dict=True)
fuzzy_report = classification_report(y_test, fuzzy_predictions, output_dict=True)

# Save the classification reports
save_classification_report(dt_report, 'Decision Tree')
save_classification_report(rf_report, 'Random Forest')
save_classification_report(svm_report, 'SVM')  # NEW
save_classification_report(ensemble_report, 'Enhanced Ensemble')
save_classification_report(fuzzy_report, 'Fuzzy Logic')  # NEW

# Save confusion matrices
save_confusion_matrix(y_test, dt_predictions, 'Decision Tree', label_encoder)
save_confusion_matrix(y_test, rf_predictions, 'Random Forest', label_encoder)
save_confusion_matrix(y_test, svm_predictions, 'SVM', label_encoder)  # NEW
save_confusion_matrix(y_test, ensemble_predictions, 'Enhanced Ensemble', label_encoder)
save_confusion_matrix(y_test, fuzzy_predictions, 'Fuzzy Logic', label_encoder)  # NEW

# Function to plot and save classification report
def plot_classification_report(report, title='Classification Report', filename=None):
    try:
        report_df = pd.DataFrame(report).transpose()
        report_df = report_df.iloc[:-1, :]  # Remove the 'accuracy' row
        plt.figure(figsize=(10, 6))
        sns.heatmap(report_df, annot=True, cmap='Blues', fmt='.2f')
        plt.title(title)
        if filename:
            plt.savefig(filename)
        plt.close()  # Close to prevent memory issues
        print(f"Saved classification report: {filename}")
    except Exception as e:
        print(f"Error plotting classification report for {title}: {e}")

# Function to plot confusion matrix
def plot_confusion_matrix(y_true, y_pred, title='Confusion Matrix', filename=None):
    try:
        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_)
        plt.xlabel('Predicted')
        plt.ylabel('True')
        plt.title(title)
        if filename:
            plt.savefig(filename)
        plt.close()  # Close to prevent memory issues
        print(f"Saved confusion matrix: {filename}")
    except Exception as e:
        print(f"Error plotting confusion matrix for {title}: {e}")

# Plot and save all classification reports
plot_classification_report(dt_report, title='Decision Tree Classification Report', filename='dt_classification_report.png')
plot_classification_report(rf_report, title='Random Forest Classification Report', filename='rf_classification_report.png')
plot_classification_report(svm_report, title='SVM Classification Report', filename='svm_classification_report.png')
plot_classification_report(ensemble_report, title='Enhanced Ensemble Classification Report', filename='ensemble_classification_report.png')
plot_classification_report(fuzzy_report, title='Fuzzy Logic Classification Report', filename='fuzzy_classification_report.png')

# Plot and save all confusion matrices
plot_confusion_matrix(y_test, dt_predictions, title='Decision Tree Confusion Matrix', filename='dt_confusion_matrix.png')
plot_confusion_matrix(y_test, rf_predictions, title='Random Forest Confusion Matrix', filename='rf_confusion_matrix.png')
plot_confusion_matrix(y_test, svm_predictions, title='SVM Confusion Matrix', filename='svm_confusion_matrix.png')
plot_confusion_matrix(y_test, ensemble_predictions, title='Enhanced Ensemble Confusion Matrix', filename='ensemble_confusion_matrix.png')
plot_confusion_matrix(y_test, fuzzy_predictions, title='Fuzzy Logic Confusion Matrix', filename='fuzzy_confusion_matrix.png')

# Save all trained models
print("\nSaving trained models...")
joblib.dump(best_dt_model, 'best_decision_tree_model.pkl')
joblib.dump(best_rf_model, 'best_random_forest_model.pkl')
joblib.dump(best_svm_model, 'best_svm_model.pkl')  # NEW
joblib.dump(ensemble_model, 'best_ensemble_model.pkl')
# Note: Fuzzy logic doesn't need to be saved as it's rule-based

# Save comparison results for thesis
comparison_results = {
    'experiment_date': pd.Timestamp.now().isoformat(),
    'dataset_info': {
        'total_samples': len(synthetic_data),
        'training_samples': len(X_train_res),
        'test_samples': len(X_test),
        'features': list(X.columns),
        'classes': list(label_encoder.classes_)
    },
    'performance_metrics': metrics_results,
    'best_approach': best_approach,
    'cv_scores': {
        'decision_tree': {'mean': dt_cv_scores.mean(), 'std': dt_cv_scores.std()},
        'random_forest': {'mean': rf_cv_scores.mean(), 'std': rf_cv_scores.std()},
        'svm': {'mean': svm_cv_scores.mean(), 'std': svm_cv_scores.std()},
        'ensemble': {'mean': ensemble_cv_scores.mean(), 'std': ensemble_cv_scores.std()}
    }
}

# Save comparison results
import json
with open('model_comparison_results.json', 'w') as f:
    json.dump(comparison_results, f, indent=2)

print(f"Saved model comparison results to: model_comparison_results.json")

print("\n" + "=" * 80)
print("TRAINING COMPLETE - FAIR COMPARISON FRAMEWORK READY")
print("=" * 80)

print("\nSUMMARY:")
print(f"✓ Trained {len(metrics_results)} approaches for fair comparison")
print(f"✓ Best performing approach: {best_approach['approach']}")
print(f"✓ All models saved and ready for deployment")
print(f"✓ Performance reports generated")
print(f"✓ Fair comparison framework implemented")

print("\nTRADITIONAL vs MODERN APPROACHES:")
traditional_accuracy = fuzzy_accuracy
modern_accuracies = [dt_accuracy, svm_accuracy, rf_accuracy]
best_modern_accuracy = max(modern_accuracies)

print(f"Traditional (Fuzzy Logic): {traditional_accuracy:.4f}")
print(f"Best Modern (ML):          {best_modern_accuracy:.4f}")
print(f"Difference:                {best_modern_accuracy - traditional_accuracy:.4f}")

if best_modern_accuracy > traditional_accuracy:
    print("→ Modern ML approaches outperform traditional fuzzy logic")
else:
    print("→ Traditional fuzzy logic performs competitively with modern ML")

print("\nNext steps:")
print("1. Create database migrations for new model fields")
print("2. Implement model comparison service")
print("3. Build frontend comparison dashboard")
print("4. Conduct statistical significance testing")
