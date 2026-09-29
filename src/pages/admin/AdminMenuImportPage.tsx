import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO';
import { useStore } from '../../context/StoreContext';
import { executeMenuImport, fetchMenuImportHistory } from '../../services/storeApi';
import {
  DuplicateResolutionAction,
  ImportHistoryRecord,
  MenuImportPayload,
  ParsedImportItem,
  Product,
} from '../../types';
import {
  generateSampleCsvTemplate,
  generateSampleJsonTemplate,
  parseCsvMenu,
  parseJsonMenu,
  validateAndMatchImportItems,
} from '../../utils/menuParser';

export const AdminMenuImportPage: React.FC = () => {
  const { products, categories, refreshData } = useStore();

  // Tab state: 'upload' vs 'paste'
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedContent, setPastedContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed data state
  const [fileName, setFileName] = useState('');
  const [fileFormat, setFileFormat] = useState<'csv' | 'json'>('csv');
  const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Filters & Table Controls
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid_new' | 'duplicate' | 'invalid'>('all');
  const [globalDuplicateAction, setGlobalDuplicateAction] = useState<DuplicateResolutionAction>('skip');

  // Import Execution state
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportHistoryRecord | null>(null);

  // History state
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await fetchMenuImportHistory();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load import history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle parsing raw text
  const processRawData = (text: string, name: string, format: 'csv' | 'json') => {
    setParseError(null);
    setImportResult(null);

    try {
      const rawItems = format === 'json' ? parseJsonMenu(text) : parseCsvMenu(text);
      if (rawItems.length === 0) {
        setParseError('The file contains no menu items to import.');
        return;
      }

      const { items } = validateAndMatchImportItems(rawItems, products, categories);
      setParsedItems(items);
      setFileName(name);
      setFileFormat(format);
    } catch (err) {
      setParseError((err as Error).message || 'Failed to parse file.');
      setParsedItems([]);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const format = ext === 'json' ? 'json' : 'csv';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processRawData(content, file.name, format);
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const format = ext === 'json' ? 'json' : 'csv';

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processRawData(content, file.name, format);
      }
    };
    reader.readAsText(file);
  };

  // Handle pasted text parse
  const handleParsePasted = () => {
    if (!pastedContent.trim()) {
      setParseError('Please paste CSV or JSON content into the box.');
      return;
    }

    const trimmed = pastedContent.trim();
    const isJson = trimmed.startsWith('{') || trimmed.startsWith('[');
    const format = isJson ? 'json' : 'csv';
    processRawData(trimmed, isJson ? 'pasted_menu.json' : 'pasted_menu.csv', format);
  };

  // Template download helpers
  const handleDownloadCsvTemplate = () => {
    const csv = generateSampleCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cakesnmore_menu_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonTemplate = () => {
    const jsonStr = generateSampleJsonTemplate();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cakesnmore_menu_sample.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear current parsed data
  const handleResetParsedData = () => {
    setParsedItems([]);
    setFileName('');
    setParseError(null);
    setPastedContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Summary counts
  const summary = useMemo(() => {
    const total = parsedItems.length;
    const newItems = parsedItems.filter((i) => i.status === 'valid_new').length;
    const duplicates = parsedItems.filter((i) => i.status === 'duplicate').length;
    const invalid = parsedItems.filter((i) => i.status === 'invalid').length;
    const selectedCount = parsedItems.filter((i) => i.selected).length;

    // Distinct new categories
    const newCategories = Array.from(
      new Set(parsedItems.filter((i) => i.isNewCategory).map((i) => i.categoryName))
    );

    return { total, newItems, duplicates, invalid, selectedCount, newCategories };
  }, [parsedItems]);

  // Bulk Selection Handlers
  const handleSelectAll = (select: boolean) => {
    setParsedItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.status === 'invalid' ? false : select,
      }))
    );
  };

  const handleSelectValidOnly = () => {
    setParsedItems((prev) =>
      prev.map((item) => ({
        ...item,
        selected: item.status !== 'invalid',
      }))
    );
  };

  const handleToggleRowSelect = (rowNumber: number) => {
    setParsedItems((prev) =>
      prev.map((item) =>
        item.rowNumber === rowNumber ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleRowDuplicateActionChange = (rowNumber: number, action: DuplicateResolutionAction) => {
    setParsedItems((prev) =>
      prev.map((item) =>
        item.rowNumber === rowNumber ? { ...item, duplicateAction: action } : item
      )
    );
  };

  const handleApplyGlobalDuplicateAction = (action: DuplicateResolutionAction) => {
    setGlobalDuplicateAction(action);
    setParsedItems((prev) =>
      prev.map((item) =>
        item.status === 'duplicate' ? { ...item, duplicateAction: action } : item
      )
    );
  };

  // Filtered Items for display in preview table
  const displayedItems = useMemo(() => {
    return parsedItems.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.categoryName.toLowerCase().includes(q);
        const matchesSku = item.sku?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSku) {
          return false;
        }
      }
      return true;
    });
  }, [parsedItems, statusFilter, searchFilter]);

  // Execute Import
  const handleExecuteImport = async () => {
    const selectedItems = parsedItems.filter((i) => i.selected && i.status !== 'invalid');
    if (selectedItems.length === 0) {
      alert('Please select at least one valid item to import.');
      return;
    }

    setIsImporting(true);
    setParseError(null);

    try {
      const now = new Date().toISOString();

      // Collect categories to auto-create
      const newCategoryNames = Array.from(
        new Set(selectedItems.filter((i) => i.isNewCategory).map((i) => i.categoryName))
      );

      const categoriesToCreate = newCategoryNames.map((catName, idx) => {
        const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return {
          id: `cat-${catSlug}`,
          name: catName,
          slug: catSlug,
          description: `Handcrafted ${catName} freshly prepared in Sector 76 Noida.`,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
          active: true,
          displayOrder: categories.length + idx + 1,
        };
      });

      const productsToCreate: Product[] = [];
      const productsToUpdate: Product[] = [];
      let skippedCount = 0;

      selectedItems.forEach((item, idx) => {
        if (item.status === 'duplicate') {
          if (item.duplicateAction === 'skip') {
            skippedCount++;
            return;
          } else if (item.duplicateAction === 'update') {
            // Match existing product
            const existing = products.find((p) => p.id === item.duplicateMatchId);
            if (existing) {
              productsToUpdate.push({
                ...existing,
                name: item.name,
                description: item.description || existing.description,
                price: item.price,
                oldPrice: item.oldPrice !== undefined ? item.oldPrice : existing.oldPrice,
                sku: item.sku || existing.sku,
                images: item.images.length > 0 ? item.images : existing.images,
                available: item.available,
                weightOptions: item.weightOptions || existing.weightOptions,
                updatedAt: now,
              });
              return;
            }
          }
          // If 'create_new', proceed to create with a unique slug & id
        }

        // Create as new product
        const uniqueId = item.sku
          ? `prod-${item.sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
          : `prod-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${idx}`;

        const baseSlug = item.slug || 'product';
        const uniqueSlug = products.some((p) => p.slug === baseSlug)
          ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
          : baseSlug;

        productsToCreate.push({
          id: uniqueId,
          name: item.name,
          slug: uniqueSlug,
          description: item.description || `Handcrafted ${item.name} prepared fresh daily.`,
          price: item.price,
          oldPrice: item.oldPrice,
          sku: item.sku,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          categorySlug: item.categorySlug,
          images: item.images,
          featured: false,
          bestseller: false,
          available: item.available,
          displayOrder: products.length + idx + 1,
          weightOptions: item.weightOptions,
          createdAt: now,
          updatedAt: now,
        });
      });

      const payload: MenuImportPayload = {
        fileName: fileName || 'manual_menu_import',
        fileFormat,
        categoriesToCreate,
        productsToCreate,
        productsToUpdate,
        skippedCount,
      };

      const res = await executeMenuImport(payload);
      setImportResult(res.summary);

      // Refresh store context to reflect newly imported items immediately
      await refreshData();
      await loadHistory();
    } catch (err) {
      setParseError((err as Error).message || 'Failed to complete menu import.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SEO title="Import Menu (CSV / JSON) | Cakes N More Admin" />

      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EADBDA] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/admin/products" className="hover:text-[#831843] flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Products</span>
            </Link>
            <span>•</span>
            <span className="text-[#831843] font-semibold">Menu Importer</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-[#831843]" />
            <span>Admin Menu Import</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Import or update restaurant menu items in bulk from CSV or JSON. Automatically detects duplicates, creates missing categories, and guarantees database integrity.
          </p>
        </div>

        {/* Template Downloads */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadCsvTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition-colors"
            title="Download CSV sample file with pre-filled columns"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Sample CSV</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadJsonTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 transition-colors"
            title="Download JSON sample file format"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Sample JSON</span>
          </button>
        </div>
      </div>

      {/* Parse Error Alert */}
      {parseError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Error Processing Menu File</p>
            <p>{parseError}</p>
          </div>
        </div>
      )}

      {/* Success Notification Modal / Card */}
      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  Menu Import Completed Successfully!
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Import ID: <code className="font-mono">{importResult.id}</code> • File: {importResult.fileName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setImportResult(null)}
              className="p-1.5 text-emerald-600 hover:text-emerald-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200/70">
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Created</span>
              <span className="text-xl font-extrabold text-emerald-900">{importResult.createdCount} products</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Updated</span>
              <span className="text-xl font-extrabold text-emerald-900">{importResult.updatedCount} products</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Categories Created</span>
              <span className="text-xl font-extrabold text-emerald-900">{importResult.categoriesCreatedCount}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Skipped</span>
              <span className="text-xl font-extrabold text-emerald-900">{importResult.skippedCount}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleResetParsedData}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-bold text-xs border border-emerald-200 hover:bg-emerald-100"
            >
              Import Another Menu
            </button>
            <Link
              to="/admin/products"
              className="px-4 py-2 rounded-xl bg-[#831843] text-white font-bold text-xs shadow hover:bg-[#6b1336]"
            >
              View Products Catalogue →
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: Uploader Section (Hidden if items are parsed) */}
      {parsedItems.length === 0 && !importResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-6">
          {/* Method Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'upload'
                  ? 'border-[#831843] text-[#831843]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Upload File (CSV or JSON)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'paste'
                  ? 'border-[#831843] text-[#831843]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Paste Raw Data
            </button>
          </div>

          {/* TAB 1: File Dropzone */}
          {activeTab === 'upload' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#831843] bg-[#FDF2F8]'
                  : 'border-gray-200 hover:border-[#831843] bg-[#FAF8F5]/50 hover:bg-[#FDF2F8]/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .json, text/csv, application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-[#FDF2F8] text-[#831843] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Choose a CSV or JSON file or drag it here
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
                Upload your menu spreadsheet or JSON export. Formats like comma/semicolon CSV and standard JSON are supported.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-600">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  .csv (Excel / Sheets export)
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-600">
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  .json (Structured catalogue)
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Textarea Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Paste CSV or JSON contents below
              </label>
              <textarea
                rows={10}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Category,Product Name,Price,Old Price,SKU,Description,Images&#10;Cakes,Eggless Truffle Cake,699,799,CK-01,Rich chocolate cake,https://...&#10;..."
                className="w-full font-mono text-xs p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#831843]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePasted}
                  className="px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b1336] text-white font-bold text-xs shadow flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse &amp; Preview Items</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions & Help */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EADBDA] space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <Info className="w-4 h-4 text-[#831843]" />
              <span>Supported Menu Columns &amp; Aliases:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-1">
              <li>
                <strong>Category:</strong> `category`, `category_name`, `menu_category`, `department`. Auto-creates missing categories!
              </li>
              <li>
                <strong>Product Name:</strong> `name`, `product_name`, `item_name`, `title`. (Required)
              </li>
              <li>
                <strong>Price:</strong> `price`, `selling_price`, `item_price`, `mrp`. Currency symbols (₹) are cleaned automatically.
              </li>
              <li>
                <strong>Old Price:</strong> `old_price`, `compare_at_price`, `original_price`. (Optional strike-through price)
              </li>
              <li>
                <strong>SKU / Item Code:</strong> `sku`, `item_code`, `barcode`. Used for accurate duplicate detection.
              </li>
              <li>
                <strong>Images:</strong> `images`, `image_url`, `photo`. Comma or pipe-separated URLs.
              </li>
              <li>
                <strong>Availability:</strong> `available`, `status`, `in_stock`. Accepts `true`, `1`, `yes`, `in_stock`.
              </li>
              <li>
                <strong>Weights / Options:</strong> `weight_options`, `variants`. E.g. `500g, 1kg, 2kg`.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* STEP 2: Complete Interactive Preview Section */}
      {parsedItems.length > 0 && (
        <div className="space-y-6">
          {/* File Header Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBDA] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDF2F8] text-[#831843] flex items-center justify-center font-bold">
                {fileFormat === 'json' ? <FileCode className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 truncate max-w-sm sm:max-w-md">
                  {fileName}
                </h3>
                <p className="text-xs text-gray-500">
                  Format: <span className="uppercase font-semibold">{fileFormat}</span> • {summary.total} total rows parsed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetParsedData}
                className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs"
              >
                Clear / Upload Different File
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'all'
                  ? 'bg-white border-[#831843] ring-2 ring-[#831843]/20 shadow'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Items</span>
              <span className="text-2xl font-extrabold text-gray-900">{summary.total}</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">{summary.selectedCount} selected</span>
            </div>

            <div
              onClick={() => setStatusFilter('valid_new')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'valid_new'
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow'
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">New Products</span>
              <span className="text-2xl font-extrabold text-emerald-800">{summary.newItems}</span>
              <span className="text-[11px] text-emerald-600 block mt-0.5">Ready to create</span>
            </div>

            <div
              onClick={() => setStatusFilter('duplicate')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'duplicate'
                  ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow'
                  : 'bg-white border-gray-200 hover:border-amber-300'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Duplicates Found</span>
              <span className="text-2xl font-extrabold text-amber-800">{summary.duplicates}</span>
              <span className="text-[11px] text-amber-600 block mt-0.5">Matches existing</span>
            </div>

            <div
              onClick={() => setStatusFilter('invalid')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                statusFilter === 'invalid'
                  ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-500/20 shadow'
                  : 'bg-white border-gray-200 hover:border-rose-300'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Errors / Invalid</span>
              <span className="text-2xl font-extrabold text-rose-800">{summary.invalid}</span>
              <span className="text-[11px] text-rose-600 block mt-0.5">Requires attention</span>
            </div>
          </div>

          {/* Missing Categories Alert Notice (Auto-create) */}
          {summary.newCategories.length > 0 && (
            <div className="bg-[#FAF8F5] border border-[#EADBDA] rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#831843] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-gray-900">
                  {summary.newCategories.length} New Categories Will Be Created Automatically:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {summary.newCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-0.5 rounded-full bg-[#FCE7F3] text-[#831843] font-bold text-[11px] border border-[#FBCFE8]"
                    >
                      + {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Controls & Global Duplicate Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[#EADBDA] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Selection buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-700 mr-1">Select:</span>
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                None
              </button>
              <button
                type="button"
                onClick={handleSelectValidOnly}
                className="px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
              >
                Valid Only
              </button>
            </div>

            {/* Global Duplicate Action */}
            {summary.duplicates > 0 && (
              <div className="flex items-center gap-2 flex-wrap bg-amber-50/70 p-2 px-3 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900">For Duplicates:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalDuplicateAction('skip')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      globalDuplicateAction === 'skip'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalDuplicateAction('update')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      globalDuplicateAction === 'update'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalDuplicateAction('create_new')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      globalDuplicateAction === 'create_new'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Create as New
                  </button>
                </div>
              </div>
            )}

            {/* Search Filter */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by name, category, SKU..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-[#EADBDA] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#EADBDA] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={summary.selectedCount > 0 && summary.selectedCount === summary.total - summary.invalid}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded text-[#831843] focus:ring-[#831843]"
                      />
                    </th>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Status &amp; Action</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Variants</th>
                    <th className="py-3 px-3">Image</th>
                    <th className="py-3 px-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedItems.map((item) => (
                    <tr
                      key={item.rowNumber}
                      className={`hover:bg-[#FAF8F5]/60 transition-colors ${
                        !item.selected ? 'opacity-60 bg-gray-50/40' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={item.status === 'invalid'}
                          onChange={() => handleToggleRowSelect(item.rowNumber)}
                          className="rounded text-[#831843] focus:ring-[#831843] disabled:opacity-30"
                        />
                      </td>

                      {/* Row Number */}
                      <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                        {item.rowNumber}
                      </td>

                      {/* Status & Duplicate Action */}
                      <td className="py-3 px-4 min-w-[160px]">
                        {item.status === 'valid_new' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            New Item
                          </span>
                        )}

                        {item.status === 'duplicate' && (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Matches {item.duplicateMatchType === 'sku' ? `SKU` : `Name`}
                            </span>
                            <div className="text-[10px] text-gray-500 truncate max-w-[140px]" title={item.duplicateMatchName}>
                              vs: <strong>{item.duplicateMatchName}</strong>
                            </div>
                            {/* Action selector */}
                            <select
                              value={item.duplicateAction}
                              onChange={(e) =>
                                handleRowDuplicateActionChange(
                                  item.rowNumber,
                                  e.target.value as DuplicateResolutionAction
                                )
                              }
                              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#831843]"
                            >
                              <option value="skip">Skip Existing</option>
                              <option value="update">Update Existing</option>
                              <option value="create_new">Create as New</option>
                            </select>
                          </div>
                        )}

                        {item.status === 'invalid' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              Invalid
                            </span>
                            {item.errors.map((err, i) => (
                              <p key={i} className="text-[10px] text-rose-600 leading-tight">
                                • {err}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Product Details */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-gray-900 truncate" title={item.name}>
                          {item.name || <span className="text-rose-500 italic">Missing name</span>}
                        </div>
                        {item.sku && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px]">
                            SKU: {item.sku}
                          </span>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 block">
                          {item.categoryName}
                        </span>
                        {item.isNewCategory && (
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                            + New Category
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-gray-900">
                          {item.price > 0 ? `₹${item.price}` : <span className="text-rose-500">Invalid</span>}
                        </div>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ₹{item.oldPrice}
                          </div>
                        )}
                      </td>

                      {/* Variant Options */}
                      <td className="py-3 px-3">
                        {item.weightOptions && item.weightOptions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[120px]">
                            {item.weightOptions.map((opt, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px]"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3 px-3">
                        {item.images.length > 0 ? (
                          <div className="relative group">
                            <img
                              src={item.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200';
                              }}
                            />
                            {item.images.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[9px] px-1 rounded-full font-bold">
                                +{item.images.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Availability */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.available ? (
                          <span className="text-emerald-700 font-bold text-[11px]">In Stock</span>
                        ) : (
                          <span className="text-gray-400 font-semibold text-[11px]">Out of Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Execution Bar */}
          <div className="sticky bottom-4 inset-x-0 bg-white/98 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#EADBDA] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#831843] text-white flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Ready to import <strong className="text-[#831843]">{summary.selectedCount}</strong> products
                </p>
                <p className="text-[11px] text-gray-500">
                  {parsedItems.filter((i) => i.selected && i.status === 'valid_new').length} new •{' '}
                  {parsedItems.filter((i) => i.selected && i.status === 'duplicate' && i.duplicateAction === 'update').length} updates •{' '}
                  {parsedItems.filter((i) => i.selected && i.status === 'duplicate' && i.duplicateAction === 'create_new').length} clones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetParsedData}
                disabled={isImporting}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isImporting || summary.selectedCount === 0}
                className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Execute Menu Import ({summary.selectedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Import History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADBDA] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#831843]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
              Menu Import Audit History
            </h2>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            disabled={loadingHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="font-medium">No previous menu imports recorded.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Completed menu imports will appear here with execution timestamps and summaries.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-[#EADBDA]">
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3 text-emerald-700">Created</th>
                  <th className="py-2.5 px-3 text-blue-700">Updated</th>
                  <th className="py-2.5 px-3 text-purple-700">Categories</th>
                  <th className="py-2.5 px-3 text-gray-500">Skipped</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap text-gray-800 font-medium">
                      {new Date(record.importedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900 truncate max-w-xs">
                      {record.fileName}
                    </td>
                    <td className="py-3 px-3 uppercase font-mono text-[10px] text-gray-500">
                      {record.fileFormat}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      +{record.createdCount}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-700">
                      {record.updatedCount}
                    </td>
                    <td className="py-3 px-3 font-bold text-purple-700">
                      +{record.categoriesCreatedCount}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {record.skippedCount}
                    </td>
                    <td className="py-3 px-3">
                      {record.errors && record.errors.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" /> Errors
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
