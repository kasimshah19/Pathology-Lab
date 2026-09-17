'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

const initialForm = { name: '', age: '', gender: '', phone: '', email: '', address: '' };

export default function PatientFormModal({ open, onClose, onSuccess, existingPatient }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!existingPatient;

  // Populate form when editing
  useEffect(() => {
    if (existingPatient) {
      setForm({
        name: existingPatient.name || '',
        age: existingPatient.age?.toString() || '',
        gender: existingPatient.gender || '',
        phone: existingPatient.phone || '',
        email: existingPatient.email || '',
        address: existingPatient.address || '',
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setApiError('');
  }, [existingPatient, open]);

  // Handle Escape key
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
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.age) e.age = 'Age is required';
    else if (isNaN(form.age) || +form.age < 0 || +form.age > 150) e.age = 'Age must be 0–150';
    if (!form.gender) e.gender = 'Gender is required';
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit phone number';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      const payload = { ...form, age: Number(form.age) };
      if (isEdit) {
        await api.put(`/patients/${existingPatient._id}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      onSuccess?.(isEdit ? 'Patient updated successfully' : 'Patient added successfully');
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input autoFocus type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter patient name" className={fieldClass('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Age <span className="text-red-400">*</span></label>
              <input type="number" min="0" max="150" value={form.age} onChange={(e) => handleChange('age', e.target.value)} placeholder="e.g. 35" className={fieldClass('age')} />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Gender <span className="text-red-400">*</span></label>
              <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className={fieldClass('gender')}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="10-digit number" className={fieldClass('phone')} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
            <input type="text" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="patient@email.com" className={fieldClass('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Address</label>
            <textarea rows={2} value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Street, city, zip…" className={fieldClass('address') + ' resize-none'} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
