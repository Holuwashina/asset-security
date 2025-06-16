"use client";

import React, { useState, useEffect } from 'react';
import { useMLTraining } from '@/lib/hooks/useMLTraining';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Brain,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { Dataset, TrainedModel, ModelPrediction } from '@/lib/api';

export default function MLTrainingPage() {
  // Use the centralized ML Training hook
  const {
    uploadDataset,
    listDatasets,
    trainModels,
    listModels,
    testModel,
    downloadModelReport,
    validateCSVFile,
    formatModelPerformance,
    getBestModel,
    loading,
    error,
    clearError
  } = useMLTraining();

  // Local state management
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('Asset_Classification_Model');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['random_forest']);
  
  const [testData, setTestData] = useState({
    business_criticality: 0.8,
    data_sensitivity: 0.9,
    operational_dependency: 0.7,
    regulatory_impact: 0.8,
    confidentiality: 0.8,
    integrity: 0.9,
    availability: 0.7
  });
  const [selectedModelForTest, setSelectedModelForTest] = useState<string>('');
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);

  // Check API status on load
  useEffect(() => {
    checkApiStatus();
  }, []);

  // No derived features needed - using 7 direct parameters

  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      // Test API by trying to list datasets
      await listDatasets();
      setApiStatus('online');
      loadInitialData();
    } catch (err) {
      setApiStatus('offline');
    }
  };

  const loadInitialData = async () => {
    try {
      // Load datasets
      const datasetsData = await listDatasets();
      setDatasets(datasetsData || []);

      // Load models
      const modelsData = await listModels();
      setTrainedModels(modelsData || []);
    } catch (err) {
      // Handle error silently for production
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    // Validate file
    const validation = validateCSVFile(selectedFile);
    if (!validation.valid) {
      return;
    }

    try {
      await uploadDataset(selectedFile, modelName, 'training');
      setSelectedFile(null);
      await loadInitialData(); // Reload datasets
      setActiveTab('train');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleTrainModels = async () => {
    if (!selectedDataset) return;

    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 90));
    }, 1000);

    try {
      await trainModels(selectedDataset, selectedModels);
      clearInterval(progressInterval);
      setTrainingProgress(100);
      await loadInitialData(); // Reload models
      setActiveTab('results');
    } catch (err) {
      clearInterval(progressInterval);
      // Error handled by hook
    } finally {
      setIsTraining(false);
    }
  };

  const handleTestModel = async () => {
    if (!selectedModelForTest) return;

    try {
      const result = await testModel(selectedModelForTest, [testData]);
      if (result) {
        setPredictions(result.predictions || []);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDownloadReport = async (modelId: string) => {
    try {
      await downloadModelReport(modelId);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Loading state
  const isLoading = loading || isTraining;

  // Check if we're using placeholder data (API not available)
  const usingPlaceholderData = apiStatus === 'offline';

  if (loading && datasets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Loading ML Training data...</p>
        </div>
      </div>
    );
  }

  const bestModel = getBestModel(trainedModels);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ML Training & Testing</h1>
          <p className="text-muted-foreground">
            Upload datasets, train models, and test performance with real-time results
          </p>
        </div>
        <div className="flex items-center gap-2">
          {apiStatus === 'checking' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Checking API
            </Badge>
          )}
          {apiStatus === 'online' && (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
              <Wifi className="h-3 w-3" />
              API Online
            </Badge>
          )}
          {apiStatus === 'offline' && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              API Offline
            </Badge>
          )}
          <Button onClick={checkApiStatus} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && apiStatus === 'online' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button size="sm" variant="outline" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Best Model Summary */}
      {bestModel && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Best Performing Model</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {formatModelPerformance(bestModel).model_type_formatted} - 
                  {formatModelPerformance(bestModel).testing_accuracy_percent}% accuracy
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleDownloadReport(bestModel.model_id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Dataset
          </TabsTrigger>
          <TabsTrigger value="train" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Train Models
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Test Models
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Upload Dataset Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Upload Training Dataset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-name">Model Name</Label>
                  <Input
                    id="model-name"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Asset_Classification_Model"
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
              </div>

              {selectedFile && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || loading || apiStatus === 'offline'}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Upload Dataset'}
              </Button>

              {apiStatus === 'offline' && (
                <p className="text-sm text-muted-foreground text-center">
                  Backend API is offline. Please start the Django server to upload datasets.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Datasets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Uploaded Datasets
                <Badge variant="secondary">{datasets.length} datasets</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {datasets.map((dataset) => (
                  <div key={dataset.dataset_id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{dataset.model_name}</h3>
                      <Badge variant="secondary">{dataset.dataset_type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div>Records: {dataset.total_records.toLocaleString()}</div>
                      <div>Features: {dataset.features_count}</div>
                      <div>Classes: {dataset.target_classes.length}</div>
                      <div>Date: {new Date(dataset.upload_date).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Classes: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dataset.target_classes.map((cls) => (
                          <Badge key={cls} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {datasets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {apiStatus === 'online' 
                      ? "No datasets uploaded yet. Upload a CSV file to get started."
                      : "Cannot load datasets - API is offline."
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Train Models Tab */}
        <TabsContent value="train" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Train Machine Learning Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset-select">Select Dataset</Label>
                <select
                  id="dataset-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  disabled={apiStatus === 'offline'}
                >
                  <option value="">Choose a dataset...</option>
                  {datasets.map((dataset) => (
                    <option key={dataset.dataset_id} value={dataset.dataset_id}>
                      {dataset.model_name} ({dataset.total_records} records)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Model Types to Train</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'random_forest', label: 'Random Forest' },
                    { id: 'svm', label: 'Support Vector Machine' },
                    { id: 'decision_tree', label: 'Decision Tree' }
                  ].map((model) => (
                    <label key={model.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModels([...selectedModels, model.id]);
                          } else {
                            setSelectedModels(selectedModels.filter(m => m !== model.id));
                          }
                        }}
                        disabled={apiStatus === 'offline'}
                      />
                      <span>{model.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={handleTrainModels} 
                disabled={!selectedDataset || selectedModels.length === 0 || loading || apiStatus === 'offline'}
                className="w-full"
              >
                {loading ? 'Training Models...' : 'Start Training'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Models Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Test Trained Models
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-select">Select Model</Label>
                <select
                  id="model-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedModelForTest}
                  onChange={(e) => setSelectedModelForTest(e.target.value)}
                  disabled={apiStatus === 'offline'}
                >
                  <option value="">Choose a model...</option>
                  {trainedModels.map((model) => {
                    const formatted = formatModelPerformance(model);
                    return (
                      <option key={model.model_id} value={model.model_id}>
                        {formatted.model_type_formatted} ({formatted.testing_accuracy_percent}% accuracy)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Business Criticality</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.business_criticality}
                    onChange={(e) => setTestData({...testData, business_criticality: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Sensitivity</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.data_sensitivity}
                    onChange={(e) => setTestData({...testData, data_sensitivity: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operational Dependency</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.operational_dependency}
                    onChange={(e) => setTestData({...testData, operational_dependency: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Regulatory Impact</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.regulatory_impact}
                    onChange={(e) => setTestData({...testData, regulatory_impact: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confidentiality</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.confidentiality}
                    onChange={(e) => setTestData({...testData, confidentiality: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Integrity</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.integrity}
                    onChange={(e) => setTestData({...testData, integrity: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testData.availability}
                    onChange={(e) => setTestData({...testData, availability: parseFloat(e.target.value) || 0})}
                    disabled={apiStatus === 'offline'}
                  />
                </div>
              </div>

              <Button 
                onClick={handleTestModel} 
                disabled={!selectedModelForTest || loading || apiStatus === 'offline'}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Model'}
              </Button>

              {predictions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions.map((pred, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Prediction:</span>
                          <Badge variant="default" className="text-lg">{pred.prediction}</Badge>
                        </div>
                        {Object.keys(pred.probabilities).length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Confidence Scores:</span>
                            {Object.entries(pred.probabilities).map(([category, probability]) => (
                              <div key={category} className="flex justify-between text-sm">
                                <span>{category}:</span>
                                <span className="font-mono">{((probability as number) * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trained Models Performance
                </div>
                <Badge variant="secondary">{trainedModels.length} models</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainedModels.map((model) => {
                  const formatted = formatModelPerformance(model);
                  const isBestModel = bestModel?.model_id === model.model_id;
                  
                  return (
                    <div 
                      key={model.model_id} 
                      className={`border rounded-lg p-4 transition-colors ${
                        isBestModel ? 'border-green-200 bg-green-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{formatted.model_type_formatted}</h3>
                          {isBestModel && <Badge className="bg-green-600">Best</Badge>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReport(model.model_id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Training Accuracy:</span>
                          <div className="font-semibold text-blue-600">{formatted.training_accuracy_percent}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Testing Accuracy:</span>
                          <div className="font-semibold text-green-600">{formatted.testing_accuracy_percent}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CV Accuracy:</span>
                          <div className="font-semibold text-purple-600">{formatted.cv_accuracy_percent}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Training Time:</span>
                          <div className="font-semibold">{formatted.training_time_formatted}</div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-muted-foreground">
                        <span>Samples: {model.training_samples.toLocaleString()} training, {model.testing_samples.toLocaleString()} testing</span>
                      </div>
                    </div>
                  );
                })}

                {trainedModels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {apiStatus === 'online' 
                      ? "No trained models yet. Upload a dataset and train some models to see results here."
                      : "Cannot load models - API is offline."
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}