import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, ShieldAlert, Store } from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { adminUser, login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (adminUser) {
      navigate('/admin/products', { replace: true });
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/products');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      await forgotPassword(resetEmail.trim());
      setResetSuccess(`Password reset instructions sent to ${resetEmail}`);
      setShowForgotModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#30251F]">
      <SEO title="Admin Login | Cakes N More Sector 76 Noida" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#30251F] text-[#C5A46D] border border-[#C5A46D]/30 flex items-center justify-center mx-auto shadow-sm mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-normal text-[#30251F] tracking-tight">
          Store Management Portal
        </h1>
        <p className="mt-1 text-xs text-[#81776C] tracking-wide uppercase">
          Cakes N More • Sector 76, Noida
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-3xl border border-[#E8E2D5] sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@cakesnmore.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-[#81776C] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-[#30251F] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#81776C] hover:text-[#30251F] underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F0] border border-[#E8E2D5] text-[#30251F] rounded-xl text-xs sm:text-sm focus:border-[#30251F] focus:bg-white focus:outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#81776C] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-editorial-primary w-full py-3.5 px-4 rounded-full text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E8E2D5] flex items-center gap-2 text-xs text-[#81776C]">
            <ShieldAlert className="w-4 h-4 text-[#C5A46D] shrink-0" />
            <span>Authorized access only. All authentication attempts are verified by the secure store administrator service.</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-xl border border-[#E8E2D5]">
            <h3 className="font-serif text-xl font-normal text-[#30251F]">Reset Admin Password</h3>
            <p className="text-xs text-[#81776C]">
              Enter your registered administrator email to receive password reset instructions.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder="admin@cakesnmore.in"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs focus:border-[#30251F] focus:outline-none"
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-full border border-[#E8E2D5] text-xs font-bold text-[#81776C] hover:bg-[#FAF7F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#30251F] hover:bg-[#1E1714] text-white text-xs font-bold shadow-sm"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
