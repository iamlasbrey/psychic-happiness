// src/components/sections/Hero.tsx
'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="pt-14 sm:pt-18 bg-linear-to-b from-blue-50 via-white to-white border-b border-neutral-200 flex items-start">
      <div className="w-[80%] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Div 1: Left Writeup */}
          <motion.div 
            className="flex flex-col gap-5 items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            >
              Invoicing made simple. <br className="hidden sm:block" /> Powered by WhatsApp.
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            >
              Create, send, and track professional invoices directly through WhatsApp. No complex dashboards. No hidden fees. Just seamless billing for Nigerian businesses.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            >
              <motion.a
                href="/signup"
                className="inline-flex items-center justify-center font-semibold text-sm bg-linear-to-r from-blue-500 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-500 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Get started
              </motion.a>
              <motion.a
                href="#how-it-works"
                className="inline-flex items-center justify-center font-semibold text-sm text-neutral-700 border border-neutral-300 px-6 py-3 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn more
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Div 2: Right Image */}
          <motion.div 
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="w-full max-w-md mx-auto aspect-4/3 bg-neutral-100 rounded-2xl overflow-hidden shadow-xl">
              {/* Image placeholder */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}