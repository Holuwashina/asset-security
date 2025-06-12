"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useAssessmentQuestions,
  useCreateAssessmentQuestion,
  useUpdateAssessmentQuestion,
  useDeleteAssessmentQuestion
} from "@/lib/hooks/useAssets";
import { toast } from "sonner";
import { 
  Settings, 
  Plus, 
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  CheckCircle,
  Lock,
  Loader2,
  Eye,
  FileQuestion
} from "lucide-react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/common/PageContainer";

const AssetAssessmentSettingsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Hooks for data management - no error handling, just use empty data
  const { data: questionsData, isLoading } = useAssessmentQuestions();
  const createQuestionMutation = useCreateAssessmentQuestion();
  const updateQuestionMutation = useUpdateAssessmentQuestion();
  const deleteQuestionMutation = useDeleteAssessmentQuestion();

  // Handle empty or no data gracefully
  const questions = questionsData || [];

  // Group questions by category
  const questionsByCategory = questions.reduce((acc: any, question: any) => {
    const categoryName = question.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {});

  // Filter questions based on search
  const filteredQuestions = searchTerm 
    ? questions.filter((q: any) => 
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : questions;

  const filteredByCategory = filteredQuestions.reduce((acc: any, question: any) => {
    const categoryName = question.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(question);
    return acc;
  }, {});

  const handleEdit = (question: any) => {
    setEditingQuestionId(question.id);
    setEditingText(question.questionText);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestionId || !editingText.trim()) return;

    try {
      await updateQuestionMutation.mutateAsync({
        id: editingQuestionId,
        data: { questionText: editingText }
      });
      toast.success('Question updated successfully');
      setEditingQuestionId(null);
      setEditingText('');
    } catch (error) {
      toast.error('Failed to update question. Please check your API connection.');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingText('');
  };

  const handleDelete = async (questionId: string, questionText: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this question?\n\n"${questionText}"\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await deleteQuestionMutation.mutateAsync(questionId);
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question. Please check your API connection.');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'confidentiality':
        return Lock;
      case 'integrity':
        return CheckCircle;
      case 'availability':
        return Shield;
      default:
        return FileQuestion;
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'confidentiality':
        return 'bg-red-100 text-red-800';
      case 'integrity':
        return 'bg-blue-100 text-blue-800';
      case 'availability':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalQuestions = questions.length;
  const categoriesCount = Object.keys(questionsByCategory).length;

  if (isLoading) {
    return (
      <PageContainer title="Assessment Questions" description="Manage assessment questions for asset evaluation">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Assessment Questions" description="Manage assessment questions for asset evaluation">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/classification/risk-identification')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Assessment
            </Button>
            <Button onClick={() => router.push('/settings/assessment-form')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                </div>
                <FileQuestion className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categoriesCount}</p>
                </div>
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confidentiality</p>
                  <p className="text-2xl font-bold">{questionsByCategory.Confidentiality?.length || 0}</p>
                </div>
                <Lock className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CIA Combined</p>
                  <p className="text-2xl font-bold">
                    {(questionsByCategory.Integrity?.length || 0) + (questionsByCategory.Availability?.length || 0)}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions by Category */}
        {Object.entries(filteredByCategory).map(([categoryName, categoryQuestions]: [string, any]) => {
          const IconComponent = getCategoryIcon(categoryName);
          
          return (
            <Card key={categoryName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {categoryName} Questions
                    <Badge variant="secondary" className={getCategoryColor(categoryName)}>
                      {categoryQuestions.length}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileQuestion className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions found for this category</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => router.push('/settings/assessment-form')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">ID</TableHead>
                          <TableHead>Question Text</TableHead>
                          <TableHead className="w-32">Category</TableHead>
                          <TableHead className="w-32 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryQuestions.map((question: any, index: number) => (
                          <TableRow key={question.id}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              {editingQuestionId === question.id ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={updateQuestionMutation.isPending}
                                  >
                                    {updateQuestionMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Save'
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span>{question.questionText}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary" 
                                className={getCategoryColor(question.category?.name || '')}
                              >
                                {question.category?.name || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(question)}
                                      disabled={editingQuestionId !== null}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(question.id, question.questionText)}
                                      className="text-red-600"
                                      disabled={deleteQuestionMutation.isPending}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Question
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredQuestions.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileQuestion className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching questions found' : 'No assessment questions yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? `No questions match your search for "${searchTerm}"`
                    : 'Get started by adding assessment questions for the CIA triad evaluation'
                  }
                </p>
                <div className="flex justify-center gap-4">
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                  <Button onClick={() => router.push('/settings/assessment-form')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default AssetAssessmentSettingsPage;
