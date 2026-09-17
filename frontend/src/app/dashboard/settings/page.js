'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import StaffFormModal from '@/components/StaffFormModal';
import api from '@/lib/api';
import {
  Save,
  Loader2,
  Users,
  Settings,
  Plus,
  ShieldCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';

const roleStyles = {
  admin: 'bg-purple-50 text-purple-600 border-purple-100',
  receptionist: 'bg-blue-50 text-blue-600 border-blue-100',
  technician: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const allRoles = ['admin', 'receptionist', 'technician'];

function RoleDropdown({ current, options, styles, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (disabled) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border capitalize ${styles[current]}`}>
        {current}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border capitalize ${styles[current]} hover:opacity-80 transition-opacity`}
      >
        {current}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 min-w-[120px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors capitalize ${opt === current ? 'text-teal-600' : 'text-slate-600'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LabSettingsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse p-1">
      <div>
        <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
        <div className="h-[42px] bg-slate-100 rounded-xl w-full"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
          <div className="h-[42px] bg-slate-100 rounded-xl w-full"></div>
        </div>
        <div>
          <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
          <div className="h-[42px] bg-slate-100 rounded-xl w-full"></div>
        </div>
      </div>
      <div>
        <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
        <div className="h-24 bg-slate-100 rounded-xl w-full"></div>
      </div>
      <div>
        <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
        <div className="h-[42px] bg-slate-100 rounded-xl w-full"></div>
      </div>
    </div>
  );
}

function StaffRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-4 w-32 bg-slate-200 rounded mb-1.5"></div>
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-40 bg-slate-200 rounded mb-1.5"></div>
        <div className="h-3 w-24 bg-slate-100 rounded"></div>
      </td>
      <td className="px-4 py-3.5">
        <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex justify-center">
          <div className="w-9 h-5 bg-slate-200 rounded-full"></div>
        </div>
      </td>
    </tr>
  );
}

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('lab'); // 'lab' or 'staff'
  
  // Lab Settings State
  const [labSettings, setLabSettings] = useState({ labName: '', address: '', phone: '', email: '', reportFooterText: '' });
  const [loadingLab, setLoadingLab] = useState(true);
  const [savingLab, setSavingLab] = useState(false);

  // Staff Management State
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Security check: only admins
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchLabSettings = useCallback(async () => {
    setLoadingLab(true);
    try {
      const res = await api.get('/settings');
      if (res.data.data) {
        setLabSettings(res.data.data);
      }
    } catch {
      addToast('Failed to load lab settings', 'error');
    } finally {
      setLoadingLab(false);
    }
  }, [addToast]);

  const fetchStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const res = await api.get('/auth/users');
      setStaff(res.data.data || []);
    } catch {
      addToast('Failed to load staff', 'error');
    } finally {
      setLoadingStaff(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeTab === 'lab') fetchLabSettings();
      if (activeTab === 'staff') fetchStaff();
    }
  }, [activeTab, user, fetchLabSettings, fetchStaff]);

  const handleLabSettingsSave = async (e) => {
    e.preventDefault();
    setSavingLab(true);
    try {
      await api.put('/settings', labSettings);
      addToast('Lab settings saved successfully', 'success');
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setSavingLab(false);
    }
  };

  const handleStatusToggle = async (staffId, currentStatus) => {
    setUpdatingId(staffId);
    try {
      await api.patch(`/auth/users/${staffId}/status`, { isActive: !currentStatus });
      addToast(`Staff member ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      fetchStaff();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (staffId, newRole) => {
    setUpdatingId(staffId);
    try {
      await api.patch(`/auth/users/${staffId}/role`, { role: newRole });
      addToast('Role updated successfully', 'success');
      fetchStaff();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || user?.role !== 'admin') return null; // Wait for redirect or load

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage lab preferences and staff access</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('lab')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'lab' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Building2 className="w-4 h-4" /> Lab Information
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'staff' ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <Users className="w-4 h-4" /> Staff Management
        </button>
      </div>

      {/* Lab Information Tab */}
      {activeTab === 'lab' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-3xl">
          {loadingLab ? (
            <LabSettingsSkeleton />
          ) : (
            <form onSubmit={handleLabSettingsSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lab Name</label>
                <input type="text" value={labSettings.labName} onChange={(e) => setLabSettings({ ...labSettings, labName: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
                  <input type="text" value={labSettings.phone} onChange={(e) => setLabSettings({ ...labSettings, phone: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                  <input type="email" value={labSettings.email} onChange={(e) => setLabSettings({ ...labSettings, email: e.target.value })} className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Address</label>
                <textarea value={labSettings.address} onChange={(e) => setLabSettings({ ...labSettings, address: e.target.value })} rows={3} className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Report Footer Text</label>
                <input type="text" value={labSettings.reportFooterText} onChange={(e) => setLabSettings({ ...labSettings, reportFooterText: e.target.value })} placeholder="e.g. This is a computer generated report" className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={savingLab} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm disabled:opacity-60 transition-all">
                  {savingLab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setStaffModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Staff Member
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingStaff ? (
                    [...Array(3)].map((_, i) => <StaffRowSkeleton key={i} />)
                  ) : staff.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-400">No staff members found</td></tr>
                  ) : (
                    staff.map((s) => {
                      const isMe = s._id === user.id;
                      return (
                        <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-800">{s.name}</p>
                              {isMe && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-slate-600">{s.email}</p>
                            {s.phone && <p className="text-xs text-slate-400">{s.phone}</p>}
                          </td>
                          <td className="px-4 py-3.5">
                            <RoleDropdown
                              current={s.role}
                              options={allRoles}
                              styles={roleStyles}
                              disabled={isMe || updatingId === s._id}
                              onSelect={(role) => handleRoleChange(s._id, role)}
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex justify-center">
                              <label className={`relative inline-flex items-center ${isMe || updatingId === s._id ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input type="checkbox" className="sr-only peer" checked={s.isActive} disabled={isMe || updatingId === s._id} onChange={() => handleStatusToggle(s._id, s.isActive)} />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                              </label>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <StaffFormModal open={staffModalOpen} onClose={() => setStaffModalOpen(false)} onSuccess={(msg) => { addToast(msg, 'success'); fetchStaff(); }} />
    </div>
  );
}
