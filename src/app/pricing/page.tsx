'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/Icons';
import Image from 'next/image';
import PaystackProvider from '@/components/PaystackProvider';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDisplayAmount, convertUSDToZAR } from '@/lib/paystack';

// Types from wallet page
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY' | 'UGX' | 'KES' | 'ZAR';

type CurrencyInfo = {
  symbol: string;
  name: string;
};

// Currency configuration
const currencies: Record<CurrencyCode, CurrencyInfo> = {
  USD: { symbol: '$', name: 'USD' },
  EUR: { symbol: '€', name: 'EUR' },
  GBP: { symbol: '£', name: 'GBP' },
  AUD: { symbol: 'A$', name: 'AUD' },
  CAD: { symbol: 'C$', name: 'CAD' },
  JPY: { symbol: '¥', name: 'JPY' },
  UGX: { symbol: 'USh', name: 'UGX' },
  KES: { symbol: 'KSh', name: 'KES' },
  ZAR: { symbol: 'R', name: 'ZAR' },
};

// Pricing plans data
const pricingPlans = [
  {
    name: 'Starter Plan',
    priceUSD: 0.1,
    description: 'Perfect for individuals starting their creative journey with AI.',
    features: [
      '1,500 Monthly Credits',
      '50 AI-Generated Designs',
      'Basic Design Templates',
      'Standard Image Resolution',
      'Email Support',
      'Community Access',
      'Basic Export Options'
    ],
    buttonText: 'Get Started Now',
    popular: false
  },
  {
    name: 'Pro Plan',
    priceUSD: 39,
    description: 'Ideal for professionals who need more power and flexibility.',
    features: [
      '5,000 Monthly Credits',
      'Unlimited AI-Generated Designs',
      'Premium Design Templates',
      'High-Resolution Images',
      'Priority Support',
      'Advanced Export Options',
      'Custom Branding',
      'API Access'
    ],
    buttonText: 'Get Started Now',
    popular: true
  },
  {
    name: 'Enterprise Plan',
    priceUSD: 99,
    description: 'For teams and organizations requiring maximum capabilities.',
    features: [
      '15,000 Monthly Credits',
      'Unlimited AI-Generated Designs',
      'All Design Templates',
      'Ultra-High Resolution Images',
      '24/7 Priority Support',
      'All Export Options',
      'Custom Branding',
      'API Access',
      'Team Management',
      'Custom Integration Support'
    ],
    buttonText: 'Get Started Now',
    popular: false
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (priceUSD: number) => {
    if (billingCycle === 'yearly') {
      return (priceUSD * 12 * 0.8).toFixed(2); // 20% discount for yearly
    }
    return priceUSD.toFixed(2);
  };

  const handlePlanSelect = async (planName: string) => {
    if (!session?.user?.id) {
      toast.error('Please sign in to select a plan');
      return;
    }

    setIsLoading(true);
    try {
      // Update user's subscription status
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      toast.success('Plan selected successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Select the perfect plan for your needs
          </p>
        </div>

        {/* Currency and Billing Cycle Selector */}
        <div className="mt-8 flex justify-center space-x-4">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
            {Object.entries(currencies).map(([code, info]) => (
                <option key={code} value={code}>
                {info.name} ({info.symbol})
                </option>
              ))}
            </select>
          <div className="flex items-center space-x-2">
              <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md ${
                  billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700'
                }`}
              >
              Monthly
              </button>
              <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md ${
                  billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700'
                }`}
              >
              Yearly (Save 20%)
              </button>
            </div>
          </div>

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h2>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {currencies[selectedCurrency].symbol}
                    {getPrice(plan.priceUSD)}
                      </span>
                  <span className="text-base font-medium text-gray-500">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                </p>
                  <button 
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={isLoading}
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white text-center ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {isLoading ? 'Processing...' : plan.buttonText}
                  </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Icon
                        name="check"
                        className="h-5 w-5 text-green-500"
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  );
} 