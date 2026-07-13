// src/app/invoices/[id]/edit/page.tsx
'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader,
  ChevronRight,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  taxRate: number;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'overdue';
  items: LineItem[];
}

const generateId = () => Math.random().toString(36).slice(2, 9);

const formatCurrency = (value: number): string => {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
] as const;

const calculateSubtotal = (items: LineItem[]): number => {
  return items.reduce((sum: number, item: LineItem) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
};

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = use(params);
  
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = typeof session?.accessToken === 'string' ? session.accessToken : undefined;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [form, setForm] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    issueDate: '',
    dueDate: '',
    notes: '',
    taxRate: 7.5,
    paymentStatus: 'unpaid',
    items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
  });

  const subtotal = calculateSubtotal(form.items);
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (sessionStatus === 'loading' || !accessToken || !invoiceId) return;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.status === 401) {
          toast.error('Session expired. Please login again.');
          await signOut({ callbackUrl: '/login' });
          return;
        }
        if (res.status === 404) {
          toast.error('Invoice not found');
          router.push('/dashboard');
          return;
        }
        if (!res.ok) throw new Error('Failed to load invoice');

        const { data: api } = await res.json();

        setInvoiceNumber(api.invoiceNumber || '');

        setForm({
          customerName: api.customerName || '',
          customerEmail: api.customer?.email || api.customer?.businessName || '',
          customerPhone: api.customer?.customerPhone || '',
          customerAddress: api.customer?.address || '',
          issueDate: api.issueDate?.split('T')[0] || '',
          dueDate: api.dueDate?.split('T')[0] || '',
          notes: api.notes || '',
          taxRate: api.vatAmount && api.subTotal 
            ? (Number(api.vatAmount) / Number(api.subTotal)) * 100 
            : 7.5,
          paymentStatus: api.paymentStatus || 'unpaid',
          items: api.lineItems?.length > 0 
            ? api.lineItems.map((item: LineItem) => ({
                id: item.id || generateId(),
                description: item.description || '',
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.unitPrice) || 0,
              }))
            : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
        });
      } catch (error: unknown) {
        console.error('Fetch error:', error);
        const message = error instanceof Error ? error.message : 'Failed to load invoice details';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [accessToken, invoiceId, router, sessionStatus]);

  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const addItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }],
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }, [form.items.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName.trim()) return toast.error('Customer name is required');
    if (!form.issueDate || !form.dueDate) return toast.error('Issue and due dates are required');
    if (form.items.every((i) => !i.description.trim())) return toast.error('At least one item is required');

    setSaving(true);

    const payload = {
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      notes: form.notes || undefined,
      paymentStatus: form.paymentStatus,
      customer: {
        name: form.customerName,
        customerPhone: form.customerPhone || undefined,
        customerEmail: form.customerEmail || undefined,
        address: form.customerAddress || undefined,
      },
      items: form.items
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error('Session expired');
        await signOut({ callbackUrl: '/login' });
        return;
      }
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update invoice');
      }

      toast.success('Invoice updated successfully!');
      router.push(`/invoices/${invoiceId}`);
      router.refresh();
    } catch (error: unknown) {
      console.error('Update error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update invoice';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      <nav className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/dashboard" className="hover:text-neutral-900 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/invoices" className="hover:text-neutral-900 transition-colors">Invoices</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/invoices/${invoiceId}`} className="hover:text-neutral-900 transition-colors">{invoiceNumber}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-neutral-900">Edit</span>
      </nav>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Edit Invoice</h1>
        <p className="text-neutral-500 mt-1">Update details for {invoiceNumber}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Payment Status */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold mb-4">Payment Status</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, paymentStatus: opt.value }))}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                  form.paymentStatus === opt.value 
                    ? 'bg-primary-50 border-primary-200 text-primary-700' 
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
          <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold">Customer Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Customer Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                required
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Phone Number</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="customer@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Address</label>
              <input
                type="text"
                value={form.customerAddress}
                onChange={(e) => setForm((p) => ({ ...p, customerAddress: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="Street address, city, state"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold mb-4">Invoice Dates</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Issue Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700">Due Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold">Line Items</p>
            <span className="text-sm text-neutral-500">{form.items.length} item{form.items.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="space-y-4">
            {form.items.map((item, index) => {
              const itemTotal = Number(item.quantity) * Number(item.unitPrice);
              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-end bg-neutral-50 p-4 rounded-xl">
                  <div className="flex-1 w-full">
                    <label className="block text-xs text-neutral-500 mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs text-neutral-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs text-neutral-500 mb-1">Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-primary-400"
                    />
                  </div>
                  <div className="hidden sm:block w-28 text-right font-medium text-neutral-900">
                    {formatCurrency(itemTotal)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={form.items.length === 1}
                    className="p-3 text-neutral-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Add line item
          </button>
        </div>

        {/* Notes & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-6">
            <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold mb-4">Notes</p>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Additional notes, payment terms, etc."
              rows={5}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
            <p className="uppercase text-xs tracking-wider text-neutral-400 font-semibold mb-5">Summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Tax ({form.taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pt-4 border-t border-neutral-200 flex justify-between text-lg font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Link
            href={`/invoices/${invoiceId}`}
            className="flex-1 sm:w-auto px-6 py-3.5 border border-neutral-300 rounded-2xl font-medium text-center hover:bg-neutral-50 transition-colors text-neutral-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}