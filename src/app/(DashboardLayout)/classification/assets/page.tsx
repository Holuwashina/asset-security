'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useAssets, 
  useDeleteAsset,
  useClassifyAsset,
  Asset
} from '@/lib/hooks/useAssets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  AlertTriangle,
  BarChart3,
  Loader2,
  Database,
  FileText
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';
import { apiClient } from '@/lib/api';

const AssetsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAssetId, setProcessingAssetId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; name: string } | null>(null);


  const { data: assetsData, isLoading, refetch: refetchAssets } = useAssets();
  const deleteAssetMutation = useDeleteAsset();
  const classifyAssetMutation = useClassifyAsset();


  const assets = assetsData?.results || [];
  const filteredAssets = assets.filter((asset: Asset) =>
    asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.owner_department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAsset = (assetId: string, assetName: string) => {
    setAssetToDelete({ id: assetId, name: assetName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;

    try {
      await deleteAssetMutation.mutateAsync(assetToDelete.id);
      toast.success('Asset deleted successfully');
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error: any) {
      console.error('Delete asset error:', error);
      
      let errorMessage = 'Failed to delete asset';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Asset not found. It may have already been deleted.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this asset.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error occurred while deleting asset.';
      } else if (error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const cancelDeleteAsset = () => {
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const handleClassifyAsset = async (assetId: string) => {
    setProcessingAssetId(assetId);
    try {
      await apiClient.compareModels(assetId, 'Asset Classification');
      toast.success('Asset classified successfully using model comparison');
      // Refresh the data to show updated predictions
      await refetchAssets();
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data?.suggestion) {
        // Handle insufficient parameters error
        const errorData = error.response.data;
        toast.error(
          `${errorData.error}\n\n${errorData.suggestion}`,
          {
            duration: 6000,
            action: {
              label: 'Manual Classification',
              onClick: () => router.push(`/classification/asset-classify?id=${assetId}`)
            }
          }
        );
      } else {
      toast.error('Failed to classify asset. Please check your API connection.');
      }
    } finally {
      setProcessingAssetId(null);
    }
  };

  const handleIdentifyRisk = (assetId: string) => {
    router.push(`/classification/risk-identification?id=${assetId}`);
  };

  const handleAnalyzeRisk = (assetId: string) => {
    router.push(`/classification/risk-analysis?id=${assetId}`);
  };



  const handleBatchModelComparison = async () => {
    if (filteredAssets.length === 0) {
      toast.error('No assets available for model comparison');
      return;
    }

    const assetsWithoutPredictions = filteredAssets.filter((asset: Asset) => 
      !asset.traditional_fuzzy_prediction && !asset.modern_svm_prediction && !asset.modern_dt_prediction
    );

    if (assetsWithoutPredictions.length === 0) {
      toast.info('All assets already have model predictions');
      return;
    }

    setProcessingAssetId('batch');
    try {
      const assetIds = assetsWithoutPredictions.map((asset: Asset) => asset.id);
      
      // Use batch comparison endpoint if available, otherwise run individual comparisons
      let successCount = 0;
      let errorCount = 0;

      for (const assetId of assetIds) {
        try {
          await apiClient.compareModels(assetId, 'Batch Model Comparison');
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to compare models for asset ${assetId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`Model comparison completed for ${successCount} assets${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        // Refresh the data to show updated predictions
        await refetchAssets();
      } else {
        toast.error('Failed to run model comparisons');
      }
    } catch (error: any) {
      console.error('Batch model comparison error:', error);
      toast.error('Failed to run batch model comparison');
    } finally {
      setProcessingAssetId(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Asset Name',
      'Asset Type',
      // Input Parameters
      'Business Criticality',
      'Data Sensitivity', 
      'Operational Dependency',
      'Regulatory Impact',
      // CIA Assessment
      'Confidentiality',
      'Integrity',
      'Availability',
      'Risk Index',
      // Model Predictions
      'Traditional Fuzzy Prediction',
      'Modern SVM Prediction',
      'Modern Decision Tree Prediction'
    ];

    const csvData = filteredAssets.map((asset: Asset) => [
      asset.asset,
      asset.asset_type,
      // Input Parameters
      asset.business_criticality || '',
      asset.data_sensitivity || '',
      asset.operational_dependency || '',
      asset.regulatory_impact || '',
      // CIA Assessment
      asset.confidentiality || '',
      asset.integrity || '',
      asset.availability || '',
      asset.risk_index || '',
      // Model Predictions
      asset.traditional_fuzzy_prediction || '',
      asset.modern_svm_prediction || '',
      asset.modern_dt_prediction || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((field: string | number | undefined) => `"${field || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `thesis-asset-classification-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getClassificationBadge = (classification?: string): React.ReactElement => {
    if (!classification) return <Badge variant="secondary">Not Classified</Badge>;
    
    // Remove numerical score from the classification label (e.g., "Moderate Impact (0.50)" -> "Moderate Impact")
    const cleanClassification = classification.replace(/\s*\([0-9.]+\)$/, '');
    
    // Handle Government Classification levels
    let badgeClass = '';
    
    switch (cleanClassification) {
      case 'Restricted':
        badgeClass = 'bg-red-600 text-white hover:bg-red-700';
        break;
      case 'Confidential':
        badgeClass = 'bg-orange-500 text-white hover:bg-orange-600';
        break;
      case 'Official':
        badgeClass = 'bg-yellow-500 text-white hover:bg-yellow-600';
        break;
      case 'Public':
        badgeClass = 'bg-green-600 text-white hover:bg-green-700';
        break;
      default:
        badgeClass = 'bg-gray-500 text-white';
    }
    
    return (
      <Badge className={badgeClass}>
        {cleanClassification}
      </Badge>
    );
  };

  const getRiskBadge = (riskCategory?: string): React.ReactElement => {
    if (!riskCategory) return <Badge variant="secondary">Not Analyzed</Badge>;
    
    // Remove numerical score from the risk category label (e.g., "Medium Risk (0.50)" -> "Medium Risk")
    const cleanRiskCategory = riskCategory.replace(/\s*\([0-9.]+\)$/, '');
    
    let badgeClass = '';
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    
    switch (cleanRiskCategory) {
      case 'High Risk':
      case 'Critical Risk':
        badgeClass = 'bg-red-600 text-white hover:bg-red-700';
        variant = 'destructive';
        break;
      case 'Medium Risk':
        badgeClass = 'bg-yellow-500 text-white hover:bg-yellow-600';
        break;
      case 'Low Risk':
        badgeClass = 'bg-green-600 text-white hover:bg-green-700';
        break;
      default:
        variant = 'secondary';
    }
    
    return (
      <Badge variant={variant} className={badgeClass}>
        {cleanRiskCategory}
      </Badge>
    );
  };

  const getModelPredictionBadge = (prediction?: string): React.ReactElement | null => {
    if (!prediction) return null;
    
    let badgeClass = '';
    
    switch (prediction) {
      case 'Restricted':
        badgeClass = 'bg-red-600 text-white hover:bg-red-700';
        break;
      case 'Confidential':
        badgeClass = 'bg-orange-500 text-white hover:bg-orange-600';
        break;
      case 'Official':
        badgeClass = 'bg-yellow-500 text-white hover:bg-yellow-600';
        break;
      case 'Public':
        badgeClass = 'bg-green-600 text-white hover:bg-green-700';
        break;
      default:
        badgeClass = 'bg-gray-500 text-white';
    }
    
    return (
      <Badge className={`${badgeClass} text-xs font-medium`}>
        {prediction}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <PageContainer title="Assets" description="Manage your information assets">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Assets" description="Manage your information assets">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBatchModelComparison}
              className="flex items-center gap-2"
              disabled={filteredAssets.length === 0 || processingAssetId === 'batch'}
            >
              {processingAssetId === 'batch' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              Run Model Comparisons
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="flex items-center gap-2"
              disabled={filteredAssets.length === 0}
            >
              <FileText className="h-4 w-4" />
              Export CSV
            </Button>
          <Button 
              variant="outline"
            onClick={() => router.push('/classification/asset-form')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
          </div>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets Classification Results ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Asset Information</TableHead>
                    <TableHead className="w-[240px]">Security Evaluation Criteria</TableHead>
                    <TableHead className="w-[160px]">CIA Assessment</TableHead>
                    <TableHead className="w-[200px]">Model Classification</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <Database className="h-12 w-12 text-gray-300" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-600">
                              {searchTerm ? 'No assets found' : 'No assets yet'}
                            </h3>
                            <p className="text-gray-500 mt-1">
                              {searchTerm 
                                ? 'Try adjusting your search terms.' 
                                : 'Get started by adding your first information asset.'
                              }
                            </p>
                          </div>
                          {!searchTerm && (
                            <Button 
                              onClick={() => router.push('/classification/asset-form')}
                              className="mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Asset
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset: Asset) => (
                      <TableRow key={asset.id} className="hover:bg-gray-50/50">
                        {/* Asset Information */}
                        <TableCell className="p-4">
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-900 text-sm leading-tight">
                              {asset.asset}
                            </div>
                            <Badge variant="outline" className="text-xs font-medium">
                              {asset.asset_type}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Security Evaluation Criteria */}
                        <TableCell className="p-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Business Criticality:</span>
                                <span className="text-xs font-mono font-semibold bg-blue-50 px-2 py-1 rounded">
                                  {asset.business_criticality ? asset.business_criticality.toFixed(2) : '—'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Data Sensitivity:</span>
                                <span className="text-xs font-mono font-semibold bg-green-50 px-2 py-1 rounded">
                                  {asset.data_sensitivity ? asset.data_sensitivity.toFixed(2) : '—'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Operational Dependency:</span>
                                <span className="text-xs font-mono font-semibold bg-orange-50 px-2 py-1 rounded">
                                  {asset.operational_dependency ? asset.operational_dependency.toFixed(2) : '—'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-600">Regulatory Impact:</span>
                                <span className="text-xs font-mono font-semibold bg-purple-50 px-2 py-1 rounded">
                                  {asset.regulatory_impact ? asset.regulatory_impact.toFixed(2) : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* CIA Assessment */}
                        <TableCell className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-red-600">Confidentiality:</span>
                              <span className="text-xs font-mono font-semibold bg-red-50 px-2 py-1 rounded">
                                {asset.confidentiality ? asset.confidentiality.toFixed(2) : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-blue-600">Integrity:</span>
                              <span className="text-xs font-mono font-semibold bg-blue-50 px-2 py-1 rounded">
                                {asset.integrity ? asset.integrity.toFixed(2) : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-green-600">Availability:</span>
                              <span className="text-xs font-mono font-semibold bg-green-50 px-2 py-1 rounded">
                                {asset.availability ? asset.availability.toFixed(2) : '—'}
                              </span>
                            </div>
                            {asset.risk_index && (
                              <div className="pt-1 mt-2 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-700">Risk Index:</span>
                                  <span className="text-xs font-mono font-bold bg-yellow-50 px-2 py-1 rounded text-yellow-800">
                                    {asset.risk_index.toFixed(3)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>


                        {/* Model Classification */}
                        <TableCell className="p-4">
                          {asset.traditional_fuzzy_prediction || asset.modern_svm_prediction || asset.modern_dt_prediction ? (
                            <div className="overflow-hidden">
                              <table className="w-full text-xs table-fixed">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-1 px-2 font-medium text-gray-700 w-1/3">Model</th>
                                    <th className="text-center py-1 px-2 font-medium text-gray-700 w-1/3">Classification</th>
                                    <th className="text-center py-1 px-2 font-medium text-gray-700 w-1/3">Score</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-2 px-2 font-medium text-gray-600 w-1/3 text-left">Fuzzy Logic</td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.traditional_fuzzy_prediction ? 
                                        getModelPredictionBadge(asset.traditional_fuzzy_prediction) : 
                                        <span className="text-gray-400">—</span>
                                      }
                                    </td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.traditional_fuzzy_score !== null && asset.traditional_fuzzy_score !== undefined ? (
                                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                          {asset.traditional_fuzzy_score.toFixed(3)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                  </tr>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-2 px-2 font-medium text-gray-600 w-1/3 text-left">SVM</td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.modern_svm_prediction ? 
                                        getModelPredictionBadge(asset.modern_svm_prediction) : 
                                        <span className="text-gray-400">—</span>
                                      }
                                    </td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.modern_svm_score !== null && asset.modern_svm_score !== undefined ? (
                                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                          {asset.modern_svm_score.toFixed(3)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="py-2 px-2 font-medium text-gray-600 w-1/3 text-left">Decision Tree</td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.modern_dt_prediction ? 
                                        getModelPredictionBadge(asset.modern_dt_prediction) : 
                                        <span className="text-gray-400">—</span>
                                      }
                                    </td>
                                    <td className="py-2 px-2 text-center w-1/3">
                                      {asset.modern_dt_score !== null && asset.modern_dt_score !== undefined ? (
                                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                          {asset.modern_dt_score.toFixed(3)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <span className="text-xs text-gray-400 italic">No model comparisons available</span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                {processingAssetId === asset.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/classification/asset-assessment?id=${asset.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/classification/asset-form?id=${asset.id}`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleClassifyAsset(asset.id)}
                                disabled={processingAssetId === asset.id}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Classify Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleIdentifyRisk(asset.id)}
                                disabled={processingAssetId === asset.id}
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Identify Risk
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAnalyzeRisk(asset.id)}
                                disabled={processingAssetId === asset.id || !asset.risk_index}
                              >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Analyze Risk
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAsset(asset.id, asset.asset)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Asset
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&quot;{assetToDelete?.name}&quot;</strong>?
              <br /><br />
              This action cannot be undone and will permanently delete the asset and remove all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Asset classification data</li>
                <li>Risk assessment results</li>
                <li>Analysis history</li>
                <li>Model comparison data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteAsset}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteAssetMutation.isPending ? undefined : confirmDeleteAsset}
              className={`bg-red-600 hover:bg-red-700 focus:ring-red-600 ${deleteAssetMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {deleteAssetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Asset
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default AssetsPage;
