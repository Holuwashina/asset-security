'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useAssets, 
  useDeleteAsset,
  useClassifyAsset,
  useIdentifyRisk,
  useAnalyzeRisk,
  useCompareModels,
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
  GitCompare,
  Loader2,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/PageContainer';

const AssetsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAssetId, setProcessingAssetId] = useState<string | null>(null);

  // Hooks - no error handling, just use empty data when API unavailable
  const { data: assetsData, isLoading } = useAssets();
  const deleteAssetMutation = useDeleteAsset();
  const classifyAssetMutation = useClassifyAsset();
  const identifyRiskMutation = useIdentifyRisk();
  const analyzeRiskMutation = useAnalyzeRisk();
  const compareModelsMutation = useCompareModels();

  // Handle empty or no data gracefully
  const assets = assetsData?.results || [];
  
  // Filter assets based on search term
  const filteredAssets = assets.filter((asset: Asset) =>
    asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.owner_department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assetName}"?\n\nThis action cannot be undone and will permanently delete the asset and remove all associated data.`
    );
    
    if (!confirmed) return;

    try {
      await deleteAssetMutation.mutateAsync(assetId);
      toast.success('Asset deleted successfully');
    } catch (error) {
      toast.error('Failed to delete asset. Please check your API connection.');
    }
  };

  const handleClassifyAsset = async (assetId: string) => {
    setProcessingAssetId(assetId);
    try {
      await classifyAssetMutation.mutateAsync(assetId);
      toast.success('Asset classified successfully');
    } catch (error) {
      toast.error('Failed to classify asset. Please check your API connection.');
    } finally {
      setProcessingAssetId(null);
    }
  };

  const handleIdentifyRisk = async (assetId: string) => {
    setProcessingAssetId(assetId);
    try {
      // Use sample CIA values for demonstration
      await identifyRiskMutation.mutateAsync({
        id: assetId,
        data: {
          confidentiality: Math.floor(Math.random() * 5) + 1,
          integrity: Math.floor(Math.random() * 5) + 1,
          availability: Math.floor(Math.random() * 5) + 1
        }
      });
      toast.success('Risk identified successfully');
    } catch (error) {
      toast.error('Failed to identify risk. Please check your API connection.');
    } finally {
      setProcessingAssetId(null);
    }
  };

  const handleAnalyzeRisk = async (assetId: string) => {
    setProcessingAssetId(assetId);
    try {
      await analyzeRiskMutation.mutateAsync(assetId);
      toast.success('Risk analyzed successfully');
    } catch (error) {
      toast.error('Failed to analyze risk. Please check your API connection.');
    } finally {
      setProcessingAssetId(null);
    }
  };

  const handleCompareModels = async (assetId: string) => {
    setProcessingAssetId(assetId);
    try {
      await compareModelsMutation.mutateAsync(assetId);
      toast.success('Models compared successfully');
    } catch (error) {
      toast.error('Failed to compare models. Please check your API connection.');
    } finally {
      setProcessingAssetId(null);
    }
  };

  const getClassificationBadge = (classification?: string, value?: number) => {
    if (!classification) return <Badge variant="secondary">Not Classified</Badge>;
    
    const variant = 
      classification === 'Very High' || classification === 'High' ? 'destructive' :
      classification === 'Medium' ? 'default' : 'secondary';
    
    return (
      <Badge variant={variant}>
        {classification} {value && `(${value.toFixed(1)})`}
      </Badge>
    );
  };

  const getRiskBadge = (riskCategory?: string) => {
    if (!riskCategory) return <Badge variant="secondary">Not Analyzed</Badge>;
    
    const variant = 
      riskCategory === 'High Risk' ? 'destructive' :
      riskCategory === 'Medium Risk' ? 'default' : 'secondary';
    
    return <Badge variant={variant}>{riskCategory}</Badge>;
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
          <Button 
            onClick={() => router.push('/classification/asset-form')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets ({filteredAssets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
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
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{asset.asset}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {asset.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.asset_type}</Badge>
                        </TableCell>
                        <TableCell>{asset.owner_department_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{asset.asset_value_name}</Badge>
                        </TableCell>
                        <TableCell>
                          {getClassificationBadge(asset.classification, asset.classification_value)}
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(asset.mathematical_risk_category)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {asset.classification && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Classified
                              </Badge>
                            )}
                            {asset.risk_index && (
                              <Badge variant="outline" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Risk ID
                              </Badge>
                            )}
                            {asset.calculated_risk_level && (
                              <Badge variant="outline" className="text-xs">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Analyzed
                              </Badge>
                            )}
                            {asset.traditional_fuzzy_prediction && (
                              <Badge variant="outline" className="text-xs">
                                <GitCompare className="h-3 w-3 mr-1" />
                                Compared
                              </Badge>
                            )}
                          </div>
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
                              <DropdownMenuItem
                                onClick={() => handleCompareModels(asset.id)}
                                disabled={processingAssetId === asset.id}
                              >
                                <GitCompare className="mr-2 h-4 w-4" />
                                Compare Models
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
    </PageContainer>
  );
};

export default AssetsPage;
