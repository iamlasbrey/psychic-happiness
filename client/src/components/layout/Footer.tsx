// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Features</Link></li>
              <li><Link href="/pricing" className="text-sm transition-colors hover:text-blue-400">Pricing</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm transition-colors hover:text-blue-400">About</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Blog</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Privacy</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Help Center</Link></li>
              <li><Link href="#" className="text-sm transition-colors hover:text-blue-400">Email</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-8 text-center">
          <p className="text-xs text-neutral-500">&copy; 2025 Nnata. FIRS-compliant e-invoicing for Nigerian traders.</p>
        </div>
      </div>
    </footer>
  );
}