import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  BarChart3, 
  Users,
  Brain,
  Globe,
  Loader2
} from 'lucide-react';
import { StripeService } from '../services/stripeService';
import { STRIPE_PRODUCTS } from '../stripe-config';

const Pricing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      setError(null);

      const { url } = await StripeService.createCheckoutSession(priceId, 'subscription');
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error instanceof Error ? error.message : 'Failed to start checkout process');
    } finally {
      setLoading(null);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Sentiment Analysis',
      description: 'Advanced machine learning algorithms analyze customer feedback in real-time'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Comprehensive dashboards with actionable insights and trend analysis'
    },
    {
      icon: Globe,
      title: 'Multi-Channel Collection',
      description: 'Collect feedback via web forms, QR codes, email signatures, and more'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with SOC 2 compliance and data encryption'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share insights across teams with role-based access controls'
    },
    {
      icon: Zap,
      title: 'Instant Alerts',
      description: 'Get notified immediately when urgent issues require attention'
    }
  ];

  const benefits = [
    'Unlimited feedback forms',
    'Advanced sentiment analysis',
    'Real-time notifications',
    'Custom branding & themes',
    'API access & integrations',
    'Priority customer support',
    'Advanced analytics & reporting',
    'Team collaboration tools',
    'White-label options',
    'Custom domain support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transform Customer Feedback into 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Business Growth</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of AI to analyze customer sentiment, uncover innovation signals, 
              and elevate your brand's reputation in real-time.
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center items-center space-x-8 mb-12"
          >
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.9/5 Customer Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">10,000+ Companies</span>
            </div>
          </motion.div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative"
          >
            {/* Popular Badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>

            <div className="p-8 pt-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {STRIPE_PRODUCTS[0].name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {STRIPE_PRODUCTS[0].description}
                </p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    ${STRIPE_PRODUCTS[0].price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={() => handleSubscribe(STRIPE_PRODUCTS[0].priceId)}
                  disabled={loading === STRIPE_PRODUCTS[0].priceId}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading === STRIPE_PRODUCTS[0].priceId ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Start Free Trial</span>
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 mt-3">
                  14-day free trial • No credit card required • Cancel anytime
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to understand your customers
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your customer feedback?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies already using Insyte Pulse to drive growth
          </p>
          <button
            onClick={() => handleSubscribe(STRIPE_PRODUCTS[0].priceId)}
            disabled={loading === STRIPE_PRODUCTS[0].priceId}
            className="bg-white text-blue-600 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {loading === STRIPE_PRODUCTS[0].priceId ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Get Started Today</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;