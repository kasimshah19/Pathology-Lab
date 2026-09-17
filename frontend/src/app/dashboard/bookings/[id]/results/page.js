'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FlaskConical,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

function ResultsEntrySkeleton() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div className="h-5 w-32 bg-slate-200 rounded"></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded"></div>
            <div className="h-4 w-32 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsEntryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({}); // keyed by test._id
  const [saving, setSaving] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [bookingRes, reportsRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/reports/booking/${id}`).catch(() => ({ data: { data: [] } })),
      ]);

      const bookingData = bookingRes.data.data;
      setBooking(bookingData);

      // Build results map, pre-fill from existing reports
      const existingReports = reportsRes.data.data || [];
      const resultsMap = {};
      for (const test of bookingData.tests || []) {
        const existing = existingReports.find(
          (r) => (r.test?._id || r.test) === test._id
        );
        resultsMap[test._id] = {
          resultValue: existing?.resultValue || '',
          remarks: existing?.remarks || '',
        };
      }
      setResults(resultsMap);

      // If results already exist, show the mark-ready button
      if (existingReports.length > 0) setSaved(true);
    } catch {
      addToast('Failed to load booking data', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (testId, field, value) => {
    setResults((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], [field]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Validate at least one result filled
    const entries = Object.entries(results);
    const filled = entries.filter(([, v]) => v.resultValue.trim());
    if (filled.length === 0) {
      setApiError('Please enter at least one test result');
      return;
    }

    setSaving(true);
    setApiError('');
    try {
      const payload = {
        booking: id,
        results: entries
          .filter(([, v]) => v.resultValue.trim())
          .map(([testId, v]) => ({
            test: testId,
            resultValue: v.resultValue.trim(),
            remarks: v.remarks.trim(),
          })),
      };
      await api.post('/reports', payload);
      addToast('Results saved successfully', 'success');
      setSaved(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReady = async () => {
    setMarkingReady(true);
    setApiError('');
    try {
      await api.patch(`/reports/booking/${id}/mark-ready`);
      addToast('Report marked as ready!', 'success');
      router.push(`/dashboard/bookings/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark report ready';
      const pending = err.response?.data?.pendingTests;
      setApiError(pending ? `${msg}: ${pending.join(', ')}` : msg);
    } finally {
      setMarkingReady(false);
    }
  };

  if (loading) {
    return <ResultsEntrySkeleton />;
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400 font-medium mb-4">Booking not found</p>
        <button onClick={() => router.back()} className="text-sm text-teal-600 hover:text-teal-700 font-medium">← Go back</button>
      </div>
    );
  }

  const patient = booking.patient || {};

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-400 mb-2">
        <Link href="/dashboard/bookings" className="hover:text-teal-600 transition-colors">Bookings</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href={`/dashboard/bookings/${id}`} className="hover:text-teal-600 transition-colors">{booking.bookingId}</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-slate-800">Enter Results</span>
      </nav>

      {/* Back */}
      <button
        onClick={() => router.push(`/dashboard/bookings/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Booking
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-200/30 shrink-0">
            <FlaskConical className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Enter Test Results</h2>
            <p className="text-sm text-slate-400">
              <span className="font-medium text-slate-600">{patient.name}</span>
              <span className="mx-1.5">•</span>
              <span className="font-mono">{booking.bookingId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {apiError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Test result forms */}
      <div className="space-y-4">
        {booking.tests?.map((test, idx) => {
          const val = results[test._id] || { resultValue: '', remarks: '' };
          return (
            <div key={test._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    <span className="text-slate-300 mr-2">{idx + 1}.</span>
                    {test.testName}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {test.normalRange && (
                      <span className="text-xs text-slate-400">
                        Normal Range: <span className="font-medium text-slate-500">{test.normalRange}</span>
                      </span>
                    )}
                    {test.unit && (
                      <span className="text-xs text-slate-400">
                        Unit: <span className="font-medium text-slate-500">{test.unit}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Result Value <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={val.resultValue}
                    onChange={(e) => handleChange(test._id, 'resultValue', e.target.value)}
                    placeholder={test.normalRange ? `e.g. ${test.normalRange.split('-')[0]?.trim() || ''}` : 'Enter result'}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={val.remarks}
                    onChange={(e) => handleChange(test._id, 'remarks', e.target.value)}
                    placeholder="Optional notes"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <><Save className="w-4 h-4" /> Save Results</>
          )}
        </button>

        {saved && (
          <button
            onClick={handleMarkReady}
            disabled={markingReady}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl shadow-sm shadow-purple-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {markingReady ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Marking…</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Mark Report as Ready</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
