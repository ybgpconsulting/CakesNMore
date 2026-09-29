import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/common/ScrollToTop';
import { DeliveryAvailabilityGate } from './components/delivery/DeliveryAvailabilityGate';
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { StoreProvider } from './context/StoreContext';

// Core storefront pages loaded eagerly for immediate mobile performance
import { CartPage } from './pages/CartPage';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ShopPage } from './pages/ShopPage';

// Lazy-loaded secondary & admin pages to minimize initial bundle size on mobile devices
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminHomepagePage = lazy(() => import('./pages/admin/AdminHomepagePage').then(m => ({ default: m.AdminHomepagePage })));
const DeliverySettingsPage = lazy(() => import('./pages/admin/DeliverySettingsPage').then(m => ({ default: m.DeliverySettingsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const AdminMenuImportPage = lazy(() => import('./pages/admin/AdminMenuImportPage').then(m => ({ default: m.AdminMenuImportPage })));

const PageSuspenseFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center" aria-label="Loading page">
    <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <DeliveryProvider>
          <CartProvider>
            <AuthProvider>
              <ScrollToTop />
              <DeliveryAvailabilityGate />
              <Suspense fallback={<PageSuspenseFallback />}>
                <Routes>
                  {/* Public Storefront Routes */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="category/:slug" element={<CategoryPage />} />
                    <Route path="product/:slug" element={<ProductDetailPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="privacy-policy" element={<LegalPage page="privacy" />} />
                    <Route path="terms-and-conditions" element={<LegalPage page="terms" />} />
                    <Route path="shipping-and-delivery" element={<LegalPage page="shipping" />} />
                    <Route path="returns-policy" element={<LegalPage page="returns" />} />
                  </Route>

                  {/* Admin Portal Routes */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                    <Route path="/admin/import-menu" element={<AdminMenuImportPage />} />
                    <Route path="/admin/homepage" element={<AdminHomepagePage />} />
                    <Route path="/admin/delivery" element={<DeliverySettingsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* Fallback 404 to Home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </CartProvider>
        </DeliveryProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
