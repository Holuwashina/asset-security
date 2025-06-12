/**
 * API client for Asset Classification Backend
 * Connects frontend to Django REST API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API Client class
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      // Silent failure for development - don't log API connection errors
      throw error;
    }
  }

  // Assets endpoints
  async getAssets() {
    return this.request('/assets/');
  }

  async getAsset(id: string) {
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

  // Classification endpoints (Five-Phase Framework)
  async classifyAsset(id: string) {
    return this.request(`/assets/${id}/classify_asset/`, {
      method: 'POST',
    });
  }

  async identifyRisk(id: string, data: { confidentiality: number; integrity: number; availability: number }) {
    return this.request(`/assets/${id}/identify_risk/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // Batch operations
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

  // Supporting data endpoints
  async getDepartments() {
    return this.request('/departments/');
  }

  async getAssetTypes() {
    return this.request('/asset-types/');
  }

  async getAssetValues() {
    return this.request('/asset-value-mappings/');
  }

  async getAssessmentQuestions() {
    return this.request('/assessment-questions/');
  }

  async getAssessmentCategories() {
    return this.request('/assessment-categories/');
  }

  // Assessment questions CRUD
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

  // Model performance endpoints
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
  asset_value: string;
  asset_value_name?: string;
  confidentiality?: number;
  integrity?: number;
  availability?: number;
  classification?: string;
  classification_value?: number;
  risk_index?: number;
  calculated_risk_level?: number;
  mathematical_risk_category?: string;
  traditional_fuzzy_prediction?: string;
  modern_svm_prediction?: string;
  modern_dt_prediction?: string;
  harm_value?: number;
  risk_treatment?: string;
  treatment_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
}

export interface AssetValue {
  id: string;
  name: string;
  description?: string;
  value?: number;
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

export default apiClient;