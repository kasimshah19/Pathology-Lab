'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import TestFormModal from '@/components/TestFormModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Pencil,
  Power,
  FlaskConical,
  Droplets,
  TestTube2,
  CircleDot,
  Loader2,
} from 'lucide-react';

// Category tag color map
const categoryColors = {
  blood: 'bg-red-50 text-red-600 border-red-100',
  urine: 'bg-amber-50 text-amber-600 border-amber-100',
  hormone: 'bg-purple-50 text-purple-600 border-purple-100',
  'lipid profile': 'bg-orange-50 text-orange-600 border-orange-100',
  'liver function': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'kidney function': 'bg-sky-50 text-sky-600 border-sky-100',
  thyroid: 'bg-violet-50 text-violet-600 border-violet-100',
};

const getCategoryColor = (category) => {
  if (!category) return 'bg-slate-50 text-slate-500 border-slate-100';
  return categoryColors[category.toLowerCase()] || 'bg-slate-50 text-slate-500 border-slate-100';
};

// Sample type icons
const sampleIcons = {
  blood: Droplets,
  urine: TestTube2,
  stool: CircleDot,
  other: FlaskConical,
};

export default function TestsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchTests = useCallback(async (searchVal, includeInactive) => {
    setLoading(true);
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (includeInactive) params.includeInactive = true;
      const res = await api.get('/tests', { params });
      setTests(res.data.data);
    } catch {
      addToast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests(search, showInactive);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, showInactive, fetchTests]);

  // Derive unique categories from fetched data
  const categories = useMemo(() => {
    const cats = new Set();
    tests.forEach((t) => { if (t.category) cats.add(t.category); });
    return Array.from(cats).sort();
  }, [tests]);

  // Filtered tests (client-side category filter on already-fetched data)
  const filteredTests = useMemo(() => {
    if (!categoryFilter) return tests;
    return tests.filter((t) => t.category === categoryFilter);
  }, [tests, categoryFilter]);

  const handleAddClick = () => {
    setEditingTest(null);
    setModalOpen(true);
  };

  const handleEditClick = (test) => {
    setEditingTest(test);
    setModalOpen(true);
  };

  const handleDeactivateClick = (id) => {
    setDeactivatingId(id);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await api.delete(`/tests/${deactivatingId}`);
      addToast('Test deactivated successfully', 'success');
      setConfirmOpen(false);
      setDeactivatingId(null);
      fetchTests(search, showInactive);
    } catch {
      addToast('Failed to deactivate test', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleFormSuccess = (message) => {
    addToast(message, 'success');
    fetchTests(search, showInactive);
  };

  // Skeleton card
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded-md w-1/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-14" />
      </div>
      <div className="h-7 bg-slate-100 rounded-md w-20" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Test Catalog</h2>
          <p className="text-sm text-slate-400 mt-0.5">{filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Test
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests…"
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 shadow-sm transition-all duration-200 min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Show inactive toggle (admin only) */}
        {isAdmin && (
          <label className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-teal-500 focus:ring-teal-500/20 w-4 h-4"
            />
            Show inactive
          </label>
        )}
      </div>

      {/* Test Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5">
            <FlaskConical className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-slate-600 font-semibold mb-1 text-base">{search || categoryFilter ? 'No tests found' : 'No tests yet'}</p>
          <p className="text-slate-400 text-sm mb-6 max-w-sm text-center">
            {search || categoryFilter ? 'Try adjusting your filters to find what you are looking for.' : 'Get started by registering your first test to the catalog.'}
          </p>
          {search || categoryFilter ? (
            <button
              onClick={() => { setSearch(''); setCategoryFilter(''); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Clear filters
            </button>
          ) : (
            isAdmin && (
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first test
              </button>
            )
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const SampleIcon = sampleIcons[test.sampleType] || FlaskConical;
            const inactive = !test.isActive;

            return (
              <div
                key={test._id}
                className={`
                  bg-white rounded-2xl border shadow-sm p-5 group transition-all duration-200
                  ${inactive
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-100 hover:shadow-md hover:border-slate-200/80'
                  }
                `}
              >
                {/* Top row: name + admin actions */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug">{test.testName}</h3>
                  {isAdmin && (
                    <div className="flex items-center gap-0.5 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(test)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {test.isActive && (
                        <button
                          onClick={() => handleDeactivateClick(test._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Deactivate"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Test code */}
                <p className="text-xs text-slate-400 font-mono mb-3">{test.testCode || '—'}</p>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {test.category && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryColor(test.category)}`}>
                      {test.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-400 border border-slate-100 capitalize">
                    <SampleIcon className="w-3 h-3" />
                    {test.sampleType || 'Other'}
                  </span>
                  {inactive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Price + range row */}
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold text-slate-800 tracking-tight">
                    ₹{test.price?.toLocaleString('en-IN')}
                  </p>
                  {(test.normalRange || test.unit) && (
                    <p className="text-xs text-slate-300 text-right leading-tight">
                      {test.normalRange && <span>{test.normalRange}</span>}
                      {test.normalRange && test.unit && <span> </span>}
                      {test.unit && <span className="text-slate-400">{test.unit}</span>}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleFormSuccess}
        existingTest={editingTest}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate Test"
        message="This will deactivate the test. It will no longer be available for new bookings, but historical records remain intact."
        confirmLabel="Deactivate"
        isLoading={isDeactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => { setConfirmOpen(false); setDeactivatingId(null); }}
      />
    </div>
  );
}
