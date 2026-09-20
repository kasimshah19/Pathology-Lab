'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Users,
  CheckCircle, Clock, FileText, AlertCircle, Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: '#94a3b8',
  sample_collected: '#3b82f6',
  result_entered: '#f59e0b',
  report_ready: '#a855f7',
  delivered: '#10b981',
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [testPopularity, setTestPopularity] = useState([]);
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);

  const [revenuePeriod, setRevenuePeriod] = useState('30days');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRevenueData(revenuePeriod);
    }
  }, [revenuePeriod]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [overviewRes, popRes, statusRes, catRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/test-popularity'),
        api.get('/analytics/bookings-by-status'),
        api.get('/analytics/category-breakdown'),
      ]);

      if (overviewRes.data.success) setOverview(overviewRes.data.data);
      if (popRes.data.success) setTestPopularity(popRes.data.data);
      
      if (statusRes.data.success) {
        // Format for pie chart
        const formattedStatus = statusRes.data.data.map(item => ({
          name: item.status.replace(/_/g, ' '),
          value: item.count,
          color: STATUS_COLORS[item.status] || '#cbd5e1'
        }));
        setBookingsByStatus(formattedStatus);
      }

      if (catRes.data.success) setCategoryBreakdown(catRes.data.data);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async (period) => {
    try {
      const res = await api.get(`/analytics/revenue?period=${period}`);
      if (res.data.success) {
        const formatted = res.data.data.map(item => ({
          ...item,
          displayDate: period === '12months' 
            ? format(parseISO(item.date + '-01'), 'MMM yyyy')
            : format(parseISO(item.date), 'dd MMM')
        }));
        setRevenueData(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return null; // Will redirect
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Key metrics and business intelligence.</p>
      </div>

      {loading && !overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(overview?.totalRevenueAllTime || 0)} 
            icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
            bgColor="bg-emerald-50"
            trend={overview?.percentageChange}
          />
          <StatCard 
            title="Total Bookings" 
            value={(overview?.totalBookingsAllTime || 0).toLocaleString()} 
            icon={<Activity className="w-6 h-6 text-teal-600" />}
            bgColor="bg-teal-50"
          />
          <StatCard 
            title="Total Patients" 
            value={(overview?.totalPatientsAllTime || 0).toLocaleString()} 
            icon={<Users className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Avg Booking Value" 
            value={formatCurrency(overview?.averageBookingValue || 0)} 
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-base font-bold text-slate-800">Revenue Trend</h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['7days', '30days', '12months'].map(period => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    revenuePeriod === period 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading && revenueData.length === 0 ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0d9488" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-6">Bookings by Status</h3>
          <div className="h-[300px] w-full">
            {loading && bookingsByStatus.length === 0 ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : bookingsByStatus.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No bookings found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-600 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tests */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-6">Most Popular Tests</h3>
          <div className="h-[300px] w-full">
            {loading && testPopularity.length === 0 ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : testPopularity.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={testPopularity}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="testName" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={150}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value, 'Bookings']}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-800 mb-6">Revenue by Category</h3>
          <div className="overflow-x-auto">
            {loading && categoryBreakdown.length === 0 ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl"></div>)}
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="py-12 flex items-center justify-center text-slate-400 text-sm">No data found</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase text-right">Bookings</th>
                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categoryBreakdown.sort((a,b) => b.revenue - a.revenue).map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm font-semibold text-slate-700">{cat.count}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm font-semibold text-teal-600">{formatCurrency(cat.revenue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
          
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(trend)}%</span>
              <span className="text-slate-400 font-normal ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
