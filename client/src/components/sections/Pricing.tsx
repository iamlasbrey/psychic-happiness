// src/components/sections/Pricing.tsx
'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

const plans = [
  {
    name: 'Pay As You Go',
    price: '₦0',
    period: 'per invoice',
    description: 'Perfect for occasional invoicing. No commitment.',
    features: [
      '₦50 per invoice sent',
      'FIRS RRN generation',
      'WhatsApp delivery',
      'Basic tracking',
      'No monthly fee',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '₦1,500',
    period: 'per month',
    description: 'For small businesses sending regular invoices.',
    features: [
      'Up to 50 invoices/month',
      'FIRS RRN generation',
      'WhatsApp delivery',
      'Basic reporting',
      'Email support',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₦3,000',
    period: 'per month',
    description: 'For growing businesses that need full control.',
    features: [
      'Unlimited invoices',
      'FIRS RRN + QR codes',
      'Payment reminders',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Get started',
    highlighted: true,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="bg-white py-12 sm:py-12 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={headerVariants}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-secondary-800 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
            Simple pricing
          </h2>
          <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Start free, scale when you grow. No hidden charges.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`group relative flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-white border-2 border-blue-500 shadow-xl shadow-blue-100'
                  : 'bg-white border border-neutral-200/80 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block bg-secondary-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-secondary-800">
                    {plan.price}
                  </span>
                </div>
                <span className="text-sm text-neutral-500">{plan.period}</span>
              </div>

              <p className="text-sm text-neutral-500 text-center mb-6 leading-relaxed">
                {plan.description}
              </p>

              {/* Divider */}
              <div className="border-t border-neutral-100 mb-6" />

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-neutral-600">
                    <svg
                      className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href="/signup"
                className={`block w-full text-center font-semibold text-sm px-6 py-3 rounded-lg transition-colors ${
                  plan.highlighted
                    ? 'bg-secondary-800 text-white hover:bg-secondary-600'
                    : 'border border-secondary-500 text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}