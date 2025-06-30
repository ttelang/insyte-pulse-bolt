export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SammylGXf8yR88',
    priceId: 'price_1RfbD4SGjXnwsvBUHi4TLnwX',
    name: 'Insyte Pulse',
    description: 'Insyte Pulse is an all-in-one, multi-tenant, enterprise-grade cloud platform to analyze customer sentiment, uncover innovation signals, and elevate your brand\'s reputation in real time.',
    mode: 'subscription',
    price: 4.99,
    currency: 'usd',
    interval: 'month'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};