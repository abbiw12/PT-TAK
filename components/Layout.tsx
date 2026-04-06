
import React from 'react';
import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Calendar,
  ClipboardList,
  LineChart,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!user) return <div className="min-h-screen bg-slate-50">{children}</div>;

  const menuItems = user.role === 'host' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'programs', label: 'Programs', icon: ClipboardList },
    { id: 'trainees', label: 'Trainees', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'My Plan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PT <span className="text-blue-500">TAK</span></span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-700" alt={user.name} />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-slate-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-lg font-bold text-slate-800 lg:hidden">PT TAK</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-slate-500">System Ready</span>
            <button 
              onClick={() => setActiveTab('settings')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-slate-500 hover:text-slate-700" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
