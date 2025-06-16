/**
 * Integration Test Utilities
 * Tests the frontend-backend integration consistency
 */

import { apiClient, Asset, Dataset, TrainedModel } from '@/lib/api';

export class IntegrationTester {
  
  /**
   * Test API Client connectivity
   */
  static async testApiConnectivity(): Promise<boolean> {
    try {
      await apiClient.getDepartments();
      return true;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Test Asset CRUD operations
   */
  static async testAssetCRUD(): Promise<boolean> {
    try {
      // Test getting assets
      const assetsResponse = await apiClient.getAssets();
      console.log('Assets response format:', {
        hasResults: !!assetsResponse?.results,
        isArray: Array.isArray(assetsResponse?.results),
        count: assetsResponse?.count
      });

      // Test supporting data
      const [departments, assetTypes] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getAssetTypes()
      ]);

      console.log('Supporting data:', {
        departments: departments?.results?.length || 0,
        assetTypes: assetTypes?.results?.length || 0
      });

      return true;
    } catch (error) {
      console.error('Asset CRUD test failed:', error);
      return false;
    }
  }

  /**
   * Test ML Training integration
   */
  static async testMLIntegration(): Promise<boolean> {
    try {
      // Test ML endpoints
      const [datasets, models] = await Promise.all([
        apiClient.listDatasets(),
        apiClient.listModels()
      ]);

      console.log('ML Integration:', {
        datasets: datasets?.datasets?.length || 0,
        models: models?.models?.length || 0,
        datasetsStructure: datasets?.datasets?.[0] ? Object.keys(datasets.datasets[0]) : [],
        modelsStructure: models?.models?.[0] ? Object.keys(models.models[0]) : []
      });

      return true;
    } catch (error) {
      console.error('ML integration test failed:', error);
      return false;
    }
  }

  /**
   * Test Five-Phase Classification workflow
   */
  static async testClassificationWorkflow(assetId: string): Promise<boolean> {
    try {
      // Test Phase 1: Classification
      const classificationResult = await apiClient.classifyAsset(assetId);
      console.log('Phase 1 - Classification:', classificationResult);

      // Test Phase 2: Risk Identification
      const riskIdentificationResult = await apiClient.identifyRisk(assetId, {
        confidentiality: 0.8,
        integrity: 0.9,
        availability: 0.7
      });
      console.log('Phase 2 - Risk Identification:', riskIdentificationResult);

      // Test Phase 3: Risk Analysis
      const riskAnalysisResult = await apiClient.analyzeRisk(assetId);
      console.log('Phase 3 - Risk Analysis:', riskAnalysisResult);

      // Test Phase 4: Model Comparison
      const comparisonResult = await apiClient.compareModels(assetId, 'Integration Test');
      console.log('Phase 4 - Model Comparison:', comparisonResult);

      return true;
    } catch (error) {
      console.error('Classification workflow test failed:', error);
      return false;
    }
  }

  /**
   * Test data type consistency
   */
  static validateAssetDataTypes(asset: Asset): boolean {
    const issues: string[] = [];

    // Check required fields
    if (!asset.id || typeof asset.id !== 'string') {
      issues.push('Invalid or missing asset.id');
    }

    if (!asset.asset || typeof asset.asset !== 'string') {
      issues.push('Invalid or missing asset.asset (name)');
    }

    // Check numeric fields
    if (asset.confidentiality !== undefined && (typeof asset.confidentiality !== 'number' || asset.confidentiality < 0 || asset.confidentiality > 1)) {
      issues.push('Invalid confidentiality value (should be 0-1)');
    }

    if (asset.integrity !== undefined && (typeof asset.integrity !== 'number' || asset.integrity < 0 || asset.integrity > 1)) {
      issues.push('Invalid integrity value (should be 0-1)');
    }

    if (asset.availability !== undefined && (typeof asset.availability !== 'number' || asset.availability < 0 || asset.availability > 1)) {
      issues.push('Invalid availability value (should be 0-1)');
    }

    if (issues.length > 0) {
      console.error('Asset data type validation failed:', issues);
      return false;
    }

    return true;
  }

  /**
   * Run all integration tests
   */
  static async runAllTests(): Promise<{
    connectivity: boolean;
    assetCRUD: boolean;
    mlIntegration: boolean;
    dataTypes: boolean;
    overall: boolean;
  }> {
    console.log('🔧 Running Frontend-Backend Integration Tests...');

    const connectivity = await this.testApiConnectivity();
    const assetCRUD = await this.testAssetCRUD();
    const mlIntegration = await this.testMLIntegration();

    // Test data types with sample data
    const sampleAsset: Asset = {
      id: 'test-id',
      asset: 'Test Asset',
      asset_type: 'Database',
      owner_department: 'dept-id',
      confidentiality: 0.8,
      integrity: 0.9,
      availability: 0.7
    };
    const dataTypes = this.validateAssetDataTypes(sampleAsset);

    const overall = connectivity && assetCRUD && mlIntegration && dataTypes;

    const results = {
      connectivity,
      assetCRUD,
      mlIntegration,
      dataTypes,
      overall
    };

    console.log('🎯 Integration Test Results:', results);

    if (overall) {
      console.log('✅ All integration tests passed!');
    } else {
      console.log('❌ Some integration tests failed. Check individual results above.');
    }

    return results;
  }
}