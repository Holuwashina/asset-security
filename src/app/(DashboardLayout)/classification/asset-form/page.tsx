"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info,
  Shield,
  BarChart3,
  FileText,
  Database,
  Lock,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useDepartments, useAssetTypes, useCreateAsset, useUpdateAsset, useAssessmentQuestions } from "@/lib/hooks/useAssets";
import { apiClient } from "@/lib/api";
import PageContainer from '@/components/common/PageContainer';

const STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Asset identification and ownership",
    icon: FileText,
    fields: ["asset", "assetType", "assetOwner"]
  },
  {
    id: 2,
    title: "Asset Context",
    description: "Additional context and compliance information",
    icon: Database,
    fields: ["description", "industrySector", "complianceFramework"]
  },
  {
    id: 3,
    title: "Classification Parameters",
    description: "Set asset importance and risk factors (0-1 scale)",
    icon: BarChart3,
    fields: ["asset_importance", "data_value", "business_criticality", "replaceability"]
  },
  {
    id: 4,
    title: "Risk Identification",
    description: "CIA triad assessment (0-1 scale)",
    icon: Shield,
    fields: ["confidentiality", "integrity", "availability"]
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Final review, auto-classification & risk analysis",
    icon: CheckCircle,
    fields: []
  }
];

export default function AssetFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasPopulatedForm = useRef(false);

  const assetId = searchParams.get("id");
  const assetName = searchParams.get("asset");
  const typeAsset = searchParams.get("type");
  const owner = searchParams.get("owner");
  const desc = searchParams.get("description");

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const [asset, setAsset] = useState(assetName || "");
  const [assetType, setAssetType] = useState(typeAsset || "");
  const [assetOwner, setAssetOwner] = useState(owner || "");
  const [description, setDescription] = useState(desc || "");

  const [industrySector, setIndustrySector] = useState("");
  const [complianceFramework, setComplianceFramework] = useState("None");

  const [assetImportance, setAssetImportance] = useState(0.3);
  const [dataValue, setDataValue] = useState(0.4);
  const [businessCriticality, setBusinessCriticality] = useState(0.6);
  const [replaceability, setReplaceability] = useState(0.4);

  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: number}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState('Confidentiality');

  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: assetTypes = [], isLoading: assetTypesLoading } = useAssetTypes();
  const { data: questions, isLoading: questionsLoading } = useAssessmentQuestions();
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();

  const questionsByCategory = questions?.reduce((acc: any, question: any) => {
    const categoryName = question.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {}) || {};

  const categories = ['Confidentiality', 'Integrity', 'Availability'];
  
  const calculateCategoryScore = (categoryName: string) => {
    const categoryQuestions = questionsByCategory[categoryName] || [];
    const categoryAnswers = categoryQuestions.map((q: any) => questionAnswers[q.id] || 0);
    
    if (categoryAnswers.length === 0) return 0;
    
    const totalScore = categoryAnswers.reduce((sum: number, answer: number) => sum + answer, 0);
    return totalScore / categoryQuestions.length;
  };

  const confidentiality = calculateCategoryScore('Confidentiality');
  const integrity = calculateCategoryScore('Integrity');
  const availability = calculateCategoryScore('Availability');

  const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
  const currentQuestion = currentCategoryQuestions[currentQuestionIndex];

  const handleAnswerQuestion = (questionId: string, answer: number) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentCategoryQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const currentCategoryIndex = categories.indexOf(currentCategory);
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategory(categories[currentCategoryIndex + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      const currentCategoryIndex = categories.indexOf(currentCategory);
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1];
        setCurrentCategory(prevCategory);
        setCurrentQuestionIndex((questionsByCategory[prevCategory] || []).length - 1);
      }
    }
  };

  const isFirstQuestion = currentCategory === 'Confidentiality' && currentQuestionIndex === 0;
  const isLastQuestion = currentCategory === 'Availability' &&
    currentQuestionIndex === (questionsByCategory['Availability'] || []).length - 1;

  const getTotalProgress = () => {
    const totalQuestions = Object.values(questionsByCategory).flat().length;
    const answeredQuestions = Object.keys(questionAnswers).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  const getCategoryProgress = (categoryName: string) => {
    const categoryQuestions = questionsByCategory[categoryName] || [];
    const answeredInCategory = categoryQuestions.filter((q: any) => questionAnswers[q.id] !== undefined).length;
    return categoryQuestions.length > 0 ? (answeredInCategory / categoryQuestions.length) * 100 : 0;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Confidentiality': return Lock;
      case 'Integrity': return CheckCircle;
      case 'Availability': return Shield;
      default: return HelpCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Confidentiality': return 'text-red-600 bg-red-50';
      case 'Integrity': return 'text-blue-600 bg-blue-50';
      case 'Availability': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const industrySectors = [
    { value: "Financial Services", label: "Financial Services" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Government", label: "Government" },
    { value: "Energy & Utilities", label: "Energy & Utilities" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Technology", label: "Technology" },
    { value: "Retail", label: "Retail" },
    { value: "Education", label: "Education" },
    { value: "Transportation", label: "Transportation" },
    { value: "Telecommunications", label: "Telecommunications" }
  ];

  const complianceFrameworks = [
    { value: "None", label: "No specific compliance requirement" },
    { value: "SOX", label: "Sarbanes-Oxley Act (SOX)" },
    { value: "HIPAA", label: "Health Insurance Portability and Accountability Act (HIPAA)" },
    { value: "PCI-DSS", label: "Payment Card Industry Data Security Standard (PCI-DSS)" },
    { value: "GDPR", label: "General Data Protection Regulation (GDPR)" },
    { value: "FISMA", label: "Federal Information Security Management Act (FISMA)" },
    { value: "ISO 27001", label: "ISO/IEC 27001:2013" },
    { value: "NIST CSF", label: "NIST Cybersecurity Framework" },
    { value: "COBIT", label: "Control Objectives for Information Technology (COBIT)" }
  ];

  const mapAssetTypeToNISTCategory = (type: string): string => {
    const mappings: { [key: string]: string } = {
      "Hardware": "Systems",
      "Software": "Applications", 
      "Data": "Data",
      "Network": "Networks",
      "Personnel": "Services",
      "Facility": "Systems",
      "Documentation": "Data"
    };
    return mappings[type] || "Systems";
  };

  // Step validation - Enhanced for all steps
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(asset && assetType && assetOwner);
      case 2:
        return true; // Optional fields, no validation required
      case 3:
        // Validate classification parameters are in range
        return assetImportance >= 0 && assetImportance <= 1 &&
               dataValue >= 0 && dataValue <= 1 &&
               businessCriticality >= 0 && businessCriticality <= 1 &&
               replaceability >= 0 && replaceability <= 1;
      case 4:
        // Validate all assessment questions are answered
        const totalQuestions = Object.values(questionsByCategory).flat().length;
        const answeredQuestions = Object.keys(questionAnswers).length;
        return totalQuestions > 0 && answeredQuestions === totalQuestions;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please complete all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  // Clear form when switching from edit to create mode - more cautious approach
  useEffect(() => {
    if (!assetId && !hasPopulatedForm.current) {
      // Only clear if we detect URL parameters indicating we're switching modes
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('type') || urlParams.has('owner')) {
        setAsset("");
        setAssetType("");
        setAssetOwner("");
        setDescription("");
        setIndustrySector("");
        setComplianceFramework("None");
        setAssetImportance(0.3);
        setDataValue(0.4);
        setBusinessCriticality(0.6);
        setReplaceability(0.4);
        setQuestionAnswers({});
        setCurrentQuestionIndex(0);
        setCurrentCategory('Confidentiality');
        hasPopulatedForm.current = true;
      }
    }
  }, [assetId]);

  // Populate form from URL parameters
  useEffect(() => {
    if (!hasPopulatedForm.current && (assetName || typeAsset || owner || desc)) {
      setAsset(assetName || "");
      setAssetType(typeAsset || "");
      setAssetOwner(owner || "");
      setDescription(desc || "");
      hasPopulatedForm.current = true;
    }
  }, [assetName, typeAsset, owner, desc]);

  // Fetch asset data for editing
  useEffect(() => {
    if (assetId && !hasPopulatedForm.current) {
      const fetchAsset = async () => {
        try {
          const assetData = await apiClient.getAsset(assetId);
          
          setAsset(assetData.asset || "");
          setAssetType(assetData.asset_type || "");
          setAssetOwner(assetData.owner_department || "");
          setDescription(assetData.description || "");
          setIndustrySector(assetData.industry_sector || "");
          setComplianceFramework(assetData.compliance_framework || "None");
          
          // Load classification parameters if they exist
          setBusinessCriticality(assetData.business_criticality || 0.0);
          setDataValue(assetData.data_sensitivity || 0.0);
          setAssetImportance(assetData.operational_dependency || 0.0);
          setReplaceability(assetData.regulatory_impact || 0.0);
          
          if ((assetData as any).question_answers) {
            setQuestionAnswers((assetData as any).question_answers);
          }
          
          if ((assetData as any).last_step) {
            setCurrentStep((assetData as any).last_step);
          } else if (assetData.calculated_risk_level) {
            setCurrentStep(5);
          } else if ((assetData as any).question_answers && Object.keys((assetData as any).question_answers).length > 0) {
            setCurrentStep(4);
          } else if (assetData.business_criticality) {
            setCurrentStep(3);
          }
          
          hasPopulatedForm.current = true;
        } catch (error) {
          console.error("Error fetching asset:", error);
          toast.error("Failed to load asset data");
        }
      };

      fetchAsset();
    }
  }, [assetId]);

  // Submit handler with classification and auto-classification
  const handleSubmit = async () => {
    try {
      const payload = {
        asset: asset.trim(),
        description: description.trim() || undefined,
        asset_type: assetType,
        owner_department: assetOwner,
        asset_category: mapAssetTypeToNISTCategory(assetType),
        industry_sector: industrySector || undefined,
        compliance_framework: complianceFramework,
        // Classification parameters
        business_criticality: businessCriticality,
        data_sensitivity: dataValue,
        operational_dependency: assetImportance,
        regulatory_impact: replaceability,
        // Risk Identification - CIA Triad
        confidentiality: confidentiality,
        integrity: integrity,
        availability: availability,
      };

      if (assetId) {
        // Update existing asset
        const result: any = await updateAssetMutation.mutateAsync({ id: assetId, data: payload });
        toast.success("Asset updated successfully!");
      } else {
        // Create new asset
        const result: any = await createAssetMutation.mutateAsync(payload);
        toast.success("Asset created successfully!");
      }
      
      // Redirect to assets list
      router.push("/classification/assets");
      
    } catch (error: any) {
      console.error(`Error ${assetId ? 'updating' : 'creating'} asset:`, error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          toast.error(`Validation errors:\n${errorMessages}`);
        } else {
          toast.error(`Error: ${errorData}`);
        }
      } else {
        toast.error(`Failed to ${assetId ? 'update' : 'create'} asset. Please check your connection and try again.`);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
    return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Asset Information</h3>
        <p className="text-sm text-gray-600 mt-1">
                Provide essential information to identify and categorize your asset
        </p>
      </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="asset" className="text-sm font-medium">
                  Asset Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="asset"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="Enter asset name (e.g., Customer Database, Web Server)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a clear, descriptive name for the asset
                </p>
              </div>

              <div>
                <Label htmlFor="assetType" className="text-sm font-medium">
                  Asset Type <span className="text-red-500">*</span>
                </Label>
                <Select value={assetType} onValueChange={setAssetType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypesLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      assetTypes.map((type: any) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the category that best describes this asset
                </p>
              </div>

              <div>
                <Label htmlFor="assetOwner" className="text-sm font-medium">
                  Asset Owner Department <span className="text-red-500">*</span>
                </Label>
                <Select value={assetOwner} onValueChange={setAssetOwner}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select owner department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Department responsible for this asset
                </p>
              </div>


            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Asset Context</h3>
              <p className="text-sm text-gray-600 mt-1">
                Optional information to provide additional context for classification
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the asset's purpose, functionality, and importance..."
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide additional context about the asset's role and importance
                </p>
              </div>

              <div>
                <Label htmlFor="industrySector" className="text-sm font-medium">
                  Industry Sector
                </Label>
                <Select value={industrySector} onValueChange={setIndustrySector}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry sector (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {industrySectors.map((sector) => (
                      <SelectItem key={sector.value} value={sector.value}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Industry context for regulatory considerations
                </p>
              </div>

              <div>
                <Label htmlFor="complianceFramework" className="text-sm font-medium">
                  Primary Compliance Framework
                </Label>
                <Select value={complianceFramework} onValueChange={setComplianceFramework}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select compliance framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceFrameworks.map((framework) => (
                      <SelectItem key={framework.value} value={framework.value}>
                        {framework.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Primary regulatory or compliance framework applicable to this asset
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Impact assessment and risk evaluation will be conducted during the classification phase using NIST SP 800-60 methodology.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Classification Parameters</h3>
              <p className="text-sm text-gray-600 mt-1">
                Set asset importance and risk factors (0.0 - 1.0 scale)
              </p>
            </div>

            <div className="space-y-6">
              {/* Asset Importance */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Asset Importance: {assetImportance.toFixed(2)}
                </Label>
                <Slider
                  value={[assetImportance]}
                  onValueChange={([value]: number[]) => setAssetImportance(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Not important</span>
                  <span>0.5 - Moderately important</span>
                  <span>1.0 - Extremely critical</span>
                </div>
                <p className="text-sm text-gray-600">
                  How important is this asset to your organization's operations?
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Data Value: {dataValue.toFixed(2)}
                </Label>
                <Slider
                  value={[dataValue]}
                  onValueChange={([value]: number[]) => setDataValue(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Public data</span>
                  <span>0.5 - Internal data</span>
                  <span>1.0 - Highly sensitive</span>
                </div>
                <p className="text-sm text-gray-600">
                  How valuable is the data this asset handles or stores?
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Business Criticality: {businessCriticality.toFixed(2)}
                </Label>
                <Slider
                  value={[businessCriticality]}
                  onValueChange={([value]: number[]) => setBusinessCriticality(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - No business impact</span>
                  <span>0.5 - Moderate impact</span>
                  <span>1.0 - Business critical</span>
                </div>
                <p className="text-sm text-gray-600">
                  How critical is this asset to daily business operations?
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Replaceability: {replaceability.toFixed(2)}
                </Label>
                <Slider
                  value={[replaceability]}
                  onValueChange={([value]: number[]) => setReplaceability(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Easy to replace</span>
                  <span>0.5 - Moderate effort</span>
                  <span>1.0 - Very difficult</span>
                </div>
                <p className="text-sm text-gray-600">
                  How difficult/expensive would it be to replace this asset?
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These parameters will be stored with the asset for future classification.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 4:
        if (!questions || questionsLoading) {
          return (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Risk Identification Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">
                Answer questions to assess Confidentiality, Integrity, and Availability risks
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{getTotalProgress().toFixed(0)}%</span>
                    </div>
                    <Progress value={getTotalProgress()} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category);
                      const progress = getCategoryProgress(category);
                      return (
                        <div key={category} className="text-center">
                          <div className={`p-2 rounded-lg ${getCategoryColor(category)} mb-2`}>
                            <Icon className="h-5 w-5 mx-auto" />
                          </div>
                          <div className="text-xs font-medium mb-1">{category}</div>
                          <div className="text-xs text-gray-500">{progress.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(currentCategory), { className: "h-5 w-5" })}
                    {currentCategory} Assessment
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {currentCategoryQuestions.length}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{currentQuestion.question_text}</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Rate on 0.0 - 1.0 scale: {(questionAnswers[currentQuestion.id] || 0).toFixed(2)}</Label>
                    <Slider
                      value={[questionAnswers[currentQuestion.id] || 0]}
                      onValueChange={([value]: number[]) => handleAnswerQuestion(currentQuestion.id, value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.0 - Very Low</span>
                      <span>0.2 - Low</span>
                      <span>0.5 - Medium</span>
                      <span>0.8 - High</span>
                      <span>1.0 - Very High</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isFirstQuestion}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      disabled={isLastQuestion || questionAnswers[currentQuestion.id] === undefined}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Current CIA Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{confidentiality.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Confidentiality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{integrity.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Integrity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{availability.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Availability</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review your complete asset information, classification parameters, and risk identification before submission
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Asset Name</Label>
                    <p className="text-sm font-medium">{asset}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Asset Type</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{assetType}</p>
                      <Badge variant="outline">{mapAssetTypeToNISTCategory(assetType)}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Owner Department</Label>
                    <p className="text-sm font-medium">
                      {departments.find((d: any) => d.id === assetOwner)?.name || assetOwner}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Compliance Framework</Label>
                    <p className="text-sm font-medium">
                      {complianceFrameworks.find(f => f.value === complianceFramework)?.label}
                    </p>
                  </div>
                </div>

                {description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-sm">{description}</p>
                  </div>
                )}

                {industrySector && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Industry Sector</Label>
                    <p className="text-sm font-medium">{industrySector}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Classification Parameters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Asset Importance</Label>
                    <p className="text-sm font-medium">{assetImportance.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data Value</Label>
                    <p className="text-sm font-medium">{dataValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Business Criticality</Label>
                    <p className="text-sm font-medium">{businessCriticality.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Replaceability</Label>
                    <p className="text-sm font-medium">{replaceability.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Classification Parameters:</strong> These parameters will be stored with the asset for future classification using fuzzy logic.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Identification (CIA Triad)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Confidentiality</Label>
                    <p className="text-sm font-medium">{confidentiality.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Integrity</Label>
                    <p className="text-sm font-medium">{integrity.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Availability</Label>
                    <p className="text-sm font-medium">{availability.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                                          <strong>Risk Assessment:</strong> These CIA scores will be stored with the asset for future risk analysis and calculations.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> After {assetId ? 'updating' : 'creating'} this asset, you can proceed to the classification phase where you'll conduct NIST SP 800-60 compliant impact assessment and risk analysis.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer 
      title={assetId ? 'Edit Asset' : 'Asset Registration'}
      description={assetId 
        ? 'Update the asset information and classification parameters.' 
        : 'Register a new information asset for classification and risk assessment'
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                        isActive 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : isCompleted 
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                      }`}
                      onClick={() => goToStep(step.id)}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="w-full" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === STEPS.length ? (
            <Button
              onClick={handleSubmit}
              disabled={createAssetMutation.isPending || updateAssetMutation.isPending}
              className="flex items-center gap-2"
            >
              {(createAssetMutation.isPending || updateAssetMutation.isPending) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {assetId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {assetId ? 'Update Asset' : 'Create Asset'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
