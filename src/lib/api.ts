const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).response = {
          status: response.status,
          data: errorData ? JSON.parse(errorData) : null
        };
        throw error;
      }
      
      // Handle 204 No Content responses (like DELETE)
      if (response.status === 204) {
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getAssets(): Promise<{ results: Asset[]; count: number }> {
    return this.request('/assets/');
  }

  async getAsset(id: string): Promise<Asset> {
    return this.request(`/assets/${id}/`);
  }

  async createAsset(data: any) {
    return this.request('/assets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAsset(id: string, data: any) {
    return this.request(`/assets/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.request(`/assets/${id}/`, {
      method: 'DELETE',
    });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async classifyAsset(id: string, data?: any) {
    return this.request(`/assets/${id}/classify_asset/`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async identifyRisk(id: string, data: { 
    confidentiality: number; 
    integrity: number; 
    availability: number;
    methodology?: string;
    include_methodologies?: string[];
  }) {
    return this.request(`/assets/${id}/identify_risk_enhanced/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRiskIdentificationMethodologies(id: string) {
    return this.request(`/assets/${id}/risk_identification_methodologies/`);
  }

  async analyzeRisk(id: string) {
    return this.request(`/assets/${id}/analyze_risk/`, {
      method: 'POST',
    });
  }

  async compareModels(id: string, experimentName?: string) {
    return this.request(`/assets/${id}/compare_models/`, {
      method: 'POST',
      body: JSON.stringify({ experiment_name: experimentName || 'Frontend Comparison' }),
    });
  }

  async batchCompare(assetIds: string[], experimentName?: string) {
    return this.request('/assets/batch_compare/', {
      method: 'POST',
      body: JSON.stringify({
        asset_ids: assetIds,
        experiment_name: experimentName || 'Frontend Batch Comparison'
      }),
    });
  }

  async getPerformanceMetrics() {
    return this.request('/assets/performance_metrics/');
  }

  async getDepartments(): Promise<{ results: Department[] }> {
    return this.request('/departments/');
  }

  async getAssetTypes(): Promise<{ results: AssetType[] }> {
    return this.request('/asset-types/');
  }

  async getAssessmentQuestions() {
    return this.request('/assessment-questions/');
  }

  async getAssessmentCategories() {
    return this.request('/assessment-categories/');
  }

  async createAssessmentQuestion(data: any) {
    return this.request('/assessment-questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAssessmentQuestion(id: string, data: any) {
    return this.request(`/assessment-questions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAssessmentQuestion(id: string) {
    return this.request(`/assessment-questions/${id}/`, {
      method: 'DELETE',
    });
  }

  async getClassificationReports() {
    return this.request('/classification-reports/');
  }

  async getConfusionMatrices() {
    return this.request('/confusion-matrices/');
  }

  async getModelComparisons() {
    return this.request('/model-comparisons/');
  }

  async getPerformanceComparisons() {
    return this.request('/performance-comparisons/');
  }

  async uploadDataset(file: File, modelName: string, datasetType: string = 'training') {
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('dataset_type', datasetType);
    formData.append('model_name', modelName);
    
    const url = `${this.baseURL}/ml/upload_dataset/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async trainModels(datasetId: string, models: string[] = ['random_forest', 'svm', 'decision_tree']) {
    return this.request('/ml/train_models/', {
      method: 'POST',
      body: JSON.stringify({
        dataset_id: datasetId,
        models: models
      })
    });
  }

  async listDatasets(): Promise<{ datasets: Dataset[]; count: number }> {
    return this.request('/ml/list_datasets/');
  }

  async listModels(): Promise<{ models: TrainedModel[]; count: number }> {
    return this.request('/ml/list_models/');
  }

  async testModel(modelId: string, testData: Record<string, any>[]) {
    return this.request('/ml/test_model/', {
      method: 'POST',
      body: JSON.stringify({
        model_id: modelId,
        test_data: testData
      })
    });
  }

  async downloadModelReport(modelId: string) {
    const url = `${this.baseURL}/ml/download_model_report/?model_id=${modelId}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for better TypeScript support
export interface Asset {
  id: string;
  asset: string;
  description?: string;
  asset_type: string;
  owner_department: string;
  owner_department_name?: string;
  
  asset_category?: string;
  industry_sector?: string;
  compliance_framework?: string;
  nist_function?: string;
  
  business_criticality?: number;
  regulatory_impact?: number;
  operational_dependency?: number;
  data_sensitivity?: number;
  
  classification?: string;
  classification_value?: number;
  
  confidentiality?: number;
  integrity?: number;
  availability?: number;
  risk_index?: number;
  
  likelihood?: number;
  consequence?: number;
  compliance_factor?: number;
  industry_factor?: number;
  
  calculated_risk_level?: number;
  harm_value?: number;
  mathematical_risk_category?: string;
  
  traditional_fuzzy_prediction?: string;
  modern_svm_prediction?: string;
  modern_dt_prediction?: string;
  
  // Model confidence scores
  traditional_fuzzy_confidence?: number;
  modern_svm_confidence?: number;
  modern_dt_confidence?: number;
  
  // Model classification scores
  traditional_fuzzy_score?: number;
  modern_svm_score?: number;
  modern_dt_score?: number;
  
  standards_version?: string;
  methodology?: string;
  
  risk_treatment?: string;
  treatment_notes?: string;
  comparison_performed_date?: string;
  last_analysis_date?: string;
  
  nist_impact_level?: string;
  iso27005_risk_level?: string;
  standards_compliant?: boolean;
  
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  reason?: string;
  
  // Enhanced organizational impact factors
  business_criticality?: number;
  regulatory_impact?: number;
  operational_dependency?: number;
  data_sensitivity?: number;
  
  risk_appetite?: string;
  compliance_level?: string;
  
  organizational_impact?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  category: {
    id: string;
    name: string;
  };
}

export interface AssessmentCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PerformanceMetrics {
  traditional_fuzzy: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  modern_svm: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  modern_dt: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
}

// ML Training interfaces
export interface Dataset {
  dataset_id: string;
  dataset_type: string;
  model_name: string;
  upload_date: string;
  total_records: number;
  features_count: number;
  target_classes: string[];
  class_distribution: Record<string, number>;
}

export interface TrainedModel {
  model_id: string;
  model_type: string;
  training_accuracy: number;
  testing_accuracy: number;
  cv_accuracy: number;
  cv_std: number;
  training_samples: number;
  testing_samples: number;
  features_used: string[];
  target_classes: string[];
  training_time: number;
  model_path: string;
}

export interface ModelPrediction {
  input: Record<string, any>;
  prediction: string;
  probabilities: Record<string, number>;
}

export default apiClient;