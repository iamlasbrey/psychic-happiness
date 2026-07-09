// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  Plus, Search, FileText, Clock, CheckCircle, TrendingUp,
  ArrowUpRight, Loader, MoreHorizontal, ChevronLeft, ChevronRight,
  LucideIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  issueDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'overdue';
  status: string;
}

interface InvoicesResponse {
  success: boolean;
  data: Invoice[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

interface StatsResponse {
  success: boolean;
  data: {
    totalInvoices: number;
    pendingAmount: number;
    paidThisMonth: number;
    growthPercentage: number;
  };
}

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

interface Pagination {
  total: number;
  pages: number;
}

const statusBadge = {
  paid: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', dot: 'bg-primary-500', label: 'Paid' },
  unpaid: { bg: 'bg-secondary-50', text: 'text-secondary-700', border: 'border-secondary-200', dot: 'bg-secondary-500', label: 'Unpaid' },
  pending: { bg: 'bg-secondary-50', text: 'text-secondary-700', border: 'border-secondary-200', dot: 'bg-secondary-500', label: 'Pending' },
  overdue: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Overdue' },
};

const defaultStats: Stat[] = [
  { label: 'Total Invoices', value: '0', change: '0%', icon: FileText, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
  { label: 'Pending', value: '₦0', change: '0%', icon: Clock, iconColor: 'text-secondary-600', bgColor: 'bg-secondary-50' },
  { label: 'Paid This Month', value: '₦0', change: '0%', icon: CheckCircle, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
  { label: 'Growth', value: '+0%', change: '0%', icon: TrendingUp, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
];

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`;
  return `₦${value}`;
};

const mapApiStatsToStats = (apiData: StatsResponse['data']): Stat[] => [
  { label: 'Total Invoices', value: apiData.totalInvoices.toString(), change: '+0%', icon: FileText, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
  { label: 'Pending', value: formatCurrency(apiData.pendingAmount), change: '+0%', icon: Clock, iconColor: 'text-secondary-600', bgColor: 'bg-secondary-50' },
  { label: 'Paid This Month', value: formatCurrency(apiData.paidThisMonth), change: '+0%', icon: CheckCircle, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
  { label: 'Growth', value: `${apiData.growthPercentage > 0 ? '+' : ''}${apiData.growthPercentage.toFixed(1)}%`, change: '+0%', icon: TrendingUp, iconColor: 'text-primary-600', bgColor: 'bg-primary-50' },
];

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = session?.accessToken;

  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pages: 0 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Single loading state, clean fetch
  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !accessToken) {
      return;
    }

    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (debouncedSearch) params.append('q', debouncedSearch);
        if (statusFilter) params.append('paymentStatus', statusFilter);

        const [statsRes, invoicesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
          }),
        ]);

        // Handle 401 session expiry
        if (statsRes.status === 401 || invoicesRes.status === 401) {
          toast.error('Session expired. Please login again.');
          await signOut({ callbackUrl: '/login' });
          return;
        }

        if (statsRes.ok) {
          const statsData: StatsResponse = await statsRes.json();
          setStats(mapApiStatsToStats(statsData.data));
        }

        if (invoicesRes.ok) {
          const invData: InvoicesResponse = await invoicesRes.json();
          setInvoices(invData.data);
          setPagination({
            total: invData.pagination.total,
            pages: invData.pagination.pages,
          });
        } else if (!controller.signal.aborted) {
          toast.error('Failed to load invoices');
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError' && !controller.signal.aborted) {
          toast.error('Failed to load dashboard data');
          console.error(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => controller.abort();
  }, [sessionStatus, accessToken, page, debouncedSearch, statusFilter, limit]);

  const handlePrevPage = useCallback(() => { 
    if (page > 1) setPage(page - 1); 
  }, [page]);

  const handleNextPage = useCallback(() => { 
    if (page < pagination.pages) setPage(page + 1); 
  }, [page, pagination.pages]);

  const isLoading = sessionStatus === 'loading' || loading;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Welcome back, {session?.user?.businessName || 'there'}
        </h1>
        <p className="text-neutral-500 mt-1.5 text-sm sm:text-base">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-neutral-200 mb-4" />
              <div className="h-8 bg-neutral-200 rounded mb-2" />
              <div className="h-4 bg-neutral-100 rounded w-20" />
            </div>
          ))
        ) : (
          stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-neutral-900 tracking-tight">{stat.value}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Recent Invoices</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage and track your latest invoices</p>
        </div>
       </div>

      {/* Invoice Section */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all min-h-[44px]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="inline-flex items-center text-sm font-medium text-neutral-700 bg-white border border-neutral-300 px-4 py-2 rounded-lg hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all cursor-pointer min-h-[44px]"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-3.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoices.length > 0 ? invoices.map((inv) => {
                    const badge = statusBadge[inv.paymentStatus] || statusBadge.pending;
                    return (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <Link href={`/invoices/${inv.id}`} className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-neutral-700 font-medium">{inv.customerName}</td>
                        <td className="px-5 py-4 text-neutral-500 text-sm">
                          {new Date(inv.issueDate).toLocaleDateString('en-NG', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-5 py-4 text-neutral-900 font-semibold text-right tabular-nums">
                          ₦{inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button 
                            className="p-1.5 rounded-md hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-600 min-h-[44px] min-w-[44px] flex items-center justify-center" 
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-neutral-300" />
                          <p className="text-neutral-500 font-medium">No invoices found</p>
                          <p className="text-neutral-400 text-sm">Create your first invoice to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-neutral-100">
              {invoices.length > 0 ? invoices.map((inv) => {
                const badge = statusBadge[inv.paymentStatus] || statusBadge.pending;
                return (
                  <div key={inv.id} className="p-4 hover:bg-neutral-50/80 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-primary-600">
                        {inv.invoiceNumber}
                      </Link>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-neutral-900 font-medium">{inv.customerName}</p>
                      <p className="text-neutral-900 font-semibold tabular-nums">
                        ₦{inv.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>
                        {new Date(inv.issueDate).toLocaleDateString('en-NG', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <Link href={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        View details
                      </Link>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center">
                  <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500 font-medium">No invoices found</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-neutral-200 bg-neutral-50/30">
              <span className="text-sm text-neutral-500">
                Showing {invoices.length} of {pagination.total} invoices
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-600" />
                </button>
                <span className="text-sm text-neutral-600 font-medium min-w-[100px] text-center">
                  Page {page} of {pagination.pages || 1}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={page >= pagination.pages}
                  className="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}