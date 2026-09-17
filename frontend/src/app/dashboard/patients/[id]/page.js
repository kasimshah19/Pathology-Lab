'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function PatientDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div className="h-5 w-32 bg-slate-200 rounded"></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0"></div>
          <div className="space-y-2">
            <div className="h-6 w-40 bg-slate-200 rounded"></div>
            <div className="h-4 w-24 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70">
              <div className="w-9 h-9 rounded-lg bg-slate-200 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data.data);
      } catch {
        setError('Patient not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return <PatientDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-slate-400 font-medium mb-4">{error}</p>
        <button onClick={() => router.back()} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          ← Go back
        </button>
      </div>
    );
  }

  const info = [
    { icon: User, label: 'Age / Gender', value: `${patient.age} Y / ${patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}` },
    { icon: Phone, label: 'Phone', value: patient.phone },
    { icon: Mail, label: 'Email', value: patient.email || '—' },
    { icon: MapPin, label: 'Address', value: patient.address || '—' },
    { icon: Calendar, label: 'Registered', value: new Date(patient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-400 mb-2">
        <Link href="/dashboard/patients" className="hover:text-teal-600 transition-colors">Patients</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-slate-800">{patient.patientId}</span>
      </nav>

      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard/patients')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Patient card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-teal-200/30">
            {patient.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-mono font-medium mt-1">
              {patient.patientId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {info.map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <p className="text-sm text-slate-700 font-medium">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for booking history */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-slate-300 text-sm">Booking history & reports will appear here.</p>
      </div>
    </div>
  );
}
