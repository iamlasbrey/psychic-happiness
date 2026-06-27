// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import nataLogo from '../../../public/images/nata-l.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          >
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Image 
                src={nataLogo} 
                alt="Nata Logo" 
                width={90} 
                height={90}
                priority
                quality={100}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05, ease: 'easeOut' }}
              >
                <Link
                  href={item.href}
                  className={`text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-primary-500 border-b-2 border-primary-500 pb-1'
                      : 'text-neutral-500 hover:text-primary-500'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>

          {/* Right Side */}
          <motion.div 
            className="flex items-center gap-3 sm:gap-4 shrink-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          >
            <Link
              href="/signup"
              className="hidden md:block font-semibold text-sm bg-linear-to-r from-primary-500 to-primary-400 text-white px-5 py-2.5 rounded-lg hover:from-primary-600 hover:to-primary-500 transition-colors"
            >
              Get started
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg touch-manipulation"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav 
              className="md:hidden mt-4 border-t border-neutral-200 pt-4 pb-2 space-y-1 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition min-h-44px flex items-center ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-neutral-700 hover:bg-neutral-50 font-semibold'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              >
                <Link
                  href="/signup"
                  className="w-full bg-linear-to-r from-blue-500 to-blue-400 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-500 transition-colors text-center text-base mt-4 min-h-44px flex items-center justify-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get started
                </Link>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}