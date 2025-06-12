# Generated migration for enhanced model comparison framework
# This migration adds the necessary fields for fair comparison between
# traditional (fuzzy logic) and modern (ML) approaches

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('assets_management', '0001_initial'),
    ]

    operations = [
        # Add new fields to AssetListing for Phase 3 and Phase 4
        migrations.AddField(
            model_name='assetlisting',
            name='calculated_risk_level',
            field=models.FloatField(blank=True, null=True, help_text='Risk = Probability × Harm from Phase 3'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='harm_value',
            field=models.FloatField(blank=True, null=True, help_text='Harm value used in Phase 3 calculation'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='mathematical_risk_category',
            field=models.CharField(blank=True, max_length=20, null=True, help_text='Risk category from Phase 3'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='traditional_fuzzy_prediction',
            field=models.CharField(blank=True, max_length=20, null=True, help_text='Direct fuzzy logic prediction'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='modern_svm_prediction',
            field=models.CharField(blank=True, max_length=20, null=True, help_text='SVM model prediction'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='modern_dt_prediction',
            field=models.CharField(blank=True, max_length=20, null=True, help_text='Decision Tree prediction'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='comparison_performed_date',
            field=models.DateTimeField(blank=True, null=True, help_text='When model comparison was performed'),
        ),
        migrations.AddField(
            model_name='assetlisting',
            name='last_analysis_date',
            field=models.DateTimeField(blank=True, null=True, help_text='Last analysis date'),
        ),

        # Create ModelComparison table for detailed comparison tracking
        migrations.CreateModel(
            name='ModelComparison',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('experiment_name', models.CharField(default='Standard Comparison', max_length=100)),
                ('input_confidentiality', models.FloatField(help_text='Input confidentiality score')),
                ('input_integrity', models.FloatField(help_text='Input integrity score')),
                ('input_availability', models.FloatField(help_text='Input availability score')),
                ('input_asset_classification', models.FloatField(help_text='Input asset classification value')),
                ('fuzzy_prediction', models.CharField(max_length=20, help_text='Traditional fuzzy logic prediction')),
                ('svm_prediction', models.CharField(max_length=20, help_text='SVM prediction')),
                ('dt_prediction', models.CharField(max_length=20, help_text='Decision Tree prediction')),
                ('fuzzy_confidence', models.FloatField(blank=True, null=True, help_text='Fuzzy prediction confidence')),
                ('svm_confidence', models.FloatField(blank=True, null=True, help_text='SVM prediction confidence')),
                ('dt_confidence', models.FloatField(blank=True, null=True, help_text='DT prediction confidence')),
                ('expert_label', models.CharField(blank=True, max_length=20, null=True, help_text='Expert ground truth label')),
                ('comparison_date', models.DateTimeField(auto_now_add=True)),
                ('comparison_version', models.CharField(default='1.0', max_length=50)),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comparisons', to='assets_management.assetlisting')),
            ],
            options={
                'abstract': False,
            },
        ),

        # Create ModelPerformanceComparison table for thesis results
        migrations.CreateModel(
            name='ModelPerformanceComparison',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('experiment_name', models.CharField(max_length=100)),
                ('test_date', models.DateTimeField(auto_now_add=True)),
                ('total_test_cases', models.IntegerField(help_text='Number of test cases used')),
                ('dataset_name', models.CharField(default='Synthetic Dataset', max_length=100)),
                
                # Traditional Fuzzy Logic Performance
                ('fuzzy_accuracy', models.FloatField(help_text='Fuzzy logic accuracy')),
                ('fuzzy_precision', models.FloatField(help_text='Fuzzy logic precision')),
                ('fuzzy_recall', models.FloatField(help_text='Fuzzy logic recall')),
                ('fuzzy_f1_score', models.FloatField(help_text='Fuzzy logic F1-score')),
                
                # Modern SVM Performance
                ('svm_accuracy', models.FloatField(help_text='SVM accuracy')),
                ('svm_precision', models.FloatField(help_text='SVM precision')),
                ('svm_recall', models.FloatField(help_text='SVM recall')),
                ('svm_f1_score', models.FloatField(help_text='SVM F1-score')),
                
                # Modern Decision Tree Performance
                ('dt_accuracy', models.FloatField(help_text='Decision Tree accuracy')),
                ('dt_precision', models.FloatField(help_text='Decision Tree precision')),
                ('dt_recall', models.FloatField(help_text='Decision Tree recall')),
                ('dt_f1_score', models.FloatField(help_text='Decision Tree F1-score')),
                
                # Statistical analysis
                ('statistical_significance_p_value', models.FloatField(blank=True, null=True, help_text='P-value from statistical test')),
                ('best_performing_model', models.CharField(max_length=50, help_text='Best performing approach')),
                
                # Additional metadata
                ('notes', models.TextField(blank=True, null=True, help_text='Additional notes about the experiment')),
            ],
            options={
                'abstract': False,
            },
        ),

        # Add indexes for better query performance
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_assetlisting_comparison_date ON assets_management_assetlisting(comparison_performed_date);",
            reverse_sql="DROP INDEX IF EXISTS idx_assetlisting_comparison_date;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_modelcomparison_experiment ON assets_management_modelcomparison(experiment_name);",
            reverse_sql="DROP INDEX IF EXISTS idx_modelcomparison_experiment;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_modelperformance_test_date ON assets_management_modelperformancecomparison(test_date);",
            reverse_sql="DROP INDEX IF EXISTS idx_modelperformance_test_date;"
        ),
    ]