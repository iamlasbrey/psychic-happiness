// src/components/sections/CTA.tsx
'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-500 to-blue-400 px-6 py-16 sm:py-20 lg:py-24 text-center"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
              Start invoicing like a pro
            </h2>
            <p className="text-base sm:text-lg text-blue-50 max-w-xl mx-auto mb-10 leading-relaxed">
              Join traders across Nigeria already using Nata
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="inline-block font-semibold text-sm bg-white text-blue-600 px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto text-center"
              >
                Get started free
              </a>
              <a
                href="#how-it-works"
                className="inline-block font-semibold text-sm bg-transparent text-white border-2 border-white/40 px-8 py-3.5 rounded-lg hover:bg-white/10 hover:border-white/60 transition-colors w-full sm:w-auto text-center"
              >
                See demo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}