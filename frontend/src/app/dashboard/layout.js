'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  ClipboardList,
  FileText,
  Settings,
  History,
  BarChart3,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Microscope,
  KeyRound,
} from 'lucide-react';
import ChangePasswordModal from '@/components/ChangePasswordModal';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Test Catalog', href: '/dashboard/tests', icon: FlaskConical },
  { label: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
];

const adminOnlyItems = [
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Activity Log', href: '/dashboard/activity-log', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function Sidebar({ open, onClose, user }) {
  const pathname = usePathname();
  const allItems = user?.role === 'admin' ? [...navItems, ...adminOnlyItems] : navItems;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-200/40">
            <Microscope className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-800 truncate">Pathology Lab</h2>
            <p className="text-[11px] text-slate-300 font-medium">Management System</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-200/30'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-500'} transition-colors`} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer with user info */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-300 capitalize">{user?.role || 'staff'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopNavbar({ onMenuClick, user, logout, onOpenPasswordModal }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive page title from pathname
  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    if (segment === 'dashboard') return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100 flex items-center justify-between px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
      </div>

      {/* Right side — user dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-700 leading-tight">{user?.name || 'User'}</p>
          </div>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 text-[11px] font-semibold capitalize">
            {user?.role || 'staff'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-slate-50 sm:hidden">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenPasswordModal();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Close sidebar on route change (mobile)
  const pathname = usePathname();
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} user={user} logout={logout} onOpenPasswordModal={() => setPasswordModalOpen(true)} />
          <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">
            {children}
          </main>
        </div>
        <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>

      <ChangePasswordModal 
        isOpen={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </ProtectedRoute>
  );
}
