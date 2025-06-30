import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, CreditCard, Calendar } from 'lucide-react';
import { StripeService } from '../services/stripeService';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionData = await StripeService.getUserSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100">
            Welcome to Insyte Pulse! Your subscription is now active.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your subscription details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subscription Details */}
              {subscription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">Subscription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">Insyte Pulse</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        StripeService.getSubscriptionStatusColor(subscription.subscription_status)
                      }`}>
                        {subscription.subscription_status}
                      </span>
                    </div>
                    {subscription.current_period_end && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next billing:</span>
                        <span className="font-medium">
                          {StripeService.formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                    )}
                    {subscription.payment_method_last4 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment method:</span>
                        <span className="font-medium">
                          {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-900">What's next?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <span className="text-gray-700">Create your first feedback form</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <span className="text-gray-700">Customize your branding and themes</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <span className="text-gray-700">Start collecting valuable feedback</span>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <Link
                  to="/forms"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Create Your First Form</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/"
                    className="flex items-center justify-center space-x-2 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm">Dashboard</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center justify-center space-x-2 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Billing</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@insytepulse.com" className="text-blue-600 hover:underline">
              support@insytepulse.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;