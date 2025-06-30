import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Zap, 
  Home,
  User,
  LogOut,
  ChevronDown,
  Crown,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StripeService, SubscriptionData } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const data = await StripeService.getUserSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };

    if (user) {
      loadSubscription();
    }
  }, [user]);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/forms', icon: FileText, label: 'Forms' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/integrations', icon: Zap, label: 'Integrations' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSubscriptionDisplay = () => {
    if (!subscription || subscription.subscription_status === 'not_started') {
      return {
        text: 'Free Plan',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100'
      };
    }

    const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
    const isActive = StripeService.isSubscriptionActive(subscription.subscription_status);

    return {
      text: product?.name || 'Subscription',
      color: isActive ? 'text-blue-600' : 'text-yellow-600',
      bgColor: isActive ? 'bg-blue-50' : 'bg-yellow-50'
    };
  };

  const subscriptionDisplay = getSubscriptionDisplay();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FeedbackPro</h1>
              <p className="text-xs text-gray-500">Form Builder</p>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="px-3 py-4 border-b border-gray-200">
          <div className={`${subscriptionDisplay.bgColor} rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className={`w-4 h-4 ${subscriptionDisplay.color}`} />
                <span className={`text-sm font-medium ${subscriptionDisplay.color}`}>
                  {subscriptionDisplay.text}
                </span>
              </div>
              {(!subscription || subscription.subscription_status === 'not_started') && (
                <Link
                  to="/pricing"
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Upgrade
                </Link>
              )}
            </div>
            {subscription && subscription.subscription_status !== 'not_started' && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${subscriptionDisplay.color}`}>
                    {subscription.subscription_status.replace('_', ' ')}
                  </span>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-600">Next billing:</span>
                    <span className="text-gray-700">
                      {StripeService.formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
                >
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Billing</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;