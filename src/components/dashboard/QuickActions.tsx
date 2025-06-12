import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Play, 
  BarChart3, 
  Shield,
  TrendingUp,
  Upload
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  totalAssets: number;
  unclassifiedAssets: number;
  pendingRiskAnalysis: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  totalAssets, 
  unclassifiedAssets, 
  pendingRiskAnalysis 
}) => {
  const router = useRouter();

  const handleAddAsset = () => {
    router.push('/classification/asset-form');
  };

  const handleViewAssets = () => {
    router.push('/classification/assets');
  };

  const handleRiskIdentification = () => {
    router.push('/classification/risk-identification');
  };

  const handleModelMetrics = () => {
    router.push('/classification/model-metrics');
  };

  return (
    <Card className="h-full border rounded-xl shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900">
          Quick Actions
        </h3>
        
        {/* Primary Actions */}
        <div className="space-y-3 mb-6">
          <Button 
            onClick={handleAddAsset}
            className="w-full py-3 rounded-lg"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Asset
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRiskIdentification}
            className="w-full py-3 rounded-lg"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Risk Analysis
          </Button>
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Action Items */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">
            Actions Needed
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={handleViewAssets}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-8 w-8 bg-blue-100">
                <AvatarFallback className="bg-blue-100">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {unclassifiedAssets} Assets to Classify
                </p>
                <p className="text-xs text-gray-500">
                  Click to view and classify pending assets
                </p>
              </div>
            </button>

            <button 
              onClick={handleRiskIdentification}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-8 w-8 bg-orange-100">
                <AvatarFallback className="bg-orange-100">
                  <Shield className="h-4 w-4 text-orange-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {pendingRiskAnalysis} Risk Assessments
                </p>
                <p className="text-xs text-gray-500">
                  Assets pending risk analysis
                </p>
              </div>
            </button>

            <button 
              onClick={handleModelMetrics}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-8 w-8 bg-green-100">
                <AvatarFallback className="bg-green-100">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  View Model Performance
                </p>
                <p className="text-xs text-gray-500">
                  Compare ML model accuracy
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Statistics Summary */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">
            System Overview
          </p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Assets:</span>
              <span className="text-xs font-bold text-gray-900">{totalAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Completion Rate:</span>
              <span className="text-xs font-bold text-green-600">
                {totalAssets > 0 ? Math.round(((totalAssets - unclassifiedAssets) / totalAssets) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Pending Actions:</span>
              <span className="text-xs font-bold text-orange-600">
                {unclassifiedAssets + pendingRiskAnalysis}
              </span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-3 bg-blue-600 text-white rounded-lg">
          <div className="flex items-center mb-2">
            <Upload className="h-5 w-5 mr-2" />
            <p className="text-sm font-bold">
              Cloud Asset Classification
            </p>
          </div>
          <p className="text-xs opacity-90">
            Secure your cloud infrastructure with intelligent asset risk assessment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;