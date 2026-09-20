'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  User,
  Hash,
  Phone,
  Stethoscope,
  Download,
  Loader2,
  FileEdit,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const statusLabels = {
  pending: 'Pending',
  sample_collected: 'Sample Collected',
  result_entered: 'Result Entered',
  report_ready: 'Report Ready',
  delivered: 'Delivered',
};

const paymentStyles = {
  paid: 'bg-emerald-50 text-emerald-600',
  unpaid: 'bg-red-50 text-red-500',
  partial: 'bg-orange-50 text-orange-600',
};

const paymentLabels = { paid: 'Paid', unpaid: 'Unpaid', partial: 'Partial' };
const allPaymentStatuses = ['paid', 'unpaid', 'partial'];

const allStatuses = [
  'pending',
  'sample_collected',
  'result_entered',
  'report_ready',
  'delivered',
];

const BookingDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex items-center justify-between mb-8">
      <div className="h-8 bg-slate-200 rounded animate-pulse w-32"></div>
      <div className="h-10 bg-slate-200 rounded animate-pulse w-24"></div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Patient Details Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="h-12 bg-slate-50 rounded animate-pulse w-full"></div>
            <div className="h-12 bg-slate-50 rounded animate-pulse w-full"></div>
            <div className="h-12 bg-slate-50 rounded animate-pulse w-full"></div>
            <div className="h-12 bg-slate-50 rounded animate-pulse w-full"></div>
          </div>
        </div>
        
        {/* Tests Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-40 mb-6"></div>
          <div className="space-y-4">
            <div className="h-16 bg-slate-50 rounded animate-pulse w-full"></div>
            <div className="h-16 bg-slate-50 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Status Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-32 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-slate-50 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-slate-50 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const statusSteps = ['pending', 'sample_collected', 'result_entered', 'report_ready', 'delivered'];

function StatusTimeline({ currentStatus }) {
  const currentIdx = statusSteps.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full overflow-x-auto pb-2">
      {statusSteps.map((step, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step} className="flex items-center flex-1 min-w-0 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${isCurrent
                  ? 'border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-200/50'
                  : isCompleted
                    ? 'border-teal-400 bg-teal-400 text-white'
                    : 'border-slate-200 bg-white text-slate-300'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight max-w-[72px] ${isCurrent ? 'text-teal-600' : isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                {statusLabels[step]}
              </span>
            </div>
            {/* Connector */}
            {idx < statusSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full min-w-[16px] ${idx < currentIdx ? 'bg-teal-400' : 'bg-slate-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch {
      addToast('Failed to load booking', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const updateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      addToast('Status updated', 'success');
      fetchBooking();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const updatePayment = async (newStatus) => {
    setPaymentLoading(true);
    try {
      await api.patch(`/bookings/${id}/payment`, { paymentStatus: newStatus });
      addToast('Payment status updated', 'success');
      fetchBooking();
    } catch {
      addToast('Failed to update payment status', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMarkReportReady = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/reports/booking/${id}/mark-ready`);
      addToast('Report marked as ready', 'success');
      fetchBooking();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to mark report ready', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setActionLoading(true);
    try {
      const res = await api.get(`/reports/booking/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Refresh booking since status may have changed to delivered
      setTimeout(() => { fetchBooking(); window.URL.revokeObjectURL(url); }, 1000);
    } catch {
      addToast('Failed to generate PDF report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setActionLoading(true);
    try {
      const res = await api.get(`/bookings/${id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => { window.URL.revokeObjectURL(url); }, 1000);
    } catch {
      addToast('Failed to generate Invoice PDF', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400 font-medium mb-4">Booking not found</p>
        <button onClick={() => router.back()} className="text-sm text-teal-600 hover:text-teal-700 font-medium">← Go back</button>
      </div>
    );
  }

  const p = booking.patient || {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-400 mb-2">
        <Link href="/dashboard/bookings" className="hover:text-teal-600 transition-colors">Bookings</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-slate-800">{booking.bookingId}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/bookings')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
      >  <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-slate-800">{booking.bookingId}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${paymentStyles[booking.paymentStatus]}`}>
                {paymentLabels[booking.paymentStatus]}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Created on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Payment status dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Payment:</label>
            <select
              value={booking.paymentStatus}
              disabled={paymentLoading}
              onChange={(e) => updatePayment(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {allPaymentStatuses.map((s) => <option key={s} value={s}>{paymentLabels[s]}</option>)}
            </select>
          </div>
        </div>

        {/* Status Timeline */}
        <StatusTimeline currentStatus={booking.status} />
      </div>

      {/* Patient info + Referred By */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Name</p>
              <p className="text-sm text-slate-700 font-medium">{p.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Patient ID</p>
              <p className="text-sm text-slate-700 font-mono font-medium">{p.patientId || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone</p>
              <p className="text-sm text-slate-700 font-medium">{p.phone || '—'}</p>
            </div>
          </div>
        </div>
        {booking.referredBy && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 mt-4">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Referred By</p>
              <p className="text-sm text-slate-700 font-medium">{booking.referredBy}</p>
            </div>
          </div>
        )}
        {booking.prescriptionUrl && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 mt-4">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Prescription</p>
              <a href={booking.prescriptionUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline">
                View Document
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Tests table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tests</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100">
              <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Test Name</th>
              <th className="text-right px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {booking.tests?.map((t) => (
              <tr key={t._id}>
                <td className="px-6 py-3 text-slate-700 font-medium">{t.testName}</td>
                <td className="px-6 py-3 text-right text-slate-600">₹{t.price?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-teal-50/50 border-t border-teal-100">
              <td className="px-6 py-3 text-sm font-semibold text-teal-700">Total Amount</td>
              <td className="px-6 py-3 text-right text-lg font-bold text-teal-700">₹{booking.totalAmount?.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action buttons based on status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Actions</h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm disabled:opacity-60 transition-all"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Download Invoice
          </button>

          {booking.status === 'pending' && (
            <button
              onClick={() => updateStatus('sample_collected')}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm disabled:opacity-60 transition-all"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Mark Sample Collected
            </button>
          )}

        {booking.status === 'sample_collected' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Waiting for lab results to be entered.</p>
            <button
              onClick={() => router.push(`/dashboard/bookings/${id}/results`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-sm transition-all"
            >
              <FileEdit className="w-4 h-4" />
              Enter Results
            </button>
          </div>
        )}

        {booking.status === 'result_entered' && (
          <button
            onClick={handleMarkReportReady}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-sm disabled:opacity-60 transition-all"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Mark Report Ready
          </button>
        )}

        {(booking.status === 'report_ready' || booking.status === 'delivered') && (
          <button
            onClick={handleDownloadPDF}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 transition-all"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            View / Download PDF Report
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
