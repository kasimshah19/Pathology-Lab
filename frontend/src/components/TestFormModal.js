'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const initialForm = {
  testName: '',
  testCode: '',
  category: '',
  price: '',
  normalRange: '',
  unit: '',
  sampleType: '',
};

const suggestedCategories = [
  'Blood',
  'Urine',
  'Hormone',
  'Lipid Profile',
  'Liver Function',
  'Kidney Function',
  'Thyroid',
  'Other',
];

export default function TestFormModal({ open, onClose, onSuccess, existingTest }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!existingTest;

  useEffect(() => {
    if (existingTest) {
      setForm({
        testName: existingTest.testName || '',
        testCode: existingTest.testCode || '',
        category: existingTest.category || '',
        price: existingTest.price?.toString() || '',
        normalRange: existingTest.normalRange || '',
        unit: existingTest.unit || '',
        sampleType: existingTest.sampleType || '',
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setApiError('');
  }, [existingTest, open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.testName.trim()) e.testName = 'Test name is required';
    if (!form.testCode.trim()) e.testCode = 'Test code is required';
    if (!form.price) e.price = 'Price is required';
    else if (isNaN(form.price) || +form.price < 0) e.price = 'Price must be a positive number';
    if (!form.sampleType) e.sampleType = 'Sample type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    if (field === 'testCode') value = value.toUpperCase();
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (isEdit) {
        await api.put(`/tests/${existingTest._id}`, payload);
      } else {
        await api.post('/tests', payload);
      }
      onSuccess?.(isEdit ? 'Test updated successfully' : 'Test added successfully');
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (field) =>
    `w-full px-3.5 py-2.5 bg-slate-50/80 border rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200 ${errors[field] ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200'}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Test' : 'Add New Test'}
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Test Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Test Name <span className="text-red-400">*</span></label>
            <input autoFocus type="text" value={form.testName} onChange={(e) => handleChange('testName', e.target.value)} placeholder="e.g. Complete Blood Count" className={fieldClass('testName')} />
            {errors.testName && <p className="text-xs text-red-500 mt-1">{errors.testName}</p>}
          </div>

          {/* Test Code & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Test Code <span className="text-red-400">*</span></label>
              <input type="text" value={form.testCode} onChange={(e) => handleChange('testCode', e.target.value)} placeholder="e.g. CBC" className={fieldClass('testCode') + ' uppercase'} />
              {errors.testCode && <p className="text-xs text-red-500 mt-1">{errors.testCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Category</label>
              <input type="text" list="category-suggestions" value={form.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="e.g. Blood" className={fieldClass('category')} />
              <datalist id="category-suggestions">
                {suggestedCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Price & Sample Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Price (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="0" step="any" value={form.price} onChange={(e) => handleChange('price', e.target.value)} placeholder="e.g. 350" className={fieldClass('price')} />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Sample Type <span className="text-red-400">*</span></label>
              <select value={form.sampleType} onChange={(e) => handleChange('sampleType', e.target.value)} className={fieldClass('sampleType')}>
                <option value="">Select</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="stool">Stool</option>
                <option value="other">Other</option>
              </select>
              {errors.sampleType && <p className="text-xs text-red-500 mt-1">{errors.sampleType}</p>}
            </div>
          </div>

          {/* Normal Range & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Normal Range</label>
              <input type="text" value={form.normalRange} onChange={(e) => handleChange('normalRange', e.target.value)} placeholder="e.g. 4.5-11.0" className={fieldClass('normalRange')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Unit</label>
              <input type="text" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} placeholder="e.g. mg/dL" className={fieldClass('unit')} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Test' : 'Add Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
