import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare,
  Star,
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Edit,
  Save,
  X,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  Flag
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { FormService, EnrichedFormResponse } from '../services/formService';
import { SentimentService } from '../services/sentimentService';
import { FeedbackUpdateService, FeedbackUpdateData } from '../services/feedbackUpdateService';
import { useFeedback } from '../context/FeedbackContext';

interface AnalyticsData {
  overallSentiment: { positive: number; neutral: number; negative: number };
  topCategories: { category: string; count: number; sentiment: string }[];
  urgentIssues: number;
  actionableItems: number;
  trendAnalysis: {
    sentimentTrend: 'improving' | 'declining' | 'stable';
    categoryTrends: { category: string; trend: 'up' | 'down' | 'stable' }[];
  };
  totalResponses: number;
  avgSatisfaction: number;
  responsesByMonth: Array<{
    name: string;
    responses: number;
    satisfaction: number;
    positive: number;
    negative: number;
  }>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    comment: string;
    source: string;
    time: string;
    sentiment: string;
    confidence: number;
    categories: string[];
    urgency: string;
    emotions: any;
    allFieldData: Array<{
      label: string;
      value: string;
      type: string;
    }>;
  }>;
}

interface EditableFeedback {
  id: string;
  comment: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  categories: string[];
  rating: number;
  notes: string;
  isVisible: boolean;
}

const FeedbackEditModal: React.FC<{
  feedback: any;
  onSave: (updatedFeedback: EditableFeedback) => void;
  onClose: () => void;
}> = ({ feedback, onSave, onClose }) => {
  const [editData, setEditData] = useState<EditableFeedback>({
    id: feedback.id,
    comment: feedback.comment,
    sentiment: feedback.sentiment,
    urgency: feedback.urgency,
    categories: feedback.categories || [],
    rating: feedback.rating,
    notes: '',
    isVisible: true
  });
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedCategories = [
    'User Experience', 'Performance', 'Customer Service', 'Product Quality',
    'Pricing', 'Technical Issues', 'Delivery/Shipping', 'Communication',
    'Accessibility', 'Security', 'Feature Request', 'Bug Report'
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const updateData: FeedbackUpdateData = {
        id: editData.id,
        comment: editData.comment,
        sentiment: editData.sentiment,
        urgency: editData.urgency,
        categories: editData.categories,
        rating: editData.rating,
        notes: editData.notes,
        isVisible: editData.isVisible
      };

      const result = await FeedbackUpdateService.updateFeedback(updateData);
      
      if (result.success) {
        onSave(editData);
        onClose();
      } else {
        setError(result.error || 'Failed to update feedback');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !editData.categories.includes(newCategory.trim())) {
      setEditData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  const addPredefinedCategory = (category: string) => {
    if (!editData.categories.includes(category)) {
      setEditData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Edit Feedback</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Comment
            </label>
            <textarea
              value={editData.comment}
              onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter feedback comment..."
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEditData(prev => ({ ...prev, rating: i + 1 }))}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      i < editData.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {editData.rating}/5
              </span>
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['positive', 'neutral', 'negative'] as const).map((sentiment) => (
                <button
                  key={sentiment}
                  onClick={() => setEditData(prev => ({ ...prev, sentiment }))}
                  className={`p-3 rounded-lg border transition-colors ${
                    editData.sentiment === sentiment
                      ? sentiment === 'positive'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : sentiment === 'negative'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize font-medium">{sentiment}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((urgency) => (
                <button
                  key={urgency}
                  onClick={() => setEditData(prev => ({ ...prev, urgency }))}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    editData.urgency === urgency
                      ? urgency === 'critical'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : urgency === 'high'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : urgency === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize font-medium">{urgency}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            
            {/* Current Categories */}
            <div className="flex flex-wrap gap-2 mb-3">
              {editData.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {category}
                  <button
                    onClick={() => removeCategory(category)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Category */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add custom category..."
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Predefined Categories */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => addPredefinedCategory(category)}
                    disabled={editData.categories.includes(category)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      editData.categories.includes(category)
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add internal notes about this feedback..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editData.isVisible}
                onChange={(e) => setEditData(prev => ({ ...prev, isVisible: e.target.checked }))}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Visible in analytics</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              saving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Analytics: React.FC = () => {
  const { state } = useFeedback();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [hiddenFeedback, setHiddenFeedback] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeRange, selectedForm]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all forms for the user
      const forms = await FormService.getForms();
      
      if (forms.length === 0) {
        setAnalyticsData({
          overallSentiment: { positive: 0, neutral: 0, negative: 0 },
          topCategories: [],
          urgentIssues: 0,
          actionableItems: 0,
          trendAnalysis: { sentimentTrend: 'stable', categoryTrends: [] },
          totalResponses: 0,
          avgSatisfaction: 0,
          responsesByMonth: [],
          recentFeedback: []
        });
        return;
      }

      // Collect all responses from all forms or selected form
      let allResponses: EnrichedFormResponse[] = [];
      const formsToAnalyze = selectedForm === 'all' ? forms : forms.filter(f => f.id === selectedForm);

      for (const form of formsToAnalyze) {
        try {
          const responses = await FormService.getFormResponses(form.id);
          allResponses = allResponses.concat(responses.map(response => ({
            ...response,
            formTitle: form.title
          })));
        } catch (error) {
          console.warn(`Failed to fetch responses for form ${form.id}:`, error);
        }
      }

      // Filter responses by time range
      const now = new Date();
      const daysAgo = parseInt(selectedTimeRange);
      const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const filteredResponses = allResponses.filter(response => 
        new Date(response.submitted_at) >= cutoffDate
      );

      // Generate insights using the sentiment service
      const insights = SentimentService.generateInsights(filteredResponses);

      // Calculate average satisfaction
      const responsesWithRating = filteredResponses.filter(r => r.overall_rating !== null);
      const avgSatisfaction = responsesWithRating.length > 0
        ? responsesWithRating.reduce((sum, r) => sum + r.overall_rating, 0) / responsesWithRating.length
        : 0;

      // Generate monthly trend data
      const responsesByMonth = generateMonthlyTrends(filteredResponses);

      // Process recent feedback for display
      const recentFeedback = processRecentFeedback(filteredResponses.slice(0, 10));

      setAnalyticsData({
        ...insights,
        totalResponses: filteredResponses.length,
        avgSatisfaction: Number(avgSatisfaction.toFixed(1)),
        responsesByMonth,
        recentFeedback
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyTrends = (responses: EnrichedFormResponse[]) => {
    const monthlyData: Record<string, {
      responses: number;
      totalSatisfaction: number;
      satisfactionCount: number;
      positive: number;
      negative: number;
    }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = {
        responses: 0,
        totalSatisfaction: 0,
        satisfactionCount: 0,
        positive: 0,
        negative: 0
      };
    }

    // Aggregate response data by month
    responses.forEach(response => {
      const date = new Date(response.submitted_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].responses++;
        
        if (response.overall_rating) {
          monthlyData[monthKey].totalSatisfaction += response.overall_rating;
          monthlyData[monthKey].satisfactionCount++;
        }
        
        if (response.sentiment === 'positive') {
          monthlyData[monthKey].positive++;
        } else if (response.sentiment === 'negative') {
          monthlyData[monthKey].negative++;
        }
      }
    });

    // Convert to chart format
    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      responses: data.responses,
      satisfaction: data.satisfactionCount > 0 
        ? Number((data.totalSatisfaction / data.satisfactionCount).toFixed(1))
        : 0,
      positive: data.positive,
      negative: data.negative
    }));
  };

  const processRecentFeedback = (responses: EnrichedFormResponse[]) => {
    return responses.map(response => {
      // Extract main comment from text/textarea fields
      let comment = 'No text feedback provided';
      const textFields = response.form_response_data.filter(data => 
        data.field_type && ['text', 'textarea'].includes(data.field_type) && 
        data.field_value && data.field_value.length > 10
      );
      
      if (textFields.length > 0) {
        // Use the longest text response as the main comment
        const longestText = textFields.reduce((prev, current) => 
          (current.field_value?.length || 0) > (prev.field_value?.length || 0) ? current : prev
        );
        comment = longestText.field_value || 'No text feedback provided';
      }

      // Extract all field data excluding the main comment and rating fields
      const allFieldData = response.form_response_data
        .filter(data => {
          // Exclude the field used as main comment
          if (textFields.length > 0) {
            const mainCommentField = textFields.reduce((prev, current) => 
              (current.field_value?.length || 0) > (prev.field_value?.length || 0) ? current : prev
            );
            if (data.field_id === mainCommentField.field_id) return false;
          }
          
          // Exclude rating fields (they're shown separately)
          if (data.field_type === 'rating') return false;
          
          // Include fields with meaningful values
          return data.field_value && data.field_value.trim().length > 0;
        })
        .map(data => ({
          label: data.field_label || 'Unknown Field',
          value: data.field_value || '',
          type: data.field_type || 'unknown'
        }));

      // Calculate time ago
      const timeAgo = getTimeAgo(new Date(response.submitted_at));

      return {
        id: response.id,
        rating: response.overall_rating || 0,
        comment: comment.length > 150 ? comment.substring(0, 150) + '...' : comment,
        source: response.response_source || 'web',
        time: timeAgo,
        sentiment: response.sentiment || 'neutral',
        confidence: response.metadata?.sentimentAnalysis?.confidence || 0,
        categories: response.metadata?.categories || [],
        urgency: response.metadata?.urgency || 'low',
        emotions: response.metadata?.emotions || {},
        allFieldData
      };
    });
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleEditFeedback = (feedback: any) => {
    setEditingFeedback(feedback);
  };

  const handleSaveFeedback = async (updatedFeedback: EditableFeedback) => {
    // Update local state immediately for optimistic UI
    if (analyticsData) {
      const updatedRecentFeedback = analyticsData.recentFeedback.map(feedback => 
        feedback.id === updatedFeedback.id 
          ? {
              ...feedback,
              sentiment: updatedFeedback.sentiment,
              urgency: updatedFeedback.urgency,
              categories: updatedFeedback.categories,
              rating: updatedFeedback.rating,
              comment: updatedFeedback.comment
            }
          : feedback
      );

      setAnalyticsData({
        ...analyticsData,
        recentFeedback: updatedRecentFeedback
      });
    }

    // Update hidden feedback set
    if (!updatedFeedback.isVisible) {
      setHiddenFeedback(prev => new Set([...prev, updatedFeedback.id]));
    } else {
      setHiddenFeedback(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedFeedback.id);
        return newSet;
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(feedbackId);
      
      const result = await FeedbackUpdateService.deleteFeedback(feedbackId);
      
      if (result.success) {
        // Update local state immediately
        if (analyticsData) {
          const updatedRecentFeedback = analyticsData.recentFeedback.filter(
            feedback => feedback.id !== feedbackId
          );

          setAnalyticsData({
            ...analyticsData,
            recentFeedback: updatedRecentFeedback,
            totalResponses: analyticsData.totalResponses - 1
          });
        }
      } else {
        alert(result.error || 'Failed to delete feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleFeedbackVisibility = (feedbackId: string) => {
    setHiddenFeedback(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  const sentimentData = analyticsData ? [
    { name: 'Positive', value: analyticsData.overallSentiment.positive, color: '#10B981' },
    { name: 'Neutral', value: analyticsData.overallSentiment.neutral, color: '#F59E0B' },
    { name: 'Negative', value: analyticsData.overallSentiment.negative, color: '#EF4444' }
  ] : [];

  const categoryData = analyticsData?.topCategories?.map(cat => ({
    name: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
    responses: cat.count,
    sentiment: cat.sentiment
  })) || [];

  const stats = [
    {
      title: 'Total Responses',
      value: analyticsData?.totalResponses.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg. Satisfaction',
      value: analyticsData?.avgSatisfaction ? `${analyticsData.avgSatisfaction}/5` : 'N/A',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      title: 'Positive Sentiment',
      value: `${analyticsData?.overallSentiment.positive || 0}%`,
      change: analyticsData?.trendAnalysis.sentimentTrend === 'improving' ? '+5.2%' : 
              analyticsData?.trendAnalysis.sentimentTrend === 'declining' ? '-2.1%' : '0%',
      trend: analyticsData?.trendAnalysis.sentimentTrend === 'improving' ? 'up' : 
             analyticsData?.trendAnalysis.sentimentTrend === 'declining' ? 'down' : 'up',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Action Required',
      value: analyticsData?.actionableItems?.toString() || '0',
      change: '+3',
      trend: 'up',
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.totalResponses === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600 mb-4">
            {state.forms.length === 0 
              ? 'Create your first form to start collecting feedback and see analytics.'
              : 'No responses have been collected yet. Share your forms to start gathering feedback.'
            }
          </p>
          {state.forms.length === 0 && (
            <button
              onClick={() => window.location.href = '/forms'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Form
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">AI-powered feedback analysis and sentiment tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <option value="all">All Forms</option>
            {state.forms.map(form => (
              <option key={form.id} value={form.id}>
                {form.title.length > 30 ? form.title.substring(0, 30) + '...' : form.title}
              </option>
            ))}
          </select>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
              <p className="text-purple-100">Automated sentiment analysis and categorization</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{analyticsData.urgentIssues}</p>
            <p className="text-purple-100 text-sm">Urgent Issues</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">Sentiment Trend</span>
            </div>
            <p className="text-2xl font-bold capitalize">
              {analyticsData.trendAnalysis.sentimentTrend}
            </p>
            <p className="text-purple-100 text-sm">Overall feedback sentiment</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5" />
              <span className="font-medium">Top Category</span>
            </div>
            <p className="text-lg font-bold">
              {analyticsData.topCategories[0]?.category || 'No categories yet'}
            </p>
            <p className="text-purple-100 text-sm">Most mentioned topic</p>
          </div>
          
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Action Items</span>
            </div>
            <p className="text-2xl font-bold">{analyticsData.actionableItems}</p>
            <p className="text-purple-100 text-sm">Require follow-up</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response & Sentiment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.responsesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="responses" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                name="Total Responses"
              />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Positive Responses"
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Negative Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Analysis */}
        {categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Satisfaction Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.responsesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Feedback with Edit/Update Options */}
      {analyticsData.recentFeedback.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Feedback Analysis</h3>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">AI-Analyzed</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {analyticsData.recentFeedback
                .filter(feedback => !hiddenFeedback.has(feedback.id))
                .map((feedback) => (
                <div key={feedback.id} className="p-6 bg-gray-50 rounded-lg border-l-4 border-l-blue-500 relative">
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => toggleFeedbackVisibility(feedback.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Hide feedback"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditFeedback(feedback)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit feedback"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      disabled={isDeleting === feedback.id}
                      className={`p-1 transition-colors ${
                        isDeleting === feedback.id 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                      title="Delete feedback"
                    >
                      {isDeleting === feedback.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-4 pr-20">
                    <div className="flex items-center space-x-3">
                      {feedback.rating > 0 && (
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        feedback.sentiment === 'positive' 
                          ? 'bg-green-100 text-green-800'
                          : feedback.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feedback.sentiment} {feedback.confidence > 0 && `(${Math.round(feedback.confidence * 100)}%)`}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feedback.urgency === 'critical' 
                          ? 'bg-red-100 text-red-800'
                          : feedback.urgency === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : feedback.urgency === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {feedback.urgency} priority
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 capitalize">{feedback.source}</p>
                      <p className="text-xs text-gray-400">{feedback.time}</p>
                    </div>
                  </div>
                  
                  {/* Main Comment */}
                  {feedback.comment !== 'No text feedback provided' && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Main Feedback:</h5>
                      <p className="text-gray-700 bg-white p-3 rounded border">{feedback.comment}</p>
                    </div>
                  )}
                  
                  {/* All Field Data */}
                  {feedback.allFieldData.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">All Response Data:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {feedback.allFieldData.map((field, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-medium text-gray-600">{field.label}</span>
                              <span className="text-xs text-gray-400 capitalize">{field.type}</span>
                            </div>
                            <p className="text-sm text-gray-800">{field.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {feedback.categories.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Categories:</span>
                          {feedback.categories.slice(0, 2).map((category, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {(feedback.urgency === 'critical' || feedback.urgency === 'high') && (
                      <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center space-x-1">
                        <Flag className="w-3 h-3" />
                        <span>Take Action</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Show hidden feedback count */}
              {hiddenFeedback.size > 0 && (
                <div className="text-center py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {hiddenFeedback.size} feedback item{hiddenFeedback.size > 1 ? 's' : ''} hidden
                  </p>
                  <button
                    onClick={() => setHiddenFeedback(new Set())}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                  >
                    Show all feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Edit Feedback Modal */}
      <AnimatePresence>
        {editingFeedback && (
          <FeedbackEditModal
            feedback={editingFeedback}
            onSave={handleSaveFeedback}
            onClose={() => setEditingFeedback(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;