// src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data (replace with API call later)
const invoices = [
  { id: 'INV-001', client: 'Lagos Trading Co.', date: 'Jun 24, 2026', amount: '₦145,000', status: 'paid' },
  { id: 'INV-002', client: 'Abuja Freight Ltd.', date: 'Jun 22, 2026', amount: '₦89,500', status: 'pending' },
  { id: 'INV-003', client: 'Port Harcourt Exports', date: 'Jun 18, 2026', amount: '₦210,000', status: 'overdue' },
  { id: 'INV-004', client: 'Kano Logistics', date: 'Jun 15, 2026', amount: '₦62,300', status: 'paid' },
];

const statusBadge = {
  paid: { 
    class: 'bg-primary-50 text-primary-700 border-primary-200', 
    label: 'Paid', 
    icon: <CheckCircle className="w-3.5 h-3.5" /> 
  },
  pending: { 
    class: 'bg-secondary-50 text-secondary-700 border-secondary-200', 
    label: 'Pending', 
    icon: <Clock className="w-3.5 h-3.5" /> 
  },
  overdue: { 
    class: 'bg-red-50 text-red-700 border-red-200', 
    label: 'Overdue', 
    icon: <Clock className="w-3.5 h-3.5" /> 
  },
};

const stats = [
  { 
    label: 'Total Invoices', 
    value: '24', 
    change: '+8%',
    trend: 'up',
    icon: <FileText className="w-5 h-5 text-primary-600" /> 
  },
  { 
    label: 'Pending', 
    value: '₦189.5K', 
    change: '+12%',
    trend: 'up',
    icon: <Clock className="w-5 h-5 text-secondary-600" /> 
  },
  { 
    label: 'Paid This Month', 
    value: '₦412.3K', 
    change: '+23%',
    trend: 'up',
    icon: <CheckCircle className="w-5 h-5 text-primary-600" /> 
  },
  { 
    label: 'Growth', 
    value: '+12.4%', 
    change: '+2.1%',
    trend: 'up',
    icon: <TrendingUp className="w-5 h-5 text-primary-600" /> 
  },
];

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
          Welcome back, {session?.user?.businessName || 'there'}
        </h1>
        <p className="text-neutral-600 mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-600">{stat.label}</span>
              <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center border border-neutral-100">
                {stat.icon}
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900">{stat.value}</p>
            <div className="flex items-center gap-1 mt-2">
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-primary-600" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
              )}
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-primary-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-neutral-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Recent Invoices</h2>
          <p className="text-sm text-neutral-600 mt-0.5">Manage and track your latest invoices</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {/* Invoice Section */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-neutral-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 px-4 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th scope="col" className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Amount</th>
                <th scope="col" className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">Status</th>
                <th scope="col" className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {inv.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-neutral-700">{inv.client}</td>
                  <td className="px-5 py-4 text-neutral-500 text-sm">{inv.date}</td>
                  <td className="px-5 py-4 text-neutral-900 font-semibold text-right">{inv.amount}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[inv.status as keyof typeof statusBadge].class}`}>
                      {statusBadge[inv.status as keyof typeof statusBadge].icon}
                      {statusBadge[inv.status as keyof typeof statusBadge].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button className="p-1.5 rounded-md hover:bg-neutral-200 transition-colors" aria-label="More actions">
                      <MoreVertical className="w-4 h-4 text-neutral-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-neutral-100">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 flex flex-col gap-3 hover:bg-neutral-50 transition-colors">
              <div className="flex items-center justify-between">
                <Link href={`/invoices/${inv.id}`} className="font-medium text-primary-600">
                  {inv.id}
                </Link>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge[inv.status as keyof typeof statusBadge].class}`}>
                  {statusBadge[inv.status as keyof typeof statusBadge].icon}
                  {statusBadge[inv.status as keyof typeof statusBadge].label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-neutral-900 font-medium">{inv.client}</p>
                <p className="text-neutral-900 font-semibold">{inv.amount}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>{inv.date}</span>
                <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-200 text-sm text-neutral-600">
          <span>Showing 4 of 24 invoices</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Prev
            </button>
            <button className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}