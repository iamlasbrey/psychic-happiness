// src/components/layout/Footer.tsx
'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

const bottomVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-6 py-12 sm:py-8 lg:py-20" ref={ref}>
        <motion.div
          className="border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={bottomVariants}
        >
          <p className="text-xs text-neutral-500">
            &copy; 2025 Nata. FIRS-compliant e-invoicing for Nigerian traders.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-neutral-500 hover:text-blue-400 transition-colors duration-200" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-neutral-500 hover:text-primary-400 transition-colors duration-200" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.２ ２４ ２４ ２３．２２７ ２４ ２２．２７１V１．７２９C２４ Ｏ．７７４ ２３．２ Ｏ ２２．２２２ Ｏh．００３z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}