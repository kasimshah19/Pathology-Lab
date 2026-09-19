'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'receptionist',
};

export default function StaffFormModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      setApiError('');
      setShowPassword(false);
    }
  }, [open]);

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
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.role) e.role = 'Role is required';
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
      await api.post('/auth/register', form);
      onSuccess?.('Staff member registered successfully');
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to register staff');
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-slate-800">Add Staff Member</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input autoFocus type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Jane Doe" className={fieldClass('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="name@lab.com" className={fieldClass('email')} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone (optional)</label>
              <input type="text" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="10-digit number" className={fieldClass('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Role <span className="text-red-400">*</span></label>
              <select value={form.role} onChange={(e) => handleChange('role', e.target.value)} className={fieldClass('role')}>
                <option value="receptionist">Receptionist</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Temporary Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Minimum 6 chars" className={`${fieldClass('password')} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm shadow-teal-200/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</> : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
