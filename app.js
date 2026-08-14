(() => {
  "use strict";

  const STORAGE = {
    products: "clothing-pos.products.v1",
    sales: "clothing-pos.sales.v1",
    settings: "clothing-pos.settings.v1",
    theme: "clothing-pos.theme.v1",
    session: "clothing-pos.session.v1"
  };
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
    { id: "reports", title: "التقارير", icon: "ت" },
    { id: "settings", title: "الإعدادات", icon: "ع" }
  ];

  const navIcons = {
    dashboard: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    products: `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`,
    sale: `<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>`,
    customers: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    invoices: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
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
      showInvoiceQr: true
    };
  }

  function init() {
    initTheme();
    const storedProducts = readStorage(STORAGE.products, null);
    state.products = storedProducts !== null ? storedProducts : seedProducts();
    state.sales = readStorage(STORAGE.sales, []);
    const storedSettings = readStorage(STORAGE.settings, null);
    state.settings = storedSettings || defaultSettings();
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
    saveAll();
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

  function storagePercent() {
    const total = storageQuotaBytes();
    const used = storageUsedBytes();
    return total > 0 ? Math.round((used / total) * 100) : 0;
  }

  function commitState(next) {
    const candidates = {
      products: next.products !== undefined ? next.products : state.products,
      sales: next.sales !== undefined ? next.sales : state.sales,
      settings: next.settings !== undefined ? next.settings : state.settings
    };
    const serialized = {
      products: JSON.stringify(candidates.products),
      sales: JSON.stringify(candidates.sales),
      settings: JSON.stringify(candidates.settings)
    };
    const payloadChars = serialized.products.length + serialized.sales.length + serialized.settings.length;
    const prevChars = [STORAGE.products, STORAGE.sales, STORAGE.settings].reduce((sum, key) => {
      const value = localStorage.getItem(key);
      return sum + (value ? value.length : 0);
    }, 0);
    const growthBytes = Math.max(0, (payloadChars - prevChars) * 2);
    if (growthBytes > 0) {
      const freeBytes = Math.max(0, storageQuotaBytes() - storageUsedBytes());
      if (growthBytes > freeBytes + 64 * 1024) {
        console.error("Storage preflight: growth too large for free space", { growthBytes, freeBytes });
        return false;
      }
    }
    const entries = [
      [STORAGE.products, serialized.products],
      [STORAGE.sales, serialized.sales],
      [STORAGE.settings, serialized.settings]
    ];
    const prevRaw = entries.map(([key]) => localStorage.getItem(key));
    try {
      for (let i = 0; i < entries.length; i++) {
        localStorage.setItem(entries[i][0], entries[i][1]);
      }
    } catch (error) {
      console.error("Storage save failed:", error);
      for (let i = 0; i < entries.length; i++) {
        try {
          if (prevRaw[i] === null) localStorage.removeItem(entries[i][0]);
          else localStorage.setItem(entries[i][0], prevRaw[i]);
        } catch (innerError) { /* ignore */ }
      }
      return false;
    }
    state.products = candidates.products;
    state.sales = candidates.sales;
    state.settings = candidates.settings;
    return true;
  }

  function saveAll() {
    if (commitState({})) return true;
    if (toast) toastMessage("تعذر حفظ البيانات. قلل حجم الصور أو صدر نسخة احتياطية ثم أعد المحاولة.");
    return false;
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

  function storageMeterHtml() {
    const total = storageQuotaBytes();
    const used = storageUsedBytes();
    const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    const usedMb = (used / (1024 * 1024)).toFixed(1);
    const totalMb = (total / (1024 * 1024)).toFixed(1);
    const danger = percent >= 85;
    const warning = percent >= 70 && percent < 85;
    return `
      <div class="storage-meter ${danger ? "danger" : warning ? "warn" : ""}">
        <div class="storage-meter-head">
          <strong>مساحة التخزين</strong>
          <span>${usedMb} / ${totalMb} م.ب (${percent}%)</span>
        </div>
        <div class="storage-meter-track"><div class="storage-meter-fill" style="width:${percent}%"></div></div>
        ${danger
          ? `<p class="muted" style="color:var(--danger);font-weight:800">⚠️ التخزين يقارب الامتلاء — صدّر نسخة احتياطية واحذف الصور القديمة الآن.</p>`
          : warning
            ? `<p class="muted" style="color:var(--warn)">التخزين يمتلئ تدريجياً. يُنصح بتصدير نسخة احتياطية وتقليل حجم الصور.</p>`
            : `<p class="muted">الأصناف والصور والفواتير تُحفظ في متصفح هذا الجهاز. مساحة متاحة حالياً.</p>`}
      </div>
    `;
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
    state._custView = ["cards", "table", "list"].includes(stored.custView) ? stored.custView : "cards";
    state._custSort = ["total", "count", "items", "last", "name"].includes(stored.custSort) ? stored.custSort : "total";
    state._custQuery = stored.custQuery || "";
    state.search = stored.search || "";
    state.category = stored.category || "الكل";
    state._invoiceFilter = stored.invoiceFilter === "today" ? "today" : "all";
    state._showLowStockOnly = !!stored.showLowStockOnly;
    state._productDisplayLimit = Math.max(PRODUCT_PAGE_SIZE, Number(stored.productDisplayLimit || PRODUCT_PAGE_SIZE));
    state._saleDisplayLimit = Math.max(SALE_PAGE_SIZE, Number(stored.saleDisplayLimit || SALE_PAGE_SIZE));
    state._productView = ["grid", "list", "table"].includes(stored.productView) ? stored.productView : "grid";
    state._saleView = ["list", "grid", "compact"].includes(stored.saleView) ? stored.saleView : "list";
    state._invoiceView = ["list", "cards", "table"].includes(stored.invoiceView) ? stored.invoiceView : "list";
    const sessionView = stored.view && navItems.some(nav => nav.id === stored.view) ? stored.view : "";
    state.view = viewFromHash() || sessionView || "dashboard";
    return state.cart.length > 0;
  }

  function applySettings() {
    document.documentElement.style.setProperty("--accent", state.settings.accent || "#0e5349");
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
    document.getElementById("downloadThermalButton").addEventListener("click", downloadThermalPdf);
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
      reports: renderReports,
      settings: renderSettings
    };
    app.innerHTML = `<section class="view fade-in">${views[state.view]()}</section>`;
    wireViewEvents();
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
    if (view === "table") return `<div class="scrollable-table">${productsTable(products)}</div>`;
    if (view === "list") return `<div class="product-list">${products.map(productListRow).join("")}</div>`;
    return `<div class="product-grid">${products.map(productCard).join("")}</div>`;
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
            <label>اسم العميل <input id="customerName" value="${escapeAttr(state._saleCustomerName)}" placeholder="عميل نقدي"></label>
            <label>هاتف العميل <input id="customerPhone" value="${escapeAttr(state._saleCustomerPhone)}" inputmode="tel" placeholder="اختياري"></label>
            <div class="two">
              <label>خصم <input id="discountAmount" min="0" step="0.01" type="number" value="${state._saleDiscount || 0}"></label>
              <label>مصاريف الشحن <input id="shippingAmount" min="0" step="0.01" type="number" value="${state._saleShipping || 0}"></label>
            </div>
            <label>طريقة الدفع
              <select id="paymentMethod">
                <option${state._salePayment === "نقدا" ? " selected" : ""}>نقدا</option>
                <option${state._salePayment === "بطاقة" ? " selected" : ""}>بطاقة</option>
                <option${state._salePayment === "تحويل" ? " selected" : ""}>تحويل</option>
                <option${state._salePayment === "مختلط" ? " selected" : ""}>مختلط</option>
              </select>
            </label>
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
    if (view === "grid") return `<div class="product-grid sale-grid">${products.map(saleProductCard).join("")}</div>`;
    if (view === "compact") return `<div class="sale-compact">${products.map(saleCompactRow).join("")}</div>`;
    return `<div class="sale-list" style="margin-top:12px">${products.map(saleProductRow).join("")}</div>`;
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
              <button class="view-switch-btn ${state._invoiceView === "table" ? "active" : ""}" data-invoice-view="table" type="button">جدول</button>
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
    if (view === "cards") return `<div class="invoice-cards">${sales.map(invoiceCard).join("")}</div>`;
    if (view === "table") return `<div class="scrollable-table">${invoicesTable(sales)}</div>`;
    return `<div class="invoice-list">${sales.map(invoiceRow).join("")}</div>`;
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

  function invoicesTable(sales) {
    return `<table class="report-table">
      <thead><tr><th>الرقم</th><th>التاريخ</th><th>العميل</th><th>طريقة الدفع</th><th>الحالة</th><th>الإجمالي</th><th>إجراء</th></tr></thead>
      <tbody>${sales.map(sale => {
        const net = netSale(sale);
        const hasReturns = (sale.returns || []).length > 0;
        return `<tr>
          <td>${escapeHtml(sale.number)}</td>
          <td>${dateTime(sale.date)}</td>
          <td>${escapeHtml(sale.customerName || "عميل نقدي")}</td>
          <td>${escapeHtml(sale.paymentMethod || "نقدا")}</td>
          <td>${hasReturns ? '<span class="status-pill low">مرتجع</span>' : '<span class="status-pill ok">مكتملة</span>'}</td>
          <td><strong>${formatMoney(net.total)}</strong></td>
          <td><button class="ghost" data-view-invoice="${sale.id}" type="button">عرض</button></td>
        </tr>`;
      }).join("")}</tbody>
    </table>`;
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
    return Object.values(map);
  }

  function sortCustomers(list) {
    const by = state._custSort || "total";
    const copy = [...list];
    if (by === "name") copy.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    else if (by === "last") copy.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
    else if (by === "count") copy.sort((a, b) => b.count - a.count);
    else if (by === "items") copy.sort((a, b) => b.items - a.items);
    else copy.sort((a, b) => b.total - a.total);
    return copy;
  }

  function customerInitial(name) {
    return escapeHtml(String(name || "؟").trim().charAt(0) || "؟");
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
      customer.phone.toLowerCase().includes(query)
    ));
    const view = state._custView || "cards";
    const openCustomer = state._custOpen ? all.find(customer => customer.name === state._custOpen) : null;
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
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>قاعدة عملاء المتجر</h2>
            <p class="muted">${totalCustomers} عميل · ${totalInvoices} فاتورة · تُبنى البيانات تلقائياً من فواتير البيع.</p>
          </div>
          <div class="inline-actions">
            <button class="primary" data-go="sale" type="button">فاتورة جديدة</button>
          </div>
        </div>
        <div class="customers-toolbar">
          <input class="search" id="customerSearch" value="${escapeAttr(state._custQuery)}" placeholder="ابحث بالاسم أو رقم الهاتف">
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
    if (view === "table") return customersTable(customers);
    if (view === "list") return `
      <div class="compact-list customers-list">
        ${customers.map((customer, index) => customerListRow(customer, index, topTotal)).join("")}
      </div>
    `;
    return `<div class="customer-cards">${customers.map((customer, index) => customerCard(customer, index, topTotal)).join("")}</div>`;
  }

  function customerCard(customer, index, topTotal) {
    const pct = topTotal > 0 ? Math.round((customer.total / topTotal) * 100) : 0;
    return `
      <article class="customer-card" data-cust-open="${escapeAttr(customer.name)}">
        <div class="customer-card-head">
          <span class="customer-avatar">${customerInitial(customer.name)}</span>
          <div class="customer-card-name">
            <strong>${escapeHtml(customer.name)}</strong>
            <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")}</p>
          </div>
          ${index === 0 && customer.total > 0 ? '<span class="crown" title="أعلى عميل إنفاقاً">👑</span>' : ""}
        </div>
        <div class="customer-spend">
          <strong>${formatMoney(customer.total)}</strong>
          <span>إجمالي المشتريات</span>
        </div>
        <div class="spend-track"><div class="spend-fill" style="width:${pct}%"></div></div>
        <div class="customer-metrics">
          <div><strong>${customer.count}</strong><span>فاتورة</span></div>
          <div><strong>${customer.items}</strong><span>قطعة</span></div>
          <div><strong>${formatMoney(customerAvg(customer))}</strong><span>متوسط الفاتورة</span></div>
        </div>
        <p class="muted customer-last">آخر شراء: ${dateTime(customer.lastDate)}</p>
        <div class="customer-card-actions">
          <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
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
              <th><button class="table-sort ${state._custSort === "count" ? "active" : ""}" data-cust-sort="count" type="button">الفواتير ${state._custSort === "count" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "items" ? "active" : ""}" data-cust-sort="items" type="button">القطع ${state._custSort === "items" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "last" ? "active" : ""}" data-cust-sort="last" type="button">آخر شراء ${state._custSort === "last" ? "▼" : ""}</button></th>
              <th><button class="table-sort ${state._custSort === "total" ? "active" : ""}" data-cust-sort="total" type="button">الإجمالي ${state._custSort === "total" ? "▼" : ""}</button></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${customers.map(customer => `
              <tr>
                <td>
                  <div class="cust-cell">
                    <span class="customer-avatar small">${customerInitial(customer.name)}</span>
                    <div class="customer-card-name">
                      <strong>${escapeHtml(customer.name)}</strong>
                      <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")}</p>
                    </div>
                  </div>
                </td>
                <td>${customer.count}</td>
                <td>${customer.items}</td>
                <td>${shortDate(customer.lastDate)}</td>
                <td><strong>${formatMoney(customer.total)}</strong></td>
                <td>
                  <div class="inline-actions">
                    <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
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
          <span class="customer-avatar">${customerInitial(customer.name)}</span>
          <div class="customer-card-name">
            <strong>${escapeHtml(customer.name)} ${index === 0 && customer.total > 0 ? '<span class="crown" title="أعلى عميل إنفاقاً">👑</span>' : ""}</strong>
            <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")} · ${customer.count} فاتورة · ${customer.items} قطعة · آخر شراء ${shortDate(customer.lastDate)}</p>
          </div>
        </div>
        <div class="inline-actions">
          <strong class="customer-list-total">${formatMoney(customer.total)}</strong>
          <span class="status-pill ${index === 0 && topTotal > 0 ? "ok" : ""}" style="${topTotal > 0 ? `width:${Math.max(8, Math.round((customer.total / topTotal) * 100))}%` : ""}"></span>
          <button class="ghost" data-cust-history="${escapeAttr(customer.name)}" type="button">السجل</button>
          <button class="primary" data-cust-sell="${escapeAttr(customer.name)}" type="button">بيع</button>
        </div>
      </article>
    `;
  }

  function customerDetailPanel(customer) {
    const sales = [...customer.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
      <section class="panel customer-detail">
        <div class="panel-head">
          <div class="cust-cell">
            <span class="customer-avatar">${customerInitial(customer.name)}</span>
            <div class="customer-card-name">
              <h2>${escapeHtml(customer.name)}</h2>
              <p class="muted">${escapeHtml(customer.phone || "لا يوجد هاتف")} · ${customer.count} فاتورة · ${customer.items} قطعة · إجمالي ${formatMoney(customer.total)}</p>
            </div>
          </div>
          <div class="inline-actions">
            <button class="primary" data-cust-sell="${escapeAttr(customer.name)}" type="button">فاتورة جديدة</button>
            <button class="ghost" data-cust-close type="button">إغلاق</button>
          </div>
        </div>
        <div class="invoice-list">
          ${sales.map(invoiceRow).join("")}
        </div>
      </section>
    `;
  }

  function renderReports() {
    const stats = getStats();
    const invStats = getInventoryStats();
    return `
      <div class="summary-grid">
        ${metric("إجمالي المبيعات", formatMoney(stats.allSales), "حسب الفلاتر المطبقة في التقرير")}
        ${metric("صافي الربح", formatMoney(stats.allProfit), "الإيراد ناقص التكاليف والخصومات")}
        ${metric("قيمة المخزون (بيع)", formatMoney(invStats.retailValue), `${invStats.totalQty} قطعة في المخزن`)}
        ${metric("هامش الربح", stats.allSales > 0 ? `${Math.round((stats.allProfit / stats.allSales) * 100)}%` : "0%", "نسبة الربح من إجمالي الإيراد")}
      </div>

      <section class="panel report-builder" id="reportBuilderPanel">
        <div class="panel-head">
          <div>
            <h2>منشئ التقرير</h2>
            <p class="muted">اختر نوع التقرير المطلوب، حدد الفلاتر التفصيلية، ثم اضغط استخراج التقرير.</p>
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
                ${["الكل", "نقدا", "بطاقة", "تحويل", "مختلط"].map(method => `<option ${method === state._reportPayment ? "selected" : ""}>${method}</option>`).join("")}
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

      <div class="reports-output" id="reportsContent">
        ${renderReportSection(state.report.type)}
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
      lowstock: reportLowStockSection
    };
    return (builders[type] || reportSummarySection)();
  }

  function reportSummarySection() {
    const stats = getStats();
    const extraStats = getDiscountsAndShippingStats();
    const paymentStats = getPaymentStats();
    const profitMargins = getProfitMargins();
    const categoryTotals = totalsByCategory();
    const topProducts = topProductsByQty();
    const lowItems = activeProducts().filter(p => p.quantity <= p.lowStock);
    return `
      <section class="panel" id="discountSection">
        <div class="panel-head"><h2>ملخص الخصومات والشحن والضرائب</h2></div>
        <div class="stat-cards">
          <div class="stat-card"><span class="stat-label">إجمالي الخصومات الممنوحة</span><span class="stat-value" style="color:var(--danger)">${formatMoney(extraStats.totalDiscount)}</span></div>
          <div class="stat-card gold"><span class="stat-label">إجمالي إيراد الشحن</span><span class="stat-value">${formatMoney(extraStats.totalShipping)}</span></div>
          <div class="stat-card"><span class="stat-label">إجمالي الضريبة (${state.settings.taxRate}%)</span><span class="stat-value">${formatMoney(extraStats.totalTax)}</span></div>
          <div class="stat-card"><span class="stat-label">إجمالي الفواتير</span><span class="stat-value">${extraStats.salesCount} فاتورة</span></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><h2>تحليل الأرباح الهامشية</h2></div>
        <div class="stat-cards">
          <div class="stat-card"><span class="stat-label">إجمالي الإيرادات</span><span class="stat-value">${formatMoney(stats.allSales)}</span></div>
          <div class="stat-card gold"><span class="stat-label">صافي الربح</span><span class="stat-value">${formatMoney(stats.allProfit)}</span></div>
          <div class="stat-card"><span class="stat-label">هامش الربح</span><span class="stat-value">${stats.allSales > 0 ? Math.round((stats.allProfit / stats.allSales) * 100) : 0}%</span></div>
          <div class="stat-card"><span class="stat-label">عدد الفواتير</span><span class="stat-value">${extraStats.salesCount}</span></div>
          <div class="stat-card"><span class="stat-label">متوسط قيمة الفاتورة</span><span class="stat-value">${formatMoney(extraStats.salesCount ? stats.allSales / extraStats.salesCount : 0)}</span></div>
          <div class="stat-card"><span class="stat-label">القطع المباعة</span><span class="stat-value">${stats.soldQty}</span></div>
        </div>
        ${profitMargins.length ? `
        <div class="report-section">
          <div class="report-section-title"><h3>هوامش الربح حسب الفئة</h3></div>
          ${barChart(profitMargins, "green")}
        </div>` : ""}
      </section>

      <section class="panel">
        <div class="panel-head"><h2>مبيعات الفئات</h2></div>
        ${categoryTotals.length ? barChart(categoryTotals, "green") : `<div class="empty">لا توجد مبيعات فئات في هذه الفترة.</div>`}
      </section>

      <section class="panel">
        <div class="panel-head"><h2>الأكثر مبيعاً</h2></div>
        ${topProducts.length ? barChart(topProducts, "rose") : `<div class="empty">لا توجد مبيعات كافية للرسم بعد.</div>`}
      </section>

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

      <section class="panel">
        <div class="panel-head"><h2>أصناف منخفضة المخزون</h2></div>
        ${lowItems.length ? lowStockTableHtml(lowItems) : `<div class="empty">لا توجد تنبيهات مخزون.</div>`}
      </section>
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
      });
    });
    app.querySelectorAll("[data-sale-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._saleView = button.dataset.saleView;
        saveSession();
        render();
      });
    });
    app.querySelectorAll("[data-invoice-view]").forEach(button => {
      button.addEventListener("click", () => {
        state._invoiceView = button.dataset.invoiceView;
        saveSession();
        render();
      });
    });

    const search = document.getElementById("productSearch");
    if (search) search.addEventListener("input", event => {
      state.search = event.target.value;
      state._productDisplayLimit = PRODUCT_PAGE_SIZE;
      state._saleDisplayLimit = SALE_PAGE_SIZE;
      render();
    });
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
          }
        }
        go(view);
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
    const customerNameInput = document.getElementById("customerName");
    if (customerNameInput) customerNameInput.addEventListener("input", () => {
      state._saleCustomerName = customerNameInput.value;
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
        render();
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
        state._custOpen = "";
        saveSession();
        go("sale");
      });
    });

    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) settingsForm.addEventListener("submit", saveSettings);
    app.querySelectorAll("input[name='invoiceTemplate']").forEach(input => {
      input.addEventListener("change", () => {
        const nextSettings = { ...state.settings, invoiceTemplate: input.value };
        if (!commitState({ settings: nextSettings })) {
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
    if (removeLogo) removeLogo.addEventListener("click", () => {
      const nextSettings = { ...state.settings, logo: "" };
      if (!commitState({ settings: nextSettings })) {
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

    // Backup & Factory Reset
    const exportBackupBtn = document.getElementById("exportBackupBtn");
    if (exportBackupBtn) exportBackupBtn.addEventListener("click", exportBackup);
    const importBackupInput = document.getElementById("importBackupInput");
    if (importBackupInput) importBackupInput.addEventListener("change", handleBackupImport);
    const factoryResetBtn = document.getElementById("factoryResetBtn");
    if (factoryResetBtn) factoryResetBtn.addEventListener("click", factoryReset);
    const loadDemoDataBtn = document.getElementById("loadDemoDataBtn");
    if (loadDemoDataBtn) loadDemoDataBtn.addEventListener("click", loadDemoData);
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
    if (!commitState({ products: nextProducts })) {
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
    if (!commitState({ products: nextProducts })) {
      await showStorageFullDialog();
      return;
    }
    state.cart = nextCart;
    if (state._returnSel) delete state._returnSel[id];
    saveSession();
    productDialog.close();
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

  function checkoutCart() {
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
    const sale = {
      id: cryptoRandomId("s"),
      number: `INV-${new Date().getFullYear()}-${String(state.sales.length + 1).padStart(4, "0")}`,
      date: new Date().toISOString(),
      customerName: document.getElementById("customerName")?.value.trim() || "عميل نقدي",
      customerPhone: document.getElementById("customerPhone")?.value.trim() || "",
      paymentMethod: document.getElementById("paymentMethod")?.value || "نقدا",
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
    if (!commitState({ products: nextProducts, sales: nextSales })) {
      showStorageFullDialog();
      return;
    }
    state.cart = [];
    state._saleCustomerName = "";
    state._saleCustomerPhone = "";
    state._saleDiscount = 0;
    state._saleShipping = 0;
    state._saleTaxFree = false;
    state._salePayment = "نقدا";
    saveSession();
    render();
    showInvoice(sale.id);
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
    const logoHtml = state.settings.logo
      ? `<img class="invoice-logo" src="${escapeAttr(state.settings.logo)}" alt="شعار" style="width:${tpl.logoSize || 62}px;height:${tpl.logoSize || 62}px;border-radius:8px;">`
      : `<div class="invoice-mark" style="width:${tpl.logoSize || 62}px;height:${tpl.logoSize || 62}px;font-size:${Math.round((tpl.logoSize || 62) / 2)}px;">${escapeHtml(state.settings.storeName.charAt(0) || "خ")}</div>`;
    const net = netSale(sale);
    const returns = sale.returns || [];
    const companyLines = companyInfoLines();

    const storeFont = tpl.storeFont || "Cairo";
    const storeSize = tpl.storeSize || 23;
    const storeColor = tpl.storeColor || "var(--accent)";
    const subColor = tpl.subColor || "#6b7280";
    const ruleColor = tpl.ruleColor || "#e5e7eb";
    const ruleThickness = tpl.ruleThickness || 1.2;
    const sectionTitleColor = tpl.sectionTitleColor || accent;
    const itemMetaColor = tpl.itemMetaColor || "#9ca3af";
    const footerRuleColor = tpl.footerRule || "#E5E7EB";
    const footerTextColor = tpl.footerTextColor || "#6b7280";
    const thanksColor = tpl.thanksColor || "#9ca3af";
    const headerStyle = tpl.headerStyle || "plain";
    const metaStyle = tpl.metaStyle || "fill";
    const totalsStyle = tpl.totalsStyle || "card";
    const grandStyle = tpl.grandStyle || "accent";
    const tableStripes = tpl.tableStripes !== false;

    let brandBg = "transparent";
    let brandBorder = `${ruleThickness}px solid ${ruleColor}`;
    let brandPadding = "14px";
    let brandRadius = "0";
    let effectiveStoreColor = storeColor;
    let effectiveSubColor = subColor;
    if (headerStyle === "band" || headerStyle === "runway") {
      brandBg = tpl.pdfAccent || accent;
      brandBorder = "none";
      brandPadding = "16px";
      brandRadius = "8px";
      effectiveStoreColor = tpl.storeColor || "#ffffff";
      effectiveSubColor = tpl.subColor || "#dce8e4";
    } else if (headerStyle === "boutique") {
      brandBg = "#fce7f0";
      brandBorder = "none";
      brandPadding = "16px";
      brandRadius = "8px";
    } else if (headerStyle === "atelier") {
      brandBg = "#efe8dc";
      brandBorder = "none";
      brandPadding = "16px";
      brandRadius = "8px";
    } else if (headerStyle === "dark-band") {
      brandBg = "#1f1f1f";
      brandBorder = "none";
      brandPadding = "16px";
      brandRadius = "8px";
      effectiveStoreColor = tpl.storeColor || "#d4b483";
      effectiveSubColor = tpl.subColor || "#c6b491";
    }

    let metaBg = "#fbfaf7";
    let metaBorder = `${ruleThickness}px solid ${ruleColor}`;
    let metaPadding = "0";
    if (metaStyle === "border") {
      metaBg = "#fff";
      metaBorder = "1px solid #e5e7eb";
      metaPadding = "10px";
    } else if (metaStyle === "rose") {
      metaBg = "#fce7f0";
      metaBorder = "none";
      metaPadding = "10px";
    } else if (metaStyle === "sand") {
      metaBg = "#f5f0e8";
      metaBorder = "none";
      metaPadding = "10px";
    } else if (metaStyle === "mint") {
      metaBg = "#ecfdf9";
      metaBorder = "none";
      metaPadding = "10px";
    } else if (metaStyle === "gold") {
      metaBg = "#f5f0e8";
      metaBorder = `1px solid ${tpl.gold || "#b08d57"}`;
      metaPadding = "10px";
    } else if (metaStyle === "plain") {
      metaBg = "transparent";
      metaBorder = "none";
      metaPadding = "0";
    }

    let totalsBg = "#fff";
    let totalsBorder = "1px solid " + ruleColor;
    let totalsPadding = "12px";
    let totalsRadius = "8px";
    if (totalsStyle === "plain" || totalsStyle === "plain-gold") {
      totalsBg = "transparent";
      totalsBorder = "none";
      totalsPadding = "0";
      totalsRadius = "0";
    }

    let grandBg = "transparent";
    let grandColor = "var(--accent)";
    let grandPadding = "0";
    let grandRadius = "0";
    const grandFill = (bg) => {
      grandBg = bg;
      grandColor = bg && !isDarkHex(bg) ? "#111827" : (tpl.grandText || "#ffffff");
      grandPadding = "10px 14px";
      grandRadius = "6px";
    };
    if (grandStyle === "accent") {
      grandFill(tpl.totalRowColor || accent);
    } else if (grandStyle === "rose") {
      grandFill("#7f1d4e");
    } else if (grandStyle === "sand") {
      grandFill("#4b4238");
    } else if (grandStyle === "mint") {
      grandFill("#164e49");
    } else if (grandStyle === "gold") {
      grandFill(tpl.gold || tpl.totalRowColor || "#55504a");
    }

    return `
      <article class="invoice-paper" data-template="${state.settings.invoiceTemplate}">
        <header class="invoice-brand" style="background:${brandBg};border:${brandBorder};padding:${brandPadding};border-radius:${brandRadius};">
          <div>
            <h2 style="font-family:${storeFont};font-size:${storeSize}px;color:${effectiveStoreColor};">${escapeHtml(state.settings.storeName)}</h2>
            <p style="color:${effectiveSubColor};">متجر ملابس وأزياء</p>
          </div>
          ${logoHtml}
        </header>
        <div class="invoice-dochead" style="background:${metaBg};border:${metaBorder};">
          <h3 style="color:${sectionTitleColor};">فاتورة مبيعات</h3>
          <strong>${escapeHtml(sale.number)}</strong>
          <small>${dateTime(sale.date)}</small>
        </div>
        <section class="invoice-meta" style="background:${metaBg};border:${metaBorder};padding:${metaPadding};border-radius:${metaStyle === 'border' || metaStyle === 'rose' || metaStyle === 'sand' || metaStyle === 'mint' ? '8px' : '0'};">
          <p><strong>التاريخ:</strong> ${dateTime(sale.date)}</p>
          <p><strong>الدفع:</strong> ${escapeHtml(sale.paymentMethod)}</p>
          <p><strong>العميل:</strong> ${escapeHtml(sale.customerName)}</p>
          <p><strong>الهاتف:</strong> ${escapeHtml(sale.customerPhone || "-")}</p>
          <p><strong>عدد القطع:</strong> ${net.qty}</p>
        </section>
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
              const rowBg = (tableStripes && index % 2 === 1) ? `background:#f9fafb;` : "";
              return `
              <tr style="${rowBg}">
                <td>${index + 1}</td>
                <td class="invoice-thumb">${image ? `<img src="${escapeAttr(image)}" alt="${escapeHtml(item.name)}">` : ""}</td>
                <td>${escapeHtml(item.name)}<br><small style="color:${itemMetaColor};">${escapeHtml(metaLine)}</small></td>
                <td>${item.qty}</td>
                <td>${formatMoney(item.price)}</td>
                <td>${formatMoney(item.total)}</td>
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
        <section class="cart-totals" style="background:${totalsBg};border:${totalsBorder};padding:${totalsPadding};border-radius:${totalsRadius};${totalsStyle === 'card' || totalsStyle === 'rose-card' || totalsStyle === 'sand-card' || totalsStyle === 'mint-card' ? 'box-shadow:0 1px 3px rgba(0,0,0,0.05);' : ''}">
          <div class="total-row"><span>المجموع الفرعي</span><strong>${formatMoney(sale.subtotal)}</strong></div>
          <div class="total-row"><span>الخصم</span><strong>${formatMoney(sale.discount)}</strong></div>
          ${sale.taxFree
            ? ""
            : `<div class="total-row"><span>ضريبة ${sale.taxRate}%</span><strong>${formatMoney(sale.tax)}</strong></div>`}
          ${sale.shipping ? `<div class="total-row"><span>مصاريف الشحن</span><strong>${formatMoney(sale.shipping)}</strong></div>` : ""}
          ${net.returnAmount > 0 ? `<div class="total-row return"><span>المجموع المرتجع</span><strong>− ${formatMoney(net.returnAmount)}</strong></div>` : ""}
          <div class="total-row grand" style="background:${grandBg};color:${grandColor};padding:${grandPadding};border-radius:${grandRadius};${grandStyle === 'text' ? 'border-top:2px solid ' + ruleColor + ';' : 'border:none;'}"><span>الإجمالي النهائي</span><strong>${formatMoney(net.total)}</strong></div>
          <div class="total-row words" style="border-top:1px dashed ${ruleColor};"><span>المبلغ بالحروف</span><strong>${escapeHtml(amountInWords(net.total))}</strong></div>
        </section>
        <section class="code-strip" style="border-top:${ruleThickness}px solid ${footerRuleColor};color:${footerTextColor};">
          ${state.settings.showInvoiceQr !== false ? `<div class="qr">${qrCells(sale.number)}</div>` : ""}
          <div class="barcode">${barcodeLines(sale.number)}</div>
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

  async function downloadThermalPdf() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    await exportPdfWithPdfMake({
      filename: `${sale.number}-thermal`,
      build: logo => buildThermalInvoiceDoc(sale, logo)
    });
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
    if (!commitState({ products: nextProducts, sales: nextSales })) {
      await showStorageFullDialog();
      return;
    }
    state._returnSel = {};
    returnDialog.close();
    render();
    const updatedSale = state.sales.find(saleItem => saleItem.id === sale.id);
    invoicePrintArea.innerHTML = invoiceHtml(updatedSale || sale);
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
    if (!commitState({ products: nextProducts, sales: nextSales })) {
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
    ctx.fillStyle = "#94a3b8";
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
      subColor: "#6b7280",
      ruleColor: null,
      ruleThickness: 2.4,
      metaStyle: "fill",
      metaFill: "light",
      metaTitleColor: null,
      metaLabelColor: "#6b7280",
      metaValueColor: "#111827",
      sectionTitleFont: "Cairo",
      sectionTitleSize: 11.5,
      sectionTitleColor: null,
      headerBar: { fill: null, text: "#ffffff", font: "Cairo", size: 9, padding: 6 },
      tableStripes: true,
      itemNameFont: "Cairo",
      itemNameSize: 9.5,
      itemMetaColor: "#9ca3af",
      totalsStyle: "card",
      totalsWidth: 240,
      totalRowColor: "#374151",
      grandStyle: "accent",
      grandText: "#ffffff",
      footerRule: "#E5E7EB",
      footerTextColor: "#6b7280",
      thanksColor: "#9ca3af"
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
      metaLabelColor: "#6b7280",
      metaValueColor: "#111827",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: null,
      headerBar: { fill: null, text: "#ffffff", font: "CairoSemiBold", size: 9.5, padding: 7 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 10,
      itemMetaColor: "#9ca3af",
      totalsStyle: "card",
      totalsWidth: "full",
      totalRowColor: "#374151",
      grandStyle: "accent",
      grandText: "#ffffff",
      footerRule: "#E5E7EB",
      footerTextColor: "#6b7280",
      thanksColor: "#9ca3af"
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
      metaLabelColor: "#9d5a78",
      metaValueColor: "#331424",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#7f1d4e",
      headerBar: { fill: "#fce7f0", text: "#7f1d4e", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 9.8,
      itemMetaColor: "#b87994",
      totalsStyle: "rose-card",
      totalsWidth: 250,
      totalRowColor: "#5b2740",
      grandStyle: "rose",
      grandText: "#ffffff",
      footerRule: "#f4bfd4",
      footerTextColor: "#8b4664",
      thanksColor: "#b87994",
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
      metaLabelColor: "#8b8174",
      metaValueColor: "#2d2a26",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#2d2a26",
      headerBar: { fill: "#efe8dc", text: "#5d4a2f", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: false,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 9.8,
      itemMetaColor: "#9b9185",
      totalsStyle: "sand-card",
      totalsWidth: 250,
      totalRowColor: "#4b4238",
      grandStyle: "sand",
      grandText: "#ffffff",
      footerRule: "#ded2bd",
      footerTextColor: "#7c7469",
      thanksColor: "#a28b63",
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
      metaLabelColor: "#41817a",
      metaValueColor: "#102b28",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#0f766e",
      headerBar: { fill: "#ccfbf1", text: "#0f766e", font: "CairoSemiBold", size: 9.2, padding: 6 },
      tableStripes: true,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 10,
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
      subColor: "#9ca3af",
      ruleColor: "#e5e7eb",
      ruleThickness: 1,
      metaStyle: "plain",
      metaFill: "none",
      metaTitleColor: "#1f2937",
      metaLabelColor: "#9ca3af",
      metaValueColor: "#111827",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: "#1f2937",
      headerBar: { fill: null, text: null, font: "CairoSemiBold", size: 8.5, padding: 5 },
      tableStripes: false,
      itemNameFont: "Cairo",
      itemNameSize: 10,
      itemMetaColor: "#9ca3af",
      totalsStyle: "plain",
      totalsWidth: 240,
      totalRowColor: "#6b7280",
      grandStyle: "text",
      grandText: null,
      footerRule: "#eeeeee",
      footerTextColor: "#9ca3af",
      thanksColor: "#b6bcc2"
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
      metaLabelColor: "#8a857b",
      metaValueColor: "#22211d",
      sectionTitleFont: "CairoSemiBold",
      sectionTitleSize: 12,
      sectionTitleColor: null,
      headerBar: { fill: "#efe5cf", text: "#8a6d3b", font: "CairoSemiBold", size: 9, padding: 6 },
      tableStripes: false,
      itemNameFont: "CairoSemiBold",
      itemNameSize: 9.5,
      itemMetaColor: "#9ca3af",
      totalsStyle: "plain-gold",
      totalsWidth: 240,
      totalRowColor: "#55504a",
      grandStyle: "gold",
      grandText: "#ffffff",
      footerRule: "#e4d8bd",
      footerTextColor: "#8a857b",
      thanksColor: "#b08d57"
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

    const brandStack = [];
    const storeColor = headerOnDark
      ? (tpl.storeColor && !isDarkHex(tpl.storeColor) ? tpl.storeColor : "#ffffff")
      : pdfColor(tpl.storeColor, accent);
    const subColor = headerOnDark ? "#d7e0de" : pdfColor(tpl.subColor, "#64748B");
    const docTitleColor = headerOnDark ? "#ffffff" : pdfColor(tpl.sectionTitleColor, accent);
    const docNumberColor = headerOnDark ? "#ffffff" : "#1F2937";
    const docMetaColor = headerOnDark ? "#d7e0de" : "#64748B";
    if (logo) brandStack.push({ image: logo, width: compact ? 38 : Math.min(tpl.logoSize || 54, 44), alignment: "center", margin: [0, 0, 0, compact ? 1 : 3] });
    brandStack.push({ text: state.settings.storeName, fontSize: compact ? 13 : Math.min(tpl.storeSize || 18, 20), bold: true, font: tpl.storeFont || "CairoSemiBold", color: storeColor, alignment: "center" });
    brandStack.push({ text: "متجر ملابس وأزياء", fontSize: 8.5, color: subColor, alignment: "center", margin: [0, compact ? 1 : 2, 0, 0] });

    const docTitleStack = [
      { text: "فاتورة مبيعات", fontSize: compact ? 13 : (tpl.sectionTitleSize || 19), bold: true, font: tpl.sectionTitleFont || "CairoSemiBold", color: docTitleColor, alignment: "left" },
      { text: sale.number, fontSize: compact ? 9.5 : 11, bold: true, color: docNumberColor, alignment: "left", margin: [0, compact ? 1 : 2, 0, 0] },
      { text: dateTime(sale.date), fontSize: 8, color: docMetaColor, alignment: "left", margin: [0, compact ? 1 : 1.5, 0, 0] },
      ...(sale.paymentMethod ? [{ text: `طريقة الدفع: ${sale.paymentMethod}`, fontSize: 8, color: docMetaColor, alignment: "left", margin: [0, compact ? 1 : 1.5, 0, 0] }] : [])
    ];

    const header = {
      layout: {
        defaultBorder: false,
        paddingLeft: () => 12,
        paddingRight: () => 12,
        paddingTop: () => (compact ? 5 : 7),
        paddingBottom: () => (compact ? 5 : 7)
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ columns: [docTitleStack, brandStack], columnGap: 8, fillColor: headerFill }]] },
      margin: [0, 0, 0, compact ? 4 : 6]
    };
    const headerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: tpl.ruleThickness || 1.2, lineColor: pdfColor(tpl.ruleColor, accent) }], margin: [0, 0, 0, compact ? 3 : 5] };

    const metaTitleColor = pdfColor(tpl.metaTitleColor, accent);
    const metaLabelColor = pdfColor(tpl.metaLabelColor, "#64748B");
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

    const infoSection = {
      columns: [
        { width: "*", ...pdfSoftCard([
          { text: "بيانات الفاتورة", fontSize: compact ? 8.5 : 10, bold: true, font: "CairoSemiBold", color: metaTitleColor, margin: [0, 0, 0, compact ? 2 : 4] },
          ...[
            ["التاريخ", dateTime(sale.date)],
            ["طريقة الدفع", sale.paymentMethod || "نقدا"],
            ["عدد القطع", `${pieceCount} قطعة`]
          ].map(row => pdfInfoRow(row[0], row[1], compact, metaTitleColor, metaLabelColor, metaValueColor))
        ], compact, metaCardFill, metaBorderColor, compact ? 8 : 10) },
        { width: "*", ...pdfSoftCard([
          { text: "بيانات العميل", fontSize: compact ? 8.5 : 10, bold: true, font: "CairoSemiBold", color: metaTitleColor, margin: [0, 0, 0, compact ? 2 : 4] },
          ...[
            ["الاسم", sale.customerName || "عميل نقدي"],
            ["الهاتف", sale.customerPhone || "—"]
          ].map(row => pdfInfoRow(row[0], row[1], compact, metaTitleColor, metaLabelColor, metaValueColor))
        ], compact, metaCardFill, metaBorderColor, compact ? 8 : 10) }
      ],
      columnGap: 8,
      margin: [0, compact ? 2 : 4, 0, compact ? 2 : 5]
    };

    const itemsHeaderColor = pdfColor(tpl.sectionTitleColor, accent);
    const itemThumbs = await Promise.all(sale.items.map(item => {
      return resolveThumbForPdf(saleItemImage(item), compact ? 20 : 24, item.name);
    }));
    const thumbSize = compact ? 20 : 24;
    const itemsBody = [
      pdfItemsHeader(["الإجمالي", "السعر", "الكمية", "الصنف", "صورة", "#"], itemsHeaderColor, compact),
      ...sale.items.map((item, index) => {
        const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
        return [
          { text: pdfMoneyParts(item.total, { bold: true, size: compact ? 7.5 : 8.5 }), alignment: "left", margin: [2, 2, 2, 2] },
          { text: pdfMoneyParts(item.price, { bold: false, size: compact ? 7.5 : 8.5 }), alignment: "left", margin: [2, 2, 2, 2] },
          { text: `${item.qty}`, alignment: "center", bold: true, fontSize: compact ? 8 : 9, margin: [2, 2, 2, 2] },
          {
            stack: [
              { text: item.name, bold: true, fontSize: compact ? 8.5 : (tpl.itemNameSize || 9.5), font: tpl.itemNameFont || "Cairo", color: "#1F2937", lineHeight: 0.8 },
              { text: metaLine, fontSize: compact ? 6.5 : 7, color: pdfColor(tpl.itemMetaColor, "#94A3B8"), margin: compact ? [0, 1, 0, 0] : [0, 1.5, 0, 0] }
            ],
            alignment: "right",
            margin: [2, 2, 2, 2]
          },
          { image: itemThumbs[index], width: thumbSize, height: thumbSize, alignment: "center", margin: [2, 2, 2, 2] },
          { text: String(index + 1), alignment: "center", bold: true, color: "#64748B", fontSize: compact ? 8 : 9, margin: [2, 2, 2, 2] }
        ];
      })
    ];

    const stripeLineColor = pdfColor(tpl.ruleColor, "#E5E7EB");
    const itemsTable = pdfTable(itemsBody, [68, 56, 46, "*", 36, 22], {
      layout: pdfItemsLayout(pdfAccent, compact, tableStripes, stripeLineColor),
      headerRows: 1
    });

    const totalRows = [
      ["المجموع الفرعي", sale.subtotal],
      ["الخصم", sale.discount],
      ...(sale.taxFree ? [] : [["الضريبة", sale.tax]]),
      ...(sale.shipping ? [["مصاريف الشحن", sale.shipping]] : [])
    ];
    const returnRow = net.returnAmount > 0
      ? { columns: [
          { text: `- ${moneyFormatter.format(Number(net.returnAmount || 0))} ${state.settings.currency || ""}`, color: "#B91C1C", bold: true, fontSize: compact ? 8 : 8.5, alignment: "left", width: "auto" },
          { text: "المجموع المرتجع", color: "#B91C1C", bold: true, fontSize: compact ? 8 : 8.5, alignment: "right", width: "*" }
        ], margin: [0, 2.5, 0, 2.5] }
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
        { text: moneyString(net.total, { size: compact ? 9.5 : 10.5, color: grandText, currencyColor: isDarkHex(grandBg) ? shadeHex(grandText, 0.55) : shadeHex(grandText, 0.35), bold: true }), alignment: "left", width: "auto", margin: [6, 0, 6, 0] },
        { text: "الإجمالي النهائي", bold: true, color: grandText, font: "CairoSemiBold", fontSize: compact ? 9.5 : 10.5, alignment: "right", width: "*", margin: [6, 0, 6, 0] }
      ],
      margin: [0, compact ? 3 : 4, 0, 0]
    };

    const grandBarNode = grandBg ? {
      table: {
        headerRows: 0,
        widths: ["*"],
        body: [[{
          columns: [
            { text: moneyString(net.total, { size: compact ? 9.5 : 10.5, color: grandText, currencyColor: isDarkHex(grandBg) ? shadeHex(grandText, 0.55) : shadeHex(grandText, 0.35), bold: true }), alignment: "left", width: "auto", margin: [8, 0, 8, 0] },
            { text: "الإجمالي النهائي", bold: true, color: grandText, font: "CairoSemiBold", fontSize: compact ? 9.5 : 10.5, alignment: "right", width: "*", margin: [8, 0, 8, 0] }
          ],
          fillColor: grandBg
        }]]
      },
      layout: {
        defaultBorder: false,
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => (compact ? 4 : 5),
        paddingBottom: () => (compact ? 4 : 5)
      },
      margin: [0, compact ? 3 : 4, 0, 0]
    } : null;

    const totalsStack = [
      ...totalRows.map(row => ({
        columns: [
          { text: moneyString(row[1], { size: compact ? 8 : 9, color: row[0] === "الخصم" && row[1] > 0 ? "#B91C1C" : "#111827" }), alignment: "left", width: "auto", margin: [6, 0, 6, 0] },
          { text: row[0], color: "#4b5563", fontSize: compact ? 8 : 8.5, alignment: "right", width: "*", margin: [6, 0, 6, 0] }
        ],
        margin: [0, compact ? 1.5 : 2, 0, compact ? 1.5 : 2]
      })),
      ...(returnRow ? [returnRow] : []),
      ...(grandBg ? [] : [grandRowInCard]),
      {
        columns: [
          { text: amountInWords(net.total), bold: true, color: "#1F2937", fontSize: compact ? 7.5 : 8, alignment: "left", width: "*", lineHeight: 0.8 },
          { text: "المبلغ بالحروف", color: "#4b5563", fontSize: compact ? 7 : 7.5, alignment: "right", width: "auto" }
        ],
        margin: [6, compact ? 3 : 4, 6, 0]
      }
    ];

    const totalsNode = {
      unbreakable: true,
      columns: [
        ...(qr ? [{
          width: compact ? 72 : 88,
          stack: [
            { image: qr, width: compact ? 58 : 72, height: compact ? 58 : 72, alignment: "center" },
            { text: "امسح للتحقق", fontSize: 7, color: "#64748B", alignment: "center", margin: [0, 3, 0, 0] }
          ],
          alignment: "center"
        }] : []),
        {
          width: "*",
          stack: [
            pdfSoftCard(totalsStack, compact, totalsCardFill, totalsCardBorder, compact ? 8 : 10),
            ...(grandBarNode ? [grandBarNode] : [])
          ]
        }
      ],
      columnGap: 10,
      margin: [0, compact ? 4 : 6, 0, 0]
    };

    const retHeaderFill = tpl.pdfLight || "#FEE2E2";
    const pdfReturnsBlock = () => {
      const rows = [];
      returns.forEach(ret => {
        const reason = (ret.reason || "").trim();
        rows.push([
          { text: `مرتجع — ${dateTime(ret.date)}${reason ? `  |  السبب: ${reason}` : ""}`, fontSize: 8, bold: true, color: "#B91C1C", colSpan: 4, fillColor: retHeaderFill, margin: [6, 2, 6, 2] }
        ]);
        ret.items.forEach(item => {
          rows.push([
            { text: pdfMoneyParts(item.total, { color: "#B91C1C", bold: true }), alignment: "center", margin: [2, 1, 2, 1] },
            { text: pdfMoneyParts(item.price), alignment: "center", margin: [2, 1, 2, 1] },
            { text: `${item.qty}`, alignment: "center", fontSize: 8, bold: true, margin: [2, 1, 2, 1] },
            { text: item.name, fontSize: 8, color: "#374151", alignment: "right", margin: [2, 1, 2, 1] }
          ]);
        });
      });
      const retHeader = (label) => ({ text: label, bold: true, color: "#B91C1C", fillColor: retHeaderFill, alignment: "center", fontSize: 8, margin: [4, 3, 4, 3] });
      const retLayout = {
        ...pdfTableLayoutPlain(stripeLineColor),
        paddingTop: () => 1,
        paddingBottom: () => 1,
        hLineWidth: () => 0.3
      };
      return {
        unbreakable: true,
        stack: [
          { text: "المرتجعات", fontSize: compact ? 8.5 : 10, bold: true, font: "CairoSemiBold", color: "#B91C1C", margin: compact ? [0, 1, 0, 1] : [0, 3, 0, 3] },
          pdfTable([
            [retHeader("الإجمالي"), retHeader("السعر"), retHeader("الكمية"), retHeader("الصنف")],
            ...rows
          ], [66, 58, 30, "*"], { layout: retLayout, headerRows: 1, margin: [0, 0, 0, 2] })
        ]
      };
    };

    const sectionTitleColor = pdfColor(tpl.sectionTitleColor, accent);
    const sectionTitle = (text) => ({
      text,
      fontSize: compact ? 9 : (tpl.sectionTitleSize || 11),
      bold: true,
      font: tpl.sectionTitleFont || "CairoSemiBold",
      color: sectionTitleColor,
      margin: [0, compact ? 2 : 3, 0, compact ? 2 : 3]
    });

    return {
      rtl: true,
      pageSize: "A4",
      pageMargins: compact ? [10, 14, 10, 46] : [14, 16, 14, 52],
      defaultStyle: { font: "Cairo", fontSize: 9.5, lineHeight: 0.72 },
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
          margin: [16, 10, 16, 0],
          columns: [
            { text: `${sale.number} — فاتورة مبيعات`, color: "#64748B", fontSize: 8.5, alignment: "left", width: "auto" },
            { text: state.settings.storeName, bold: true, color: accent, fontSize: 9, alignment: "right", width: "*" }
          ]
        };
      },
      footer: (currentPage, pageCount) => ({
        stack: [
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: tpl.footerRule || "#E5E7EB" }] },
          ...(companyLines.length ? [{ text: companyLines.join("   |   "), alignment: "center", fontSize: 7.5, color: pdfColor(tpl.footerTextColor, "#64748B"), margin: [0, 4, 0, 0] }] : []),
          ...(state.settings.invoiceFooter ? [{ text: state.settings.invoiceFooter, alignment: "center", fontSize: 7.5, color: pdfColor(tpl.thanksColor, "#94A3B8"), margin: [0, 2, 0, 0] }] : []),
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: "center", fontSize: 7.5, color: pdfColor(tpl.footerTextColor, "#94A3B8"), margin: [0, 2, 0, 0] }
        ],
        margin: [compact ? 12 : 16, 6, compact ? 12 : 16, 0]
      }),
      info: {
        title: `${sale.number} - ${state.settings.storeName}`,
        author: state.settings.storeName
      }
    };
  }

  async function buildThermalInvoiceDoc(sale, logo) {
    const accent = docAccent();
    const net = netSale(sale);
    const returns = sale.returns || [];
    const W = 227;
    const M = 10;
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
        qr = await qrDataUrl(invoiceQrText(sale), 180);
      } catch (err) {
        console.warn("QR skipped:", err);
      }
    }

    const rule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: W - M * 2, y2: 0, lineWidth: 0.7, lineColor: "#CBD5E1" }], margin: [0, 4, 0, 4] };
    const dotted = { canvas: [{ type: "line", x1: 0, y1: 0, x2: W - M * 2, y2: 0, lineWidth: 0.5, lineColor: "#CBD5E1", dash: { length: 2 } }], margin: [0, 3, 0, 3] };

    const metaRow = (label, value) => ({
      columns: [
        { text: String(value), bold: true, font: "CairoSemiBold", fontSize: 9, color: "#1F2937", alignment: "left", width: "auto" },
        { text: label, color: "#64748B", fontSize: 8.5, alignment: "right", width: "*" }
      ],
      margin: [0, 1.5, 0, 1.5]
    });

    const itemRows = [
      [
        { text: "الإجمالي", bold: true, color: accent, fontSize: 8, alignment: "left" },
        { text: "السعر", bold: true, color: accent, fontSize: 8, alignment: "center" },
        { text: "كمية", bold: true, color: accent, fontSize: 8, alignment: "center" },
        { text: "الصنف", bold: true, color: accent, fontSize: 8, alignment: "right" },
        { text: "#", bold: true, color: accent, fontSize: 8, alignment: "center" }
      ],
      ...sale.items.map((item, index) => {
        const metaLine = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
        return [
          { ...moneyText(item.total, { size: 8, bold: true }), alignment: "left" },
          { text: moneyText(item.price, { size: 8 }).text, fontSize: 8, alignment: "center" },
          { text: String(item.qty), fontSize: 8.5, alignment: "center" },
          {
            stack: [
              { text: item.name, fontSize: 8.5, bold: true, color: "#1F2937" },
              ...(metaLine ? [{ text: metaLine, fontSize: 6.5, color: "#94A3B8", margin: [0, 1, 0, 0] }] : [])
            ],
            alignment: "right"
          },
          { text: String(index + 1), color: "#64748B", fontSize: 8, alignment: "center" }
        ];
      })
    ];

    const itemsTable = {
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2.5,
        paddingBottom: () => 2.5
      },
      table: { headerRows: 1, widths: [50, 42, 28, "*", 14], body: itemRows },
      margin: [0, 2, 0, 0]
    };

    const totalsBody = [
      ...[
        ["المجموع الفرعي", sale.subtotal, {}],
        ["الخصم", sale.discount, {}],
        ...(sale.taxFree ? [] : [["الضريبة", sale.tax, {}]]),
        ...(sale.shipping ? [["مصاريف الشحن", sale.shipping, {}]] : [])
      ].map(([label, value]) => ({
        columns: [
          { ...moneyText(value, { size: 8.5 }), alignment: "left", width: "auto" },
          { text: label, color: "#475569", fontSize: 8.5, alignment: "right", width: "*" }
        ],
        margin: [0, 1.5, 0, 1.5]
      })),
      ...(net.returnAmount > 0 ? [{
        columns: [
          { ...moneyText(-net.returnAmount, { size: 8.5, bold: true, color: "#B91C1C" }), alignment: "left", width: "auto" },
          { text: "المجموع المرتجع", color: "#B91C1C", bold: true, fontSize: 8.5, alignment: "right", width: "*" }
        ],
        margin: [0, 1.5, 0, 1.5]
      }] : []),
      rule,
      {
        columns: [
          { ...moneyText(net.total, { size: 11, bold: true, color: accent }), alignment: "left", width: "auto" },
          { text: "الإجمالي النهائي", bold: true, font: "CairoSemiBold", fontSize: 11, color: accent, alignment: "right", width: "*" }
        ]
      },
      {
        columns: [
          { text: amountInWords(net.total), fontSize: 8, color: "#1F2937", alignment: "left", width: "*", lineHeight: 0.8 },
          { text: "المبلغ بالحروف", color: "#64748B", fontSize: 8, alignment: "right", width: "auto" }
        ],
        margin: [0, 4, 0, 0]
      }
    ];

    const returnsBlock = returns.length ? [
      dotted,
      { text: "المرتجعات", bold: true, font: "CairoSemiBold", color: "#B91C1C", fontSize: 8.5, margin: [0, 0, 0, 2] },
      ...returns.flatMap(ret => [
        {
          columns: [
            { text: `− ${moneyFormatter.format(Number(ret.total || 0))} ${state.settings.currency}`, bold: true, color: "#B91C1C", fontSize: 7.5, width: "auto", alignment: "left" },
            { text: `${dateTime(ret.date)}${ret.reason ? ` — ${ret.reason}` : ""}`, color: "#B91C1C", fontSize: 7.5, alignment: "right", width: "*" }
          ],
          margin: [0, 1, 0, 1]
        },
        ...ret.items.map(item => ({
          text: `× ${item.qty} ${item.name} — ${moneyFormatter.format(Number(item.total || 0))} ${state.settings.currency}`,
          fontSize: 7,
          color: "#B91C1C",
          margin: [4, 0.5, 0, 0.5]
        }))
      ])
    ] : [];

    const qrBlock = qr ? [
      dotted,
      { image: qr, width: 92, alignment: "center", margin: [0, 2, 0, 2] },
      { text: "امسح للتحقق من الفاتورة", fontSize: 6.5, color: "#94A3B8", alignment: "center", margin: [0, 0, 0, 2] }
    ] : [];

    const footerBlock = [
      rule,
      ...(companyLines.length ? [{ text: companyLines.join("   |   "), fontSize: 6.5, color: "#64748B", alignment: "center", lineHeight: 1.4, margin: [0, 2, 0, 1] }] : []),
      ...(state.settings.invoiceFooter ? [{ text: state.settings.invoiceFooter, fontSize: 6.5, color: "#94A3B8", alignment: "center", lineHeight: 1.4, margin: [0, 1, 0, 1] }] : [])
    ];

    const returnExtraRows = returns.reduce((sum, ret) => sum + 1 + ret.items.length, 0);
    const estimatedHeight = Math.round(
      510 +
      sale.items.length * 18 +
      returnExtraRows * 12 +
      (qr ? 124 : 0)
    );

    return {
      rtl: true,
      pageSize: { width: W, height: estimatedHeight },
      pageMargins: [M, 12, M, 12],
      content: [
        ...(logo ? [{ image: logo, width: 46, alignment: "center", margin: [0, 0, 0, 4] }] : []),
        { text: state.settings.storeName, fontSize: 13, bold: true, font: "CairoSemiBold", color: accent, alignment: "center" },
        { text: "متجر ملابس وأزياء", fontSize: 7.5, color: "#64748B", alignment: "center", margin: [0, 1, 0, 0] },
        rule,
        metaRow("فاتورة", sale.number),
        metaRow("التاريخ", dateTime(sale.date)),
        ...(sale.paymentMethod ? [metaRow("طريقة الدفع", sale.paymentMethod)] : []),
        metaRow("العميل", sale.customerName || "عميل نقدي"),
        ...(sale.customerPhone ? [metaRow("الهاتف", sale.customerPhone)] : []),
        dotted,
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
        { text: String(value), bold: true, font: "CairoSemiBold", fontSize: compact ? 8.5 : 9, color: valueColor || "#1F2937", alignment: "left", width: "auto" },
        { text: label, color: labelColor || "#4b5563", fontSize: compact ? 8 : 8.5, alignment: "right", width: "*" }
      ],
      margin: [0, compact ? 1 : 1.5, 0, compact ? 1 : 1.5]
    };
  }

  function pdfSoftCard(stack, compact, fill, borderColor, pad) {
    const padValue = pad || (compact ? 8 : 10);
    const cardFill = fill || "#F8FAFC";
    const lineColor = borderColor || "#E5E7EB";
    return {
      layout: {
        defaultBorder: false,
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0,
        hLineColor: () => lineColor,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 0.6 : 0,
        vLineColor: () => lineColor,
        paddingLeft: () => padValue,
        paddingRight: () => padValue,
        paddingTop: () => (compact ? 5 : 7),
        paddingBottom: () => (compact ? 5 : 7)
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ stack, fillColor: cardFill }]] }
    };
  }

  function pdfItemsHeader(labels, accent, compact) {
    return labels.map(label => ({
      text: label,
      bold: true,
      font: "CairoSemiBold",
      color: accent,
      alignment: "center",
      noWrap: true,
      fontSize: compact ? 7.5 : 8.5,
      margin: [3, compact ? 3 : 4, 3, compact ? 3 : 4]
    }));
  }

  function pdfItemsLayout(accent, compact, stripes, stripeColor) {
    const useStripes = stripes !== false;
    const sColor = stripeColor || "#E5E7EB";
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => {
        if (i === 0) return 0.7;
        if (i === 1) return 1;
        if (i === node.table.body.length) return 0.7;
        return 0.35;
      },
      hLineColor: (i, node) => {
        if (i === 1) return accent;
        return sColor;
      },
      vLineWidth: () => 0,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => (compact ? 3 : 4.5),
      paddingBottom: () => (compact ? 3 : 4.5),
      fillColor: (rowIndex) => {
        if (rowIndex === 0) return shadeHex(accent, 0.85);
        if (useStripes && rowIndex % 2 === 0) return "#f9fafb";
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

    const brandStack = [];
    if (logo) brandStack.push({ image: logo, width: 44, alignment: "center", margin: [0, 0, 0, 3] });
    brandStack.push({ text: state.settings.storeName, fontSize: 17, bold: true, font: "CairoSemiBold", color: accent, alignment: "center" });
    brandStack.push({ text: "متجر ملابس وأزياء", fontSize: 8.5, color: "#64748B", alignment: "center", margin: [0, 1, 0, 0] });

    const docTitleStack = [
      { text: typeInfo.label, fontSize: 18, bold: true, font: "CairoSemiBold", color: accent, alignment: "left" },
      { text: `الفترة: ${reportPeriodLabel()}`, fontSize: 9.5, bold: true, color: "#1F2937", alignment: "left", margin: [0, 3, 0, 0] },
      ...(filterSummary ? [{ text: filterSummary, fontSize: 8.5, color: "#64748B", alignment: "left", margin: [0, 2, 0, 0] }] : [])
    ];

    const header = {
      layout: {
        defaultBorder: false,
        paddingLeft: () => 14,
        paddingRight: () => 14,
        paddingTop: () => 10,
        paddingBottom: () => 10
      },
      table: { headerRows: 0, widths: ["*"], body: [[{ columns: [docTitleStack, brandStack], columnGap: 12, fillColor: shadeHex(accent, 0.95) }]] },
      margin: [0, 0, 0, 6]
    };
    const headerRule = { canvas: [{ type: "line", x1: 0, y1: 0, x2: 818, y2: 0, lineWidth: 1.2, lineColor: accent }], margin: [0, 0, 0, 6] };

    return {
      rtl: true,
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [12, 12, 12, 22],
      defaultStyle: { font: "Cairo", fontSize: 9 },
      content: [
        header,
        headerRule,
        ...await buildReportSections(type, accent, light)
      ],
      footer: (currentPage, pageCount) => ({
        stack: [
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 818, y2: 0, lineWidth: 0.5, lineColor: "#E5E7EB" }] },
          { text: `${state.settings.storeName} — تم الإنشاء ${new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium" }).format(new Date())}`, alignment: "center", fontSize: 8, color: "#94A3B8", margin: [0, 4, 0, 0] },
          ...(companyLines.length ? [{ text: companyLines.join("   |   "), alignment: "center", fontSize: 7.5, color: "#64748B", margin: [0, 2, 0, 0] }] : []),
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: "center", fontSize: 8, color: "#94A3B8", margin: [0, 2, 0, 0] }
        ],
        margin: [12, 6, 12, 0]
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
      hLineWidth: (i, node) => (node.table.headerRows && i === 0) ? 0.7 : 0.4,
      hLineColor: () => "#E5E7EB",
      vLineWidth: () => 0,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 7,
      paddingBottom: () => 7,
      fillColor: (rowIndex, node) => {
        if (node.table.headerRows && rowIndex < node.table.headerRows) return shadeHex(a, 0.85);
        return (rowIndex % 2 === 1) ? "#F7F8FA" : null;
      }
    };
  }

  function pdfDangerLayout() {
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => (node.table.headerRows && i === 0) ? 0.7 : 0.4,
      hLineColor: () => "#F5CBCB",
      vLineWidth: () => 0,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 7,
      paddingBottom: () => 7,
      fillColor: (rowIndex, node) => {
        if (node.table.headerRows && rowIndex < node.table.headerRows) return "#FEE2E2";
        return (rowIndex % 2 === 1) ? "#FEF2F2" : null;
      }
    };
  }

  function pdfHeaderRow(labels, accent, fontSize = 8.5) {
    const a = accent || docAccent();
    return labels.map(label => ({
      text: label,
      bold: true,
      font: "CairoSemiBold",
      color: a,
      alignment: "center",
      noWrap: true,
      fontSize,
      margin: [4, 6, 4, 6]
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
      color,
      alignment: "center",
      noWrap: true,
      fontSize: 8.5,
      margin: [4, 6, 4, 6]
    }));
  }

  function pdfSectionTitle(text, accent) {
    return { text, fontSize: 11.5, bold: true, color: accent, margin: [0, 6, 0, 4] };
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
                  { image: pdfKpiChipDataUrl(item.label, accent), width: 20, height: 20, alignment: "center", margin: [0, 0, 6, 0] },
                  {
                    stack: [
                      { text: item.label, fontSize: 7.5, color: "#6b7280" },
                      { text: item.value, fontSize: 11.5, bold: true, color: "#111827", margin: [0, 3, 0, 0] }
                    ],
                    margin: [0, 1, 0, 0]
                  }
                ],
                columnGap: 2
              },
              { text: item.note || "", fontSize: 7, color: "#9ca3af", margin: [0, 4, 0, 0] }
            ],
            fillColor: light,
            margin: [8, 10, 8, 10]
          }
        ]]
      },
      layout: "noBorders"
    }));
    return { columns: cards, columnGap: 6, margin: [0, 2, 0, 8] };
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
                { text: card.title, fontSize: 10.5, bold: true, color: accent, margin: [0, 0, 0, 7] },
                card.node
              ],
              fillColor: light,
              margin: [11, 12, 11, 12]
            }
          ]]
        },
        layout: "noBorders"
      }));
      rows.push({ unbreakable: true, columns: cols, columnGap: 8, margin: [0, 0, 0, 8] });
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
    ctx.fillStyle = "#9ca3af";
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
      layout: { ...pdfTableLayout(accent), fillColor: () => null, paddingTop: () => 3, paddingBottom: () => 3, paddingLeft: () => 4, paddingRight: () => 4 },
      table: {
        headerRows: 0,
        widths: [40, 64, "*", 12],
        body: segments.map(segment => [
          { text: `${segment.pct}%`, fontSize: 8.5, color: "#6b7280", alignment: "center" },
          { text: segment.valueText, fontSize: 8.5, bold: true, alignment: "center" },
          { text: segment.label, fontSize: 8.5, color: "#374151", alignment: "right" },
          { text: "\u00a0", fontSize: 5, fillColor: segment.color }
        ])
      }
    };
    return {
      columns: [
        { width: 124, image: pdfDonutDataUrl(segments), alignment: "center", margin: [0, 4, 0, 0] },
        { width: "*", stack: [legend], alignment: "right" }
      ],
      columnGap: 8
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
          { text: row.label, fontSize: 8.5, bold: true },
          { stack: [pdfProgressBar(pct, accent)], verticalAlignment: "middle" },
          { text: row.display || `${row.pct}%`, alignment: "center", bold: true, fontSize: 8.5 }
        ];
      })
    ], ["*", "*", 55], { headerRows: 1 });
  }

  function pdfAlertBlock(title, node) {
    return {
      unbreakable: true,
      stack: [
        { text: title, fontSize: 10.5, bold: true, color: "#B91C1C", margin: [0, 2, 0, 6] },
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
          ...top.map(t => [{ text: t.display, alignment: "center", bold: true, fontSize: 8.5 }, { text: t.label, fontSize: 8.5, bold: true, alignment: "right" }])
        ], [64, "*"], { headerRows: 1 })
      });
    }
    content.push(...pdfSectionGrid(gridCards, accent, light));

    if (low.length) {
      content.push(pdfAlertBlock("أصناف منخفضة المخزون", pdfTable([
        pdfDangerHeaderRow(["حد التنبيه", "المتبقي", "SKU", "الصنف"], "#B91C1C"),
        ...low.map(p => [
          { text: `${p.lowStock}`, alignment: "center", fontSize: 8.5 },
          { text: `${p.quantity}`, alignment: "center", fontSize: 8.5, bold: true, color: "#B91C1C" },
          { text: p.sku, fontSize: 8.5, alignment: "center" },
          { text: p.name, fontSize: 8.5, bold: true, alignment: "right" }
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
          { text: `${p.margin}%`, alignment: "center", fontSize: 8.5 },
          { text: formatMoney(p.profit), alignment: "center", bold: true, fontSize: 8.5 },
          { text: formatMoney(p.cost), alignment: "center", fontSize: 8.5 },
          { text: formatMoney(p.revenue), alignment: "center", fontSize: 8.5 },
          { text: `${p.qty}`, alignment: "center", fontSize: 8.5 },
          { text: p.name, bold: true, fontSize: 8.5, alignment: "right" }
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
          { text: formatMoney(c.total), alignment: "center", bold: true, fontSize: 8.5 },
          { text: `${c.count}`, alignment: "center", fontSize: 8.5 },
          { text: c.name, bold: true, fontSize: 8.5, alignment: "right" }
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
          { text: p.quantity <= p.lowStock ? "منخفض" : "متاح", alignment: "center", bold: true, fontSize: 8.5, color: p.quantity <= p.lowStock ? "#dc2626" : "#15803d" },
          { text: formatMoney(p.price * p.quantity), alignment: "center", bold: true, fontSize: 8.5 },
          { text: formatMoney(p.cost), alignment: "center", fontSize: 8.5 },
          { text: formatMoney(p.price), alignment: "center", fontSize: 8.5 },
          { text: `${p.quantity}`, alignment: "center", fontSize: 8.5 },
          { text: p.category, alignment: "center", fontSize: 8.5 },
          { text: p.sku, alignment: "center", fontSize: 8.5 },
          thumbs[index]
            ? { image: thumbs[index], width: 24, height: 24, alignment: "center", margin: [1, 1, 1, 1] }
            : { text: "", margin: [2, 3, 2, 3] },
          { text: p.name, bold: true, fontSize: 8.5, alignment: "right" }
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
          { text: t.display, alignment: "center", bold: true, fontSize: 8.5 },
          { text: t.label, bold: true, fontSize: 8.5, alignment: "right" },
          { text: `${i + 1}`, alignment: "center", bold: true, fontSize: 8.5, color: i < 3 ? accent : "#6b7280" }
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

  async function reportSectionsLowStock(accent) {
    const low = filteredReportProducts().filter(p => p.quantity <= p.lowStock);
    const content = [];
    if (low.length) {
      const thumbs = await Promise.all(low.map(p => resolveThumbForPdf(p.image, 44, p.name, "circle")));
      content.push(pdfAlertBlock("أصناف منخفضة المخزون", pdfTable([
        pdfDangerHeaderRow(["حد التنبيه", "المتبقي", "SKU", "الصورة", "الصنف"], "#B91C1C"),
        ...low.map((p, index) => [
          { text: `${p.lowStock}`, alignment: "center", fontSize: 8.5 },
          { text: `${p.quantity}`, alignment: "center", bold: true, fontSize: 8.5, color: "#B91C1C" },
          { text: p.sku, alignment: "center", fontSize: 8.5 },
          thumbs[index]
            ? { image: thumbs[index], width: 24, height: 24, alignment: "center", margin: [1, 1, 1, 1] }
            : { text: "", margin: [2, 3, 2, 3] },
          { text: p.name, bold: true, fontSize: 8.5, alignment: "right" }
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
        body
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

  function saveSettings(event) {
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
      showInvoiceQr: !!document.getElementById("showInvoiceQr")?.checked
    };
    if (!commitState({ settings: nextSettings })) {
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
      img.onload = () => {
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
        if (!commitState({ settings: nextSettings })) {
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
        salesCount: state.sales.length
      },
      products: state.products,
      sales: state.sales,
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
        const confirmMsg = `هل أنت متأكد من استرجاع البيانات؟\n\nتفاصيل النسخة:\n• أصناف: ${data.products.length}\n• فواتير: ${data.sales.length}\n• المتجر: ${data.settings?.storeName || 'غير محدد'}\n• التاريخ: ${data.exportDate ? new Date(data.exportDate).toLocaleDateString('ar-EG-u-nu-latn') : 'غير معروف'}\n\n⚠️ سيتم استبدال بياناتك الحالية بالكامل بالبيانات التي في الملف.`;
        if (confirm(confirmMsg)) {
          const nextSettings = data.settings ? { ...defaultSettings(), ...data.settings } : state.settings;
          if (!commitState({ products: data.products, sales: data.sales, settings: nextSettings })) {
            showStorageFullDialog();
            return;
          }
          applySettings();
          render();
          toastMessage("تم استرجاع النسخة الاحتياطية بنجاح");
        }
      } catch (err) {
        console.error("Backup import error:", err);
        alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function factoryReset() {
    const msg1 = "⚠️ تحذير شديد الخطورة!\n\nهل أنت متأكد تماماً من إعادة ضبط المصنع؟\nسيتم مسح جميع الأصناف والفواتير والشعار والإعدادات نهائياً ولن يمكنك التراجع.";
    if (!confirm(msg1)) return;

    const input = prompt("لإعادة الضبط وتأكيد المسح النهائي الكامل، اكتب كلمة (مسح) في الخانة أدناه:");
    if (input !== "مسح") {
      toastMessage("تم إلغاء إعادة ضبط المصنع (الكلمة غير مطابقة)");
      return;
    }

    state.products = [];
    state.sales = [];
    state.settings = defaultSettings();
    state.cart = [];
    state._reportFrom = null;
    state._reportTo = null;

    if (!commitState({ products: [], sales: [], settings: defaultSettings() })) {
      showStorageFullDialog();
      return;
    }
    applySettings();
    render();
    toastMessage("تمت إعادة ضبط المصنع ومسح جميع الأصناف والبيانات بالكامل");
  }

  function loadDemoData() {
    if (activeProducts().length > 0 && !confirm("لديك أصناف موجودة بالفعل. هل تريد إضافة الأصناف التجريبية؟")) {
      return;
    }
    if (!commitState({ products: seedProducts() })) {
      showStorageFullDialog();
      return;
    }
    render();
    toastMessage("تم تحميل الأصناف التجريبية بنجاح");
  }

  function getFilteredSales() {
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
  }

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

  init();
})();
