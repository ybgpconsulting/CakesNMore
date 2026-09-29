import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_HOMEPAGE_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  fetchCategories,
  fetchHomepageConfig,
  fetchProducts,
  fetchStoreSettings,
  removeCategory,
  removeProduct,
  saveCategory,
  saveHomepageConfig,
  saveProduct,
  saveStoreSettings,
} from '../services/storeApi';
import { Category, HomepageConfig, Product, StoreSettings } from '../types';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  homepageConfig: HomepageConfig;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  upsertProduct: (product: Product) => Promise<void>;
  deleteProductById: (productId: string) => Promise<void>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  upsertCategory: (category: Category) => Promise<void>;
  deleteCategoryById: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
  updateSettings: (newSettings: StoreSettings) => Promise<void>;
  updateHomepage: (newConfig: HomepageConfig) => Promise<void>;
  getProductsByCategory: (categoryIdOrSlug: string) => Product[];
  getFeaturedProducts: () => Product[];
  getBestsellerProducts: () => Product[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(INITIAL_HOMEPAGE_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prods, cats, sets, home] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchStoreSettings(),
        fetchHomepageConfig(),
      ]);

      setProducts(prods);
      setCategories(cats);
      setSettings(sets);
      setHomepageConfig(home);
    } catch (err) {
      console.warn('Error loading store data:', err);
      setError('Unable to fetch live store data. Using cached catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const upsertProduct = async (product: Product) => {
    await saveProduct(product);
    await loadAllData();
  };

  const deleteProductById = async (productId: string) => {
    await removeProduct(productId);
    await loadAllData();
  };

  const toggleProductAvailability = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      const updated = { ...target, available: !target.available };
      await saveProduct(updated);
      await loadAllData();
    }
  };

  const upsertCategory = async (category: Category) => {
    await saveCategory(category);
    await loadAllData();
  };

  const deleteCategoryById = async (categoryId: string): Promise<{ success: boolean; error?: string }> => {
    // Safe check: do not allow deleting if products still belong to this category
    const linkedProducts = products.filter((p) => p.categoryId === categoryId);
    if (linkedProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${linkedProducts.length} product(s) are currently assigned to it. Please reassign or delete the products first.`,
      };
    }
    try {
      await removeCategory(categoryId);
      await loadAllData();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to delete category.',
      };
    }
  };

  const updateSettingsHandler = async (newSettings: StoreSettings) => {
    await saveStoreSettings(newSettings);
    setSettings(newSettings);
  };

  const updateHomepageHandler = async (newConfig: HomepageConfig) => {
    await saveHomepageConfig(newConfig);
    setHomepageConfig(newConfig);
  };

  const getProductsByCategory = (categoryIdOrSlug: string) => {
    const category = categories.find((c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug);
    if (!category) return [];
    return products.filter((p) => (p.categoryId === category.id || p.categoryName?.toLowerCase() === category.name.toLowerCase()) && p.available);
  };

  const getFeaturedProducts = () => {
    return products.filter((p) => p.featured && p.available);
  };

  const getBestsellerProducts = () => {
    return products.filter((p) => p.bestseller && p.available);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        homepageConfig,
        loading,
        error,
        refreshData: loadAllData,
        upsertProduct,
        deleteProductById,
        toggleProductAvailability,
        upsertCategory,
        deleteCategoryById,
        updateSettings: updateSettingsHandler,
        updateHomepage: updateHomepageHandler,
        getProductsByCategory,
        getFeaturedProducts,
        getBestsellerProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
