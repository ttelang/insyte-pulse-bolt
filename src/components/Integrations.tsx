import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  Twitter, 
  Facebook, 
  Instagram,
  Slack,
  Chrome,
  Smartphone,
  Settings,
  Check,
  Plus,
  ExternalLink
} from 'lucide-react';

const Integrations: React.FC = () => {
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(['email', 'slack']);

  const integrations = [
    {
      id: 'email',
      name: 'Email Campaigns',
      description: 'Send feedback requests via email campaigns',
      icon: Mail,
      color: 'bg-blue-500',
      category: 'Communication'
    },
    {
      id: 'sms',
      name: 'SMS Campaigns',
      description: 'Collect feedback through SMS messages',
      icon: MessageSquare,
      color: 'bg-green-500',
      category: 'Communication'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Monitor mentions and collect social feedback',
      icon: Twitter,
      color: 'bg-blue-400',
      category: 'Social Media'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Track Facebook page comments and messages',
      icon: Facebook,
      color: 'bg-blue-600',
      category: 'Social Media'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Monitor Instagram mentions and comments',
      icon: Instagram,
      color: 'bg-pink-500',
      category: 'Social Media'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: Slack,
      color: 'bg-purple-500',
      category: 'Notifications'
    },
    {
      id: 'widget',
      name: 'Website Widget',
      description: 'Embed feedback forms on your website',
      icon: Chrome,
      color: 'bg-orange-500',
      category: 'Web'
    },
    {
      id: 'mobile-sdk',
      name: 'Mobile SDK',
      description: 'Integrate feedback collection in mobile apps',
      icon: Smartphone,
      color: 'bg-indigo-500',
      category: 'Mobile'
    }
  ];

  const categories = ['All', 'Communication', 'Social Media', 'Notifications', 'Web', 'Mobile'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIntegrations = selectedCategory === 'All' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const toggleIntegration = (id: string) => {
    setConnectedIntegrations(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect your feedback system with your favorite tools</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Request Integration</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, index) => {
          const isConnected = connectedIntegrations.includes(integration.id);
          
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${integration.color} rounded-lg flex items-center justify-center`}>
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    integration.category === 'Communication' ? 'bg-blue-100 text-blue-800' :
                    integration.category === 'Social Media' ? 'bg-purple-100 text-purple-800' :
                    integration.category === 'Notifications' ? 'bg-green-100 text-green-800' :
                    integration.category === 'Web' ? 'bg-orange-100 text-orange-800' :
                    'bg-indigo-100 text-indigo-800'
                  }`}>
                    {integration.category}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
              <p className="text-gray-600 mb-4">{integration.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    isConnected
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>

                {isConnected && (
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Setup Guides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Setup Guides</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Website Widget Integration</h4>
              <p className="text-blue-700 text-sm mb-3">
                Add a feedback widget to your website in just a few minutes
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                <span>View Guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Mobile SDK Setup</h4>
              <p className="text-green-700 text-sm mb-3">
                Integrate feedback collection in your iOS and Android apps
              </p>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1">
                <span>View Guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Social Media Monitoring</h4>
              <p className="text-purple-700 text-sm mb-3">
                Set up automated monitoring for social media mentions
              </p>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1">
                <span>View Guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Email Campaign Setup</h4>
              <p className="text-orange-700 text-sm mb-3">
                Create automated email campaigns for feedback collection
              </p>
              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1">
                <span>View Guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Developer Resources</h3>
            <p className="text-gray-300">
              Build custom integrations with our comprehensive API
            </p>
          </div>
          <div className="text-6xl opacity-20">
            {'</>'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium mb-2">REST API</h4>
            <p className="text-gray-300 text-sm mb-3">
              Full-featured REST API for all feedback operations
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View Docs →
            </button>
          </div>
          
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Webhooks</h4>
            <p className="text-gray-300 text-sm mb-3">
              Real-time notifications for new feedback submissions
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Setup Guide →
            </button>
          </div>
          
          <div className="bg-white bg-opacity-10 p-4 rounded-lg">
            <h4 className="font-medium mb-2">SDKs</h4>
            <p className="text-gray-300 text-sm mb-3">
              Official SDKs for JavaScript, Python, and more
            </p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              Download →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;