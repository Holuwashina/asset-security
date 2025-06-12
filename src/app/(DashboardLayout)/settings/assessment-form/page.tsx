"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCreateAssessmentQuestion } from "@/lib/hooks/useAssets";
import { toast } from "sonner";
import { 
  Loader2, 
  FileText, 
  ArrowLeft,
  Plus,
  Eye,
  Lock,
  CheckCircle,
  Shield
} from "lucide-react";
import PageContainer from "@/components/common/PageContainer";

// Assessment categories from CIA triad
const assessmentCategories = [
  { 
    id: "1", 
    name: "Confidentiality",
    description: "Protection of sensitive information from unauthorized disclosure",
    icon: Lock,
    color: "text-red-600"
  },
  { 
    id: "2", 
    name: "Integrity",
    description: "Ensuring data accuracy and preventing unauthorized modification",
    icon: CheckCircle,
    color: "text-blue-600"
  },
  { 
    id: "3", 
    name: "Availability",
    description: "Ensuring systems and data are accessible when needed",
    icon: Shield,
    color: "text-green-600"
  },
];

const AssessmentFormPage = () => {
  const router = useRouter();
  const createQuestionMutation = useCreateAssessmentQuestion();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [questionText, setQuestionText] = useState("");

  const selectedCategoryData = assessmentCategories.find(cat => cat.id === selectedCategory);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCategory || !questionText.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const categoryData = assessmentCategories.find(cat => cat.id === selectedCategory);
      await createQuestionMutation.mutateAsync({
        questionText: questionText.trim(),
        category: selectedCategory,
        categoryName: categoryData?.name
      });
      
      toast.success("Assessment question added successfully!");
      
      // Reset form
      setSelectedCategory("");
      setQuestionText("");
      
    } catch (error) {
      toast.error("Failed to add assessment question. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/settings/asset-assessment");
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = assessmentCategories.find(cat => cat.name === categoryName);
    return category?.icon || FileText;
  };

  return (
    <PageContainer 
      title="Add Assessment Question" 
      description="Create new questions for asset evaluation"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/classification/risk-identification')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Assessment Question
              </CardTitle>
              <p className="text-sm text-gray-600">
                Add a new question to evaluate asset security properties
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Assessment Category *</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment category" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${cat.color}`} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedCategoryData && (
                    <p className="text-sm text-gray-600">
                      {selectedCategoryData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Enter your assessment question..."
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Write a clear, specific question that helps evaluate the selected security aspect.
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createQuestionMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createQuestionMutation.isPending || !selectedCategory || !questionText.trim()}
                    className="min-w-[120px]"
                  >
                    {createQuestionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  See how your question will appear in assessments
                </p>
              </CardHeader>
              <CardContent>
                {selectedCategory && questionText ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {React.createElement(getCategoryIcon(selectedCategoryData?.name || ''), { 
                        className: `h-5 w-5 ${selectedCategoryData?.color || 'text-gray-500'}` 
                      })}
                      <span className="font-medium">
                        {selectedCategoryData?.name} Assessment
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-800">{questionText}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Assessment Scale:</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <div key={value} className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                              {value}
                            </div>
                            <span className="text-xs mt-1">
                              {value === 1 ? 'Low' : value === 5 ? 'High' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Fill in the form to see a preview of your question</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Information */}
            <Card>
              <CardHeader>
                <CardTitle>CIA Triad Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentCategories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    
                    return (
                      <div 
                        key={category.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${category.color}`} />
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AssessmentFormPage;
