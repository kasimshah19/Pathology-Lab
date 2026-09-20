'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityLogPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
      });

      if (actionFilter) params.append('action', actionFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/activity-logs?${params}`);
      
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
        setTotalCount(response.data.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect non-admins
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchLogs();
    }
  }, [user, page, actionFilter, startDate, endDate]);

  const getActionBadgeColor = (action) => {
    if (action.includes('CREATE') || action.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('MARK_REPORT_READY') || action.includes('ENTER_RESULTS') || action.includes('CHANGE_PASSWORD')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('DELETE') || action.includes('DEACTIVATE')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const handleResetFilters = () => {
    setActionFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-1">Track system events and staff actions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Action Type</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE_PATIENT">Create Patient</option>
              <option value="UPDATE_PATIENT">Update Patient</option>
              <option value="DELETE_PATIENT">Delete Patient</option>
              <option value="CREATE_BOOKING">Create Booking</option>
              <option value="UPDATE_BOOKING_STATUS">Update Booking Status</option>
              <option value="UPDATE_PAYMENT_STATUS">Update Payment Status</option>
              <option value="DELETE_BOOKING">Delete Booking</option>
              <option value="ENTER_RESULTS">Enter Results</option>
              <option value="MARK_REPORT_READY">Mark Report Ready</option>
              <option value="CREATE_TEST">Create Test</option>
              <option value="UPDATE_TEST">Update Test</option>
              <option value="DEACTIVATE_TEST">Deactivate Test</option>
            </select>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        <div>
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap h-[38px]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100"></div>
                        <div>
                          <div className="h-3 bg-slate-100 rounded w-20 mb-1"></div>
                          <div className="h-2 bg-slate-100 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <History className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm font-medium">No activity logs found</p>
                      <p className="text-xs mt-1 text-slate-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-700">
                        {format(new Date(log.createdAt), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(log.createdAt), 'hh:mm a')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          {log.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{log.userName}</p>
                          <p className="text-[10px] uppercase font-semibold text-teal-600">{log.userRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{log.description}</p>
                      {log.targetType && (
                        <p className="text-xs text-slate-400 mt-0.5">Target: {log.targetType} ({log.targetId})</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * 15 + 1}</span> to{' '}
              <span className="font-medium text-slate-700">{Math.min(page * 15, totalCount)}</span> of{' '}
              <span className="font-medium text-slate-700">{totalCount}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-slate-700 min-w-[3rem] text-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
