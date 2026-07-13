// src/app/invoices/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Pencil,
  Trash2,
  Loader,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

// ✅ Updated interfaces to match API response exactly
interface ApiLineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

interface ApiCustomer {
  id: string;
  name: string;
  customerPhone: string;
  businessName?: string | null;
  address?: string | null;
}

interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customer: ApiCustomer;
  totalAmount: string;
  subTotal: string;
  vatAmount: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'overdue';
  firsStatus: 'pending' | 'submitted' | 'validated' | 'failed';
  firsIRN?: string | null;
  qrCodeUrl?: string | null;
  pdfUrl?: string | null;
  description?: string | null;
  notes?: string | null;
  lineItems: ApiLineItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceResponse {
  success: boolean;
  data: ApiInvoice;
}

// ✅ UI-friendly shape after mapping
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  issueDate: string;
  dueDate: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'overdue';
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// ✅ Helper to safely parse API string amounts to numbers
const parseAmount = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(value) || 0;
};

// ✅ Mapper: API response → UI-friendly Invoice shape
const mapApiInvoiceToUI = (api: ApiInvoice, sessionBusinessName?: string): Invoice => {
  const vatRate = api.vatAmount && api.subTotal 
    ? (parseAmount(api.vatAmount) / parseAmount(api.subTotal)) * 100 
    : 7.5;

  return {
    id: api.id,
    invoiceNumber: api.invoiceNumber,
    customerName: api.customerName,
    customerEmail: api.customer.businessName || api.customer.name,
    customerPhone: api.customer.customerPhone,
    customerAddress: api.customer.address || undefined,
    businessName: sessionBusinessName || 'Your Business',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    issueDate: api.issueDate,
    dueDate: api.dueDate,
    paymentStatus: api.paymentStatus,
    status: api.paymentStatus,
    subtotal: parseAmount(api.subTotal),
    taxRate: vatRate,
    taxAmount: parseAmount(api.vatAmount),
    totalAmount: parseAmount(api.totalAmount),
    notes: api.notes || undefined,
    items: api.lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: parseAmount(item.quantity),
      unitPrice: parseAmount(item.unitPrice),
      total: parseAmount(item.amount),
    })),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
};

const statusConfig = {
  paid: {
    label: 'Paid',
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
    dot: 'bg-primary-500',
    icon: CheckCircle,
    iconColor: 'text-primary-600',
    badgeBg: 'bg-primary-100',
  },
  unpaid: {
    label: 'Unpaid',
    bg: 'bg-secondary-50',
    text: 'text-secondary-700',
    border: 'border-secondary-200',
    dot: 'bg-secondary-500',
    icon: Clock,
    iconColor: 'text-secondary-600',
    badgeBg: 'bg-secondary-100',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100',
  },
};

const formatCurrency = (value: number): string => {
  return `₦${value?.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function InvoicePage() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const sessionBusinessName = (session as { user?: { businessName?: string } })?.user?.businessName;
  
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sending, setSending] = useState(false);

  // ✅ FIX: All setState calls inside async function; sessionStatus in deps
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    const fetchInvoice = async () => {
      if (!accessToken || !invoiceId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          await signOut({ callbackUrl: '/login' });
          return;
        }

        if (response.status === 404) {
          toast.error('Invoice not found');
          router.push('/dashboard');
          return;
        }

        if (!response.ok) {
          toast.error('Failed to fetch invoice');
          setLoading(false);
          return;
        }

        const data: InvoiceResponse = await response.json();
        if (data.success) {
          setInvoice(mapApiInvoiceToUI(data.data, sessionBusinessName));
        }
      } catch (error) {
        toast.error('Error loading invoice');
        console.error('Invoice fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [accessToken, invoiceId, router, sessionStatus, sessionBusinessName]);

  const handleCopyInvoiceNumber = () => {
    if (invoice?.invoiceNumber) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      setCopied(true);
      toast.success('Invoice number copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!accessToken) return;
    setDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        await signOut({ callbackUrl: '/login' });
        return;
      }

      if (!response.ok) {
        toast.error('Failed to delete invoice');
        setDeleting(false);
        return;
      }

      toast.success('Invoice deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Error deleting invoice');
      console.error('Delete error:', error);
      setDeleting(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!accessToken) return;
    setSending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}/send`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        await signOut({ callbackUrl: '/login' });
        return;
      }

      if (!response.ok) {
        toast.error('Failed to send invoice');
        setSending(false);
        return;
      }

      toast.success('Invoice sent to customer');
    } catch (error) {
      toast.error('Error sending invoice');
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  };

  // ✅ NEW: MVP WhatsApp share function
  const handleShareWhatsApp = () => {
    if (!invoice) return;
    
    const message = `*Invoice ${invoice.invoiceNumber}*\n` +
      `Customer: ${invoice.customerName}\n` +
      `Amount: ${formatCurrency(invoice.totalAmount)}\n` +
      `Due: ${formatDate(invoice.dueDate)}\n` +
      `Status: ${statusConfig[invoice.paymentStatus]?.label}\n\n` +
      `View details: ${typeof window !== 'undefined' ? window.location.origin : ''}/invoices/${invoice.id}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon');
  };

  const status = invoice?.paymentStatus || 'pending';
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = config?.icon || Clock;

  const isInitialLoading = sessionStatus === 'loading' || loading;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="w-16 h-16 text-neutral-300" />
        <h2 className="text-xl font-semibold text-neutral-700">Invoice not found</h2>
        <p className="text-neutral-500">The invoice you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-sm bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOverdue = status === 'overdue';
  const isPaid = status === 'paid';

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/invoices" className="hover:text-primary-600 transition-colors">
            Invoices
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900 font-medium">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 font-medium text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-11"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 font-medium text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-11"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          
          {/* ✅ NEW: WhatsApp Share Button (MVP) */}
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 font-medium text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-11"
            title="Share via WhatsApp"
          >
            <Send className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          
          <Link
            href={`/invoices/${invoiceId}/edit`}
            className="inline-flex items-center gap-2 font-medium text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-11"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 font-medium text-sm text-red-600 bg-white border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-400 min-h-11"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-neutral-900">{invoice.invoiceNumber}</h1>
                  <button
                    onClick={handleCopyInvoiceNumber}
                    className="p-1 rounded-md hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600 min-h-11 min-w-11 flex items-center justify-center"
                    title="Copy invoice number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Created on {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}
              >
                <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
                {config.label}
              </span>
              {isOverdue && (
                <span className="text-sm text-red-600 font-medium">
                  Due {formatDate(invoice.dueDate)}
                </span>
              )}
              {isPaid && (
                <span className="text-sm text-primary-600 font-medium">
                  Paid on {formatDate(invoice.updatedAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-1">
            <p className="text-sm text-neutral-500">Total Amount</p>
            <p className="text-3xl font-bold text-neutral-900 tracking-tight">
              {formatCurrency(invoice.totalAmount)}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="w-4 h-4" />
                <span>Issued: {formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Clock className="w-4 h-4" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  Due: {formatDate(invoice.dueDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            {/* From / To Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 border-b border-neutral-200">
              {/* From */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">From</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    <p className="font-semibold text-neutral-900">{invoice.businessName}</p>
                  </div>
                  {invoice.businessEmail && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <span>{invoice.businessEmail}</span>
                    </div>
                  )}
                  {invoice.businessPhone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span>{invoice.businessPhone}</span>
                    </div>
                  )}
                  {invoice.businessAddress && (
                    <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <span>{invoice.businessAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* To */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Bill To</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <p className="font-semibold text-neutral-900">{invoice.customerName}</p>
                  </div>
                  {invoice.customerEmail && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <span>{invoice.customerEmail}</span>
                    </div>
                  )}
                  {invoice.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <span>{invoice.customerPhone}</span>
                    </div>
                  )}
                  {invoice.customerAddress && (
                    <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <span>{invoice.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Qty
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Unit Price
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {invoice.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-neutral-900 font-medium">{item.description}</td>
                      <td className="px-6 py-4 text-neutral-600 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-6 py-4 text-neutral-600 text-right tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-neutral-900 font-semibold text-right tabular-nums">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-200 bg-neutral-50/30 p-6">
              <div className="flex flex-col items-end gap-2 max-w-xs ml-auto">
                <div className="flex justify-between w-full text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-900 font-medium tabular-nums">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between w-full text-sm">
                  <span className="text-neutral-500">Tax ({invoice.taxRate.toFixed(1)}%)</span>
                  <span className="text-neutral-900 font-medium tabular-nums">
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between w-full pt-2 border-t border-neutral-200">
                  <span className="text-neutral-900 font-semibold">Total</span>
                  <span className="text-neutral-900 font-bold text-lg tabular-nums">
                    {formatCurrency(invoice.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-neutral-200 p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Payment Status</p>
            <div className={`flex items-center gap-3 p-4 rounded-lg ${config.bg} border ${config.border}`}>
              <div className={`w-10 h-10 rounded-lg ${config.badgeBg} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div>
                <p className={`font-semibold ${config.text}`}>{config.label}</p>
                <p className="text-sm text-neutral-500">
                  {isPaid
                    ? 'Payment received'
                    : isOverdue
                    ? 'Payment is overdue'
                    : 'Awaiting payment'}
                </p>
              </div>
            </div>

            {!isPaid && (
              <button
                onClick={() => toast.info('Mark as paid feature coming soon')}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 font-semibold text-sm bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 min-h-11"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as Paid
              </button>
            )}
          </div>

          {/* Invoice Info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Invoice Info</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Invoice Number</span>
                <span className="text-neutral-900 font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Issue Date</span>
                <span className="text-neutral-900">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Due Date</span>
                <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Last Updated</span>
                <span className="text-neutral-900">{formatDate(invoice.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{invoice.customerName}</p>
                <p className="text-sm text-neutral-500">{invoice.customerEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Delete Invoice</h3>
                <p className="text-sm text-neutral-500">
                  Are you sure you want to delete {invoice.invoiceNumber}? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex items-center font-medium text-sm text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-lg transition-all min-h-11"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 font-medium text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all disabled:opacity-50 min-h-11"
              >
                {deleting && <Loader className="w-4 h-4 animate-spin" />}
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}