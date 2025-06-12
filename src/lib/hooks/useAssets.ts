import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Asset } from '../api';

// Minimal fallback data for development when API is not available
const fallbackDepartments = [
  { id: '1', name: 'IT Department', description: 'Information Technology' },
  { id: '2', name: 'Finance Department', description: 'Financial Operations' },
  { id: '3', name: 'HR Department', description: 'Human Resources' },
];

const fallbackAssetTypes = [
  { id: '1', name: 'Database', description: 'Database systems' },
  { id: '2', name: 'Application', description: 'Software applications' },
  { id: '3', name: 'Network', description: 'Network infrastructure' },
  { id: '4', name: 'Server', description: 'Server hardware' },
];

const fallbackAssetValues = [
  { id: '1', name: 'Low', qualitative_value: 'Low', description: 'Low value assets' },
  { id: '2', name: 'Medium', qualitative_value: 'Medium', description: 'Medium value assets' },
  { id: '3', name: 'High', qualitative_value: 'High', description: 'High value assets' },
  { id: '4', name: 'Critical', qualitative_value: 'Critical', description: 'Critical value assets' },
];

// Assets Hooks
export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => apiClient.getAssets(),
    select: (data: any) => data?.results ? { results: data.results, count: data.count } : data,
    retry: 0, // Don't retry
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => apiClient.getAsset(id),
    enabled: !!id,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Asset>) => apiClient.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      apiClient.updateAsset(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

// Classification Hooks
export const useClassifyAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.classifyAsset(id),
    onSuccess: (_: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useIdentifyRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: { confidentiality: number; integrity: number; availability: number }
    }) => apiClient.identifyRisk(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useAnalyzeRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.analyzeRisk(id),
    onSuccess: (_: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useCompareModels = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.compareModels(id),
    onSuccess: (_: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

// Supporting Data Hooks with Fallbacks
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => apiClient.getDepartments(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Provide fallback data when API is not available
    placeholderData: fallbackDepartments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssetValues = () => {
  return useQuery({
    queryKey: ['asset-values'],
    queryFn: () => apiClient.getAssetValues(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Provide fallback data when API is not available
    placeholderData: fallbackAssetValues,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssetTypes = () => {
  return useQuery({
    queryKey: ['asset-types'],
    queryFn: () => apiClient.getAssetTypes(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Provide fallback data when API is not available
    placeholderData: fallbackAssetTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssessmentQuestions = () => {
  return useQuery({
    queryKey: ['assessment-questions'],
    queryFn: () => apiClient.getAssessmentQuestions(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => apiClient.getPerformanceMetrics(),
    select: (data: any) => data?.performance_metrics || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Return empty array instead of undefined when no data
    placeholderData: [],
  });
};

// Assessment Questions CRUD Hooks
export const useCreateAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiClient.createAssessmentQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-questions'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useUpdateAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateAssessmentQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-questions'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

export const useDeleteAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAssessmentQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-questions'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

// Batch Operations
export const useBatchCompare = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assetIds, experimentName }: { assetIds: string[]; experimentName?: string }) =>
      apiClient.batchCompare(assetIds, experimentName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
    onError: (error) => {
      // Silent error handling - no console.error
    }
  });
};

// Model Performance Hooks
export const useClassificationReports = () => {
  return useQuery({
    queryKey: ['classification-reports'],
    queryFn: () => apiClient.getClassificationReports(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useConfusionMatrices = () => {
  return useQuery({
    queryKey: ['confusion-matrices'],
    queryFn: () => apiClient.getConfusionMatrices(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useModelComparisons = () => {
  return useQuery({
    queryKey: ['model-comparisons'],
    queryFn: () => apiClient.getModelComparisons(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Export the Asset type for use in components
export type { Asset };