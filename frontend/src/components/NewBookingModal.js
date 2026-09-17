'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2, AlertCircle, Search, Plus, User, ChevronRight, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import PatientFormModal from '@/components/PatientFormModal';

export default function NewBookingModal({ open, onClose, onSuccess }) {
  // Step state
  const [step, setStep] = useState(1);

  // Patient selection
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);

  // Test selection
  const [testSearch, setTestSearch] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchingTests, setSearchingTests] = useState(false);
  const [showTestDropdown, setShowTestDropdown] = useState(false);

  // Other
  const [referredBy, setReferredBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const patientRef = useRef(null);
  const testRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setPatientSearch('');
      setPatientResults([]);
      setSelectedPatient(null);
      setTestSearch('');
      setTestResults([]);
      setSelectedTests([]);
      setReferredBy('');
      setApiError('');
    }
  }, [open]);

  // Patient search (debounced)
  useEffect(() => {
    if (!patientSearch.trim()) { setPatientResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchingPatients(true);
      try {
        const res = await api.get('/patients', { params: { search: patientSearch, limit: 8 } });
        setPatientResults(res.data.data.patients || []);
      } catch { /* ignore */ }
      setSearchingPatients(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Test search (debounced)
  useEffect(() => {
    if (!testSearch.trim()) { setTestResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchingTests(true);
      try {
        const res = await api.get('/tests', { params: { search: testSearch } });
        const alreadyIds = selectedTests.map((t) => t._id);
        setTestResults((res.data.data || []).filter((t) => t.isActive && !alreadyIds.includes(t._id)));
      } catch { /* ignore */ }
      setSearchingTests(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [testSearch, selectedTests]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (patientRef.current && !patientRef.current.contains(e.target)) setShowPatientDropdown(false);
      if (testRef.current && !testRef.current.contains(e.target)) setShowTestDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setPatientSearch('');
    setShowPatientDropdown(false);
    setPatientResults([]);
  };

  const addTest = (t) => {
    setSelectedTests((prev) => [...prev, t]);
    setTestSearch('');
    setShowTestDropdown(false);
    setTestResults([]);
  };

  const removeTest = (id) => {
    setSelectedTests((prev) => prev.filter((t) => t._id !== id));
  };

  const totalAmount = selectedTests.reduce((sum, t) => sum + (t.price || 0), 0);

  const handleSubmit = async () => {
    if (!selectedPatient || selectedTests.length === 0) return;
    setSubmitting(true);
    setApiError('');
    try {
      await api.post('/bookings', {
        patient: selectedPatient._id,
        tests: selectedTests.map((t) => t._id),
        referredBy: referredBy.trim() || undefined,
      });
      onSuccess?.('Booking created successfully');
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPatientSuccess = (message) => {
    setPatientModalOpen(false);
    // Re-trigger a search so user can find the new patient
    setPatientSearch('');
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !patientModalOpen) onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose, patientModalOpen]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-modal-in">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-lg font-semibold text-slate-800">New Booking</h2>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {apiError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex gap-2">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => { if (s === 1 || selectedPatient) setStep(s); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    step === s
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-sm'
                      : s < step
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-slate-50 text-slate-300'
                  }`}
                >
                  {s === 1 ? '1. Select Patient' : '2. Select Tests'}
                </button>
              ))}
            </div>

            {/* Step 1 — Patient */}
            {step === 1 && (
              <div className="space-y-4">
                {selectedPatient ? (
                  <div className="flex items-center gap-3 bg-teal-50/60 border border-teal-100 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {selectedPatient.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{selectedPatient.name}</p>
                      <p className="text-xs text-slate-400">{selectedPatient.patientId}{selectedPatient.phone ? ` • ${selectedPatient.phone}` : ''}</p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-slate-300 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div ref={patientRef} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
                    <input
                      autoFocus
                      type="text"
                      value={patientSearch}
                      onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}
                      onFocus={() => setShowPatientDropdown(true)}
                      placeholder="Search patient by name or phone…"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                    />

                    {showPatientDropdown && (patientSearch.trim() || searchingPatients) && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                        {searchingPatients ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                          </div>
                        ) : patientResults.length > 0 ? (
                          patientResults.map((p) => (
                            <button
                              key={p._id}
                              onClick={() => selectPatient(p)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                            >
                              <User className="w-4 h-4 text-slate-300 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                                <p className="text-xs text-slate-400">{p.patientId}{p.phone ? ` • ${p.phone}` : ''}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-slate-300 text-center py-4">No patients found</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setPatientModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Register new patient
                </button>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedPatient}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Tests + Submit */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Selected patient summary */}
                {selectedPatient && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-medium text-slate-700">{selectedPatient.name}</span>
                    <span className="text-slate-300">•</span>
                    <span>{selectedPatient.patientId}</span>
                  </div>
                )}

                {/* Test search */}
                <div ref={testRef} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-300" />
                  <input
                    type="text"
                    value={testSearch}
                    onChange={(e) => { setTestSearch(e.target.value); setShowTestDropdown(true); }}
                    onFocus={() => setShowTestDropdown(true)}
                    placeholder="Search and add tests…"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  />

                  {showTestDropdown && (testSearch.trim() || searchingTests) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                      {searchingTests ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                        </div>
                      ) : testResults.length > 0 ? (
                        testResults.map((t) => (
                          <button
                            key={t._id}
                            onClick={() => addTest(t)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-700">{t.testName}</p>
                              <p className="text-xs text-slate-400">{t.testCode}</p>
                            </div>
                            <span className="text-sm font-semibold text-slate-600">₹{t.price}</span>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-slate-300 text-center py-4">No tests found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected tests chips + list */}
                {selectedTests.length > 0 && (
                  <div className="space-y-2">
                    {selectedTests.map((t) => (
                      <div key={t._id} className="flex items-center justify-between bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t.testName}</p>
                          <p className="text-xs text-slate-400">{t.testCode}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-600">₹{t.price}</span>
                          <button onClick={() => removeTest(t._id)} className="text-slate-300 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-teal-50/60 border border-teal-100 rounded-xl">
                      <span className="text-sm font-semibold text-teal-700">Total Amount</span>
                      <span className="text-lg font-bold text-teal-700">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Referred By */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Referred By (optional)</label>
                  <input
                    type="text"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    placeholder="Doctor name or hospital"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || selectedTests.length === 0}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested PatientFormModal for quick patient registration */}
      <PatientFormModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSuccess={handleNewPatientSuccess}
      />
    </>
  );
}
