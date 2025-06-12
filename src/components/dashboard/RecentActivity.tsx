import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Cloud, 
  Shield, 
  BarChart3, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  asset: string;
  classification?: string;
  mathematical_risk_category?: string;
  traditional_fuzzy_prediction?: string;
  modern_svm_prediction?: string;
  modern_dt_prediction?: string;
  created_at: string;
  updated_at: string;
}

interface RecentActivityProps {
  assets: Asset[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ assets }) => {
  const getActivityIcon = (asset: Asset) => {
    if (asset.modern_svm_prediction || asset.modern_dt_prediction) {
      return <TrendingUp className="h-5 w-5 text-green-600" />;
    }
    if (asset.mathematical_risk_category) {
      return <Shield className="h-5 w-5 text-orange-600" />;
    }
    if (asset.classification) {
      return <BarChart3 className="h-5 w-5 text-blue-600" />;
    }
    return <Cloud className="h-5 w-5 text-gray-600" />;
  };

  const getActivityDescription = (asset: Asset) => {
    if (asset.modern_svm_prediction || asset.modern_dt_prediction) {
      return `Model comparison completed - ${asset.modern_svm_prediction || asset.modern_dt_prediction}`;
    }
    if (asset.mathematical_risk_category) {
      return `Risk analysis completed - ${asset.mathematical_risk_category} risk`;
    }
    if (asset.classification) {
      return `Asset classified as ${asset.classification}`;
    }
    return 'Asset created';
  };

  const getActivityBadgeVariant = (asset: Asset): "default" | "secondary" | "destructive" | "outline" => {
    if (asset.modern_svm_prediction || asset.modern_dt_prediction) return 'default';
    if (asset.mathematical_risk_category) return 'secondary';
    if (asset.classification) return 'outline';
    return 'secondary';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-full border rounded-xl shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6 text-gray-900">
          Recent Activity
        </h3>
        
        {assets.length > 0 ? (
          <div className="space-y-4">
            {assets.slice(0, 8).map((asset, index) => (
              <div key={asset.id} className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 bg-gray-100">
                    <AvatarFallback className="bg-gray-100">
                      {getActivityIcon(asset)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {asset.asset}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getActivityDescription(asset)}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant={getActivityBadgeVariant(asset)} className="text-xs">
                        {asset.modern_svm_prediction || 
                         asset.mathematical_risk_category || 
                         asset.classification || 
                         'New'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {formatDate(asset.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {index < Math.min(assets.length, 8) - 1 && (
                  <div className="border-t border-gray-100" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-gray-500">
            <Cloud className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">
              No recent activity
            </p>
            <p className="text-xs">
              Create and classify assets to see activity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;