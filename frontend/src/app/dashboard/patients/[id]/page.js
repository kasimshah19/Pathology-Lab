'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Loader2, ChevronRight, Edit2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PatientFormModal from '@/components/PatientFormModal';
import { useToast } from '@/components/Toast';

// Status badge colors
const statusStyles = {
  pending: 'bg-slate-100 text-slate-500',
  sample_collected: 'bg-blue-50 text-blue-600',
  result_entered: 'bg-amber-50 text-amber-600',
  report_ready: 'bg-purple-50 text-purple-600',
  delivered: 'bg-emerald-50 text-emerald-600',
};

const statusLabels = {
  pending: 'Pending',
  sample_collected: 'Sample Collected',
  result_entered: 'Result Entered',
  report_ready: 'Report Ready',
  delivered: 'Delivered',
};

const paymentStyles = {
  paid: 'bg-emerald-50 text-emerald-600',
  unpaid: 'bg-red-50 text-red-500',
  partial: 'bg-orange-50 text-orange-600',
};

const paymentLabels = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  partial: 'Partial',
};

function PatientDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
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
      <div className="h-40 bg-slate-200 rounded-2xl"></div>
    </div>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const limit = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPatient = useCallback(async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data.data);
    } catch {
      setError('Patient not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchBookings = useCallback(async (pageVal) => {
    setLoadingBookings(true);
    try {
      const res = await api.get(`/bookings`, { params: { patient: id, page: pageVal, limit } });
      setBookings(res.data.data.bookings || []);
      setTotalPages(res.data.data.pages || 1);
      setTotalBookings(res.data.data.total || 0);
    } catch {
      addToast('Failed to load booking history', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    fetchBookings(page);
  }, [page, fetchBookings]);

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

  // Note: This sums the amount for visible bookings if backend doesn't return aggregate.
  const totalAmountSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const lastVisit = bookings.length > 0 ? new Date(bookings[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-6 max-w-5xl">
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
          title="Edit Patient"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-teal-200/30 overflow-hidden">
            {patient.photoUrl ? (
              <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
            ) : (
              patient.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-mono font-medium mt-1">
              {patient.patientId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Booking History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Booking History</h3>
          <div className="flex items-center gap-4 text-sm bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-2">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-medium">Total Visits</span>
              <span className="text-slate-700 font-semibold">{totalBookings}</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-medium">Last Visit</span>
              <span className="text-slate-700 font-semibold">{lastVisit}</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs font-medium">Amount Spent (Page)</span>
              <span className="text-teal-600 font-semibold">₹{totalAmountSpent.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {loadingBookings ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
            <span className="ml-2 text-slate-500 text-sm font-medium">Loading history...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No bookings yet</h3>
            <p className="text-slate-500 text-sm mb-6">This patient hasn't had any tests done yet.</p>
            <Link 
              href="/dashboard/bookings"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200"
            >
              Create New Booking
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Booking ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Tests</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => {
                    const testNames = b.tests?.map((t) => t.testName) || [];
                    const displayTests = testNames.slice(0, 2);
                    const extraCount = testNames.length - 2;

                    return (
                      <tr 
                        key={b._id} 
                        onClick={() => router.push(`/dashboard/bookings/${b.bookingId}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-mono font-medium group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            {b.bookingId}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-sm font-medium">
                          {new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {displayTests.map((name, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-100">
                                {name}
                              </span>
                            ))}
                            {extraCount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 text-[11px] font-semibold">
                                +{extraCount} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700 text-sm">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit ${paymentStyles[b.paymentStatus] || 'bg-slate-100 text-slate-500'}`}>
                              {paymentLabels[b.paymentStatus] || b.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusStyles[b.status] || 'bg-slate-100 text-slate-500'}`}>
                            {statusLabels[b.status] || b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">
                  Showing page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PatientFormModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={() => { setIsEditModalOpen(false); fetchPatient(); }}
        existingPatient={patient}
      />
    </div>
  );
}
