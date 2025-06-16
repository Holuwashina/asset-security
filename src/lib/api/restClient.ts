/**
 * REST API Client for Cloud Asset Classification
 * Replaces Apollo GraphQL client with standard HTTP REST client
 */

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// API Configuration - Handle both server and client side
const API_BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  : 'http://localhost:8000/api';

// Create axios instance with default configuration
const restClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed)
restClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
restClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/authentication/login';
      }
    }
    return Promise.reject(error);
  }
);

// Asset API endpoints
export const assetAPI = {
  // List assets with pagination and filtering
  getAssets: (params?: {
    page?: number;
    search?: string;
    asset_type?: string;
    classification?: string;
    ordering?: string;
  }) => restClient.get('/assets/', { params }),

  // Get single asset
  getAsset: (id: string) => restClient.get(`/assets/${id}/`),

  // Create new asset
  createAsset: (data: {
    asset: string;
    description?: string;
    asset_type: string;
    owner_department: string;
    asset_category?: string;
    industry_sector?: string;
    compliance_framework?: string;
    business_criticality?: number;
    regulatory_impact?: number;
    operational_dependency?: number;
    data_sensitivity?: number;
  }) => restClient.post('/assets/', data),

  // Update asset
  updateAsset: (id: string, data: any) => restClient.put(`/assets/${id}/`, data),

  // Delete asset
  deleteAsset: (id: string) => restClient.delete(`/assets/${id}/`),

  // Phase 1: Classify asset
  classifyAsset: (id: string) => restClient.post(`/assets/${id}/classify_asset/`),

  // Phase 2: Identify risk
  identifyRisk: (id: string, data: {
    confidentiality: number;
    integrity: number;
    availability: number;
  }) => restClient.post(`/assets/${id}/identify_risk/`, data),

  // Phase 3: Analyze risk
  analyzeRisk: (id: string) => restClient.post(`/assets/${id}/analyze_risk/`),

  // Phase 4: Compare models
  compareModels: (id: string, data?: {
    experiment_name?: string;
  }) => restClient.post(`/assets/${id}/compare_models/`, data || {}),

  // Batch operations
  batchCompare: (data: {
    asset_ids: string[];
    experiment_name?: string;
  }) => restClient.post('/assets/batch_compare/', data),

  // Performance metrics
  getPerformanceMetrics: () => restClient.get('/assets/performance_metrics/'),
};

// Department API endpoints
export const departmentAPI = {
  getDepartments: () => restClient.get('/departments/'),
  getDepartment: (id: string) => restClient.get(`/departments/${id}/`),
  createDepartment: (data: any) => restClient.post('/departments/', data),
  updateDepartment: (id: string, data: any) => restClient.put(`/departments/${id}/`, data),
  deleteDepartment: (id: string) => restClient.delete(`/departments/${id}/`),
};

// Asset Value Mapping API endpoints
export const assetValueAPI = {
  getAssetValues: () => restClient.get('/asset-value-mappings/'),
  getAssetValue: (id: string) => restClient.get(`/asset-value-mappings/${id}/`),
  createAssetValue: (data: any) => restClient.post('/asset-value-mappings/', data),
  updateAssetValue: (id: string, data: any) => restClient.put(`/asset-value-mappings/${id}/`, data),
  deleteAssetValue: (id: string) => restClient.delete(`/asset-value-mappings/${id}/`),
};

// Asset Type API endpoints
export const assetTypeAPI = {
  getAssetTypes: () => restClient.get('/asset-types/'),
  getAssetType: (id: string) => restClient.get(`/asset-types/${id}/`),
  createAssetType: (data: any) => restClient.post('/asset-types/', data),
  updateAssetType: (id: string, data: any) => restClient.put(`/asset-types/${id}/`, data),
  deleteAssetType: (id: string) => restClient.delete(`/asset-types/${id}/`),
};

// Assessment API endpoints
export const assessmentAPI = {
  getCategories: () => restClient.get('/assessment-categories/'),
  getQuestions: (categoryId?: string) => restClient.get('/assessment-questions/', {
    params: categoryId ? { category: categoryId } : undefined
  }),
  createQuestion: (data: any) => restClient.post('/assessment-questions/', data),
  updateQuestion: (id: string, data: any) => restClient.put(`/assessment-questions/${id}/`, data),
  deleteQuestion: (id: string) => restClient.delete(`/assessment-questions/${id}/`),
};

// Analytics API endpoints
export const analyticsAPI = {
  getClassificationReports: () => restClient.get('/classification-reports/'),
  getConfusionMatrices: () => restClient.get('/confusion-matrices/'),
  getModelComparisons: () => restClient.get('/model-comparisons/'),
  getPerformanceComparisons: () => restClient.get('/performance-comparisons/'),
};

// Type definitions for API responses
export interface Asset {
  id: string;
  asset: string;
  description?: string;
  asset_type: string;
  owner_department: string;
  owner_department_name?: string;
  classification?: string;
  classification_value?: number;
  confidentiality?: number;
  integrity?: number;
  availability?: number;
  risk_index?: number;
  calculated_risk_level?: number;
  harm_value?: number;
  mathematical_risk_category?: string;
  traditional_fuzzy_prediction?: string;
  modern_svm_prediction?: string;
  modern_dt_prediction?: string;
  risk_treatment?: string;
  treatment_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ClassificationResponse {
  asset_id: string;
  classification: string;
  classification_value: number;
  methodology: string;
  timestamp: string;
}

export interface RiskIdentificationResponse {
  asset_id: string;
  risk_index: number;
  probability_of_harm: number;
  methodology: string;
  timestamp: string;
}

export interface RiskAnalysisResponse {
  asset_id: string;
  probability: number;
  harm_value: number;
  calculated_risk_level: number;
  risk_category: string;
  methodology: string;
  timestamp: string;
}

export interface ModelComparisonResponse {
  asset_id: string;
  input_features: {
    confidentiality: number;
    integrity: number;
    availability: number;
    asset_classification: number;
  };
  predictions: {
    traditional_fuzzy: string;
    modern_svm: string;
    modern_dt: string;
  };
  confidence_scores: Record<string, number>;
  approach_details: Record<string, any>;
  consensus: {
    agreement: boolean;
    majority_prediction: string;
    prediction_distribution: Record<string, number>;
  };
  timestamp: string;
}

export interface PerformanceMetrics {
  approach: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  valid_predictions: number;
  total_predictions: number;
}

// Helper functions for common operations
export const apiHelpers = {
  // Handle API errors
  handleError: (error: any): string => {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    return error.message || 'An unknown error occurred';
  },

  // Complete 4-phase workflow for an asset
  runCompleteWorkflow: async (assetId: string, ciaData: {
    confidentiality: number;
    integrity: number;
    availability: number;
  }) => {
    try {
      // Phase 1: Classify asset
      const classifyResult = await assetAPI.classifyAsset(assetId);
      
      // Phase 2: Identify risk
      const riskResult = await assetAPI.identifyRisk(assetId, ciaData);
      
      // Phase 3: Analyze risk
      const analysisResult = await assetAPI.analyzeRisk(assetId);
      
      // Phase 4: Compare models
      const comparisonResult = await assetAPI.compareModels(assetId);
      
      return {
        classification: classifyResult.data,
        riskIdentification: riskResult.data,
        riskAnalysis: analysisResult.data,
        modelComparison: comparisonResult.data,
      };
    } catch (error) {
      throw new Error(apiHelpers.handleError(error));
    }
  },
};

export default restClient;