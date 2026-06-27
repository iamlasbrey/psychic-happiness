// src/components/sections/HowItWorks.tsx
'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    step: 1,
    title: 'Create invoice',
    description: 'Enter customer details and amount. Pick your template.',
  },
  {
    step: 2,
    title: 'Send via WhatsApp',
    description: 'One tap. Invoice lands in their chat with QR code.',
  },
  {
    step: 3,
    title: 'Get FIRS IRN',
    description: 'Automatic compliance. No paperwork. You\'re covered.',
  },
  {
    step: 4,
    title: 'Track payment',
    description: 'Dashboard shows who paid. Automatic reminders for late payments.',
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

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="bg-neutral-50 py-18 sm:py-18 lg:py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={headerVariants}
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-secondary-800 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
            Simple as a WhatsApp message
          </h2>
          <p className="mt-5 text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            From first invoice to paid in four easy steps. No learning curve, no friction.
          </p>
        </motion.div>

        {/* Steps Grid with Timeline */}
        <div className="relative">
          {/* Desktop Connecting Line - spans all 4 cards */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-blue-200" />

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-4"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col"
              >
                {/* Mobile/Tablet Connecting Line - between cards */}
                {index !== steps.length - 1 && (
                  <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-6 bg-blue-200 z-0" />
                )}

                <div className="relative flex-1 flex flex-col bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 text-center hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 z-10 mb-6 lg:mb-0">
                  {/* Step Number Badge */}
                  <div className="flex justify-center mb-5">
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white text-sm font-bold shadow-lg shadow-primary-200 group-hover:scale-110 group-hover:bg-primary-600 transition-all duration-300 z-20">
                      {item.step}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-bold text-secondary-800 mb-2 group-hover:primary-blue-500 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1 group-hover:text-neutral-600 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}