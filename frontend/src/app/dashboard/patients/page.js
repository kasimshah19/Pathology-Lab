'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import PatientFormModal from '@/components/PatientFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  Download,
} from 'lucide-react';

export default function PatientsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isAdmin = user?.role === 'admin';

  const fetchPatients = useCallback(async (searchVal, pageVal) => {
    setLoading(true);
    try {
      const res = await api.get('/patients', {
        params: { search: searchVal, page: pageVal, limit },
      });
      setPatients(res.data.data.patients);
      setTotalPages(res.data.data.totalPages || 1);
      setTotal(res.data.data.totalCount || 0);
    } catch {
      addToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPatients(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  // Page changes
  useEffect(() => {
    fetchPatients(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAddClick = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/patients/${deletingId}`);
      addToast('Patient deleted successfully', 'success');
      setConfirmOpen(false);
      setDeletingId(null);
      fetchPatients(search, page);
    } catch {
      addToast('Failed to delete patient', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = (message) => {
    addToast(message, 'success');
    fetchPatients(search, page);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    addToast('Generating CSV...', 'success');
    try {
      const params = {};
      if (search) params.search = search;

      const response = await api.get('/patients/export/csv', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `patients-export-${dateStr}.csv`);
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

  // Skeleton rows
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-100 rounded-md w-3/4" />
        </td>
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

  const sortedPatients = [...patients].sort((a, b) => {
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
    if (sortField !== field) return <span className="text-slate-300 lg:opacity-0 lg:group-hover:opacity-100 ml-1">↕</span>;
    return <span className="text-teal-500 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Patients</h2>
          <p className="text-sm text-slate-400 mt-0.5">{total} patient{total !== 1 ? 's' : ''} registered</p>
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
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100">
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('patientId')}>
                  Patient ID <SortIcon field="patientId" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  Name <SortIcon field="name" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleSort('age')}>
                  Age <SortIcon field="age" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">Gender</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider cursor-pointer group hover:bg-slate-100 transition-colors hidden sm:table-cell" onClick={() => handleSort('createdAt')}>
                  Registered On <SortIcon field="createdAt" />
                </th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : sortedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
                        <Users className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-slate-600 font-semibold mb-1 text-base">{search ? 'No patients found' : 'No patients yet'}</p>
                      <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">
                        {search ? `We couldn't find any patients matching "${search}".` : 'Get started by registering your first patient to the system.'}
                      </p>
                      {search ? (
                        <button
                          onClick={() => setSearch('')}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Clear search
                        </button>
                      ) : (
                        <button
                          onClick={handleAddClick}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add your first patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors group cursor-default">
                    <td className="px-4 py-3.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopyId(p.patientId); }}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-mono font-medium hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        title="Click to copy ID"
                      >
                        {p.patientId}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-slate-500">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/patients/${p._id}`)}
                          className="text-slate-800 font-medium hover:text-teal-600 transition-colors text-left"
                        >
                          {p.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">{p.age}</td>
                    <td className="px-4 py-3.5 text-slate-500 capitalize hidden sm:table-cell">{p.gender}</td>
                    <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">{p.phone || '-'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                          title="Edit patient"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(p._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                            title="Delete patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
            <p className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleFormSuccess}
        existingPatient={editingPatient}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
      />
    </div>
  );
}
