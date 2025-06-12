"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  useAssetTypes, 
  useDepartments, 
  useAssetValues,
  useCreateAsset,
  useUpdateAsset 
} from "@/lib/hooks/useAssets";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";

const AssetFormPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const assetId = searchParams.get("id");
  const assetName = searchParams.get("asset_name");
  const typeAsset = searchParams.get("asset_type");
  const assetValue = searchParams.get("asset_value");
  const owner = searchParams.get("asset_owner");
  const desc = searchParams.get("description");

  const [asset, setAsset] = useState(assetName || "");
  const [assetType, setAssetType] = useState(typeAsset || "");
  const [assetOwner, setAssetOwner] = useState(owner || "");
  const [assetValueMapping, setAssetValueMapping] = useState(assetValue || "");
  const [description, setDescription] = useState(desc || "");

  // Fetch data using REST API hooks with fallbacks
  const { data: assetTypesData, isLoading: assetTypesLoading, error: assetTypesError, isPlaceholderData: isAssetTypesPlaceholder } = useAssetTypes();
  const { data: departmentsData, isLoading: departmentsLoading, error: departmentsError, isPlaceholderData: isDepartmentsPlaceholder } = useDepartments();
  const { data: assetValuesData, isLoading: assetValuesLoading, error: assetValuesError, isPlaceholderData: isAssetValuesPlaceholder } = useAssetValues();

  // Mutations for create/update
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate required fields
    if (!asset || !assetType || !assetOwner || !assetValueMapping) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const assetData = {
        asset,
        asset_type: assetType,
        owner_department: assetOwner,
        asset_value: assetValueMapping,
        description,
      };

      if (assetId) {
        // Update existing asset
        await updateAssetMutation.mutateAsync({
          id: assetId,
          data: assetData,
        });
        toast.success("Asset has been updated successfully.");
      } else {
        // Create new asset
        await createAssetMutation.mutateAsync(assetData);
        toast.success("Asset has been added successfully.");
      }
      
      router.push("/classification/assets"); // Redirect after successful operation
    } catch (error) {
      console.error("Error submitting form:", error);
      // More detailed error message
      if (error instanceof Error && error.message.includes('fetch')) {
        toast.error("Unable to connect to the API server. Please ensure the Django API is running.");
      } else {
        toast.error("Failed to save asset. Please try again.");
      }
    }
  };

  // Loading state
  const isLoading =
    assetTypesLoading ||
    departmentsLoading ||
    assetValuesLoading ||
    createAssetMutation.isPending ||
    updateAssetMutation.isPending;

  // Check if we're using placeholder data (API not available)
  const usingPlaceholderData = isAssetTypesPlaceholder || isDepartmentsPlaceholder || isAssetValuesPlaceholder;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Extract data from API responses
  const assetTypes = assetTypesData || [];
  const departments = departmentsData || [];
  const assetValues = assetValuesData || [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {assetId ? "Edit Asset" : "Add a New Asset"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the form below to {assetId ? "update the" : "add a new"} asset.
        </p>
      </div>

      {/* API Status Alert */}
      {usingPlaceholderData && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Using sample data for development. Connect to the Django API for full functionality.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset Name *</Label>
                <Input
                  id="asset"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="Enter asset name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-type">Asset Type *</Label>
                <Select value={assetType} onValueChange={setAssetType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-owner">Asset Owner *</Label>
                <Select value={assetOwner} onValueChange={setAssetOwner} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-value">Asset Value *</Label>
                <Select value={assetValueMapping} onValueChange={setAssetValueMapping} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset value" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetValues.map((mapping: any) => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.qualitative_value || mapping.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter asset description (optional)"
                rows={6}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/classification/assets")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {assetId ? "Update Asset" : "Add Asset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetFormPage;
