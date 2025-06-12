# Migration for REST API conversion
# This migration ensures all necessary indexes and constraints are in place for REST API

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assets_management', '0002_enhanced_model_comparison'),
    ]

    operations = [
        # Add indexes for REST API performance optimization
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assetlisting_asset_type ON assets_management_assetlisting(asset_type);",
            reverse_sql="DROP INDEX IF EXISTS idx_assetlisting_asset_type;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assetlisting_classification ON assets_management_assetlisting(classification);",
            reverse_sql="DROP INDEX IF EXISTS idx_assetlisting_classification;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assetlisting_mathematical_risk_category ON assets_management_assetlisting(mathematical_risk_category);",
            reverse_sql="DROP INDEX IF EXISTS idx_assetlisting_mathematical_risk_category;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assetlisting_predictions ON assets_management_assetlisting(traditional_fuzzy_prediction, modern_svm_prediction, modern_dt_prediction);",
            reverse_sql="DROP INDEX IF EXISTS idx_assetlisting_predictions;"
        ),
        
        # Add indexes for assessment questions and categories
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assessmentquestion_category ON assets_management_assessmentquestion(category_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_assessmentquestion_category;"
        ),
        
        # Add indexes for model comparison filtering
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_modelcomparison_experiment ON assets_management_modelcomparison(experiment_name);",
            reverse_sql="DROP INDEX IF EXISTS idx_modelcomparison_experiment;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_modelcomparison_predictions ON assets_management_modelcomparison(fuzzy_prediction, svm_prediction, dt_prediction);",
            reverse_sql="DROP INDEX IF EXISTS idx_modelcomparison_predictions;"
        ),
        
        # Add indexes for performance comparison
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_performancecomparison_best_model ON assets_management_modelperformancecomparison(best_performing_model);",
            reverse_sql="DROP INDEX IF EXISTS idx_performancecomparison_best_model;"
        ),
    ]