(() => {
  "use strict";

  const STORAGE = {
    data: "clothing-pos.data.v2",
    products: "clothing-pos.products.v1",
    sales: "clothing-pos.sales.v1",
    settings: "clothing-pos.settings.v1",
    theme: "clothing-pos.theme.v1",
    session: "clothing-pos.session.v1",
    expenses: "clothing-pos.expenses.v1",
    payments: "clothing-pos.payments.v1",
    customers: "clothing-pos.customers.v1"
  };
  const IDB_NAME = "clothing-pos-db";
  const IDB_STORE = "kv";
  const PRODUCT_PAGE_SIZE = 48;
  const SALE_PAGE_SIZE = 70;
  const PRODUCT_IMAGE_MAX_SIZE = 720;
  const PRODUCT_IMAGE_QUALITY = 0.72;

  const navItems = [
    { id: "dashboard", title: "الرئيسية", icon: "ر" },
    { id: "products", title: "الأصناف", icon: "ص" },
    { id: "sale", title: "البيع", icon: "ب" },
    { id: "customers", title: "العملاء", icon: "ك" },
    { id: "invoices", title: "الفواتير", icon: "ف" },
    { id: "expenses", title: "المصروفات", icon: "م" },
    { id: "reports", title: "التقارير", icon: "ت" },
    { id: "settings", title: "الإعدادات", icon: "ع" }
  ];

  const navIcons = {
    dashboard: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    products: `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
    sale: `<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>`,
    customers: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    invoices: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
    expenses: `<path d="M4 2h16v20l-3-2-3 2-3-2-3 2-4-2V2z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/>`,
    reports: `<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>`,
    settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`
  };

  function navIconSvg(id) {
    return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${navIcons[id] || ""}</svg>`;
  }

  const state = {
    view: "dashboard",
    products: [],
    sales: [],
    expenses: [],
    payments: [],
    customers: [],
    settings: {},
    cart: [],
    search: "",
    category: "الكل",
    currentInvoiceId: null,
    deferredInstallPrompt: null,
    report: { type: "summary" },
    _reportCategory: "الكل",
    _reportPayment: "الكل",
    _reportCustomer: "الكل",
    _reportQuery: "",
    _custQuery: "",
    _custView: "cards",
    _custSort: "total",
    _custOpen: "",
    _productView: "grid",
    _saleView: "list",
    _invoiceView: "list",
    _saleCustomerName: "",
    _saleCustomerPhone: "",
    _saleDiscount: 0,
    _saleShipping: 0,
    _salePayment: "نقدا",
    _saleTaxFree: false,
    _productDisplayLimit: PRODUCT_PAGE_SIZE,
    _saleDisplayLimit: SALE_PAGE_SIZE,
    _returnSel: {},
    _expQuery: "",
    _expFrom: "",
    _expTo: "",
    allowExit: false
  };

  const reportTypes = [
    { id: "summary", label: "ملخص شامل", desc: "المبيعات والأرباح والنسب", icon: "📊" },
    { id: "hourly", label: "ساعات الذروة", desc: "توزيع المبيعات على الساعات", icon: "🕐" },
    { id: "product-profit", label: "ربحية الأصناف", desc: "صافي الربح وهامش كل صنف مباع", icon: "💎" },
    { id: "customers", label: "العملاء الأكثر شراءً", desc: "عدد الفواتير وقيمة مشتريات كل عميل", icon: "👥" },
    { id: "inventory", label: "تقرير المخزون", desc: "الكميات والقيم وحالة الأصناف", icon: "📦" },
    { id: "margins", label: "هوامش الربح", desc: "نسبة الربح لكل فئة", icon: "📈" },
    { id: "categories", label: "مبيعات الفئات", desc: "توزيع الإيراد على فئات الملابس", icon: "🏷️" },
    { id: "top", label: "الأكثر مبيعاً", desc: "ترتيب الأصناف حسب الكمية المباعة", icon: "🏆" },
    { id: "payments", label: "طرق الدفع", desc: "الإيراد وعدد الفواتير لكل طريقة دفع", icon: "💳" },
    { id: "pl", label: "الأرباح والخسائر", desc: "الدخل والمصروفات وصافي الربح", icon: "📋" },
    { id: "lowstock", label: "تنبيهات المخزون", desc: "الأصناف التي تجاوزت حد التنبيه", icon: "⚠️" }
  ];

  const app = document.getElementById("app");
  const viewTitle = document.getElementById("viewTitle");
  const sideNav = document.getElementById("sideNav");
  const bottomNav = document.getElementById("bottomNav");
  const productDialog = document.getElementById("productDialog");
  const productForm = document.getElementById("productForm");
  const invoiceDialog = document.getElementById("invoiceDialog");
  const invoicePrintArea = document.getElementById("invoicePrintArea");
  const returnDialog = document.getElementById("returnDialog");
  const returnItemsList = document.getElementById("returnItemsList");
  const confirmDialog = document.getElementById("confirmDialog");
  const paymentDialog = document.getElementById("paymentDialog");
  const customerDialog = document.getElementById("customerDialog");
  const toast = document.getElementById("toast");
  const imagePreviewDialog = document.getElementById("imagePreviewDialog");

  const moneyFormatter = new Intl.NumberFormat("ar-EG-u-nu-latn", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function seedProducts() {
    return [
      productSeed("فستان وردي طويل", "DR-1201", "نسائي", "M", "وردي", 899, 520, 8, 3, "assets/catalog-preview.png"),
      productSeed("قميص أبيض كلاسيكي", "SH-2104", "نسائي", "L", "أبيض", 449, 230, 14, 4, "assets/catalog-preview.png"),
      productSeed("جاكيت مبطن كحلي", "JK-3341", "رجالي", "XL", "كحلي", 1299, 780, 3, 4, "assets/catalog-preview.png"),
      productSeed("بنطال جينز مستقيم", "JN-5088", "رجالي", "32", "أزرق", 699, 390, 11, 3, "assets/product-form-preview.png"),
      productSeed("بلوزة حرير كورال", "BL-4022", "نسائي", "S", "كورال", 579, 310, 5, 3, "assets/product-form-preview.png"),
      productSeed("تيشيرت أطفال أخضر", "KD-7750", "أطفال", "8 سنوات", "أخضر", 249, 120, 2, 5, "assets/catalog-preview.png"),
      productSeed("حزام جلد ذهبي", "AC-1802", "إكسسوارات", "موحد", "ذهبي", 199, 80, 18, 5, "assets/invoice-preview.png"),
      productSeed("وشاح ستان مطبوع", "AC-2250", "إكسسوارات", "موحد", "متعدد", 289, 135, 7, 4, "assets/reports-preview.png")
    ];
  }

  function productSeed(name, sku, category, size, color, price, cost, quantity, lowStock, image) {
    return {
      id: cryptoRandomId("p"),
      name,
      sku,
      category,
      size,
      color,
      price,
      cost,
      quantity,
      lowStock,
      image
    };
  }

  function defaultSettings() {
    return {
      storeName: "Abo Omar Store",
      currency: "ج.م",
      taxRate: 14,
      invoiceFooter: "شكرا لزيارتكم Abo Omar Store. الاستبدال خلال 7 أيام مع الفاتورة.",
      invoiceTemplate: "classic",
      accent: "#0e5349",
      docColor: "#075E54",
      logo: "assets/icon-192.png",
      companyPhone: "",
      companyAddress: "",
      taxNumber: "",
      commercialNumber: "",
      allowTaxFree: false,
      showInvoiceQr: true,
      customerCodePrefix: "CUST"
    };
  }

  async function init() {
    initTheme();
    await loadStateFromIdb();
    syncCustomerRegistry();
    await Promise.resolve(saveAll());
    if (/[?&]demo=1(&|$)/.test(location.search)) seedDemoData();
    applySettings();
    loadSession();
    state.view = viewFromHash() || "dashboard";
    if (!viewFromHash()) {
      try {
        history.replaceState(null, "", "#/dashboard");
      } catch (error) {
        /* file:// environments without history support fall back to plain rendering */
      }
    }
    renderNav();
    bindGlobalEvents();
    render();
    registerServiceWorker();
    updateConnection();
    refreshStorageEstimate();
    scheduleAutoBackup();
    setTimeout(checkForUpdates, 5000);
    setTimeout(checkLowStockAlerts, 2000);
  }

  async function loadStateFromIdb() {
    let data = null;
    const legacyKeys = [STORAGE.products, STORAGE.sales, STORAGE.settings];
    const legacyExists = legacyKeys.some(key => {
      try { return localStorage.getItem(key) !== null; } catch (error) { return false; }
    });
    if (typeof indexedDB !== "undefined") {
      try {
        data = await idbGet(STORAGE.data);
      } catch (error) {
        data = null;
      }
    }
    if (data && Array.isArray(data.products) && Array.isArray(data.sales)) {
      state.products = data.products;
      state.sales = data.sales;
      state.settings = data.settings || {};
      state.expenses = Array.isArray(data.expenses) ? data.expenses : [];
      state.payments = Array.isArray(data.payments) ? data.payments : [];
      state.customers = Array.isArray(data.customers) ? data.customers : [];
    } else if (legacyExists) {
      const storedProducts = readStorage(STORAGE.products, null);
      state.products = storedProducts !== null ? storedProducts : seedProducts();
      state.sales = readStorage(STORAGE.sales, []);
      state.settings = readStorage(STORAGE.settings, null) || defaultSettings();
      state.expenses = readStorage(STORAGE.expenses, []);
      state.payments = readStorage(STORAGE.payments, []);
      state.customers = readStorage(STORAGE.customers, []);
      try {
        await idbSet(STORAGE.data, {
          products: state.products,
          sales: state.sales,
          settings: state.settings,
          expenses: state.expenses,
          payments: state.payments,
          customers: state.customers
        });
        legacyKeys.forEach(key => {
          try { localStorage.removeItem(key); } catch (error) { /* ignore */ }
        });
      } catch (error) {
        /* keep legacy localStorage copies when IndexedDB is unavailable */
      }
    } else {
      state.products = seedProducts();
      state.sales = [];
      state.settings = defaultSettings();
    }
    if (state.settings.storeName === "خيط بوتيك") {
      state.settings.storeName = "Abo Omar Store";
      if (!state.settings.logo) state.settings.logo = "assets/icon-192.png";
    }
    if (state.settings.currency === "ر.س") {
      state.settings.currency = "ج.م";
    }
    if (state.settings.taxRate === 15) {
      state.settings.taxRate = 14;
    }
    state.settings = { ...defaultSettings(), ...state.settings };
    state.expenses = Array.isArray(state.expenses) ? state.expenses : [];
    state.payments = Array.isArray(state.payments) ? state.payments : [];
    state.customers = Array.isArray(state.customers) ? state.customers : [];
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE.theme) || "light";
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    const btn = document.getElementById("themeToggleBtn");
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (btn) { btn.textContent = "☀️"; btn.title = "التبديل للوضع الفاتح"; }
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (btn) { btn.textContent = "🌙"; btn.title = "التبديل للوضع الداكن"; }
    }
    localStorage.setItem(STORAGE.theme, theme);
    applyAccent();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    toastMessage(next === "dark" ? "تم التبديل إلى الوضع الداكن 🌙" : "تم التبديل إلى الوضع الفاتح ☀️");
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function storageUsedBytes() {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key);
        bytes += (key.length + (value ? value.length : 0)) * 2;
      }
    } catch (error) {
      /* ignore */
    }
    return bytes;
  }

  let storageQuotaCache = null;
  function storageQuotaBytes() {
    if (storageQuotaCache !== null) return storageQuotaCache;
    const probeKey = "__clothing_pos_quota_probe__";
    const usedBefore = storageUsedBytes();
    let total = Math.max(5 * 1024 * 1024, usedBefore + 256 * 1024);
    try {
      let size = 128 * 1024;
      let last = 0;
      while (size <= 64 * 1024 * 1024) {
        localStorage.setItem(probeKey, "x".repeat(size));
        last = size;
        size *= 2;
      }
      if (last > 0) total = usedBefore + last;
    } catch (error) {
      /* keep fallback estimate */
    } finally {
      try { localStorage.removeItem(probeKey); } catch (error) { /* ignore */ }
    }
    storageQuotaCache = total;
    return storageQuotaCache;
  }

  let idbPromise = null;
  function idbOpen() {
    if (idbPromise) return idbPromise;
    idbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(IDB_STORE)) {
          request.result.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return idbPromise;
  }

  function idbGet(key) {
    return idbOpen().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const request = tx.objectStore(IDB_STORE).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }));
  }

  function idbSet(key, value) {
    return idbOpen().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    }));
  }

  let storageEstimateCache = null;
  function storageEstimate() {
    if (storageEstimateCache) return storageEstimateCache;
    if (!navigator.storage || !navigator.storage.estimate) {
      storageEstimateCache = { used: storageUsedBytes(), quota: storageQuotaBytes() };
      return storageEstimateCache;
    }
    navigator.storage.estimate().then(result => {
      storageEstimateCache = { used: result.usage || 0, quota: result.quota || 0 };
    }).catch(() => {
      storageEstimateCache = { used: storageUsedBytes(), quota: storageQuotaBytes() };
    });
    storageEstimateCache = { used: storageUsedBytes(), quota: storageQuotaBytes() };
    return storageEstimateCache;
  }

  async function refreshStorageEstimate() {
    if (!navigator.storage || !navigator.storage.estimate) {
      storageEstimateCache = { used: storageUsedBytes(), quota: storageQuotaBytes() };
      return storageEstimateCache;
    }
    try {
      const result = await navigator.storage.estimate();
      storageEstimateCache = { used: result.usage || 0, quota: result.quota || 0 };
    } catch (error) {
      storageEstimateCache = { used: storageUsedBytes(), quota: storageQuotaBytes() };
    }
    return storageEstimateCache;
  }

  function storagePercent() {
    const estimate = storageEstimate();
    return estimate.quota > 0 ? Math.round((estimate.used / estimate.quota) * 100) : 0;
  }

  function commitState(next) {
    const candidates = {
      products: next.products !== undefined ? next.products : state.products,
      sales: next.sales !== undefined ? next.sales : state.sales,
      settings: next.settings !== undefined ? next.settings : state.settings,
      expenses: next.expenses !== undefined ? next.expenses : state.expenses,
      payments: next.payments !== undefined ? next.payments : state.payments,
      customers: next.customers !== undefined ? next.customers : state.customers
    };
    const payload = {
      products: candidates.products,
      sales: candidates.sales,
      settings: candidates.settings,
      expenses: candidates.expenses,
      payments: candidates.payments,
      customers: candidates.customers
    };
    if (typeof indexedDB !== "undefined") {
      return idbSet(STORAGE.data, payload).then(() => {
        state.products = candidates.products;
        state.sales = candidates.sales;
        state.settings = candidates.settings;
        state.expenses = candidates.expenses;
        state.payments = candidates.payments;
        state.customers = candidates.customers;
        return true;
      }).catch(error => {
        console.error("Storage save failed:", error);
        return false;
      });
    }
    try {
      localStorage.setItem(STORAGE.products, JSON.stringify(candidates.products));
      localStorage.setItem(STORAGE.sales, JSON.stringify(candidates.sales));
      localStorage.setItem(STORAGE.settings, JSON.stringify(candidates.settings));
      localStorage.setItem(STORAGE.expenses, JSON.stringify(candidates.expenses));
      localStorage.setItem(STORAGE.payments, JSON.stringify(candidates.payments));
      localStorage.setItem(STORAGE.customers, JSON.stringify(candidates.customers));
    } catch (error) {
      console.error("Storage save failed:", error);
      return false;
    }
    state.products = candidates.products;
    state.sales = candidates.sales;
    state.settings = candidates.settings;
    state.expenses = candidates.expenses;
    state.payments = candidates.payments;
    state.customers = candidates.customers;
    getFilteredSales.invalidate();
    _renderDirty = true;
    return true;
  }

  function saveAll() {
    return Promise.resolve(commitState({})).then(ok => {
      if (ok) return true;
      if (toast) toastMessage("تعذر حفظ البيانات. قلل حجم الصور أو صدر نسخة احتياطية ثم أعد المحاولة.");
      return false;
    }).catch(() => false);
  }

  function saleItemImage(item) {
    if (item.image) return item.image;
    const product = state.products.find(productItem => productItem.id === item.productId);
    return product && product.image ? product.image : "";
  }

  async function showStorageFullDialog() {
    const percent = storagePercent();
    const doExport = await confirmDialogPrompt(
      "مساحة التخزين ممتلئة",
      `تعذر حفظ التغييرات لأن مساحة التخزين على هذا الجهاز ممتلئة${percent ? ` (تقريباً ${percent}% مستخدمة)` : ""}.\n\nالحلول:\n• صدّر نسخة احتياطية (JSON) فوراً للحفاظ على بياناتك.\n• احذف صوراً أو أصنافاً قديمة لتقليل الحجم.\n\nلم يتم حفظ أي تغييرات حتى الآن.`,
      "صدّر نسخة احتياطية"
    );
    if (doExport) exportBackup();
  }

  function formatBytesNice(bytes) {
    const safe = Math.max(0, Number(bytes) || 0);
    const mb = safe / (1024 * 1024);
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} ج.ب`;
    if (mb >= 1) return `${mb.toFixed(1)} م.ب`;
    return `${Math.max(1, Math.round(safe / 1024))} ك.ب`;
  }

  function storageLevel(percent) {
    if (percent >= 85) return { cls: "danger", label: "حرجة" };
    if (percent >= 70) return { cls: "warn", label: "متوسطة" };
    return { cls: "ok", label: "واسعة" };
  }

  function storageMeterHtml() {
    const estimate = storageEstimate();
    const total = estimate.quota;
    const used = estimate.used;
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const free = Math.max(0, total - used);
    const level = storageLevel(percent);
    const danger = percent >= 85;
    const warning = percent >= 70 && percent < 85;
    return `
      <div class="storage-meter ${danger ? "danger" : warning ? "warn" : ""}" id="storageMeter">
        <div class="storage-meter-head">
          <strong>مساحة التخزين</strong>
          <span class="status-pill sm-${level.cls}">${level.label}</span>
        </div>
        <div class="storage-meter-free">
          <span>المساحة المتبقية</span>
          <strong>${formatBytesNice(free)}</strong>
        </div>
        <div class="storage-meter-detail">المستخدم <strong>${formatBytesNice(used)}</strong> من <strong>${formatBytesNice(total)}</strong> (${percent}%)</div>
        <div class="storage-meter-track"><div class="storage-meter-fill" style="width:${percent}%"></div></div>
        ${danger
          ? `<p class="muted" style="color:var(--danger);font-weight:800">⚠️ المساحة على وشك الامتلاء — صدّر نسخة احتياطية واحذف الصور القديمة الآن.</p>`
          : warning
            ? `<p class="muted" style="color:var(--warn)">المساحة تمتلئ تدريجياً. يُنصح بتصدير نسخة احتياطية وتقليل حجم الصور.</p>`
            : `<p class="muted">المساحة المتبقية تكفي لتخزين آلاف الأصناف بصورها وفواتيرك. تُحفظ البيانات محلياً على هذا الجهاز وتعمل دون اتصال.</p>`}
      </div>
    `;
  }

  async function refreshStorageMeter() {
    const estimate = await refreshStorageEstimate();
    const meter = document.getElementById("storageMeter");
    if (!meter) return;
    const total = estimate.quota;
    const used = estimate.used;
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const free = Math.max(0, total - used);
    const level = storageLevel(percent);
    const pill = meter.querySelector(".storage-meter-head .status-pill");
    if (pill) {
      pill.textContent = level.label;
      pill.className = `status-pill sm-${level.cls}`;
    }
    const freeEl = meter.querySelector(".storage-meter-free strong");
    if (freeEl) freeEl.textContent = formatBytesNice(free);
    const detail = meter.querySelector(".storage-meter-detail");
    if (detail) detail.innerHTML = `المستخدم <strong>${formatBytesNice(used)}</strong> من <strong>${formatBytesNice(total)}</strong> (${percent}%)`;
    const fill = meter.querySelector(".storage-meter-fill");
    if (fill) fill.style.width = `${percent}%`;
    meter.classList.toggle("danger", percent >= 85);
    meter.classList.toggle("warn", percent >= 70 && percent < 85);
  }

  function saveSession() {
    try {
      localStorage.setItem(STORAGE.session, JSON.stringify({
        cart: state.cart,
        saleCustomerName: state._saleCustomerName,
        saleCustomerPhone: state._saleCustomerPhone,
        saleDiscount: state._saleDiscount,
        saleShipping: state._saleShipping,
        salePayment: state._salePayment,
        saleTaxFree: state._saleTaxFree,
        saleCoupon: state._saleCoupon || "",
        view: state.view,
        custView: state._custView,
        custSort: state._custSort,
        custQuery: state._custQuery,
        search: state.search,
        category: state.category,
        invoiceFilter: state._invoiceFilter || "all",
        showLowStockOnly: !!state._showLowStockOnly,
        productDisplayLimit: state._productDisplayLimit,
        saleDisplayLimit: state._saleDisplayLimit,
        productView: state._productView,
        saleView: state._saleView,
        invoiceView: state._invoiceView
      }));
    } catch (error) {
      /* storage unavailable or full — keep the app running */
    }
  }

  function loadSession() {
    const stored = readStorage(STORAGE.session, null);
    if (!stored || typeof stored !== "object") return false;
    if (Array.isArray(stored.cart)) {
      state.cart = stored.cart
        .filter(item => item && state.products.some(product => product.id === item.productId && !product.archived) && Number(item.qty) > 0)
        .map(item => {
          const product = state.products.find(product => product.id === item.productId);
          return { productId: item.productId, qty: Math.min(Number(item.qty), product.quantity) };
        });
    }
    state._saleCustomerName = stored.saleCustomerName || "";
    state._saleCustomerPhone = stored.saleCustomerPhone || "";
    state._saleDiscount = Math.max(0, Number(stored.saleDiscount || 0));
    state._saleShipping = Math.max(0, Number(stored.saleShipping || 0));
    state._salePayment = ["نقدا", "بطاقة", "تحويل", "مختلط"].includes(stored.salePayment) ? stored.salePayment : "نقدا";
    state._saleTaxFree = !!stored.saleTaxFree;
    state._saleCoupon = stored.saleCoupon || "";
    state._custView = ["cards", "table", "list"].includes(stored.custView) ? stored.custView : "cards";
    state._custSort = ["total", "count", "items", "last", "code", "name"].includes(stored.custSort) ? stored.custSort : "total";
    state._custQuery = stored.custQuery || "";
    state.search = stored.search || "";
    state.category = stored.category || "الكل";
    state._invoiceFilter = stored.invoiceFilter === "today" ? "today" : "all";
    state._showLowStockOnly = !!stored.showLowStockOnly;
    state._productDisplayLimit = Math.max(PRODUCT_PAGE_SIZE, Number(stored.productDisplayLimit || PRODUCT_PAGE_SIZE));
    state._saleDisplayLimit = Math.max(SALE_PAGE_SIZE, Number(stored.saleDisplayLimit || SALE_PAGE_SIZE));
    state._productView = ["grid", "list", "table"].includes(stored.productView) ? stored.productView : "grid";
    state._saleView = ["list", "grid", "compact"].includes(stored.saleView) ? stored.saleView : "list";
    state._invoiceView = ["list", "cards"].includes(stored.invoiceView) ? stored.invoiceView : "list";
    const sessionView = stored.view && navItems.some(nav => nav.id === stored.view) ? stored.view : "";
    state.view = viewFromHash() || sessionView || "dashboard";
    return state.cart.length > 0;
  }

  function applyAccent() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.style.removeProperty("--accent");
    } else {
      document.documentElement.style.setProperty("--accent", state.settings.accent || "#0e5349");
    }
  }

  function applySettings() {
    applyAccent();
    document.getElementById("railStoreName").textContent = state.settings.storeName;
    const mobileStoreName = document.getElementById("mobileStoreName");
    if (mobileStoreName) mobileStoreName.textContent = state.settings.storeName;
    const brandMark = document.querySelector(".brand-mark");
    const mobileBrandLogo = document.getElementById("mobileBrandLogo");
    if (state.settings.logo) {
      brandMark.innerHTML = `<img class="brand-logo" src="${escapeAttr(state.settings.logo)}" alt="شعار">`;
      if (mobileBrandLogo) mobileBrandLogo.src = state.settings.logo;
    } else {
      brandMark.textContent = state.settings.storeName.charAt(0) || "خ";
      if (mobileBrandLogo) mobileBrandLogo.src = "assets/icon-192.png";
    }
  }

  function bindGlobalEvents() {
    sideNav.addEventListener("click", onNavClick);
    bottomNav.addEventListener("click", onNavClick);
    document.getElementById("quickSaleButton").addEventListener("click", () => go("sale"));
    document.getElementById("installButton").addEventListener("click", installApp);
    document.getElementById("mobileInstallButton").addEventListener("click", installApp);
    document.querySelectorAll("[data-close-dialog]").forEach(button => {
      button.addEventListener("click", () => button.closest("dialog").close());
    });
    document.getElementById("cancelExitButton").addEventListener("click", cancelExitApp);
    document.getElementById("confirmExitButton").addEventListener("click", confirmExitApp);

    productForm.addEventListener("submit", saveProductFromForm);
    document.getElementById("productImage").addEventListener("change", previewProductImage);
    document.getElementById("deleteProductButton").addEventListener("click", deleteProductFromForm);
    const imagePreviewZoomBtn = document.getElementById("imagePreviewZoomBtn");
    if (imagePreviewZoomBtn) imagePreviewZoomBtn.addEventListener("click", openFormImagePreview);
    app.addEventListener("click", event => {
      const zoomEl = event.target.closest("[data-product-zoom]");
      if (zoomEl) {
        event.preventDefault();
        openImagePreview(zoomEl.dataset.productZoom);
      }
    });
    const zoomImg = document.getElementById("imageZoomImg");
    zoomImg.addEventListener("load", () => {
      if (imagePreviewDialog.open) resetZoom();
    });
    zoomImg.addEventListener("error", () => {
      if (!zoomImg.src.includes("product-form-preview")) {
        zoomImg.src = "assets/product-form-preview.png";
      }
    });
    const zoomStage = document.getElementById("imageZoomStage");
    zoomStage.addEventListener("wheel", event => {
      event.preventDefault();
      if (zoomImg.clientWidth > 0) {
        zoomAtCursor(zoomState.scale + (event.deltaY < 0 ? 0.25 : -0.25), event.clientX, event.clientY);
      }
    }, { passive: false });
    zoomStage.addEventListener("pointerdown", event => {
      if (zoomState.scale <= 1.01) return;
      zoomState.panning = true;
      zoomState.panStartX = event.clientX;
      zoomState.panStartY = event.clientY;
      zoomState.panStartTx = zoomState.tx;
      zoomState.panStartTy = zoomState.ty;
      zoomImg.classList.add("dragging");
      zoomStage.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    zoomStage.addEventListener("pointermove", event => {
      if (!zoomState.panning) return;
      zoomState.tx = zoomState.panStartTx + (event.clientX - zoomState.panStartX);
      zoomState.ty = zoomState.panStartTy + (event.clientY - zoomState.panStartY);
      applyZoomTransform();
    });
    const endPan = () => {
      zoomState.panning = false;
      zoomImg.classList.remove("dragging");
    };
    zoomStage.addEventListener("pointerup", endPan);
    zoomStage.addEventListener("pointercancel", endPan);
    zoomStage.addEventListener("dblclick", event => {
      if (zoomState.scale > 1.01) resetZoom();
      else zoomAtCursor(3, event.clientX, event.clientY);
    });
    document.getElementById("imageZoomIn").addEventListener("click", () => {
      const rect = zoomStageRect();
      zoomAtCursor(zoomState.scale * 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    document.getElementById("imageZoomOut").addEventListener("click", () => {
      const rect = zoomStageRect();
      zoomAtCursor(zoomState.scale / 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    document.getElementById("imageZoomFit").addEventListener("click", resetZoom);
    imagePreviewDialog.addEventListener("click", event => {
      if (event.target === imagePreviewDialog) imagePreviewDialog.close();
    });
    document.getElementById("shareInvoiceButton").addEventListener("click", shareInvoice);
    document.getElementById("downloadInvoiceButton").addEventListener("click", downloadInvoicePdf);
    document.querySelectorAll("[data-thermal-paper]").forEach(btn => {
      btn.addEventListener("click", () => downloadThermalPdf(btn.dataset.thermalPaper || 80));
    });
    const thermalPreviewBtn = document.getElementById("thermalPreviewToggle");
    if (thermalPreviewBtn) thermalPreviewBtn.addEventListener("click", toggleThermalPreview);
    document.getElementById("returnInvoiceButton").addEventListener("click", openReturnDialog);
    document.getElementById("deleteInvoiceButton").addEventListener("click", deleteInvoice);
    document.getElementById("confirmReturnButton").addEventListener("click", confirmReturn);
    returnDialog.addEventListener("click", event => {
      const inc = event.target.closest("[data-ret-inc]");
      const dec = event.target.closest("[data-ret-dec]");
      if (inc) changeReturnQty(inc.dataset.retInc, 1);
      else if (dec) changeReturnQty(dec.dataset.retDec, -1);
    });
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      updateInstallButtons();
    });
    window.addEventListener("appinstalled", () => {
      updateInstallButtons();
      toastMessage("تم تثبيت التطبيق بنجاح 🎉");
    });
    ["pagehide", "beforeunload", "freeze"].forEach(eventName => {
      window.addEventListener(eventName, saveSession);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveSession();
    });
    updateInstallButtons();
    bindKeyboardShortcuts();
    bindBarcodeScanner();
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function updateInstallButtons() {
    const alreadyInstalled = isStandalone();
    document.getElementById("installButton").hidden = alreadyInstalled;
    document.getElementById("mobileInstallButton").hidden = alreadyInstalled;
  }

  function renderNav() {
    const html = navItems.map(item => `
      <button class="nav-button ${item.id === state.view ? "active" : ""}" data-view="${item.id}" type="button">
        <span class="nav-icon-box">${navIconSvg(item.id)}</span>
        <span class="nav-label">${item.title}</span>
      </button>
    `).join("");
    sideNav.innerHTML = html;
    bottomNav.innerHTML = html;
  }

  function onNavClick(event) {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    go(button.dataset.view);
  }

  function viewFromHash() {
    const raw = location.hash.replace(/^#\/?/, "").trim();
    return navItems.some(nav => nav.id === raw) ? raw : "";
  }

  function go(view) {
    const target = navItems.some(nav => nav.id === view) ? view : "dashboard";
    if (state.view === target) return;
    location.hash = "/" + target;
  }

  function onHashChange() {
    const view = viewFromHash();
    if (!view) {
      if (!state.allowExit) {
        showExitDialog();
        try {
          history.replaceState(null, "", "#/dashboard");
        } catch (error) {
          /* file:// environments fall back to plain rendering */
        }
        return;
      }
      state.allowExit = false;
    }
    if (state.view !== view) {
      state.view = view;
      render();
    }
    app.focus({ preventScroll: true });
  }

  function showExitDialog() {
    const exitDialog = document.getElementById("exitDialog");
    if (exitDialog && !exitDialog.open) exitDialog.showModal();
  }

  function cancelExitApp() {
    const exitDialog = document.getElementById("exitDialog");
    if (exitDialog && exitDialog.open) exitDialog.close();
    state.allowExit = false;
  }

  function confirmExitApp() {
    saveSession();
    const exitDialog = document.getElementById("exitDialog");
    if (exitDialog && exitDialog.open) exitDialog.close();
    state.allowExit = true;
    try {
      history.back();
    } catch (error) {
      /* ignore */
    }
    try {
      window.close();
    } catch (error) {
      /* ignore */
    }
    setTimeout(() => {
      state.allowExit = false;
      if (viewFromHash() === "dashboard") {
        toastMessage("تم حفظ بياناتك بالكامل. يمكنك إغلاق التطبيق الآن.");
      }
    }, 500);
  }

  let _lastRenderHash = "";
  let _renderDirty = true;
  function render() {
    const item = navItems.find(nav => nav.id === state.view) || navItems[0];
    viewTitle.textContent = item.title;
    renderNav();
    const views = {
      dashboard: renderDashboard,
      products: renderProducts,
      sale: renderSale,
      customers: renderCustomers,
      invoices: renderInvoices,
      expenses: renderExpenses,
      reports: renderReports,
      settings: renderSettings
    };
    const hash = [state.view, state.cart.length, state.sales.length, state.products.length, state.search, state.category, state._saleDiscount, state._salePayment, state.currentInvoiceId, state._reportQuery, _renderDirty ? "d" : "c"].join("|");
    if (hash === _lastRenderHash) return;
    _lastRenderHash = hash;
    _renderDirty = false;
    app.innerHTML = `<section class="view fade-in">${views[state.view]()}</section>`;
    wireViewEvents();
    initLazyImages();
  }

  function renderDashboard() {
    const stats = getStats();
    const lowItems = activeProducts().filter(product => product.quantity <= product.lowStock);
    const recentSales = [...state.sales].slice(-3).reverse();
    return `
      <div class="summary-grid">
        ${metric("مبيعات اليوم", formatMoney(stats.todaySales), "انقر لمراجعة فواتير اليوم ↗", "invoices", "today")}
        ${metric("عدد الفواتير", stats.todayInvoices, "انقر لسجل فواتير اليوم ↗", "invoices", "today")}
        ${metric("تنبيهات المخزون", lowItems.length, "انقر لمتابعة الأصناف المنخفضة ↗", "products", "low")}
        ${metric("تقدير الربح", formatMoney(stats.todayProfit), "انقر لتقرير أرباح اليوم ↗", "reports", "today")}
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>تشغيل المتجر</h2>
              <p class="muted">الوصول السريع للبيع وإدارة الأصناف من شاشة واحدة.</p>
            </div>
            <button class="primary" data-go="sale" type="button">فتح البيع</button>
          </div>
          <div class="visual-strip">
            <figure>
              <img src="assets/catalog-preview.png" alt="واجهة كتالوج الملابس">
              <figcaption>كتالوج بصور واضحة وسرعة بحث للفئات والمقاسات.</figcaption>
            </figure>
            <figure>
              <img src="assets/invoice-preview.png" alt="نموذج فاتورة بوتيك">
              <figcaption>فاتورة مرتبة ببيانات العميل والمدفوعات وكود بصري.</figcaption>
            </figure>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <h2>متابعة عاجلة</h2>
            <button class="ghost" data-go="products" type="button">إدارة الأصناف</button>
          </div>
          ${lowItems.length ? compactList(lowItems, product => `
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <p class="muted">المتبقي ${product.quantity} قطعة، حد التنبيه ${product.lowStock}</p>
            </div>
            <span class="status-pill low">مخزون منخفض</span>
          `) : `<div class="empty">كل الأصناف فوق حد التنبيه حاليا.</div>`}
          <div class="panel-head" style="margin-top:18px">
            <h2>آخر الفواتير</h2>
          </div>
          ${recentSales.length ? recentSales.map(invoiceRow).join("") : `<div class="empty">لا توجد فواتير بعد. ابدأ من تبويب البيع.</div>`}
        </section>
      </div>
    `;
  }

  function metric(label, value, hint, view, filterAction) {
    const clickableClass = view ? "clickable" : "";
    const datasetAttr = view ? `data-drill-view="${view}" data-drill-filter="${filterAction || ''}"` : "";
    return `<article class="metric ${clickableClass}" ${datasetAttr}><span>${label}</span><strong>${value}</strong><small>${hint}</small></article>`;
  }

  function renderProducts() {
    let products = filteredProducts();
    const isLowOnly = state._showLowStockOnly;
    if (isLowOnly) {
      products = products.filter(p => p.quantity <= p.lowStock);
    }
    return `
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>كتالوج الأصناف ${isLowOnly ? "(أصناف منخفضة المخزون فقط)" : ""}</h2>
            <p class="muted">${isLowOnly ? "تتبع وتعديل الأصناف التي تجاوزت حد التنبيه." : "أضف صور المنتجات، وعدل السعر والكمية وحد التنبيه."}</p>
          </div>
          <div class="inline-actions">
            ${isLowOnly ? `<button class="ghost" id="clearLowStockFilterBtn" type="button">عرض كل الأصناف (${activeProducts().length})</button>` : ""}
            <div class="view-switch" role="tablist" aria-label="طريقة عرض الأصناف">
              <button class="view-switch-btn ${state._productView === "grid" ? "active" : ""}" data-product-view="grid" type="button">بطاقات</button>
              <button class="view-switch-btn ${state._productView === "list" ? "active" : ""}" data-product-view="list" type="button">قائمة</button>
              <button class="view-switch-btn ${state._productView === "table" ? "active" : ""}" data-product-view="table" type="button">جدول</button>
            </div>
            <button class="primary" id="addProductButton" type="button">إضافة صنف</button>
          </div>
        </div>
        ${filtersHtml()}
      </section>
      ${products.length ? pagedProductBody(products) : emptyProductsHtml()}
    `;
  }

  function filtersHtml() {
    return `
      <div class="filters">
        <input class="search" id="productSearch" value="${escapeAttr(state.search)}" placeholder="ابحث بالاسم أو SKU أو اللون">
        <select id="categoryFilter">
          ${["الكل", "نسائي", "رجالي", "أطفال", "إكسسوارات"].map(category => `
            <option ${category === state.category ? "selected" : ""}>${category}</option>
          `).join("")}
        </select>
        <button class="ghost" id="clearFiltersButton" type="button">مسح</button>
      </div>
    `;
  }

  function emptyProductsHtml() {
    return `
      <div class="empty">
        لا توجد أصناف مطابقة. يمكنك مسح البحث أو إضافة صنف جديد مع صورة وسعر ومخزون.
      </div>
    `;
  }

  function filteredProducts() {
    const query = state.search.trim().toLowerCase();
    return activeProducts().filter(product => {
      const matchesCategory = state.category === "الكل" || product.category === state.category;
      const text = `${product.name} ${product.sku} ${product.color} ${product.size}`.toLowerCase();
      return matchesCategory && (!query || text.includes(query));
    });
  }

  function activeProducts() {
    return state.products.filter(product => !product.archived);
  }

  function pagedProductBody(products) {
    const limit = Math.max(PRODUCT_PAGE_SIZE, Number(state._productDisplayLimit || PRODUCT_PAGE_SIZE));
    const visible = products.slice(0, limit);
    const hiddenCount = Math.max(0, products.length - visible.length);
    return `
      <div class="result-summary">
        <strong>${visible.length}</strong>
        <span>من ${products.length} صنف مطابق</span>
      </div>
      ${productViewBody(visible)}
      ${hiddenCount ? `<button class="ghost action-wide" id="showMoreProductsButton" type="button">عرض ${Math.min(PRODUCT_PAGE_SIZE, hiddenCount)} صنف إضافي</button>` : ""}
    `;
  }

  function productViewBody(products) {
    const view = state._productView || "grid";
    if (view === "table") return `<div class="scrollable-table view-content">${productsTable(products)}</div>`;
    if (view === "list") return `<div class="product-list view-content">${products.map(productListRow).join("")}</div>`;
    return `<div class="product-grid view-content">${products.map(productCard).join("")}</div>`;
  }

  function productListRow(product) {
    const low = product.quantity <= product.lowStock;
    return `
      <article class="product-list-row">
        <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" data-product-zoom="${product.id}" title="معاينة الصورة">
        <div class="product-list-info">
          <strong>${escapeHtml(product.name)}</strong>
          <p class="muted">${escapeHtml(product.sku)} · ${escapeHtml(product.category)} · مقاس ${escapeHtml(product.size)} · ${escapeHtml(product.color)}</p>
        </div>
        <strong class="product-list-price">${formatMoney(product.price)}</strong>
        <span class="status-pill ${low ? "low" : "ok"}">${low ? "منخفض" : "متاح"} · ${product.quantity}</span>
        <div class="inline-actions">
          <button class="ghost" data-edit-product="${product.id}" type="button">تعديل</button>
          <button class="primary" data-add-cart="${product.id}" type="button" ${product.quantity <= 0 ? "disabled" : ""}>إضافة للبيع</button>
        </div>
      </article>
    `;
  }

  function productsTable(products) {
    return `<table class="report-table">
      <thead><tr><th>الصنف</th><th>SKU</th><th>الفئة</th><th>السعر</th><th>الكمية</th><th>الحالة</th><th>إجراء</th></tr></thead>
      <tbody>${products.map(p => `<tr>
        <td><span class="cust-cell"><img class="cell-thumb" src="${escapeAttr(p.image)}" alt="" data-product-zoom="${p.id}" title="معاينة الصورة">${escapeHtml(p.name)}</span></td>
        <td>${escapeHtml(p.sku)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${formatMoney(p.price)}</td>
        <td>${p.quantity}</td>
        <td><span class="status-pill ${p.quantity <= p.lowStock ? "low" : "ok"}">${p.quantity <= p.lowStock ? "منخفض" : "متاح"}</span></td>
        <td><button class="ghost" data-edit-product="${p.id}" type="button">تعديل</button></td>
      </tr>`).join("")}</tbody>
    </table>`;
  }

  function productCard(product) {
    const low = product.quantity <= product.lowStock;
    return `
      <article class="product-card">
        <div class="product-image" data-product-zoom="${product.id}" title="معاينة الصورة">
          <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}">
        </div>
        <div class="product-body">
          <div class="product-title">
            <h3>${escapeHtml(product.name)}</h3>
            <strong>${formatMoney(product.price)}</strong>
          </div>
          <div class="inline-actions">
            <span class="sku">${escapeHtml(product.sku)}</span>
            <span class="tag">${escapeHtml(product.category)}</span>
            <span class="status-pill ${low ? "low" : "ok"}">${low ? "منخفض" : "متاح"}</span>
          </div>
          <p class="muted">مقاس ${escapeHtml(product.size)}، لون ${escapeHtml(product.color)}، الكمية ${product.quantity}</p>
          <div class="inline-actions">
            <button class="ghost" data-edit-product="${product.id}" type="button">تعديل</button>
            <button class="primary" data-add-cart="${product.id}" type="button" ${product.quantity <= 0 ? "disabled" : ""}>إضافة للبيع</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderSale() {
    const products = filteredProducts().filter(product => product.quantity > 0);
    const limit = Math.max(SALE_PAGE_SIZE, Number(state._saleDisplayLimit || SALE_PAGE_SIZE));
    const visibleProducts = products.slice(0, limit);
    const hiddenCount = Math.max(0, products.length - visibleProducts.length);
    return `
      <div class="sale-grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>اختيار الأصناف</h2>
              <p class="muted">ابحث بسرعة وأضف للفاتورة الحالية.</p>
            </div>
            <div class="view-switch" role="tablist" aria-label="طريقة عرض أصناف البيع">
              <button class="view-switch-btn ${state._saleView === "list" ? "active" : ""}" data-sale-view="list" type="button">قائمة</button>
              <button class="view-switch-btn ${state._saleView === "grid" ? "active" : ""}" data-sale-view="grid" type="button">شبكة</button>
              <button class="view-switch-btn ${state._saleView === "compact" ? "active" : ""}" data-sale-view="compact" type="button">مدمجة</button>
            </div>
          </div>
          ${filtersHtml()}
          <div class="result-summary">
            <strong>${visibleProducts.length}</strong>
            <span>من ${products.length} صنف متاح للبيع</span>
          </div>
          ${visibleProducts.length ? saleProductBody(visibleProducts) : `<div class="empty">لا توجد أصناف متاحة للبيع بهذا البحث.</div>`}
          ${hiddenCount ? `<button class="ghost action-wide" id="showMoreSaleProductsButton" type="button">عرض ${Math.min(SALE_PAGE_SIZE, hiddenCount)} صنف إضافي</button>` : ""}
        </section>
        <aside class="cart-panel">
          <h2>سلة البيع</h2>
          <div class="cart-lines">${cartLinesHtml()}</div>
          <div class="customer-grid">
            <label>اسم العميل <input id="customerName" list="customerDatalist" value="${escapeAttr(state._saleCustomerName)}" placeholder="عميل نقدي"></label>
            <datalist id="customerDatalist">${state.customers.map(item => `<option value="${escapeAttr(item.name)}">${escapeAttr(item.code)}</option>`).join("")}</datalist>
            <label>هاتف العميل <input id="customerPhone" value="${escapeAttr(state._saleCustomerPhone)}" inputmode="tel" placeholder="اختياري"></label>
            <div class="two">
              <label>خصم <input id="discountAmount" min="0" step="0.01" type="number" value="${state._saleDiscount || 0}"></label>
              <label>مصاريف الشحن <input id="shippingAmount" min="0" step="0.01" type="number" value="${state._saleShipping || 0}"></label>
            </div>
            <div class="two">
              <label>كود الخصم <input id="couponInput" value="${escapeAttr(state._saleCoupon || '')}" placeholder="أدخل كود الخصم"></label>
              <button class="ghost" id="applyCouponBtn" type="button" style="align-self:end;margin-bottom:4px">تطبيق</button>
            </div>
            <label>طريقة الدفع
              <select id="paymentMethod">
                <option${state._salePayment === "نقدا" ? " selected" : ""}>نقدا</option>
                <option${state._salePayment === "بطاقة" ? " selected" : ""}>بطاقة</option>
                <option${state._salePayment === "تحويل" ? " selected" : ""}>تحويل</option>
                <option${state._salePayment === "مختلط" ? " selected" : ""}>مختلط</option>
                <option${state._salePayment === "آجل" ? " selected" : ""}>آجل</option>
              </select>
            </label>
            <p class="muted" id="creditHint" style="${state._salePayment === "آجل" ? "" : "display:none"}">يُسجل المبلغ ديناً على العميل ويُخصم من المخزون فوراً. يُلزم إدخال اسم العميل.</p>
            ${state.settings.allowTaxFree ? `<label class="check-line" style="margin-top:4px">
              <input id="taxFreeToggle" type="checkbox"${state._saleTaxFree ? " checked" : ""}>
              <span>
                <strong>بدون ضريبة لهذه الفاتورة</strong>
                <small>يُصدر الإجمالي دون احتساب الضريبة ${state.settings.taxRate}%.</small>
              </span>
            </label>` : ""}
          </div>
          ${cartTotalsHtml(state._saleDiscount, state._saleShipping, state._saleTaxFree)}
          <button class="primary action-wide" id="checkoutButton" type="button">إصدار الفاتورة</button>
        </aside>
      </div>
    `;
  }

  function saleProductRow(product) {
    return `
      <article class="sale-product">
        <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" data-product-zoom="${product.id}" title="معاينة الصورة">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <p class="muted">${escapeHtml(product.sku)} · ${escapeHtml(product.size)} · متاح ${product.quantity}</p>
        </div>
        <button class="primary" data-add-cart="${product.id}" type="button">إضافة</button>
      </article>
    `;
  }

  function saleProductBody(products) {
    const view = state._saleView || "list";
    if (view === "grid") return `<div class="product-grid sale-grid view-content">${products.map(saleProductCard).join("")}</div>`;
    if (view === "compact") return `<div class="sale-compact view-content">${products.map(saleCompactRow).join("")}</div>`;
    return `<div class="sale-list view-content" style="margin-top:12px">${products.map(saleProductRow).join("")}</div>`;
  }

  function saleProductCard(product) {
    const low = product.quantity <= product.lowStock;
    return `
      <article class="product-card">
        <div class="product-image" data-product-zoom="${product.id}" title="معاينة الصورة">
          <img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}">
        </div>
        <div class="product-body">
          <div class="product-title">
            <h3>${escapeHtml(product.name)}</h3>
            <strong>${formatMoney(product.price)}</strong>
          </div>
          <div class="inline-actions">
            <span class="sku">${escapeHtml(product.sku)}</span>
            <span class="status-pill ${low ? "low" : "ok"}">${low ? "منخفض" : "متاح"}</span>
          </div>
          <p class="muted">مقاس ${escapeHtml(product.size)}، متاح ${product.quantity}</p>
          <button class="primary action-wide" data-add-cart="${product.id}" type="button" ${product.quantity <= 0 ? "disabled" : ""}>إضافة</button>
        </div>
      </article>
    `;
  }

  function saleCompactRow(product) {
    return `
      <article class="sale-compact-row">
        <div class="sale-compact-info">
          <strong>${escapeHtml(product.name)}</strong>
          <p class="muted">${escapeHtml(product.sku)} · ${formatMoney(product.price)} · متاح ${product.quantity}</p>
        </div>
        <button class="primary" data-add-cart="${product.id}" type="button" ${product.quantity <= 0 ? "disabled" : ""}>إضافة</button>
      </article>
    `;
  }

  function cartLinesHtml() {
    if (!state.cart.length) return `<div class="empty">السلة فارغة. أضف صنفا من القائمة لبدء البيع.</div>`;
    return state.cart.map(item => {
      const product = state.products.find(p => p.id === item.productId);
      if (!product) return "";
      return `
        <div class="cart-line">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <p class="muted">${formatMoney(product.price)} × ${item.qty}</p>
          </div>
          <div class="qty-controls">
            <button data-cart-dec="${product.id}" type="button" aria-label="تقليل">-</button>
            <strong>${item.qty}</strong>
            <button data-cart-inc="${product.id}" type="button" aria-label="زيادة">+</button>
            <button data-cart-remove="${product.id}" type="button" aria-label="حذف">×</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function cartTotalsHtml(discount, shipping, taxFree) {
    const totals = calculateCartTotals(discount, shipping, taxFree);
    return `
      <div class="cart-totals" id="cartTotals">
        <div class="total-row"><span>المجموع الفرعي</span><strong>${formatMoney(totals.subtotal)}</strong></div>
        <div class="total-row"><span>الخصم</span><strong>${formatMoney(totals.discount)}</strong></div>
        ${taxFree
          ? ""
          : `<div class="total-row"><span>الضريبة ${state.settings.taxRate}%</span><strong>${formatMoney(totals.tax)}</strong></div>`}
        <div class="total-row"><span>مصاريف الشحن</span><strong>${formatMoney(totals.shipping)}</strong></div>
        <div class="total-row grand"><span>الإجمالي</span><strong>${formatMoney(totals.total)}</strong></div>
      </div>
    `;
  }

  function renderInvoices() {
    let sales = [...state.sales].reverse();
    const isToday = state._invoiceFilter === "today";
    if (isToday) {
      const todayKey = new Date().toDateString();
      sales = sales.filter(sale => new Date(sale.date).toDateString() === todayKey);
    }
    return `
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>الفواتير ${isToday ? "(مبيعات اليوم)" : ""}</h2>
            <p class="muted">${isToday ? "عرض وتتبع فواتير البيع التي تمت اليوم فقط." : "عرض وتحميل ومشاركة فواتير البيع المحفوظة."}</p>
          </div>
          <div class="inline-actions">
            ${isToday ? `<button class="ghost" id="clearInvoiceFilterBtn" type="button">عرض كل الفواتير (${state.sales.length})</button>` : ""}
            <div class="view-switch" role="tablist" aria-label="طريقة عرض الفواتير">
              <button class="view-switch-btn ${state._invoiceView === "list" ? "active" : ""}" data-invoice-view="list" type="button">قائمة</button>
              <button class="view-switch-btn ${state._invoiceView === "cards" ? "active" : ""}" data-invoice-view="cards" type="button">بطاقات</button>
            </div>
            <button class="primary" data-go="sale" type="button">فاتورة جديدة</button>
          </div>
        </div>
        ${sales.length ? invoiceViewBody(sales) : `<div class="empty">لا توجد فواتير مطابقة.</div>`}
      </section>
    `;
  }

  function invoiceViewBody(sales) {
    const view = state._invoiceView || "list";
    if (view === "cards") return `<div class="invoice-cards view-content">${sales.map(invoiceCard).join("")}</div>`;
    return `<div class="invoice-list view-content">${sales.map(invoiceRow).join("")}</div>`;
  }

  function invoiceCard(sale) {
    const net = netSale(sale);
    const hasReturns = (sale.returns || []).length > 0;
    const itemCount = sale.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    return `
      <article class="invoice-card">
        <div class="invoice-card-head">
          <strong>${escapeHtml(sale.number)}</strong>
          ${hasReturns ? '<span class="status-pill low">مرتجع</span>' : ""}
        </div>
        <p class="muted">${dateTime(sale.date)}</p>
        <p class="muted">العميل: ${escapeHtml(sale.customerName || "عميل نقدي")} · ${escapeHtml(sale.paymentMethod || "نقدا")}</p>
        <div class="invoice-card-total">
          <span>${itemCount} قطعة</span>
          <strong>${formatMoney(net.total)}</strong>
        </div>
        <button class="ghost action-wide" data-view-invoice="${sale.id}" type="button">عرض الفاتورة</button>
      </article>
    `;
  }

  function invoiceRow(sale) {
    const hasReturns = (sale.returns || []).length > 0;
    return `
      <article class="invoice-row">
        <div>
          <strong>${escapeHtml(sale.number)}</strong>
          <p class="muted">${dateTime(sale.date)} · ${escapeHtml(sale.customerName || "عميل نقدي")}${hasReturns ? " · <span class=\"status-pill low\">مرتجع</span>" : ""}</p>
        </div>
        <div class="inline-actions">
          <strong>${formatMoney(netSale(sale).total)}</strong>
          <button class="ghost" data-view-invoice="${sale.id}" type="button">عرض</button>
        </div>
      </article>
    `;
  }

  const CUSTOMER_CLASSES = [
    { id: "جديد", label: "جديد" },
    { id: "دائم", label: "دائم" },
    { id: "آجل", label: "عميل آجل" },
    { id: "مميز", label: "مميز" },
    { id: "محظور", label: "محظور" }
  ];

  function customerRecord(name) {
    const clean = String(name || "").trim();
    if (!clean) return null;
    return state.customers.find(item => item.name.trim() === clean) || null;
  }

  function customerRecordByCode(code) {
    const clean = String(code || "").trim();
    if (!clean) return null;
    return state.customers.find(item => item.code === clean) || null;
  }

  function customerCodePrefix() {
    return (state.settings.customerCodePrefix || "CUST").trim() || "CUST";
  }

  function nextCustomerCode() {
    const prefix = customerCodePrefix();
    let max = 0;
    state.customers.forEach(item => {
      const match = String(item.code || "").match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) max = Math.max(max, Number(match[1]));
    });
    return `${prefix}-${String(max + 1).padStart(4, "0")}`;
  }

  function ensureCustomerRegistered(name, phone) {
    const clean = String(name || "").trim();
    if (!clean || clean === "عميل نقدي") return null;
    const existing = customerRecord(clean);
    if (existing) {
      if (phone && !existing.phone && existing.phone !== phone) {
        existing.phone = phone;
      }
      return existing;
    }
    const record = {
      id: cryptoRandomId("c"),
      code: nextCustomerCode(),
      name: clean,
      phone: String(phone || "").trim(),
      address: "",
      photo: "",
      notes: "",
      discount: 0,
      classification: "جديد",
      createdAt: todayISO(),
      updatedAt: todayISO()
    };
    state.customers.push(record);
    return record;
  }

  function syncCustomerRegistry() {
    let changed = false;
    state.sales.forEach(sale => {
      const name = sale.customerName?.trim();
      if (!name || name === "عميل نقدي") return;
      const existing = customerRecord(name);
      if (!existing) {
        state.customers.push({
          id: cryptoRandomId("c"),
          code: nextCustomerCode(),
          name,
          phone: sale.customerPhone?.trim() || "",
          address: "",
          photo: "",
          notes: "",
          discount: 0,
          classification: "جديد",
          createdAt: String(sale.date || "").slice(0, 10) || todayISO(),
          updatedAt: todayISO()
        });
        changed = true;
      } else if (!existing.phone && sale.customerPhone?.trim()) {
        existing.phone = sale.customerPhone.trim();
        changed = true;
      }
    });
    if (changed) commitState({});
  }

  function getCustomersData() {
    const map = {};
    state.sales.forEach(sale => {
      const name = sale.customerName?.trim() || "عميل نقدي";
      if (!map[name]) {
        map[name] = {
          name,
          phone: "",
          count: 0,
          total: 0,
          items: 0,
          firstDate: sale.date,
          lastDate: sale.date,
          sales: []
        };
      }
      const customer = map[name];
      const net = netSale(sale);
      customer.count += 1;
      customer.total += net.total;
      customer.items += net.qty;
      if (sale.customerPhone?.trim()) customer.phone = sale.customerPhone.trim();
      if (new Date(sale.date) < new Date(customer.firstDate)) customer.firstDate = sale.date;
      if (new Date(sale.date) > new Date(customer.lastDate)) customer.lastDate = sale.date;
      customer.sales.push(sale);
    });
    state.customers.forEach(record => {
      if (map[record.name]) {
        map[record.name].registry = record;
      } else if (record.name !== "عميل نقدي") {
        map[record.name] = {
          name: record.name,
          phone: record.phone || "",
          count: 0,
          total: 0,
          items: 0,
          firstDate: record.createdAt,
          lastDate: record.createdAt,
          sales: [],
          registry: record
        };
      }
    });
    return Object.values(map).map(customer => {
      const record = customer.registry || customerRecord(customer.name);
      return {
        ...customer,
        code: record ? record.code : "",
        address: record ? record.address : "",
        photo: record ? record.photo : "",
        notes: record ? record.notes : "",
        discount: record ? Number(record.discount || 0) : 0,
        classification: record ? record.classification : "",
        joinedAt: record ? record.createdAt : customer.firstDate,
        debt: customerDebt(customer.name),
        payments: customerPayments(customer.name)
      };
    });
  }

  function customerDebt(customerName) {
    const name = String(customerName || "").trim();
    if (!name || name === "عميل نقدي") return 0;
    const creditSales = state.sales
      .filter(s => (s.paymentMethod || "نقدا") === "آجل" && (s.customerName || "").trim() === name)
      .reduce((sum, s) => sum + netSale(s).total, 0);
    const paid = state.payments
      .filter(p => (p.customerName || "").trim() === name)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return Math.max(0, creditSales - paid);
  }

  function customerPayments(customerName) {
    const name = String(customerName || "").trim();
    if (!name) return [];
    return state.payments
      .filter(p => (p.customerName || "").trim() === name)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function getDebtors() {
    const map = {};
    state.sales.forEach(sale => {
      if ((sale.paymentMethod || "نقدا") !== "آجل") return;
      const name = sale.customerName?.trim() || "عميل نقدي";
      if (!map[name]) map[name] = { name, debt: 0, invoices: 0 };
      map[name].debt += netSale(sale).total;
      map[name].invoices += 1;
    });
    state.payments.forEach(payment => {
      const name = String(payment.customerName || "").trim();
      if (!name) return;
      if (!map[name]) map[name] = { name, debt: 0, invoices: 0 };
      map[name].debt -= Number(payment.amount || 0);
    });
    return Object.values(map)
      .map(item => ({ ...item, debt: Math.max(0, item.debt) }))
      .filter(item => item.debt > 0)
      .sort((a, b) => b.debt - a.debt);
  }

  function totalOutstandingDebt() {
    return getDebtors().reduce((sum, item) => sum + item.debt, 0);
  }

  function sortCustomers(list) {
    const by = state._custSort || "total";
    const copy = [...list];
    if (by === "name") copy.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else if (by === "last") copy.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    else if (by === "count") copy.sort((a, b) => b.count - a.count);
    else if (by === "items") copy.sort((a, b) => b.items - a.items);
    else if (by === "code") copy.sort((a, b) => String(a.code).localeCompare(String(b.code), "en", { numeric: true }));
    else copy.sort((a, b) => b.total - a.total);
    return copy;
  }

  function customerInitial(name) {
    return escapeHtml(String(name || "؟").trim().charAt(0) || "؟");
  }

  function customerAvatarHtml(customer, sizeClass) {
    if (customer.photo) {
      return `<span class="customer-avatar ${sizeClass || ""} has-photo"><img src="${escapeAttr(customer.photo)}" alt="${escapeAttr(customer.name)}"></span>`;
    }
    return `<span class="customer-avatar ${sizeClass || ""}">${customerInitial(customer.name)}</span>`;
  }

  function customerDiscountBadge(discount) {
    const value = Number(discount || 0);
    if (value <= 0) return "";
    return `<span class="status-pill cust-discount" title="شريحة خصم العميل">خصم ${value}%</span>`;
  }

  function customerAvg(customer) {
    return customer.count ? customer.total / customer.count : 0;
  }

  function shortDate(value) {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium" }).format(new Date(value));
  }

  function renderCustomers() {
    const all = getCustomersData();
    const query = (state._custQuery || "").trim().toLowerCase();
    const customers = sortCustomers(all.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      customer.code.toLowerCase().includes(query)
    ));
    const view = state._custView || "cards";
    const openCustomer = state._custOpen ? all.find(customer => customer.name === state._custOpen || customer.code === state._custOpen) : null;
    const totalCustomers = all.length;
    const totalSpend = all.reduce((sum, customer) => sum + customer.total, 0);
    const totalInvoices = all.reduce((sum, customer) => sum + customer.count, 0);
    const avgSpend = totalCustomers ? totalSpend / totalCustomers : 0;
    const topCustomer = customers.length ? customers[0] : null;
    const topTotal = topCustomer ? topCustomer.total : 0;

    return `
      <section class="stat-cards">
        <div class="stat-card"><span class="stat-label">عدد العملاء</span><span class="stat-value">${totalCustomers}</span></div>
        <div class="stat-card"><span class="stat-label">إجمالي المشتريات</span><span class="stat-value">${formatMoney(totalSpend)}</span></div>
        <div class="stat-card"><span class="stat-label">متوسط إنفاق العميل</span><span class="stat-value">${formatMoney(avgSpend)}</span></div>
        <div class="stat-card ${topCustomer ? "gold" : ""}">
          <span class="stat-label">أعلى عميل إنفاقاً</span>
          <span class="stat-value">${topCustomer ? escapeHtml(topCustomer.name) : "—"}</span>
          <span class="stat-label">${topCustomer ? formatMoney(topCustomer.total) : "لا توجد فواتير بعد"}</span>
        </div>
        <div class="stat-card ${totalOutstandingDebt() > 0 ? "danger" : ""}">
          <span class="stat-label">مستحقات على العملاء (آجل)</span>
          <span class="stat-value">${formatMoney(totalOutstandingDebt())}</span>
          <span class="stat-label">${getDebtors().length} عميل مدين</span>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>قاعدة عملاء المتجر</h2>
            <p class="muted">${totalCustomers} عميل · ${totalInvoices} فاتورة · تُبنى البيانات تلقائياً من الفواتير وتُوسَّع يدوياً.</p>
          </div>
          <div class="inline-actions">
            <button class="primary" data-cust-add type="button">+ إضافة عميل</button>
            <button class="ghost" data-go="sale" type="button">فاتورة جديدة</button>
          </div>
        </div>
        <div class="customers-toolbar">
          <input class="search" id="customerSearch" value="${escapeAttr(state._custQuery)}" placeholder="ابحث بالاسم أو الكود أو رقم الهاتف">
          <div class="view-switch" role="tablist" aria-label="طريقة عرض العملاء">
            <button class="view-switch-btn ${view === "cards" ? "active" : ""}" data-cust-view="cards" type="button">بطاقات</button>
            <button class="view-switch-btn ${view === "table" ? "active" : ""}" data-cust-view="table" type="button">جدول</button>
            <button class="view-switch-btn ${view === "list" ? "active" : ""}" data-cust-view="list" type="button">قائمة</button>
          </div>
          <select id="customerSort" aria-label="ترتيب العملاء">
            <option value="total" ${state._custSort === "total" ? "selected" : ""}>الأكثر إنفاقاً</option>
            <option value="count" ${state._custSort === "count" ? "selected" : ""}>الأكثر فواتير</option>
            <option value="items" ${state._custSort === "items" ? "selected" : ""}>الأكثر قطعاً</option>
            <option value="last" ${state._custSort === "last" ? "selected" : ""}>الأحدث شراءً</option>
            <option value="code" ${state._custSort === "code" ? "selected" : ""}>الكود</option>
            <option value="name" ${state._custSort === "name" ? "selected" : ""}>أبجدي</option>
          </select>
        </div>
      </section>
      ${openCustomer ? customerDetailPanel(openCustomer) : ""}
      ${all.length
        ? (customers.length
          ? renderCustomersBody(customers, view, topTotal)
          : `<div class="empty">لا يوجد عملاء مطابقون للبحث "${escapeHtml(state._custQuery)}".</div>`)
        : `<div class="empty">لا توجد فواتير بعد. أضف فاتورة من تبويب البيع وستظهر بيانات العملاء هنا تلقائياً.</div>`}
    `;
  }

  function renderCustomersBody(customers, view, topTotal) {
    if (view === "table") return `<div class="view-content">${customersTable(customers)}</div>`;
    if (view === "list") return `
      <div class="compact-list customers-list view-content">
        ${customers.map((customer, index) => customerListRow(customer, index, topTotal)).join("")}
      </div>
    `;
    return `<div class="customer-cards view-content">${customers.map((customer, index) => customerCard(customer, index, topTotal)).join("")}</div>`;
  }

  function customerClassBadge(classification) {
    if (!classification) return "";
    const label = CUSTOMER_CLASSES.find(item => item.id === classification)?.label || classification;
    const cls = classification === "محظور" ? "low" : classification === "آجل" ? "warn" : "ok";
    return `<span class="status-pill cust-class ${cls}">${escapeHtml(label)}</span>`;
  }

  function customerCard(customer, index, topTotal) {
    const pct = topTotal > 0 ? Math.round((customer.total / topTotal) * 100) : 0;
    return `
      <article class="customer-card" data-cust-open="${escapeAttr(customer.name)}">
        <div class="customer-card-head">
          ${customerAvatarHtml(customer)}
          <div class="customer-card-name">
            <div class="cust-name-row">
              <strong>${escapeHtml(customer.name)}</strong>
              ${customerClassBadge(customer.classification)}
            </div>
            <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")}</p>
          </div>
          ${customer.code ? `<span class="cust-code-badge" title="كود العميل">${escapeHtml(customer.code)}</span>` : ""}
          ${index === 0 && customer.total > 0 ? '<span class="crown" title="أعلى عميل إنفاقاً">👑</span>' : ""}
        </div>
        <div class="customer-spend">
          <strong>${formatMoney(customer.total)}</strong>
          <span>إجمالي المشتريات</span>
        </div>
        ${customer.debt > 0 ? `
        <div class="debt-badge">
          <span>مستحق عليه</span>
          <strong>${formatMoney(customer.debt)}</strong>
        </div>` : ""}
        <div class="spend-track"><div class="spend-fill" style="width:${pct}%"></div></div>
        <div class="customer-metrics">
          <div><strong>${customer.count}</strong><span>فاتورة</span></div>
          <div><strong>${customer.items}</strong><span>قطعة</span></div>
          <div><strong>${formatMoney(customerAvg(customer))}</strong><span>متوسط الفاتورة</span></div>
        </div>
        <p class="muted customer-last">${customer.address ? `📍 ${escapeHtml(customer.address)} · ` : ""}آخر شراء: ${dateTime(customer.lastDate)}</p>
        ${customerDiscountBadge(customer.discount)}
        <div class="customer-card-actions">
          <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
          <button class="ghost" data-cust-edit="${escapeAttr(customer.name)}" type="button">تعديل</button>
          ${customer.debt > 0 ? `<button class="ghost" data-cust-pay="${escapeAttr(customer.name)}" type="button">سداد دفعة</button>` : ""}
          <button class="primary" data-cust-sell="${escapeAttr(customer.name)}" type="button">بيع جديد</button>
        </div>
      </article>
    `;
  }

  function customersTable(customers) {
    return `
      <div class="scrollable-table">
        <table class="report-table customers-table">
          <thead>
            <tr>
              <th><button class="table-sort ${state._custSort === "name" ? "active" : ""}" data-cust-sort="name" type="button">العميل ${state._custSort === "name" ? "▲" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "code" ? "active" : ""}" data-cust-sort="code" type="button">الكود ${state._custSort === "code" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "count" ? "active" : ""}" data-cust-sort="count" type="button">الفواتير ${state._custSort === "count" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "items" ? "active" : ""}" data-cust-sort="items" type="button">القطع ${state._custSort === "items" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "last" ? "active" : ""}" data-cust-sort="last" type="button">آخر شراء ${state._custSort === "last" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "total" ? "active" : ""}" data-cust-sort="total" type="button">الإجمالي ${state._custSort === "total" ? "▼" : ""}</button></th>
              <th>المستحق عليه</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(customer => `
              <tr>
                <td>
                  <div class="cust-cell">
                    ${customerAvatarHtml(customer, "small")}
                    <div class="customer-card-name">
                      <div class="cust-name-row">
                        <strong>${escapeHtml(customer.name)}</strong>
                        ${customerClassBadge(customer.classification)}
                      </div>
                      <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")}</p>
                    </div>
                  </div>
                </td>
                <td><span class="cust-code-badge">${escapeHtml(customer.code || "—")}</span></td>
                <td>${customer.count}</td>
                <td>${customer.items}</td>
                <td>${shortDate(customer.lastDate)}</td>
                <td><strong>${formatMoney(customer.total)}</strong>${customerDiscountBadge(customer.discount)}</td>
                <td>${customer.debt > 0 ? `<span class="status-pill low">${formatMoney(customer.debt)}</span>` : `<span class="muted">—</span>`}</td>
                <td>
                  <div class="inline-actions">
                    <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
                    <button class="ghost" data-cust-edit="${escapeAttr(customer.name)}" type="button">تعديل</button>
                    ${customer.debt > 0 ? `<button class="ghost" data-cust-pay="${escapeAttr(customer.name)}" type="button">سداد</button>` : ""}
                    <button class="ghost" data-cust-sell="${escapeAttr(customer.name)}" type="button">بيع</button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function customerListRow(customer, index, topTotal) {
    return `
      <article class="invoice-row customer-list-row">
        <div class="cust-cell">
          ${customerAvatarHtml(customer)}
          <div class="customer-card-name">
            <div class="cust-name-row">
              <strong>${escapeHtml(customer.name)} ${index === 0 && customer.total > 0 ? '<span class="crown" title="أعلى عميل إنفاقاً">👑</span>' : ""}</strong>
              ${customerClassBadge(customer.classification)}
              ${customerDiscountBadge(customer.discount)}
            </div>
            <p class="muted">${customer.code ? escapeHtml(customer.code) + " · " : ""}${escapeHtml(customer.phone || "لا يوجد هاتف")} · ${customer.count} فاتورة · ${customer.items} قطعة · آخر شراء ${shortDate(customer.lastDate)}</p>
          </div>
        </div>
        <div class="inline-actions">
          <strong class="customer-list-total">${formatMoney(customer.total)}</strong>
          ${customer.debt > 0 ? `<span class="status-pill low" title="مستحق عليه">دين ${formatMoney(customer.debt)}</span>` : ""}
          <span class="status-pill ${index === 0 && topTotal > 0 ? "ok" : ""}" style="${topTotal > 0 ? `width:${Math.max(8, Math.round((customer.total / topTotal) * 100))}%` : ""}"></span>
          <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
          <button class="ghost" data-cust-edit="${escapeAttr(customer.name)}" type="button">تعديل</button>
          ${customer.debt > 0 ? `<button class="ghost" data-cust-pay="${escapeAttr(customer.name)}" type="button">سداد</button>` : ""}
          <button class="primary" data-cust-sell="${escapeAttr(customer.name)}" type="button">بيع</button>
        </div>
      </article>
    `;
  }

  function customerDetailPanel(customer) {
    const sales = [...customer.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    const payments = customerPayments(customer.name);
    const creditSales = sales.filter(s => (s.paymentMethod || "نقدا") === "آجل");
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return `
      <section class="panel customer-detail">
        <div class="panel-head">
          <div class="cust-cell">
            ${customerAvatarHtml(customer)}
            <div class="customer-card-name">
              <div class="cust-name-row">
                <h2>${escapeHtml(customer.name)}</h2>
                ${customerClassBadge(customer.classification)}
                ${customerDiscountBadge(customer.discount)}
              </div>
              <p class="muted">${customer.code ? escapeHtml(customer.code) + " · " : ""}${escapeHtml(customer.phone || "لا يوجد هاتف")} · ${customer.count} فاتورة · ${customer.items} قطعة · إجمالي ${formatMoney(customer.total)}</p>
            </div>
          </div>
          <div class="inline-actions">
            ${customer.debt > 0 ? `<button class="ghost" data-cust-pay="${escapeAttr(customer.name)}" type="button">سداد دفعة</button>` : ""}
            <button class="ghost" data-cust-edit="${escapeAttr(customer.name)}" type="button">تعديل</button>
            <button class="primary" data-cust-sell="${escapeAttr(customer.name)}" type="button">فاتورة جديدة</button>
            <button class="ghost" data-cust-close type="button">إغلاق</button>
          </div>
        </div>
        <div class="customer-profile">
          <div class="profile-rows">
            <div><span>كود العميل</span><strong>${escapeHtml(customer.code || "—")}</strong></div>
            <div><span>رقم الهاتف</span><strong dir="ltr">${escapeHtml(customer.phone || "—")}</strong></div>
            <div><span>العنوان</span><strong>${escapeHtml(customer.address || "—")}</strong></div>
            <div><span>التصنيف</span><strong>${customer.classification ? escapeHtml(CUSTOMER_CLASSES.find(item => item.id === customer.classification)?.label || customer.classification) : "—"}</strong></div>
            <div><span>شريحة الخصم</span><strong>${Number(customer.discount || 0) > 0 ? `خصم ${Number(customer.discount)}%` : "لا يوجد"}</strong></div>
            <div><span>تاريخ الانضمام</span><strong>${shortDate(customer.joinedAt || customer.firstDate)}</strong></div>
            <div><span>آخر شراء</span><strong>${dateTime(customer.lastDate)}</strong></div>
          </div>
          ${customer.notes ? `<div class="profile-notes"><span>ملاحظات</span><p>${escapeHtml(customer.notes)}</p></div>` : ""}
        </div>
        ${creditSales.length ? `
        <div class="debt-summary">
          <div class="stat-card ${customer.debt > 0 ? "danger" : "ok"}">
            <span class="stat-label">الرصيد المستحق عليه</span>
            <span class="stat-value">${formatMoney(customer.debt)}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">إجمالي مشتريات آجلة</span>
            <span class="stat-value">${formatMoney(creditSales.reduce((sum, s) => sum + netSale(s).total, 0))}</span>
          </div>
          <div class="stat-card gold">
            <span class="stat-label">إجمالي المدفوعات</span>
            <span class="stat-value">${formatMoney(totalPaid)}</span>
          </div>
        </div>
        ${payments.length ? `
        <div class="report-section">
          <div class="report-section-title"><h3>سجل الدفعات</h3></div>
          <div class="scrollable-table">
            <table class="report-table">
              <thead><tr><th>التاريخ</th><th>المبلغ</th><th>ملاحظة</th></tr></thead>
              <tbody>${payments.map(p => `<tr>
                <td>${dateTime(p.date)}</td>
                <td><strong>${formatMoney(p.amount)}</strong></td>
                <td class="muted">${escapeHtml(p.note || "—")}</td>
              </tr>`).join("")}</tbody>
            </table>
          </div>
        </div>` : ""}
        <div class="report-section">
          <div class="report-section-title"><h3>الفواتير الآجلة</h3></div>
          <div class="invoice-list">
            ${creditSales.map(invoiceRow).join("")}
          </div>
        </div>
        ` : ""}
        <div class="invoice-list">
          ${sales.map(invoiceRow).join("")}
        </div>
      </section>
    `;
  }

  const EXPENSE_CATEGORIES = ["إيجار", "رواتب", "كهرباء", "مياه", "إنترنت", "شحن", "تسويق", "صيانة", "مشتريات", "أخرى"];

  function getExpensesByRange(from, to) {
    let list = state.expenses.slice();
    if (from) {
      const f = new Date(from);
      f.setHours(0, 0, 0, 0);
      list = list.filter(exp => new Date(exp.date) >= f);
    }
    if (to) {
      const t = new Date(to);
      t.setHours(23, 59, 59, 999);
      list = list.filter(exp => new Date(exp.date) <= t);
    }
    return list;
  }

  function getFilteredExpenses() {
    return getExpensesByRange(state._expFrom, state._expTo)
      .filter(exp => {
        if (state._expQuery) {
          const query = state._expQuery.trim().toLowerCase();
          return `${exp.category} ${exp.note}`.toLowerCase().includes(query);
        }
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function salesInExpenseRange() {
    let sales = state.sales;
    if (state._expFrom) {
      const from = new Date(state._expFrom);
      from.setHours(0, 0, 0, 0);
      sales = sales.filter(s => new Date(s.date) >= from);
    }
    if (state._expTo) {
      const to = new Date(state._expTo);
      to.setHours(23, 59, 59, 999);
      sales = sales.filter(s => new Date(s.date) <= to);
    }
    return sales;
  }

  function totalExpenses(list) {
    return list.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }

  function renderExpenses() {
    const list = getFilteredExpenses();
    const total = totalExpenses(list);
    const todayKey = new Date().toDateString();
    const todayTotal = totalExpenses(state.expenses.filter(exp => new Date(exp.date).toDateString() === todayKey));
    const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const monthTotal = totalExpenses(state.expenses.filter(exp => String(exp.date).slice(0, 7) === monthKey));
    const pl = getPLData(salesInExpenseRange());
    return `
      <div class="summary-grid">
        ${metric("إجمالي المصروفات", formatMoney(total), `${list.length} قيد داخل الفلاتر`)}
        ${metric("مصروفات اليوم", formatMoney(todayTotal), "قيم المصروفات المسجلة اليوم")}
        ${metric("مصروفات هذا الشهر", formatMoney(monthTotal), "إجمالي الشهر الحالي")}
        ${metric("صافي الربح (P&L)", formatMoney(pl.netProfit), pl.netProfit >= 0 ? "بعد خصم المصروفات" : "خسارة في النطاق الحالي", "reports", "pl")}
      </div>

      <section class="panel" id="expenseFormPanel">
        <div class="panel-head">
          <div>
            <h2>تسجيل مصروف</h2>
            <p class="muted">سجّل المصروفات التشغيلية مثل الإيجار والرواتب والفواتير والمواصلات.</p>
          </div>
        </div>
        <div class="expense-form">
          <label>الفئة
            <select id="expenseCategory">${EXPENSE_CATEGORIES.map(category => `<option ${category === "أخرى" ? "selected" : ""}>${category}</option>`).join("")}</select>
          </label>
          <label>المبلغ
            <input id="expenseAmount" type="number" min="0" step="0.01" placeholder="0.00">
          </label>
          <label>التاريخ
            <input id="expenseDate" type="date" value="${todayISO()}">
          </label>
          <label class="expense-note">ملاحظة
            <input id="expenseNote" placeholder="اختياري — مثل: فاتورة كهرباء أغسطس">
          </label>
          <button class="primary" id="addExpenseButton" type="button">إضافة المصروف</button>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>قائمة المصروفات</h2>
            <p class="muted">${list.length} قيد · إجمالي ${formatMoney(total)}</p>
          </div>
          <div class="inline-actions">
            <label class="mini-filter">بحث
              <input id="expenseSearch" value="${escapeAttr(state._expQuery)}" placeholder="فئة أو ملاحظة">
            </label>
            <label class="mini-filter">من <input type="date" id="expenseFrom" value="${state._expFrom || ''}"></label>
            <label class="mini-filter">إلى <input type="date" id="expenseTo" value="${state._expTo || ''}"></label>
            <button class="ghost" id="expenseClearFilters" type="button">مسح</button>
          </div>
        </div>
        ${list.length ? `<div class="scrollable-table"><table class="report-table">
          <thead><tr><th>التاريخ</th><th>الفئة</th><th>الملاحظة</th><th>المبلغ</th><th></th></tr></thead>
          <tbody>${list.map(exp => `<tr>
            <td>${dateTime(exp.date)}</td>
            <td><span class="status-pill">${escapeHtml(exp.category)}</span></td>
            <td class="muted">${escapeHtml(exp.note || "—")}</td>
            <td><strong>${formatMoney(exp.amount)}</strong></td>
            <td><button class="ghost" data-exp-del="${exp.id}" type="button">حذف</button></td>
          </tr>`).join("")}</tbody>
        </table></div>` : `<div class="empty">لا توجد مصروفات مطابقة للفلاتر.</div>`}
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>الأرباح والخسائر داخل نطاق المصروفات</h2>
            <p class="muted">إيرادات ${pl.salesCount} فاتورة داخل نفس النطاق الزمني للمصروفات.</p>
          </div>
        </div>
        ${pl.revenue > 0 || pl.expenses > 0 ? `
        <div class="pl-ledger">
          <div class="pl-row total"><span>إجمالي المبيعات (قيمة البضاعة)</span><strong>${formatMoney(pl.revenue)}</strong></div>
          <div class="pl-row neg"><span>الخصومات الممنوحة</span><strong>− ${formatMoney(pl.discount)}</strong></div>
          <div class="pl-row pos"><span>إيراد الشحن</span><strong>+ ${formatMoney(pl.shipping)}</strong></div>
          <div class="pl-row neg"><span>تكلفة البضاعة المباعة</span><strong>− ${formatMoney(pl.cost)}</strong></div>
          <div class="pl-row total"><span>مجمل الربح</span><strong>${formatMoney(pl.gross - pl.discount + pl.shipping)}</strong></div>
          <div class="pl-row neg"><span>المصروفات التشغيلية</span><strong>− ${formatMoney(pl.expenses)}</strong></div>
          <div class="pl-row muted"><span>ضريبة محصلة (تُحوَّل للحكومة)</span><strong>${formatMoney(pl.tax)}</strong></div>
          <div class="pl-row ${pl.netProfit >= 0 ? "pos" : "neg"} big"><span>صافي الربح</span><strong>${formatMoney(pl.netProfit)}</strong></div>
        </div>` : `<div class="empty">سجّل مصروفات أو مبيعات في هذا النطاق لعرض النتيجة.</div>`}
      </section>
    `;
  }

  function renderReports() {
    const stats = getStats();
    const invStats = getInventoryStats();
    const extraStats = getDiscountsAndShippingStats();
    const marginPct = stats.allSales > 0 ? Math.round((stats.allProfit / stats.allSales) * 100) : 0;
    const avgInvoice = extraStats.salesCount > 0 ? stats.allSales / extraStats.salesCount : 0;
    const lowItems = activeProducts().filter(p => p.quantity <= p.lowStock);
    const todayTrend = dashTrendToday();
    const hasSalesData = state.sales.length > 0;
    const hasStock = invStats.totalQty > 0;
    const emptyValue = "—";
    return `
      <div class="dash-page">
        <header class="dash-head">
          <div>
            <p class="dash-eyebrow">نظرة تحليلية على أداء المتجر</p>
            <h2 class="dash-heading">لوحة التقارير</h2>
            <p class="dash-sub">${dashPeriodLabel()}</p>
          </div>
          <div class="dash-head-actions">
            <span class="dash-head-note ${lowItems.length ? "is-warn" : ""}">${lowItems.length ? `⚠️ ${lowItems.length} تنبيه مخزون` : "✓ المخزون سليم"}</span>
            <button class="ghost rpt-pdf-btn" id="exportReportPdfHeaderBtn" type="button">تحميل PDF</button>
          </div>
        </header>

        <section class="rpt-builder report-builder" id="reportBuilderPanel">
          <div class="rpt-builder-head">
            <span class="rpt-builder-ico" aria-hidden="true">⚙️</span>
            <div class="rpt-builder-title">
              <strong>منشئ التقرير</strong>
              <small>اختر نوع التقرير، حدد الفلاتر التفصيلية، ثم اضغط استخراج التقرير.</small>
            </div>
          </div>

          <div class="report-types" role="radiogroup" aria-label="نوع التقرير">
            ${reportTypes.map(type => `
              <label class="report-type ${state.report.type === type.id ? "selected" : ""}" for="reportType-${type.id}">
                <input type="radio" name="reportType" id="reportType-${type.id}" value="${type.id}" ${state.report.type === type.id ? "checked" : ""}>
                <span class="report-type-icon" aria-hidden="true">${type.icon}</span>
                <span class="report-type-body">
                  <strong>${type.label}</strong>
                  <small>${type.desc}</small>
                </span>
                <span class="report-type-dot" aria-hidden="true"></span>
              </label>
            `).join("")}
          </div>

          <div class="report-filter-grid">
            <div class="preset-chips" role="group" aria-label="فترات زمنية سريعة">
              ${[["day", "اليوم"], ["week", "آخر 7 أيام"], ["month", "هذا الشهر"], ["month30", "آخر 30 يوم"], ["all", "كل الفترة"]].map(([key, label]) => `
                <button class="preset-chip ${activePresetKey() === key ? "active" : ""}" data-report-preset="${key}" type="button">${label}</button>
              `).join("")}
            </div>
            <div class="filter-fields">
              <label>من <input type="date" id="reportDateFrom" value="${state._reportFrom || ''}"></label>
              <label>إلى <input type="date" id="reportDateTo" value="${state._reportTo || ''}"></label>
              <label>الفئة
                <select id="reportCategory">
                  ${["الكل", "نسائي", "رجالي", "أطفال", "إكسسوارات"].map(category => `<option ${category === state._reportCategory ? "selected" : ""}>${category}</option>`).join("")}
                </select>
              </label>
              <label>طريقة الدفع
                <select id="reportPayment">
                  ${["الكل", "نقدا", "بطاقة", "تحويل", "مختلط", "آجل"].map(method => `<option ${method === state._reportPayment ? "selected" : ""}>${method}</option>`).join("")}
                </select>
              </label>
              <label>العميل
                <select id="reportCustomer">
                  ${customerOptionsHtml()}
                </select>
              </label>
              <label>بحث منتج
                <input id="reportQuery" value="${escapeAttr(state._reportQuery)}" placeholder="اسم الصنف أو SKU">
              </label>
            </div>
          </div>

          <div class="report-extract-bar">
            <button class="primary" id="reportExtractBtn" type="button">⚡ استخراج التقرير</button>
            <button class="ghost" id="reportClearFilters" type="button">مسح كل الفلاتر</button>
            <span style="flex:1"></span>
            <button class="ghost" id="exportReportPdfBtn" type="button">تحميل PDF</button>
          </div>
        </section>

        ${activeFiltersHtml()}

        <div class="dash-kpis" role="list" aria-label="مؤشرات الأداء الرئيسية">
          ${kpiCard({ label: "إجمالي المبيعات", value: hasSalesData ? formatMoney(stats.allSales) : emptyValue, sub: hasSalesData ? `${extraStats.salesCount} فاتورة ضمن النطاق` : "لا توجد مبيعات بعد", accent: "primary", icon: "💰" })}
          ${kpiCard({ label: "صافي الربح", value: hasSalesData ? formatMoney(stats.allProfit) : emptyValue, sub: hasSalesData ? `${marginPct}% من إجمالي الإيراد` : "لا توجد بيانات بعد", accent: "secondary", icon: "📈" })}
          ${kpiCard({ label: "مبيعات اليوم", value: hasSalesData ? formatMoney(stats.todaySales) : emptyValue, sub: hasSalesData ? `${stats.todayInvoices} فاتورة اليوم` : "لا توجد فواتير اليوم", accent: "success", icon: "🧾", view: "reports", filter: "today", trend: todayTrend === null ? "" : (todayTrend >= 0 ? `▲ ${todayTrend}% عن أمس` : `▼ ${Math.abs(todayTrend)}% عن أمس`) })}
          ${kpiCard({ label: "قيمة المخزون", value: hasStock ? formatMoney(invStats.retailValue) : emptyValue, sub: hasStock ? `${invStats.totalQty} قطعة في المخزن` : "المخزن فارغ حالياً", accent: "warning", icon: "📦", view: "reports", filter: "inventory", trend: "قيمة بيع" })}
          ${kpiCard({ label: "هامش الربح", value: hasSalesData ? `${marginPct}%` : emptyValue, sub: hasStock ? `${invStats.marginPct}% هامش المخزون` : "لا توجد بيانات بعد", accent: "gold", icon: "🥇", view: "reports", filter: "profitability", trend: "تحليل" })}
          ${kpiCard({ label: "متوسط الفاتورة", value: hasSalesData ? formatMoney(avgInvoice) : emptyValue, sub: hasSalesData ? `${extraStats.salesCount} فاتورة إجمالاً` : "لا توجد فواتير بعد", accent: "steel", icon: "🧮" })}
        </div>

        <div class="reports-output" id="reportsContent">
          ${renderReportSection(state.report.type)}
        </div>

        <section class="dash-quick" aria-label="تقارير سريعة">
          <div class="dash-quick-title">
            <strong>تقارير سريعة</strong>
            <small>انتقال مباشر لأشهر التقارير دون فتح منشئ التقرير</small>
          </div>
          <div class="dash-quick-grid">
            ${[["product-profit", "💎", "ربحية الأصناف"], ["inventory", "📦", "تقرير المخزون"], ["pl", "📋", "الأرباح والخسائر"], ["payments", "💳", "طرق الدفع"], ["customers", "👥", "العملاء"], ["categories", "🏷️", "مبيعات الفئات"]].map(([id, icon, label]) => `
              <button class="dash-quick-btn ${state.report.type === id ? "active" : ""}" data-quick-report="${id}" type="button">
                <span class="dash-quick-ico" aria-hidden="true">${icon}</span>
                <span>${label}</span>
              </button>
            `).join("")}
          </div>
        </section>
      </div>
    `;
  }

  function dashPeriodLabel() {
    if (state._reportFrom && state._reportTo) return `الفترة المطبقة: من ${state._reportFrom} حتى ${state._reportTo}`;
    if (state._reportFrom) return `الفترة المطبقة: من ${state._reportFrom} حتى اليوم`;
    if (state._reportTo) return `الفترة المطبقة: منذ البداية حتى ${state._reportTo}`;
    return "الفترة المطبقة: كل الفترة بدون تصفية";
  }

  function dashTrendToday() {
    const key = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const todayKey = key(new Date());
    const yesterdayKey = key(new Date(Date.now() - 86400000));
    let today = 0, yesterday = 0;
    state.sales.forEach(sale => {
      const k = key(new Date(sale.date));
      if (k === todayKey) today += netSale(sale).total;
      else if (k === yesterdayKey) yesterday += netSale(sale).total;
    });
    if (!yesterday) return null;
    return Math.round(((today - yesterday) / yesterday) * 100);
  }

  function kpiCard({ label, value, sub, accent = "", icon = "📊", view = "", filter = "", trend = "" }) {
    const clickable = view ? " dash-kpi-clickable" : "";
    const drill = view ? `data-drill-view="${view}" data-drill-filter="${filter || ''}"` : "";
    const role = view ? ` role="button" tabindex="0"` : "";
    const empty = value === "—" || value === "";
    return `
      <article class="dash-kpi ${accent}${clickable}" ${drill}${role}>
        <span class="dash-kpi-icon" aria-hidden="true">${icon}</span>
        <div class="dash-kpi-body">
          <span class="dash-kpi-label">${label}</span>
          <strong class="dash-kpi-value${empty ? " is-empty" : ""}">${value}</strong>
          <span class="dash-kpi-sub">${sub}</span>
        </div>
        ${trend ? `<span class="dash-kpi-trend">${trend}</span>` : ""}
      </article>
    `;
  }

  function getDailySeries() {
    const sales = getFilteredSales();
    const map = {};
    sales.forEach(sale => {
      const d = new Date(sale.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map[key]) map[key] = { date: key, sales: 0, profit: 0 };
      const net = netSale(sale);
      map[key].sales += net.total;
      map[key].profit += net.profit;
    });
    return Object.values(map).sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  function trendChartHtml(series) {
    if (!series.length) return `<div class="empty">لا توجد مبيعات في هذه الفترة لرسم الأداء المالي.</div>`;
    const days = series.slice(-14);
    const max = Math.max(...days.map(d => Math.max(d.sales, d.profit)), 1);
    return `
      <div class="dash-trend">
        <div class="dash-trend-bars">
          ${days.map(day => {
            const label = day.date.slice(8);
            return `
              <div class="dt-col" title="يوم ${label}: مبيعات ${formatMoney(day.sales)} · ربح ${formatMoney(day.profit)}">
                <div class="dt-bars">
                  <span class="dt-bar dt-bar-sales" style="height:${Math.max(3, (day.sales / max) * 100)}%"></span>
                  <span class="dt-bar dt-bar-profit" style="height:${Math.max(3, (day.profit / max) * 100)}%"></span>
                </div>
                <span class="dt-label">${label}</span>
              </div>
            `;
          }).join("")}
        </div>
        <div class="dash-trend-legend">
          <span><i class="dot dot-sales"></i>المبيعات</span>
          <span><i class="dot dot-profit"></i>صافي الربح</span>
          <span class="muted">آخر ${days.length} يوم داخل النطاق</span>
        </div>
      </div>
    `;
  }

  function dashBars(rows, colorClass) {
    if (!rows.length) return `<div class="empty">لا توجد بيانات بعد.</div>`;
    const max = Math.max(...rows.map(row => row.value), 1);
    return `
      <div class="dash-bars">
        ${rows.map(row => `
          <div class="dash-bar-row">
            <span class="dash-bar-label">${escapeHtml(row.label)}</span>
            <div class="dash-bar-track"><div class="dash-bar-fill ${colorClass}" style="width:${Math.max(4, (row.value / max) * 100)}%"></div></div>
            <strong class="dash-bar-value">${row.display || formatMoney(row.value)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function paymentBreakdownHtml(paymentStats) {
    const total = paymentStats.reduce((sum, p) => sum + p.total, 0);
    if (!total) return `<div class="empty">لا توجد بيانات دفع بعد.</div>`;
    const colors = ["var(--primary)", "var(--secondary)", "var(--success)", "var(--warning)", "var(--danger)"];
    return `
      <div class="dash-payments">
        <div class="dash-pay-stack">
          ${paymentStats.map((p, i) => `
            <span class="dash-pay-seg" style="flex:${p.total / total};background:${colors[i % colors.length]}" title="${escapeHtml(p.method)}: ${formatMoney(p.total)}"></span>
          `).join("")}
        </div>
        <div class="dash-pay-legend">
          ${paymentStats.map((p, i) => `
            <div class="dash-pay-item">
              <span class="dash-pay-swatch" style="background:${colors[i % colors.length]}"></span>
              <span class="dash-pay-name">${escapeHtml(p.method)}</span>
              <strong class="dash-pay-amt">${formatMoney(p.total)}</strong>
              <small>${Math.round((p.total / total) * 100)}% · ${p.count} فاتورة</small>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function expensesMiniList(expensesList) {
    const byCat = {};
    expensesList.forEach(exp => {
      byCat[exp.category] = (byCat[exp.category] || 0) + Number(exp.amount || 0);
    });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max = cats.length ? cats[0][1] : 1;
    return `
      <div class="dash-mini-list">
        ${cats.map(([cat, amount]) => `
          <div class="dash-mini-row">
            <span class="dash-mini-name">${escapeHtml(cat)}</span>
            <div class="dash-mini-track"><span class="dash-mini-fill exp" style="width:${Math.max(4, (amount / max) * 100)}%"></span></div>
            <strong class="dash-mini-amt">${formatMoney(amount)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function miniCustomers(customers) {
    return `
      <div class="dash-rank-list">
        ${customers.map((c, i) => `
          <div class="dash-rank-row">
            <span class="dash-rank-num">${i + 1}</span>
            <div class="dash-rank-main">
              <strong>${escapeHtml(c.name)}</strong>
              <small>${c.count} فاتورة</small>
            </div>
            <strong class="dash-rank-val">${formatMoney(c.total)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function miniProfit(items) {
    return `
      <div class="dash-rank-list">
        ${items.map((p, i) => `
          <div class="dash-rank-row">
            <span class="dash-rank-num">${i + 1}</span>
            <div class="dash-rank-main">
              <strong>${escapeHtml(p.name)}</strong>
              <small>${p.qty} قطعة · هامش ${p.margin}%</small>
            </div>
            <strong class="dash-rank-val profit">${formatMoney(p.profit)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderReportSection(type) {
    const builders = {
      summary: reportSummarySection,
      hourly: reportHourlySection,
      "product-profit": reportProductProfitSection,
      customers: reportCustomersSection,
      inventory: reportInventorySection,
      margins: reportMarginsSection,
      categories: reportCategoriesSection,
      top: reportTopSection,
      payments: reportPaymentsSection,
      pl: reportPLSection,
      lowstock: reportLowStockSection
    };
    return (builders[type] || reportSummarySection)();
  }

  function reportSummarySection() {
    const stats = getStats();
    const extraStats = getDiscountsAndShippingStats();
    const paymentStats = getPaymentStats();
    const categoryTotals = totalsByCategory();
    const topProducts = topProductsByQty();
    const hourlySales = getHourlySales();
    const lowItems = activeProducts().filter(p => p.quantity <= p.lowStock);
    const series = getDailySeries();
    const expensesList = getExpensesByRange(state._reportFrom, state._reportTo);
    const expensesTotal = totalExpenses(expensesList);
    const topCustomers = getTopCustomers().slice(0, 4);
    const topProfit = getProductProfitability().slice(0, 4);
    return `
      <section class="rpt-card rpt-financial">
        <div class="rpt-card-head">
          <div>
            <h3>الأداء المالي</h3>
            <p class="muted">المبيعات وصافي الربح يومًا بيوم داخل الفترة</p>
          </div>
          ${series.length ? `
          <div class="rpt-financial-totals">
            <span><small>إجمالي الإيراد</small><strong>${formatMoney(series.reduce((sum, d) => sum + d.sales, 0))}</strong></span>
            <span><small>صافي الربح</small><strong style="color:var(--secondary)">${formatMoney(series.reduce((sum, d) => sum + d.profit, 0))}</strong></span>
          </div>` : ""}
        </div>
        ${trendChartHtml(series)}
      </section>

      <div class="dash-analysis-grid">
        <section class="rpt-card">
          <div class="rpt-card-head"><h3>توزيع المبيعات على الفئات</h3></div>
          ${categoryTotals.length ? dashBars(categoryTotals, "primary") : `<div class="empty">لا توجد مبيعات فئات في هذه الفترة.</div>`}
        </section>
        <section class="rpt-card">
          <div class="rpt-card-head"><h3>الأكثر مبيعاً</h3></div>
          ${topProducts.length ? dashBars(topProducts, "rose") : `<div class="empty">لا توجد مبيعات كافية للرسم بعد.</div>`}
        </section>
        <section class="rpt-card">
          <div class="rpt-card-head"><h3>ساعات الذروة</h3></div>
          ${hourlySales.length ? dashBars(hourlySales, "gold") : `<div class="empty">لا توجد بيانات ساعات بيع كافية في هذه الفترة.</div>`}
        </section>
        <section class="rpt-card">
          <div class="rpt-card-head">
            <div>
              <h3>طرق الدفع</h3>
              <p class="muted">النسب والأحجام النسبية بين الوسائل</p>
            </div>
          </div>
          ${paymentStats.length ? paymentBreakdownHtml(paymentStats) : `<div class="empty">لا توجد بيانات دفع بعد.</div>`}
        </section>
      </div>

      <div class="dash-bottom-grid">
        <section class="rpt-card rpt-summary-card">
          <div class="rpt-card-head">
            <div>
              <h3>المصروفات</h3>
              <p class="muted">${expensesList.length} قيد داخل النطاق</p>
            </div>
            <span class="rpt-badge rpt-badge-danger">${formatMoney(expensesTotal)}</span>
          </div>
          ${expensesList.length ? expensesMiniList(expensesList) : `<div class="empty">لا توجد مصروفات في هذه الفترة.</div>`}
          <button class="rpt-more" data-drill-view="expenses" type="button">عرض شاشة المصروفات ←</button>
        </section>

        <section class="rpt-card rpt-summary-card">
          <div class="rpt-card-head">
            <div>
              <h3>أفضل العملاء</h3>
              <p class="muted">أعلى قيمة مشتريات خلال الفترة</p>
            </div>
          </div>
          ${topCustomers.length ? miniCustomers(topCustomers) : `<div class="empty">لا توجد مبيعات عملاء مسجلة في هذه الفترة.</div>`}
          <button class="rpt-more" data-drill-view="customers" type="button">عرض العملاء ←</button>
        </section>

        <section class="rpt-card rpt-summary-card">
          <div class="rpt-card-head">
            <div>
              <h3>الأعلى ربحية</h3>
              <p class="muted">الأصناف الأكثر تحقيقًا للربح</p>
            </div>
          </div>
          ${topProfit.length ? miniProfit(topProfit) : `<div class="empty">لا توجد مبيعات أصناف في هذه الفترة.</div>`}
          <button class="rpt-more" data-drill-view="products" type="button">عرض الأصناف ←</button>
        </section>

        <section class="rpt-card rpt-summary-card ${lowItems.length ? "is-alert" : ""}">
          <div class="rpt-card-head">
            <div>
              <h3>تنبيهات المخزون</h3>
              <p class="muted">أصناف قاربت على النفاد من المخزن</p>
            </div>
            <span class="rpt-badge ${lowItems.length ? "rpt-badge-danger" : "rpt-badge-ok"}">${lowItems.length}</span>
          </div>
          ${lowItems.length ? lowItems.slice(0, 4).map(p => `
            <div class="rpt-alert-row">
              <span class="rpt-alert-ico" aria-hidden="true">⚠️</span>
              <div>
                <strong>${escapeHtml(p.name)}</strong>
                <small>متبقي ${p.quantity} قطعة · حد التنبيه ${p.lowStock}</small>
              </div>
            </div>
          `).join("") : `<div class="empty">لا توجد تنبيهات مخزون.</div>`}
          <button class="rpt-more rpt-more-danger" data-drill-view="products" data-drill-filter="low" type="button">عرض الأصناف المنخفضة ←</button>
        </section>
      </div>
    `;
  }

  function reportHourlySection() {
    const hourlySales = getHourlySales();
    return `
      <section class="panel" id="hourlySection">
        <div class="panel-head"><h2>ساعات الذروة والأكثر مبيعاً</h2></div>
        ${hourlySales.length ? barChart(hourlySales, "rose") : `<div class="empty">لا توجد بيانات ساعات بيع كافية في هذه الفترة.</div>`}
      </section>
    `;
  }

  function reportProductProfitSection() {
    const productProfitability = getProductProfitability();
    return `
      <section class="panel" id="productProfitabilitySection">
        <div class="panel-head"><h2>تحليل ربحية الأصناف المباعة</h2></div>
        ${productProfitability.length ? `<div class="scrollable-table">
          <table class="report-table">
            <thead><tr><th>الصنف</th><th>القطع المباعة</th><th>إجمالي الإيراد</th><th>إجمالي التكلفة</th><th>صافي الربح</th><th>هامش الربح</th></tr></thead>
            <tbody>${productProfitability.map(p => `<tr>
              <td>${escapeHtml(p.name)}</td>
              <td>${p.qty} قطعة</td>
              <td>${formatMoney(p.revenue)}</td>
              <td>${formatMoney(p.cost)}</td>
              <td style="font-weight:800;color:var(--accent)">${formatMoney(p.profit)}</td>
              <td><span class="status-pill ${p.margin >= 30 ? 'ok' : 'low'}">${p.margin}%</span></td>
            </tr>`).join("")}</tbody>
          </table>
        </div>` : `<div class="empty">لا توجد مبيعات أصناف في هذه الفترة.</div>`}
      </section>
    `;
  }

  function reportCustomersSection() {
    const topCustomers = getTopCustomers();
    return `
      <section class="panel" id="customerSection">
        <div class="panel-head"><h2>تقرير العملاء الأكثر شراءً</h2></div>
        ${topCustomers.length ? `<div class="scrollable-table">
          <table class="report-table">
            <thead><tr><th>اسم العميل</th><th>عدد الفواتير</th><th>إجمالي المشتريات</th></tr></thead>
            <tbody>${topCustomers.map(c => `<tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${c.count} فاتورة</td>
              <td style="font-weight:800">${formatMoney(c.total)}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>` : `<div class="empty">لا توجد مبيعات عملاء مسجلة في هذه الفترة.</div>`}
      </section>
    `;
  }

  function reportInventorySection() {
    const products = filteredReportProducts();
    let totalQty = 0, retailValue = 0, costValue = 0;
    products.forEach(p => {
      totalQty += p.quantity;
      retailValue += p.price * p.quantity;
      costValue += p.cost * p.quantity;
    });
    const lowItems = products.filter(p => p.quantity <= p.lowStock);
    return `
      <section class="panel" id="inventorySection">
        <div class="panel-head"><h2>تقرير المخزون التفصيلي</h2></div>
        <div class="stat-cards">
          <div class="stat-card"><span class="stat-label">إجمالي الأصناف</span><span class="stat-value">${products.length}</span></div>
          <div class="stat-card gold"><span class="stat-label">إجمالي القطع</span><span class="stat-value">${totalQty}</span></div>
          <div class="stat-card"><span class="stat-label">قيمة البيع</span><span class="stat-value">${formatMoney(retailValue)}</span></div>
          <div class="stat-card"><span class="stat-label">قيمة التكلفة</span><span class="stat-value">${formatMoney(costValue)}</span></div>
          <div class="stat-card gold"><span class="stat-label">الربح المتوقع</span><span class="stat-value">${formatMoney(retailValue - costValue)}</span></div>
          <div class="stat-card warn"><span class="stat-label">أصناف منخفضة</span><span class="stat-value">${lowItems.length}</span></div>
        </div>
        ${products.length ? `<div class="scrollable-table">
          <table class="report-table">
            <thead><tr><th>الصنف</th><th>SKU</th><th>الفئة</th><th>الكمية</th><th>سعر البيع</th><th>التكلفة</th><th>قيمة المخزون</th><th>الحالة</th></tr></thead>
            <tbody>${products.map(p => `<tr>
              <td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.sku)}</td><td>${escapeHtml(p.category)}</td>
              <td>${p.quantity}</td><td>${formatMoney(p.price)}</td><td>${formatMoney(p.cost)}</td>
              <td>${formatMoney(p.price * p.quantity)}</td>
              <td><span class="status-pill ${p.quantity <= p.lowStock ? 'low' : 'ok'}">${p.quantity <= p.lowStock ? 'منخفض' : 'متاح'}</span></td>
            </tr>`).join("")}</tbody>
            <tfoot><tr><td colspan="3">الإجمالي</td><td>${totalQty}</td><td colspan="2"></td><td>${formatMoney(retailValue)}</td><td></td></tr></tfoot>
          </table>
        </div>` : `<div class="empty">لا توجد أصناف مطابقة للفلاتر المحددة.</div>`}
      </section>
    `;
  }

  function reportMarginsSection() {
    const stats = getStats();
    const profitMargins = getProfitMargins();
    return `
      <section class="panel">
        <div class="panel-head"><h2>تحليل الأرباح الهامشية</h2></div>
        <div class="stat-cards">
          <div class="stat-card"><span class="stat-label">إجمالي الإيرادات</span><span class="stat-value">${formatMoney(stats.allSales)}</span></div>
          <div class="stat-card gold"><span class="stat-label">صافي الربح</span><span class="stat-value">${formatMoney(stats.allProfit)}</span></div>
          <div class="stat-card"><span class="stat-label">هامش الربح</span><span class="stat-value">${stats.allSales > 0 ? Math.round((stats.allProfit / stats.allSales) * 100) : 0}%</span></div>
          <div class="stat-card"><span class="stat-label">القطع المباعة</span><span class="stat-value">${stats.soldQty}</span></div>
        </div>
        ${profitMargins.length ? `
        <div class="report-section">
          <div class="report-section-title"><h3>هوامش الربح حسب الفئة</h3></div>
          ${barChart(profitMargins, "green")}
        </div>` : `<div class="empty">لا توجد مبيعات في هذه الفترة.</div>`}
      </section>
    `;
  }

  function reportCategoriesSection() {
    const categoryTotals = totalsByCategory();
    return `
      <section class="panel">
        <div class="panel-head"><h2>مبيعات الفئات</h2></div>
        ${categoryTotals.length ? barChart(categoryTotals, "green") : `<div class="empty">لا توجد مبيعات فئات في هذه الفترة.</div>`}
      </section>
    `;
  }

  function reportTopSection() {
    const topProducts = topProductsByQty();
    return `
      <section class="panel">
        <div class="panel-head"><h2>الأكثر مبيعاً</h2></div>
        ${topProducts.length ? barChart(topProducts, "rose") : `<div class="empty">لا توجد مبيعات كافية للرسم بعد.</div>`}
      </section>
    `;
  }

  function reportPaymentsSection() {
    const paymentStats = getPaymentStats();
    return `
      <section class="panel">
        <div class="panel-head"><h2>تحليل طرق الدفع</h2></div>
        ${paymentStats.length ? `<div class="payment-breakdown">${paymentStats.map(ps => `
          <div class="payment-card">
            <span>${escapeHtml(ps.method)}</span>
            <strong>${formatMoney(ps.total)}</strong>
            <span>${ps.count} فاتورة</span>
          </div>
        `).join("")}</div>` : `<div class="empty">لا توجد بيانات دفع بعد.</div>`}
      </section>
    `;
  }

  function reportLowStockSection() {
    const lowItems = filteredReportProducts().filter(p => p.quantity <= p.lowStock);
    return `
      <section class="panel">
        <div class="panel-head"><h2>أصناف منخفضة المخزون</h2></div>
        ${lowItems.length ? lowStockTableHtml(lowItems) : `<div class="empty">لا توجد تنبيهات مخزون مطابقة للفلاتر المحددة.</div>`}
      </section>
    `;
  }

  function getPLData(salesOverride, expensesOverride) {
    const sales = salesOverride || getFilteredSales();
    const expensesList = expensesOverride !== undefined ? expensesOverride : getFilteredExpenses();
    let revenue = 0, cost = 0, discount = 0, shipping = 0, tax = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        revenue += Number(item.price || 0) * Number(item.qty || 0);
        cost += Number(item.cost || 0) * Number(item.qty || 0);
      });
      saleReturnItems(sale).forEach(item => {
        revenue -= Number(item.price || 0) * Number(item.qty || 0);
        cost -= Number(item.cost || 0) * Number(item.qty || 0);
      });
      discount += Number(sale.discount || 0);
      shipping += Number(sale.shipping || 0);
      tax += Number(sale.tax || 0);
    });
    const gross = revenue - cost;
    const expenses = expensesList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = gross - discount + shipping - expenses;
    return { salesCount: sales.length, revenue, cost, gross, discount, shipping, tax, expenses, netProfit };
  }

  function reportPLSection() {
    const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
    const rows = [
      ["إجمالي المبيعات (قيمة البضاعة)", formatMoney(pl.revenue), ""],
      ["الخصومات الممنوحة", "− " + formatMoney(pl.discount), "neg"],
      ["إيراد الشحن", "+ " + formatMoney(pl.shipping), "pos"],
      ["صافي الإيراد", formatMoney(pl.revenue - pl.discount + pl.shipping), "total"],
      ["تكلفة البضاعة المباعة", "− " + formatMoney(pl.cost), "neg"],
      ["مجمل الربح", formatMoney(pl.gross - pl.discount + pl.shipping), "total"],
      ["المصروفات التشغيلية", "− " + formatMoney(pl.expenses), "neg"],
      ["ضريبة محصلة (تُحوَّل للحكومة)", formatMoney(pl.tax), "muted"],
      ["صافي الربح", formatMoney(pl.netProfit), pl.netProfit >= 0 ? "pos" : "neg"]
    ];
    return `
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>قائمة الأرباح والخسائر</h2>
            <p class="muted">${pl.salesCount} فاتورة داخل النطاق · إجمالي المصروفات: ${formatMoney(pl.expenses)}</p>
          </div>
        </div>
        ${pl.revenue > 0 || pl.expenses > 0 ? `
        <div class="pl-ledger">
          ${rows.map(([label, value, kind]) => `<div class="pl-row ${kind}"><span>${label}</span><strong>${value}</strong></div>`).join("")}
        </div>` : `<div class="empty">لا توجد مبيعات أو مصروفات في النطاق المحدد.</div>`}
      </section>
    `;
  }

  function lowStockTableHtml(items) {
    return `<div class="scrollable-table"><table class="report-table">
      <thead><tr><th>الصنف</th><th>SKU</th><th>المتبقي</th><th>حد التنبيه</th><th>إجراء</th></tr></thead>
      <tbody>${items.map(p => `<tr>
        <td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.sku)}</td>
        <td><span class="status-pill low">${p.quantity}</span></td><td>${p.lowStock}</td>
        <td><button class="ghost" data-edit-product="${p.id}" type="button">تعديل</button></td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function filteredReportProducts() {
    let list = activeProducts();
    if (state._reportCategory && state._reportCategory !== "الكل") {
      list = list.filter(p => p.category === state._reportCategory);
    }
    if (state._reportQuery) {
      const query = state._reportQuery.trim().toLowerCase();
      list = list.filter(p => `${p.name} ${p.sku} ${p.color} ${p.size}`.toLowerCase().includes(query));
    }
    return list;
  }

  function customerOptionsHtml() {
    const customers = [...new Set(state.sales.map(sale => (sale.customerName || "عميل نقدي").trim()))].sort((a, b) => a.localeCompare(b, "ar"));
    return `<option ${state._reportCustomer === "الكل" ? "selected" : ""}>الكل</option>` +
      customers.map(name => `<option ${name === state._reportCustomer ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
  }

  function activePresetKey() {
    const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const from = state._reportFrom;
    const to = state._reportTo;
    if (!from && !to) return "all";
    const today = new Date();
    const todayStr = iso(today);
    if (from === todayStr && to === todayStr) return "day";
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (from === iso(startOfMonth) && to === todayStr) return "month";
    const daysAgo = days => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return iso(d);
    };
    if (from === daysAgo(6) && to === todayStr) return "week";
    if (from === daysAgo(29) && to === todayStr) return "month30";
    return "";
  }

  function activeFiltersHtml() {
    const chips = [];
    if (state._reportFrom || state._reportTo) {
      chips.push(`📅 من ${state._reportFrom || "البداية"} إلى ${state._reportTo || "اليوم"}`);
    }
    if (state._reportCategory !== "الكل") chips.push(`🏷️ الفئة: ${state._reportCategory}`);
    if (state._reportPayment !== "الكل") chips.push(`💳 الدفع: ${state._reportPayment}`);
    if (state._reportCustomer !== "الكل") chips.push(`👤 العميل: ${state._reportCustomer}`);
    if (state._reportQuery) chips.push(`🔍 المنتج: ${state._reportQuery}`);
    if (!chips.length) return "";
    return `
      <div class="filter-chips">
        ${chips.map(chip => `<span>${escapeHtml(chip)}</span>`).join("")}
        <button class="ghost" id="reportClearFiltersChips" type="button">مسح الكل</button>
      </div>
    `;
  }

  function renderSettings() {
    const hasLogo = !!state.settings.logo;
    return `
      <form class="settings-grid" id="settingsForm">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>بيانات المتجر</h2>
              <p class="muted">تظهر هذه البيانات في رأس الفاتورة وفي اسم التطبيق.</p>
            </div>
          </div>
          <div class="fields">
            <label>اسم المتجر <input id="storeName" required value="${escapeAttr(state.settings.storeName)}"></label>
            <div class="two">
              <label>العملة <input id="currency" required value="${escapeAttr(state.settings.currency)}"></label>
              <label>نسبة الضريبة <input id="taxRate" min="0" max="100" step="0.01" type="number" value="${state.settings.taxRate}"></label>
            </div>
            <label class="check-line">
              <input id="allowTaxFree" type="checkbox" ${state.settings.allowTaxFree ? "checked" : ""}>
              <span>
                <strong>السماح بفاتورة بدون ضريبة</strong>
                <small>عند تفعيلها يظهر خيار في شاشة البيع لإصدار الفاتورة معفاة من الضريبة عند الحاجة.</small>
              </span>
            </label>
            <label>نص أسفل الفاتورة <textarea id="invoiceFooter">${escapeHtml(state.settings.invoiceFooter)}</textarea></label>
            <label>بادئة كود العملاء <input id="customerCodePrefix" dir="ltr" value="${escapeAttr(state.settings.customerCodePrefix || "CUST")}" placeholder="CUST"></label>
            <p class="muted">تُستخدم لتوليد أكواد العملاء تلقائياً مثل CUST-0001، ويبدأ التسلسل من 1 عند كل قيمة جديدة.</p>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>بيانات المنشأة</h2>
              <p class="muted">تظهر في تذييل الفواتير والتقارير، ويُحذف أي حقل فارغ تلقائياً.</p>
            </div>
          </div>
          <div class="fields">
            <div class="two">
              <label>الهاتف <input id="companyPhone" dir="ltr" value="${escapeAttr(state.settings.companyPhone || "")}"></label>
              <label>السجل التجاري <input id="commercialNumber" dir="ltr" value="${escapeAttr(state.settings.commercialNumber || "")}"></label>
            </div>
            <label>العنوان <input id="companyAddress" value="${escapeAttr(state.settings.companyAddress || "")}"></label>
            <div class="two">
              <label>الرقم الضريبي <input id="taxNumber" dir="ltr" value="${escapeAttr(state.settings.taxNumber || "")}"></label>
            </div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <h2>هوية المتجر</h2>
          </div>
          <p class="muted">أضف شعار المتجر ليظهر في الفواتير والتقارير وواجهة التطبيق.</p>
          <div class="logo-upload-area">
            <img id="logoPreview" class="logo-preview ${hasLogo ? 'has-logo' : ''}" src="${hasLogo ? escapeAttr(state.settings.logo) : 'assets/icon-192.png'}" alt="شعار المتجر">
            <div class="fields" style="flex:1">
              <label>رفع شعار جديد
                <input id="logoUpload" type="file" accept="image/*">
              </label>
              ${hasLogo ? `<button class="danger ghost" id="removeLogoBtn" type="button">إزالة الشعار</button>` : ""}
            </div>
          </div>
          <label>لون التمييز
            <input id="accentColor" type="color" value="${escapeAttr(state.settings.accent || "#0e5349")}">
          </label>
          <p class="muted">اختيار لون هادئ وواضح يساعد الكاشير على قراءة الإجراءات بسرعة.</p>
          <label>لون المستندات (PDF)
            <input id="docColor" type="color" value="${escapeAttr(state.settings.docColor || "#075E54")}">
          </label>
          <p class="muted">اللون الأساسي في رأس وتذييل الفواتير والتقارير المطبوعة. إن لم يُضبط يُستخدم لون التمييز.</p>
          <button class="primary action-wide" type="submit">حفظ الإعدادات</button>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>قالب الفاتورة</h2>
              <p class="muted">اختر التصميم الذي تفضله لفاتورة PDF.</p>
            </div>
          </div>
          <div class="tpl-grid">
            ${Object.entries(INVOICE_TEMPLATES).map(([id, tpl]) => `
              <label class="tpl-card">
                <input type="radio" name="invoiceTemplate" value="${id}" ${state.settings.invoiceTemplate === id ? "checked" : ""}>
                <span class="tpl-check" aria-hidden="true"></span>
                <span class="tpl-mini tpl-mini-${id}">
                  <span class="tpl-logo"></span>
                  <span class="tpl-s w60"></span>
                  <span class="tpl-s w45"></span>
                  <span class="tpl-hd"><span></span><span></span><span></span></span>
                  <span class="tpl-r"></span>
                  <span class="tpl-r"></span>
                </span>
                <span class="tpl-meta">
                  <strong>${tpl.label}</strong>
                  <small>${tpl.desc}</small>
                </span>
              </label>
            `).join("")}
          </div>
          <label class="check-line">
            <input id="showInvoiceQr" type="checkbox" ${state.settings.showInvoiceQr !== false ? "checked" : ""}>
            <span>
              <strong>إظهار رمز QR في الفواتير</strong>
              <small>عند التفعيل يظهر رمز QR للتحقق في فاتورة PDF والفاتورة الحرارية ومعاينة الفاتورة.</small>
            </span>
          </label>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>النسخ الاحتياطي والاسترجاع</h2>
              <p class="muted">تصدير بياناتك كملف وحفظها آمنة، أو استرجاع بيانات سابقة.</p>
            </div>
          </div>
          <div class="two">
            <button class="primary" id="exportBackupBtn" type="button">تصدير نسخة احتياطية (JSON)</button>
            <label class="primary ghost" style="display:grid;place-items:center;cursor:pointer;text-align:center;font-weight:800;padding:8px 13px">
              استرجاع نسخة احتياطية
              <input id="importBackupInput" type="file" accept=".json" style="display:none">
            </label>
          </div>
          ${storageMeterHtml()}
          <p class="muted" style="margin-top:10px">يتم حفظ الأصناف بالفواتير والإعدادات في ملف واحد يمكنك نقله لأي جهاز أو موبايل آخر.</p>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>أكواد الخصم</h2>
              <p class="muted">إنشاء وأدارة أكواد الخصم التي يمكن استخدامها عند البيع.</p>
            </div>
          </div>
          <div class="two">
            <label>كود الخصم <input id="couponCode" placeholder=" مثال: SALE20"></label>
            <label>النوع
              <select id="couponType"><option value="percent">نسبة %</option><option value="fixed">مبلغ ثابت</option></select>
            </label>
          </div>
          <div class="two">
            <label>القيمة <input id="couponValue" min="1" step="1" type="number" value="10"></label>
            <label>الحد الأقصى للاستخدام <input id="couponMaxUses" min="0" step="1" type="number" value="0" placeholder="0 = بلا حد"></label>
          </div>
          <label>انتهاء الصلاحية <input id="couponExpires" type="date"></label>
          <div class="two" style="margin-top:8px">
            <button class="primary" id="saveCouponBtn" type="button">حفظ الكود</button>
          </div>
          ${renderCouponsSettings()}
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>سجل التدقيق</h2>
              <p class="muted">مراقبة جميع العمليات الحساسة في النظام.</p>
            </div>
          </div>
          ${renderAuditLog()}
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>تصدير Excel</h2>
              <p class="muted">تصدير البيانات إلى ملف Excel.</p>
            </div>
          </div>
          <div class="two">
            <button class="ghost" id="exportProductsExcel" type="button">تصدير الأصناف</button>
            <button class="ghost" id="exportSalesExcel" type="button">تصدير المبيعات</button>
          </div>
          <div class="two" style="margin-top:8px">
            <button class="ghost" id="exportExpensesExcel" type="button">تصدير المصروفات</button>
            <button class="ghost" id="exportAllExcel" type="button">تصدير الكل</button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>استيراد الأصناف من Excel</h2>
              <p class="muted">استيراد أصناف من ملف Excel أو CSV مع معاينة قبل الاستيراد. الأعمدة المطلوبة: اسم الصنف، السعر. الباقي اختياري.</p>
            </div>
          </div>
          <div class="two">
            <label class="primary ghost" style="display:grid;place-items:center;cursor:pointer;text-align:center;font-weight:800;padding:8px 13px">
              اختر ملف Excel / CSV
              <input id="importExcelInput" type="file" accept=".xlsx,.xls,.csv" style="display:none">
            </label>
            <button class="ghost" id="downloadExcelTemplate" type="button">تحميل نموذج فارغ</button>
          </div>
          <div id="excelImportPreview" style="margin-top:12px"></div>
        </section>

        <section class="panel" style="border-color:rgba(183, 67, 67, .3);background:rgba(183, 67, 67, .02)">
          <div class="panel-head">
            <div>
              <h2 style="color:var(--danger)">منطقة الخطر: ضبط المصنع</h2>
              <p class="muted">مسح كل الأصناف والفواتير والشعار والبيانات وتفرير التطبيق بالكامل.</p>
            </div>
          </div>
          <p class="muted">سيتم مسح جميع الأصناف والفواتير والشعار والبيانات المحفوظة وتفريغ النظام 100% لبدء العمل من الصفر.</p>
          <div class="two">
            <button class="danger action-wide" id="factoryResetBtn" type="button" style="background:var(--danger);color:#fff">إعادة ضبط المصنع نهائياً</button>
            <button class="ghost action-wide" id="loadDemoDataBtn" type="button">إضافة الأصناف التجريبية</button>
          </div>
        </section>
      </form>
    `;
  }

  function compactList(items, renderItem) {
    return `<div class="compact-list">${items.map(item => `<article class="compact-row">${renderItem(item)}</article>`).join("")}</div>`;
  }

  function barChart(rows, colorClass) {
    if (!rows.length) return `<div class="empty">لا توجد بيانات بعد.</div>`;
    const max = Math.max(...rows.map(row => row.value), 1);
    return `
      <div class="chart-bars">
        ${rows.map(row => `
          <div class="bar-row">
            <span>${escapeHtml(row.label)}</span>
            <div class="bar-track"><div class="bar-fill ${colorClass}" style="width:${Math.max(5, (row.value / max) * 100)}%"></div></div>
            <strong>${row.display || formatMoney(row.value)}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function wireViewEvents() {
    app.querySelectorAll("[data-go]").forEach(button => {
      button.addEventListener("click", () => go(button.dataset.go));
    });
    app.querySelectorAll("[data-add-cart]").forEach(button => {
      button.addEventListener("click", () => addToCart(button.dataset.addCart));
    });
    app.querySelectorAll("[data-edit-product]").forEach(button => {
      button.addEventListener("click", () => openProductDialog(button.dataset.editProduct));
    });
    app.querySelectorAll("[data-view-invoice]").forEach(button => {
      button.addEventListener("click", () => showInvoice(button.dataset.viewInvoice));
    });
    app.querySelectorAll("[data-product-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._productView = button.dataset.productView;
        saveSession();
        render();
        document.getElementById("content").scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    app.querySelectorAll("[data-sale-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._saleView = button.dataset.saleView;
        saveSession();
        render();
        document.getElementById("content").scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    app.querySelectorAll("[data-invoice-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._invoiceView = button.dataset.invoiceView;
        saveSession();
        render();
        document.getElementById("content").scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    const search = document.getElementById("productSearch");
    const debouncedSearch = _debounce(value => {
      state.search = value;
      state._productDisplayLimit = PRODUCT_PAGE_SIZE;
      state._saleDisplayLimit = SALE_PAGE_SIZE;
      render();
    }, 250);
    if (search) search.addEventListener("input", event => debouncedSearch(event.target.value));
    const category = document.getElementById("categoryFilter");
    if (category) category.addEventListener("change", event => {
      state.category = event.target.value;
      state._productDisplayLimit = PRODUCT_PAGE_SIZE;
      state._saleDisplayLimit = SALE_PAGE_SIZE;
      render();
    });
    const clear = document.getElementById("clearFiltersButton");
    if (clear) clear.addEventListener("click", () => {
      state.search = "";
      state.category = "الكل";
      state._productDisplayLimit = PRODUCT_PAGE_SIZE;
      state._saleDisplayLimit = SALE_PAGE_SIZE;
      render();
    });
    const addProduct = document.getElementById("addProductButton");
    if (addProduct) addProduct.addEventListener("click", () => openProductDialog());
    const showMoreProducts = document.getElementById("showMoreProductsButton");
    if (showMoreProducts) showMoreProducts.addEventListener("click", () => {
      state._productDisplayLimit = Math.max(PRODUCT_PAGE_SIZE, Number(state._productDisplayLimit || PRODUCT_PAGE_SIZE)) + PRODUCT_PAGE_SIZE;
      saveSession();
      render();
    });
    const showMoreSaleProducts = document.getElementById("showMoreSaleProductsButton");
    if (showMoreSaleProducts) showMoreSaleProducts.addEventListener("click", () => {
      state._saleDisplayLimit = Math.max(SALE_PAGE_SIZE, Number(state._saleDisplayLimit || SALE_PAGE_SIZE)) + SALE_PAGE_SIZE;
      saveSession();
      render();
    });

    app.querySelectorAll("[data-cart-inc]").forEach(button => button.addEventListener("click", () => changeCartQty(button.dataset.cartInc, 1)));
    app.querySelectorAll("[data-cart-dec]").forEach(button => button.addEventListener("click", () => changeCartQty(button.dataset.cartDec, -1)));
    app.querySelectorAll("[data-cart-remove]").forEach(button => button.addEventListener("click", () => removeFromCart(button.dataset.cartRemove)));

    const discount = document.getElementById("discountAmount");
    const shipping = document.getElementById("shippingAmount");
    const updateTotals = () => {
      const totals = document.getElementById("cartTotals");
      const taxFree = !!document.getElementById("taxFreeToggle")?.checked;
      if (totals) totals.outerHTML = cartTotalsHtml(Number(discount?.value || 0), Number(shipping?.value || 0), taxFree);
      state._saleDiscount = Math.max(0, Number(discount?.value || 0));
      state._saleShipping = Math.max(0, Number(shipping?.value || 0));
      state._saleTaxFree = taxFree;
      saveSession();
    };
    if (discount) discount.addEventListener("input", updateTotals);
    if (shipping) shipping.addEventListener("input", updateTotals);
    const taxFreeToggle = document.getElementById("taxFreeToggle");
    if (taxFreeToggle) taxFreeToggle.addEventListener("change", updateTotals);
    const paymentMethod = document.getElementById("paymentMethod");
    if (paymentMethod) paymentMethod.addEventListener("change", () => {
      state._salePayment = paymentMethod.value;
      const hint = document.getElementById("creditHint");
      if (hint) hint.style.display = paymentMethod.value === "آجل" ? "" : "none";
      saveSession();
    });
    const couponBtn = document.getElementById("applyCouponBtn");
    if (couponBtn) couponBtn.addEventListener("click", () => {
      const code = document.getElementById("couponInput")?.value.trim();
      if (!code) { toastMessage("أدخل كود الخصم أولاً"); return; }
      const subtotal = state.cart.reduce((sum, line) => {
        const p = state.products.find(item => item.id === line.productId);
        return sum + (p ? p.price * line.qty : 0);
      }, 0);
      const result = applyCoupon(code, subtotal);
      if (result.valid) {
        state._saleDiscount = result.discount;
        state._saleCoupon = code;
        const discountInput = document.getElementById("discountAmount");
        if (discountInput) { discountInput.value = result.discount; discountInput.dispatchEvent(new Event("input")); }
        auditLog("coupon", `تطبيق كود "${code}" — خصم ${formatMoney(result.discount)}`);
        toastMessage(result.message);
      } else {
        toastMessage(result.message);
      }
      saveSession();
    });
    const checkout = document.getElementById("checkoutButton");
    if (checkout) checkout.addEventListener("click", checkoutCart);

    // Drill-down metric clicks
    app.querySelectorAll("[data-drill-view]").forEach(card => {
      card.addEventListener("click", () => {
        const view = card.dataset.drillView;
        const filter = card.dataset.drillFilter;
        if (!view) return;

        if (view === "invoices") {
          state._invoiceFilter = filter === "today" ? "today" : "all";
        } else if (view === "products") {
          state._showLowStockOnly = filter === "low";
        } else if (view === "reports") {
          if (filter === "today") {
            const todayDate = new Date();
            const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            state._reportFrom = iso(todayDate);
            state._reportTo = iso(todayDate);
            state.report.type = "summary";
          } else if (filter === "profitability") {
            state.report.type = "margins";
          } else if (filter === "inventory") {
            state.report.type = "inventory";
          } else if (filter === "pl") {
            state.report.type = "pl";
          }
        }
        go(view);
        if (state.view === view) render();
      });
    });

    const clearInvFilter = document.getElementById("clearInvoiceFilterBtn");
    if (clearInvFilter) clearInvFilter.addEventListener("click", () => {
      state._invoiceFilter = "all";
      render();
    });

    const clearLowFilter = document.getElementById("clearLowStockFilterBtn");
    if (clearLowFilter) clearLowFilter.addEventListener("click", () => {
      state._showLowStockOnly = false;
      state._productDisplayLimit = PRODUCT_PAGE_SIZE;
      render();
    });

    // Sale customer prefill sync
    let _lastAutoDiscountCustomer = "";
    const customerNameInput = document.getElementById("customerName");
    if (customerNameInput) customerNameInput.addEventListener("input", () => {
      state._saleCustomerName = customerNameInput.value;
      const record = customerRecord(customerNameInput.value);
      const phoneInput = document.getElementById("customerPhone");
      if (record && phoneInput && !phoneInput.value && record.phone) {
        phoneInput.value = record.phone;
        state._saleCustomerPhone = record.phone;
      }
      if (record && Number(record.discount || 0) > 0 && _lastAutoDiscountCustomer !== record.name) {
        const discountInput = document.getElementById("discountAmount");
        if (discountInput) {
          discountInput.value = String(record.discount);
          state._saleDiscount = Number(record.discount);
          discountInput.dispatchEvent(new Event("input"));
        }
        _lastAutoDiscountCustomer = record.name;
      } else if (!record || Number(record.discount || 0) <= 0) {
        _lastAutoDiscountCustomer = "";
      }
      saveSession();
    });
    const customerPhoneInput = document.getElementById("customerPhone");
    if (customerPhoneInput) customerPhoneInput.addEventListener("input", () => {
      state._saleCustomerPhone = customerPhoneInput.value;
      saveSession();
    });

    // Customers screen
    const customerSearch = document.getElementById("customerSearch");
    if (customerSearch) customerSearch.addEventListener("input", event => {
      state._custQuery = event.target.value;
      render();
    });
    const customerSort = document.getElementById("customerSort");
    if (customerSort) customerSort.addEventListener("change", event => {
      state._custSort = event.target.value;
      render();
    });
    app.querySelectorAll("[data-cust-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._custView = button.dataset.custView;
        saveSession();
        render();
        document.getElementById("content").scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    app.querySelectorAll("[data-cust-sort]").forEach(button => {
      button.addEventListener("click", () => {
        state._custSort = button.dataset.custSort;
        render();
      });
    });
    app.querySelectorAll("[data-cust-open], [data-cust-history]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        state._custOpen = button.dataset.custOpen || button.dataset.custHistory || "";
        render();
      });
    });
    app.querySelectorAll("[data-cust-close]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        state._custOpen = "";
        render();
      });
    });
    app.querySelectorAll("[data-cust-sell]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        const customer = getCustomersData().find(item => item.name === button.dataset.custSell);
        state._saleCustomerName = customer ? customer.name : "";
        state._saleCustomerPhone = customer ? customer.phone : "";
        state._saleDiscount = customer ? Number(customer.discount || 0) : state._saleDiscount;
        state._custOpen = "";
        saveSession();
        go("sale");
      });
    });
    app.querySelectorAll("[data-cust-pay]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        openPaymentDialog(button.dataset.custPay);
      });
    });
    app.querySelectorAll("[data-cust-add]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        openCustomerDialog();
      });
    });
    app.querySelectorAll("[data-cust-edit]").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        openCustomerDialog(button.dataset.custEdit);
      });
    });
    const confirmCustomerButton = document.getElementById("confirmCustomerButton");
    if (confirmCustomerButton) confirmCustomerButton.addEventListener("click", saveCustomerForm);
    const deleteCustomerButton = document.getElementById("deleteCustomerButton");
    if (deleteCustomerButton) deleteCustomerButton.addEventListener("click", deleteCustomerFromForm);
    const customerPhotoInput = document.getElementById("customerPhoto");
    if (customerPhotoInput) customerPhotoInput.addEventListener("change", previewCustomerPhoto);
    const customerPhotoClear = document.getElementById("customerPhotoClear");
    if (customerPhotoClear) customerPhotoClear.addEventListener("click", () => {
      const preview = document.getElementById("customerPhotoPreview");
      const input = document.getElementById("customerPhoto");
      if (preview) { preview.removeAttribute("src"); preview.classList.remove("has-photo"); delete preview.dataset.image; }
      if (input) input.value = "";
      customerPhotoClear.hidden = true;
    });

    const confirmPaymentButton = document.getElementById("confirmPaymentButton");
    if (confirmPaymentButton) confirmPaymentButton.addEventListener("click", confirmPayment);
    const paymentCustomerName = document.getElementById("paymentCustomerName");
    if (paymentCustomerName) paymentCustomerName.addEventListener("input", () => {
      const debt = customerDebt(paymentCustomerName.value);
      document.getElementById("paymentDialogHint").textContent = debt > 0
        ? `الرصيد المستحق على «${paymentCustomerName.value}» هو ${formatMoney(debt)}.`
        : debt === 0 && paymentCustomerName.value.trim()
          ? `«${paymentCustomerName.value}» لا يمتلك رصيداً مستحقاً.`
          : "";
    });
    const paymentAmount = document.getElementById("paymentAmount");
    if (paymentAmount) paymentAmount.addEventListener("input", () => {
      const debt = customerDebt(paymentCustomerName?.value || "");
      const hint = document.getElementById("paymentDialogHint");
      if (debt > 0 && Number(paymentAmount.value) > debt) hint.textContent = `المبلغ أكبر من الرصيد المستحق (${formatMoney(debt)}) — سيُحتسب الفائض رصيداً مدفوعاً مقدماً.`;
      else if (debt > 0) hint.textContent = `الرصيد المستحق على «${paymentCustomerName.value}» هو ${formatMoney(debt)}.`;
    });

    const addExpenseButton = document.getElementById("addExpenseButton");
    if (addExpenseButton) addExpenseButton.addEventListener("click", addExpense);
    const expenseSearch = document.getElementById("expenseSearch");
    if (expenseSearch) expenseSearch.addEventListener("input", () => {
      state._expQuery = expenseSearch.value;
      render();
    });
    const expenseFrom = document.getElementById("expenseFrom");
    if (expenseFrom) expenseFrom.addEventListener("change", () => {
      state._expFrom = expenseFrom.value;
      render();
    });
    const expenseTo = document.getElementById("expenseTo");
    if (expenseTo) expenseTo.addEventListener("change", () => {
      state._expTo = expenseTo.value;
      render();
    });
    const expenseClearFilters = document.getElementById("expenseClearFilters");
    if (expenseClearFilters) expenseClearFilters.addEventListener("click", () => {
      state._expQuery = "";
      state._expFrom = "";
      state._expTo = "";
      render();
    });
    app.querySelectorAll("[data-exp-del]").forEach(button => {
      button.addEventListener("click", async () => {
        const expense = state.expenses.find(item => item.id === button.dataset.expDel);
        if (!expense) return;
        const ok = await confirmDialogPrompt(
          "حذف المصروف",
          `حذف مصروف «${expense.category}» بمبلغ ${formatMoney(expense.amount)} بتاريخ ${dateTime(expense.date)}؟`
        );
        if (!ok) return;
        await commitState({ expenses: state.expenses.filter(item => item.id !== expense.id) });
        toastMessage("تم حذف المصروف");
        render();
      });
    });

    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) settingsForm.addEventListener("submit", saveSettings);
    if (document.getElementById("storageMeter")) refreshStorageMeter();
    app.querySelectorAll("input[name='invoiceTemplate']").forEach(input => {
      input.addEventListener("change", async () => {
        const nextSettings = { ...state.settings, invoiceTemplate: input.value };
        if (!(await commitState({ settings: nextSettings }))) {
          showStorageFullDialog();
          return;
        }
        toastMessage(`تم اختيار قالب الفاتورة: ${(INVOICE_TEMPLATES[input.value] || {}).label || input.value}`);
      });
    });

    // Logo upload
    const logoUpload = document.getElementById("logoUpload");
    if (logoUpload) logoUpload.addEventListener("change", handleLogoUpload);
    const removeLogo = document.getElementById("removeLogoBtn");
    if (removeLogo) removeLogo.addEventListener("click", async () => {
      const nextSettings = { ...state.settings, logo: "" };
      if (!(await commitState({ settings: nextSettings }))) {
        showStorageFullDialog();
        return;
      }
      applySettings();
      render();
      toastMessage("تم إزالة الشعار");
    });

    // Reports filters
    // Report builder
    app.querySelectorAll("input[name='reportType']").forEach(input => {
      input.addEventListener("change", () => {
        state.report.type = input.value;
        render();
        toastMessage(`تم اختيار تقرير: ${(reportTypes.find(type => type.id === state.report.type) || {}).label || ''}`);
      });
    });
    const reportExtractBtn = document.getElementById("reportExtractBtn");
    if (reportExtractBtn) reportExtractBtn.addEventListener("click", extractReport);
    app.querySelectorAll("[data-report-preset]").forEach(button => {
      button.addEventListener("click", () => applyReportPreset(button.dataset.reportPreset));
    });
    const clearReportFiltersBtn = document.getElementById("reportClearFilters");
    if (clearReportFiltersBtn) clearReportFiltersBtn.addEventListener("click", clearReportFilters);
    const clearReportFiltersChips = document.getElementById("reportClearFiltersChips");
    if (clearReportFiltersChips) clearReportFiltersChips.addEventListener("click", clearReportFilters);
    const exportReportPdf = document.getElementById("exportReportPdfBtn");
    if (exportReportPdf) exportReportPdf.addEventListener("click", exportReportAsPdf);
    const exportReportPdfHeader = document.getElementById("exportReportPdfHeaderBtn");
    if (exportReportPdfHeader) exportReportPdfHeader.addEventListener("click", exportReportAsPdf);
    app.querySelectorAll("[data-quick-report]").forEach(button => {
      button.addEventListener("click", () => {
        state.report.type = button.dataset.quickReport;
        render();
        toastMessage(`تم اختيار تقرير: ${(reportTypes.find(type => type.id === state.report.type) || {}).label || ''}`);
      });
    });
    app.querySelectorAll("[data-drill-view]").forEach(card => {
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
    });

    // Backup & Factory Reset
    const exportBackupBtn = document.getElementById("exportBackupBtn");
    if (exportBackupBtn) exportBackupBtn.addEventListener("click", exportBackup);
    const importBackupInput = document.getElementById("importBackupInput");
    if (importBackupInput) importBackupInput.addEventListener("change", handleBackupImport);
    const factoryResetBtn = document.getElementById("factoryResetBtn");
    if (factoryResetBtn) factoryResetBtn.addEventListener("click", factoryReset);
    const loadDemoDataBtn = document.getElementById("loadDemoDataBtn");
    if (loadDemoDataBtn) loadDemoDataBtn.addEventListener("click", loadDemoData);
    const saveCouponBtn = document.getElementById("saveCouponBtn");
    if (saveCouponBtn) saveCouponBtn.addEventListener("click", saveCouponFromForm);
    app.querySelectorAll(".delete-coupon-btn").forEach(btn => btn.addEventListener("click", () => deleteCoupon(Number(btn.dataset.couponIdx))));
    const exportProductsExcel = document.getElementById("exportProductsExcel");
    if (exportProductsExcel) exportProductsExcel.addEventListener("click", () => exportExcel("products"));
    const exportSalesExcel = document.getElementById("exportSalesExcel");
    if (exportSalesExcel) exportSalesExcel.addEventListener("click", () => exportExcel("sales"));
    const exportExpensesExcel = document.getElementById("exportExpensesExcel");
    if (exportExpensesExcel) exportExpensesExcel.addEventListener("click", () => exportExcel("expenses"));
    const exportAllExcel = document.getElementById("exportAllExcel");
    if (exportAllExcel) exportAllExcel.addEventListener("click", () => exportExcel("all"));
    const importExcelInput = document.getElementById("importExcelInput");
    if (importExcelInput) importExcelInput.addEventListener("change", handleExcelImport);
    const downloadExcelTemplateBtn = document.getElementById("downloadExcelTemplate");
    if (downloadExcelTemplateBtn) downloadExcelTemplateBtn.addEventListener("click", () => { if (window.XLSX) downloadExcelTemplate(); else ensureSheetJs().then(ok => { if (ok) downloadExcelTemplate(); }); });
  }

  function openProductDialog(productId) {
    const product = productId ? state.products.find(item => item.id === productId) : null;
    document.getElementById("productDialogTitle").textContent = product ? "تعديل صنف" : "إضافة صنف";
    document.getElementById("productId").value = product?.id || "";
    document.getElementById("productName").value = product?.name || "";
    document.getElementById("productSku").value = product?.sku || generateSku();
    document.getElementById("productCategory").value = product?.category || "نسائي";
    document.getElementById("productSize").value = product?.size || "";
    document.getElementById("productColor").value = product?.color || "";
    document.getElementById("productQty").value = product?.quantity ?? 1;
    document.getElementById("productPrice").value = product?.price ?? "";
    document.getElementById("productCost").value = product?.cost ?? "";
    document.getElementById("productLow").value = product?.lowStock ?? 3;
    document.getElementById("productImage").value = "";
    const preview = document.getElementById("imagePreview");
    preview.src = product?.image || "assets/product-form-preview.png";
    preview.dataset.image = product?.image || "assets/product-form-preview.png";
    document.getElementById("deleteProductButton").hidden = !product;
    productDialog.showModal();
  }

  function previewProductImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    compressImageFile(file, PRODUCT_IMAGE_MAX_SIZE, PRODUCT_IMAGE_QUALITY)
      .then(dataUrl => {
        const preview = document.getElementById("imagePreview");
        preview.src = dataUrl;
        preview.dataset.image = dataUrl;
      })
      .catch(() => readFileAsDataUrl(file).then(dataUrl => {
        const preview = document.getElementById("imagePreview");
        preview.src = dataUrl;
        preview.dataset.image = dataUrl;
      }));
  }

  function previewCustomerPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    compressImageFile(file, 360, 0.82)
      .then(dataUrl => {
        const preview = document.getElementById("customerPhotoPreview");
        const clear = document.getElementById("customerPhotoClear");
        if (preview) {
          preview.src = dataUrl;
          preview.classList.add("has-photo");
          preview.dataset.image = dataUrl;
        }
        if (clear) clear.hidden = false;
      })
      .catch(() => readFileAsDataUrl(file).then(dataUrl => {
        const preview = document.getElementById("customerPhotoPreview");
        const clear = document.getElementById("customerPhotoClear");
        if (preview) {
          preview.src = dataUrl;
          preview.classList.add("has-photo");
          preview.dataset.image = dataUrl;
        }
        if (clear) clear.hidden = false;
      }));
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function compressImageFile(file, maxSize, quality) {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    if (scale >= 1 && file.size < 180000) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  const zoomState = {
    scale: 1,
    tx: 0,
    ty: 0,
    panning: false,
    panStartX: 0,
    panStartY: 0,
    panStartTx: 0,
    panStartTy: 0
  };

  function openImagePreview(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    const low = product.quantity <= product.lowStock;
    fillImagePreview({
      src: product.image || "assets/product-form-preview.png",
      name: product.name,
      details: `${product.sku} · ${product.category} · مقاس ${product.size} · لون ${product.color}`,
      price: formatMoney(product.price),
      stockText: low ? "مخزون منخفض" : "متاح",
      stockClass: low ? "low" : "ok"
    });
  }

  function openFormImagePreview(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const preview = document.getElementById("imagePreview");
    const size = document.getElementById("productSize").value.trim();
    const color = document.getElementById("productColor").value.trim();
    fillImagePreview({
      src: preview?.dataset.image || preview?.src || "assets/product-form-preview.png",
      name: document.getElementById("productName").value.trim() || "صنف جديد",
      details: [
        document.getElementById("productSku").value.trim(),
        document.getElementById("productCategory").value,
        size ? `مقاس ${size}` : "",
        color ? `لون ${color}` : ""
      ].filter(Boolean).join(" · ") || "معاينة الصورة",
      price: formatMoney(Number(document.getElementById("productPrice").value || 0)),
      stockText: "معاينة",
      stockClass: "ok"
    });
  }

  function fillImagePreview({ src, name, details, price, stockText, stockClass }) {
    imagePreviewDialog.showModal();
    const img = document.getElementById("imageZoomImg");
    img.src = src || "assets/product-form-preview.png";
    document.getElementById("imageZoomTitle").textContent = name || "معاينة الصورة";
    document.getElementById("imageZoomName").textContent = name || "";
    document.getElementById("imageZoomDetails").textContent = details || "";
    document.getElementById("imageZoomPrice").textContent = price || "";
    const stock = document.getElementById("imageZoomStock");
    stock.textContent = stockText || "";
    stock.className = `status-pill ${stockClass || "ok"}`;
    resetZoom();
  }

  function clampNum(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function zoomStageRect() {
    return document.getElementById("imageZoomStage").getBoundingClientRect();
  }

  function updateZoomLevel() {
    const level = document.getElementById("imageZoomLevel");
    if (level) level.textContent = zoomState.scale <= 1.01 ? "ملاءمة" : `${Math.round(zoomState.scale * 100)}%`;
  }

  function applyZoomTransform() {
    const img = document.getElementById("imageZoomImg");
    const rect = zoomStageRect();
    const dispW = img.clientWidth * zoomState.scale;
    const dispH = img.clientHeight * zoomState.scale;
    zoomState.tx = clampNum(zoomState.tx, -dispW / 2, dispW / 2);
    zoomState.ty = clampNum(zoomState.ty, -dispH / 2, dispH / 2);
    img.style.transform = `translate3d(${zoomState.tx}px, ${zoomState.ty}px, 0) scale(${zoomState.scale})`;
    img.classList.toggle("zoomed", zoomState.scale > 1.01);
  }

  function resetZoom() {
    zoomState.scale = 1;
    zoomState.tx = 0;
    zoomState.ty = 0;
    applyZoomTransform();
    updateZoomLevel();
  }

  function zoomAtCursor(nextScale, clientX, clientY) {
    const img = document.getElementById("imageZoomImg");
    if (!img.clientWidth || !img.clientHeight) return;
    const rect = zoomStageRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const s0 = zoomState.scale;
    const s1 = clampNum(nextScale, 1, 8);
    const dispW0 = img.clientWidth * s0;
    const dispH0 = img.clientHeight * s0;
    const nx = (px - rect.width / 2 - zoomState.tx) / dispW0 + 0.5;
    const ny = (py - rect.height / 2 - zoomState.ty) / dispH0 + 0.5;
    zoomState.scale = s1;
    zoomState.tx = (px - rect.width / 2) - (nx - 0.5) * img.clientWidth * s1;
    zoomState.ty = (py - rect.height / 2) - (ny - 0.5) * img.clientHeight * s1;
    applyZoomTransform();
    updateZoomLevel();
  }

  async function saveProductFromForm(event) {
    event.preventDefault();
    const id = document.getElementById("productId").value || cryptoRandomId("p");
    const sku = document.getElementById("productSku").value.trim();
    const duplicateSku = activeProducts().some(item => item.id !== id && String(item.sku || "").trim().toLowerCase() === sku.toLowerCase());
    if (duplicateSku) {
      toastMessage("رمز SKU مستخدم بالفعل لصنف آخر");
      return;
    }
    const existing = state.products.find(item => item.id === id);
    const product = {
      ...(existing || {}),
      id,
      name: document.getElementById("productName").value.trim(),
      sku,
      category: document.getElementById("productCategory").value,
      size: document.getElementById("productSize").value.trim(),
      color: document.getElementById("productColor").value.trim(),
      quantity: Number(document.getElementById("productQty").value || 0),
      price: Number(document.getElementById("productPrice").value || 0),
      cost: Number(document.getElementById("productCost").value || 0),
      lowStock: Number(document.getElementById("productLow").value || 0),
      image: document.getElementById("imagePreview").dataset.image || "assets/product-form-preview.png",
      archived: false,
      updatedAt: new Date().toISOString()
    };
    const nextProducts = state.products.slice();
    const index = nextProducts.findIndex(item => item.id === id);
    if (index >= 0) nextProducts[index] = product;
    else nextProducts.unshift({ ...product, createdAt: new Date().toISOString() });
    if (!(await commitState({ products: nextProducts }))) {
      await showStorageFullDialog();
      return;
    }
    productDialog.close();
    toastMessage("تم حفظ الصنف");
    render();
  }

  async function deleteProductFromForm() {
    const id = document.getElementById("productId").value;
    if (!id) return;
    const product = state.products.find(item => item.id === id);
    if (!product) return;
    const invoiceCount = state.sales.filter(sale => sale.items.some(item => item.productId === id)).length;
    const ok = await confirmDialogPrompt(
      "حذف الصنف نهائياً",
      `سيتم حذف الصنف "${product.name}" نهائياً من السجل ولا يمكن التراجع عن هذا الإجراء.` +
      (invoiceCount > 0
        ? `\n\nظهر هذا الصنف في ${invoiceCount} فاتورة محفوظة — ستبقى تلك الفواتير كما هي ببياناتها، لكن لن تعود كمياته إلى المخزون عند أي إرجاع لاحق.`
        : `\n\nلم يظهر هذا الصنف في أي فاتورة محفوظة، وسيتم حذفه بالكامل.`),
      "حذف نهائي"
    );
    if (!ok) return;
    const nextProducts = state.products.filter(item => item.id !== id);
    const nextCart = state.cart.filter(line => line.productId !== id);
    if (!(await commitState({ products: nextProducts }))) {
      await showStorageFullDialog();
      return;
    }
    state.cart = nextCart;
    if (state._returnSel) delete state._returnSel[id];
    saveSession();
    productDialog.close();
    auditLog("delete", `حذف الصنف "${product.name}" (${product.sku || "بدون SKU"})`);
    toastMessage(`تم حذف الصنف "${product.name}" نهائياً`);
    render();
  }

  function addToCart(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product || product.archived || product.quantity <= 0) {
      toastMessage("هذا الصنف غير متاح في المخزون");
      return;
    }
    const line = state.cart.find(item => item.productId === productId);
    if (line) {
      if (line.qty >= product.quantity) {
        toastMessage("لا يمكن تجاوز الكمية المتاحة");
        return;
      }
      line.qty += 1;
    } else {
      state.cart.push({ productId, qty: 1 });
    }
    toastMessage("تمت الإضافة للسلة");
    saveSession();
    if (state.view === "sale") render();
  }

  function changeCartQty(productId, delta) {
    const product = state.products.find(item => item.id === productId);
    const line = state.cart.find(item => item.productId === productId);
    if (!product || product.archived || !line) return;
    const next = line.qty + delta;
    if (next <= 0) return removeFromCart(productId);
    if (next > product.quantity) {
      toastMessage("الكمية المطلوبة أكبر من المخزون");
      return;
    }
    line.qty = next;
    saveSession();
    render();
  }

  function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    saveSession();
    render();
  }

  async function checkoutCart() {
    if (!state.cart.length) {
      toastMessage("أضف صنفا واحدا على الأقل للسلة");
      return;
    }
    const invalidLine = state.cart.find(line => {
      const product = state.products.find(item => item.id === line.productId);
      return !product || product.archived || product.quantity <= 0 || line.qty > product.quantity;
    });
    if (invalidLine) {
      toastMessage("راجع السلة: يوجد صنف غير متاح أو كمية أكبر من المخزون");
      state.cart = state.cart.filter(line => {
        const product = state.products.find(item => item.id === line.productId);
        return product && !product.archived && product.quantity > 0;
      }).map(line => {
        const product = state.products.find(item => item.id === line.productId);
        return { productId: line.productId, qty: Math.min(line.qty, product.quantity) };
      });
      saveSession();
      render();
      return;
    }
    const discount = Number(document.getElementById("discountAmount")?.value || 0);
    const shipping = Number(document.getElementById("shippingAmount")?.value || 0);
    const taxFree = !!document.getElementById("taxFreeToggle")?.checked;
    const totals = calculateCartTotals(discount, shipping, taxFree);
    const customerName = document.getElementById("customerName")?.value.trim() || "عميل نقدي";
    const paymentMethod = document.getElementById("paymentMethod")?.value || "نقدا";
    if (paymentMethod === "آجل" && (!customerName || customerName === "عميل نقدي")) {
      toastMessage("البيع الآجل يتطلب إدخال اسم العميل");
      return;
    }
    const sale = {
      id: cryptoRandomId("s"),
      number: `INV-${new Date().getFullYear()}-${String(state.sales.length + 1).padStart(4, "0")}`,
      date: new Date().toISOString(),
      customerName,
      customerPhone: document.getElementById("customerPhone")?.value.trim() || "",
      paymentMethod,
      taxRate: state.settings.taxRate,
      discount: totals.discount,
      shipping: totals.shipping,
      subtotal: totals.subtotal,
      taxFree,
      tax: totals.tax,
      total: totals.total,
      items: state.cart.map(line => {
        const product = state.products.find(item => item.id === line.productId);
        return {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          size: product.size,
          color: product.color,
          qty: line.qty,
          price: product.price,
          cost: product.cost,
          total: product.price * line.qty
        };
      })
    };
    const nextProducts = state.products.map(productItem => {
      const line = state.cart.find(cartLine => cartLine.productId === productItem.id);
      return line ? { ...productItem, quantity: Math.max(0, productItem.quantity - line.qty) } : productItem;
    });
    const nextSales = state.sales.concat(sale);
    const customerPhone = sale.customerPhone || "";
    const existingCustomer = customerRecord(customerName);
    if (existingCustomer && customerPhone && !existingCustomer.phone) {
      existingCustomer.phone = customerPhone;
    }
    if (!(await commitState({ products: nextProducts, sales: nextSales }))) {
      showStorageFullDialog();
      return;
    }
    if (customerName !== "عميل نقدي") {
      ensureCustomerRegistered(customerName, customerPhone);
    }
    await commitState({});
    state.cart = [];
    state._saleCustomerName = "";
    state._saleCustomerPhone = "";
    state._saleDiscount = 0;
    state._saleShipping = 0;
    state._saleTaxFree = false;
    state._salePayment = "نقدا";
    state._saleCoupon = "";
    saveSession();
    render();
    showInvoice(sale.id);
    auditLog("sale", `فاتورة ${sale.number} — ${formatMoney(sale.total)}`);
    toastMessage("تم إصدار الفاتورة وتحديث المخزون");
  }

  function calculateCartTotals(discountValue, shippingValue, taxFree) {
    const subtotal = state.cart.reduce((sum, line) => {
      const product = state.products.find(item => item.id === line.productId);
      return sum + (product && !product.archived ? product.price * line.qty : 0);
    }, 0);
    const discount = Math.min(Math.max(Number(discountValue || 0), 0), subtotal);
    const shipping = Math.max(Number(shippingValue || 0), 0);
    const taxable = Math.max(subtotal - discount, 0);
    const tax = taxFree ? 0 : taxable * (Number(state.settings.taxRate || 0) / 100);
    return {
      subtotal,
      discount,
      shipping,
      tax,
      total: taxable + tax + shipping
    };
  }

  function saleReturnItems(sale) {
    return (sale.returns || []).flatMap(ret => ret.items || []);
  }

  function returnSummary(sale) {
    const items = saleReturnItems(sale);
    return {
      qty: items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
      amount: items.reduce((sum, item) => sum + Number(item.total != null ? item.total : (item.price || 0) * item.qty), 0),
      profit: items.reduce((sum, item) => sum + ((Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 0)), 0)
    };
  }

  function returnedQtyByProduct(sale) {
    const map = {};
    saleReturnItems(sale).forEach(item => {
      map[item.productId] = (map[item.productId] || 0) + Number(item.qty || 0);
    });
    return map;
  }

  function netSale(sale) {
    const returns = returnSummary(sale);
    const soldQty = sale.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const soldProfit = sale.items.reduce((sum, item) => sum + ((Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 0)), 0) - Number(sale.discount || 0);
    return {
      total: Number(sale.total || 0) - returns.amount,
      profit: soldProfit - returns.profit,
      qty: soldQty - returns.qty,
      returnAmount: returns.amount
    };
  }

  function showInvoice(invoiceId) {
    const sale = state.sales.find(item => item.id === invoiceId);
    if (!sale) return;
    state.currentInvoiceId = invoiceId;
    invoicePrintArea.innerHTML = invoiceHtml(sale);
    invoiceDialog.showModal();
  }

  function invoiceHtml(sale) {
    const tpl = INVOICE_TEMPLATES[state.settings.invoiceTemplate] || INVOICE_TEMPLATES.classic;
    const accent = docAccent();
    const invAccent = tpl.pdfAccent || accent;
    const logoHtml = state.settings.logo
      ? `<img class="invoice-logo" src="${escapeAttr(state.settings.logo)}" alt="شعار" style="width:${tpl.logoSize || 62}px;height:${tpl.logoSize || 62}px;border-radius:8px;">`
      : `<div class="invoice-mark" style="width:${tpl.logoSize || 62}px;height:${tpl.logoSize || 62}px;font-size:${Math.round((tpl.logoSize || 62) / 2)}px;">${escapeHtml(state.settings.storeName.charAt(0) || "خ")}</div>`;
    const net = netSale(sale);
    const returns = sale.returns || [];
    const companyLines = companyInfoLines();

    const storeFont = tpl.storeFont || "Cairo";
    const storeSize = tpl.storeSize || 23;
    const storeColor = tpl.storeColor || "var(--accent)";
    const subColor = tpl.subColor || "#374151";
    const ruleColor = tpl.ruleColor || "#CBD5E1";
    const ruleThickness = tpl.ruleThickness || 1.2;
    const sectionTitleColor = tpl.sectionTitleColor || accent;
    const itemMetaColor = tpl.itemMetaColor || "#94A3B8";
    const footerRuleColor = tpl.footerRule || "#CBD5E1";
    const footerTextColor = tpl.footerTextColor || "#374151";
    const thanksColor = tpl.thanksColor || "#374151";
    const headerStyle = tpl.headerStyle || "plain";
    const metaStyle = tpl.metaStyle || "fill";
    const totalsStyle = tpl.totalsStyle || "card";
    const grandStyle = tpl.grandStyle || "accent";
    const tableStripes = tpl.tableStripes !== false;

    let brandBg = "transparent";
    let brandBorder = "none";
    let brandPadding = "0 0 12px";
    let brandRadius = "0";
    let effectiveStoreColor = storeColor;
    let effectiveSubColor = subColor;
    let docHeadColor = invAccent;
    let docMetaColor = "#374151";
    let numTagBg = invAccent;
    let numTagFg = "#ffffff";
    if (headerStyle === "band" || headerStyle === "runway") {
      brandBg = invAccent;
      brandBorder = "none";
      brandPadding = "18px 20px";
      brandRadius = "10px";
      effectiveStoreColor = tpl.storeColor || "#ffffff";
      effectiveSubColor = tpl.subColor || "#e2f2ee";
      docHeadColor = "#ffffff";
      docMetaColor = "#e2f2ee";
      numTagBg = "#ffffff";
      numTagFg = invAccent;
    } else if (headerStyle === "boutique") {
      brandBg = tpl.pdfLight || "#fdf0f5";
      brandBorder = `1px solid ${tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.72) : "#f4bfd4"}`;
      brandPadding = "16px 18px";
      brandRadius = "10px";
      docHeadColor = tpl.metaTitleColor || invAccent;
    } else if (headerStyle === "atelier") {
      brandBg = tpl.pdfLight || "#f7f1e7";
      brandBorder = "1px solid #ded2bd";
      brandPadding = "16px 18px";
      brandRadius = "10px";
      docHeadColor = tpl.metaTitleColor || "#2d2a26";
    } else if (headerStyle === "dark-band") {
      brandBg = "#1c2430";
      brandBorder = "none";
      brandPadding = "18px 20px";
      brandRadius = "10px";
      effectiveStoreColor = tpl.storeColor || "#ffffff";
      effectiveSubColor = tpl.subColor || "#d7e0de";
      docHeadColor = "#ffffff";
      docMetaColor = "#d7e0de";
      numTagBg = "#ffffff";
      numTagFg = "#1c2430";
    }

    let cardBg = "#F8FAFC";
    let cardBorder = "1px solid #CBD5E1";
    if (metaStyle === "rose") {
      cardBg = tpl.pdfLight || "#fdf0f5";
      cardBorder = `1px solid ${tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.72) : "#f4bfd4"}`;
    } else if (metaStyle === "sand") {
      cardBg = tpl.pdfLight || "#f7f1e7";
      cardBorder = "1px solid #ded2bd";
    } else if (metaStyle === "mint") {
      cardBg = tpl.pdfLight || "#ecfdf9";
      cardBorder = "1px solid #99f6e4";
    } else if (metaStyle === "gold") {
      cardBg = "#f5f0e8";
      cardBorder = `1px solid ${tpl.gold || "#b08d57"}`;
    }

    let totalsBg = "#fff";
    let totalsBorder = "1px solid " + ruleColor;
    let totalsPadding = "14px";
    let totalsRadius = "10px";
    if (totalsStyle === "plain" || totalsStyle === "plain-gold") {
      totalsBg = "transparent";
      totalsBorder = "none";
      totalsPadding = "0";
      totalsRadius = "0";
    } else if (totalsStyle === "rose-card") {
      totalsBg = tpl.pdfLight || "#fdf0f5";
    } else if (totalsStyle === "sand-card") {
      totalsBg = tpl.pdfLight || "#f7f1e7";
    } else if (totalsStyle === "mint-card") {
      totalsBg = tpl.pdfLight || "#ecfdf9";
    }

    let grandBg = "transparent";
    let grandColor = "var(--accent)";
    let grandPadding = "0";
    let grandRadius = "0";
    let grandFont = "18px";
    const grandFill = (bg) => {
      grandBg = bg;
      grandColor = bg && !isDarkHex(bg) ? "#111827" : (tpl.grandText || "#ffffff");
      grandPadding = "14px 20px";
      grandRadius = "8px";
      grandFont = "18px";
    };
    if (grandStyle === "accent") {
      grandFill(tpl.totalRowColor || pdfColor(tpl.sectionTitleColor, accent));
    } else if (grandStyle === "rose") {
      grandFill("#7f1d4e");
    } else if (grandStyle === "sand") {
      grandFill("#4b4238");
    } else if (grandStyle === "mint") {
      grandFill("#164e49");
    } else if (grandStyle === "gold") {
      grandFill(tpl.gold || tpl.totalRowColor || "#55504a");
    }

    const metaCard = (title, rows) => {
      const bc = tpl.metaBorderColor || '#E5E7EB';
      return `
      <div class="inv-card" style="background:${cardBg};border:${cardBorder};">
        <h4 style="color:${tpl.metaTitleColor || invAccent};">${title}</h4>
        <table class="inv-card-table" style="width:100%;border-collapse:collapse;border:1px solid ${bc};">
          ${rows.map(([label, value]) => `<tr>
            <td style="padding:5px 8px;border:1px solid ${bc};white-space:nowrap;vertical-align:top;font-size:12px;color:${tpl.metaLabelColor || '#374151'};">${escapeHtml(label)}</td>
            <td style="padding:5px 8px;border:1px solid ${bc};text-align:right;vertical-align:top;font-size:13px;font-weight:700;color:${tpl.metaValueColor || '#172033'};">${escapeHtml(String(value))}</td>
          </tr>`).join("")}
        </table>
      </div>`;
    };

    return `
      <article class="invoice-paper" data-template="${state.settings.invoiceTemplate}" style="--inv-accent:${invAccent};print-color-adjust:exact;-webkit-print-color-adjust:exact;">
        <header class="invoice-brand" style="background:${brandBg};border:${brandBorder};padding:${brandPadding};border-radius:${brandRadius};print-color-adjust:exact;-webkit-print-color-adjust:exact;">
          <div class="invoice-brand-main">
            <div class="invoice-brand-text">
              <h2 style="font-family:${storeFont};font-size:${storeSize}px;color:${effectiveStoreColor};">${escapeHtml(state.settings.storeName)}</h2>
              <p style="color:${effectiveSubColor};">متجر ملابس وأزياء</p>
            </div>
            ${logoHtml}
          </div>
          <div class="invoice-dochead">
            <h3 style="color:${docHeadColor};">فاتورة مبيعات</h3>
            <span class="inv-num-tag" style="background:${numTagBg};color:${numTagFg};print-color-adjust:exact;-webkit-print-color-adjust:exact;">${escapeHtml(sale.number)}</span>
            <small style="color:${docMetaColor};font-size:12px;font-weight:500;">${dateTime(sale.date)}</small>
            ${sale.paymentMethod ? `<small style="color:${docMetaColor};font-size:12px;font-weight:500;">طريقة الدفع: ${escapeHtml(sale.paymentMethod)}</small>` : ""}
          </div>
        </header>
        <div class="inv-header-rule" style="background:${ruleColor};height:${ruleThickness}px;"></div>
        <section class="invoice-meta">
          ${metaCard("بيانات الفاتورة", [
            ["التاريخ", dateTime(sale.date)],
            ["طريقة الدفع", sale.paymentMethod || "نقدا"],
            ["عدد القطع", `${net.qty} قطعة`]
          ])}
          ${metaCard("بيانات العميل", [
            ["الاسم", sale.customerName || "عميل نقدي"],
            ["الهاتف", sale.customerPhone || "—"]
          ])}
        </section>
        <h4 class="invoice-section-title" style="color:${sectionTitleColor};">تفاصيل الفاتورة</h4>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>#</th>
              <th>صورة</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map((item, index) => {
              const image = saleItemImage(item);
              const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
              return `
              <tr>
                <td>${index + 1}</td>
                <td class="invoice-thumb">${image ? `<img src="${escapeAttr(image)}" alt="${escapeHtml(item.name)}">` : ""}</td>
                <td>${escapeHtml(item.name)}<br><small style="color:${itemMetaColor};">${escapeHtml(metaLine)}</small></td>
                <td>${item.qty}</td>
                <td>${formatMoney(item.price)}</td>
                <td><strong>${formatMoney(item.total)}</strong></td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>
        ${returns.length ? `
        <section class="invoice-returns">
          <h3>المرتجعات</h3>
          ${returns.map(ret => `
            <div class="return-block">
              <div class="return-head">
                <span>${dateTime(ret.date)}</span>
                ${ret.reason ? `<span class="muted">${escapeHtml(ret.reason)}</span>` : ""}
                <strong>− ${formatMoney(ret.total)}</strong>
              </div>
              <ul>
                ${ret.items.map(item => `<li>${escapeHtml(item.name)} × ${item.qty} — ${formatMoney(item.total)}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </section>` : ""}
        <section class="cart-totals" style="background:${totalsBg};border:${totalsBorder};padding:${totalsPadding};border-radius:${totalsRadius};">
          <div class="total-row"><span>المجموع الفرعي</span><strong>${formatMoney(sale.subtotal)}</strong></div>
          <div class="total-row"><span>الخصم</span><strong>${formatMoney(sale.discount)}</strong></div>
          ${sale.taxFree
            ? ""
            : `<div class="total-row"><span>ضريبة ${sale.taxRate}%</span><strong>${formatMoney(sale.tax)}</strong></div>`}
          ${sale.shipping ? `<div class="total-row"><span>مصاريف الشحن</span><strong>${formatMoney(sale.shipping)}</strong></div>` : ""}
          ${net.returnAmount > 0 ? `<div class="total-row return"><span>المجموع المرتجع</span><strong>− ${formatMoney(net.returnAmount)}</strong></div>` : ""}
          <div class="total-row grand" style="background:${grandBg};color:${grandColor};padding:${grandPadding};border-radius:${grandRadius};font-size:${grandFont};${grandStyle === 'text' ? 'border-top:2px solid ' + ruleColor + ';' : 'border:none;'}"><span>الإجمالي النهائي</span><strong>${formatMoney(net.total)}</strong></div>
          <div class="total-row words" style="border-top:1px dashed ${ruleColor};"><span>المبلغ بالحروف</span><strong>${escapeHtml(amountInWords(net.total))}</strong></div>
        </section>
        <section class="code-strip" style="border-top:${ruleThickness}px solid ${footerRuleColor};color:${footerTextColor};">
          ${state.settings.showInvoiceQr !== false ? `<div class="qr">${qrCells(sale.number)}</div>` : ""}
          <div class="barcode">${barcodeLines(sale.number)}</div>
          <p class="barcode-label">${escapeHtml(sale.number)}</p>
          ${companyLines.length ? `<p style="color:${footerTextColor};">${escapeHtml(companyLines.join("  ·  "))}</p>` : ""}
          <p style="color:${thanksColor};">${escapeHtml(state.settings.invoiceFooter)}</p>
        </section>
      </article>
    `;
  }

  function qrCells(seed) {
    let html = "";
    for (let i = 0; i < 81; i += 1) {
      const corner = (i < 20 && i % 9 < 3) || (i < 27 && i % 9 > 5) || (i > 53 && i % 9 < 3);
      const code = seed.charCodeAt(i % seed.length) + i * 17;
      html += `<span class="${corner || code % 5 < 2 ? "on" : "off"}"></span>`;
    }
    return html;
  }

  function barcodeLines(seed) {
    return Array.from({ length: 34 }, (_, index) => {
      const width = ((seed.charCodeAt(index % seed.length) + index) % 3) + 1;
      return `<span style="--w:${width}px"></span>`;
    }).join("");
  }

  async function shareInvoice() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const caption = `فاتورة رقم: ${sale.number} - ${state.settings.storeName}`;

    showPdfOverlay();
    try {
      const blob = await buildInvoicePdfBlob(sale);
      const pdfFile = new File([blob], `${sale.number}.pdf`, { type: "application/pdf" });

      if (supportsFileShare(pdfFile)) {
        await navigator.share({ files: [pdfFile], title: sale.number, text: caption });
        return;
      }

      try {
        const canvas = await renderPreviewToCanvas();
        const pngFile = await canvasToFile(canvas, `${sale.number}.png`);
        if (supportsFileShare(pngFile)) {
          await navigator.share({ files: [pngFile], title: sale.number, text: caption });
          return;
        }
      } catch (err) {
        console.warn("PNG share unavailable:", err);
      }

      triggerBlobDownload(blob, `${sale.number}.pdf`);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(caption).catch(() => {});
      }
      toastMessage("تم تنزيل نسخة PDF من الفاتورة — شاركها عبر WhatsApp");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      console.error("Share error:", err);
      const text = invoiceText(sale);
      if (navigator.share) {
        await navigator.share({ title: sale.number, text }).catch(() => {});
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text).catch(() => {});
        toastMessage("تم نسخ الفاتورة كنص");
      }
    } finally {
      hidePdfOverlay();
    }
  }

  function supportsFileShare(file) {
    return typeof navigator.share === "function"
      && typeof navigator.canShare === "function"
      && navigator.canShare({ files: [file] });
  }

  async function buildInvoicePdfBlob(sale) {
    await loadPdfMakeLibrary();
    const logo = await resolveLogoForPdf();
    const doc = await buildInvoiceDoc(sale, logo);
    return pdfMake.createPdf(doc).getBlob();
  }

  function loadHtml2CanvasLibrary() {
    if (window.html2canvas) return Promise.resolve();
    return loadScriptList([
      "assets/vendor/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
    ]).then(() => {
      if (!window.html2canvas) throw new Error("فشل تحميل مكتبة تحويل الفاتورة إلى صورة");
    });
  }

  async function renderPreviewToCanvas(scale = 2) {
    const node = invoicePrintArea.querySelector(".invoice-paper");
    if (!node) throw new Error("لا توجد معاينة للفاتورة");
    await loadHtml2CanvasLibrary();
    await document.fonts.ready;
    return await html2canvas(node, {
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: "#ffffff"
    });
  }

  function canvasToFile(canvas, filename) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          reject(new Error("تعذر تحويل المعاينة إلى صورة"));
          return;
        }
        resolve(new File([blob], filename, { type: "image/png" }));
      }, "image/png");
    });
  }

  async function downloadInvoicePdf() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    await exportPdfWithPdfMake({
      filename: sale.number,
      build: logo => buildInvoiceDoc(sale, logo)
    });
  }

  async function downloadThermalPdf(paperWidth) {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const pw = Number(paperWidth) || 80;
    await exportPdfWithPdfMake({
      filename: `${sale.number}-thermal-${pw}mm`,
      build: logo => buildThermalInvoiceDoc(sale, logo, pw)
    });
  }

  function thermalInvoiceHtml(sale) {
    const accent = docAccent();
    const net = netSale(sale);
    const returns = sale.returns || [];
    const taglineText = state.settings.storeSubtitle || "متجر ملابس وأزياء";
    const companyLines = companyInfoLines();
    const logoUrl = state.settings.logo || "";
    const fmt = (v) => moneyFormatter.format(Number(v || 0));

    const metaRows = [
      ["رقم الفاتورة", sale.number],
      ["التاريخ", dateTime(sale.date)]
    ];
    if (sale.paymentMethod) metaRows.push(["طريقة الدفع", sale.paymentMethod]);
    metaRows.push(["العميل", sale.customerName || "عميل نقدي"]);
    if (sale.customerPhone) metaRows.push(["الهاتف", sale.customerPhone]);

    const metaCells = [];
    for (let i = 0; i < metaRows.length; i += 2) {
      const left = metaRows[i];
      const right = metaRows[i + 1];
      metaCells.push(`<tr>
        <td style="padding:3px 4px;border-left:1px solid #CBD5E1;"><span style="font-size:8px;color:#94A3B8;">${escapeHtml(left[0])}</span><br><strong style="font-size:11px;">${escapeHtml(left[1])}</strong></td>
        ${right ? `<td style="padding:3px 4px;"><span style="font-size:8px;color:#94A3B8;">${escapeHtml(right[0])}</span><br><strong style="font-size:11px;">${escapeHtml(right[1])}</strong></td>` : `<td></td>`}
      </tr>`);
    }

    const itemRows = sale.items.map((item, i) => {
      const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
      return `<tr>
        <td style="padding:3px 4px;text-align:center;color:#374151;font-size:9px;">${i + 1}</td>
        <td style="padding:3px 4px;text-align:right;"><strong style="font-size:11px;color:#172033;">${escapeHtml(item.name)}</strong>${metaLine ? `<br><span style="font-size:8px;color:#94A3B8;">${escapeHtml(metaLine)}</span>` : ""}</td>
        <td style="padding:3px 4px;text-align:center;font-size:11px;">${item.qty}</td>
        <td style="padding:3px 4px;text-align:center;font-size:10px;">${fmt(item.price)}</td>
        <td style="padding:3px 4px;text-align:left;font-weight:700;font-size:10px;">${fmt(item.total)}</td>
      </tr>`;
    }).join("");

    const totalsRows = [
      ["المجموع الفرعي", fmt(sale.subtotal)],
      ["الخصم", fmt(sale.discount)]
    ];
    if (!sale.taxFree) totalsRows.push(["الضريبة", fmt(sale.tax)]);
    if (sale.shipping) totalsRows.push(["مصاريف الشحن", fmt(sale.shipping)]);
    if (net.returnAmount > 0) totalsRows.push(["المigroup المرتجع", `− ${fmt(net.returnAmount)}`, true]);

    const totalsHtml = totalsRows.map(([label, value, isDanger]) =>
      `<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:10px;${isDanger ? "color:#B91C1C;font-weight:700;" : ""}"><span style="color:#94A3B8;">${escapeHtml(label)}</span><strong>${escapeHtml(value)} ${state.settings.currency}</strong></div>`
    ).join("");

    const returnsHtml = returns.length ? `
      <div style="border-top:1px dashed #CBD5E1;margin:6px 0 4px;"></div>
      <div style="font-weight:700;color:#B91C1C;font-size:10px;margin-bottom:3px;">المرتجعات</div>
      ${returns.map(ret => `
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#B91C1C;padding:1px 0;"><strong>− ${fmt(ret.total)} ${state.settings.currency}</strong><span>${dateTime(ret.date)}${ret.reason ? ` — ${ret.reason}` : ""}</span></div>
        ${ret.items.map(item => `<div style="font-size:8px;color:#B91C1C;padding:1px 0 1px 12px;">× ${item.qty} ${escapeHtml(item.name)} — ${fmt(item.total)} ${state.settings.currency}</div>`).join("")}
      `).join("")}
    ` : "";

    return `<div class="thermal-receipt" style="width:302px;margin:0 auto;font-family:'Cairo',sans-serif;direction:rtl;color:#172033;background:#fff;padding:10px 12px;border:1px dashed #CBD5E1;border-radius:4px;">
      <div style="text-align:center;padding-bottom:6px;border-bottom:1.5px solid #172033;margin-bottom:6px;">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" style="width:42px;height:42px;margin-bottom:4px;" onerror="this.style.display='none'">` : ""}
        <div style="font-size:14px;font-weight:700;color:${accent};">${escapeHtml(state.settings.storeName)}</div>
        <div style="font-size:9px;color:#94A3B8;">${escapeHtml(taglineText)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">${metaCells.join("")}</table>
      <div style="border-top:1px dashed #CBD5E1;margin:4px 0 6px;"></div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
        <thead><tr style="background:${accent};color:#fff;font-size:10px;">
          <th style="padding:4px;">#</th>
          <th style="padding:4px;text-align:right;">الصنف</th>
          <th style="padding:4px;">كمية</th>
          <th style="padding:4px;">السعر</th>
          <th style="padding:4px;">الإجمالي</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      ${returnsHtml}
      <div style="border-top:1.5px solid #172033;margin:6px 0 4px;"></div>
      ${totalsHtml}
      <div style="display:flex;justify-content:space-between;padding:4px 0 2px;font-size:13px;font-weight:700;color:#172033;"><span>الإجمالي النهائي</span><strong>${fmt(net.total)} ${state.settings.currency}</strong></div>
      <div style="border-top:1px dashed #CBD5E1;margin:4px 0;padding-top:4px;font-size:9px;color:#94A3B8;"><span>المبلغ بالحروف</span> — ${escapeHtml(amountInWords(net.total))}</div>
      ${companyLines.length || state.settings.invoiceFooter ? `<div style="border-top:1px solid #CBD5E1;margin-top:6px;padding-top:6px;text-align:center;font-size:8px;color:#374151;">${companyLines.length ? escapeHtml(companyLines.join(" | ")) : ""}${state.settings.invoiceFooter ? `<br>${escapeHtml(state.settings.invoiceFooter)}` : ""}</div>` : ""}
    </div>`;
  }

  function toggleThermalPreview() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const isCurrentlyThermal = invoicePrintArea.querySelector(".thermal-receipt");
    if (isCurrentlyThermal) {
      invoicePrintArea.innerHTML = invoiceHtml(sale);
    } else {
      invoicePrintArea.innerHTML = thermalInvoiceHtml(sale);
    }
  }

  function returnQtyFor(productId) {
    return state._returnSel && state._returnSel[productId] ? state._returnSel[productId] : 0;
  }

  function openReturnDialog() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const returned = returnedQtyByProduct(sale);
    const rows = sale.items.map(item => ({
      item,
      maxQty: Math.max(0, Number(item.qty || 0) - (returned[item.productId] || 0))
    })).filter(row => row.maxQty > 0);
    if (!rows.length) {
      toastMessage("كل أصناف هذه الفاتورة تم إرجاعها بالفعل");
      return;
    }
    state._returnSel = {};
    returnItemsList.innerHTML = rows.map(row => `
      <div class="return-row" data-rid="${row.item.productId}">
        <div class="return-row-info">
          <strong>${escapeHtml(row.item.name)}</strong>
          <small>${formatMoney(row.item.price)} · متاح للإرجاع ${row.maxQty}</small>
        </div>
        <div class="qty-controls">
          <button type="button" data-ret-dec="${row.item.productId}" aria-label="إنقاص">−</button>
          <strong data-ret-qty="${row.item.productId}">0</strong>
          <button type="button" data-ret-inc="${row.item.productId}" aria-label="زيادة">+</button>
        </div>
      </div>
    `).join("");
    document.getElementById("returnDialogHint").textContent = `اختر الكميات المراد إرجاعها من فاتورة ${sale.number}. ستعود القطع إلى المخزون فوراً.`;
    document.getElementById("returnReason").value = "";
    updateReturnTotal();
    returnDialog.showModal();
  }

  function openPaymentDialog(customerName) {
    const customer = getCustomersData().find(item => item.name === (customerName || ""));
    const nameEl = document.getElementById("paymentCustomerName");
    const amountEl = document.getElementById("paymentAmount");
    const dateEl = document.getElementById("paymentDate");
    const noteEl = document.getElementById("paymentNote");
    const hintEl = document.getElementById("paymentDialogHint");
    const debt = customer ? customer.debt : customerDebt(nameEl.value);
    nameEl.value = customer ? customer.name : "";
    amountEl.value = "";
    dateEl.value = todayISO();
    noteEl.value = "";
    hintEl.textContent = debt > 0
      ? `الرصيد المستحق على «${nameEl.value}» هو ${formatMoney(debt)}.`
      : nameEl.value.trim()
        ? `«${nameEl.value}» لا يمتلك رصيداً مستحقاً.`
        : "";
    paymentDialog.showModal();
  }

  async function confirmPayment() {
    const nameEl = document.getElementById("paymentCustomerName");
    const amountEl = document.getElementById("paymentAmount");
    const dateEl = document.getElementById("paymentDate");
    const noteEl = document.getElementById("paymentNote");
    const name = (nameEl.value || "").trim();
    const amount = Number(amountEl.value);
    if (!name || name === "عميل نقدي") {
      toastMessage("اكتب اسم عميل صحيح لسداد الدين");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toastMessage("أدخل مبلغ الدفعة أكبر من صفر");
      return;
    }
    const date = dateEl.value || todayISO();
    const payment = {
      id: cryptoRandomId("pay"),
      customerName: name,
      amount: Math.round(amount * 100) / 100,
      date,
      note: (noteEl.value || "").trim(),
      createdAt: Date.now()
    };
    const ok = await commitState({ payments: [...state.payments, payment] });
    if (!ok) {
      showStorageFullDialog();
      return;
    }
    if (name !== "عميل نقدي") {
      ensureCustomerRegistered(name, "");
    }
    await commitState({});
    paymentDialog.close();
    toastMessage(`تم تسجيل دفعة ${formatMoney(payment.amount)} من «${name}»`);
    if (state.view === "customers" && state._custOpen) {
      state._custOpen = name;
      render();
    } else {
      render();
    }
  }

  function todayISO() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function openCustomerDialog(name) {
    const clean = String(name || "").trim();
    const record = clean ? customerRecord(clean) : null;
    const titleEl = document.getElementById("customerDialogTitle");
    const hintEl = document.getElementById("customerDialogHint");
    const idEl = document.getElementById("customerRecordId");
    const nameEl = document.getElementById("customerFormName");
    const phoneEl = document.getElementById("customerFormPhone");
    const addressEl = document.getElementById("customerFormAddress");
    const classEl = document.getElementById("customerFormClass");
    const notesEl = document.getElementById("customerFormNotes");
    const discountEl = document.getElementById("customerFormDiscount");
    const photoInput = document.getElementById("customerPhoto");
    const photoPreview = document.getElementById("customerPhotoPreview");
    const photoClear = document.getElementById("customerPhotoClear");
    const deleteBtn = document.getElementById("deleteCustomerButton");
    if (classEl) {
      const selected = record ? (record.classification || "جديد") : "جديد";
      classEl.innerHTML = CUSTOMER_CLASSES.map(item =>
        `<option value="${item.id}"${item.id === selected ? " selected" : ""}>${item.label}</option>`
      ).join("");
    }
    if (discountEl) discountEl.value = String(record ? Number(record.discount || 0) : 0);
    if (photoPreview) {
      const photo = record ? record.photo : "";
      if (photo) {
        photoPreview.src = photo;
        photoPreview.classList.add("has-photo");
        photoPreview.dataset.image = photo;
        if (photoClear) photoClear.hidden = false;
      } else {
        photoPreview.removeAttribute("src");
        photoPreview.classList.remove("has-photo");
        delete photoPreview.dataset.image;
        if (photoClear) photoClear.hidden = true;
      }
    }
    if (photoInput) photoInput.value = "";
    if (record) {
      titleEl.textContent = `تعديل بيانات «${record.name}»`;
      hintEl.textContent = `الكود: ${record.code} · انضم ${shortDate(record.createdAt)} · يُحدّث بصورة متزامنة مع فواتير العميل.`;
      idEl.value = record.id;
      nameEl.value = record.name;
      phoneEl.value = record.phone || "";
      addressEl.value = record.address || "";
      notesEl.value = record.notes || "";
      if (deleteBtn) deleteBtn.hidden = false;
    } else {
      titleEl.textContent = "إضافة عميل جديد";
      hintEl.textContent = `سيُولّد له كود تلقائي (${nextCustomerCode()}) ويظهر في كل شاشات العملاء والفواتير.`;
      idEl.value = "";
      nameEl.value = state._saleCustomerName && customerRecord(state._saleCustomerName) ? "" : state._saleCustomerName || "";
      phoneEl.value = state._saleCustomerPhone || "";
      addressEl.value = "";
      notesEl.value = "";
      if (deleteBtn) deleteBtn.hidden = true;
    }
    customerDialog.showModal();
    setTimeout(() => nameEl.focus(), 50);
  }

  async function saveCustomerForm() {
    const idEl = document.getElementById("customerRecordId");
    const name = (document.getElementById("customerFormName").value || "").trim();
    const phone = (document.getElementById("customerFormPhone").value || "").trim();
    const address = (document.getElementById("customerFormAddress").value || "").trim();
    const classification = document.getElementById("customerFormClass").value || "جديد";
    const notes = (document.getElementById("customerFormNotes").value || "").trim();
    const discount = Math.max(0, Math.min(100, Number(document.getElementById("customerFormDiscount").value || 0)));
    const photo = (document.getElementById("customerPhotoPreview")?.dataset.image) || "";
    if (!name || name === "عميل نقدي") {
      toastMessage("اكتب اسم العميل");
      return;
    }
    const existingId = idEl.value;
    const duplicate = state.customers.find(item => item.name.trim() === name && item.id !== existingId);
    if (duplicate) {
      toastMessage(`يوجد عميل مسجل بهذا الاسم بالفعل (${duplicate.code})`);
      return;
    }
    let nextCustomers;
    if (existingId) {
      nextCustomers = state.customers.map(item => item.id === existingId
        ? { ...item, name, phone, address, classification, notes, discount, photo, updatedAt: todayISO() }
        : item);
    } else {
      const record = {
        id: cryptoRandomId("c"),
        code: nextCustomerCode(),
        name,
        phone,
        address,
        classification,
        notes,
        discount,
        photo,
        createdAt: todayISO(),
        updatedAt: todayISO()
      };
      nextCustomers = state.customers.concat(record);
    }
    const ok = await commitState({ customers: nextCustomers });
    if (!ok) {
      showStorageFullDialog();
      return;
    }
    customerDialog.close();
    toastMessage(existingId ? "تم تحديث بيانات العميل" : `تم إضافة العميل ${name} بنجاح`);
    state._custOpen = name;
    render();
  }

  async function deleteCustomerFromForm() {
    const idEl = document.getElementById("customerRecordId");
    const nameEl = document.getElementById("customerFormName");
    const name = (nameEl.value || "").trim();
    const id = idEl.value;
    if (!id) return;
    const doDelete = await confirmDialogPrompt(
      "حذف العميل",
      `سيتم حذف بيانات العميل «${name}» من قاعدة العملاء فقط.\n\nتبقى فواتيره وسجل دفعاته محفوظة في النظام (تُعرض مجهولة الهوية في التقارير السابقة).`,
      "حذف العميل"
    );
    if (!doDelete) return;
    const nextCustomers = state.customers.filter(item => item.id !== id);
    const ok = await commitState({ customers: nextCustomers });
    if (!ok) {
      showStorageFullDialog();
      return;
    }
    customerDialog.close();
    if (state._custOpen === name) state._custOpen = "";
    toastMessage(`تم حذف العميل «${name}» من قاعدة العملاء`);
    render();
  }

  async function addExpense() {
    const category = document.getElementById("expenseCategory")?.value || "أخرى";
    const amount = Number(document.getElementById("expenseAmount")?.value);
    const date = document.getElementById("expenseDate")?.value || todayISO();
    const note = document.getElementById("expenseNote")?.value.trim() || "";
    if (!Number.isFinite(amount) || amount <= 0) {
      toastMessage("أدخل مبلغ المصروف أكبر من صفر");
      return;
    }
    const expense = {
      id: cryptoRandomId("exp"),
      category,
      amount: Math.round(amount * 100) / 100,
      date,
      note,
      createdAt: Date.now()
    };
    const ok = await commitState({ expenses: [...state.expenses, expense] });
    if (!ok) {
      showStorageFullDialog();
      return;
    }
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseNote").value = "";
    document.getElementById("expenseDate").value = todayISO();
    toastMessage(`تم تسجيل مصروف ${formatMoney(expense.amount)}`);
    render();
  }

  function changeReturnQty(productId, delta) {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const returned = returnedQtyByProduct(sale);
    const item = sale.items.find(line => line.productId === productId);
    if (!item) return;
    const maxQty = Math.max(0, Number(item.qty || 0) - (returned[productId] || 0));
    state._returnSel[productId] = Math.max(0, Math.min(maxQty, returnQtyFor(productId) + delta));
    updateReturnTotal();
  }

  function updateReturnTotal() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const returned = returnedQtyByProduct(sale);
    let total = 0, count = 0;
    sale.items.forEach(item => {
      const maxQty = Math.max(0, Number(item.qty || 0) - (returned[item.productId] || 0));
      const sel = Math.min(returnQtyFor(item.productId), maxQty);
      state._returnSel[item.productId] = sel;
      count += sel;
      total += sel * Number(item.price || 0);
      const qtyEl = document.querySelector(`[data-ret-qty="${item.productId}"]`);
      if (qtyEl) qtyEl.textContent = sel;
    });
    const totalBox = document.getElementById("returnTotalBox");
    if (totalBox) totalBox.querySelector("strong").textContent = formatMoney(total);
    const confirmBtn = document.getElementById("confirmReturnButton");
    if (confirmBtn) confirmBtn.disabled = count === 0;
  }

  async function confirmReturn() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const returned = returnedQtyByProduct(sale);
    const items = [];
    let total = 0, count = 0;
    sale.items.forEach(item => {
      const maxQty = Math.max(0, Number(item.qty || 0) - (returned[item.productId] || 0));
      const qty = Math.min(returnQtyFor(item.productId), maxQty);
      if (qty <= 0) return;
      const lineTotal = qty * Number(item.price || 0);
      items.push({
        productId: item.productId,
        name: item.name,
        sku: item.sku || "",
        category: item.category || "غير مصنف",
        qty,
        price: Number(item.price || 0),
        cost: Number(item.cost || 0),
        total: lineTotal
      });
      total += lineTotal;
      count += qty;
    });
    if (!items.length) {
      toastMessage("اختر قطعة واحدة على الأقل للإرجاع");
      return;
    }
    const nextProducts = state.products.map(product => {
      const returnedQty = items.reduce((sum, item) => sum + (item.productId === product.id ? item.qty : 0), 0);
      return returnedQty > 0 ? { ...product, quantity: Number(product.quantity || 0) + returnedQty } : product;
    });
    const returnRecord = {
      id: cryptoRandomId("r"),
      date: new Date().toISOString(),
      reason: (document.getElementById("returnReason")?.value || "").trim(),
      items,
      qty: count,
      total
    };
    const nextSales = state.sales.map(saleItem => saleItem.id === sale.id ? { ...saleItem, returns: [...(saleItem.returns || []), returnRecord] } : saleItem);
    if (!(await commitState({ products: nextProducts, sales: nextSales }))) {
      await showStorageFullDialog();
      return;
    }
    state._returnSel = {};
    returnDialog.close();
    render();
    const updatedSale = state.sales.find(saleItem => saleItem.id === sale.id);
    invoicePrintArea.innerHTML = invoiceHtml(updatedSale || sale);
    auditLog("return", `مرتجع فاتورة ${sale.number} — ${count} قطعة بقيمة ${formatMoney(total)}`);
    toastMessage(`تم إرجاع ${count} قطعة بقيمة ${formatMoney(total)} للمخزون`);
  }

  function confirmDialogPrompt(title, message, okLabel) {
    return new Promise(resolve => {
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        confirmDialog.close();
        resolve(value);
      };
      document.getElementById("confirmDialogTitle").textContent = title;
      document.getElementById("confirmDialogMessage").textContent = message;
      const ok = document.getElementById("confirmDialogOk");
      ok.textContent = okLabel || "تأكيد";
      document.getElementById("confirmDialogCancel").onclick = () => finish(false);
      ok.onclick = () => finish(true);
      confirmDialog.onclose = () => finish(false);
      confirmDialog.showModal();
    });
  }

  async function deleteInvoice() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const net = netSale(sale);
    const ok = await confirmDialogPrompt(
      "حذف الفاتورة",
      `سيتم حذف فاتورة ${sale.number} نهائياً وإرجاع ${net.qty} قطعة إلى المخزون. لا يمكن التراجع عن هذا الإجراء.`,
      "حذف نهائي"
    );
    if (!ok) return;
    const returned = returnedQtyByProduct(sale);
    const nextProducts = state.products.map(product => {
      const backQty = sale.items.reduce((sum, item) => {
        if (item.productId !== product.id) return sum;
        return sum + Math.max(0, Number(item.qty || 0) - (returned[item.productId] || 0));
      }, 0);
      return backQty > 0 ? { ...product, quantity: Number(product.quantity || 0) + backQty } : product;
    });
    const nextSales = state.sales.filter(item => item.id !== sale.id);
    if (!(await commitState({ products: nextProducts, sales: nextSales }))) {
      await showStorageFullDialog();
      return;
    }
    state.currentInvoiceId = null;
    state._returnSel = {};
    invoiceDialog.close();
    render();
    toastMessage(`تم حذف فاتورة ${sale.number} وإرجاع الكميات للمخزون`);
  }

  async function exportPdfWithPdfMake({ filename, build }) {
    showPdfOverlay();
    try {
      await loadPdfMakeLibrary();
      const logo = await resolveLogoForPdf();
      const doc = await build(logo);
      const blob = await pdfMake.createPdf(doc).getBlob();
      triggerBlobDownload(blob, `${filename}.pdf`);
      toastMessage("تم تحميل ملف PDF بنجاح");
    } catch (err) {
      console.error("PDF generation error:", err);
      const detail = err && err.message ? err.message : String(err);
      toastMessage(`حدث خطأ أثناء إنشاء ملف PDF: ${detail}`);
    } finally {
      hidePdfOverlay();
    }
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function resolveLogoForPdf() {
    const logo = state.settings.logo;
    if (!logo) return null;
    if (logo.startsWith("data:")) return logo;
    try {
      const response = await fetch(logo);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      return window.FALLBACK_LOGO || null;
    }
  }

  async function resolveThumbForPdf(src, size = 60, name = "", shape = "square") {
    if (!src && !name) return null;
    if (src) {
      try {
        const image = new Image();
        image.src = src;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.clip();
        }
        const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        ctx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
        return canvas.toDataURL("image/jpeg", 0.85);
      } catch (err) { /* canvas tainted أو فشل الرسم — نستخدم البلاطة الاحتياطية */ }
    }
    return placeholderThumbDataUrl(size, name, shape);
  }

  function placeholderThumbDataUrl(size, name, shape = "square") {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(1, 1, size - 2, size - 2);
    }
    ctx.fillStyle = "#eef1f4";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#dfe4ea";
    ctx.stroke();
    ctx.fillStyle = "#374151";
    ctx.font = `600 ${Math.floor(size * 0.4)}px Cairo, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((String(name || "؟").trim().charAt(0) || "؟"), size / 2, size / 2 + size * 0.02);
    return canvas.toDataURL("image/png");
  }

  function loadPdfMakeLibrary() {
    if (window.pdfMake) return Promise.resolve();
    const coreSources = [
      "assets/vendor/pdfmake.min.js",
      "https://cdn.jsdelivr.net/npm/pdfmake-rtl@2.1.2/build/pdfmake.min.js"
    ];
    const fontsSources = [
      "assets/vendor/pdfmake-fonts.js",
      "https://cdn.jsdelivr.net/npm/pdfmake-rtl@2.1.2/build/vfs_fonts.js"
    ];
    return loadScriptList(coreSources)
      .then(() => loadScriptList(fontsSources))
      .then(() => {
        if (!window.pdfMake) throw new Error("فشل تحميل مكتبة PDF");
        if (!window.pdfMake.vfs || !window.pdfMake.vfs["Cairo-Regular.ttf"]) {
          if (window.vfs) window.pdfMake.vfs = window.vfs;
          else if (!window.pdfMake.vfs) window.pdfMake.vfs = {};
        }
        if (window.pdfMake.fonts) {
          window.pdfMake.fonts["CairoSemiBold"] = {
            normal: "Cairo-SemiBold.ttf",
            bold: "Cairo-SemiBold.ttf",
            italics: "Cairo-SemiBold.ttf",
            bolditalics: "Cairo-SemiBold.ttf"
          };
          window.pdfMake.fonts["CairoLight"] = {
            normal: "Cairo-Light.ttf",
            bold: "Cairo-Light.ttf",
            italics: "Cairo-Light.ttf",
            bolditalics: "Cairo-Light.ttf"
          };
        }
      });
  }

  function loadScriptList(sources) {
    return new Promise((resolve, reject) => {
      const tryLoad = index => {
        if (index >= sources.length) {
          reject(new Error("فشل تحميل ملفات PDF"));
          return;
        }
        const script = document.createElement("script");
        script.src = sources[index];
        script.onload = () => resolve();
        script.onerror = () => tryLoad(index + 1);
        document.head.appendChild(script);
      };
      tryLoad(0);
    });
  }

  const INVOICE_TEMPLATES = {
    classic: {
      label: "كلاسيكي",
      desc: "تصميم هادئ مريح ببطاقات فاتحة",
      headerStyle: "plain",
      logoSize: 62,
      storeFont: "Cairo",
      storeSize: 23,
      storeColor: null,
      subColor: "#4B5563",
      ruleColor: null,
      ruleThickness: 2.4,
      metaStyle: "fill",
      metaFill: "light",
      metaTitleColor: null,
      metaLabelColor: "#4B5563",
      metaValueColor: "#111827",
      sectionTitleFont: "Cairo",
      sectionTitleSize: 11.5,
      sectionTitleColor: null,
      headerBar: { fill: null, text: "#ffffff", font: "Cairo", size: 9, padding: 6 },
      tableStripes: true,
      itemNameFont: "Cairo",
      itemNameSize: 11,
      itemMetaColor: "#64748B",
      totalsStyle: "card",
      totalsWidth: 240,
      totalRowColor: "#374151",
      grandStyle: "accent",
      grandText: "#ffffff",
      footerRule: "#CBD5E1",
      footerTextColor: "#374151",
      thanksColor: "#374151"
    },
    modern: {
      label: "عصري",
      desc: "شريط علوي بلون المتجر ورأس جدول بارز",
      headerStyle: "band",
      logoSize: 54,
      storeFont: "CairoSemiBold",
      storeSize: 26,
      storeColor: "#ffffff",
      subColor: "#dce8e4",
      ruleColor: "#ffffff",
      ruleThickness: 2.6,
      metaStyle: "border",
      metaFill: "white",
      metaTitleColor: null,
      metaLabelColor: "#374151",
      metaValueColor: "#111827",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: null,
      headerBar: { fill: null, text: "#ffffff", font: "CairoSemiBold", size: 9.5, padding: 7 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 11.5,
      itemMetaColor: "#374151",
      totalsStyle: "card",
      totalsWidth: "full",
      totalRowColor: "#374151",
      grandStyle: "accent",
      grandText: "#ffffff",
      footerRule: "#CBD5E1",
      footerTextColor: "#374151",
      thanksColor: "#374151"
    },
    boutique: {
      label: "بوتيك",
      desc: "فاتورة أنثوية راقية بألوان وردية وخطوط ناعمة",
      headerStyle: "boutique",
      logoSize: 56,
      storeFont: "CairoSemiBold",
      storeSize: 24,
      storeColor: "#7f1d4e",
      subColor: "#9d5a78",
      ruleColor: "#f0adc8",
      ruleThickness: 1.8,
      metaStyle: "rose",
      metaFill: "rose",
      metaTitleColor: "#7f1d4e",
      metaLabelColor: "#7f4a63",
      metaValueColor: "#331424",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#7f1d4e",
      headerBar: { fill: "#fce7f0", text: "#7f1d4e", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 11,
      itemMetaColor: "#9c5a7c",
      totalsStyle: "rose-card",
      totalsWidth: 250,
      totalRowColor: "#5b2740",
      grandStyle: "rose",
      grandText: "#ffffff",
      footerRule: "#f4bfd4",
      footerTextColor: "#8b4664",
      thanksColor: "#8b4664",
      pdfAccent: "#a21d5d",
      pdfLight: "#fdf0f5"
    },
    atelier: {
      label: "أتيليه",
      desc: "تصميم تحريري نظيف مناسب للبراندات الهادئة",
      headerStyle: "atelier",
      logoSize: 58,
      storeFont: "CairoSemiBold",
      storeSize: 24,
      storeColor: "#2d2a26",
      subColor: "#7c7469",
      ruleColor: "#c6b28d",
      ruleThickness: 1.4,
      metaStyle: "sand",
      metaFill: "sand",
      metaTitleColor: "#2d2a26",
      metaLabelColor: "#665d52",
      metaValueColor: "#2d2a26",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#2d2a26",
      headerBar: { fill: "#efe8dc", text: "#5d4a2f", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: false,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 11,
      itemMetaColor: "#7c7469",
      totalsStyle: "sand-card",
      totalsWidth: 250,
      totalRowColor: "#4b4238",
      grandStyle: "sand",
      grandText: "#ffffff",
      footerRule: "#ded2bd",
      footerTextColor: "#7c7469",
      thanksColor: "#7c7469",
      pdfAccent: "#6f5630",
      pdfLight: "#f7f1e7"
    },
    runway: {
      label: "رانواي",
      desc: "قالب جريء وعصري يبرز الفاتورة كإيصال براند أزياء",
      headerStyle: "runway",
      logoSize: 52,
      storeFont: "CairoSemiBold",
      storeSize: 25,
      storeColor: "#ffffff",
      subColor: "#d7f2eb",
      ruleColor: "#2dd4bf",
      ruleThickness: 2,
      metaStyle: "mint",
      metaFill: "mint",
      metaTitleColor: "#0f3d3a",
      metaLabelColor: "#2f6f68",
      metaValueColor: "#102b28",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#0f766e",
      headerBar: { fill: "#ccfbf1", text: "#0f766e", font: "CairoSemiBold", size: 9.2, padding: 6 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 11.5,
      itemMetaColor: "#57928d",
      totalsStyle: "mint-card",
      totalsWidth: "full",
      totalRowColor: "#164e49",
      grandStyle: "mint",
      grandText: "#ffffff",
      footerRule: "#99f6e4",
      footerTextColor: "#27756f",
      thanksColor: "#0f766e",
      pdfAccent: "#0f766e",
      pdfLight: "#ecfdf9"
    },
    minimal: {
      label: "بسيط",
      desc: "مساحات بيضاء واسعة وخطوط رفيعة",
      headerStyle: "plain",
      logoSize: 58,
      storeFont: "CairoLight",
      storeSize: 27,
      storeColor: "#1f2937",
      subColor: "#374151",
      ruleColor: "#CBD5E1",
      ruleThickness: 1,
      metaStyle: "plain",
      metaFill: "none",
      metaTitleColor: "#1f2937",
      metaLabelColor: "#374151",
      metaValueColor: "#111827",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#1f2937",
      headerBar: { fill: null, text: null, font: "CairoSemiBold", size: 8.5, padding: 5 },
      tableStripes: false,
      itemNameFont: "Cairo",
      itemNameSize: 11.5,
      itemMetaColor: "#374151",
      totalsStyle: "plain",
      totalsWidth: 240,
      totalRowColor: "#4B5563",
      grandStyle: "text",
      grandText: null,
      footerRule: "#CBD5E1",
      footerTextColor: "#374151",
      thanksColor: "#374151"
    },
    luxury: {
      label: "فاخر",
      desc: "شريط داكن أنيق بلمسات ذهبية",
      headerStyle: "dark-band",
      logoSize: 58,
      storeFont: "CairoSemiBold",
      storeSize: 24,
      storeColor: "#d4b483",
      subColor: "#c6b491",
      ruleColor: "#b08d57",
      ruleThickness: 1.2,
      gold: "#b08d57",
      metaStyle: "gold",
      metaFill: "none",
      metaTitleColor: null,
      metaLabelColor: "#5f5a50",
      metaValueColor: "#22211d",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: null,
      headerBar: { fill: "#efe5cf", text: "#8a6d3b", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: false,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 11,
      itemMetaColor: "#374151",
      totalsStyle: "plain-gold",
      totalsWidth: 240,
      totalRowColor: "#55504a",
      grandStyle: "gold",
      grandText: "#ffffff",
      footerRule: "#e4d8bd",
      footerTextColor: "#6f6a60",
      thanksColor: "#8a857b"
    }
  };

  function pdfColor(color, accent) {
    return (color === null || color === undefined) ? accent : color;
  }

  function isDarkHex(hex) {
    const raw = String(hex || "#ffffff").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw;
    const num = parseInt(full, 16);
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;
    const lin = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return luminance < 0.4;
  }

  async function buildInvoiceDoc(sale, logo) {
    const tpl = INVOICE_TEMPLATES[state.settings.invoiceTemplate] || INVOICE_TEMPLATES.classic;
    return buildInvoiceByTemplate(sale, logo, tpl);
  }

  async function buildInvoiceByTemplate(sale, logo, tpl) {
    const accent = docAccent();
    const net = netSale(sale);
    const returns = sale.returns || [];
    const pieceCount = net.qty;
    const compact = returns.length > 0;
    const companyLines = companyInfoLines();

    const pdfAccent = tpl.pdfAccent || accent;
    const pdfLight = tpl.pdfLight || shadeHex(pdfAccent, 0.92);
    const headerStyle = tpl.headerStyle || "plain";
    const metaStyle = tpl.metaStyle || "fill";
    const totalsStyle = tpl.totalsStyle || "card";
    const grandStyle = tpl.grandStyle || "accent";
    const tableStripes = tpl.tableStripes !== false;

    const headerFill = (() => {
      if (headerStyle === "band" || headerStyle === "runway") return pdfAccent;
      if (headerStyle === "boutique") return pdfAccent;
      if (headerStyle === "atelier") return pdfAccent;
      if (headerStyle === "dark-band") return "#1f1f1f";
      return shadeHex(pdfAccent, 0.95);
    })();
    const headerOnDark = isDarkHex(headerFill);

    let qr = null;
    if (state.settings.showInvoiceQr !== false) {
      try {
        qr = await qrDataUrl(invoiceQrText(sale), 220);
      } catch (err) {
        console.warn("QR skipped:", err);
      }
    }

    const contentW = compact ? 567 : 515;
    const brandStack = [];
    const storeColor = headerOnDark
      ? (tpl.storeColor && !isDarkHex(tpl.storeColor) ? tpl.storeColor : "#ffffff")
      : pdfColor(tpl.storeColor, accent);
    const subColor = headerOnDark ? "#d7e0de" : pdfColor(tpl.subColor, PDF_DESIGN.secondary);
    const docTitleColor = headerOnDark ? "#ffffff" : pdfColor(tpl.sectionTitleColor, accent);
    const docMetaColor = headerOnDark ? "#d7e0de" : PDF_DESIGN.secondary;
    const badgeFill = headerOnDark ? "#ffffff" : pdfAccent;
    const badgeText = headerOnDark ? accent : "#ffffff";
    if (logo) brandStack.push({ image: logo, width: compact ? 40 : Math.min(tpl.logoSize || 54, 44), alignment: "center", margin: [0, 0, 0, compact ? 1 : 3] });
    brandStack.push({ text: state.settings.storeName, fontSize: compact ? 14 : Math.min(tpl.storeSize || 18, 21), bold: true, font: tpl.storeFont || "CairoSemiBold", color: storeColor, alignment: "center" });
    brandStack.push({ text: "متجر ملابس وأزياء", fontSize: 10, color: subColor, alignment: "center", margin: [0, compact ? 1 : 2, 0, 0] });

    const numberBadge = {
      table: {
        headerRows: 0,
        widths: ["auto"],
        body: [[{ text: sale.number, fillColor: badgeFill, color: badgeText, font: "CairoSemiBold", bold: true, fontSize: compact ? 9.5 : 11.5, alignment: "center", margin: [2, 1, 2, 1] }]]
      },
      layout: {
        defaultBorder: false,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 4,
        paddingBottom: () => 4
      },
      margin: [0, compact ? 2 : 4, 0, 0]
    };

    const docTitleStack = [
      { text: "فاتورة مبيعات", fontSize: compact ? 15 : 20, bold: true, font: tpl.sectionTitleFont || "CairoSemiBold", color: docTitleColor, alignment: "left" },
      numberBadge,
      { text: dateTime(sale.date), fontSize: 10, color: docMetaColor, alignment: "left", margin: [0, compact ? 2 : 3, 0, 0] },
      ...(sale.paymentMethod ? [{ text: `طريقة الدفع: ${sale.paymentMethod}`, fontSize: 10, color: docMetaColor, alignment: "left", margin: [0, compact ? 1.5 : 3, 0, 0] }] : [])
    ];

    const header = {
      layout: {
        defaultBorder: false,
        paddingLeft: () => 18,
        paddingRight: () => 18,
        paddingTop: () => (compact ? 5.5 : 6.5),
        paddingBottom: () => (compact ? 5.5 : 6.5)
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ columns: [docTitleStack, brandStack], columnGap: 14, fillColor: headerFill }]] },
      margin: [0, 0, 0, compact ? 4 : 6]
    };
    const headerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: tpl.ruleThickness || 1.2, lineColor: pdfColor(tpl.ruleColor, accent) }], margin: [0, 0, 0, compact ? 3 : 5] };

    const metaTitleColor = pdfColor(tpl.metaTitleColor, accent);
    const metaLabelColor = pdfColor(tpl.metaLabelColor, "#475569");
    const metaValueColor = pdfColor(tpl.metaValueColor, "#1F2937");

    const metaCardFill = (() => {
      if (metaStyle === "border") return "#fff";
      if (metaStyle === "rose") return tpl.pdfLight || "#fdf0f5";
      if (metaStyle === "sand") return tpl.pdfLight || "#f7f1e7";
      if (metaStyle === "mint") return tpl.pdfLight || "#ecfdf9";
      if (metaStyle === "gold") return null;
      if (metaStyle === "plain") return null;
      return "#F8FAFC";
    })();

    const metaBorderColor = (() => {
      if (metaStyle === "rose") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.7) : "#f4bfd4";
      if (metaStyle === "sand") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.7) : "#ded2bd";
      if (metaStyle === "mint") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.7) : "#99f6e4";
      if (metaStyle === "gold") return tpl.gold || "#b08d57";
      if (metaStyle === "plain") return "#ffffff";
      return "#E5E7EB";
    })();

    const infoSection = (() => {
      const infoW = compact ? 11.5 : 13;
      const infoH = () => 0.4;
      const infoLineColor = metaBorderColor || PDF_DESIGN.border;
      const infoLayout = {
        defaultBorder: false,
        hLineWidth: infoH,
        hLineColor: () => infoLineColor,
        vLineWidth: () => 0.4,
        vLineColor: () => infoLineColor,
        paddingLeft: () => compact ? 3 : 4,
        paddingRight: () => compact ? 3 : 4,
        paddingTop: () => compact ? 2.5 : 3,
        paddingBottom: () => compact ? 2.5 : 3
      };
      const invRows = [
        ["التاريخ", dateTime(sale.date)],
        ["طريقة الدفع", sale.paymentMethod || "نقدا"],
        ["عدد القطع", `${pieceCount} قطعة`]
      ];
      const custRows = [
        ["الاسم", sale.customerName || "عميل نقدي"],
        ["الهاتف", sale.customerPhone || "—"]
      ];
      const buildCard = (title, rows) => ({
        layout: {
          defaultBorder: false,
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0,
          hLineColor: () => infoLineColor,
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.6 : 0,
          vLineColor: () => infoLineColor,
          paddingLeft: () => compact ? 10 : 13,
          paddingRight: () => compact ? 10 : 13,
          paddingTop: () => compact ? 6 : 8,
          paddingBottom: () => compact ? 6 : 8
        },
        table: {
          headerRows: 0,
          widths: ["*"],
          body: [[{
            stack: [
              { text: title, fontSize: compact ? 11 : 14, bold: true, font: "CairoSemiBold", color: metaTitleColor, margin: [0, 0, 0, compact ? 3 : 5] },
              {
                layout: infoLayout,
                table: {
                  headerRows: 0,
                  widths: ["auto", "*"],
                  body: rows.map(([label, value]) => [
                    { text: label, color: metaLabelColor || PDF_DESIGN.secondary, fontSize: compact ? 8.5 : 10, alignment: "right" },
                    { text: String(value), bold: true, font: "CairoSemiBold", fontSize: compact ? 9 : 11.5, color: metaValueColor || PDF_DESIGN.dark, alignment: "left" }
                  ])
                },
                margin: [0, 0, 0, 0]
              }
            ],
            fillColor: metaCardFill || PDF_DESIGN.background
          }]]
        }
      });
      return {
        columns: [
          { width: "*", ...buildCard("بيانات الفاتورة", invRows) },
          { width: "*", ...buildCard("بيانات العميل", custRows) }
        ],
        columnGap: 12,
        margin: [0, compact ? 2 : 4, 0, compact ? 2 : 4]
      };
    })();

    const itemsHeaderColor = pdfColor(tpl.sectionTitleColor, accent);
    const itemThumbs = await Promise.all(sale.items.map(item => {
      return resolveThumbForPdf(saleItemImage(item), compact ? 26 : 30, item.name);
    }));
    const thumbSize = compact ? 26 : 30;
    const itemsBody = [
      pdfItemsHeader(["#", "صورة", "الصنف", "الكمية", "السعر", "الإجمالي"], pdfAccent, compact),
      ...sale.items.map((item, index) => {
        const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
        return [
          { text: String(index + 1), alignment: "center", bold: true, color: PDF_DESIGN.secondary, fontSize: compact ? 9.5 : 11, margin: [2, 2, 2, 2] },
          { image: itemThumbs[index], width: thumbSize, height: thumbSize, alignment: "center", margin: [2, 2, 2, 2] },
          {
            stack: [
              { text: item.name, bold: true, fontSize: compact ? 10 : (tpl.itemNameSize || 11.5), font: tpl.itemNameFont || "Cairo", color: PDF_DESIGN.dark, lineHeight: 1.2, alignment: "center" },
              { text: metaLine, fontSize: compact ? 8 : 9.5, color: pdfColor(tpl.itemMetaColor, "#64748B"), margin: compact ? [0, 1, 0, 0] : [0, 2, 0, 0], alignment: "center" }
            ],
            alignment: "center",
            margin: [2, 2, 2, 2]
          },
          { text: `${item.qty}`, alignment: "center", bold: true, fontSize: compact ? 9.5 : 11, margin: [2, 2, 2, 2] },
          { text: pdfMoneyParts(item.price, { bold: false, size: compact ? 8.5 : 10.5 }), alignment: "left", margin: [2, 2, 2, 2] },
          { text: pdfMoneyParts(item.total, { bold: true, size: compact ? 8.5 : 10.5 }), alignment: "left", margin: [2, 2, 2, 2] }
        ];
      })
    ];

    const stripeLineColor = pdfColor(tpl.ruleColor, PDF_DESIGN.softBorder);
    const itemsTable = pdfTable(itemsBody, [24, 40, "*", 46, 66, 78], {
      layout: pdfItemsLayout(pdfAccent, compact, tableStripes, stripeLineColor),
      headerRows: 1,
      rtl: true
    });

    const totalRows = [
      ["المجموع الفرعي", sale.subtotal],
      ["الخصم", sale.discount],
      ...(sale.taxFree ? [] : [["الضريبة", sale.tax]]),
      ...(sale.shipping ? [["مصاريف الشحن", sale.shipping]] : [])
    ];
    const returnRow = net.returnAmount > 0
      ? { columns: [
          { text: `- ${moneyFormatter.format(Number(net.returnAmount || 0))} ${state.settings.currency || ""}`, color: PDF_DESIGN.danger, bold: true, fontSize: compact ? 9.5 : 11, alignment: "left", width: "auto" },
          { text: "المجموع المرتجع", color: PDF_DESIGN.danger, bold: true, fontSize: compact ? 9.5 : 11, alignment: "right", width: "*" }
        ], margin: [0, 3, 0, 3] }
      : null;

    const totalsCardFill = (() => {
      if (totalsStyle === "plain" || totalsStyle === "plain-gold") return null;
      if (totalsStyle === "rose-card") return tpl.pdfLight || "#fdf0f5";
      if (totalsStyle === "sand-card") return tpl.pdfLight || "#f7f1e7";
      if (totalsStyle === "mint-card") return tpl.pdfLight || "#ecfdf9";
      return "#fff";
    })();

    const totalsCardBorder = (() => {
      if (totalsStyle === "plain" || totalsStyle === "plain-gold") return "#ffffff";
      if (totalsStyle === "rose-card") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.5) : "#f4bfd4";
      if (totalsStyle === "sand-card") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.5) : "#ded2bd";
      if (totalsStyle === "mint-card") return tpl.pdfAccent ? shadeHex(tpl.pdfAccent, 0.5) : "#99f6e4";
      return "#E5E7EB";
    })();

    const grandBg = (() => {
      if (grandStyle === "accent") return pdfAccent;
      if (grandStyle === "rose") return "#7f1d4e";
      if (grandStyle === "sand") return "#4b4238";
      if (grandStyle === "mint") return "#164e49";
      if (grandStyle === "gold") return tpl.gold || "#55504a";
      return null;
    })();

    const grandText = (() => {
      if (grandStyle === "text") return pdfAccent;
      if (grandBg && !isDarkHex(grandBg)) return "#111827";
      return tpl.grandText || "#ffffff";
    })();

    const moneyString = (value, opts = {}) => {
      const parts = [];
      parts.push({ text: moneyFormatter.format(Number(value || 0)), bold: opts.bold !== false, color: opts.color || "#111827", fontSize: opts.size || 9 });
      parts.push({ text: ` ${state.settings.currency || ""}`, bold: false, color: opts.currencyColor || "#6b7280", fontSize: Math.max(6, (opts.size || 9) - 1.5) });
      return parts;
    };

const grandRowInCard = {
      columns: [
        { text: moneyString(net.total, { size: compact ? 11.5 : 17, color: grandText, currencyColor: isDarkHex(grandBg) ? shadeHex(grandText, 0.55) : shadeHex(grandText, 0.35), bold: true }), alignment: "left", width: "auto", margin: [8, 0, 8, 0] },
        { text: "الإجمالي النهائي", bold: true, color: grandText, font: "CairoSemiBold", fontSize: compact ? 11.5 : 15.5, alignment: "right", width: "*", margin: [8, 0, 8, 0] }
      ],
      margin: [0, compact ? 4 : 7, 0, 0]
    };

    const grandBarNode = grandBg ? {
      table: {
        headerRows: 0,
        widths: ["*"],
        body: [[{
          columns: [
            { text: moneyString(net.total, { size: compact ? 11.5 : 17, color: grandText, currencyColor: isDarkHex(grandBg) ? shadeHex(grandText, 0.55) : shadeHex(grandText, 0.35), bold: true }), alignment: "left", width: "auto", margin: [12, 0, 12, 0] },
{ text: "الإجمالي النهائي", bold: true, color: grandText, font: "CairoSemiBold", fontSize: compact ? 11.5 : 15.5, alignment: "right", width: "*", margin: [12, 0, 12, 0] }
        ],
        fillColor: grandBg
      }]]
      },
      layout: {
        defaultBorder: false,
        paddingLeft: () => 14,
        paddingRight: () => 14,
        paddingTop: () => (compact ? 3.5 : 6),
        paddingBottom: () => (compact ? 3.5 : 6)
      },
      margin: [0, compact ? 3 : 5, 0, 0]
    } : null;

    const totalsStack = [
      ...totalRows.map(row => ({
        columns: [
          { text: moneyString(row[1], { size: compact ? 9.5 : 12.5, color: row[0] === "الخصم" && row[1] > 0 ? PDF_DESIGN.danger : PDF_DESIGN.dark }), alignment: "left", width: "auto", margin: [7, 0, 7, 0] },
          { text: row[0], color: PDF_DESIGN.secondary, fontSize: compact ? 9 : 11, alignment: "right", width: "*", margin: [7, 0, 7, 0] }
        ],
        margin: [0, compact ? 2 : 2, 0, compact ? 2 : 2]
      })),
      ...(returnRow ? [returnRow] : []),
      ...(grandBg ? [] : [grandRowInCard]),
        {
          columns: [
            { text: amountInWords(net.total), bold: true, color: PDF_DESIGN.dark, fontSize: compact ? 8 : 9.5, alignment: "left", width: "*", lineHeight: 1.2 },
            { text: "المبلغ بالحروف", color: PDF_DESIGN.secondary, fontSize: compact ? 7.5 : 9, alignment: "right", width: "auto" }
          ],
          margin: [8, compact ? 3 : 3, 8, 0]
        }
    ];

    const totalsNode = {
      unbreakable: true,
      columns: [
        ...(qr ? [{
          width: compact ? 64 : 76,
          stack: [
            { image: qr, width: compact ? 52 : 60, height: compact ? 52 : 60, alignment: "center" },
            { text: "امسح للتحقق", fontSize: 8, color: PDF_DESIGN.secondary, alignment: "center", margin: [0, 2, 0, 0] }
          ],
          alignment: "center"
        }] : []),
        {
          width: "*",
          stack: [
            pdfSoftCard(totalsStack, compact, totalsCardFill, totalsCardBorder, compact ? 10 : 13),
            ...(grandBarNode ? [grandBarNode] : [])
          ]
        }
      ],
      columnGap: 10,
      margin: [0, compact ? 4 : 5, 0, 0]
    };

    const retHeaderFill = tpl.pdfLight || "#FEE2E2";
    const pdfReturnsBlock = () => {
      const rows = [];
      returns.forEach(ret => {
        const reason = (ret.reason || "").trim();
        rows.push([
          { text: `مرتجع — ${dateTime(ret.date)}${reason ? `  |  السبب: ${reason}` : ""}`, fontSize: compact ? 8.5 : 9.5, bold: true, color: PDF_DESIGN.danger, colSpan: 4, fillColor: retHeaderFill, margin: [6, 3, 6, 3] }
        ]);
        ret.items.forEach(item => {
          rows.push([
            { text: pdfMoneyParts(item.total, { color: PDF_DESIGN.danger, bold: true, size: compact ? 8 : 9 }), alignment: "center", margin: [2, 2, 2, 2] },
            { text: pdfMoneyParts(item.price, { size: compact ? 8 : 9 }), alignment: "center", margin: [2, 2, 2, 2] },
            { text: `${item.qty}`, alignment: "center", fontSize: compact ? 8.5 : 9, bold: true, margin: [2, 2, 2, 2] },
            { text: item.name, fontSize: compact ? 8.5 : 9.5, color: "#374151", alignment: "right", margin: [2, 2, 2, 2] }
          ]);
        });
      });
      const retHeader = (label) => ({ text: label, bold: true, color: PDF_DESIGN.danger, fillColor: retHeaderFill, alignment: "center", fontSize: compact ? 8.5 : 9.5, margin: [4, 3, 4, 3] });
      const retLayout = {
        ...pdfTableLayoutPlain(stripeLineColor),
        paddingTop: () => 2,
        paddingBottom: () => 2,
        hLineWidth: () => 0.3
      };
      return {
        unbreakable: true,
        stack: [
          { text: "المرتجعات", fontSize: compact ? 10 : 12, bold: true, font: "CairoSemiBold", color: PDF_DESIGN.danger, margin: compact ? [0, 2, 0, 2] : [0, 4, 0, 4] },
          pdfTable([
            [retHeader("الإجمالي"), retHeader("السعر"), retHeader("الكمية"), retHeader("الصنف")],
            ...rows
          ], [72, 62, 34, "*"], { layout: retLayout, headerRows: 1, margin: [0, 0, 0, 2] })
        ]
      };
    };

    const sectionTitleColor = pdfColor(tpl.sectionTitleColor, accent);
    const sectionTitle = (text) => ({
      text,
      fontSize: compact ? 11 : 14.5,
      bold: true,
      font: tpl.sectionTitleFont || "CairoSemiBold",
      color: sectionTitleColor,
      margin: [0, compact ? 2 : 2.5, 0, compact ? 2 : 2.5]
    });

    const pageM = compact ? [14, 18, 14, 54] : [38, 42, 38, 58];
    const docContentW = 595.28 - pageM[0] - pageM[2];

    return {
      rtl: true,
      pageSize: "A4",
      pageMargins: pageM,
      defaultStyle: { font: "Cairo", fontSize: compact ? 8.5 : 10.5, lineHeight: compact ? 1.05 : 1.08 },
      content: [
        header,
        headerRule,
        infoSection,
        sectionTitle("تفاصيل الفاتورة"),
        itemsTable,
        ...(returns.length ? [pdfReturnsBlock()] : []),
        totalsNode
      ],
      header: currentPage => {
        if (currentPage <= 1) return null;
        return {
          margin: [pageM[0], 12, pageM[2], 0],
          columns: [
            { text: `${sale.number} — فاتورة مبيعات`, color: PDF_DESIGN.secondary, fontSize: 9.5, alignment: "left", width: "auto" },
            { text: state.settings.storeName, bold: true, color: accent, fontSize: 10, alignment: "right", width: "*" }
          ]
        };
      },
      footer: (currentPage, pageCount) => ({
        stack: [
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: docContentW, y2: 0, lineWidth: 0.8, lineColor: tpl.footerRule || PDF_DESIGN.border }] },
          ...(state.settings.invoiceFooter ? [{ text: state.settings.invoiceFooter, alignment: "center", fontSize: 9.5, color: pdfColor(tpl.thanksColor, PDF_DESIGN.secondary), margin: [0, 6, 0, 0] }] : []),
          ...(companyLines.length ? [{ text: companyLines.join("   |   "), alignment: "center", fontSize: 9, color: pdfColor(tpl.footerTextColor, PDF_DESIGN.secondary), margin: [0, 3, 0, 0] }] : []),
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: "center", fontSize: 9, color: pdfColor(tpl.footerTextColor, PDF_DESIGN.secondary), margin: [0, 3, 0, 0] }
        ],
        margin: [pageM[0], 8, pageM[2], 0]
      }),
      info: {
        title: `${sale.number} - ${state.settings.storeName}`,
        author: state.settings.storeName
      }
    };
  }

  async function buildThermalInvoiceDoc(sale, logo, paperWidth) {
    const accent = docAccent();
    const net = netSale(sale);
    const returns = sale.returns || [];
    const isNarrow = Number(paperWidth) === 58;
    const W = isNarrow ? 170 : 227;
    const M = isNarrow ? 8 : 10;
    const contentW = W - M * 2;
    const companyLines = companyInfoLines();
    const moneyText = (value, opts = {}) => ({
      text: `${moneyFormatter.format(Number(value || 0))} ${state.settings.currency}`,
      bold: !!opts.bold,
      font: opts.bold ? "CairoSemiBold" : "Cairo",
      color: opts.color || "#111827",
      fontSize: opts.size || 9
    });

    let qr = null;
    if (state.settings.showInvoiceQr !== false) {
      try {
        qr = await qrDataUrl(invoiceQrText(sale), isNarrow ? 140 : 180);
      } catch (err) {
        console.warn("QR skipped:", err);
      }
    }

    const headerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: 1, lineColor: PDF_DESIGN.dark }], margin: [0, 3, 0, 3] };
    const metaDivider = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: 0.5, lineColor: PDF_DESIGN.border, dash: { length: 2 } }], margin: [0, 2, 0, 2] };
    const totalRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: 1.5, lineColor: PDF_DESIGN.dark }], margin: [0, 3, 0, 3] };
    const footerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: 1, lineColor: PDF_DESIGN.border }], margin: [0, 4, 0, 3] };
    const returnsDivider = { canvas: [{ type: "line", x1: 0, y1: 0, x2: contentW, y2: 0, lineWidth: 0.5, lineColor: PDF_DESIGN.border, dash: { length: 2 } }], margin: [0, 2, 0, 2] };

    const metaCell = (label, value, opts = {}) => ({
      stack: [
        { text: label, fontSize: isNarrow ? 6 : 6.5, color: PDF_DESIGN.muted },
        { text: String(value), bold: true, font: "CairoSemiBold", fontSize: isNarrow ? 8 : 8.5, color: PDF_DESIGN.dark }
      ],
      margin: [0, 1, 0, 1],
      ...(opts.width ? { width: opts.width } : {})
    });

    const metaGrid = {
      table: {
        widths: ["*", "*"],
        body: [
          [metaCell("رقم الفاتورة", sale.number), metaCell("التاريخ", dateTime(sale.date))],
          [
            metaCell("طريقة الدفع", sale.paymentMethod || "نقداً"),
            metaCell("العميل", sale.customerName || "عميل نقدي")
          ],
          ...(sale.customerPhone ? [[metaCell("الهاتف", sale.customerPhone), { text: "" }]] : [])
        ]
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0.5,
        vLineColor: () => PDF_DESIGN.border,
        paddingLeft: () => 3,
        paddingRight: () => 3,
        paddingTop: () => 2,
        paddingBottom: () => 2
      },
      margin: [0, 2, 0, 2]
    };

    const colWidths = isNarrow ? [10, "*", 18, 32, 40] : [12, "*", 22, 38, 48];
    const hdrFontSize = isNarrow ? 7 : 7.5;
    const itemHeader = [
      { text: "#", bold: true, fontSize: hdrFontSize, color: PDF_DESIGN.white, fillColor: accent, alignment: "center" },
      { text: "الصنف", bold: true, fontSize: hdrFontSize, color: PDF_DESIGN.white, fillColor: accent, alignment: "right" },
      { text: "كمية", bold: true, fontSize: hdrFontSize, color: PDF_DESIGN.white, fillColor: accent, alignment: "center" },
      { text: "السعر", bold: true, fontSize: hdrFontSize, color: PDF_DESIGN.white, fillColor: accent, alignment: "center" },
      { text: "الإجمالي", bold: true, fontSize: hdrFontSize, color: PDF_DESIGN.white, fillColor: accent, alignment: "left" }
    ];

    const itemRows = sale.items.map((item, index) => {
      const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
      return [
        { text: String(index + 1), color: PDF_DESIGN.secondary, fontSize: isNarrow ? 7 : 7.5, alignment: "center" },
        {
          stack: [
            { text: item.name, fontSize: isNarrow ? 8 : 8.5, bold: true, color: PDF_DESIGN.dark, alignment: "right", lineHeight: 1.15 },
            ...(metaLine ? [{ text: metaLine, fontSize: isNarrow ? 6 : 6.5, color: PDF_DESIGN.muted, margin: [0, 1, 0, 0], alignment: "right" }] : [])
          ],
          width: "*"
        },
        { text: String(item.qty), fontSize: isNarrow ? 8 : 8.5, alignment: "center" },
        { text: moneyText(item.price, { size: isNarrow ? 7 : 7.5 }).text, fontSize: isNarrow ? 7 : 7.5, alignment: "center" },
        { ...moneyText(item.total, { size: isNarrow ? 7.5 : 8, bold: true }), alignment: "left" }
      ];
    });

    const itemsTable = {
      layout: {
        hLineWidth: (i) => (i === 1) ? 0.7 : 0,
        hLineColor: () => PDF_DESIGN.border,
        vLineWidth: () => 0,
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2
      },
      table: { headerRows: 1, widths: colWidths, body: [itemHeader, ...itemRows] },
      margin: [0, 2, 0, 0]
    };

    const subFontSize = isNarrow ? 7.5 : 8;
    const subLabelSize = isNarrow ? 7 : 7.5;
    const totalsBody = [
      ...[
        ["المجموع الفرعي", sale.subtotal, {}],
        ["الخصم", sale.discount, {}],
        ...(sale.taxFree ? [] : [["الضريبة", sale.tax, {}]]),
        ...(sale.shipping ? [["مصاريف الشحن", sale.shipping, {}]] : [])
      ].map(([label, value]) => ({
        columns: [
          { ...moneyText(value, { size: subFontSize, color: PDF_DESIGN.dark }), alignment: "left", width: "auto" },
          { text: label, color: PDF_DESIGN.muted, fontSize: subLabelSize, alignment: "right", width: "*" }
        ],
        margin: [0, 1, 0, 1]
      })),
      ...(net.returnAmount > 0 ? [{
        columns: [
          { ...moneyText(-net.returnAmount, { size: subFontSize, bold: true, color: PDF_DESIGN.danger }), alignment: "left", width: "auto" },
          { text: "المجموع المرتجع", color: PDF_DESIGN.danger, bold: true, fontSize: subLabelSize, alignment: "right", width: "*" }
        ],
        margin: [0, 1, 0, 1]
      }] : []),
      totalRule,
      {
        columns: [
          { ...moneyText(net.total, { size: isNarrow ? 11 : 12, bold: true, color: PDF_DESIGN.dark }), alignment: "left", width: "auto" },
          { text: "الإجمالي النهائي", bold: true, font: "CairoSemiBold", fontSize: isNarrow ? 9 : 10, color: PDF_DESIGN.dark, alignment: "right", width: "*" }
        ],
        margin: [0, 2, 0, 2]
      },
      {
        columns: [
          { text: amountInWords(net.total), fontSize: isNarrow ? 6.5 : 7, color: PDF_DESIGN.muted, alignment: "left", width: "*", lineHeight: 1.2 },
          { text: "المبلغ بالحروف", color: PDF_DESIGN.muted, fontSize: isNarrow ? 6.5 : 7, alignment: "right", width: "auto" }
        ],
        margin: [0, 3, 0, 0]
      }
    ];

    const returnsBlock = returns.length ? [
      returnsDivider,
      { text: "المرتجعات", bold: true, font: "CairoSemiBold", color: PDF_DESIGN.danger, fontSize: isNarrow ? 7.5 : 8, margin: [0, 0, 0, 2] },
      ...returns.flatMap(ret => [
        {
          columns: [
            { text: `− ${moneyFormatter.format(Number(ret.total || 0))} ${state.settings.currency}`, bold: true, color: PDF_DESIGN.danger, fontSize: isNarrow ? 7 : 7.5, width: "auto", alignment: "left" },
            { text: `${dateTime(ret.date)}${ret.reason ? ` — ${ret.reason}` : ""}`, color: PDF_DESIGN.danger, fontSize: isNarrow ? 7 : 7.5, alignment: "right", width: "*" }
          ],
          margin: [0, 1, 0, 1]
        },
        ...ret.items.map(item => ({
          text: `× ${item.qty} ${item.name} — ${moneyFormatter.format(Number(item.total || 0))} ${state.settings.currency}`,
          fontSize: isNarrow ? 6.5 : 7,
          color: PDF_DESIGN.danger,
          margin: [4, 0.5, 0, 0.5]
        }))
      ])
    ] : [];

    const qrWidth = isNarrow ? 72 : 92;
    const qrBlock = qr ? [
      metaDivider,
      { image: qr, width: qrWidth, alignment: "center", margin: [0, 2, 0, 2] },
      { text: "امسح للتحقق من الفاتورة", fontSize: isNarrow ? 5.5 : 6, color: PDF_DESIGN.muted, alignment: "center", margin: [0, 0, 0, 2] }
    ] : [];

    const footerFontSize = isNarrow ? 5.5 : 6;
    const footerBlock = [
      footerRule,
      ...(companyLines.length ? [{ text: companyLines.join("   |   "), fontSize: footerFontSize, color: PDF_DESIGN.secondary, alignment: "center", lineHeight: 1.3, margin: [0, 2, 0, 1] }] : []),
      ...(state.settings.invoiceFooter ? [{ text: state.settings.invoiceFooter, fontSize: footerFontSize, color: PDF_DESIGN.secondary, alignment: "center", lineHeight: 1.3, margin: [0, 1, 0, 1] }] : [])
    ];

    const returnHeaders = returns.length * 15;
    const returnDetailRows = returns.reduce((sum, ret) => sum + ret.items.length, 0);
    const estimatedHeight = Math.round(
      420 +
      sale.items.length * (isNarrow ? 32 : 28) +
      returnHeaders +
      returnDetailRows * 12 +
      (qr ? 110 : 0)
    );

    const logoWidth = isNarrow ? 24 : 32;
    const storeFontSize = isNarrow ? 10 : 11;
    const taglineSize = isNarrow ? 6 : 6.5;
    const taglineText = state.settings.storeSubtitle || "متجر ملابس وأزياء";

    return {
      rtl: true,
      pageSize: { width: W, height: estimatedHeight },
      pageMargins: [M, 8, M, 8],
      content: [
        ...(logo ? [{ image: logo, width: logoWidth, alignment: "center", margin: [0, 0, 0, 3] }] : []),
        { text: state.settings.storeName, fontSize: storeFontSize, bold: true, font: "CairoSemiBold", color: accent, alignment: "center", margin: [0, 0, 0, 1] },
        { text: taglineText, fontSize: taglineSize, color: PDF_DESIGN.muted, alignment: "center" },
        headerRule,
        metaGrid,
        metaDivider,
        itemsTable,
        ...returnsBlock,
        ...totalsBody,
        ...qrBlock,
        ...footerBlock
      ],
      info: {
        title: `${sale.number} - ${state.settings.storeName}`,
        author: state.settings.storeName
      }
    };
  }

  function pdfInfoRow(label, value, compact, titleColor, labelColor, valueColor) {
    return {
      columns: [
        { text: String(value), bold: true, font: "CairoSemiBold", fontSize: compact ? 9 : 11.5, color: valueColor || PDF_DESIGN.dark, alignment: "left", width: "*" },
        { text: label, color: labelColor || PDF_DESIGN.secondary, fontSize: compact ? 8.5 : 10, alignment: "right", width: "auto" }
      ],
      margin: [0, compact ? 2 : 1.5, 0, compact ? 2 : 1.5]
    };
  }

  function pdfSoftCard(stack, compact, fill, borderColor, pad) {
    const padValue = pad || (compact ? 10 : 13);
    const cardFill = fill || PDF_DESIGN.background;
    const lineColor = borderColor || PDF_DESIGN.border;
    return {
      layout: {
        defaultBorder: false,
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0,
        hLineColor: () => lineColor,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.6 : 0,
        vLineColor: () => lineColor,
        paddingLeft: () => padValue,
        paddingRight: () => padValue,
        paddingTop: () => (compact ? 6 : 8),
        paddingBottom: () => (compact ? 6 : 8)
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ stack, fillColor: cardFill }]] }
    };
  }

  function pdfItemsHeader(labels, accent, compact) {
    return labels.map(label => ({
      text: label,
      bold: true,
      font: "CairoSemiBold",
      color: "#ffffff",
      fillColor: accent,
      alignment: "center",
      noWrap: true,
      fontSize: compact ? 9 : 11,
      margin: [3, compact ? 4 : 4.5, 3, compact ? 4 : 4.5]
    }));
  }

  function pdfItemsLayout(accent, compact, stripes, stripeColor) {
    const useStripes = stripes !== false;
    const sColor = stripeColor || PDF_DESIGN.softBorder;
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => {
        if (i === 0) return 0.8;
        if (i === 1) return 1;
        if (i === node.table.body.length) return 0.8;
        return 0.4;
      },
      hLineColor: (i, node) => {
        if (i === 1) return accent;
        return sColor;
      },
      vLineWidth: () => 0,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => (compact ? 3 : 4.5),
      paddingBottom: () => (compact ? 3 : 4.5),
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return accent;
        if (useStripes && rowIndex % 2 === 0) return PDF_DESIGN.background;
        return null;
      }
    };
  }

  function showPdfOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "pdf-overlay";
    overlay.id = "pdfOverlay";
    overlay.innerHTML = `<div class="pdf-overlay-content"><div class="spinner"></div><p>جاري إنشاء ملف PDF...</p></div>`;
    document.body.appendChild(overlay);
  }

  function hidePdfOverlay() {
    const overlay = document.getElementById("pdfOverlay");
    if (overlay) overlay.remove();
  }

  async function exportReportAsPdf() {
    const type = state.report.type || "summary";
    const label = (reportTypes.find(t => t.id === type) || {}).label || "تقرير";
    const safeLabel = label.replace(/^تقرير\s*/, "").replace(/\s+/g, "-");
    const date = new Date().toISOString().slice(0, 10);
    await exportPdfWithPdfMake({
      filename: `تقرير-${safeLabel}-${date}`,
      build: logo => buildReportDoc(type, logo)
    });
  }

  async function buildReportDoc(type, logo) {
    const accent = docAccent();
    const light = shadeHex(accent, 0.92);
    const typeInfo = reportTypes.find(t => t.id === type) || reportTypes[0];
    const filterSummary = reportFilterSummary();
    const companyLines = companyInfoLines();
    const reportW = 841.89 - 64;

    const brandStack = [];
    if (logo) brandStack.push({ image: logo, width: 44, alignment: "center", margin: [0, 0, 0, 3] });
    brandStack.push({ text: state.settings.storeName, fontSize: 17, bold: true, font: "CairoSemiBold", color: accent, alignment: "center" });
    brandStack.push({ text: "متجر ملابس وأزياء", fontSize: 9, color: PDF_DESIGN.secondary, alignment: "center", margin: [0, 1, 0, 0] });

    const docTitleStack = [
      { text: typeInfo.label, fontSize: 21, bold: true, font: "CairoSemiBold", color: accent, alignment: "left" },
      { text: `الفترة: ${reportPeriodLabel()}`, fontSize: 10.5, bold: true, color: PDF_DESIGN.dark, alignment: "left", margin: [0, 4, 0, 0] },
      ...(filterSummary ? [{ text: filterSummary, fontSize: 9, color: PDF_DESIGN.secondary, alignment: "left", margin: [0, 2, 0, 0] }] : [])
    ];

    const header = {
      layout: {
        defaultBorder: false,
        paddingLeft: () => 16,
        paddingRight: () => 16,
        paddingTop: () => 12,
        paddingBottom: () => 12
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ columns: [docTitleStack, brandStack], columnGap: 14, fillColor: PDF_DESIGN.background }]] },
      margin: [0, 0, 0, 6]
    };
    const headerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: reportW, y2: 0, lineWidth: 1.2, lineColor: accent }], margin: [0, 0, 0, 8] };

    return {
      rtl: true,
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [32, 40, 32, 60],
      defaultStyle: { font: "Cairo", fontSize: 10, lineHeight: 1.25 },
      content: [
        header,
        headerRule,
        ...await buildReportSections(type, accent, light)
      ],
      footer: (currentPage, pageCount) => ({
        stack: [
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: reportW, y2: 0, lineWidth: 0.6, lineColor: PDF_DESIGN.border }] },
          { text: `${state.settings.storeName} — تم الإنشاء ${new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium" }).format(new Date())}`, alignment: "center", fontSize: 9, color: PDF_DESIGN.muted, margin: [0, 5, 0, 0] },
          ...(companyLines.length ? [{ text: companyLines.join("   |   "), alignment: "center", fontSize: 8.5, color: PDF_DESIGN.secondary, margin: [0, 2, 0, 0] }] : []),
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: "center", fontSize: 9, color: PDF_DESIGN.muted, margin: [0, 2, 0, 0] }
        ],
        margin: [32, 8, 32, 0]
      }),
      info: {
        title: `${typeInfo.label} - ${state.settings.storeName}`,
        author: state.settings.storeName
      }
    };
  }

  async function buildReportSections(type, accent, light) {
    const builders = {
      summary: reportSectionsSummary,
      hourly: reportSectionsHourly,
      "product-profit": reportSectionsProductProfit,
      customers: reportSectionsCustomers,
      inventory: reportSectionsInventory,
      margins: reportSectionsMargins,
      categories: reportSectionsCategories,
      top: reportSectionsTop,
      payments: reportSectionsPayments,
      pl: reportSectionsPL,
      lowstock: reportSectionsLowStock
    };
    return (builders[type] || reportSectionsSummary)(accent, light);
  }

  function reportPeriodLabel() {
    if (state._reportFrom && state._reportTo) return `${state._reportFrom} إلى ${state._reportTo}`;
    if (state._reportFrom) return `من ${state._reportFrom}`;
    if (state._reportTo) return `حتى ${state._reportTo}`;
    return "كل الفترة";
  }

  function reportFilterSummary() {
    const parts = [];
    if (state._reportCategory && state._reportCategory !== "الكل") parts.push(`الفئة: ${state._reportCategory}`);
    if (state._reportPayment && state._reportPayment !== "الكل") parts.push(`الدفع: ${state._reportPayment}`);
    if (state._reportCustomer && state._reportCustomer !== "الكل") parts.push(`العميل: ${state._reportCustomer}`);
    if (state._reportQuery) parts.push(`بحث: ${state._reportQuery}`);
    return parts.join(" | ");
  }

  function pdfTableLayout(accent) {
    const a = accent || docAccent();
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => (node.table.headerRows && i === 0) ? 0.8 : 0.4,
      hLineColor: () => PDF_DESIGN.border,
      vLineWidth: () => 0,
      paddingLeft: () => 7,
      paddingRight: () => 7,
      paddingTop: () => 7,
      paddingBottom: () => 7,
      fillColor: (rowIndex, node) => {
        if (node.table.headerRows && rowIndex < node.table.headerRows) return a;
        return (rowIndex % 2 === 1) ? "#F7F8FA" : null;
      }
    };
  }

  function pdfDangerLayout() {
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => (node.table.headerRows && i === 0) ? 0.8 : 0.4,
      hLineColor: () => "#F5CBCB",
      vLineWidth: () => 0,
      paddingLeft: () => 7,
      paddingRight: () => 7,
      paddingTop: () => 7,
      paddingBottom: () => 7,
      fillColor: (rowIndex, node) => {
        if (node.table.headerRows && rowIndex < node.table.headerRows) return PDF_DESIGN.danger;
        return (rowIndex % 2 === 1) ? "#FEF2F2" : null;
      }
    };
  }

  function pdfHeaderRow(labels, accent, fontSize = 10) {
    const a = accent || docAccent();
    return labels.map(label => ({
      text: label,
      bold: true,
      font: "CairoSemiBold",
      color: "#ffffff",
      alignment: "center",
      noWrap: true,
      fontSize,
      margin: [4, 8, 4, 8]
    }));
  }

  function pdfTableHeaderBar(labels, accent, opts = {}) {
    const fill = opts.fill === undefined ? accent : opts.fill;
    const textColor = opts.text === undefined ? accent : (opts.text === null ? accent : opts.text);
    const font = opts.font || "Cairo";
    const fontSize = opts.size || 9;
    const padding = opts.padding || 6;
    return labels.map(label => ({
      text: label,
      bold: true,
      color: textColor,
      fillColor: fill,
      font,
      alignment: "center",
      fontSize,
      margin: [padding, padding, padding, padding]
    }));
  }

  function pdfTableLayoutPlain(lineColor) {
    const lc = lineColor || "#E5E7EB";
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => (node.table.headerRows && i === 0) ? 0 : 0.4,
      hLineColor: () => lc,
      vLineWidth: () => 0,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 9,
      paddingBottom: () => 9,
      fillColor: () => null
    };
  }

  function pdfDangerHeaderRow(labels, color) {
    return labels.map(label => ({
      text: label,
      bold: true,
      font: "CairoSemiBold",
      color: "#ffffff",
      alignment: "center",
      noWrap: true,
      fontSize: 10,
      margin: [4, 8, 4, 8]
    }));
  }

  function pdfSectionTitle(text, accent) {
    return {
      stack: [
        { text, fontSize: 15, bold: true, font: "CairoSemiBold", color: accent, margin: [0, 10, 0, 3] },
        { canvas: [{ type: "line", x1: 0, y1: 0, x2: 778, y2: 0, lineWidth: 0.8, lineColor: accent, dash: { length: 3 } }], margin: [0, 0, 0, 7] }
      ]
    };
  }

  function pdfSection(title, accent, node) {
    return { unbreakable: true, stack: [pdfSectionTitle(title, accent), node] };
  }

  function pdfAccentRule(color, thickness = 2.4) {
    return {
      layout: "noBorders",
      table: { headerRows: 0, widths: ["*"], body: [[{ text: "\u00a0", fillColor: color, fontSize: thickness }]] },
      margin: [0, 7, 0, 2]
    };
  }

  const DOC_DESIGN = {
    primary: "#075E54",
    secondary: "#0F766E",
    accent: "#2563EB",
    text: "#1F2937",
    textSecondary: "#64748B",
    background: "#F8FAFC",
    border: "#E5E7EB",
    danger: "#B91C1C",
    success: "#15803D"
  };

  const PDF_DESIGN = {
    primary: "#0F766E",
    dark: "#172033",
      secondary: "#374151",
    muted: "#94A3B8",
    border: "#CBD5E1",
    softBorder: "#E5E7EB",
    background: "#F8FAFC",
    white: "#FFFFFF",
    danger: "#B91C1C",
    success: "#15803D",
    gold: "#B58A4A"
  };

  function docAccent() {
    return state.settings.docColor || state.settings.accent || DOC_DESIGN.primary;
  }

  function companyInfoLines() {
    const lines = [];
    if (state.settings.companyPhone) lines.push(`هاتف: ${state.settings.companyPhone}`);
    if (state.settings.companyAddress) lines.push(state.settings.companyAddress);
    if (state.settings.taxNumber) lines.push(`رقم ضريبي: ${state.settings.taxNumber}`);
    if (state.settings.commercialNumber) lines.push(`سجل تجاري: ${state.settings.commercialNumber}`);
    return lines;
  }

  const ARABIC_NUMBER_WORDS = {
    ones: ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"],
    tens: ["", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"],
    hundreds: ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"]
  };

  function arabicSmallWords(n) {
    if (n <= 0) return "";
    if (n < 10) return ARABIC_NUMBER_WORDS.ones[n];
    if (n === 10) return "عشرة";
    if (n === 11) return "أحد عشر";
    if (n === 12) return "اثنا عشر";
    if (n < 20) return `${ARABIC_NUMBER_WORDS.ones[n - 10]} عشر`;
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return rest ? `${ARABIC_NUMBER_WORDS.ones[rest]} و${ARABIC_NUMBER_WORDS.tens[tens]}` : ARABIC_NUMBER_WORDS.tens[tens];
  }

  function arabicGroupWords(n) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const h = hundreds ? ARABIC_NUMBER_WORDS.hundreds[hundreds] : "";
    const r = arabicSmallWords(rest);
    if (h && r) return `${h} و${r}`;
    return h || r;
  }

  function arabicScaleWords(count, scale) {
    if (count === 0) return "";
    if (count === 1) return scale.one;
    if (count === 2) return scale.dual;
    if (count === 200) return `مائتا ${scale.general}`;
    if (count <= 10) return `${arabicGroupWords(count)} ${scale.many}`;
    return `${arabicGroupWords(count)} ${scale.general}`;
  }

  function arabicNumberWords(n) {
    const value = Math.floor(Math.abs(Number(n) || 0));
    if (value === 0) return "صفر";
    if (value === 1) return "واحد";
    if (value === 2) return "اثنان";
    const billions = Math.floor(value / 1e9);
    const millions = Math.floor((value % 1e9) / 1e6);
    const thousands = Math.floor((value % 1e6) / 1e3);
    const rest = value % 1000;
    const parts = [];
    if (billions) parts.push(arabicScaleWords(billions, { one: "مليار", dual: "ملياران", many: "مليارات", general: "مليار" }));
    if (millions) parts.push(arabicScaleWords(millions, { one: "مليون", dual: "مليونان", many: "ملايين", general: "مليون" }));
    if (thousands) parts.push(arabicScaleWords(thousands, { one: "ألف", dual: "ألفان", many: "آلاف", general: "ألف" }));
    if (rest) parts.push(arabicGroupWords(rest));
    return parts.join(" و");
  }

  function currencyWordsMapping() {
    const c = String(state.settings.currency || "").trim();
    if (c === "ج.م" || c === "جنيه") return { main: "جنيهاً", sub: "قرشاً" };
    if (c === "ر.س" || c === "ريال") return { main: "ريالاً", sub: "هللة" };
    if (c === "$" || c === "دولار") return { main: "دولاراً", sub: "سنتاً" };
    if (c === "€" || c === "يورو") return { main: "يورو", sub: "سنتاً" };
    return { main: c, sub: "" };
  }

  function amountInWords(amount) {
    const value = Math.abs(Number(amount || 0));
    const integer = Math.floor(value);
    const frac = Math.round((value - integer) * 100) % 100;
    const mapping = currencyWordsMapping();
    let out = "فقط ";
    if (integer > 0) out += `${arabicNumberWords(integer)} ${mapping.main}`;
    if (frac > 0) out += `${integer > 0 ? " و" : ""}${arabicNumberWords(frac)} ${mapping.sub || mapping.main}`;
    return `${out} لا غير`;
  }

  function loadQrLibrary() {
    return loadScriptList([
      "assets/vendor/qrcode.min.js",
      "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"
    ]).then(() => {
      if (!window.qrcode) throw new Error("فشل تحميل مكتبة QR");
    });
  }

  async function qrDataUrl(text, size = 220) {
    await loadQrLibrary();
    const qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const scale = Math.max(1, Math.floor(size / (count + 8)));
    const pad = 4 * scale;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = pad * 2 + count * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111827";
    for (let r = 0; r < count; r += 1) {
      for (let c = 0; c < count; c += 1) {
        if (qr.isDark(r, c)) ctx.fillRect(pad + c * scale, pad + r * scale, scale, scale);
      }
    }
    return canvas.toDataURL("image/png");
  }

  function invoiceQrText(sale) {
    const lines = [state.settings.storeName, `فاتورة: ${sale.number}`, `التاريخ: ${dateTime(sale.date)}`, `الإجمالي: ${moneyFormatter.format(netSale(sale).total)} ${state.settings.currency || ""}`];
    if (state.settings.taxNumber) lines.push(`رقم ضريبي: ${state.settings.taxNumber}`);
    if (state.settings.commercialNumber) lines.push(`سجل تجاري: ${state.settings.commercialNumber}`);
    return lines.join("\n");
  }

  function pdfMoneyParts(value, opts = {}) {
    const size = opts.size || 9.5;
    return [
      { text: moneyFormatter.format(Number(value || 0)), bold: opts.bold !== false, color: opts.color || "#111827", fontSize: size },
      { text: ` ${state.settings.currency || ""}`, bold: false, color: opts.currencyColor || "#6b7280", fontSize: Math.max(6, size - 2) }
    ];
  }

  function pdfKpiChipDataUrl(label, color) {
    const size = 34;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = isDarkHex(color) ? "#ffffff" : "#111827";
    ctx.font = `bold ${Math.floor(size * 0.52)}px Cairo, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((String(label || "؟").trim().charAt(0) || "؟"), size / 2, size / 2 + size * 0.04);
    return canvas.toDataURL("image/png");
  }

  function pdfKpiCards(items, accent, light) {
    const cards = items.map(item => ({
      width: "*",
      table: {
        widths: ["*"],
        body: [[
          {
            stack: [
              {
                columns: [
                  { image: pdfKpiChipDataUrl(item.label, accent), width: 22, height: 22, alignment: "center", margin: [0, 0, 8, 0] },
                  {
                    stack: [
                      { text: item.label, fontSize: 9, color: PDF_DESIGN.secondary },
                      { text: item.value, fontSize: 13, bold: true, font: "CairoSemiBold", color: PDF_DESIGN.dark, margin: [0, 4, 0, 0] }
                    ],
                    margin: [0, 1, 0, 0]
                  }
                ],
                columnGap: 2
              },
              ...(item.note ? [{ text: item.note, fontSize: 8, color: PDF_DESIGN.muted, margin: [0, 6, 0, 0] }] : [])
            ],
            fillColor: PDF_DESIGN.background,
            margin: [10, 12, 10, 12]
          }
        ]]
      },
      layout: {
        defaultBorder: false,
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0,
        hLineColor: () => PDF_DESIGN.border,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.6 : 0,
        vLineColor: () => PDF_DESIGN.border
      }
    }));
    return { columns: cards, columnGap: 8, margin: [0, 2, 0, 12] };
  }

  function pdfSectionGrid(cards, accent, light) {
    const rows = [];
    for (let i = 0; i < cards.length; i += 2) {
      const pair = cards.slice(i, i + 2);
      const cols = pair.map(card => ({
        width: "*",
        table: {
          widths: ["*"],
          body: [[
            {
              stack: [
                { text: card.title, fontSize: 13, bold: true, font: "CairoSemiBold", color: accent, margin: [0, 0, 0, 10] },
                card.node
              ],
              fillColor: PDF_DESIGN.background,
              margin: [12, 14, 12, 14]
            }
          ]]
        },
        layout: {
          defaultBorder: false,
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0,
          hLineColor: () => PDF_DESIGN.border,
          vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.6 : 0,
          vLineColor: () => PDF_DESIGN.border
        }
      }));
      rows.push({ unbreakable: true, columns: cols, columnGap: 10, margin: [0, 0, 0, 10] });
    }
    return rows;
  }

  function pdfPalette(accent, count) {
    const base = ["#2f9e86", "#e0a03a", "#c25b5b", "#6b7fd7", "#b084cc", "#7a9e6a", "#c97b4a", "#5b8bb0"];
    return [accent, ...base].slice(0, Math.max(1, count));
  }

  function buildDonutSegments(items, accent) {
    const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
    const colors = pdfPalette(accent, items.length);
    return items.map((item, index) => ({
      label: String(item.label || "").slice(0, 18),
      value: Number(item.value || 0),
      valueText: item.display && typeof item.display === "string" ? item.display : formatMoney(item.value),
      pct: total > 0 ? Math.round((item.value / total) * 100) : 0,
      color: colors[index] || accent
    }));
  }

  function pdfDonutDataUrl(segments) {
    const size = 210;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const cx = size / 2, cy = size / 2;
    const radius = size / 2 - 8;
    const inner = radius * 0.62;
    let start = -Math.PI / 2;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    segments.forEach(segment => {
      const angle = total > 0 ? (segment.value / total) * Math.PI * 2 : 0;
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(start), cy + inner * Math.sin(start));
      ctx.arc(cx, cy, radius, start, start + angle);
      ctx.arc(cx, cy, inner, start + angle, start, true);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      start += angle;
    });
    ctx.fillStyle = "#374151";
    ctx.font = "bold 12px Cairo, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("الإجمالي", cx, cy - 9);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 16px Cairo, Arial, sans-serif";
    ctx.fillText(moneyFormatter.format(total), cx, cy + 12);
    return canvas.toDataURL("image/png");
  }

  function pdfDonutBlock(items, accent) {
    const segments = buildDonutSegments(items, accent);
    const legend = {
      layout: { ...pdfTableLayout(accent), fillColor: () => null, paddingTop: () => 4, paddingBottom: () => 4, paddingLeft: () => 6, paddingRight: () => 6 },
      table: {
        headerRows: 0,
        widths: [42, 66, "*", 12],
        body: segments.map(segment => [
          { text: `${segment.pct}%`, fontSize: 9.5, color: PDF_DESIGN.secondary, alignment: "center" },
          { text: segment.valueText, fontSize: 9.5, bold: true, color: PDF_DESIGN.dark, alignment: "center" },
          { text: segment.label, fontSize: 9.5, color: "#374151", alignment: "right" },
          { text: "\u00a0", fontSize: 6, fillColor: segment.color }
        ])
      }
    };
    return {
      columns: [
        { width: 124, image: pdfDonutDataUrl(segments), alignment: "center", margin: [0, 4, 0, 0] },
        { width: "*", stack: [legend], alignment: "right" }
      ],
      columnGap: 10
    };
  }

  function pdfProgressBar(pct, color) {
    const value = Number(pct) || 0;
    const fill = value > 0 ? Math.max(6, Math.min(100, value)) : 1;
    const rest = Math.max(0, 100 - fill);
    return {
      layout: {
        defaultBorder: false,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
        fillColor: () => null
      },
      table: {
        headerRows: 0,
        widths: [fill, rest],
        body: [[
          { text: "\u00a0", fontSize: 5, fillColor: color },
          { text: "\u00a0", fontSize: 5, fillColor: "#EDEFF2" }
        ]]
      }
    };
  }

  function pdfProgressRows(rows, accent, opts = {}) {
    const max = opts.relative === false ? 100 : Math.max(...rows.map(row => Number(row.pct) || 0), 1);
    return pdfTable([
      pdfHeaderRow(["الفئة", "النسبة", "القيمة"], accent),
      ...rows.map(row => {
        const pct = max > 0 ? Math.min(100, ((Number(row.pct) || 0) / max) * 100) : 0;
        return [
          { text: row.label, fontSize: 9.5, bold: true, color: PDF_DESIGN.dark },
          { stack: [pdfProgressBar(pct, accent)], verticalAlignment: "middle" },
          { text: row.display || `${row.pct}%`, alignment: "center", bold: true, fontSize: 9.5, color: PDF_DESIGN.dark }
        ];
      })
    ], ["*", "*", 60], { headerRows: 1 });
  }

  function pdfAlertBlock(title, node) {
    return {
      unbreakable: true,
      stack: [
        { text: title, fontSize: 13, bold: true, font: "CairoSemiBold", color: PDF_DESIGN.danger, margin: [0, 4, 0, 8] },
        node
      ]
    };
  }

  function reportSectionsSummary(accent, light) {
    const stats = getStats();
    const extra = getDiscountsAndShippingStats();
    const margins = getProfitMargins();
    const categories = totalsByCategory();
    const top = topProductsByQty();
    const payments = getPaymentStats();
    const low = activeProducts().filter(p => p.quantity <= p.lowStock);
    const marginPct = stats.allSales > 0 ? `${Math.round((stats.allProfit / stats.allSales) * 100)}%` : "0%";
    const content = [];

    content.push(pdfKpiCards([
      { label: "القطع المباعة", value: `${stats.soldQty} قطعة` },
      { label: "متوسط الفاتورة", value: formatMoney(extra.salesCount ? stats.allSales / extra.salesCount : 0) },
      { label: "عدد الفواتير", value: `${extra.salesCount}` },
      { label: "هامش الربح", value: marginPct },
      { label: "صافي الربح", value: formatMoney(stats.allProfit) },
      { label: "إجمالي المبيعات", value: formatMoney(stats.allSales) }
    ], accent, light));

    content.push(pdfKpiCards([
      { label: "عدد الفواتير", value: `${extra.salesCount}` },
      { label: "إجمالي الضريبة", value: formatMoney(extra.totalTax) },
      { label: "إيراد الشحن", value: formatMoney(extra.totalShipping) },
      { label: "إجمالي الخصومات", value: formatMoney(extra.totalDiscount) }
    ], accent, light));

    const gridCards = [];
    if (categories.length) gridCards.push({ title: "مبيعات الفئات", node: pdfDonutBlock(categories, accent) });
    if (payments.length) gridCards.push({ title: "تحليل طرق الدفع", node: pdfDonutBlock(payments, accent) });
    if (margins.length) {
      gridCards.push({
        title: "هوامش الربح حسب الفئة",
        node: pdfProgressRows(margins.map(m => ({ label: m.label, pct: m.value, display: m.display })), accent, { relative: false })
      });
    }
    if (top.length) {
      gridCards.push({
        title: "الأكثر مبيعاً",
        node: pdfTable([
          pdfHeaderRow(["الكمية", "الصنف"], accent),
          ...top.map(t => [{ text: t.display, alignment: "center", bold: true, fontSize: 10 }, { text: t.label, fontSize: 10, bold: true, alignment: "right" }])
        ], [64, "*"], { headerRows: 1 })
      });
    }
    content.push(...pdfSectionGrid(gridCards, accent, light));

    if (low.length) {
      content.push(pdfAlertBlock("أصناف منخفضة المخزون", pdfTable([
        pdfDangerHeaderRow(["حد التنبيه", "المتبقي", "SKU", "الصنف"], "#B91C1C"),
        ...low.map(p => [
          { text: `${p.lowStock}`, alignment: "center", fontSize: 10 },
          { text: `${p.quantity}`, alignment: "center", fontSize: 10, bold: true, color: "#B91C1C" },
          { text: p.sku, fontSize: 10, alignment: "center" },
          { text: p.name, fontSize: 10, bold: true, alignment: "right" }
        ])
      ], [58, 52, 90, "*"], { layout: pdfDangerLayout(), headerRows: 1 })));
    }

    return content;
  }

  function reportSectionsHourly(accent) {
    const rows = getHourlySales();
    const content = [];
    if (rows.length) {
      content.push(pdfSectionTitle("ساعات الذروة", accent));
      content.push(pdfProgressRows(rows.map(h => ({ label: h.label, pct: h.value, display: h.display })), accent));
    } else {
      content.push({ text: "لا توجد بيانات ساعات بيع في هذه الفترة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsProductProfit(accent) {
    const rows = getProductProfitability();
    const content = [];
    if (rows.length) {
      content.push(pdfSectionTitle("تحليل ربحية الأصناف المباعة", accent));
      content.push(pdfTable([
        pdfHeaderRow(["الهامش", "صافي الربح", "التكلفة", "الإيراد", "القطع", "الصنف"], accent),
        ...rows.map(p => [
          { text: `${p.margin}%`, alignment: "center", fontSize: 10 },
          { text: formatMoney(p.profit), alignment: "center", bold: true, fontSize: 10 },
          { text: formatMoney(p.cost), alignment: "center", fontSize: 10 },
          { text: formatMoney(p.revenue), alignment: "center", fontSize: 10 },
          { text: `${p.qty}`, alignment: "center", fontSize: 10 },
          { text: p.name, bold: true, fontSize: 10, alignment: "right" }
        ])
      ], [50, 64, 52, 52, 44, "*"]));
    } else {
      content.push({ text: "لا توجد مبيعات أصناف في هذه الفترة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsCustomers(accent) {
    const rows = getTopCustomers();
    const content = [];
    if (rows.length) {
      content.push(pdfSectionTitle("العملاء الأكثر شراءً", accent));
      content.push(pdfTable([
        pdfHeaderRow(["إجمالي المشتريات", "عدد الفواتير", "اسم العميل"], accent),
        ...rows.map(c => [
          { text: formatMoney(c.total), alignment: "center", bold: true, fontSize: 10 },
          { text: `${c.count}`, alignment: "center", fontSize: 10 },
          { text: c.name, bold: true, fontSize: 10, alignment: "right" }
        ])
      ], [70, 70, "*"]));
    } else {
      content.push({ text: "لا توجد مبيعات عملاء مسجلة في هذه الفترة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  async function reportSectionsInventory(accent, light) {
    const products = filteredReportProducts();
    let totalQty = 0, retailValue = 0, costValue = 0;
    products.forEach(p => {
      totalQty += p.quantity;
      retailValue += p.price * p.quantity;
      costValue += p.cost * p.quantity;
    });
    const lowCount = products.filter(p => p.quantity <= p.lowStock).length;
    const content = [];
    content.push(pdfSectionTitle("تقرير المخزون التفصيلي", accent));
    content.push(pdfKpiCards([
      { label: "أصناف منخفضة", value: `${lowCount}` },
      { label: "الربح المتوقع", value: formatMoney(retailValue - costValue) },
      { label: "قيمة التكلفة", value: formatMoney(costValue) },
      { label: "قيمة البيع", value: formatMoney(retailValue) },
      { label: "إجمالي القطع", value: `${totalQty}` },
      { label: "عدد الأصناف", value: `${products.length}` }
    ], accent, light));
    if (products.length) {
      const thumbs = await Promise.all(products.map(p => resolveThumbForPdf(p.image, 44, p.name, "circle")));
      content.push(pdfTable([
        pdfHeaderRow(["الحالة", "قيمة المخزون", "التكلفة", "سعر البيع", "الكمية", "الفئة", "SKU", "الصورة", "الصنف"], accent),
        ...products.map((p, index) => [
          { text: p.quantity <= p.lowStock ? "منخفض" : "متاح", alignment: "center", bold: true, fontSize: 10, color: p.quantity <= p.lowStock ? "#dc2626" : "#15803d" },
          { text: formatMoney(p.price * p.quantity), alignment: "center", bold: true, fontSize: 10 },
          { text: formatMoney(p.cost), alignment: "center", fontSize: 10 },
          { text: formatMoney(p.price), alignment: "center", fontSize: 10 },
          { text: `${p.quantity}`, alignment: "center", fontSize: 10 },
          { text: p.category, alignment: "center", fontSize: 10 },
          { text: p.sku, alignment: "center", fontSize: 10 },
          thumbs[index]
            ? { image: thumbs[index], width: 24, height: 24, alignment: "center", margin: [1, 1, 1, 1] }
            : { text: "", margin: [2, 3, 2, 3] },
          { text: p.name, bold: true, fontSize: 10, alignment: "right" }
        ])
      ], [44, 74, 50, 56, 48, 52, 52, 46, "*"]));
    } else {
      content.push({ text: "لا توجد أصناف مطابقة للفلاتر المحددة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsMargins(accent, light) {
    const stats = getStats();
    const margins = getProfitMargins();
    const marginPct = stats.allSales > 0 ? `${Math.round((stats.allProfit / stats.allSales) * 100)}%` : "0%";
    const content = [];
    content.push(pdfSectionTitle("تحليل الأرباح الهامشية", accent));
    content.push(pdfKpiCards([
      { label: "القطع المباعة", value: `${stats.soldQty}` },
      { label: "هامش الربح", value: marginPct },
      { label: "صافي الربح", value: formatMoney(stats.allProfit) },
      { label: "إجمالي الإيرادات", value: formatMoney(stats.allSales) }
    ], accent, light));
    if (margins.length) {
      content.push(pdfSection("هوامش الربح حسب الفئة", accent, pdfProgressRows(
        margins.map(m => ({ label: m.label, pct: m.value, display: m.display })),
        accent,
        { relative: false }
      )));
    } else {
      content.push({ text: "لا توجد مبيعات في هذه الفترة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsCategories(accent) {
    const categories = totalsByCategory();
    const content = [];
    if (categories.length) {
      content.push(pdfSectionTitle("مبيعات الفئات", accent));
      content.push(pdfDonutBlock(categories, accent));
    } else {
      content.push({ text: "لا توجد مبيعات فئات في هذه الفترة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsTop(accent) {
    const top = topProductsByQty();
    const content = [];
    if (top.length) {
      content.push(pdfSectionTitle("الأكثر مبيعاً", accent));
      content.push(pdfTable([
        pdfHeaderRow(["الكمية", "الصنف", "الترتيب"], accent),
        ...top.map((t, i) => [
          { text: t.display, alignment: "center", bold: true, fontSize: 10 },
          { text: t.label, bold: true, fontSize: 10, alignment: "right" },
          { text: `${i + 1}`, alignment: "center", bold: true, fontSize: 10, color: i < 3 ? accent : "#6b7280" }
        ])
      ], [64, "*", 40]));
    } else {
      content.push({ text: "لا توجد مبيعات كافية للرسم بعد.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsPayments(accent) {
    const payments = getPaymentStats();
    const content = [];
    if (payments.length) {
      content.push(pdfSectionTitle("تحليل طرق الدفع", accent));
      content.push(pdfDonutBlock(payments, accent));
    } else {
      content.push({ text: "لا توجد بيانات دفع بعد.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function reportSectionsPL(accent) {
    const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
    const content = [];
    content.push(pdfSectionTitle("قائمة الأرباح والخسائر", accent));
    if (pl.revenue > 0 || pl.expenses > 0) {
      const rows = [
        ["البيان", "القيمة"],
        ["إجمالي المبيعات (قيمة البضاعة)", formatMoney(pl.revenue)],
        ["الخصومات الممنوحة", "− " + formatMoney(pl.discount)],
        ["إيراد الشحن", "+ " + formatMoney(pl.shipping)],
        ["صافي الإيراد", formatMoney(pl.revenue - pl.discount + pl.shipping)],
        ["تكلفة البضاعة المباعة", "− " + formatMoney(pl.cost)],
        ["مجمل الربح", formatMoney(pl.gross - pl.discount + pl.shipping)],
        ["المصروفات التشغيلية", "− " + formatMoney(pl.expenses)],
        ["ضريبة محصلة (تُحوَّل للحكومة)", formatMoney(pl.tax)],
        ["صافي الربح", formatMoney(pl.netProfit)]
      ];
      content.push(pdfTable(
        rows.map((row, index) => row.map(cell => ({
          text: cell,
          alignment: index === 0 ? "center" : "right",
          bold: index === 0 || row[0] === "صافي الربح" || row[0] === "صافي الإيراد" || row[0] === "مجمل الربح",
          color: index === 0 ? accent : (row[0] === "صافي الربح" ? (pl.netProfit >= 0 ? "#047857" : "#B91C1C") : "#374151"),
          fontSize: index === 0 ? 9 : 9.5
        }))),
        ["*", 130],
        { layout: pdfTableLayout(accent), headerRows: 1, margin: [0, 4, 0, 10] }
      ));
      content.push({ text: `${pl.salesCount} فاتورة داخل النطاق · إجمالي المصروفات: ${formatMoney(pl.expenses)}`, fontSize: 8, color: "#6b7280", alignment: "center" });
    } else {
      content.push({ text: "لا توجد مبيعات أو مصروفات في النطاق المحدد.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  async function reportSectionsLowStock(accent) {
    const low = filteredReportProducts().filter(p => p.quantity <= p.lowStock);
    const content = [];
    if (low.length) {
      const thumbs = await Promise.all(low.map(p => resolveThumbForPdf(p.image, 44, p.name, "circle")));
      content.push(pdfAlertBlock("أصناف منخفضة المخزون", pdfTable([
        pdfDangerHeaderRow(["حد التنبيه", "المتبقي", "SKU", "الصورة", "الصنف"], "#B91C1C"),
        ...low.map((p, index) => [
          { text: `${p.lowStock}`, alignment: "center", fontSize: 10 },
          { text: `${p.quantity}`, alignment: "center", bold: true, fontSize: 10, color: "#B91C1C" },
          { text: p.sku, alignment: "center", fontSize: 10 },
          thumbs[index]
            ? { image: thumbs[index], width: 24, height: 24, alignment: "center", margin: [1, 1, 1, 1] }
            : { text: "", margin: [2, 3, 2, 3] },
          { text: p.name, bold: true, fontSize: 10, alignment: "right" }
        ])
      ], [58, 52, 52, 46, "*"], { layout: pdfDangerLayout(), headerRows: 1 })));
    } else {
      content.push({ text: "لا توجد تنبيهات مخزون مطابقة للفلاتر المحددة.", alignment: "center", color: "#6b7280", margin: [0, 20, 0, 0] });
    }
    return content;
  }

  function pdfTable(body, widths, opts = {}) {
    return {
      layout: opts.layout || pdfTableLayout(docAccent()),
      table: {
        headerRows: opts.headerRows !== undefined ? opts.headerRows : 1,
        widths,
        body,
        ...(opts.rtl !== undefined ? { rtl: opts.rtl } : {})
      },
      ...(opts.margin ? { margin: opts.margin } : {})
    };
  }

  function shadeHex(hex, percent) {
    const raw = String(hex || "#0e5349").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map(c => c + c).join("") : raw;
    const num = parseInt(full, 16);
    const r = Math.min(255, Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * percent));
    const g = Math.min(255, Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * percent));
    const b = Math.min(255, Math.round((num & 255) + (255 - (num & 255)) * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  function invoiceText(sale) {
    const net = netSale(sale);
    const lines = [
      state.settings.storeName,
      sale.number,
      dateTime(sale.date),
      `العميل: ${sale.customerName}`,
      ...sale.items.map(item => `${item.name} x${item.qty} = ${formatMoney(item.total)}`),
      sale.shipping ? `مصاريف الشحن: ${formatMoney(sale.shipping)}` : null,
      ...((sale.returns || []).length ? [
        `المرتجعات: ${net.qty > 0 ? "جزئية" : "كاملة"}`,
        ...sale.returns.flatMap(ret => ret.items.map(item => `مرتجع: ${item.name} x${item.qty} = ${formatMoney(item.total)}`))
      ] : []),
      `الإجمالي: ${formatMoney(net.total)}`,
      amountInWords(net.total),
      ...companyInfoLines()
    ].filter(Boolean);
    return lines.join("\n");
  }

  async function saveSettings(event) {
    event.preventDefault();
    const nextSettings = {
      storeName: document.getElementById("storeName").value.trim() || "خيط بوتيك",
      currency: document.getElementById("currency").value.trim() || "ر.س",
      taxRate: Number(document.getElementById("taxRate").value || 0),
      invoiceFooter: document.getElementById("invoiceFooter").value.trim(),
      invoiceTemplate: document.querySelector("input[name='invoiceTemplate']:checked")?.value || state.settings.invoiceTemplate,
      accent: document.getElementById("accentColor").value,
      docColor: document.getElementById("docColor")?.value || state.settings.docColor,
      logo: state.settings.logo || "",
      companyPhone: document.getElementById("companyPhone")?.value.trim() || "",
      companyAddress: document.getElementById("companyAddress")?.value.trim() || "",
      taxNumber: document.getElementById("taxNumber")?.value.trim() || "",
      commercialNumber: document.getElementById("commercialNumber")?.value.trim() || "",
      allowTaxFree: !!document.getElementById("allowTaxFree")?.checked,
      showInvoiceQr: !!document.getElementById("showInvoiceQr")?.checked,
      customerCodePrefix: document.getElementById("customerCodePrefix")?.value.trim() || state.settings.customerCodePrefix || "CUST"
    };
    if (!(await commitState({ settings: nextSettings }))) {
      showStorageFullDialog();
      return;
    }
    applySettings();
    toastMessage("تم حفظ الإعدادات");
    render();
  }

  function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      toastMessage("حجم الشعار يجب أن يكون أقل من 200 كيلوبايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxSize = 128;
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const nextSettings = { ...state.settings, logo: canvas.toDataURL("image/png", 0.9) };
        if (!(await commitState({ settings: nextSettings }))) {
          showStorageFullDialog();
          return;
        }
        applySettings();
        const preview = document.getElementById("logoPreview");
        if (preview) {
          preview.src = state.settings.logo;
          preview.classList.add("has-logo");
        }
        toastMessage("تم رفع الشعار بنجاح");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function extractReport() {
    state._reportFrom = document.getElementById("reportDateFrom")?.value || null;
    state._reportTo = document.getElementById("reportDateTo")?.value || null;
    state._reportCategory = document.getElementById("reportCategory")?.value || "الكل";
    state._reportPayment = document.getElementById("reportPayment")?.value || "الكل";
    state._reportCustomer = document.getElementById("reportCustomer")?.value || "الكل";
    state._reportQuery = document.getElementById("reportQuery")?.value.trim() || "";
    render();
    toastMessage("تم استخراج التقرير حسب الفلاتر المحددة");
  }

  function applyReportPreset(preset) {
    const today = new Date();
    const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const daysAgo = days => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const ranges = {
      day: [today, today],
      week: [daysAgo(6), today],
      month: [new Date(today.getFullYear(), today.getMonth(), 1), today],
      month30: [daysAgo(29), today],
      all: [null, null]
    };
    const [from, to] = ranges[preset] || ranges.all;
    state._reportFrom = from ? iso(from) : null;
    state._reportTo = to ? iso(to) : null;
    render();
    toastMessage(preset === "all" ? "تم عرض كل الفترة بدون تصفية" : "تم تطبيق الفترة الزمنية على التقرير");
  }

  function clearReportFilters() {
    state._reportFrom = null;
    state._reportTo = null;
    state._reportCategory = "الكل";
    state._reportPayment = "الكل";
    state._reportCustomer = "الكل";
    state._reportQuery = "";
    render();
    toastMessage("تم مسح جميع الفلاتر");
  }

  function exportBackup() {
    const backupData = {
      app: "clothing-pos-pwa",
      version: "1.0",
      exportDate: new Date().toISOString(),
      storeName: state.settings.storeName,
      stats: {
        productsCount: activeProducts().length,
        salesCount: state.sales.length,
        expensesCount: state.expenses.length,
        paymentsCount: state.payments.length,
        customersCount: state.customers.length
      },
      products: state.products,
      sales: state.sales,
      expenses: state.expenses,
      payments: state.payments,
      customers: state.customers,
      settings: state.settings
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pos-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toastMessage("تم تصدير النسخة الاحتياطية بنجاح");
  }

  function handleBackupImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.products) || !Array.isArray(data.sales)) {
          alert("ملف النسخة الاحتياطية غير صالح أو تالف.");
          return;
        }
        const confirmMsg = `هل أنت متأكد من استرجاع البيانات؟\n\nتفاصيل النسخة:\n• أصناف: ${data.products.length}\n• فواتير: ${data.sales.length}\n• مصروفات: ${Array.isArray(data.expenses) ? data.expenses.length : 0}\n• دفعات: ${Array.isArray(data.payments) ? data.payments.length : 0}\n• عملاء: ${Array.isArray(data.customers) ? data.customers.length : 0}\n• المتجر: ${data.settings?.storeName || 'غير محدد'}\n• التاريخ: ${data.exportDate ? new Date(data.exportDate).toLocaleDateString('ar-EG-u-nu-latn') : 'غير معروف'}\n\n⚠️ سيتم استبدال بياناتك الحالية بالكامل بالبيانات التي في الملف.`;
        if (confirm(confirmMsg)) {
          const nextSettings = data.settings ? { ...defaultSettings(), ...data.settings } : state.settings;
          Promise.resolve(commitState({
            products: data.products,
            sales: data.sales,
            expenses: Array.isArray(data.expenses) ? data.expenses : [],
            payments: Array.isArray(data.payments) ? data.payments : [],
            customers: Array.isArray(data.customers) ? data.customers : [],
            settings: nextSettings
          })).then(ok => {
            if (!ok) {
              showStorageFullDialog();
              return;
            }
            applySettings();
            render();
            toastMessage("تم استرجاع النسخة الاحتياطية بنجاح");
          });
        }
      } catch (err) {
        console.error("Backup import error:", err);
        alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  async function factoryReset() {
    const msg1 = "⚠️ تحذير شديد الخطورة!\n\nهل أنت متأكد تماماً من إعادة ضبط المصنع؟\nسيتم مسح جميع الأصناف والفواتير والشعار والإعدادات نهائياً ولن يمكنك التراجع.";
    if (!confirm(msg1)) return;

    const input = prompt("لإعادة الضبط وتأكيد المسح النهائي الكامل، اكتب كلمة (مسح) في الخانة أدناه:");
    if (input !== "مسح") {
      toastMessage("تم إلغاء إعادة ضبط المصنع (الكلمة غير مطابقة)");
      return;
    }

    state.products = [];
    state.sales = [];
    state.expenses = [];
    state.payments = [];
    state.settings = defaultSettings();
    state.cart = [];
    state._reportFrom = null;
    state._reportTo = null;

    if (!(await commitState({ products: [], sales: [], expenses: [], payments: [], settings: defaultSettings() }))) {
      showStorageFullDialog();
      return;
    }
    applySettings();
    render();
    toastMessage("تمت إعادة ضبط المصنع ومسح جميع الأصناف والبيانات بالكامل");
  }

  async function loadDemoData() {
    if (activeProducts().length > 0 && !confirm("لديك أصناف موجودة بالفعل. هل تريد إضافة الأصناف التجريبية؟")) {
      return;
    }
    if (!(await commitState({ products: seedProducts() }))) {
      showStorageFullDialog();
      return;
    }
    render();
    toastMessage("تم تحميل الأصناف التجريبية بنجاح");
  }

  function seedDemoData() {
    if (state.sales.length > 0 || state.expenses.length > 0) return;
    const products = seedProducts();
    state.products = products;
    const customerNames = ["أحمد سيد", "محمد علاء", "سارة حسن", "منى خالد", "عمر عبدالله", "هدى إبراهيم", "كريم يوسف", "نورهان عادل"];
    const paymentMethods = ["نقدا", "بطاقة", "تحويل"];
    const idleNotes = ["", "فاتورة مخفضة", "عميل مميز", "طلب بالجملة", "عرض نهاية الموسم"];
    const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const pick = arr => arr[rnd(0, arr.length - 1)];
    const sales = [];
    const soldQty = {};
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() - rnd(0, 29));
      date.setHours(rnd(10, 21), rnd(0, 59), rnd(0, 59), 0);
      const used = new Set();
      const items = [];
      const lineCount = rnd(1, 3);
      for (let j = 0; j < lineCount; j++) {
        let idx = rnd(0, products.length - 1);
        let guard = 0;
        while (used.has(idx) && guard++ < 10) idx = rnd(0, products.length - 1);
        used.add(idx);
        const p = products[idx];
        const q = rnd(1, 2);
        soldQty[p.id] = (soldQty[p.id] || 0) + q;
        items.push({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          size: p.size,
          color: p.color,
          qty: q,
          price: p.price,
          cost: p.cost,
          total: p.price * q
        });
      }
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const discount = Math.random() < 0.35 ? Math.round((subtotal * rnd(5, 15)) / 100) : 0;
      const shipping = Math.random() < 0.2 ? rnd(15, 60) : 0;
      const taxFree = Math.random() < 0.12;
      const taxable = subtotal - discount;
      const tax = taxFree ? 0 : Math.round((taxable * (state.settings.taxRate || 14)) / 100);
      const total = taxable + tax + shipping;
      sales.push({
        id: cryptoRandomId("s"),
        number: `INV-2026-${String(i + 1).padStart(4, "0")}`,
        date: date.toISOString(),
        customerName: Math.random() < 0.75 ? pick(customerNames) : "عميل نقدي",
        customerPhone: "",
        paymentMethod: pick(paymentMethods),
        taxRate: state.settings.taxRate || 14,
        discount,
        shipping,
        subtotal,
        taxFree,
        tax,
        total,
        items
      });
    }
    state.sales = sales;
    state.products = products.map(p => ({ ...p, quantity: Math.max(0, p.quantity - (soldQty[p.id] || 0)) }));
    const expenseCategories = ["إيجار", "رواتب", "كهرباء", "مياه", "إنترنت", "شحن", "تسويق", "صيانة", "أخرى"];
    const expenses = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() - rnd(0, 29));
      date.setHours(rnd(9, 18), rnd(0, 59), 0, 0);
      expenses.push({
        id: cryptoRandomId("e"),
        category: pick(expenseCategories),
        amount: rnd(50, 400) + (i % 3 === 0 ? 500 : 0),
        date: date.toISOString(),
        note: pick(idleNotes)
      });
    }
    state.expenses = expenses;
    state.customers = customerNames.map((name, i) => ({
      id: cryptoRandomId("c"),
      code: `${customerCodePrefix()}-${String(i + 1).padStart(4, "0")}`,
      name,
      phone: "",
      address: "",
      photo: "",
      notes: "",
      discount: i % 4 === 0 ? 5 : 0,
      classification: pick(["جديد", "دائم", "مميز"]),
      createdAt: todayISO(),
      updatedAt: todayISO()
    }));
    state.payments = [];
  }

  function _memoize(fn, keyFn) {
    const cache = new Map();
    const wrapped = function(...args) {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
    wrapped.invalidate = () => cache.clear();
    return wrapped;
  }

  function _debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const getFilteredSales = _memoize(function() {
    let sales = state.sales;
    if (state._reportFrom) {
      const from = new Date(state._reportFrom);
      from.setHours(0, 0, 0, 0);
      sales = sales.filter(s => new Date(s.date) >= from);
    }
    if (state._reportTo) {
      const to = new Date(state._reportTo);
      to.setHours(23, 59, 59, 999);
      sales = sales.filter(s => new Date(s.date) <= to);
    }
    if (state._reportCategory && state._reportCategory !== "الكل") {
      sales = sales.filter(s => s.items.some(item => item.category === state._reportCategory));
    }
    if (state._reportPayment && state._reportPayment !== "الكل") {
      sales = sales.filter(s => (s.paymentMethod || "نقدا") === state._reportPayment);
    }
    if (state._reportCustomer && state._reportCustomer !== "الكل") {
      sales = sales.filter(s => (s.customerName || "عميل نقدي").trim() === state._reportCustomer);
    }
    if (state._reportQuery) {
      const query = state._reportQuery.trim().toLowerCase();
      sales = sales.filter(s => s.items.some(item => `${item.name} ${item.sku}`.toLowerCase().includes(query)));
    }
    return sales;
  }, () => `${state.sales.length}-${state._reportFrom}-${state._reportTo}-${state._reportCategory}-${state._reportPayment}-${state._reportCustomer}-${state._reportQuery}`);

  function getStats() {
    const todayKey = new Date().toDateString();
    const todaySales = state.sales.filter(sale => new Date(sale.date).toDateString() === todayKey);
    const filteredSales = getFilteredSales();
    const summarize = sales => sales.reduce((acc, sale) => {
      const net = netSale(sale);
      acc.sales += net.total;
      acc.profit += net.profit;
      acc.qty += net.qty;
      return acc;
    }, { sales: 0, profit: 0, qty: 0 });
    const today = summarize(todaySales);
    const all = summarize(filteredSales);
    return {
      todaySales: today.sales,
      todayProfit: today.profit,
      todayInvoices: todaySales.length,
      allSales: all.sales,
      allProfit: all.profit,
      soldQty: all.qty
    };
  }

  function getInventoryStats() {
    let totalQty = 0, retailValue = 0, costValue = 0;
    activeProducts().forEach(p => {
      totalQty += p.quantity;
      retailValue += p.price * p.quantity;
      costValue += p.cost * p.quantity;
    });
    const marginPct = retailValue > 0 ? Math.round(((retailValue - costValue) / retailValue) * 100) : 0;
    return { totalQty, retailValue, costValue, marginPct };
  }

  function getPaymentStats() {
    const sales = getFilteredSales();
    const methods = {};
    sales.forEach(s => {
      const m = s.paymentMethod || "نقدا";
      if (!methods[m]) methods[m] = { method: m, total: 0, count: 0 };
      methods[m].total += netSale(s).total;
      methods[m].count += 1;
    });
    return Object.values(methods).sort((a, b) => b.total - a.total);
  }

  function getProfitMargins() {
    const sales = getFilteredSales();
    const cats = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!cats[item.category]) cats[item.category] = { revenue: 0, cost: 0 };
        cats[item.category].revenue += item.price * item.qty;
        cats[item.category].cost += item.cost * item.qty;
      });
      saleReturnItems(s).forEach(item => {
        const label = item.category || "غير مصنف";
        if (!cats[label]) cats[label] = { revenue: 0, cost: 0 };
        cats[label].revenue -= item.price * item.qty;
        cats[label].cost -= (item.cost || 0) * item.qty;
      });
    });
    return Object.entries(cats).map(([label, data]) => ({
      label,
      value: data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0,
      display: `${data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0}%`
    }));
  }

  function getDiscountsAndShippingStats() {
    const sales = getFilteredSales();
    let totalDiscount = 0, totalShipping = 0, totalTax = 0;
    sales.forEach(s => {
      totalDiscount += Number(s.discount || 0);
      totalShipping += Number(s.shipping || 0);
      totalTax += Number(s.tax || 0);
    });
    return { totalDiscount, totalShipping, totalTax, salesCount: sales.length };
  }

  function getTopCustomers() {
    const sales = getFilteredSales();
    const custMap = {};
    sales.forEach(s => {
      const name = s.customerName?.trim() || "عميل نقدي";
      if (!custMap[name]) custMap[name] = { name, total: 0, count: 0 };
      custMap[name].total += netSale(s).total;
      custMap[name].count += 1;
    });
    return Object.values(custMap).sort((a, b) => b.total - a.total).slice(0, 8);
  }

  function getHourlySales() {
    const sales = getFilteredSales();
    const hoursMap = {};
    sales.forEach(s => {
      const hour = new Date(s.date).getHours();
      hoursMap[hour] = (hoursMap[hour] || 0) + netSale(s).total;
    });
    return Object.entries(hoursMap)
      .map(([h, val]) => {
        const hourNum = Number(h);
        const ampm = hourNum >= 12 ? "مساءً" : "صباحاً";
        const displayHour = hourNum % 12 || 12;
        return {
          label: `${displayHour} ${ampm}`,
          value: val,
          display: formatMoney(val)
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }

  function getProductProfitability() {
    const sales = getFilteredSales();
    const prodMap = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!prodMap[item.name]) {
          prodMap[item.name] = { name: item.name, qty: 0, revenue: 0, cost: 0 };
        }
        prodMap[item.name].qty += item.qty;
        prodMap[item.name].revenue += item.price * item.qty;
        prodMap[item.name].cost += (item.cost || 0) * item.qty;
      });
      saleReturnItems(s).forEach(item => {
        if (!prodMap[item.name]) {
          prodMap[item.name] = { name: item.name, qty: 0, revenue: 0, cost: 0 };
        }
        prodMap[item.name].qty -= item.qty;
        prodMap[item.name].revenue -= item.price * item.qty;
        prodMap[item.name].cost -= (item.cost || 0) * item.qty;
      });
    });
    return Object.values(prodMap).map(p => {
      const profit = p.revenue - p.cost;
      const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 100) : 0;
      return { ...p, profit, margin };
    }).filter(p => p.qty > 0).sort((a, b) => b.profit - a.profit);
  }

  function topProductsByQty() {
    const sales = getFilteredSales();
    const totals = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        totals[item.name] = (totals[item.name] || 0) + item.qty;
      });
      saleReturnItems(sale).forEach(item => {
        totals[item.name] = (totals[item.name] || 0) - item.qty;
      });
    });
    return Object.entries(totals)
      .map(([label, value]) => ({ label, value, display: `${value} قطعة` }))
      .filter(entry => entry.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }

  function totalsByCategory() {
    const sales = getFilteredSales();
    const totals = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const label = item.category || "غير مصنف";
        totals[label] = (totals[label] || 0) + (item.price * item.qty);
      });
      saleReturnItems(sale).forEach(item => {
        const label = item.category || "غير مصنف";
        totals[label] = (totals[label] || 0) - (item.price * item.qty);
      });
    });
    return Object.entries(totals)
      .map(([label, value]) => ({ label, value, display: formatMoney(value) }))
      .filter(entry => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  function formatMoney(value) {
    return `${moneyFormatter.format(Number(value || 0))} ${state.settings.currency}`;
  }

  function dateTime(value) {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function generateSku() {
    return `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function cryptoRandomId(prefix) {
    const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${id}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function toastMessage(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function updateConnection() {
    const status = document.getElementById("connectionStatus");
    if (!navigator.onLine) {
      status.textContent = "وضع عدم الاتصال مفعل";
      toastMessage("أنت الآن دون اتصال. البيانات محفوظة على هذا الجهاز.");
    } else {
      status.textContent = "جاهز للعمل";
    }
  }

  async function installApp() {
    if (!state.deferredInstallPrompt) {
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        toastMessage("على iPhone: اضغط زر المشاركة في الأسفل ثم (إضافة إلى الشاشة الرئيسية) لتثبيت التطبيق.");
        return;
      }
      if (location.protocol === "file:") {
        toastMessage("فتح التطبيق كملف محلي يمنع التثبيت. شغّله عبر خادم محلي أو HTTPS ثم اضغط الزر مجدداً.");
        return;
      }
      if (!window.isSecureContext) {
        toastMessage("التثبيت يحتاج اتصالاً آمناً HTTPS أو localhost. اضغط الزر مجدداً بعد التشغيل عبر HTTPS.");
        return;
      }
      toastMessage("التثبيت متاح من أيقونة القائمة (⋮) في المتصفح ← تثبيت التطبيق. إن لم يظهر، عُد بعد بضع زيارات للتطبيق.");
      return;
    }
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice.catch(() => {});
    state.deferredInstallPrompt = null;
    updateInstallButtons();
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        console.info("Service worker registration is available when served over localhost or HTTPS.");
      });
    }
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 1: Keyboard Shortcuts
     ═══════════════════════════════════════════════════════ */
  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      const dialogs = document.querySelectorAll("dialog[open]");
      if (dialogs.length > 0) {
        if (e.key === "Escape") {
          const top = dialogs[dialogs.length - 1];
          if (top.id === "exitDialog") cancelExitApp();
          else top.close();
        }
        return;
      }
      if (e.key === "F2") { e.preventDefault(); go("sale"); }
      else if (e.key === "F3") { e.preventDefault(); go("products"); setTimeout(() => { const s = document.getElementById("productSearch"); if (s) s.focus(); }, 100); }
      else if (e.key === "F4") { e.preventDefault(); go("products"); setTimeout(() => { const b = document.getElementById("addProductButton"); if (b) b.click(); }, 100); }
      else if (e.key === "F8") { e.preventDefault(); const c = document.getElementById("checkoutButton"); if (c) c.click(); }
      else if (e.key === "F9") { e.preventDefault(); go("invoices"); }
      else if (e.ctrlKey && e.key === "p") { e.preventDefault(); const p = document.getElementById("printInvoiceButton"); if (p) p.click(); else window.print(); }
      else if (e.ctrlKey && e.key === "b") { e.preventDefault(); exportBackup(); }
      else if (e.key === "Escape") { go("dashboard"); }
    });
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 1: USB Barcode Scanner Support
     ═══════════════════════════════════════════════════════ */
  let _barcodeBuffer = "";
  let _barcodeTimer = null;
  function bindBarcodeScanner() {
    document.addEventListener("keypress", e => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      _barcodeBuffer += e.key;
      clearTimeout(_barcodeTimer);
      _barcodeTimer = setTimeout(() => {
        if (_barcodeBuffer.length >= 4) {
          const code = _barcodeBuffer.trim();
          const product = state.products.find(p => p.sku && p.sku.toLowerCase() === code.toLowerCase());
          if (product) {
            if (state.view !== "sale") go("sale");
            setTimeout(() => addProductToCart(product.id), 50);
            toastMessage(`تمت إضافة: ${product.name}`);
          } else {
            toastMessage(`لم يُعثر على صنف بالكود: ${code}`);
          }
        }
        _barcodeBuffer = "";
      }, 100);
    });
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 1: Auto-Backup System (Last 7 Snapshots)
     ═══════════════════════════════════════════════════════ */
  const AUTO_BACKUP_KEY = "clothing-pos.auto-backups.v1";
  const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000;
  let _autoBackupTimer = null;

  async function autoBackup() {
    try {
      const backups = (await idbGet(AUTO_BACKUP_KEY)) || [];
      const snapshot = {
        date: new Date().toISOString(),
        data: {
          products: state.products,
          sales: state.sales,
          customers: state.customers,
          settings: state.settings,
          expenses: state.expenses,
          payments: state.payments
        }
      };
      backups.unshift(snapshot);
      if (backups.length > 7) backups.length = 7;
      await idbSet(AUTO_BACKUP_KEY, backups);
    } catch (err) {
      console.warn("Auto-backup failed:", err);
    }
  }

  function scheduleAutoBackup() {
    if (_autoBackupTimer) clearInterval(_autoBackupTimer);
    _autoBackupTimer = setInterval(autoBackup, AUTO_BACKUP_INTERVAL);
    autoBackup();
  }

  async function restoreAutoBackup(index) {
    const backups = (await idbGet(AUTO_BACKUP_KEY)) || [];
    const backup = backups[index];
    if (!backup || !backup.data) { toastMessage("النسخة الاحتياطية غير موجودة"); return; }
    const ok = await confirmDialogPrompt(
      "استعادة نسخة احتياطية",
      `هل تريد استعادة بيانات نسخة ${new Date(backup.date).toLocaleString("ar-EG")}؟\nسيتم استبدال جميع البيانات الحالية.`,
      "نعم، استعادة"
    );
    if (!ok) return;
    state.products = backup.data.products || [];
    state.sales = backup.data.sales || [];
    state.customers = backup.data.customers || [];
    state.settings = { ...state.settings, ...(backup.data.settings || {}) };
    state.expenses = backup.data.expenses || [];
    state.payments = backup.data.payments || [];
    await commitState({});
    render();
    toastMessage("تمت استعادة النسخة الاحتياطية بنجاح");
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 1: Enhanced Notification System
     ═══════════════════════════════════════════════════════ */
  function notifyEnhanced(title, body, type, duration) {
    const toastEl = document.getElementById("appToast");
    if (toastEl) {
      const colors = { success: "#059669", warning: "#d97706", error: "#dc2626", info: "#0f766e" };
      toastEl.style.borderRightColor = colors[type] || colors.info;
      toastEl.innerHTML = `<strong style="color:${colors[type] || colors.info}">${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span>`;
      toastEl.classList.add("show");
      clearTimeout(toastEl._timer);
      toastEl._timer = setTimeout(() => toastEl.classList.remove("show"), duration || 4000);
    }
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "assets/icon-192.png" });
    }
  }

  function checkLowStockAlerts() {
    const lowItems = state.products.filter(p => p.quantity > 0 && p.quantity <= (p.lowStock || 5));
    if (lowItems.length > 0 && state.view === "dashboard") {
      notifyEnhanced("تنبيه مخزون", `${lowItems.length} أصناف على وشك النفاد`, "warning", 5000);
    }
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 2: Lazy Image Loading
     ═══════════════════════════════════════════════════════ */
  function initLazyImages() {
    const imgs = document.querySelectorAll("img[data-src]");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        });
      }, { rootMargin: "200px" });
      imgs.forEach(img => observer.observe(img));
    } else {
      imgs.forEach(img => { img.src = img.dataset.src; img.removeAttribute("data-src"); });
    }
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 2: Memoization Utility
     ═══════════════════════════════════════════════════════ */
  function memoize(fn, keyFn) {
    const cache = new Map();
    const wrapped = function(...args) {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
    wrapped.invalidate = () => cache.clear();
    return wrapped;
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 2: Service Worker Auto-Update
     ═══════════════════════════════════════════════════════ */
  function checkForUpdates() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;
      reg.update().then(() => {
        if (reg.waiting) {
          notifyEnhanced("تحديث متاح", "اضغط لإعادة تحميل التطبيق بأحدث إصدار", "info", 0);
          reg.waiting.addEventListener("statechange", e => {
            if (e.target.state === "activated") location.reload();
          });
          reg.waiting.postMessage("SKIP_WAITING");
        }
      });
    }).catch(() => {});
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 3: Discounts / Coupons System
     ═══════════════════════════════════════════════════════ */
  const COUPONS_KEY = "clothing-pos.coupons.v1";

  function getCoupons() { return state.coupons || []; }

  function validateCoupon(code) {
    const coupons = getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return null;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
    if (coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) return null;
    return coupon;
  }

  function applyCoupon(code, subtotal) {
    const coupon = validateCoupon(code);
    if (!coupon) return { valid: false, discount: 0, message: "كود الخصم غير صالح أو منتهي الصلاحية" };
    let discount = 0;
    if (coupon.type === "percent") discount = Math.round(subtotal * coupon.value / 100 * 100) / 100;
    else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
    return { valid: true, discount, message: `تم تطبيق خصم ${coupon.type === "percent" ? coupon.value + "%" : formatMoney(coupon.value)}`, coupon };
  }

  function renderCouponsSettings() {
    const coupons = getCoupons();
    return `
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h3>أكواد الخصم</h3><p class="muted">إنشاء وأدارة أكواد الخصم التي يمكن استخدامها عند البيع.</p></div>
          <button class="primary" id="addCouponBtn" type="button">إضافة كود</button></div>
        ${coupons.length === 0 ? '<div class="empty">لا توجد أكواد خصم بعد.</div>' : `
        <div style="overflow-x:auto">
          <table class="data-table"><thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الحد الأقصى</th><th>انتهاء الصلاحية</th><th>الإجراءات</th></tr></thead><tbody>
          ${coupons.map((c, i) => `<tr>
            <td><strong>${escapeHtml(c.code)}</strong></td>
            <td>${c.type === "percent" ? "نسبة %" : "مبلغ ثابت"}</td>
            <td>${c.type === "percent" ? c.value + "%" : formatMoney(c.value)}</td>
            <td>${c.maxUses > 0 ? `${c.usedCount || 0}/${c.maxUses}` : "∞"}</td>
            <td>${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("ar-EG") : "∞"}</td>
            <td><button class="ghost danger delete-coupon-btn" data-coupon-idx="${i}" type="button">حذف</button></td>
          </tr>`).join("")}
          </tbody></table></div>`}
      </div>`;
  }

  function saveCouponFromForm() {
    const code = document.getElementById("couponCode")?.value.trim();
    const type = document.getElementById("couponType")?.value;
    const value = Number(document.getElementById("couponValue")?.value || 0);
    const maxUses = Number(document.getElementById("couponMaxUses")?.value || 0);
    const expiresAt = document.getElementById("couponExpires")?.value || "";
    if (!code || value <= 0) { toastMessage("أدخل كوداً وقيمة صالحة"); return; }
    const coupons = getCoupons();
    if (coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) { toastMessage("هذا الكود موجود مسبقاً"); return; }
    coupons.push({ code, type, value, maxUses, expiresAt, usedCount: 0, createdAt: new Date().toISOString() });
    state.coupons = coupons;
    saveSession();
    toastMessage("تم إضافة كود الخصم");
    render();
  }

  function deleteCoupon(idx) {
    const coupons = getCoupons();
    coupons.splice(idx, 1);
    state.coupons = coupons;
    saveSession();
    render();
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 3: Advanced Search (for products)
     ═══════════════════════════════════════════════════════ */
  function parseAdvancedSearch(query) {
    const filters = { text: "", category: null, priceMin: null, priceMax: null, size: null, color: null, stockMax: null };
    let q = query;
    const extract = (pattern, key) => {
      const match = q.match(pattern);
      if (match) { filters[key] = match[1]; q = q.replace(match[0], ""); }
    };
    extract(/فئة[:\s]+(\S+)/i, "category");
    extract(/سعر[<>>=]+(\d+)/i, "priceMin");
    extract(/مقاس[:\s]+(\S+)/i, "size");
    extract(/لون[:\s]+(\S+)/i, "color");
    extract(/مخزون[<>]+(\d+)/i, "stockMax");
    filters.text = q.trim().toLowerCase();
    return filters;
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 3: Excel Export (SheetJS CDN loaded dynamically)
     ═══════════════════════════════════════════════════════ */
  async function ensureSheetJs() {
    if (window.XLSX) return true;
    return new Promise(resolve => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function exportExcel(type) {
    if (!(await ensureSheetJs())) { toastMessage("فشل تحميل مكتبة Excel. تحقق من الاتصال."); return; }
    const wb = XLSX.utils.book_new();
    if (type === "products" || type === "all") {
      const rows = activeProducts().map(p => ({ "الاسم": p.name, "SKU": p.sku, "الفئة": p.category, "المقاس": p.size, "اللون": p.color, "السعر": p.price, "التكلفة": p.cost, "الكمية": p.quantity, "حد التنبيه": p.lowStock }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "الأصناف");
    }
    if (type === "sales" || type === "all") {
      const rows = state.sales.map(s => ({ "رقم الفاتورة": s.number, "التاريخ": new Date(s.date).toLocaleDateString("ar-EG"), "العميل": s.customerName, "طريقة الدفع": s.paymentMethod, "الإجمالي": s.total, "الخصم": s.discount, "الضريبة": s.tax, "عدد الأصناف": s.items.length }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
    }
    if (type === "expenses" || type === "all") {
      const rows = state.expenses.map(e => ({ "الوصف": e.description, "المبلغ": e.amount, "التاريخ": new Date(e.date).toLocaleDateString("ar-EG"), "الفئة": e.category || "" }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, "المصروفات");
    }
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `pos-export-${type}-${dateStr}.xlsx`);
    toastMessage("تم التصدير إلى Excel بنجاح");
  }

  /* ═══════════════════════════════════════════════════════
     Excel Import with Preview
     ═══════════════════════════════════════════════════════ */
  const EXCEL_FIELD_MAP = {
    "اسم الصنف": "name", "الاسم": "name", "name": "name", "اسم المنتج": "name",
    "sku": "sku", "كود": "sku", "الكود": "sku", "barcode": "sku",
    "الفئة": "category", "category": "category", "نوع": "category", "النوع": "category",
    "المقاس": "size", "size": "size", "مقاس": "size",
    "اللون": "color", "color": "color", "لون": "color",
    "الكمية": "quantity", "quantity": "quantity", "كمية": "quantity", "-stock": "quantity", "الstocks": "quantity",
    "السعر": "price", "price": "price", "سعر": "price", "سعر البيع": "price",
    "التكلفة": "cost", "cost": "cost", "تكلفة": "cost", "سعر الشراء": "cost",
    "حد التنبيه": "lowStock", "lowStock": "lowStock", "تنبيه": "lowStock", "最低库存": "lowStock"
  };

  let _importPreviewData = null;
  let _importColumnMap = {};

  function downloadExcelTemplate() {
    if (!window.XLSX) { toastMessage("جاري تحميل مكتبة Excel..."); return; }
    const ws = XLSX.utils.aoa_to_sheet([
      ["اسم الصنف", "SKU", "الفئة", "المقاس", "اللون", "الكمية", "السعر", "التكلفة", "حد التنبيه"],
      ["فستان صيفي", "DR-001", "نسائي", "M", "أحمر", "50", "299", "120", "10"],
      ["قميص رجالي", "SH-002", "رجالي", "L", "أزرق", "30", "199", "80", "5"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نموذج الأصناف");
    XLSX.writeFile(wb, "products-template.xlsx");
    toastMessage("تم تحميل النموذج");
  }

  function parseImportFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
          if (json.length === 0) { reject(new Error("الملف فارغ")); return; }
          resolve(json);
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error("فشل قراءة الملف"));
      reader.readAsArrayBuffer(file);
    });
  }

  function autoMapColumns(headers) {
    const map = {};
    headers.forEach(h => {
      const key = EXCEL_FIELD_MAP[h.toLowerCase().trim()];
      if (key) map[h] = key;
    });
    if (!Object.values(map).includes("name")) {
      const first = headers[0];
      if (first) map[first] = "name";
    }
    return map;
  }

  function renderImportPreview(rows, columnMap) {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const fieldOptions = [
      ["— (تجاهل)", ""],
      ["اسم الصنف *", "name"], ["SKU", "sku"], ["الفئة", "category"],
      ["المقاس", "size"], ["اللون", "color"], ["الكمية", "quantity"],
      ["السعر *", "price"], ["التكلفة", "cost"], ["حد التنبيه", "lowStock"]
    ];
    const mappedRows = rows.slice(0, 5).map(row => {
      const mapped = {};
      headers.forEach(h => {
        const field = columnMap[h] || "";
        if (field) mapped[field] = row[h];
      });
      return mapped;
    });
    return `
      <div style="margin-bottom:10px">
        <strong>تعيين الأعمدة:</strong>
        <small class="muted">— اختر ما يقابل كل عمود من ملف Excel</small>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        ${headers.map(h => `
          <label style="display:inline-flex;align-items:center;gap:4px;font-size:12px;background:var(--surface);padding:4px 8px;border-radius:6px;border:1px solid var(--line)">
            <span style="font-weight:600;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeAttr(h)}">${escapeHtml(h)}</span>
            <select class="import-col-map" data-excel-col="${escapeAttr(h)}" style="font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--line)">
              ${fieldOptions.map(([label, value]) => `<option value="${value}" ${columnMap[h] === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
        `).join("")}
      </div>
      <div style="overflow-x:auto;border:1px solid var(--line);border-radius:8px;margin-bottom:12px">
        <table class="data-table" style="font-size:12px">
          <thead><tr>
            <th>#</th>
            ${fieldOptions.filter(([,v]) => v).map(([,v]) => `<th>${fieldOptions.find(([,f]) => f === v)?.[0] || v}</th>`).join("")}
          </tr></thead>
          <tbody>
            ${mappedRows.map((row, i) => `<tr>
              <td>${i + 1}</td>
              <td>${escapeHtml(row.name || "—")}</td>
              <td>${escapeHtml(row.sku || "—")}</td>
              <td>${escapeHtml(row.category || "—")}</td>
              <td>${escapeHtml(row.size || "—")}</td>
              <td>${escapeHtml(row.color || "—")}</td>
              <td>${row.quantity !== undefined ? row.quantity : "—"}</td>
              <td>${row.price !== undefined ? row.price : "—"}</td>
              <td>${row.cost !== undefined ? row.cost : "—"}</td>
              <td>${row.lowStock !== undefined ? row.lowStock : "—"}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="primary" id="confirmImportBtn" type="button">استيراد ${rows.length} صنف</button>
        <button class="ghost" id="cancelImportBtn" type="button">إلغاء</button>
        <span class="muted" style="font-size:12px">أول 5 أصناف للمعاينة — سيتم استيراد الكل</span>
      </div>
    `;
  }

  async function confirmExcelImport() {
    if (!_importPreviewData || _importPreviewData.length === 0) { toastMessage("لا توجد بيانات للاستيراد"); return; }
    const container = document.getElementById("excelImportPreview");
    const selects = container ? container.querySelectorAll(".import-col-map") : [];
    const colMap = {};
    selects.forEach(sel => { colMap[sel.dataset.excelCol] = sel.value; });
    const mappedName = Object.entries(colMap).filter(([, v]) => v === "name").map(([k]) => k);
    if (mappedName.length === 0) { toastMessage("يجب تعيين عمود واحد على الأقل: اسم الصنف"); return; }
    const mappedPrice = Object.entries(colMap).filter(([, v]) => v === "price").map(([k]) => k);
    if (mappedPrice.length === 0) { toastMessage("يجب تعيين عمود: السعر"); return; }
    const newProducts = [];
    const skipped = [];
    _importPreviewData.forEach((row, idx) => {
      const name = mappedName.length ? String(row[mappedName[0]] || "").trim() : "";
      if (!name) { skipped.push(idx + 1); return; }
      const price = Number(row[mappedPrice[0]] || 0);
      if (price <= 0) { skipped.push(idx + 1); return; }
      const getField = (field, fallback) => {
        const col = Object.entries(colMap).find(([, v]) => v === field);
        return col ? String(row[col[0]] || fallback).trim() : fallback;
      };
      const sku = getField("sku", "").toUpperCase() || `IMP-${Date.now()}-${newProducts.length + 1}`;
      const existingSku = state.products.some(p => p.sku && p.sku.toUpperCase() === sku.toUpperCase());
      const finalSku = existingSku ? `IMP-${Date.now()}-${newProducts.length + 1}` : sku;
      newProducts.push({
        id: cryptoRandomId("p"),
        name,
        sku: finalSku,
        category: getField("category", "غير مصنف"),
        size: getField("size", "M"),
        color: getField("color", ""),
        quantity: Math.max(0, Number(getField("quantity", "0")) || 0),
        price,
        cost: Math.max(0, Number(getField("cost", "0")) || 0),
        lowStock: Math.max(0, Number(getField("lowStock", "5")) || 5),
        image: "assets/product-form-preview.png",
        archived: false,
        updatedAt: new Date().toISOString()
      });
    });
    if (newProducts.length === 0) { toastMessage("لم يتم العثور على أصناف صالحة للاستيراد"); return; }
    const ok = await confirmDialogPrompt(
      "تأكيد استيراد الأصناف",
      `سيتم إضافة ${newProducts.length} صنف جديد${skipped.length ? ` (تم تجاهل ${skipped.length} سطر غير صالح)` : ""}.\n\nهل تريد المتابعة؟`,
      `استيراد ${newProducts.length} صنف`
    );
    if (!ok) return;
    const nextProducts = state.products.concat(newProducts);
    if (!(await commitState({ products: nextProducts }))) { showStorageFullDialog(); return; }
    _importPreviewData = null;
    if (container) container.innerHTML = `<div class="empty" style="color:var(--success);font-weight:700">تم استيراد ${newProducts.length} صنف بنجاح!</div>`;
    auditLog("import", `استيراد ${newProducts.length} صنف من Excel`);
    toastMessage(`تم استيراد ${newProducts.length} صنف بنجاح`);
    setTimeout(() => render(), 1500);
  }

  async function handleExcelImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!(await ensureSheetJs())) { toastMessage("فشل تحميل مكتبة Excel. تحقق من الاتصال."); return; }
    const container = document.getElementById("excelImportPreview");
    if (container) container.innerHTML = `<div class="muted">جاري قراءة الملف...</div>`;
    try {
      const rows = await parseImportFile(file);
      const headers = Object.keys(rows[0]);
      _importColumnMap = autoMapColumns(headers);
      _importPreviewData = rows;
      if (container) container.innerHTML = renderImportPreview(rows, _importColumnMap);
      const confirmBtn = document.getElementById("confirmImportBtn");
      if (confirmBtn) confirmBtn.addEventListener("click", confirmExcelImport);
      const cancelBtn = document.getElementById("cancelImportBtn");
      if (cancelBtn) cancelBtn.addEventListener("click", () => {
        _importPreviewData = null;
        if (container) container.innerHTML = "";
        event.target.value = "";
      });
      document.querySelectorAll(".import-col-map").forEach(sel => {
        sel.addEventListener("change", () => {
          const cols = {};
          document.querySelectorAll(".import-col-map").forEach(s => { cols[s.dataset.excelCol] = s.value; });
          _importColumnMap = cols;
          if (container) container.innerHTML = renderImportPreview(_importPreviewData, _importColumnMap);
          document.querySelectorAll(".import-col-map").forEach(s => {
            s.addEventListener("change", arguments.callee);
          });
        });
      });
      toastMessage(`تم قراءة ${rows.length} سطر من الملف`);
    } catch (err) {
      if (container) container.innerHTML = `<div class="empty" style="color:var(--danger)">خطأ: ${escapeHtml(err.message)}</div>`;
    }
    event.target.value = "";
  }

  /* ═══════════════════════════════════════════════════════
     PHASE 4: Audit Log System
     ═══════════════════════════════════════════════════════ */
  const AUDIT_KEY = "clothing-pos.audit-log.v1";

  function auditLog(action, details) {
    const entry = {
      id: cryptoRandomId("log"),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const logs = state.auditLog || [];
    logs.unshift(entry);
    if (logs.length > 500) logs.length = 500;
    state.auditLog = logs;
  }

  async function getAuditLogs() {
    return state.auditLog || [];
  }

  function renderAuditLog() {
    const logs = (state.auditLog || []).slice(0, 100);
    const actionLabels = { sale: "بيع", return: "مرتجع", delete: "حذف", edit: "تعديل", backup: "نسخة احتياطية", coupon: "كود خصم", login: "دخول" };
    return `
      <div class="panel" style="margin-top:16px">
        <div class="panel-head"><div><h3>سجل التدقيق</h3><p class="muted">آخر ${logs.length} عملية مسجلة.</p></div></div>
        ${logs.length === 0 ? '<div class="empty">لا توجد عمليات مسجلة بعد.</div>' : `
        <div style="overflow-x:auto">
          <table class="data-table"><thead><tr><th>التاريخ</th><th>الإجراء</th><th>التفاصيل</th></tr></thead><tbody>
          ${logs.map(l => `<tr>
            <td style="white-space:nowrap">${new Date(l.timestamp).toLocaleString("ar-EG")}</td>
            <td><span class="status-pill">${actionLabels[l.action] || l.action}</span></td>
            <td>${escapeHtml(typeof l.details === "string" ? l.details : JSON.stringify(l.details))}</td>
          </tr>`).join("")}
          </tbody></table></div>`}
      </div>`;
  }

  init();
})();
