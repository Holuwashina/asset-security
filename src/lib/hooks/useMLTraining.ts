"use client";

import { useState, useCallback } from 'react';

interface Dataset {
  dataset_id: string;
  dataset_type: string;
  model_name: string;
  upload_date: string;
  total_records: number;
  features_count: number;
  target_classes: string[];
  class_distribution: Record<string, number>;
}

interface TrainedModel {
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

interface ModelPrediction {
  input: Record<string, any>;
  prediction: string;
  probabilities: Record<string, number>;
}

interface UploadResult {
  dataset_id: string;
  statistics: any;
}

interface TrainingResult {
  dataset_id: string;
  results: Record<string, TrainedModel>;
}

interface TestResult {
  model_id: string;
  predictions: ModelPrediction[];
  model_info: any;
}

export const useMLTraining = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Upload dataset
  const uploadDataset = useCallback(async (
    file: File,
    modelName: string,
    datasetType: 'training' | 'testing' = 'training'
  ): Promise<UploadResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('dataset_type', datasetType);
      formData.append('model_name', modelName);

      const response = await fetch('/api/ml/upload_dataset/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // List datasets
  const listDatasets = useCallback(async (): Promise<Dataset[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml/list_datasets/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch datasets');
      }

      const data = await response.json();
      return data.datasets || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch datasets';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Train models
  const trainModels = useCallback(async (
    datasetId: string,
    modelTypes: string[] = ['random_forest', 'svm', 'decision_tree']
  ): Promise<TrainingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml/train_models/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: datasetId,
          models: modelTypes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Training failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Training failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // List trained models
  const listModels = useCallback(async (): Promise<TrainedModel[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml/list_models/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      return data.models || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Test model
  const testModel = useCallback(async (
    modelId: string,
    testData: Record<string, any>[]
  ): Promise<TestResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ml/test_model/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: modelId,
          test_data: testData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Testing failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Testing failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Download model report
  const downloadModelReport = useCallback(async (modelId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ml/download_model_report/?model_id=${modelId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelId}_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get dataset statistics
  const getDatasetStats = useCallback(async (datasetId: string): Promise<any> => {
    try {
      const datasets = await listDatasets();
      return datasets.find(d => d.dataset_id === datasetId);
    } catch (err) {
      setError('Failed to get dataset statistics');
      return null;
    }
  }, [listDatasets]);

  // Validate CSV file
  const validateCSVFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return { valid: false, error: 'File must be a CSV file' };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    return { valid: true };
  }, []);

  // Format model performance for display
  const formatModelPerformance = useCallback((model: TrainedModel) => {
    return {
      ...model,
      training_accuracy_percent: (model.training_accuracy * 100).toFixed(1),
      testing_accuracy_percent: (model.testing_accuracy * 100).toFixed(1),
      cv_accuracy_percent: (model.cv_accuracy * 100).toFixed(1),
      cv_std_percent: ((model.cv_std || 0) * 100).toFixed(1),
      training_time_formatted: `${model.training_time.toFixed(1)}s`,
      model_type_formatted: model.model_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    };
  }, []);

  // Get best performing model
  const getBestModel = useCallback((models: TrainedModel[]): TrainedModel | null => {
    if (models.length === 0) return null;
    
    return models.reduce((best, current) => 
      current.testing_accuracy > best.testing_accuracy ? current : best
    );
  }, []);

  return {
    // State
    loading,
    error,

    // Actions
    uploadDataset,
    listDatasets,
    trainModels,
    listModels,
    testModel,
    downloadModelReport,
    getDatasetStats,
    validateCSVFile,
    clearError,

    // Utilities
    formatModelPerformance,
    getBestModel,
  };
};

export type { Dataset, TrainedModel, ModelPrediction, UploadResult, TrainingResult, TestResult };