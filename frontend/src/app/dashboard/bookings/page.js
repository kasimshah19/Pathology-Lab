'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import NewBookingModal from '@/components/NewBookingModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check,
  Download,
} from 'lucide-react';

// Status badge colors
const statusStyles = {
  pending: 'bg-slate-100 text-slate-500',
  sample_collected: 'bg-blue-50 text-blue-600',
  result_entered: 'bg-amber-50 text-amber-600',
  report_ready: 'bg-purple-50 text-purple-600',
  delivered: 'bg-emerald-50 text-emerald-600',
};

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

const paymentLabels = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  partial: 'Partial',
};

const allStatuses = ['pending', 'sample_collected', 'result_entered', 'report_ready', 'delivered'];
const allPaymentStatuses = ['paid', 'unpaid', 'partial'];

// Small inline dropdown for quick status change
function StatusDropdown({ current, options, labels, styles, onSelect, isLoading }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { 
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false); 
    };
    const scrollHandler = () => setOpen(false);
    
    if (open) {
      document.addEventListener('mousedown', handler);
      window.addEventListener('scroll', scrollHandler, true);
      window.addEventListener('resize', scrollHandler);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', scrollHandler, true);
      window.removeEventListener('resize', scrollHandler);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent ${styles[current]} hover:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {labels[current]}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div 
          ref={menuRef}
          className="fixed bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[9999] py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200"
          style={{ top: coords.top, left: coords.left, transform: 'translateX(-100%)' }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${opt === current ? 'text-teal-700 bg-teal-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {labels[opt]}
              {opt === current && <Check className="w-3.5 h-3.5 text-teal-600" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchBookings = useCallback(async (searchVal, pageVal, status, payment) => {
    setLoading(true);
    try {
      const params = { page: pageVal, limit };
      if (searchVal) params.search = searchVal;
      if (status) params.status = status;
      if (payment) params.paymentStatus = payment;
      const res = await api.get('/bookings', { params });
      setBookings(res.data.data.bookings || []);
      setTotalPages(res.data.data.pages || 1);
      setTotal(res.data.data.total || 0);
    } catch {
      addToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBookings(search, 1, statusFilter, paymentFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, paymentFilter, fetchBookings]);

  useEffect(() => {
    fetchBookings(search, page, statusFilter, paymentFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      addToast('Status updated', 'success');
      fetchBookings(search, page, statusFilter, paymentFilter);
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId + '-payment');
    try {
      await api.patch(`/bookings/${bookingId}/payment`, { paymentStatus: newStatus });
      addToast('Payment status updated', 'success');
      fetchBookings(search, page, statusFilter, paymentFilter);
    } catch {
      addToast('Failed to update payment status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/bookings/${deletingId}`);
      addToast('Booking deleted', 'success');
      setConfirmOpen(false);
      setDeletingId(null);
      fetchBookings(search, page, statusFilter, paymentFilter);
    } catch {
      addToast('Failed to delete booking', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewSuccess = (msg) => {
    addToast(msg, 'success');
    fetchBookings(search, 1, statusFilter, paymentFilter);
    setPage(1);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    addToast('Generating CSV...', 'success');
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const response = await api.get('/bookings/export/csv', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `bookings-export-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addToast('Export successful', 'success');
    } catch (error) {
      addToast('Failed to export CSV', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded-md w-3/4" /></td>
      ))}
    </tr>
  );

  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) {
      // Handle nested fields like patient.name
      if (sortField === 'patientName' && a.patient?.name && b.patient?.name) {
        const aVal = a.patient.name.toLowerCase();
        const bVal = b.patient.name.toLowerCase();
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    }
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    addToast(`Copied ${id} to clipboard`, 'success');
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-slate-300 opacity-0 group-hover:opacity-100 ml-1">↕</span>;
    return <span className="text-teal-500 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const selectClass = "px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bookings</h2>
          <p className="text-sm text-slate-400 mt-0.5">{total} booking{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or booking ID…"
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">All Statuses</option>
          {allStatuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className={selectClass}>
          <option value="">All Payments</option>
          {allPaymentStatuses.map((s) => <option key={s} value={s}>{paymentLabels[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('bookingId')}>
                  Booking ID <SortIcon field="bookingId" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors hidden sm:table-cell" onClick={() => handleSort('createdAt')}>
                  Date <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('patientName')}>
                  Patient <SortIcon field="patientName" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Tests</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('totalAmount')}>
                  Amount <SortIcon field="totalAmount" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('paymentStatus')}>
                  Payment <SortIcon field="paymentStatus" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
                        <ClipboardList className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-slate-600 font-semibold mb-1 text-base">{search || statusFilter || paymentFilter ? 'No bookings found' : 'No bookings yet'}</p>
                      <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">
                        {search || statusFilter || paymentFilter ? 'Try adjusting your filters to find what you are looking for.' : 'Get started by creating your first booking.'}
                      </p>
                      {search || statusFilter || paymentFilter ? (
                        <button
                          onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter(''); }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Clear filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setModalOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          New Booking
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedBookings.map((b) => {
                  const testNames = b.tests?.map((t) => t.testName) || [];
                  const displayTests = testNames.slice(0, 2);
                  const extraCount = testNames.length - 2;

                  return (
                    <tr key={b._id} className="hover:bg-slate-50 transition-colors group cursor-default">
                      <td className="px-4 py-3.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyId(b.bookingId); }}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-mono font-medium hover:bg-teal-50 hover:text-teal-600 transition-colors"
                          title="Click to copy ID"
                        >
                          {b.bookingId}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">
                        {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-800">{b.patient?.name}</p>
                        <p className="text-xs text-slate-400">{b.patient?.patientId}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {displayTests.map((name, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-100">
                              {name}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 text-[11px] font-semibold">
                              +{extraCount} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="font-medium text-slate-700">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusDropdown
                          current={b.status}
                          options={allStatuses}
                          labels={statusLabels}
                          styles={statusStyles}
                          onSelect={(s) => handleStatusChange(b._id, s)}
                          isLoading={updatingId === b._id}
                        />
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <StatusDropdown
                          current={b.paymentStatus}
                          options={allPaymentStatuses}
                          labels={paymentLabels}
                          styles={paymentStyles}
                          onSelect={(s) => handlePaymentChange(b._id, s)}
                          isLoading={updatingId === b._id + '-payment'}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/bookings/${b._id}`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all opacity-0 group-hover:opacity-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => { setDeletingId(b._id); setConfirmOpen(true); }}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewBookingModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleNewSuccess} />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Booking"
        message="Are you sure you want to delete this booking? This will also remove associated reports. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </div>
  );
}
