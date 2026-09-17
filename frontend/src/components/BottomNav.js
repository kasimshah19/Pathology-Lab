import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, FileText, Menu } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
];

export default function BottomNav({ onOpenMenu }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg pb-[env(safe-area-inset-bottom)] flex md:hidden">
      <div className="flex w-full items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform duration-200 ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                isActive ? 'bg-teal-50' : 'bg-transparent'
              }`}>
                <Icon 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`} 
                />
              </div>
              <span className={`text-[10px] font-medium transition-all duration-200 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* More Button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform duration-200"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-transparent transition-colors">
            <Menu className="w-5 h-5 stroke-[1.8px]" />
          </div>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
