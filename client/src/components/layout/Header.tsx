// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import nataLogo from '../../../public/images/nata-l.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/features' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors text-nowrap ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-neutral-500 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              href="/signup"
              className="hidden md:block font-semibold text-sm bg-linear-to-r from-blue-500 to-blue-400 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-500 transition-colors"
            >
              Get started
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg touch-manipulation"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-4 border-t border-neutral-200 pt-4 pb-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={` px-4 py-3 rounded-lg text-base font-medium transition min-h-44px flex items-center ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-neutral-700 hover:bg-neutral-50 font-semibold'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className=" w-full bg-linear-to-r from-blue-500 to-blue-400 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-500 transition-colors text-center text-base mt-4 min-h-44px flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}