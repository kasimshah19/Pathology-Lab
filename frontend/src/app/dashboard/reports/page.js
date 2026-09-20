'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';
import {
  Search,
  Download,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusStyles = {
  report_ready: 'bg-purple-50 text-purple-600',
  delivered: 'bg-emerald-50 text-emerald-600',
};

const statusLabels = {
  report_ready: 'Ready',
  delivered: 'Delivered',
};

export default function ReportsPage() {
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const limit = 20;

  const fetchReports = useCallback(async (searchVal, pageVal) => {
    setLoading(true);
    try {
      // Fetch report_ready and delivered bookings in parallel
      const [readyRes, deliveredRes] = await Promise.all([
        api.get('/bookings', { params: { status: 'report_ready', search: searchVal, page: pageVal, limit } }),
        api.get('/bookings', { params: { status: 'delivered', search: searchVal, page: pageVal, limit } }),
      ]);

      const readyBookings = readyRes.data.data.bookings || [];
      const deliveredBookings = deliveredRes.data.data.bookings || [];

      // Combine and sort by createdAt descending
      const combined = [...readyBookings, ...deliveredBookings].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // De-duplicate (in case of overlap)
      const seen = new Set();
      const unique = combined.filter((b) => {
        if (seen.has(b._id)) return false;
        seen.add(b._id);
        return true;
      });

      setBookings(unique);
      setTotal(readyRes.data.data.total + deliveredRes.data.data.total);
      setTotalPages(Math.max(readyRes.data.data.pages || 1, deliveredRes.data.data.pages || 1));
    } catch {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReports(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchReports]);

  useEffect(() => {
    fetchReports(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDownloadPDF = async (booking) => {
    setDownloadingId(booking._id);
    try {
      const res = await api.get(`/reports/booking/${booking._id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        fetchReports(search, page); // Refresh in case status changed to delivered
      }, 1000);
    } catch {
      addToast('Failed to generate PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

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
      if (field === 'patientName' && a.patient?.name && b.patient?.name) {
        const aVal = a.patient.name.toLowerCase();
        const bVal = b.patient.name.toLowerCase();
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    }
    const aVal = a[sortField].toString().toLowerCase();
    const bVal = b[sortField].toString().toLowerCase();
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    addToast(`Copied ${id} to clipboard`, 'success');
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-slate-300 lg:opacity-0 lg:group-hover:opacity-100 ml-1">↕</span>;
    return <span className="text-teal-500 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded-md w-3/4" /></td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reports</h2>
        <p className="text-sm text-slate-400 mt-0.5">{total} report{total !== 1 ? 's' : ''} available</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or booking ID…"
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200"
        />
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
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('patientName')}>
                  Patient <SortIcon field="patientName" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('createdAt')}>
                  Date <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Tests</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : sortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
                        <FileText className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-slate-600 font-semibold mb-1 text-base">{search ? 'No reports found' : 'No reports ready yet'}</p>
                      <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">
                        {search ? `We couldn't find any reports matching "${search}".` : 'Reports will appear here once bookings reach "Report Ready" status'}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedBookings.map((b) => (
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
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{b.patient?.name}</p>
                      <p className="text-xs text-slate-400">{b.patient?.patientId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600 font-medium">{b.tests?.length || 0} test{(b.tests?.length || 0) !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${statusStyles[b.status] || 'bg-slate-100 text-slate-500'}`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDownloadPDF(b)}
                          disabled={downloadingId === b._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg disabled:opacity-60 transition-colors"
                        >
                          {downloadingId === b._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}
