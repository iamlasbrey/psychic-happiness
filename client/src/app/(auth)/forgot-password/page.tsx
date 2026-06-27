// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import nataLogo from '../../../../public/images/nata-l.png';
import Image from 'next/image';

export default function ForgotPassword() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Failed to send reset link';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = responseText.substring(0, 100) || `HTTP ${response.status}`;
        }
        toast.error(errorMessage);
        return;
      }

      setSubmitted(true);
      toast.success('Reset instructions sent to your WhatsApp');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src={nataLogo} 
              alt="Nata Logo" 
              width={90} 
              height={90}
              priority
              quality={100}
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {!submitted ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-500 mb-2">
                  Forgot password?
                </h1>
                <p className="text-neutral-600">
                  No worries. Enter your phone number and we&apos;ll send reset instructions to your WhatsApp.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Phone Number */}
                <div>
                  <label 
                    htmlFor="phoneNumber" 
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Phone number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                      +234
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSubmitting}
                      required
                      placeholder="801 234 5678"
                      className="w-full pl-14 pr-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send reset instructions'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Check your WhatsApp
              </h2>
              <p className="text-neutral-600 mb-6">
                We&apos;ve sent password reset instructions to <span className="font-medium text-neutral-900">+234 {phoneNumber}</span>.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Back to sign in
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              ← Remember your password? Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}