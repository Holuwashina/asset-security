import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Asset } from '../api';
import { useToast } from './useToast';

// Assets Hooks
export const useAssets = () => {
  return useQuery({
    queryKey: ['assets'],
    queryFn: () => apiClient.getAssets(),
    select: (data: any) => data?.results ? { results: data.results, count: data.count } : data,
    retry: 0, // Don't retry
    retryOnMount: true, // ✅ Enable refetch on mount to get fresh data
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0, // ✅ Consider data immediately stale to ensure fresh data
  });
};

export const useAsset = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => apiClient.getAsset(id),
    enabled: !!id,
    retry: 0,
    retryOnMount: true,  // ✅ Enable refetch on mount for edit functionality
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,  // ✅ Consider data immediately stale to ensure fresh data
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: (data: Partial<Asset>) => apiClient.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      addToast('Asset created successfully', 'success');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create asset';
      addToast(message, 'error');
    }
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Asset> }) =>
      apiClient.updateAsset(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] });
      addToast('Asset updated successfully', 'success');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update asset';
      addToast(message, 'error');
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
    onError: (error: any) => {
      console.error('Delete asset error:', error);
      throw error; // Re-throw to let the component handle it
    }
  });
};

// Classification Hooks
export const useClassifyAsset = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.classifyAsset(id),
    onSuccess: (_: any, id: string) => {
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      addToast('Asset classified successfully', 'success');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to classify asset';
      addToast(message, 'error');
    }
  });
};

export const useIdentifyRisk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: { 
        confidentiality: number; 
        integrity: number; 
        availability: number;
        methodology?: string;
        include_methodologies?: string[];
      }
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

export const useRiskIdentificationMethodologies = (assetId: string) => {
  return useQuery({
    queryKey: ['risk-methodologies', assetId],
    queryFn: () => apiClient.getRiskIdentificationMethodologies(assetId),
    enabled: !!assetId,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - methodologies don't change often
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
  });
};

// export const useAssetValues = () => { // Removed
//   return useQuery({
//     queryKey: ['asset-values'],
//     queryFn: () => apiClient.getAssetValues(),
//     select: (data: any) => data?.results || data,
//     retry: 0,
//     retryOnMount: false,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//   });
// };

export const useAssetTypes = () => {
  return useQuery({
    queryKey: ['asset-types'],
    queryFn: () => apiClient.getAssetTypes(),
    select: (data: any) => data?.results || data,
    retry: 0,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useAssessmentQuestions = () => {
  return useQuery({
    queryKey: ['assessment-questions'],
    queryFn: () => apiClient.getAssessmentQuestions(),
    select: (data: any) => {
      // Handle API response format and map to expected format
      const questions = data?.results || data || [];
      return questions.map((q: any) => ({
        ...q,
        questionText: q.question_text || q.questionText,
        category: {
          id: q.category?.id || q.category,
          name: q.category_name || q.category?.name || 'Uncategorized'
        }
      }));
    },
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
  });
};

// Assessment Questions CRUD Hooks
export const useCreateAssessmentQuestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => {
      // Map frontend data format to API format
      const apiData = {
        question_text: data.questionText,
        category: data.category,
      };
      return apiClient.createAssessmentQuestion(apiData);
    },
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
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      // Map frontend data format to API format
      const apiData = {
        question_text: data.questionText || data.question_text,
        category: data.category,
      };
      return apiClient.updateAssessmentQuestion(id, apiData);
    },
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


export type { Asset };