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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#30251F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#81776C] tracking-wide uppercase">Verifying administrator credentials...</p>
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
    { label: 'Products', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Categories', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'Import Menu', path: '/admin/import-menu', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { label: 'Homepage Editor', path: '/admin/homepage', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Delivery Settings', path: '/admin/delivery', icon: <Truck className="w-4 h-4" /> },
    { label: 'Store Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col md:flex-row text-[#30251F]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1E1714] text-[#FAF7F0] shrink-0 border-r border-[#30251F]/40 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#30251F] text-[#C5A46D] border border-[#C5A46D]/30 flex items-center justify-center shadow-inner">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-normal tracking-tight leading-none text-white">
              Cakes N More
            </h2>
            <p className="text-[11px] text-[#C5A46D] font-medium tracking-wider uppercase mt-1">
              Admin Atelier
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                isActive(item.path)
                  ? 'bg-[#30251F] text-[#FAF7F0] border-l-2 border-[#C5A46D] shadow-sm'
                  : 'text-[#81776C] hover:bg-white/5 hover:text-[#FAF7F0]'
              }`}
            >
              <span className={isActive(item.path) ? 'text-[#C5A46D]' : 'text-[#81776C]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-3.5 py-2.5 bg-black/20 rounded-xl text-xs border border-white/5">
            <p className="text-[10px] text-[#81776C] uppercase tracking-wider font-bold">Logged In As</p>
            <p className="font-medium text-[#FAF7F0] truncate mt-0.5">{adminUser.email}</p>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#FAF7F0] border border-white/10 transition-colors"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A46D]" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-bold text-rose-300 border border-rose-900/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#1E1714] text-[#FAF7F0] p-4 flex items-center justify-between shadow-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#30251F] text-[#C5A46D] border border-[#C5A46D]/30 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-normal text-sm text-white">Cakes N More</span>
            <span className="block text-[10px] text-[#C5A46D] uppercase tracking-wider">Admin</span>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-[#81776C] hover:text-[#FAF7F0]"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#241C18] text-white p-4 space-y-2 border-b border-white/10 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileNavOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isActive(item.path)
                  ? 'bg-[#30251F] text-white border-l-2 border-[#C5A46D]'
                  : 'text-[#81776C] hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={isActive(item.path) ? 'text-[#C5A46D]' : 'text-[#81776C]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 py-2.5 rounded-lg bg-white/10 text-center text-xs font-bold text-white"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-lg bg-rose-900/60 text-center text-xs font-bold text-rose-200"
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
