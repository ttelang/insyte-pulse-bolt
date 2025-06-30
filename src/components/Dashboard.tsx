import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Star,
  Plus,
  ExternalLink,
  QrCode,
  BarChart3,
  Zap,
  Calendar,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';
import { FormService, DashboardStats } from '../services/formService';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useFeedback();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load forms to update context
      const forms = await FormService.getForms();
      dispatch({ type: 'SET_FORMS', payload: forms });

      // Load dashboard statistics
      const stats = await FormService.getDashboardStats();
      setDashboardStats(stats);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (value: number): string => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}%`;
  };

  const stats = [
    {
      title: 'Total Responses',
      value: dashboardStats?.totalResponses.toLocaleString() || '0',
      change: formatChange(dashboardStats?.monthlyTrend.responsesChange || 0),
      trend: (dashboardStats?.monthlyTrend.responsesChange || 0) >= 0 ? 'up' : 'down',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg. Satisfaction',
      value: dashboardStats?.avgSatisfaction ? `${dashboardStats.avgSatisfaction}/5` : 'N/A',
      change: dashboardStats?.monthlyTrend.satisfactionChange ? formatChange(dashboardStats.monthlyTrend.satisfactionChange) : '0%',
      trend: (dashboardStats?.monthlyTrend.satisfactionChange || 0) >= 0 ? 'up' : 'down',
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      title: 'Active Forms',
      value: dashboardStats?.activeFormsCount.toString() || '0',
      change: '+0',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Response Rate',
      value: `${dashboardStats?.responseRate || 0}%`,
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your feedback collection performance</p>
        </div>
        <Link
          to="/forms"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Form</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
                    {stat.change} from last month
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

      {/* Sentiment Overview */}
      {dashboardStats && dashboardStats.totalResponses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Sentiment Analysis</h3>
              <p className="text-blue-100">AI-powered feedback sentiment breakdown</p>
            </div>
            <Activity className="w-8 h-8 text-blue-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="font-medium">Positive</span>
              </div>
              <p className="text-2xl font-bold">{dashboardStats.sentimentBreakdown.positive}%</p>
              <p className="text-blue-100 text-sm">Happy customers</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-300" />
                <span className="font-medium">Neutral</span>
              </div>
              <p className="text-2xl font-bold">{dashboardStats.sentimentBreakdown.neutral}%</p>
              <p className="text-blue-100 text-sm">Neutral feedback</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-300" />
                <span className="font-medium">Negative</span>
              </div>
              <p className="text-2xl font-bold">{dashboardStats.sentimentBreakdown.negative}%</p>
              <p className="text-blue-100 text-sm">Needs attention</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Forms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Forms</h2>
            <Link to="/forms" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboardStats && dashboardStats.recentForms.length > 0 ? (
            <div className="space-y-4">
              {dashboardStats.recentForms.map((form, index) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{form.title}</h3>
                      <p className="text-sm text-gray-500">{form.responses} responses</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      form.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {form.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-6">Create your first feedback form to get started</p>
              <Link
                to="/forms"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Form</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Create New Form</h3>
          <p className="text-blue-100 mb-4">Build a custom feedback form in minutes</p>
          <Link
            to="/forms"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Get Started</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white"
        >
          <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
          <p className="text-purple-100 mb-4">Analyze feedback trends and insights</p>
          <Link
            to="/analytics"
            className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors inline-flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Reports</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Setup Integrations</h3>
          <p className="text-green-100 mb-4">Connect with your favorite tools</p>
          <Link
            to="/integrations"
            className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Connect</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;