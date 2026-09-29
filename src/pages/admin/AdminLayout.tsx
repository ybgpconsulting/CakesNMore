import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FileSpreadsheet,
  FolderTree,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLayout: React.FC = () => {
  const { adminUser, loading, logout } = useAuth();
  const { settings } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#831843] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // Protected route check
  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const navItems = [
    { label: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-5 h-5" /> },
    { label: 'Import Menu', path: '/admin/import-menu', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { label: 'Homepage Editor', path: '/admin/homepage', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Delivery Settings', path: '/admin/delivery', icon: <Truck className="w-5 h-5" /> },
    { label: 'Store Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col md:flex-row text-gray-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1C1618] text-white shrink-0 shadow-xl border-r border-[#312527]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#312527] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#831843] text-white flex items-center justify-center shadow">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-tight leading-none text-white">
              Cakes N More Admin
            </h2>
            <p className="text-[11px] text-[#E8A598] font-medium mt-1">
              Sector 76 Noida
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive(item.path)
                  ? 'bg-[#831843] text-white shadow-md'
                  : 'text-gray-300 hover:bg-[#2A1E22] hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-[#312527] space-y-3">
          <div className="px-3 py-2 bg-[#2A1E22] rounded-xl text-xs">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Logged In As</p>
            <p className="font-medium text-white truncate">{adminUser.email}</p>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 transition-colors"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-bold text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#1C1618] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#831843] flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-sm">Cakes N More Admin</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#241A1E] text-white p-4 space-y-2 border-b border-[#312527]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive(item.path) ? 'bg-[#831843] text-white' : 'text-gray-300 hover:bg-[#312527]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-700 flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 py-2 rounded-lg bg-gray-800 text-center text-xs font-bold"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-lg bg-rose-900 text-center text-xs font-bold text-rose-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Canvas */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
