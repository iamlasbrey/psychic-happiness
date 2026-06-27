'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import nataLogo from '../../../../public/images/nata-l.png';
import Image from 'next/image';

export default function Signup() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessRegNumber: '',
    tin: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

const validateForm = () => {
  const newErrors: Record<string, string> = {};

  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
  if (!formData.password || formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }
  if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
  if (!formData.businessRegNumber.trim()) newErrors.businessRegNumber = 'Registration number is required';
  if (!formData.tin.trim()) newErrors.tin = 'TIN is required';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError(null);

  if (!validateForm()) {
    setFormError('Please fix the errors below');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        businessName: formData.companyName,
        businessRegistrationNumber: formData.businessRegNumber,
        tin: formData.tin,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setFormError(errorData.message || 'Signup failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    toast.success('Account created successfully! Redirecting to login...');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    console.error('Signup error:', error);
    setFormError('An error occurred. Please try again.');
    toast.error('Signup failed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-secondary-600 font-medium hover:text-secondary-700">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-500 mb-2">
              Create your account
            </h1>
            <p className="text-neutral-600">
              Start invoicing through WhatsApp in minutes
            </p>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="firstName" 
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  placeholder="John"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                  }`}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label 
                  htmlFor="lastName" 
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                  placeholder="Doe"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                  }`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label 
                htmlFor="phoneNumber" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Phone number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600 text-sm font-medium">
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
                  className={`w-full pl-14 pr-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.phoneNumber
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                  }`}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
              <p className="mt-1 text-xs text-neutral-500">
                This will be your WhatsApp number for sending invoices
              </p>
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                placeholder="Enter your password"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                }`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                placeholder="Re-enter your password"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                }`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label 
                htmlFor="companyName" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Company name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                placeholder="Your Business Name"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.companyName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                }`}
              />
              {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
            </div>

            {/* Business Registration Number */}
            <div>
              <label 
                htmlFor="businessRegNumber" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Business Registration Number
              </label>
              <input
                type="text"
                id="businessRegNumber"
                name="businessRegNumber"
                value={formData.businessRegNumber}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                placeholder="RC 1234567 or BN 1234567"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.businessRegNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                }`}
              />
              {errors.businessRegNumber && <p className="mt-1 text-sm text-red-600">{errors.businessRegNumber}</p>}
              <p className="mt-1 text-xs text-neutral-500">
                Your CAC registration number (RC or BN)
              </p>
            </div>

            {/* TIN */}
            <div>
              <label 
                htmlFor="tin" 
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                TIN (Tax Identification Number)
              </label>
              <input
                type="text"
                id="tin"
                name="tin"
                value={formData.tin}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                placeholder="12345678-0001"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.tin
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 focus:ring-primary-400 focus:border-primary-400'
                }`}
              />
              {errors.tin && <p className="mt-1 text-sm text-red-600">{errors.tin}</p>}
              <p className="mt-1 text-xs text-neutral-500">
                Required for FIRS-compliant invoices
              </p>
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-neutral-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-secondary-600 hover:text-secondary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-secondary-600 hover:text-secondary-700">
              Privacy Policy
            </Link>
          </p>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}