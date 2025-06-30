import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS, StripeProduct } from '../stripe-config';

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface OrderData {
  customer_id: string;
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

export class StripeService {
  static async createCheckoutSession(
    priceId: string,
    mode: 'payment' | 'subscription' = 'subscription'
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  static async getUserSubscription(): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  static async getUserOrders(): Promise<OrderData[]> {
    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  static getProducts(): StripeProduct[] {
    return STRIPE_PRODUCTS;
  }

  static getProductByPriceId(priceId: string): StripeProduct | undefined {
    return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
  }

  static formatPrice(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  static formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  static isSubscriptionActive(status: string): boolean {
    return ['active', 'trialing'].includes(status);
  }

  static getSubscriptionStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-600 bg-green-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}