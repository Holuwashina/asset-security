"use client";

import { useState, useCallback } from 'react';
import { apiClient, Dataset, TrainedModel, ModelPrediction } from '../api';
import { useToast } from './useToast';

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
  const { addToast } = useToast();

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
      const data = await apiClient.uploadDataset(file, modelName, datasetType);
      addToast('Dataset uploaded successfully', 'success');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      addToast(`Upload failed: ${errorMessage}`, 'error');
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
      const data = await apiClient.listDatasets();
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
      const data = await apiClient.trainModels(datasetId, modelTypes);
      addToast('Models trained successfully', 'success');
      return data as TrainingResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Training failed';
      setError(errorMessage);
      addToast(`Training failed: ${errorMessage}`, 'error');
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
      const data = await apiClient.listModels();
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
      const data = await apiClient.testModel(modelId, testData);
      addToast('Model testing completed successfully', 'success');
      return data as TestResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Testing failed';
      setError(errorMessage);
      addToast(`Testing failed: ${errorMessage}`, 'error');
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
      const blob = await apiClient.downloadModelReport(modelId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelId}_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast('Model report downloaded successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
      addToast(`Download failed: ${errorMessage}`, 'error');
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