// src/components/sections/Features.tsx
'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';
import {
  WhatsAppIcon,
  CheckIcon,
  PhoneIcon,
  FileTextIcon,
  ZapIcon,
  WalletIcon,
} from '../icons';

const features = [
  {
    icon: WhatsAppIcon,
    title: 'WhatsApp native',
    description: 'Customers already use WhatsApp. Send invoices in seconds. They click and pay. Everything.',
  },
  {
    icon: CheckIcon,
    title: 'FIRS compliant',
    description: 'Automatic RRN generation, QR codes, and audit-ready records. Stay on FIRS good side.',
  },
  {
    icon: PhoneIcon,
    title: 'Phone-first',
    description: 'Manage everything from your phone. No laptop needed. We built in Lagos, Port Harcourt, Abuja.',
  },
  {
    icon: FileTextIcon,
    title: 'Payment tracking',
    description: 'See who paid, who owes, and when. Reminders keep cash flowing.',
  },
  {
    icon: ZapIcon,
    title: 'FIRS integration',
    description: 'Connect with Remita, E-filing, and all approved Access Point Providers.',
  },
  {
    icon: WalletIcon,
    title: 'Affordable',
    description: 'No hidden payment. No surprises. Pricing for real traders.',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="bg-white sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          className="text-center mb-10 sm:mb-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={headerVariants}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-secondary-800 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
            Built for Nigerian traders
          </h2>
          <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Everything a small business needs to invoice professionally and stay FIRS-compliant.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white border border-neutral-200/80 rounded-2xl p-7 sm:p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 text-center sm:text-left"
              >
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-50/0 via-blue-50/0 to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative flex flex-col items-center sm:items-start">
                  <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 text-primary-500 mb-5 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                    <IconComponent />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mb-2 group-hover:text-secondary-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-600 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}