// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import nataLogo from '../../../../public/images/nata-l.png';
import Image from 'next/image';
import { normalizePhoneNumber } from '@/utils/phone';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ phoneNumber: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) {
      setFormError('Please fix the errors below');
      return;
    }
    setIsSubmitting(true);
    const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
    try {
      const result = await signIn('credentials', {
        phoneNumber: normalizedPhone,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }
      if (result?.ok) {
        toast.success('Signed in successfully!');
        router.push('/dashboard');
      }
    } catch {
      setFormError('An unexpected error occurred. Please try again.');
      toast.error('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image 
              src={nataLogo} 
              alt="Nata Logo" 
              width={90} 
              height={90}
              priority
              quality={100}
            />
          </Link>
          <p className="text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h1>
            <p className="text-neutral-600">Sign in to manage your invoices</p>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Phone number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                  +234
                </span>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  placeholder="801 234 5678"
                  className={`w-full pl-14 pr-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.phoneNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  placeholder="Enter your password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors pr-12 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.154M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 disabled:from-blue-300 disabled:to-blue-200 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}