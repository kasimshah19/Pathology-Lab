'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Users, ClipboardList, FileText, IndianRupee, ArrowRight, Activity } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPatients: '0',
    todayBookings: '0',
    pendingReports: '0',
    revenueToday: '₹0',
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, bookingsRes] = await Promise.all([
          api.get('/patients'),
          api.get('/bookings?limit=1000') // Fetching a larger batch to compute today's stats accurately
        ]);

        const patientsData = patientsRes.data?.data || patientsRes.data || {};
        const bookingsData = bookingsRes.data?.data || bookingsRes.data || {};

        const totalPatients = patientsData.totalCount || patientsData.patients?.length || 0;
        
        const allBookings = Array.isArray(bookingsData) ? bookingsData : (Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
        const today = new Date().toISOString().split('T')[0];
        
        const todayBookingsArr = allBookings.filter(b => b.createdAt && b.createdAt.startsWith(today));
        const todayBookingsCount = todayBookingsArr.length;
        
        const revenueToday = todayBookingsArr
          .filter(b => b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
          
        const pendingReportsCount = allBookings.filter(b => 
          b.status === 'sample_collected' || b.status === 'result_entered'
        ).length;

        setMetrics({
          totalPatients: totalPatients.toString(),
          todayBookings: todayBookingsCount.toString(),
          pendingReports: pendingReportsCount.toString(),
          revenueToday: `₹${revenueToday}`,
        });

        // Top 5 recent
        setRecentBookings(allBookings.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statConfig = [
    {
      label: 'Total Patients',
      value: metrics.totalPatients,
      icon: Users,
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: "Today's Bookings",
      value: metrics.todayBookings,
      icon: ClipboardList,
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      label: 'Pending Reports',
      value: metrics.pendingReports,
      icon: FileText,
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Revenue Today',
      value: metrics.revenueToday,
      icon: IndianRupee,
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  const statusColors = {
    registered: 'bg-slate-100 text-slate-600',
    sample_collected: 'bg-blue-50 text-blue-600',
    result_entered: 'bg-amber-50 text-amber-600',
    completed: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-red-50 text-red-600',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Welcome back, {user?.name || 'User'} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s an overview of your lab today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {statConfig.map((stat, idx) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bgLight} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-400 font-medium truncate">{stat.label}</p>
              {loading ? (
                <div className="h-7 w-16 bg-slate-200 rounded-md animate-pulse mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-semibold text-slate-800">Recent Bookings</h3>
          </div>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-200 rounded-full animate-pulse"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto"></div></td>
                  </tr>
                ))
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                recentBookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/bookings/${booking._id}`} className="font-semibold text-slate-700 group-hover:text-teal-600 transition-colors">
                        {booking.bookingId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {booking.patient?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${statusColors[booking.status] || statusColors.registered}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      ₹{booking.totalAmount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
