import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { StripeService, SubscriptionData } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionStatusProps {
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className = '' }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await StripeService.getUserSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscription();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'past_due':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'canceled':
      case 'unpaid':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Crown className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return 'Your subscription is active and all features are available.';
      case 'trialing':
        return 'You\'re currently in your free trial period.';
      case 'past_due':
        return 'Your payment is past due. Please update your payment method.';
      case 'canceled':
        return 'Your subscription has been canceled.';
      case 'unpaid':
        return 'Your subscription is unpaid. Please update your payment method.';
      case 'not_started':
        return 'No active subscription found.';
      default:
        return 'Subscription status unknown.';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-600">Loading subscription...</span>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">No Active Subscription</p>
              <p className="text-sm text-gray-600">Upgrade to unlock all features</p>
            </div>
          </div>
          <a
            href="/pricing"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
          >
            <span>Upgrade</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = StripeService.isSubscriptionActive(subscription.subscription_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(subscription.subscription_status)}
          <div>
            <p className="font-medium text-gray-900">
              {product?.name || 'Subscription'}
            </p>
            <p className="text-sm text-gray-600">
              {getStatusMessage(subscription.subscription_status)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            StripeService.getSubscriptionStatusColor(subscription.subscription_status)
          }`}>
            {subscription.subscription_status.replace('_', ' ')}
          </span>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh subscription status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isActive && subscription.current_period_end && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Next billing: {StripeService.formatDate(subscription.current_period_end)}
            </span>
          </div>
          
          {subscription.payment_method_last4 && (
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      )}

      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Your subscription will cancel at the end of the current period.
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SubscriptionStatus;