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
    customers: "clothing-pos.customers.v1",
    deletedSales: "clothing-pos.deletedSales.v1"
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
    deletedSales: [],
    settings: {},
    cart: [],
    search: "",
    category: "الكل",
    currentInvoiceId: null,
    deferredInstallPrompt: null,
    report: { type: "summary", ready: false, loading: false },
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
    _bulkMode: false,
    _bulkSel: {},
    _custBulkMode: false,
    _custBulkSel: {},
    _expQuery: "",
    _expFrom: "",
    _expTo: "",
    allowExit: false
  };

  const reportTypes = [
    { id: "summary", label: "ملخص شامل", en: "Comprehensive Summary", desc: "المبيعات والأرباح والنسب", icon: "📊" },
    { id: "hourly", label: "ساعات الذروة", en: "Peak Hours Analysis", desc: "توزيع المبيعات على الساعات", icon: "🕐" },
    { id: "product-profit", label: "ربحية الأصناف", en: "Product Profitability", desc: "صافي الربح وهامش كل صنف مباع", icon: "💎" },
    { id: "customers", label: "العملاء الأكثر شراءً", en: "Top Customers", desc: "عدد الفواتير وقيمة مشتريات كل عميل", icon: "👥" },
    { id: "inventory", label: "تقرير المخزون", en: "Inventory Report", desc: "الكميات والقيم وحالة الأصناف", icon: "📦" },
    { id: "margins", label: "هوامش الربح", en: "Profit Margins", desc: "نسبة الربح لكل فئة", icon: "📈" },
    { id: "categories", label: "مبيعات الفئات", en: "Sales by Category", desc: "توزيع الإيراد على فئات الملابس", icon: "🏷️" },
    { id: "top", label: "الأكثر مبيعاً", en: "Best Sellers", desc: "ترتيب الأصناف حسب الكمية المباعة", icon: "🏆" },
    { id: "payments", label: "طرق الدفع", en: "Payment Methods", desc: "الإيراد وعدد الفواتير لكل طريقة دفع", icon: "💳" },
    { id: "pl", label: "الأرباح والخسائر", en: "Profit & Loss Statement", desc: "الدخل والمصروفات وصافي الربح", icon: "📋" },
    { id: "lowstock", label: "تنبيهات المخزون", en: "Low Stock Alerts", desc: "الأصناف التي تجاوزت حد التنبيه", icon: "⚠️" }
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

  const SPLASH_MIN_MS = 950;
  let _splashStartedAt = 0;

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
    _splashStartedAt = Date.now();
    await loadStateFromIdb();
    updateSplashStatus("تم تحميل البيانات");
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
    bindKeyboardShortcuts();
    finishSplash();
  }

  /* ==========================================
     المرحلة 3 و 4: ماسح الكاميرا، اختصارات، ولاء، واتساب، مصروفات
     ========================================== */

  // 1. نظام ولاء العملاء (Customer Loyalty & Rewards)
  function customerLoyaltyInfo(name) {
    if (!name) return { points: 0, tier: "برونزي", badgeClass: "loyalty-bronze", icon: "🥉", discount: 0 };
    const sales = state.sales.filter(s => s.customerName === name && s.status !== "cancelled");
    const totalSpent = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const points = Math.floor(totalSpent / 10);

    let tier = "برونزي";
    let badgeClass = "loyalty-bronze";
    let icon = "🥉";
    let discount = 0;

    if (points >= 1000) {
      tier = "VIP";
      badgeClass = "loyalty-vip";
      icon = "💎";
      discount = 15;
    } else if (points >= 300) {
      tier = "ذهبي";
      badgeClass = "loyalty-gold";
      icon = "🥇";
      discount = 10;
    } else if (points >= 100) {
      tier = "فضة";
      badgeClass = "loyalty-silver";
      icon = "🥈";
      discount = 5;
    }

    return { points, tier, badgeClass, icon, discount, totalSpent };
  }

  // 2. إرسال وتكامل واتساب (WhatsApp Integration)
  function sendWhatsAppMessage(phone, text) {
    let cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("01")) cleanPhone = "2" + cleanPhone; // مصر تلقائياً
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function shareInvoiceWhatsApp(saleId) {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;
    sendWhatsAppMessage(sale.customerPhone, whatsappReceiptText(sale));
  }

  function whatsappReceiptText(sale) {
    const settings = state.settings || {};
    const store = settings.storeName || "Abo Omar Store";
    const currency = settings.currency || "ج.م";
    const fmt = value => `${moneyFormatter.format(Number(value || 0))} ${currency}`;
    const net = netSale(sale);
    const returns = sale.returns || [];
    const div = "━━━━━━━━━━━━━━━━━━";
    const thin = "━━━━━━━━━━━━━━━";
    const lines = [];

    lines.push(`🏪 *${store}*`);
    lines.push("فاتورة مبيعات");
    lines.push(div);
    lines.push(`🧾 *رقم الفاتورة:* ${sale.number || "—"}`);
    lines.push(`📅 *التاريخ:* ${sale.date ? dateTime(sale.date) : "—"}`);
    lines.push(`💳 *طريقة الدفع:* ${sale.paymentMethod || "نقداً"}`);
    lines.push(`👤 *العميل:* ${sale.customerName || "عميل نقدي"}`);
    if (sale.customerPhone) lines.push(`📞 *الهاتف:* ${sale.customerPhone}`);
    lines.push(div);
    lines.push("*الأصناف:*");
    (sale.items || []).forEach((item, index) => {
      const meta = [item.sku, item.size, item.color].filter(Boolean).join(" · ");
      const name = meta ? `${item.name} (${meta})` : item.name;
      lines.push(`${index + 1}) *${name}*`);
      lines.push(`   ${item.qty} × ${fmt(item.price)} = ${fmt(item.total)}`);
    });
    lines.push(div);
    lines.push(`المجموع الفرعي: ${fmt(sale.subtotal)}`);
    if (Number(sale.discount || 0) > 0) lines.push(`الخصم: −${fmt(sale.discount)}`);
    if (!sale.taxFree) lines.push(`ضريبة ${settings.taxRate || 0}%: ${fmt(sale.tax)}`);
    if (Number(sale.shipping || 0) > 0) lines.push(`مصاريف الشحن: ${fmt(sale.shipping)}`);
    if (net.returnAmount > 0) lines.push(`المجموع المرتجع: −${fmt(net.returnAmount)}`);
    lines.push(thin);
    lines.push("*الإجمالي النهائي:*");
    lines.push(`*${fmt(net.total)}*`);
    if (net.total > 0) {
      lines.push(thin);
      lines.push("*المبلغ بالحروف:*");
      lines.push(amountInWords(net.total));
    }
    if (returns.length) {
      lines.push(div);
      lines.push("_المرتجعات:_");
      returns.forEach(ret => {
        lines.push(`• ${dateTime(ret.date)}${ret.reason ? ` — ${ret.reason}` : ""} : −${fmt(ret.total)}`);
        (ret.items || []).forEach(item => lines.push(`   × ${item.qty} ${item.name} = ${fmt(item.total)}`));
      });
    }
    lines.push(div);
    const comp = companyInfoLines();
    if (comp.length) {
      lines.push("*للاتصال:*");
      lines.push(...comp);
    }
    lines.push("");
    lines.push("شكراً لزيارتكم! 🌹");
    return lines.join("\n");
  }

  function shareDebtWhatsApp(customerName) {
    const debt = customerDebt(customerName);
    if (debt <= 0) {
      showToast("هذا العميل ليس عليه أي ديون متبقية", "ok");
      return;
    }
    const cust = customerRecord(customerName);
    const store = state.settings.storeName || "Abo Omar Store";
    const text = `مرحباً ${customerName} 👋\nنود تذكيركم بالحساب المتبقي لديكم لدى *${store}* بمبلغ: *${moneyFormatter.format(debt)} ${state.settings.currency}*.\nشكراً لتفهمكم وتواصلكم العاطر!`;
    sendWhatsAppMessage(cust ? cust.phone : "", text);
  }

  // 3. ماسح الباركود بالكاميرا (Camera Scanner)
  let _scannerStream = null;
  let _scannerAnimFrame = null;

  async function startCameraScanner(onSuccessCallback) {
    const dialog = document.getElementById("scannerDialog");
    const video = document.getElementById("scannerVideo");
    const status = document.getElementById("scannerStatus");
    if (!dialog || !video) return;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "true");

    if (status) status.textContent = "جاري فتح الكاميرا...";

    try {
      _scannerStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = _scannerStream;
      await video.play();
      if (status) status.textContent = "وجه الكاميرا نحو الباركود...";

      // فحص سريع بإستخدام BarcodeDetector إن كان مدعوماً في المتصفح أو البوصلة الضوئية
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ["code_128", "ean_13", "ean_8", "qr_code", "upc_a", "upc_e"] });
        const scanFrame = async () => {
          if (!video.videoWidth) {
            _scannerAnimFrame = requestAnimationFrame(scanFrame);
            return;
          }
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              triggerScanSuccess(code, onSuccessCallback);
              return;
            }
          } catch (e) {
            /* ignore detection frame error */
          }
          _scannerAnimFrame = requestAnimationFrame(scanFrame);
        };
        _scannerAnimFrame = requestAnimationFrame(scanFrame);
      } else {
        if (status) status.textContent = "الكاميرا تعمل (أدخل الباركود أو استخدم ماسح خفيف)";
      }
    } catch (err) {
      if (status) status.textContent = "تعذر فتح الكاميرا: " + (err.message || "تأكد من إذن الكاميرا");
    }
  }

  function triggerScanSuccess(code, callback) {
    if (!code) return;
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    stopCameraScanner();
    showToast(`تم مسح الباركود بنجاح: ${code}`, "ok");

    // بحث عن المنتج بالباركود أو SKU
    const product = state.products.find(p => p.sku === code || p.barcode === code || p.id === code);
    if (product) {
      addToCart(product.id);
      if (state.view !== "sale") go("sale");
    } else {
      state.search = code;
      if (state.view !== "products" && state.view !== "sale") go("sale");
      render();
    }

    if (typeof callback === "function") callback(code);
  }

  function stopCameraScanner() {
    if (_scannerAnimFrame) {
      cancelAnimationFrame(_scannerAnimFrame);
      _scannerAnimFrame = null;
    }
    if (_scannerStream) {
      _scannerStream.getTracks().forEach(track => track.stop());
      _scannerStream = null;
    }
    const dialog = document.getElementById("scannerDialog");
    if (dialog) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }

  // 4. اختصارات لوحة المفاتيح العالمية (Global Keyboard Shortcuts)
  function bindKeyboardShortcuts() {
    window.addEventListener("keydown", event => {
      // تجنب الاختصارات أثناء الكتابة في مدخلات النصوص المعقدة
      const activeEl = document.activeElement;
      const isInputting = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT");

      if (event.key === "Escape") {
        stopCameraScanner();
        document.querySelectorAll("dialog[open]").forEach(d => {
          if (typeof d.close === "function") d.close();
          else d.removeAttribute("open");
        });
        return;
      }

      if (event.key === "F2") {
        event.preventDefault();
        go("sale");
        return;
      }

      if (event.key === "F3") {
        event.preventDefault();
        const searchInput = document.getElementById("productSearch");
        if (searchInput && state.view === "sale") searchInput.focus();
        else startCameraScanner();
        return;
      }

      if (event.key === "F8" && state.view === "sale") {
        event.preventDefault();
        checkoutCart();
        return;
      }
    });
  }

  // 5. إدارة المصروفات (Expenses Logic)
  function addExpenseRecord(category, amount, date, note) {
    if (!amount || amount <= 0) {
      showToast("يرجى إدخال مبلغ صحيح للمصروف", "warn");
      return;
    }
    const record = {
      id: cryptoRandomId("exp"),
      category: category || "أخرى",
      amount: Number(amount),
      date: date || new Date().toISOString().split("T")[0],
      note: note || "",
      createdAt: Date.now()
    };
    state.expenses.unshift(record);
    commitState({ expenses: state.expenses });
    showToast("تم تسجيل المصروف بنجاح", "ok");
  }

  function deleteExpenseRecord(id) {
    state.expenses = state.expenses.filter(e => e.id !== id);
    commitState({ expenses: state.expenses });
    showToast("تم حذف سجل المصروف", "ok");
    render();
  }

  function updateSplashStatus(text) {
    const el = document.getElementById("splashStatus");
    if (el && text) el.textContent = text;
  }

  function finishSplash() {
    const splash = document.getElementById("splashScreen");
    if (!splash) return;
    const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - _splashStartedAt));
    window.setTimeout(() => {
      updateSplashStatus("جاهز");
      splash.classList.add("is-leaving");
      splash.setAttribute("aria-hidden", "true");
      window.setTimeout(() => splash.classList.add("is-done"), 700);
    }, wait);
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
      state.deletedSales = Array.isArray(data.deletedSales) ? data.deletedSales : [];
    } else if (legacyExists) {
      const storedProducts = readStorage(STORAGE.products, null);
      state.products = storedProducts !== null ? storedProducts : seedProducts();
      state.sales = readStorage(STORAGE.sales, []);
      state.settings = readStorage(STORAGE.settings, null) || defaultSettings();
      state.expenses = readStorage(STORAGE.expenses, []);
      state.payments = readStorage(STORAGE.payments, []);
      state.customers = readStorage(STORAGE.customers, []);
      state.deletedSales = readStorage(STORAGE.deletedSales, []);
      try {
        await idbSet(STORAGE.data, {
          products: state.products,
          sales: state.sales,
          settings: state.settings,
          expenses: state.expenses,
          payments: state.payments,
          customers: state.customers,
          deletedSales: state.deletedSales
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
    state.deletedSales = Array.isArray(state.deletedSales) ? state.deletedSales : [];
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
      customers: next.customers !== undefined ? next.customers : state.customers,
      deletedSales: next.deletedSales !== undefined ? next.deletedSales : state.deletedSales
    };
    const payload = {
      products: candidates.products,
      sales: candidates.sales,
      settings: candidates.settings,
      expenses: candidates.expenses,
      payments: candidates.payments,
      customers: candidates.customers,
      deletedSales: candidates.deletedSales
    };
    if (typeof indexedDB !== "undefined") {
      return idbSet(STORAGE.data, payload).then(() => {
        state.products = candidates.products;
        state.sales = candidates.sales;
        state.settings = candidates.settings;
        state.expenses = candidates.expenses;
        state.payments = candidates.payments;
        state.customers = candidates.customers;
        state.deletedSales = candidates.deletedSales;
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
      localStorage.setItem(STORAGE.deletedSales, JSON.stringify(candidates.deletedSales));
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
    state.deletedSales = candidates.deletedSales;
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
    const splashName = document.getElementById("splashStoreName");
    if (splashName) splashName.textContent = state.settings.storeName;
    const splashLogo = document.getElementById("splashLogo");
    if (splashLogo) splashLogo.src = state.settings.logo || "assets/icon-192.png";
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

  let bulkLongPressAt = 0;
  let appInstalled = false;

function isRecentTap(el) {
    const t = Number(el.dataset.tapMs || 0);
    return !!t && Date.now() - t < 600;
  }

  // Fast, responsive taps on mobile: run on touchstart (no click delay / double-tap
  // zoom conflict) while click still works on desktop. The tapMs guard skips the
  // synthetic click that some browsers still fire after a handled touchstart.
  function installFastTap(el, handler) {
    el.addEventListener("click", () => {
      if (isRecentTap(el)) return;
      handler();
    });
    el.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 1) return;
      el.dataset.tapMs = Date.now();
      event.preventDefault();
      handler();
    }, { passive: false });
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
    const whatsappInvoiceBtn = document.getElementById("whatsappInvoiceButton");
    if (whatsappInvoiceBtn) whatsappInvoiceBtn.addEventListener("click", () => shareInvoiceWhatsApp(state.currentInvoiceId));
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
      const fastBtn = inc || dec;
      if (!fastBtn || isRecentTap(fastBtn)) return;
      changeReturnQty(fastBtn.dataset.retInc || fastBtn.dataset.retDec, inc ? 1 : -1);
    });
    returnDialog.addEventListener("touchstart", event => {
      const inc = event.target.closest("[data-ret-inc]");
      const dec = event.target.closest("[data-ret-dec]");
      const fastBtn = inc || dec;
      if (!fastBtn || event.touches.length !== 1) return;
      fastBtn.dataset.tapMs = Date.now();
      event.preventDefault();
      changeReturnQty(fastBtn.dataset.retInc || fastBtn.dataset.retDec, inc ? 1 : -1);
    }, { passive: false });
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
      appInstalled = true;
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
    const alreadyInstalled = isStandalone() || appInstalled;
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
      expenses: renderExpenses,
      reports: renderReports,
      settings: renderSettings
    };
    app.innerHTML = `<section class="view fade-in">${views[state.view]()}</section>${bulkBarHtml()}`;
    wireViewEvents();
  }

  function bulkBarHtml() {
    const isCustomers = state.view === "customers";
    if (state.view !== "invoices" && state.view !== "customers") return "";
    const count = isCustomers ? Object.keys(state._custBulkSel).length : Object.keys(state._bulkSel).length;
    if (!count) return "";
    const suffix = isCustomers
      ? (count === 1 ? "عميل" : "عملاء")
      : (count === 1 ? "فاتورة" : "فواتير");
    const totalText = isCustomers
      ? ""
      : ` · ${formatMoney(bulkSelectedSales().reduce((sum, sale) => sum + netSale(sale).total, 0))}`;
    return `
      <div class="bulk-bar no-print" role="status" aria-live="polite">
        <strong class="bulk-count">تم تحديد ${count} ${suffix}${totalText}</strong>
        <div class="inline-actions">
          <button class="danger" id="bulkDeleteBtn" type="button">حذف المحدد</button>
          <button class="ghost" id="bulkCancelBtn" type="button">إلغاء</button>
        </div>
      </div>`;
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
            <label>اسم العميل <input id="customerName" list="customerDatalist" value="${escapeAttr(state._saleCustomerName)}" placeholder="عميل نقدي"></label>
            <datalist id="customerDatalist">${state.customers.map(item => `<option value="${escapeAttr(item.name)}">${escapeAttr(item.code)}</option>`).join("")}</datalist>
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
            <button class="ghost ${state._bulkMode ? "active" : ""}" id="bulkToggleBtn" type="button" title="تحديد فواتير متعددة">${state._bulkMode ? "إنهاء التحديد" : "تحديد"}</button>
            <div class="view-switch" role="tablist" aria-label="طريقة عرض الفواتير">
              <button class="view-switch-btn ${state._invoiceView === "list" ? "active" : ""}" data-invoice-view="list" type="button">قائمة</button>
              <button class="view-switch-btn ${state._invoiceView === "cards" ? "active" : ""}" data-invoice-view="cards" type="button">بطاقات</button>
            </div>
            <button class="primary" data-go="sale" type="button">فاتورة جديدة</button>
          </div>
        </div>
        ${state._bulkMode && sales.length ? `
          <div class="bulk-toolbar no-print">
            <label class="bulk-select-all">
              <input type="checkbox" id="bulkSelectAllBtn" ${sales.every(sale => state._bulkSel[sale.id]) ? "checked" : ""}>
              <span>تحديد الكل</span>
            </label>
            <span class="muted">اضغط مطولاً على فاتورة أو استخدم مربعات الاختيار.</span>
          </div>
        ` : ""}
        ${sales.length ? invoiceViewBody(sales) : `<div class="empty">لا توجد فواتير مطابقة.</div>`}
      </section>
    `;
  }

  function invoiceViewBody(sales) {
    const view = state._invoiceView || "list";
    if (view === "cards") return `<div class="invoice-cards">${sales.map(invoiceCard).join("")}</div>`;
    return `<div class="invoice-list">${sales.map(invoiceRow).join("")}</div>`;
  }

  function invoiceCard(sale) {
    const net = netSale(sale);
    const hasReturns = (sale.returns || []).length > 0;
    const itemCount = sale.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const selected = !!state._bulkSel[sale.id];
    return `
      <article class="invoice-card ${selected ? "bulk-selected" : ""}" data-bulk-id="${sale.id}">
        <div class="invoice-card-head">
          ${state._bulkMode ? `<input type="checkbox" class="bulk-check" data-bulk-check="${sale.id}" ${selected ? "checked" : ""} aria-label="تحديد فاتورة ${escapeAttr(sale.number)}">` : ""}
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
    const selected = !!state._bulkSel[sale.id];
    return `
      <article class="invoice-row ${selected ? "bulk-selected" : ""}" data-bulk-id="${sale.id}">
        ${state._bulkMode ? `<input type="checkbox" class="bulk-check" data-bulk-check="${sale.id}" ${selected ? "checked" : ""} aria-label="تحديد فاتورة ${escapeAttr(sale.number)}">` : ""}
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
        payments: customerPayments(customer.name),
        archived: record ? !!record.archived : false
      };
    }).filter(customer => !customer.archived);
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
            <button class="ghost ${state._custBulkMode ? "active" : ""}" id="custBulkToggleBtn" type="button" title="تحديد عملاء متعددين">${state._custBulkMode ? "إنهاء التحديد" : "تحديد"}</button>
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
        ${state._custBulkMode && customers.length ? `
          <div class="bulk-toolbar no-print">
            <label class="bulk-select-all">
              <input type="checkbox" id="custBulkSelectAllBtn" ${customers.every(customer => state._custBulkSel[customer.name]) ? "checked" : ""}>
              <span>تحديد الكل</span>
            </label>
            <span class="muted">اضغط مطولاً على عميل أو استخدم مربعات الاختيار. العملاء الذين عليهم ديون لا يمكن حذفهم.</span>
          </div>
        ` : ""}
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

  function customerClassBadge(classification) {
    if (!classification) return "";
    const label = CUSTOMER_CLASSES.find(item => item.id === classification)?.label || classification;
    const cls = classification === "محظور" ? "low" : classification === "آجل" ? "warn" : "ok";
    return `<span class="status-pill cust-class ${cls}">${escapeHtml(label)}</span>`;
  }

  function customerCard(customer, index, topTotal) {
    const pct = topTotal > 0 ? Math.round((customer.total / topTotal) * 100) : 0;
    return `
      <article class="customer-card ${state._custBulkSel[customer.name] ? "bulk-selected" : ""}" ${state._custBulkMode ? "" : `data-cust-open="${escapeAttr(customer.name)}"`} data-cust-bulk-id="${escapeAttr(customer.name)}">
        <div class="customer-card-head">
          ${state._custBulkMode ? `<input type="checkbox" class="bulk-check" data-cust-check="${escapeAttr(customer.name)}" ${state._custBulkSel[customer.name] ? "checked" : ""} aria-label="تحديد عميل ${escapeAttr(customer.name)}">` : ""}
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
              ${state._custBulkMode ? `<th class="cust-check-th"><input type="checkbox" class="bulk-check" data-cust-check-all-table ${customers.length && customers.every(customer => state._custBulkSel[customer.name]) ? "checked" : ""} aria-label="تحديد كل العملاء"></th>` : ""}
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
              <tr class="${state._custBulkSel[customer.name] ? "bulk-selected" : ""}" data-cust-bulk-id="${escapeAttr(customer.name)}">${state._custBulkMode ? `<td class="cust-check-td"><input type="checkbox" class="bulk-check" data-cust-check="${escapeAttr(customer.name)}" ${state._custBulkSel[customer.name] ? "checked" : ""} aria-label="تحديد عميل ${escapeAttr(customer.name)}"></td>` : ""}
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
      <article class="invoice-row customer-list-row ${state._custBulkSel[customer.name] ? "bulk-selected" : ""}" data-cust-bulk-id="${escapeAttr(customer.name)}">
        ${state._custBulkMode ? `<input type="checkbox" class="bulk-check" data-cust-check="${escapeAttr(customer.name)}" ${state._custBulkSel[customer.name] ? "checked" : ""} aria-label="تحديد عميل ${escapeAttr(customer.name)}">` : ""}
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


  let _rptSortState = { key: null, asc: true };
  let _rptSearchState = "";

  function getPLData(sales, expenses) {
    const safeSales = Array.isArray(sales) ? sales : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    let revenue = 0;
    let cost = 0;
    let discount = 0;
    let shipping = 0;
    let tax = 0;
    let qty = 0;

    safeSales.forEach(sale => {
      const items = Array.isArray(sale.items) ? sale.items : [];
      const returns = Array.isArray(sale.returns) ? sale.returns : [];
      const returnedItems = returns.flatMap(ret => Array.isArray(ret.items) ? ret.items : []);
      revenue += items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
      cost += items.reduce((sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0), 0);
      revenue -= returnedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
      cost -= returnedItems.reduce((sum, item) => sum + Number(item.cost || 0) * Number(item.qty || 0), 0);
      const net = netSale(sale);
      qty += net.qty;
      discount += Number(sale.discount || 0);
      shipping += Number(sale.shipping || 0);
      tax += Number(sale.tax || 0);
    });

    const expenseTotal = totalExpenses(safeExpenses);
    const grossProfit = revenue - cost;
    const netProfit = grossProfit - discount + shipping - expenseTotal;
    return {
      revenue,
      cost,
      expenses: expenseTotal,
      discount,
      shipping,
      tax,
      qty,
      salesCount: safeSales.length,
      grossProfit,
      netProfit
    };
  }

  function renderExpenses() {
    const expenses = getFilteredExpenses();
    const total = totalExpenses(expenses);
    const allTotal = totalExpenses(state.expenses);
    const sales = salesInExpenseRange();
    const salesTotal = sales.reduce((sum, sale) => sum + netSale(sale).total, 0);
    const periodLabel = state._expFrom || state._expTo
      ? `${state._expFrom || "البداية"} — ${state._expTo || "حتى اليوم"}`
      : "كل الفترة";

    return `
      <div class="stat-cards">
        <div class="stat-card gold">
          <span class="stat-label">مصروفات الفترة</span>
          <span class="stat-value">${formatMoney(total)}</span>
          <small class="muted">${escapeHtml(periodLabel)}</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">عدد السجلات</span>
          <span class="stat-value">${expenses.length}</span>
          <small class="muted">${state.expenses.length} سجل إجمالاً</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">المبيعات في الفترة</span>
          <span class="stat-value">${formatMoney(salesTotal)}</span>
          <small class="muted">${sales.length} فاتورة</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">إجمالي المصروفات</span>
          <span class="stat-value">${formatMoney(allTotal)}</span>
          <small class="muted">منذ بداية الاستخدام</small>
        </div>
      </div>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>إدارة المصروفات</h2>
            <p class="muted">سجّل مصروفات المتجر وتابع أثرها على نتائج الفترة.</p>
          </div>
          <button class="primary" id="addExpenseButton" type="button">إضافة مصروف</button>
        </div>
        <div class="filters">
          <input class="search" id="expenseSearch" value="${escapeAttr(state._expQuery || "")}" placeholder="ابحث في الفئة أو الملاحظة">
          <label class="filter-date">من <input id="expenseFrom" type="date" value="${escapeAttr(state._expFrom || "")}"></label>
          <label class="filter-date">إلى <input id="expenseTo" type="date" value="${escapeAttr(state._expTo || "")}"></label>
          <button class="ghost" id="expenseClearFilters" type="button">مسح الفلاتر</button>
        </div>
        ${expenses.length ? `
          <div class="scrollable-table">
            <table class="report-table">
              <thead>
                <tr><th>التاريخ</th><th>الفئة</th><th>الملاحظة</th><th>المبلغ</th><th>إجراء</th></tr>
              </thead>
              <tbody>
                ${expenses.map(expense => `
                  <tr>
                    <td>${escapeHtml(shortDate(expense.date))}</td>
                    <td><strong>${escapeHtml(expense.category || "أخرى")}</strong></td>
                    <td class="muted">${escapeHtml(expense.note || "—")}</td>
                    <td><strong>${formatMoney(expense.amount)}</strong></td>
                    <td><button class="danger ghost" type="button" data-exp-del="${escapeAttr(expense.id)}">حذف</button></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `<div class="empty">لا توجد مصروفات مطابقة. أضف أول مصروف باستخدام الزر أعلاه.</div>`}
      </section>
    `;
  }

  function renderReports() {
    const currentType = state.report?.type || "summary";
    const typeInfo = reportTypes.find(t => t.id === currentType) || reportTypes[0];

    return `
      <div class="reports-view-root">
        <!-- الرأس الرئيسي مع أزرار التصدير الحصرية -->
        <header class="rpt-hero-head">
          <div class="rpt-hero-info">
            <span class="rpt-hero-badge">
              <span class="pulse-dot"></span>
              مركز التقارير المتقدم · ${reportGeneratedAt()}
            </span>
            <h1 class="rpt-hero-title">${typeInfo.icon} ${typeInfo.label}</h1>
            <p class="rpt-hero-subtitle">${typeInfo.desc} — ${reportPeriodLabel()}</p>
          </div>
          <div class="rpt-export-actions">
            <button class="rpt-btn-export rpt-btn-pdf" id="exportReportPdfBtn" type="button" title="تحميل تقرير PDF منسق للطباعة والحفظ">
              <span style="font-size:18px">📄</span> تصدير PDF احترافي
            </button>
            <button class="rpt-btn-export rpt-btn-excel" id="exportReportExcelBtn" type="button" title="تصدير جدول البيانات إلى ملف Excel مع المعادلات والتنسيق">
              <span style="font-size:18px">📊</span> تصدير Excel احترافي
            </button>
          </div>
        </header>

        <!-- شبكة اختيار نوع التقرير (11 نوع) -->
        <div class="rpt-types-grid" role="tablist" aria-label="أنواع التقارير">
          ${reportTypes.map(t => `
            <button class="rpt-type-btn ${currentType === t.id ? "active" : ""}" data-set-report="${t.id}" type="button" role="tab" aria-selected="${currentType === t.id}">
              <div class="rpt-type-icon-box">${t.icon}</div>
              <div class="rpt-type-text">
                <strong>${t.label}</strong>
                <small>${t.desc}</small>
              </div>
            </button>
          `).join("")}
        </div>

        <!-- صندوق الفلاتر الذكي -->
        <section class="rpt-filter-card">
          <div class="rpt-preset-row">
            <span class="rpt-preset-label">الفترة السريعة:</span>
            ${[
              ["today", "اليوم"],
              ["yesterday", "أمس"],
              ["week", "آخر 7 أيام"],
              ["month", "هذا الشهر"],
              ["lastMonth", "الشهر السابق"],
              ["month30", "آخر 30 يوم"],
              ["year", "هذا العام"],
              ["all", "كل الفترة"]
            ].map(([key, label]) => `
              <button class="rpt-preset-chip ${activePresetKey() === key ? "active" : ""}" data-report-preset="${key}" type="button">${label}</button>
            `).join("")}
          </div>

          <div class="rpt-filter-inputs">
            <div class="rpt-field-group">
              <label for="reportDateFrom">من تاريخ</label>
              <input type="date" id="reportDateFrom" value="${state._reportFrom || ""}">
            </div>
            <div class="rpt-field-group">
              <label for="reportDateTo">إلى تاريخ</label>
              <input type="date" id="reportDateTo" value="${state._reportTo || ""}">
            </div>
            <div class="rpt-field-group">
              <label for="reportCategory">الفئة</label>
              <select id="reportCategory">
                ${["الكل", "نسائي", "رجالي", "أطفال", "إكسسوارات"].map(c => `<option value="${c}" ${c === state._reportCategory ? "selected" : ""}>${c}</option>`).join("")}
              </select>
            </div>
            <div class="rpt-field-group">
              <label for="reportPayment">طريقة الدفع</label>
              <select id="reportPayment">
                ${["الكل", "نقدا", "بطاقة", "تحويل", "مختلط", "آجل"].map(m => `<option value="${m}" ${m === state._reportPayment ? "selected" : ""}>${m}</option>`).join("")}
              </select>
            </div>
            <div class="rpt-field-group">
              <label for="reportCustomer">العميل</label>
              <select id="reportCustomer">
                ${customerOptionsHtml()}
              </select>
            </div>
            <div class="rpt-field-group">
              <label for="reportQuery">بحث في الأصناف / SKU</label>
              <input type="text" id="reportQuery" value="${escapeAttr(state._reportQuery || "")}" placeholder="بحث بالاسم أو SKU...">
            </div>
            <button class="rpt-filter-reset-btn" id="reportClearFilters" type="button" title="إعادة ضبط الفلاتر">
              <span>✕</span> مسح الفلاتر
            </button>
          </div>

          ${rptActiveTagsHtml()}
        </section>

        <!-- بطاقات المؤشرات الحية Dynamic KPIs -->
        ${rptKpiGridHtml(currentType)}

        <!-- قسم التحليلات البصرية Visual Analytics -->
        ${rptVisualSectionHtml(currentType)}

        <!-- جدول البيانات التفاعلي -->
        ${rptDataTableSectionHtml(currentType)}
      </div>
    `;
  }

  function reportGeneratedAt() {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date());
  }

  function reportPeriodLabel() {
    if (state._reportFrom && state._reportTo) {
      if (state._reportFrom === state._reportTo) return `يوم ${state._reportFrom}`;
      return `من ${state._reportFrom} إلى ${state._reportTo}`;
    }
    if (state._reportFrom) return `من ${state._reportFrom} حتى الآن`;
    if (state._reportTo) return `حتى ${state._reportTo}`;
    return "كامل السجلات (بدون تحديد)";
  }

  function activePresetKey() {
    const today = new Date();
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const todayStr = iso(today);
    if (!state._reportFrom && !state._reportTo) return "all";
    if (state._reportFrom === todayStr && state._reportTo === todayStr) return "today";
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    const yestStr = iso(yest);
    if (state._reportFrom === yestStr && state._reportTo === yestStr) return "yesterday";
    const d7 = new Date(); d7.setDate(d7.getDate() - 6);
    if (state._reportFrom === iso(d7) && state._reportTo === todayStr) return "week";
    const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (state._reportFrom === iso(mStart) && state._reportTo === todayStr) return "month";
    const d30 = new Date(); d30.setDate(d30.getDate() - 29);
    if (state._reportFrom === iso(d30) && state._reportTo === todayStr) return "month30";
    const yStart = new Date(today.getFullYear(), 0, 1);
    if (state._reportFrom === iso(yStart) && state._reportTo === todayStr) return "year";
    return "";
  }

  function rptActiveTagsHtml() {
    const tags = [];
    if (state._reportFrom || state._reportTo) {
      tags.push(`📅 النطاق: ${reportPeriodLabel()}`);
    }
    if (state._reportCategory && state._reportCategory !== "الكل") tags.push(`🏷️ الفئة: ${state._reportCategory}`);
    if (state._reportPayment && state._reportPayment !== "الكل") tags.push(`💳 طريقة الدفع: ${state._reportPayment}`);
    if (state._reportCustomer && state._reportCustomer !== "الكل") tags.push(`👤 العميل: ${state._reportCustomer}`);
    if (state._reportQuery) tags.push(`🔍 البحث: "${escapeHtml(state._reportQuery)}"`);

    if (!tags.length) return "";
    return `
      <div class="rpt-active-tags">
        <span style="font-size:12px;font-weight:bold;color:var(--muted)">الفلاتر النشطة:</span>
        ${tags.map(t => `<span class="rpt-active-tag">${t}</span>`).join("")}
      </div>
    `;
  }

  function customerOptionsHtml() {
    const unique = new Set(state.sales.map(s => s.customerName?.trim()).filter(Boolean));
    state.customers.forEach(c => { if (c.name) unique.add(c.name.trim()); });
    return ["الكل", ...Array.from(unique)].map(c => `
      <option value="${c}" ${c === state._reportCustomer ? "selected" : ""}>${c}</option>
    `).join("");
  }

  function filteredReportProducts() {
    let list = activeProducts();
    if (state._reportCategory && state._reportCategory !== "الكل") {
      list = list.filter(p => p.category === state._reportCategory);
    }
    if (state._reportQuery) {
      const q = state._reportQuery.trim().toLowerCase();
      list = list.filter(p => `${p.name} ${p.sku || ""}`.toLowerCase().includes(q));
    }
    return list;
  }

  /* --- توليد بطاقات KPI الديناميكية --- */
  function rptKpiGridHtml(type) {
    const stats = getStats();
    const sales = getFilteredSales();
    const pl = getPLData(sales, getExpensesByRange(state._reportFrom, state._reportTo));

    let kpis = [];

    if (type === "summary") {
      const marginPct = stats.allSales > 0 ? Math.round((stats.allProfit / stats.allSales) * 100) : 0;
      const avgInv = sales.length ? stats.allSales / sales.length : 0;
      kpis = [
        { title: "إجمالي المبيعات", val: formatMoney(stats.allSales), icon: "💰", sub: `صافي المبيعات لـ ${sales.length} فاتورة`, color: "var(--color-primary)" },
        { title: "صافي الأرباح", val: formatMoney(stats.allProfit), icon: "📈", sub: `هامش ربح إجمالي ${marginPct}%`, color: stats.allProfit >= 0 ? "var(--color-success)" : "var(--color-danger)" },
        { title: "متوسط الفاتورة", val: formatMoney(avgInv), icon: "🧾", sub: `إجمالي ${sales.length} فاتورة في النطاق`, color: "#2563EB" },
        { title: "القطع المباعة", val: `<span class="num">${stats.soldQty}</span> قطعة`, icon: "🛍️", sub: "إجمالي الكمية الخارجة من المخزون", color: "#C79A42" }
      ];
    } else if (type === "inventory") {
      const products = filteredReportProducts();
      const totalQty = products.reduce((s, p) => s + Number(p.quantity || 0), 0);
      const retailVal = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
      const costVal = products.reduce((s, p) => s + Number(p.cost || 0) * Number(p.quantity || 0), 0);
      const lowCount = products.filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0)).length;
      kpis = [
        { title: "إجمالي القطع في المخزون", val: `<span class="num">${totalQty}</span> قطعة`, icon: "📦", sub: `موزعة على ${products.length} صنف نشط`, color: "var(--color-primary)" },
        { title: "قيمة المخزون (سعر البيع)", val: formatMoney(retailVal), icon: "🏷️", sub: "الإيراد المتوقع عند تصريف المخزون", color: "#2563EB" },
        { title: "قيمة المخزون (سعر التكلفة)", val: formatMoney(costVal), icon: "💵", sub: "رأس المال المستثمر في البضاعة", color: "#C79A42" },
        { title: "أصناف تحت حد التنبيه", val: `<span class="num">${lowCount}</span> صنف`, icon: "⚠️", sub: lowCount > 0 ? "تحتاج لإعادة طلب وتوريد" : "المخزون بوضع ممتاز", color: lowCount > 0 ? "var(--color-danger)" : "var(--color-success)" }
      ];
    } else if (type === "lowstock") {
      const items = filteredReportProducts().filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0));
      const outCount = items.filter(p => Number(p.quantity || 0) <= 0).length;
      const missingUnits = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)), 0);
      const restockCost = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)) * Number(p.cost || 0), 0);
      kpis = [
        { title: "إجمالي النواقص والتنبيهات", val: `<span class="num">${items.length}</span> صنف`, icon: "⚠️", sub: "أصناف بلغت أو تجاوزت حد الأمان", color: "var(--color-danger)" },
        { title: "أصناف نفدت بالكامل (0)", val: `<span class="num">${outCount}</span> صنف`, icon: "🚫", sub: "نفدت من الرفوف وتحتاج توريد فوري", color: "#B91C1C" },
        { title: "القطع المطلوبة للأمان", val: `<span class="num">${missingUnits}</span> قطعة`, icon: "📥", sub: "للوصول للحد الأدنى المسموح", color: "#C79A42" },
        { title: "تكلفة إعادة التوريد التقديرية", val: formatMoney(restockCost), icon: "💳", sub: "سيولة مطلوبة لشراء النواقص", color: "var(--color-primary)" }
      ];
    } else if (type === "product-profit") {
      const profs = getProductProfitability();
      const rev = profs.reduce((s, p) => s + p.revenue, 0);
      const prf = profs.reduce((s, p) => s + p.profit, 0);
      const qty = profs.reduce((s, p) => s + p.qty, 0);
      const margin = rev > 0 ? Math.round((prf / rev) * 100) : 0;
      kpis = [
        { title: "إجمالي إيراد الأصناف", val: formatMoney(rev), icon: "💎", sub: `مبيعات ${profs.length} صنف مباع`, color: "var(--color-primary)" },
        { title: "صافي ربح الأصناف", val: formatMoney(prf), icon: "💰", sub: `هامش ربح إجمالي ${margin}%`, color: prf >= 0 ? "var(--color-success)" : "var(--color-danger)" },
        { title: "القطع المباعة", val: `<span class="num">${qty}</span> قطعة`, icon: "🛍️", sub: "إجمالي كميات المبيعات للأصناف", color: "#2563EB" },
        { title: "أعلى صنف ربحية", val: profs[0]?.name || "—", icon: "🏆", sub: profs[0] ? `صافي ربح ${formatMoney(profs[0].profit)}` : "لا توجد بيانات", color: "#C79A42" }
      ];
    } else if (type === "top") {
      const topItems = topProductsByQty();
      const totalQty = topItems.reduce((s, p) => s + p.value, 0);
      kpis = [
        { title: "الأكثر مبيعاً الأول", val: topItems[0]?.label || "—", icon: "🏆", sub: topItems[0] ? `${topItems[0].value} قطعة مباعة` : "لا توجد بيانات", color: "#C79A42" },
        { title: "إجمالي قطع الأوائل", val: `<span class="num">${totalQty}</span> قطعة`, icon: "📦", sub: `موزعة على أعلى ${topItems.length} صنف`, color: "var(--color-primary)" },
        { title: "عدد الأصناف المباعة", val: `<span class="num">${topItems.length}</span> صنف`, icon: "🏷️", sub: "حققت مبيعات في هذه الفترة", color: "#2563EB" },
        { title: "إجمالي المبيعات", val: formatMoney(stats.allSales), icon: "💵", sub: "الإيراد الكلي للفترة", color: "var(--color-success)" }
      ];
    } else if (type === "categories") {
      const cats = totalsByCategory();
      const totalCatRev = cats.reduce((s, c) => s + c.value, 0);
      kpis = [
        { title: "الفئة الأكثر إيراداً", val: cats[0]?.label || "—", icon: "🏷️", sub: cats[0] ? `إيراد ${formatMoney(cats[0].value)}` : "لا توجد بيانات", color: "var(--color-primary)" },
        { title: "إجمالي إيراد الفئات", val: formatMoney(totalCatRev), icon: "💰", sub: `موزع على ${cats.length} فئات نشطة`, color: "#2563EB" },
        { title: "عدد الفئات النشطة", val: `<span class="num">${cats.length}</span> فئة`, icon: "📊", sub: "فئات ملابس تم البيع منها", color: "#C79A42" },
        { title: "صافي أرباح المتجر", val: formatMoney(stats.allProfit), icon: "📈", sub: "صافي العائد للفترة", color: "var(--color-success)" }
      ];
    } else if (type === "margins") {
      const margins = getProfitMargins();
      const avgM = margins.length ? Math.round(margins.reduce((s, m) => s + m.value, 0) / margins.length) : 0;
      kpis = [
        { title: "متوسط هامش الربح", val: `<span class="num">${avgM}%</span>`, icon: "📈", sub: "متوسط الربحية عبر الفئات", color: "var(--color-success)" },
        { title: "أعلى فئة هامشاً", val: margins[0] ? `${margins[0].label} (${margins[0].value}%)` : "—", icon: "💎", sub: "أفضل عائد ربحي مباشر", color: "var(--color-primary)" },
        { title: "أدنى فئة هامشاً", val: margins.length ? `${margins[margins.length - 1].label} (${margins[margins.length - 1].value}%)` : "—", icon: "📉", sub: "قد تحتاج مراجعة الأسعار", color: "#C79A42" },
        { title: "مجمل الربح", val: formatMoney(stats.allProfit), icon: "💵", sub: "إجمالي الربح المحقق", color: "#2563EB" }
      ];
    } else if (type === "hourly") {
      const hourly = getHourlySales();
      const peak = hourly[0];
      const totalH = hourly.reduce((s, h) => s + h.value, 0);
      kpis = [
        { title: "ساعة الذروة الأولى", val: peak?.label || "—", icon: "🕐", sub: peak ? `مبيعات بلغت ${formatMoney(peak.value)}` : "لا توجد بيانات", color: "#C79A42" },
        { title: "إجمالي مبيعات الساعات", val: formatMoney(totalH), icon: "💰", sub: `موزعة على ${sales.length} عملية بيع`, color: "var(--color-primary)" },
        { title: "متوسط البيع بالساعة", val: formatMoney(hourly.length ? totalH / hourly.length : 0), icon: "⚡", sub: "متوسط الساعات النشطة", color: "#2563EB" },
        { title: "عدد الفواتير", val: `<span class="num">${sales.length}</span> فاتورة`, icon: "🧾", sub: "حجم حركة الكاشير", color: "var(--color-success)" }
      ];
    } else if (type === "payments") {
      const payStats = getPaymentStats();
      const totalPay = payStats.reduce((s, p) => s + p.total, 0);
      const topPay = payStats[0];
      kpis = [
        { title: "وسيلة الدفع الأكثر استخداماً", val: topPay?.method || "—", icon: "💳", sub: topPay ? `إيراد ${formatMoney(topPay.total)} (${topPay.count} فاتورة)` : "لا توجد بيانات", color: "var(--color-primary)" },
        { title: "إجمالي التحصيلات", val: formatMoney(totalPay), icon: "💵", sub: `موزعة على ${payStats.length} وسيلة دفع`, color: "#2563EB" },
        { title: "عدد العمليات الإجمالي", val: `<span class="num">${payStats.reduce((s, p) => s + p.count, 0)}</span> عملية`, icon: "🧾", sub: "عمليات تحصيل معتمدة", color: "#C79A42" },
        { title: "متوسط قيمة العملية", val: formatMoney(sales.length ? totalPay / sales.length : 0), icon: "📊", sub: "متوسط السلة لكل طريقة دفع", color: "var(--color-success)" }
      ];
    } else if (type === "customers") {
      const topCust = getTopCustomers();
      const totalCustSpend = topCust.reduce((s, c) => s + c.total, 0);
      kpis = [
        { title: "العميل الأكثر شراءً", val: topCust[0]?.name || "—", icon: "👥", sub: topCust[0] ? `إجمالي مشتريات ${formatMoney(topCust[0].total)}` : "لا توجد بيانات", color: "var(--color-primary)" },
        { title: "إجمالي مشتريات كبار العملاء", val: formatMoney(totalCustSpend), icon: "💎", sub: `موزعة على أعلى ${topCust.length} عملاء`, color: "#2563EB" },
        { title: "عدد الفواتير المنفذة لهم", val: `<span class="num">${topCust.reduce((s, c) => s + c.count, 0)}</span> فاتورة`, icon: "🧾", sub: "معدل تكرار الزيارة والشراء", color: "#C79A42" },
        { title: "متوسط سلة كبار العملاء", val: formatMoney(topCust.length ? totalCustSpend / topCust.length : 0), icon: "🛍️", sub: "القيمة المتوسطة لمشتريات العميل", color: "var(--color-success)" }
      ];
    } else if (type === "pl") {
      kpis = [
        { title: "إجمالي الإيرادات (المبيعات)", val: formatMoney(pl.revenue), icon: "💰", sub: `قيمة بضاعة ${pl.salesCount} فاتورة`, color: "var(--color-primary)" },
        { title: "تكلفة البضاعة المباعة (COGS)", val: formatMoney(pl.cost), icon: "📦", sub: "تكلفة شراء الأصناف المباعة", color: "#C79A42" },
        { title: "المصروفات التشغيلية", val: formatMoney(pl.expenses), icon: "📉", sub: "إيجار، رواتب، كهرباء ونثريات", color: "var(--color-danger)" },
        { title: "صافي الأرباح النهائي", val: formatMoney(pl.netProfit), icon: "🏆", sub: pl.netProfit >= 0 ? "صافي أرباح تشغيلية محققة" : "صافي خسارة تشغيلية", color: pl.netProfit >= 0 ? "var(--color-success)" : "var(--color-danger)" }
      ];
    }

    return `
      <div class="rpt-kpi-grid">
        ${kpis.map(k => `
          <div class="rpt-kpi-card" style="--kpi-accent:${k.color}">
            <div class="rpt-kpi-top">
              <span class="rpt-kpi-title">${k.title}</span>
              <div class="rpt-kpi-icon" style="--kpi-accent:${k.color};--kpi-soft:${k.color}18">${k.icon}</div>
            </div>
            <div class="rpt-kpi-val">${k.val}</div>
            <div class="rpt-kpi-footer">${k.sub}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  /* --- قسم المخططات والتحليلات البصرية --- */
  function rptVisualSectionHtml(type) {
    if (type === "summary") {
      const series = getDailySeries();
      const maxVal = Math.max(...series.map(s => s.sales), 1);
      const cats = totalsByCategory();
      const maxCat = Math.max(...cats.map(c => c.value), 1);
      return `
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:16px;">
          <div class="rpt-visual-card">
            <div class="rpt-card-header">
              <h3 class="rpt-card-title">📊 حركة المبيعات اليومية</h3>
              <small class="muted">${series.length} يوم نشط في النطاق</small>
            </div>
            ${series.length ? `
              <div class="rpt-col-chart">
                ${series.slice(-14).map(d => {
                  const pct = Math.round((d.sales / maxVal) * 100);
                  return `
                    <div class="rpt-col-item">
                      <div class="rpt-col-val">${Math.round(d.sales)}</div>
                      <div class="rpt-col-bar ${pct >= 80 ? "peak" : ""}" style="height:${Math.max(6, pct)}%" title="${d.date}: ${formatMoney(d.sales)}"></div>
                      <div class="rpt-col-label">${d.date.slice(5)}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : `<div class="rpt-empty-state"><p>لا توجد مبيعات مسجلة في هذا النطاق.</p></div>`}
          </div>

          <div class="rpt-visual-card">
            <div class="rpt-card-header">
              <h3 class="rpt-card-title">🏷️ توزيع الإيراد على الفئات</h3>
              <small class="muted">${cats.length} فئات مسجلة</small>
            </div>
            ${cats.length ? `
              <div class="rpt-bars-container">
                ${cats.map((c, i) => {
                  const pct = Math.round((c.value / maxCat) * 100);
                  const colorClass = i === 0 ? "gold" : i === 1 ? "success" : "";
                  return `
                    <div class="rpt-bar-item">
                      <div class="rpt-bar-labels">
                        <span>${c.label}</span>
                        <strong>${formatMoney(c.value)} (${pct}%)</strong>
                      </div>
                      <div class="rpt-bar-track">
                        <div class="rpt-bar-fill ${colorClass}" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : `<div class="rpt-empty-state"><p>لا توجد بيانات فئات في النطاق.</p></div>`}
          </div>
        </div>
      `;
    }

    if (type === "hourly") {
      const hourly = getHourlySales();
      const maxH = Math.max(...hourly.map(h => h.value), 1);
      return `
        <div class="rpt-visual-card">
          <div class="rpt-card-header">
            <h3 class="rpt-card-title">🕐 توزيع ساعات الذروة والنشاط</h3>
            <small class="muted">توزيع الإيراد الكلي على ساعات العمل</small>
          </div>
          ${hourly.length ? `
            <div class="rpt-bars-container">
              ${hourly.map((h, idx) => {
                const pct = Math.round((h.value / maxH) * 100);
                return `
                  <div class="rpt-bar-item">
                    <div class="rpt-bar-labels">
                      <span><strong>${h.label}</strong> ${idx === 0 ? "🔥 (ذروة)" : ""}</span>
                      <strong>${formatMoney(h.value)}</strong>
                    </div>
                    <div class="rpt-bar-track">
                      <div class="rpt-bar-fill ${idx === 0 ? "gold" : ""}" style="width:${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `<div class="rpt-empty-state"><p>لا توجد فواتير لتحديد ساعات الذروة.</p></div>`}
        </div>
      `;
    }

    if (type === "top" || type === "product-profit") {
      const profs = getProductProfitability().slice(0, 6);
      const maxRev = Math.max(...profs.map(p => p.revenue), 1);
      return `
        <div class="rpt-visual-card">
          <div class="rpt-card-header">
            <h3 class="rpt-card-title">🏆 الأصناف الأكثر إيراداً وربحية</h3>
            <small class="muted">أعلى 6 أصناف محققة للعوائد</small>
          </div>
          ${profs.length ? `
            <div class="rpt-bars-container">
              ${profs.map((p, i) => {
                const pct = Math.round((p.revenue / maxRev) * 100);
                return `
                  <div class="rpt-bar-item">
                    <div class="rpt-bar-labels">
                      <span><strong>#${i + 1}</strong> ${escapeHtml(p.name)} (${p.qty} قطعة)</span>
                      <span>إيراد <strong>${formatMoney(p.revenue)}</strong> | ربح <strong style="color:var(--color-success)">${formatMoney(p.profit)}</strong></span>
                    </div>
                    <div class="rpt-bar-track">
                      <div class="rpt-bar-fill ${i === 0 ? "gold" : ""}" style="width:${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `<div class="rpt-empty-state"><p>لا توجد أصناف مباعة في هذا النطاق.</p></div>`}
        </div>
      `;
    }

    if (type === "payments") {
      const payStats = getPaymentStats();
      const totalP = payStats.reduce((s, p) => s + p.total, 0) || 1;
      return `
        <div class="rpt-visual-card">
          <div class="rpt-card-header">
            <h3 class="rpt-card-title">💳 الحصة النسبية لطرق الدفع</h3>
            <small class="muted">نسبة التحصيل لكل وسيلة دفع</small>
          </div>
          ${payStats.length ? `
            <div class="rpt-bars-container">
              ${payStats.map((p, i) => {
                const pct = Math.round((p.total / totalP) * 100);
                return `
                  <div class="rpt-bar-item">
                    <div class="rpt-bar-labels">
                      <span><strong>${p.method}</strong> (${p.count} فاتورة)</span>
                      <strong>${formatMoney(p.total)} (${pct}%)</strong>
                    </div>
                    <div class="rpt-bar-track">
                      <div class="rpt-bar-fill ${i === 0 ? "gold" : ""}" style="width:${pct}%"></div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `<div class="rpt-empty-state"><p>لا توجد مدفوعات مسجلة.</p></div>`}
        </div>
      `;
    }

    if (type === "pl") {
      const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
      const totalIn = pl.revenue + pl.shipping;
      return `
        <div class="rpt-visual-card">
          <div class="rpt-card-header">
            <h3 class="rpt-card-title">⚖️ التدفق المالي: الإيرادات مقابل المصروفات والتكاليف</h3>
            <small class="muted">نظرة عامة على هيكل الربحية</small>
          </div>
          <div class="rpt-bars-container">
            <div class="rpt-bar-item">
              <div class="rpt-bar-labels">
                <span>➕ إجمالي الإيرادات الداخلة (مبيعات + شحن)</span>
                <strong style="color:var(--color-primary)">${formatMoney(totalIn)}</strong>
              </div>
              <div class="rpt-bar-track"><div class="rpt-bar-fill" style="width:100%"></div></div>
            </div>
            <div class="rpt-bar-item">
              <div class="rpt-bar-labels">
                <span>➖ تكلفة البضاعة المباعة (COGS)</span>
                <strong style="color:#C79A42">${formatMoney(pl.cost)}</strong>
              </div>
              <div class="rpt-bar-track"><div class="rpt-bar-fill gold" style="width:${totalIn > 0 ? Math.min(100, Math.round((pl.cost / totalIn) * 100)) : 0}%"></div></div>
            </div>
            <div class="rpt-bar-item">
              <div class="rpt-bar-labels">
                <span>➖ المصروفات التشغيلية والخصومات</span>
                <strong style="color:var(--color-danger)">${formatMoney(pl.expenses + pl.discount)}</strong>
              </div>
              <div class="rpt-bar-track"><div class="rpt-bar-fill danger" style="width:${totalIn > 0 ? Math.min(100, Math.round(((pl.expenses + pl.discount) / totalIn) * 100)) : 0}%"></div></div>
            </div>
            <div class="rpt-bar-item">
              <div class="rpt-bar-labels">
                <span>✅ صافي الربح التشغيلي</span>
                <strong style="color:${pl.netProfit >= 0 ? "var(--color-success)" : "var(--color-danger)"}">${formatMoney(pl.netProfit)}</strong>
              </div>
              <div class="rpt-bar-track"><div class="rpt-bar-fill ${pl.netProfit >= 0 ? "success" : "danger"}" style="width:${totalIn > 0 ? Math.min(100, Math.round((Math.abs(pl.netProfit) / totalIn) * 100)) : 0}%"></div></div>
            </div>
          </div>
        </div>
      `;
    }

    return "";
  }

  /* --- جدول البيانات التفاعلي المتقدم للتقارير --- */
  function rptDataTableSectionHtml(type) {
    const tableHtml = buildReportTableContent(type);
    return `
      <section class="rpt-table-card">
        <div class="rpt-table-toolbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <h3 style="margin:0;font-size:16px;font-weight:bold;color:var(--ink);">📋 تفاصيل وسجلات التقرير</h3>
            <span class="rpt-badge ok" id="rptRowCount">تحميل...</span>
          </div>
          <div class="rpt-table-search-box">
            <span class="search-icon">🔍</span>
            <input type="search" id="reportTableSearch" placeholder="تصفية نتائج الجدول الحالي..." value="${escapeAttr(_rptSearchState || "")}">
          </div>
        </div>
        <div class="rpt-table-wrap">
          ${tableHtml}
        </div>
      </section>
    `;
  }

  function buildReportTableContent(type) {
    switch (type) {
      case "inventory": return buildInventoryReportTable();
      case "lowstock": return buildLowStockReportTable();
      case "product-profit": return buildProductProfitReportTable();
      case "top": return buildTopReportTable();
      case "categories": return buildCategoriesReportTable();
      case "margins": return buildMarginsReportTable();
      case "hourly": return buildHourlyReportTable();
      case "payments": return buildPaymentsReportTable();
      case "customers": return buildCustomersReportTable();
      case "pl": return buildPLReportTable();
      default: return buildSummaryReportTable();
    }
  }

  /* --- دوال بناء جداول كل تقرير --- */
  function buildSummaryReportTable() {
    const series = getDailySeries();
    const totalSales = series.reduce((s, d) => s + d.sales, 0);
    const totalProfit = series.reduce((s, d) => s + d.profit, 0);

    if (!series.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">📊</span><p>لا توجد حركات مبيعات في هذه الفترة.</p></div>`;
    }

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th data-rpt-sort="date" data-rpt-table="summary">التاريخ <span class="sort-icon">↕</span></th>
            <th data-rpt-sort="sales" data-rpt-table="summary">إجمالي المبيعات <span class="sort-icon">↕</span></th>
            <th data-rpt-sort="profit" data-rpt-table="summary">صافي الربح <span class="sort-icon">↕</span></th>
            <th>هامش الربح %</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${series.map(d => {
            const margin = d.sales > 0 ? Math.round((d.profit / d.sales) * 100) : 0;
            return `
              <tr>
                <td><strong>${d.date}</strong></td>
                <td><strong class="num">${moneyFormatter.format(d.sales)} ${state.settings.currency}</strong></td>
                <td><strong class="num" style="color:${d.profit >= 0 ? "var(--color-success)" : "var(--color-danger)"}">${moneyFormatter.format(d.profit)} ${state.settings.currency}</strong></td>
                <td><span class="rpt-badge ${margin >= 20 ? "ok" : "warn"}">${margin}%</span></td>
                <td><span class="rpt-badge ok">نشط</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي العام (${series.length} يوم)</td>
            <td>${formatMoney(totalSales)}</td>
            <td>${formatMoney(totalProfit)}</td>
            <td>${totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0}%</td>
            <td>—</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildInventoryReportTable() {
    const products = filteredReportProducts();
    if (!products.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">📦</span><p>لا توجد أصناف مطابقة لفلاتر المخزون.</p></div>`;
    }

    const totalQty = products.reduce((s, p) => s + Number(p.quantity || 0), 0);
    const totalRetail = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th data-rpt-sort="name" data-rpt-table="inventory">الصنف <span class="sort-icon">↕</span></th>
            <th>SKU</th>
            <th data-rpt-sort="category" data-rpt-table="inventory">الفئة <span class="sort-icon">↕</span></th>
            <th data-rpt-sort="quantity" data-rpt-table="inventory">الكمية المتوفرة <span class="sort-icon">↕</span></th>
            <th>سعر البيع</th>
            <th>التكلفة</th>
            <th data-rpt-sort="retailVal" data-rpt-table="inventory">قيمة المخزون (بيع) <span class="sort-icon">↕</span></th>
            <th>حالة المخزون</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const isLow = Number(p.quantity || 0) <= Number(p.lowStock || 0);
            const isOut = Number(p.quantity || 0) <= 0;
            const rVal = Number(p.price || 0) * Number(p.quantity || 0);
            return `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td><code>${escapeHtml(p.sku || "—")}</code></td>
                <td><span class="rpt-badge">${escapeHtml(p.category || "عام")}</span></td>
                <td><strong class="num" style="color:${isOut ? "var(--color-danger)" : isLow ? "var(--color-warning)" : "var(--ink)"}">${p.quantity}</strong></td>
                <td>${formatMoney(p.price)}</td>
                <td>${formatMoney(p.cost)}</td>
                <td><strong>${formatMoney(rVal)}</strong></td>
                <td>
                  <span class="rpt-badge ${isOut ? "danger" : isLow ? "warn" : "ok"}">
                    ${isOut ? "نفد" : isLow ? "منخفض" : "متوفر"}
                  </span>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي (${products.length} صنف)</td>
            <td>—</td>
            <td>—</td>
            <td>${totalQty} قطعة</td>
            <td>—</td>
            <td>—</td>
            <td>${formatMoney(totalRetail)}</td>
            <td>—</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildLowStockReportTable() {
    const items = filteredReportProducts().filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0));
    if (!items.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">✅</span><p>رائع! لا توجد نواقص أو أصناف تحت حد التنبيه حالياً.</p></div>`;
    }

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الصنف</th>
            <th>SKU</th>
            <th>الفئة</th>
            <th>المتبقي</th>
            <th>حد التنبيه</th>
            <th>النقص بالقطع</th>
            <th>التكلفة التقديرية للتوريد</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(p => {
            const isOut = Number(p.quantity || 0) <= 0;
            const missing = Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0));
            const cost = missing * Number(p.cost || 0);
            return `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td><code>${escapeHtml(p.sku || "—")}</code></td>
                <td><span class="rpt-badge">${escapeHtml(p.category || "عام")}</span></td>
                <td><strong class="num" style="color:var(--color-danger)">${p.quantity}</strong></td>
                <td><span class="num">${p.lowStock}</span></td>
                <td><strong class="num" style="color:var(--color-danger)">${missing}</strong></td>
                <td>${formatMoney(cost)}</td>
                <td><span class="rpt-badge ${isOut ? "danger" : "warn"}">${isOut ? "نافد تماماً" : "مخزون حرج"}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي (${items.length} تنبيه)</td>
            <td>—</td>
            <td>—</td>
            <td>${items.reduce((s, p) => s + Number(p.quantity || 0), 0)} قطعة</td>
            <td>—</td>
            <td>${items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)), 0)} قطعة</td>
            <td>${formatMoney(items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)) * Number(p.cost || 0), 0))}</td>
            <td>—</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildProductProfitReportTable() {
    const rows = getProductProfitability();
    if (!rows.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">💎</span><p>لا توجد مبيعات أصناف في هذا النطاق.</p></div>`;
    }

    const totalQty = rows.reduce((s, p) => s + p.qty, 0);
    const totalRev = rows.reduce((s, p) => s + p.revenue, 0);
    const totalCost = rows.reduce((s, p) => s + p.cost, 0);
    const totalProfit = rows.reduce((s, p) => s + p.profit, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th data-rpt-sort="name" data-rpt-table="product-profit">الصنف <span class="sort-icon">↕</span></th>
            <th data-rpt-sort="qty" data-rpt-table="product-profit">القطع المباعة <span class="sort-icon">↕</span></th>
            <th data-rpt-sort="revenue" data-rpt-table="product-profit">إجمالي الإيراد <span class="sort-icon">↕</span></th>
            <th>إجمالي التكلفة</th>
            <th data-rpt-sort="profit" data-rpt-table="product-profit">صافي الربح <span class="sort-icon">↕</span></th>
            <th>الهامش %</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(p => `
            <tr>
              <td><strong>${escapeHtml(p.name)}</strong></td>
              <td><strong class="num">${p.qty}</strong></td>
              <td><strong>${formatMoney(p.revenue)}</strong></td>
              <td class="muted">${formatMoney(p.cost)}</td>
              <td><strong style="color:${p.profit >= 0 ? "var(--color-success)" : "var(--color-danger)"}">${formatMoney(p.profit)}</strong></td>
              <td><span class="rpt-badge ${p.margin >= 25 ? "ok" : "warn"}">${p.margin}%</span></td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي (${rows.length} صنف)</td>
            <td>${totalQty} قطعة</td>
            <td>${formatMoney(totalRev)}</td>
            <td>${formatMoney(totalCost)}</td>
            <td>${formatMoney(totalProfit)}</td>
            <td>${totalRev > 0 ? Math.round((totalProfit / totalRev) * 100) : 0}%</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildTopReportTable() {
    const rows = topProductsByQty();
    if (!rows.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">🏆</span><p>لا توجد مبيعات أصناف في هذا النطاق.</p></div>`;
    }

    const total = rows.reduce((s, p) => s + p.value, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الترتيب</th>
            <th>الصنف</th>
            <th>الكمية المباعة</th>
            <th>النسبة من الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((p, i) => {
            const share = total > 0 ? Math.round((p.value / total) * 100) : 0;
            return `
              <tr>
                <td><strong style="color:var(--color-primary)">#${i + 1}</strong></td>
                <td><strong>${escapeHtml(p.label)}</strong></td>
                <td><strong class="num">${p.value} قطعة</strong></td>
                <td><span class="rpt-badge ${i === 0 ? "ok" : ""}">${share}%</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي</td>
            <td>${rows.length} صنف متصدر</td>
            <td>${total} قطعة</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildCategoriesReportTable() {
    const cats = totalsByCategory();
    if (!cats.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">🏷️</span><p>لا توجد مبيعات فئات في هذا النطاق.</p></div>`;
    }

    const total = cats.reduce((s, c) => s + c.value, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الفئة</th>
            <th>إجمالي الإيراد</th>
            <th>النسبة المئوية %</th>
          </tr>
        </thead>
        <tbody>
          ${cats.map((c, i) => {
            const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
            return `
              <tr>
                <td><strong>${escapeHtml(c.label)}</strong></td>
                <td><strong>${formatMoney(c.value)}</strong></td>
                <td><span class="rpt-badge ${i === 0 ? "ok" : ""}">${pct}%</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي (${cats.length} فئات)</td>
            <td>${formatMoney(total)}</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildMarginsReportTable() {
    const margins = getProfitMargins();
    if (!margins.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">📈</span><p>لا توجد بيانات هوامش في هذا النطاق.</p></div>`;
    }

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الفئة</th>
            <th>هامش الربح %</th>
            <th>التقييم</th>
          </tr>
        </thead>
        <tbody>
          ${margins.map(m => `
            <tr>
              <td><strong>${escapeHtml(m.label)}</strong></td>
              <td><strong class="num" style="color:${m.value >= 30 ? "var(--color-success)" : "var(--color-primary)"}">${m.display}</strong></td>
              <td><span class="rpt-badge ${m.value >= 30 ? "ok" : m.value >= 15 ? "warn" : "danger"}">${m.value >= 30 ? "ممتاز" : m.value >= 15 ? "جيد" : "منخفض"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function buildHourlyReportTable() {
    const hourly = getHourlySales();
    if (!hourly.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">🕐</span><p>لا توجد مبيعات لتحديد الساعات.</p></div>`;
    }

    const total = hourly.reduce((s, h) => s + h.value, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الساعة</th>
            <th>المبيعات</th>
            <th>النسبة %</th>
          </tr>
        </thead>
        <tbody>
          ${hourly.map((h, i) => {
            const pct = total > 0 ? Math.round((h.value / total) * 100) : 0;
            return `
              <tr>
                <td><strong>${escapeHtml(h.label)}</strong></td>
                <td><strong>${formatMoney(h.value)}</strong></td>
                <td><span class="rpt-badge ${i === 0 ? "ok" : ""}">${pct}%</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي</td>
            <td>${formatMoney(total)}</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildPaymentsReportTable() {
    const stats = getPaymentStats();
    if (!stats.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">💳</span><p>لا توجد مدفوعات مسجلة.</p></div>`;
    }

    const totalRev = stats.reduce((s, p) => s + p.total, 0);
    const totalCount = stats.reduce((s, p) => s + p.count, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>طريقة الدفع</th>
            <th>عدد الفواتير</th>
            <th>إجمالي الإيراد</th>
            <th>النسبة %</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map((p, i) => {
            const pct = totalRev > 0 ? Math.round((p.total / totalRev) * 100) : 0;
            return `
              <tr>
                <td><strong>${escapeHtml(p.method)}</strong></td>
                <td><strong class="num">${p.count}</strong></td>
                <td><strong>${formatMoney(p.total)}</strong></td>
                <td><span class="rpt-badge ${i === 0 ? "ok" : ""}">${pct}%</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي</td>
            <td>${totalCount} عملية</td>
            <td>${formatMoney(totalRev)}</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildCustomersReportTable() {
    const rows = getTopCustomers();
    if (!rows.length) {
      return `<div class="rpt-empty-state"><span class="rpt-empty-icon">👥</span><p>لا توجد مبيعات عملاء في هذا النطاق.</p></div>`;
    }

    const totalInvoices = rows.reduce((s, c) => s + c.count, 0);
    const totalSpend = rows.reduce((s, c) => s + c.total, 0);

    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>الترتيب</th>
            <th>اسم العميل</th>
            <th>عدد الفواتير</th>
            <th>إجمالي المشتريات</th>
            <th>متوسط الفاتورة</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((c, i) => {
            const avg = c.count > 0 ? c.total / c.count : 0;
            return `
              <tr>
                <td><strong style="color:var(--color-primary)">#${i + 1}</strong></td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td><strong class="num">${c.count}</strong></td>
                <td><strong>${formatMoney(c.total)}</strong></td>
                <td>${formatMoney(avg)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>الإجمالي</td>
            <td>${rows.length} عميل</td>
            <td>${totalInvoices} فاتورة</td>
            <td>${formatMoney(totalSpend)}</td>
            <td>${formatMoney(totalInvoices > 0 ? totalSpend / totalInvoices : 0)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function buildPLReportTable() {
    const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
    return `
      <table class="rpt-data-table" data-engine-body>
        <thead>
          <tr>
            <th>البند المالي</th>
            <th>القيمة المالية</th>
            <th>النوع</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>إجمالي المبيعات (قيمة البضاعة)</strong></td>
            <td><strong class="num">${formatMoney(pl.revenue)}</strong></td>
            <td><span class="rpt-badge ok">إيراد</span></td>
          </tr>
          <tr>
            <td>الخصومات الممنوحة للعملاء</td>
            <td><strong class="num" style="color:var(--color-danger)">− ${formatMoney(pl.discount)}</strong></td>
            <td><span class="rpt-badge danger">خصم</span></td>
          </tr>
          <tr>
            <td>إيراد خدمات الشحن والتوصيل</td>
            <td><strong class="num" style="color:var(--color-primary)">+ ${formatMoney(pl.shipping)}</strong></td>
            <td><span class="rpt-badge ok">إيراد إضافي</span></td>
          </tr>
          <tr>
            <td>تكلفة البضاعة المباعة (COGS)</td>
            <td><strong class="num" style="color:#C79A42">− ${formatMoney(pl.cost)}</strong></td>
            <td><span class="rpt-badge warn">تكلفة أصلية</span></td>
          </tr>
          <tr style="background:rgba(15,118,110,0.06);">
            <td><strong>مجمل الربح (قبل المصروفات)</strong></td>
            <td><strong class="num" style="color:var(--color-primary)">${formatMoney(pl.gross - pl.discount + pl.shipping)}</strong></td>
            <td><span class="rpt-badge ok">مجمل</span></td>
          </tr>
          <tr>
            <td>المصروفات التشغيلية (إيجار، رواتب، إلخ)</td>
            <td><strong class="num" style="color:var(--color-danger)">− ${formatMoney(pl.expenses)}</strong></td>
            <td><span class="rpt-badge danger">مصروفات</span></td>
          </tr>
          <tr>
            <td>الضريبة المحصلة (أمانة للدولة)</td>
            <td><strong class="num">${formatMoney(pl.tax)}</strong></td>
            <td><span class="rpt-badge">ضريبة</span></td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="rpt-totals-row">
            <td>صافي الربح النهائي</td>
            <td style="font-size:16px;color:${pl.netProfit >= 0 ? "var(--color-success)" : "var(--color-danger)"} !important">${formatMoney(pl.netProfit)}</td>
            <td>${pl.netProfit >= 0 ? "✅ أرباح" : "⚠️ خسارة"}</td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  function applyReportTableFilter(query) {
    _rptSearchState = query;
    const body = document.querySelector("#app [data-engine-body] tbody");
    const count = document.getElementById("rptRowCount");
    if (!body) return;
    const q = (query || "").trim().toLowerCase();
    const rows = body.querySelectorAll("tr");
    let matchCount = 0;
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      const match = !q || text.includes(q);
      r.style.display = match ? "" : "none";
      if (match) matchCount++;
    });
    if (count) count.textContent = `${matchCount} سجل`;
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
                <span class="tpl-shot">
                  <span class="tpl-shot-page">${invoiceHtml(templatePreviewSale(), id)}</span>
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
    const bulkToggleBtn = document.getElementById("bulkToggleBtn");
    if (bulkToggleBtn) bulkToggleBtn.addEventListener("click", toggleBulkMode);
    const bulkSelectAll = document.getElementById("bulkSelectAllBtn");
    if (bulkSelectAll) bulkSelectAll.addEventListener("change", () => {
      state._bulkSel = {};
      if (bulkSelectAll.checked) {
        app.querySelectorAll("[data-bulk-check]").forEach(input => {
          state._bulkSel[input.dataset.bulkCheck] = true;
        });
      }
      render();
    });
    app.querySelectorAll("[data-bulk-check]").forEach(input => {
      input.addEventListener("change", () => {
        if (input.checked) state._bulkSel[input.dataset.bulkCheck] = true;
        else delete state._bulkSel[input.dataset.bulkCheck];
        render();
      });
    });
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
    if (bulkDeleteBtn) bulkDeleteBtn.addEventListener("click", () => {
      if (state.view === "customers") bulkDeleteCustomers();
      else if (state.view === "invoices") bulkDeleteInvoices();
    });
    const bulkCancelBtn = document.getElementById("bulkCancelBtn");
    if (bulkCancelBtn) bulkCancelBtn.addEventListener("click", clearBulkSelection);
    app.querySelectorAll("[data-bulk-id]").forEach(invoiceCardEl => {
      const bulkId = invoiceCardEl.dataset.bulkId;
      let longPressTimer = null;
      invoiceCardEl.addEventListener("pointerdown", event => {
        if (event.button !== 0 || event.target.closest("button") || event.target.closest("input")) return;
        longPressTimer = window.setTimeout(() => {
          bulkLongPressAt = Date.now();
          state._bulkMode = true;
          state._bulkSel[bulkId] = true;
          render();
        }, 480);
      });
      invoiceCardEl.addEventListener("pointerup", () => window.clearTimeout(longPressTimer));
      invoiceCardEl.addEventListener("pointercancel", () => window.clearTimeout(longPressTimer));
      invoiceCardEl.addEventListener("pointerleave", () => window.clearTimeout(longPressTimer));
      invoiceCardEl.addEventListener("click", event => {
        if (Date.now() - bulkLongPressAt < 650) return;
        if (event.target.closest("button") || event.target.closest("input")) return;
        if (!state._bulkMode) return;
        toggleBulkSelect(bulkId);
      });
    });

    const custBulkToggleBtn = document.getElementById("custBulkToggleBtn");
    if (custBulkToggleBtn) custBulkToggleBtn.addEventListener("click", toggleCustomerBulkMode);
    const custBulkSelectAll = document.getElementById("custBulkSelectAllBtn");
    if (custBulkSelectAll) custBulkSelectAll.addEventListener("change", () => {
      const visible = bulkVisibleCustomers();
      visible.forEach(customer => {
        if (custBulkSelectAll.checked) state._custBulkSel[customer.name] = true;
        else delete state._custBulkSel[customer.name];
      });
      render();
    });
    app.querySelectorAll("[data-cust-check]").forEach(input => {
      input.addEventListener("change", () => {
        if (input.checked) state._custBulkSel[input.dataset.custCheck] = true;
        else delete state._custBulkSel[input.dataset.custCheck];
        render();
      });
    });
    const tableSelectAll = document.querySelector("[data-cust-check-all-table]");
    if (tableSelectAll) tableSelectAll.addEventListener("change", () => {
      const visible = bulkVisibleCustomers();
      visible.forEach(customer => {
        if (tableSelectAll.checked) state._custBulkSel[customer.name] = true;
        else delete state._custBulkSel[customer.name];
      });
      render();
    });
    app.querySelectorAll("[data-cust-bulk-id]").forEach(customerEl => {
      const custName = customerEl.dataset.custBulkId;
      let custLongPressTimer = null;
      customerEl.addEventListener("pointerdown", event => {
        if (event.button !== 0 || event.target.closest("button") || event.target.closest("input")) return;
        custLongPressTimer = window.setTimeout(() => {
          bulkLongPressAt = Date.now();
          if (!state._custBulkMode) state._custBulkSel = {};
          state._custBulkMode = true;
          state._custBulkSel[custName] = true;
          render();
        }, 480);
      });
      customerEl.addEventListener("pointerup", () => window.clearTimeout(custLongPressTimer));
      customerEl.addEventListener("pointercancel", () => window.clearTimeout(custLongPressTimer));
      customerEl.addEventListener("pointerleave", () => window.clearTimeout(custLongPressTimer));
      customerEl.addEventListener("click", event => {
        if (Date.now() - bulkLongPressAt < 650) return;
        if (event.target.closest("button") || event.target.closest("input")) return;
        if (!state._custBulkMode) return;
        toggleCustomerBulkSelect(custName);
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

    app.querySelectorAll("[data-cart-inc]").forEach(button => installFastTap(button, () => changeCartQty(button.dataset.cartInc, 1)));
    app.querySelectorAll("[data-cart-dec]").forEach(button => installFastTap(button, () => changeCartQty(button.dataset.cartDec, -1)));
    app.querySelectorAll("[data-cart-remove]").forEach(button => installFastTap(button, () => removeFromCart(button.dataset.cartRemove)));

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
        if (Date.now() - bulkLongPressAt < 650) return;
        if (state._custBulkMode && button.hasAttribute("data-cust-open")) {
          toggleCustomerBulkSelect(button.dataset.custOpen || "");
          return;
        }
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
        if (state.view === "sale") render();
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

    // Modern Reports Event Bindings
    app.querySelectorAll("[data-set-report]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.report = state.report || {};
        state.report.type = btn.dataset.setReport;
        state.report.ready = false;
        state.report.loading = false;
        _rptSearchState = "";
        render();
        const typeInfo = reportTypes.find(t => t.id === state.report.type);
        if (typeInfo) toastMessage("تم التبديل إلى: " + typeInfo.label);
      });
    });

    app.querySelectorAll("[data-report-preset]").forEach(button => {
      button.addEventListener("click", () => applyReportPreset(button.dataset.reportPreset));
    });

    const rptDateFrom = document.getElementById("reportDateFrom");
    if (rptDateFrom) {
      rptDateFrom.addEventListener("change", e => {
        state._reportFrom = e.target.value || null;
        render();
      });
    }

    const rptDateTo = document.getElementById("reportDateTo");
    if (rptDateTo) {
      rptDateTo.addEventListener("change", e => {
        state._reportTo = e.target.value || null;
        render();
      });
    }

    const rptCategory = document.getElementById("reportCategory");
    if (rptCategory) {
      rptCategory.addEventListener("change", e => {
        state._reportCategory = e.target.value;
        render();
      });
    }

    const rptPayment = document.getElementById("reportPayment");
    if (rptPayment) {
      rptPayment.addEventListener("change", e => {
        state._reportPayment = e.target.value;
        render();
      });
    }

    const rptCustomer = document.getElementById("reportCustomer");
    if (rptCustomer) {
      rptCustomer.addEventListener("change", e => {
        state._reportCustomer = e.target.value;
        render();
      });
    }

    const rptQuery = document.getElementById("reportQuery");
    if (rptQuery) {
      let rptQTimer;
      rptQuery.addEventListener("input", e => {
        clearTimeout(rptQTimer);
        rptQTimer = setTimeout(() => {
          state._reportQuery = e.target.value.trim();
          render();
        }, 300);
      });
    }

    const clearReportFiltersBtn = document.getElementById("reportClearFilters");
    if (clearReportFiltersBtn) clearReportFiltersBtn.addEventListener("click", clearReportFilters);

    const exportReportPdf = document.getElementById("exportReportPdfBtn");
    if (exportReportPdf) exportReportPdf.addEventListener("click", exportReportAsPdf);

    const exportReportExcelBtn = document.getElementById("exportReportExcelBtn");
    if (exportReportExcelBtn) exportReportExcelBtn.addEventListener("click", exportReportExcel);

    const reportTableSearch = document.getElementById("reportTableSearch");
    if (reportTableSearch) {
      reportTableSearch.addEventListener("input", () => applyReportTableFilter(reportTableSearch.value));
      if (_rptSearchState) {
        reportTableSearch.value = _rptSearchState;
        applyReportTableFilter(_rptSearchState);
      }
    }

    app.querySelectorAll("[data-rpt-sort]").forEach(th => {
      const toggleSort = () => {
        const key = th.dataset.rptSort;
        const tableType = th.dataset.rptTable;
        const current = _rptSortState[tableType];
        _rptSortState[tableType] = current && current.key === key
          ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
          : { key, dir: "desc" };
        _rptGroupState[tableType] = false;
        render();
      };
      th.addEventListener("click", toggleSort);
      th.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleSort();
        }
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
    const product = state.products.find(item => item.id === id);
    if (!product) return;
    const ok = await confirmDialogPrompt(
      "حذف الصنف",
      `سيتم حذف الصنف «${product.name}» من الكتالوج. الفواتير والتقارير السابقة لن تتأثر. لا يمكن التراجع عن هذا الإجراء.`,
      "حذف"
    );
    if (!ok) return;
    const nextProducts = state.products.map(item => item.id === id
      ? { ...item, archived: true, updatedAt: new Date().toISOString() }
      : item);
    if (!(await commitState({ products: nextProducts }))) {
      await showStorageFullDialog();
      return;
    }
    productDialog.close();
    toastMessage("تم حذف الصنف");
    render();
  }

  function netSale(sale) {
    const returns = sale.returns || [];
    const returnAmount = returns.reduce((sum, ret) => sum + Number(ret.total || 0), 0);
    const grossQty = (sale.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const returnedQty = returns.reduce((sum, ret) => sum + (ret.items || []).reduce((acc, item) => acc + Number(item.qty || 0), 0), 0);
    const grossProfit = (sale.items || []).reduce((sum, item) => sum + (Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 0), 0);
    const returnedProfit = returns.reduce((sum, ret) => sum + (ret.items || []).reduce((acc, item) => acc + (Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 0), 0), 0);
    return {
      qty: Math.max(0, grossQty - returnedQty),
      returnAmount,
      total: Number(sale.total || 0) - returnAmount,
      profit: grossProfit - returnedProfit
    };
  }

  function returnedQtyByProduct(sale) {
    const map = {};
    (sale.returns || []).forEach(ret => (ret.items || []).forEach(item => {
      map[item.productId] = (map[item.productId] || 0) + Number(item.qty || 0);
    }));
    return map;
  }

  function saleReturnItems(sale) {
    const out = [];
    (sale.returns || []).forEach(ret => (ret.items || []).forEach(item => out.push(item)));
    return out;
  }

  function cartLineQty(productId) {
    const line = state.cart.find(item => item.productId === productId);
    return line ? Number(line.qty || 0) : 0;
  }

  function addToCart(productId) {
    const product = state.products.find(item => item.id === productId);
    if (!product) return;
    if (Number(product.quantity || 0) <= 0) {
      toastMessage("هذا الصنف غير متاح في المخزون");
      return;
    }
    const line = state.cart.find(item => item.productId === productId);
    if (cartLineQty(productId) + 1 > Number(product.quantity || 0)) {
      toastMessage(`الكمية المتاحة من «${product.name}» هي ${product.quantity} فقط`);
      return;
    }
    if (line) line.qty += 1;
    else state.cart.push({ productId, qty: 1 });
    saveSession();
    render();
  }

  function changeCartQty(productId, delta) {
    const line = state.cart.find(item => item.productId === productId);
    if (!line) return;
    const product = state.products.find(item => item.id === productId);
    const maxQty = product ? Number(product.quantity || 0) : 0;
    const next = Number(line.qty || 0) + delta;
    if (next <= 0) {
      removeFromCart(productId);
      return;
    }
    if (next > maxQty) {
      toastMessage(`الكمية المتاحة ${maxQty} فقط`);
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

  function calculateCartTotals(discount, shipping, taxFree) {
    const subtotal = state.cart.reduce((sum, line) => {
      const product = state.products.find(item => item.id === line.productId);
      return sum + (product ? Number(product.price || 0) * Number(line.qty || 0) : 0);
    }, 0);
    const safeDiscount = Math.min(Math.max(0, Number(discount || 0)), subtotal);
    const safeShipping = Math.max(0, Number(shipping || 0));
    const taxable = subtotal - safeDiscount;
    const tax = taxFree ? 0 : Math.round((taxable * (Number(state.settings.taxRate) || 0)) / 100 * 100) / 100;
    const total = Math.round((taxable + tax + safeShipping) * 100) / 100;
    return { subtotal, discount: safeDiscount, tax, shipping: safeShipping, total };
  }

  async function checkoutCart() {
    if (!state.cart.length) {
      toastMessage("السلة فارغة — أضف أصنافاً أولاً");
      return;
    }
    const discountInput = document.getElementById("discountAmount");
    const shippingInput = document.getElementById("shippingAmount");
    const customerNameInput = document.getElementById("customerName");
    const customerPhoneInput = document.getElementById("customerPhone");
    const paymentSelect = document.getElementById("paymentMethod");
    const taxFreeToggle = document.getElementById("taxFreeToggle");
    const discount = Math.max(0, Number(discountInput?.value || state._saleDiscount || 0));
    const shipping = Math.max(0, Number(shippingInput?.value || state._saleShipping || 0));
    const taxFree = !!taxFreeToggle?.checked;
    const totals = calculateCartTotals(discount, shipping, taxFree);
    const customerName = (customerNameInput?.value || "").trim();
    const customerPhone = (customerPhoneInput?.value || "").trim();
    const paymentMethod = paymentSelect?.value || "نقدا";
    if (paymentMethod === "آجل" && (!customerName || customerName === "عميل نقدي")) {
      toastMessage("الفاتورة الآجلة تحتاج إدخال اسم العميل");
      return;
    }
    const items = state.cart.map(line => {
      const product = state.products.find(item => item.id === line.productId);
      return {
        productId: line.productId,
        name: product.name,
        sku: product.sku || "",
        category: product.category || "غير مصنف",
        size: product.size || "",
        color: product.color || "",
        qty: Number(line.qty || 0),
        price: Number(product.price || 0),
        cost: Number(product.cost || 0),
        total: Math.round(Number(product.price || 0) * Number(line.qty || 0) * 100) / 100
      };
    });
    const nextProducts = state.products.map(product => {
      const soldQty = items.reduce((sum, item) => sum + (item.productId === product.id ? item.qty : 0), 0);
      return soldQty > 0 ? { ...product, quantity: Math.max(0, Number(product.quantity || 0) - soldQty) } : product;
    });
    let maxNum = 0;
    state.sales.forEach(s => {
      const m = /(\d+)\s*$/.exec(String(s.number || ""));
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    const sale = {
      id: cryptoRandomId("s"),
      number: `INV-${new Date().getFullYear()}-${String(maxNum + 1).padStart(4, "0")}`,
      date: new Date().toISOString(),
      customerName: customerName || "عميل نقدي",
      customerPhone,
      paymentMethod,
      taxRate: Number(state.settings.taxRate) || 14,
      discount: totals.discount,
      shipping: totals.shipping,
      subtotal: totals.subtotal,
      taxFree,
      tax: totals.tax,
      total: totals.total,
      items
    };
    if (!(await commitState({ products: nextProducts, sales: [...state.sales, sale] }))) {
      await showStorageFullDialog();
      return;
    }
    if (customerName && customerName !== "عميل نقدي") {
      ensureCustomerRegistered(customerName, customerPhone);
    }
    state.cart = [];
    state._saleDiscount = 0;
    state._saleShipping = 0;
    state._saleTaxFree = false;
    saveSession();
    render();
    showInvoice(sale.id);
    toastMessage(`تم إصدار فاتورة ${sale.number} بقيمة ${formatMoney(sale.total)}`);
  }

  function showInvoice(saleId) {
    const sale = state.sales.find(item => item.id === saleId);
    if (!sale) return;
    state.currentInvoiceId = saleId;
    invoicePrintArea.innerHTML = invoiceHtml(sale);
    invoiceDialog.showModal();
  }

  function formatDateDisplay(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date || "");
    return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  }

  function showToast(message) {
    toastMessage(message);
  }

  function invoiceStatusData(sale) {
    const returns = sale.returns || [];
    const net = netSale(sale);
    if (returns.length > 0 && net.total <= 0) {
      return { label: "مسترجع بالكامل", sub: "RETURNED", color: "#C53030", bg: "#fee2e2", kind: "refund" };
    }
    if (sale.paymentMethod === "آجل") {
      return { label: "مبيعات آجلة", sub: "آجل / غير مدفوع", color: "#d97706", bg: "#fef3c7", kind: "credit" };
    }
    return { label: "مدفوع بالكامل", sub: sale.paymentMethod || "نقداً", color: "#087F5B", bg: "#ecfdf5", kind: "paid" };
  }

  function invoiceStatusStampHtml(sale) {
    const st = invoiceStatusData(sale);
    return `<div class="invoice-stamp-container"><div class="invoice-stamp invoice-stamp-${st.kind}"><span>${escapeHtml(st.label)}</span><small>${escapeHtml(st.sub)}</small></div></div>`;
  }

  function code128Pattern(text) {
    const patterns = [
      "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
      "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
      "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
      "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
      "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
      "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
      "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
      "112412","122114","122411","142112","142211","241211","221114","411112","134111","111242",
      "121142","121241","114212","124112","124211","411212","421112","421211","212141","214121",
      "412121","111143","111341","131141","114113","114311","411113","411311","113141","114131",
      "311141","411131","211412","211214","211232","2331112"
    ];
    const str = String(text || "INV-0000");
    const indices = [104];
    let checksum = 104;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i) - 32;
      const val = code >= 0 && code <= 95 ? code : 0;
      indices.push(val);
      checksum += val * (i + 1);
    }
    indices.push(checksum % 103);
    indices.push(106);

    let patternStr = "";
    let totalModules = 0;
    for (const idx of indices) {
      const seg = patterns[idx] || patterns[0];
      patternStr += seg;
      for (let i = 0; i < seg.length; i++) totalModules += parseInt(seg[i], 10);
    }
    return { patternStr, totalModules };
  }

  function generateCode128Svg(text, height = 44, moduleWidth = 1.5) {
    const { patternStr, totalModules } = code128Pattern(text);
    const svgWidth = Math.ceil(totalModules * moduleWidth);
    let currentX = 0;
    let rects = "";

    for (let i = 0; i < patternStr.length; i++) {
      const w = parseInt(patternStr[i], 10) * moduleWidth;
      if (i % 2 === 0) {
        rects += `<rect x="${currentX.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="#0F172A"/>`;
      }
      currentX += w;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${height}" width="${svgWidth}" height="${height}" style="display:block;margin:0 auto;max-width:100%;height:auto;">${rects}</svg>`;
  }

  function code128CanvasNode(text, height = 34, moduleWidth = 1.4) {
    const { patternStr, totalModules } = code128Pattern(text);
    const shapes = [];
    let currentX = 0;
    for (let i = 0; i < patternStr.length; i++) {
      const w = parseInt(patternStr[i], 10) * moduleWidth;
      if (i % 2 === 0) {
        shapes.push({ type: "rect", x: +currentX.toFixed(2), y: 0, w: +w.toFixed(2), h: height, fill: "#0F172A" });
      }
      currentX += w;
    }
    const barNode = { canvas: shapes, width: Math.ceil(totalModules * moduleWidth), height };
    return {
      table: {
        widths: ["*", "auto", "*"],
        body: [[
          { text: "", border: [false, false, false, false] },
          barNode,
          { text: "", border: [false, false, false, false] }
        ]]
      },
      layout: {
        defaultBorder: false,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0
      }
    };
  }

    function amountInWords(value) {
    const amount = Math.round(Number(value || 0) * 100) / 100;
    if (!Number.isFinite(amount)) return "صفر";
    const ones = ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const underThousand = number => {
      if (number < 10) return ones[number];
      if (number < 20) return teens[number - 10];
      if (number < 100) return number % 10 ? `${ones[number % 10]} و${tens[Math.floor(number / 10)]}` : tens[number / 10];
      const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
      const rest = number % 100;
      return rest ? `${hundreds[Math.floor(number / 100)]} و${underThousand(rest)}` : hundreds[Math.floor(number / 100)];
    };
    const integer = Math.floor(Math.abs(amount));
    const fraction = Math.round((Math.abs(amount) - integer) * 100);
    const groups = [];
    if (integer >= 1000000) {
      const millions = Math.floor(integer / 1000000);
      groups.push(`${underThousand(millions)} ${millions === 1 ? "مليون" : "ملايين"}`);
    }
    const thousands = Math.floor((integer % 1000000) / 1000);
    if (thousands) groups.push(`${underThousand(thousands)} ألف`);
    const remainder = integer % 1000;
    if (remainder || !groups.length) groups.push(underThousand(remainder));
    const prefix = amount < 0 ? "سالب " : "";
    const currency = state.settings.currency || "ج.م";
    return `${prefix}${groups.join(" و")} ${currency}${fraction ? ` و${underThousand(fraction)} قرش` : ""}`;
  }

  function companyInfoLines() {
    const settings = state.settings || {};
    return [
      settings.companyPhone ? `هاتف: ${settings.companyPhone}` : "",
      settings.companyAddress || "",
      settings.commercialNumber ? `س.ت: ${settings.commercialNumber}` : "",
      settings.taxNumber ? `ر.ض: ${settings.taxNumber}` : ""
    ].filter(Boolean);
  }

  function docAccent() {
    return state.settings.docColor || state.settings.accent || "#075E54";
  }

  function invoiceHtml(sale, templateId) {

    const tpl = INVOICE_TEMPLATES[templateId] || INVOICE_TEMPLATES[state.settings.invoiceTemplate] || INVOICE_TEMPLATES.classic;
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
      grandColor = bg && !isDarkHex(bg) ? "#0F172A" : (tpl.grandText || "#ffffff");
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
      <article class="invoice-paper" data-template="${templateId || state.settings.invoiceTemplate}" style="--inv-accent:${invAccent};position:relative;print-color-adjust:exact;-webkit-print-color-adjust:exact;">
        ${invoiceStatusStampHtml(sale)}
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
          <div class="scannable-barcode" style="margin:8px 0;width:100%;">
            ${generateCode128Svg(sale.number, 44, 1.5)}
          </div>
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

  let _tplPreviewSale = null;
  function templatePreviewSale() {
    if (_tplPreviewSale) return _tplPreviewSale;
    const mk = (index, name, sku, size, color, qty, price) => ({
      productId: `tpl-preview-${index}`,
      name,
      sku,
      category: "عرض",
      size,
      color,
      qty,
      price,
      cost: Math.round(price * 0.6 * 100) / 100,
      total: Math.round(price * qty * 100) / 100
    });
    const items = [
      mk(1, "فستان سواريه مطرز", "DR-0001", "M", "أسود", 1, 1250),
      mk(2, "قميص كتان صيفي", "SH-0002", "L", "أبيض", 2, 350)
    ];
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = 100;
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * 14) / 100;
    _tplPreviewSale = {
      id: "tpl-preview-sale",
      number: "INV-2026-0101",
      date: new Date().toISOString(),
      customerName: "عميل نقدي",
      customerPhone: "01000000000",
      paymentMethod: "نقدا",
      taxRate: 14,
      discount,
      shipping: 0,
      subtotal,
      taxFree: false,
      tax,
      total: Math.round((taxable + tax) * 100) / 100,
      items
    };
    return _tplPreviewSale;
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
    const prevTheme = document.documentElement.dataset.theme;
    const forcedLight = prevTheme === "dark";
    if (forcedLight) document.documentElement.dataset.theme = "light";
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return await html2canvas(node, {
        scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff"
      });
    } finally {
      if (forcedLight) document.documentElement.dataset.theme = prevTheme;
    }
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

  function thermalInvoiceHtml(sale, paperWidth) {
    const isNarrow = Number(paperWidth) === 58;
    const accent = docAccent();
    const net = netSale(sale);
    const returns = sale.returns || [];
    const st = invoiceStatusData(sale);
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
    if (net.returnAmount > 0) totalsRows.push(["المجموع المرتجع", `− ${fmt(net.returnAmount)}`, true]);

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

    return `<div class="thermal-receipt ${isNarrow ? "thermal-receipt-58mm" : "thermal-receipt-80mm"}" style="margin:0 auto;font-family:'Cairo',sans-serif;direction:rtl;color:#172033;background:#fff;padding:10px 12px;border:1px dashed #CBD5E1;border-radius:4px;">
      <div style="text-align:center;padding-bottom:6px;border-bottom:1.5px solid #172033;margin-bottom:6px;">
        ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" style="width:42px;height:42px;margin-bottom:4px;" onerror="this.style.display='none'">` : ""}
        <div style="font-size:14px;font-weight:700;color:${accent};">${escapeHtml(state.settings.storeName)}</div>
        <div style="font-size:9px;color:#94A3B8;">${escapeHtml(taglineText)}</div>
      </div>
      <div class="thermal-stamp" style="color:${st.color};border-color:${st.color};background:${st.bg};">${escapeHtml(st.label)} — ${escapeHtml(st.sub)}</div>
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
      <div style="text-align:center;margin:6px 0 2px;">
        ${generateCode128Svg(sale.number, isNarrow ? 30 : 36, isNarrow ? 1 : 1.25)}
        <div style="font-size:9px;letter-spacing:2px;color:#172033;font-weight:700;">${escapeHtml(sale.number)}</div>
      </div>
      ${companyLines.length || state.settings.invoiceFooter ? `<div style="border-top:1px solid #CBD5E1;margin-top:6px;padding-top:6px;text-align:center;font-size:8px;color:#374151;">${companyLines.length ? escapeHtml(companyLines.join(" | ")) : ""}${state.settings.invoiceFooter ? `<br>${escapeHtml(state.settings.invoiceFooter)}` : ""}</div>` : ""}
    </div>`;
  }

  function toggleThermalPreview() {
    const sale = state.sales.find(item => item.id === state.currentInvoiceId);
    if (!sale) return;
    const btn = document.getElementById("thermalPreviewToggle");
    const isCurrentlyThermal = invoicePrintArea.querySelector(".thermal-receipt");
    if (!isCurrentlyThermal) {
      state._thermalPreviewWidth = 80;
      invoicePrintArea.innerHTML = thermalInvoiceHtml(sale, 80);
      if (btn) btn.textContent = "معاينة حرارية 80";
      return;
    }
    if (Number(state._thermalPreviewWidth) === 80) {
      state._thermalPreviewWidth = 58;
      invoicePrintArea.innerHTML = thermalInvoiceHtml(sale, 58);
      if (btn) btn.textContent = "معاينة حرارية 58";
      return;
    }
    state._thermalPreviewWidth = null;
    invoicePrintArea.innerHTML = invoiceHtml(sale);
    if (btn) btn.textContent = "معاينة حرارية";
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

  function bulkSelectedSales() {
    return state.sales.filter(sale => state._bulkSel[sale.id]);
  }

  function bulkDeleteInvoices() {
    const selected = bulkSelectedSales();
    if (!selected.length) return;
    const summary = selected.reduce((acc, sale) => {
      const net = netSale(sale);
      acc.total += net.total;
      acc.qty += net.qty;
      return acc;
    }, { total: 0, qty: 0 });
    confirmDialogPrompt(
      `حذف ${selected.length} ${selected.length === 1 ? "فاتورة" : "فواتير"}`,
      `سيتم حذف ${selected.length} ${selected.length === 1 ? "فاتورة" : "فواتير"} وإرجاع ${summary.qty} قطع إلى المخزون.\n` +
      `الإجمالي المالي المرتبط: ${formatMoney(summary.total)}.\n` +
      `سوف ينخفض إجمالي المبيعات والأرباح، وتُنقص أرصدة العملاء الآجلة تلقائياً. سيتم أرشفة النسخ المحذوفة؛ لا يمكن التراجع.`,
      "حذف نهائي"
    ).then(async ok => {
      if (!ok) return;
      const nextProducts = state.products.map(product => {
        const backQty = selected.reduce((sum, sale) => {
          const returned = returnedQtyByProduct(sale);
          return sum + sale.items.reduce((acc, item) => {
            if (item.productId !== product.id) return acc;
            return acc + Math.max(0, Number(item.qty || 0) - (returned[item.productId] || 0));
          }, 0);
        }, 0);
        return backQty > 0 ? { ...product, quantity: Number(product.quantity || 0) + backQty } : product;
      });
      const now = new Date().toISOString();
      const archived = selected.map(sale => ({ ...sale, status: "cancelled", deletedAt: now, deletedBy: "المستخدم" }));
      const deletedIds = new Set(selected.map(sale => sale.id));
      const nextSales = state.sales.filter(sale => !deletedIds.has(sale.id));
      const nextDeleted = state.deletedSales.concat(archived);
      if (!(await commitState({ products: nextProducts, sales: nextSales, deletedSales: nextDeleted }))) {
        await showStorageFullDialog();
        return;
      }
      state._bulkSel = {};
      state._bulkMode = false;
      if (state.currentInvoiceId && deletedIds.has(state.currentInvoiceId)) state.currentInvoiceId = null;
      render();
      toastMessage(`تم حذف ${selected.length} ${selected.length === 1 ? "فاتورة" : "فواتير"} وإرجاع الكميات للمخزون`);
    });
  }

  function toggleBulkMode() {
    state._bulkMode = !state._bulkMode;
    if (!state._bulkMode) state._bulkSel = {};
    render();
  }

  function toggleCustomerBulkMode() {
    state._custBulkMode = !state._custBulkMode;
    if (!state._custBulkMode) state._custBulkSel = {};
    render();
  }

  function bulkVisibleCustomers() {
    const query = (state._custQuery || "").trim().toLowerCase();
    return sortCustomers(getCustomersData().filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      customer.code.toLowerCase().includes(query)
    ));
  }

  function toggleCustomerBulkSelect(name) {
    if (state._custBulkSel[name]) delete state._custBulkSel[name];
    else state._custBulkSel[name] = true;
    render();
  }

  function bulkDeleteCustomers() {
    const data = getCustomersData();
    const selected = Object.keys(state._custBulkSel).map(name => data.find(customer => customer.name === name)).filter(Boolean);
    if (!selected.length) return;
    const debtors = selected.filter(customer => customer.debt > 0);
    if (debtors.length) {
      const lines = debtors.map(customer => `• ${customer.name}: ${formatMoney(customer.debt)}`).join("\n");
      confirmDialogPrompt(
        "لا يمكن حذف عملاء مدينين",
        `لا يمكن حذف ${debtors.length} ${debtors.length === 1 ? "عميل" : "عملاء"} لأن عليهم مستحقات غير مسددة:\n\n${lines}\n\nسدّد الديون أولاً ثم أعد المحاولة.`,
        "فهمت"
      );
      return;
    }
    const count = selected.length;
    confirmDialogPrompt(
      `حذف ${count} ${count === 1 ? "عميل" : "عملاء"}`,
      `سيتم حذف ${count} ${count === 1 ? "عميل" : "عملاء"} من قاعدة عملاء المتجر وإخفاؤهم نهائياً.\n` +
      `تبقى فواتيرهم وتقارير المبيعات والأرباح كما هي دون تغيير، ولا يؤثر ذلك على المخزون.\n` +
      `لا يمكن التراجع عن هذا الإجراء.`,
      "حذف نهائي"
    ).then(async ok => {
      if (!ok) return;
      const names = new Set(selected.map(customer => customer.name));
      const nextCustomers = state.customers.map(record =>
        names.has(record.name) ? { ...record, archived: true } : record
      );
      selected.forEach(customer => {
        if (!customerRecord(customer.name)) {
          nextCustomers.push({
            id: cryptoRandomId("c"),
            code: customer.code || nextCustomerCode(),
            name: customer.name,
            phone: customer.phone || "",
            address: customer.address || "",
            photo: customer.photo || "",
            notes: customer.notes || "",
            discount: Number(customer.discount || 0),
            classification: customer.classification || "جديد",
            createdAt: customer.joinedAt || todayISO(),
            updatedAt: todayISO(),
            archived: true
          });
        }
      });
      if (!(await commitState({ customers: nextCustomers }))) {
        await showStorageFullDialog();
        return;
      }
      state._custBulkSel = {};
      state._custBulkMode = false;
      if (state._custOpen && names.has(state._custOpen)) state._custOpen = "";
      render();
      toastMessage(`تم حذف ${count} ${count === 1 ? "عميل" : "عملاء"} من قاعدة العملاء`);
    });
  }

  function toggleBulkSelect(id) {
    if (state._bulkSel[id]) delete state._bulkSel[id];
    else state._bulkSel[id] = true;
    render();
  }

  function clearBulkSelection() {
    if (state.view === "customers") {
      state._custBulkSel = {};
      state._custBulkMode = false;
    } else {
      state._bulkSel = {};
      state._bulkMode = false;
    }
    render();
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
    let src = logo;
    if (!logo.startsWith("data:")) {
      try {
        const response = await fetch(logo);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        src = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        return window.FALLBACK_LOGO || null;
      }
    }
    try {
      const image = new Image();
      image.src = src;
      await image.decode();
      const nativeW = image.naturalWidth || 1;
      const nativeH = image.naturalHeight || 1;
      const maxW = 800;
      const maxH = 240;
      const scale = Math.min(1, maxW / nativeW, maxH / nativeH);
      const width = Math.max(1, Math.round(nativeW * scale));
      const height = Math.max(1, Math.round(nativeH * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      const out = canvas.toDataURL("image/png");
      if (!out || !out.startsWith("data:image/png")) throw new Error("logo conversion failed");
      return out;
    } catch (err) {
      return window.FALLBACK_LOGO || null;
    }
  }

  async function resolveThumbForPdf(src, size = 60, name = "", shape = "square") {
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
      metaValueColor: "#0F172A",
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
      metaValueColor: "#0F172A",
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
      metaValueColor: "#0F172A",
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

  const PDF_DESIGN = {
    dark: "#0f172a",
    secondary: "#475569",
    muted: "#64748b",
    border: "#e2e8f0",
    softBorder: "#f1f5f9",
    background: "#f8fafc",
    danger: "#dc2626",
    white: "#ffffff"
  };

  function pdfTable(body, widths, opts = {}) {
    const node = {
      table: {
        headerRows: opts.headerRows || 0,
        widths: widths || (body && body[0] ? body[0].map(() => "*") : ["*"]),
        body: body || []
      }
    };
    if (opts.layout) node.layout = opts.layout;
    if (opts.margin) node.margin = opts.margin;
    if (opts.unbreakable) node.unbreakable = opts.unbreakable;
    return node;
  }

  function pdfTableLayoutPlain(lineColor) {
    const lColor = lineColor || PDF_DESIGN.border;
    return {
      defaultBorder: false,
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 0.6 : 0.4,
      hLineColor: () => lColor,
      vLineWidth: () => 0,
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 3,
      paddingBottom: () => 3
    };
  }

  function pdfMoneyParts(value, opts = {}) {
    const num = Number(value || 0);
    const formatted = typeof moneyFormatter !== "undefined" ? moneyFormatter.format(num) : num.toFixed(2);
    const curr = (typeof state !== "undefined" && state.settings && state.settings.currency) ? state.settings.currency : "";
    return [
      {
        text: formatted,
        bold: opts.bold !== false,
        fontSize: opts.size || 9.5,
        color: opts.color || PDF_DESIGN.dark
      },
      {
        text: curr ? ` ${curr}` : "",
        bold: false,
        fontSize: Math.max(6, (opts.size || 9.5) - 1.5),
        color: opts.currencyColor || (opts.color === PDF_DESIGN.danger ? PDF_DESIGN.danger : PDF_DESIGN.muted)
      }
    ];
  }

  function invoiceQrText(sale) {
    if (!sale) return "";
    const store = (typeof state !== "undefined" && state.settings && state.settings.storeName) || "Abo Omar Store";
    const num = sale.number || "";
    const date = sale.date ? dateTime(sale.date) : new Date().toISOString();
    const net = typeof netSale === "function" ? netSale(sale) : { total: sale.total || 0 };
    const total = typeof moneyFormatter !== "undefined" ? moneyFormatter.format(Number(net.total || 0)) : Number(net.total || 0).toFixed(2);
    const curr = (typeof state !== "undefined" && state.settings && state.settings.currency) || "";
    return `فاتورة: ${num}\nالمتجر: ${store}\nالتاريخ: ${date}\nالمجموع: ${total} ${curr}`;
  }

  async function qrDataUrl(text, size = 200) {
    if (!text) return null;
    if (typeof window !== "undefined" && !window.qrcode) {
      try {
        await loadScriptList([
          "assets/vendor/qrcode.min.js",
          "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"
        ]);
      } catch (e) {
        console.warn("Could not load qrcode library:", e);
      }
    }
    const qrcodeFn = typeof window !== "undefined" ? window.qrcode : (typeof qrcode !== "undefined" ? qrcode : null);
    if (typeof qrcodeFn !== "function") return null;
    try {
      const qr = qrcodeFn(0, "M");
      qr.addData(String(text), "Byte");
      qr.make();
      const count = qr.getModuleCount();
      const cellSize = Math.max(2, Math.floor((size - 8) / count));
      const gifDataUrl = qr.createDataURL(cellSize, 4);
      const image = new Image();
      image.src = gifDataUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || size;
      canvas.height = image.naturalHeight || size;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("QR creation error:", err);
      return null;
    }
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
      if (grandBg && !isDarkHex(grandBg)) return "#0F172A";
      return tpl.grandText || "#ffffff";
    })();

    const moneyString = (value, opts = {}) => {
      const parts = [];
      parts.push({ text: moneyFormatter.format(Number(value || 0)), bold: opts.bold !== false, color: opts.color || "#0F172A", fontSize: opts.size || 9 });
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

    const stInfo = invoiceStatusData(sale);
    const statusStampNode = {
      unbreakable: true,
      table: {
        widths: ["*", "auto"],
        body: [[
          { text: "", border: [false, false, false, false] },
          {
            stack: [
              { text: stInfo.label, bold: true, font: "CairoSemiBold", fontSize: compact ? 10.5 : 12.5, color: stInfo.color, alignment: "center" },
              { text: stInfo.sub, fontSize: compact ? 6.5 : 7.5, color: stInfo.color, alignment: "center", margin: [0, 1, 0, 0] }
            ],
            fillColor: stInfo.bg,
            margin: [10, 3, 10, 3]
          }
        ]]
      },
      layout: {
        defaultBorder: false,
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1.2 : 0,
        hLineColor: () => stInfo.color,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1.2 : 0,
        vLineColor: () => stInfo.color
      },
      margin: [0, 0, 0, compact ? 2 : 4]
    };

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
        statusStampNode,
        infoSection,
        sectionTitle("تفاصيل الفاتورة"),
        itemsTable,
        ...(returns.length ? [pdfReturnsBlock()] : []),
        totalsNode,
        {
          stack: [
            code128CanvasNode(sale.number, compact ? 28 : 34, 1.35),
            { text: sale.number, fontSize: 9, color: PDF_DESIGN.secondary, alignment: "center", margin: [0, 2, 0, 0], characterSpacing: 2 }
          ],
          margin: [0, compact ? 4 : 7, 0, 0]
        }
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
      color: opts.color || "#0F172A",
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
      (qr ? 110 : 0) + 70
    );

    const logoWidth = isNarrow ? 24 : 32;
    const storeFontSize = isNarrow ? 10 : 11;
    const taglineSize = isNarrow ? 6 : 6.5;
    const taglineText = state.settings.storeSubtitle || "متجر ملابس وأزياء";

    const stInfo = invoiceStatusData(sale);
    const thermalStampNode = {
      unbreakable: true,
      table: {
        widths: ["*", "auto", "*"],
        body: [[
          { text: "", border: [false, false, false, false] },
          {
            text: `${stInfo.label} — ${stInfo.sub}`,
            bold: true,
            font: "CairoSemiBold",
            fontSize: isNarrow ? 7.5 : 8.5,
            color: stInfo.color,
            fillColor: stInfo.bg,
            alignment: "center",
            margin: [8, 2, 8, 2]
          },
          { text: "", border: [false, false, false, false] }
        ]]
      },
      layout: {
        defaultBorder: false,
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0,
        hLineColor: () => stInfo.color,
        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
        vLineColor: () => stInfo.color
      },
      margin: [0, 2, 0, 2]
    };

    const thermalBarcodeBlock = [
      code128CanvasNode(sale.number, isNarrow ? 26 : 30, isNarrow ? 0.95 : 1.1),
      { text: sale.number, fontSize: isNarrow ? 7 : 7.5, color: PDF_DESIGN.dark, bold: true, alignment: "center", margin: [0, 1, 0, 0], characterSpacing: 1.5 }
    ];

    return {
      rtl: true,
      pageSize: { width: W, height: estimatedHeight },
      pageMargins: [M, 8, M, 8],
      content: [
        ...(logo ? [{ image: logo, width: logoWidth, alignment: "center", margin: [0, 0, 0, 3] }] : []),
        { text: state.settings.storeName, fontSize: storeFontSize, bold: true, font: "CairoSemiBold", color: accent, alignment: "center", margin: [0, 0, 0, 1] },
        { text: taglineText, fontSize: taglineSize, color: PDF_DESIGN.muted, alignment: "center" },
        headerRule,
        thermalStampNode,
        metaGrid,
        metaDivider,
        itemsTable,
        ...returnsBlock,
        ...totalsBody,
        ...qrBlock,
        thermalBarcodeBlock,
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
    const type = state.report?.type || "summary";
    const label = (reportTypes.find(t => t.id === type) || {}).label || "تقرير";
    const safeLabel = label.replace(/^تقرير\s*/, "").replace(/\s+/g, "-");
    const date = new Date().toISOString().slice(0, 10);
    await exportPdfWithPdfMake({
      filename: `تقرير-${safeLabel}-${date}`,
      build: logo => buildReportDoc(type, logo)
    });
  }

  function buildReportDoc(type, logo) {
    const primaryColor = state.settings.docColor || "#0F766E";
    const darkNavy = "#0F172A";
    const slateMuted = "#64748B";
    const lightBg = "#F8FAFC";
    const typeInfo = reportTypes.find(t => t.id === type) || reportTypes[0];

    const stats = getStats();
    const invStats = getInventoryStats();
    const sales = getFilteredSales();
    const pl = getPLData(sales, getExpensesByRange(state._reportFrom, state._reportTo));
    const curr = state.settings.currency || "ج.م";
    const dateStr = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "full", timeStyle: "short" }).format(new Date());

    // 1. Header with Logo & Brand Info
    const headerCols = [];
    if (logo) {
      headerCols.push({ image: logo, width: 65, alignment: "right" });
    }
    headerCols.push({
      stack: [
        { text: state.settings.storeName || "خيط بوتيك", style: "brandTitle" },
        { text: `س.ت: ${state.settings.commercialNumber || "—"}  |  ر.ض: ${state.settings.taxNumber || "—"}`, style: "brandMeta" },
        { text: `هاتف: ${state.settings.companyPhone || "—"}  |  ${state.settings.companyAddress || ""}`, style: "brandMeta" }
      ],
      alignment: "right",
      width: "*"
    });
    headerCols.push({
      stack: [
        { text: typeInfo.label, style: "docTitle", alignment: "left" },
        { text: `الرقم المرجعي: RPT-${Date.now().toString().slice(-6)}`, style: "brandMeta", alignment: "left" },
        { text: `تاريخ الإصدار: ${dateStr}`, style: "brandMeta", alignment: "left" }
      ],
      width: "auto"
    });

    // 2. Executive KPI Cards for PDF
    let kpiBoxes = [];
    if (type === "summary") {
      const marginPct = stats.allSales > 0 ? Math.round((stats.allProfit / stats.allSales) * 100) : 0;
      kpiBoxes = [
        { label: "إجمالي المبيعات", val: `${moneyFormatter.format(stats.allSales)} ${curr}`, color: primaryColor },
        { label: "صافي الأرباح", val: `${moneyFormatter.format(stats.allProfit)} ${curr}`, color: stats.allProfit >= 0 ? "#16A34A" : "#DC2626" },
        { label: "عدد الفواتير", val: `${sales.length} فاتورة`, color: "#2563EB" },
        { label: "هامش الربح", val: `${marginPct}%`, color: "#D97706" }
      ];
    } else if (type === "inventory") {
      const prods = filteredReportProducts();
      const tQty = prods.reduce((s, p) => s + Number(p.quantity || 0), 0);
      const rVal = prods.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
      const cVal = prods.reduce((s, p) => s + Number(p.cost || 0) * Number(p.quantity || 0), 0);
      const lowC = prods.filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0)).length;
      kpiBoxes = [
        { label: "إجمالي القطع", val: `${tQty} قطعة`, color: primaryColor },
        { label: "قيمة المخزون (بيع)", val: `${moneyFormatter.format(rVal)} ${curr}`, color: "#2563EB" },
        { label: "قيمة المخزون (تكلفة)", val: `${moneyFormatter.format(cVal)} ${curr}`, color: "#D97706" },
        { label: "أصناف منخفضة", val: `${lowC} صنف`, color: lowC > 0 ? "#DC2626" : "#16A34A" }
      ];
    } else if (type === "pl") {
      kpiBoxes = [
        { label: "إيراد المبيعات", val: `${moneyFormatter.format(pl.revenue)} ${curr}`, color: primaryColor },
        { label: "تكلفة البضاعة (COGS)", val: `${moneyFormatter.format(pl.cost)} ${curr}`, color: "#D97706" },
        { label: "المصروفات التشغيلية", val: `${moneyFormatter.format(pl.expenses)} ${curr}`, color: "#DC2626" },
        { label: "صافي الأرباح", val: `${moneyFormatter.format(pl.netProfit)} ${curr}`, color: pl.netProfit >= 0 ? "#16A34A" : "#DC2626" }
      ];
    } else {
      kpiBoxes = [
        { label: "إجمالي المبيعات", val: `${moneyFormatter.format(stats.allSales)} ${curr}`, color: primaryColor },
        { label: "صافي الأرباح", val: `${moneyFormatter.format(stats.allProfit)} ${curr}`, color: stats.allProfit >= 0 ? "#16A34A" : "#DC2626" },
        { label: "القطع المباعة", val: `${stats.soldQty} قطعة`, color: "#2563EB" },
        { label: "نطاق الفلترة", val: reportPeriodLabel(), color: darkNavy }
      ];
    }

    const kpiRow = {
      columns: kpiBoxes.map(b => ({
        width: "*",
        margin: [3, 0, 3, 0],
        table: {
          widths: ["*"],
          body: [
            [{ text: b.label, style: "kpiLabel", fillColor: "#F1F5F9", border: [false, false, false, false] }],
            [{ text: b.val, style: "kpiVal", color: b.color, fillColor: "#F8FAFC", border: [false, false, false, true], borderColor: ["", "", "", b.color] }]
          ]
        },
        layout: {
          hLineWidth: (i, node) => i === node.table.body.length ? 2.5 : 0,
          vLineWidth: () => 0,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 5,
          paddingBottom: () => 5
        }
      })),
      margin: [0, 10, 0, 14]
    };

    // 3. Main Data Table Definition
    const pdfTableData = getReportPdfTableDefinition(type);

    return {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [30, 35, 30, 45],
      defaultStyle: {
        font: "Cairo",
        fontSize: 9,
        color: darkNavy,
        alignment: "right"
      },
      content: [
        { columns: headerCols, margin: [0, 0, 0, 10] },
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1.5, lineColor: primaryColor }]
        },
        {
          columns: [
            { text: `النطاق الزمني: ${reportPeriodLabel()}`, style: "filterSub", alignment: "right" },
            { text: `الفئة: ${state._reportCategory || "الكل"} | طريقة الدفع: ${state._reportPayment || "الكل"}`, style: "filterSub", alignment: "left" }
          ],
          margin: [0, 8, 0, 4]
        },
        kpiRow,
        {
          table: {
            headerRows: 1,
            widths: pdfTableData.widths,
            body: pdfTableData.body
          },
          layout: {
            fillColor: (rowIndex) => {
              if (rowIndex === 0) return primaryColor;
              if (rowIndex === pdfTableData.body.length - 1 && pdfTableData.hasTotal) return "#E2E8F0";
              return rowIndex % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
            },
            hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#CBD5E1",
            vLineColor: () => "#E2E8F0",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 5,
            paddingBottom: () => 5
          }
        },
        // 4. Official Signatures & Stamp block
        {
          columns: [
            {
              stack: [
                { text: "مسؤول الإعداد والتدقيق", style: "sigTitle" },
                { text: "الاسم: .......................................", style: "sigLine" },
                { text: "التوقيع: ....................................", style: "sigLine" }
              ],
              alignment: "right",
              width: "*"
            },
            {
              stack: [
                { text: "الختم الرسمي المعتمد", style: "sigTitle", alignment: "center" },
                {
                  table: {
                    widths: [95],
                    body: [[{ text: "\n\n\nختم المنشأة", alignment: "center", color: "#94A3B8", fontSize: 8 }]]
                  },
                  layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineStyle: () => ({ dash: { length: 3, space: 3 } }),
                    vLineStyle: () => ({ dash: { length: 3, space: 3 } }),
                    hLineColor: () => "#94A3B8",
                    vLineColor: () => "#94A3B8"
                  },
                  alignment: "center"
                }
              ],
              width: "auto",
              margin: [15, 0, 15, 0]
            },
            {
              stack: [
                { text: "المدير المالي / الاعتماد", style: "sigTitle" },
                { text: "الاسم: .......................................", style: "sigLine" },
                { text: "التوقيع: ....................................", style: "sigLine" }
              ],
              alignment: "left",
              width: "*"
            }
          ],
          margin: [0, 22, 0, 0]
        }
      ],
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: `${state.settings.storeName || ""} — نظام نقاط البيع المعتمد`, alignment: "right", style: "footerText" },
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: "center", style: "footerText" },
          { text: dateStr, alignment: "left", style: "footerText" }
        ],
        margin: [30, 10, 30, 0]
      }),
      styles: {
        brandTitle: { fontSize: 13, bold: true, color: darkNavy },
        brandMeta: { fontSize: 8, color: slateMuted, margin: [0, 1, 0, 1] },
        docTitle: { fontSize: 13, bold: true, color: primaryColor },
        filterSub: { fontSize: 8, color: slateMuted },
        kpiLabel: { fontSize: 8, bold: true, color: slateMuted, alignment: "center" },
        kpiVal: { fontSize: 10, bold: true, alignment: "center", margin: [0, 2, 0, 0] },
        tableHead: { fontSize: 8.5, bold: true, color: "#FFFFFF", alignment: "center" },
        tableCell: { fontSize: 8, alignment: "right" },
        tableCellNum: { fontSize: 8, alignment: "center" },
        tableTotal: { fontSize: 8.5, bold: true, color: darkNavy, alignment: "center" },
        sigTitle: { fontSize: 8.5, bold: true, color: darkNavy, margin: [0, 0, 0, 8] },
        sigLine: { fontSize: 8, color: slateMuted, margin: [0, 3, 0, 3] },
        footerText: { fontSize: 7.5, color: "#94A3B8" }
      }
    };
  }

  function getReportPdfTableDefinition(type) {
    const headStyle = "tableHead";
    const cellStyle = "tableCell";
    const numStyle = "tableCellNum";
    const totalStyle = "tableTotal";
    const curr = state.settings.currency || "ج.م";

    if (type === "summary") {
      const series = getDailySeries();
      const tSales = series.reduce((s, d) => s + d.sales, 0);
      const tProfit = series.reduce((s, d) => s + d.profit, 0);
      const body = [
        [
          { text: "التاريخ", style: headStyle },
          { text: "إجمالي المبيعات", style: headStyle },
          { text: "صافي الربح", style: headStyle },
          { text: "هامش الربح %", style: headStyle }
        ],
        ...series.map(d => [
          { text: d.date, style: numStyle },
          { text: `${moneyFormatter.format(d.sales)} ${curr}`, style: numStyle },
          { text: `${moneyFormatter.format(d.profit)} ${curr}`, style: numStyle },
          { text: `${d.sales > 0 ? Math.round((d.profit / d.sales) * 100) : 0}%`, style: numStyle }
        ]),
        [
          { text: `الإجمالي (${series.length} يوم)`, style: totalStyle },
          { text: `${moneyFormatter.format(tSales)} ${curr}`, style: totalStyle },
          { text: `${moneyFormatter.format(tProfit)} ${curr}`, style: totalStyle },
          { text: `${tSales > 0 ? Math.round((tProfit / tSales) * 100) : 0}%`, style: totalStyle }
        ]
      ];
      return { widths: ["25%", "25%", "25%", "25%"], body, hasTotal: true };
    }

    if (type === "inventory") {
      const prods = filteredReportProducts();
      const tQty = prods.reduce((s, p) => s + Number(p.quantity || 0), 0);
      const tRetail = prods.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
      const body = [
        [
          { text: "الصنف", style: headStyle },
          { text: "SKU", style: headStyle },
          { text: "الفئة", style: headStyle },
          { text: "الكمية", style: headStyle },
          { text: "سعر البيع", style: headStyle },
          { text: "التكلفة", style: headStyle },
          { text: "قيمة المخزون", style: headStyle }
        ],
        ...prods.map(p => [
          { text: p.name, style: cellStyle },
          { text: p.sku || "—", style: numStyle },
          { text: p.category || "عام", style: numStyle },
          { text: String(p.quantity), style: numStyle },
          { text: moneyFormatter.format(p.price), style: numStyle },
          { text: moneyFormatter.format(p.cost), style: numStyle },
          { text: moneyFormatter.format(Number(p.price || 0) * Number(p.quantity || 0)), style: numStyle }
        ]),
        [
          { text: `الإجمالي (${prods.length} صنف)`, style: totalStyle },
          { text: "—", style: totalStyle },
          { text: "—", style: totalStyle },
          { text: `${tQty} قطعة`, style: totalStyle },
          { text: "—", style: totalStyle },
          { text: "—", style: totalStyle },
          { text: `${moneyFormatter.format(tRetail)} ${curr}`, style: totalStyle }
        ]
      ];
      return { widths: ["26%", "13%", "13%", "10%", "12%", "12%", "14%"], body, hasTotal: true };
    }

    if (type === "lowstock") {
      const items = filteredReportProducts().filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0));
      const tMissing = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)), 0);
      const tCost = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)) * Number(p.cost || 0), 0);
      const body = [
        [
          { text: "الصنف", style: headStyle },
          { text: "SKU", style: headStyle },
          { text: "المتبقي", style: headStyle },
          { text: "حد التنبيه", style: headStyle },
          { text: "النقص", style: headStyle },
          { text: "تكلفة التوريد", style: headStyle }
        ],
        ...items.map(p => {
          const miss = Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0));
          return [
            { text: p.name, style: cellStyle },
            { text: p.sku || "—", style: numStyle },
            { text: String(p.quantity), style: numStyle },
            { text: String(p.lowStock), style: numStyle },
            { text: String(miss), style: numStyle },
            { text: `${moneyFormatter.format(miss * Number(p.cost || 0))} ${curr}`, style: numStyle }
          ];
        }),
        [
          { text: `الإجمالي (${items.length} تنبيه)`, style: totalStyle },
          { text: "—", style: totalStyle },
          { text: "—", style: totalStyle },
          { text: "—", style: totalStyle },
          { text: `${tMissing} قطعة`, style: totalStyle },
          { text: `${moneyFormatter.format(tCost)} ${curr}`, style: totalStyle }
        ]
      ];
      return { widths: ["32%", "14%", "12%", "12%", "12%", "18%"], body, hasTotal: true };
    }

    if (type === "product-profit") {
      const rows = getProductProfitability();
      const tQty = rows.reduce((s, p) => s + p.qty, 0);
      const tRev = rows.reduce((s, p) => s + p.revenue, 0);
      const tProf = rows.reduce((s, p) => s + p.profit, 0);
      const body = [
        [
          { text: "الصنف", style: headStyle },
          { text: "القطع المباعة", style: headStyle },
          { text: "إجمالي الإيراد", style: headStyle },
          { text: "صافي الربح", style: headStyle },
          { text: "الهامش %", style: headStyle }
        ],
        ...rows.map(p => [
          { text: p.name, style: cellStyle },
          { text: String(p.qty), style: numStyle },
          { text: `${moneyFormatter.format(p.revenue)} ${curr}`, style: numStyle },
          { text: `${moneyFormatter.format(p.profit)} ${curr}`, style: numStyle },
          { text: `${p.margin}%`, style: numStyle }
        ]),
        [
          { text: `الإجمالي (${rows.length} صنف)`, style: totalStyle },
          { text: `${tQty} قطعة`, style: totalStyle },
          { text: `${moneyFormatter.format(tRev)} ${curr}`, style: totalStyle },
          { text: `${moneyFormatter.format(tProf)} ${curr}`, style: totalStyle },
          { text: `${tRev > 0 ? Math.round((tProf / tRev) * 100) : 0}%`, style: totalStyle }
        ]
      ];
      return { widths: ["34%", "15%", "20%", "20%", "11%"], body, hasTotal: true };
    }

    if (type === "top") {
      const rows = topProductsByQty();
      const total = rows.reduce((s, p) => s + p.value, 0);
      const body = [
        [
          { text: "الترتيب", style: headStyle },
          { text: "الصنف", style: headStyle },
          { text: "الكمية المباعة", style: headStyle },
          { text: "النسبة %", style: headStyle }
        ],
        ...rows.map((p, i) => [
          { text: `#${i + 1}`, style: numStyle },
          { text: p.label, style: cellStyle },
          { text: `${p.value} قطعة`, style: numStyle },
          { text: `${total > 0 ? Math.round((p.value / total) * 100) : 0}%`, style: numStyle }
        ]),
        [
          { text: "الإجمالي", style: totalStyle },
          { text: `${rows.length} صنف`, style: totalStyle },
          { text: `${total} قطعة`, style: totalStyle },
          { text: "100%", style: totalStyle }
        ]
      ];
      return { widths: ["15%", "45%", "20%", "20%"], body, hasTotal: true };
    }

    if (type === "categories") {
      const cats = totalsByCategory();
      const total = cats.reduce((s, c) => s + c.value, 0);
      const body = [
        [
          { text: "الفئة", style: headStyle },
          { text: "إجمالي الإيراد", style: headStyle },
          { text: "النسبة المئوية %", style: headStyle }
        ],
        ...cats.map(c => [
          { text: c.label, style: cellStyle },
          { text: `${moneyFormatter.format(c.value)} ${curr}`, style: numStyle },
          { text: `${total > 0 ? Math.round((c.value / total) * 100) : 0}%`, style: numStyle }
        ]),
        [
          { text: `الإجمالي (${cats.length} فئات)`, style: totalStyle },
          { text: `${moneyFormatter.format(total)} ${curr}`, style: totalStyle },
          { text: "100%", style: totalStyle }
        ]
      ];
      return { widths: ["40%", "35%", "25%"], body, hasTotal: true };
    }

    if (type === "payments") {
      const stats = getPaymentStats();
      const tRev = stats.reduce((s, p) => s + p.total, 0);
      const tCount = stats.reduce((s, p) => s + p.count, 0);
      const body = [
        [
          { text: "طريقة الدفع", style: headStyle },
          { text: "عدد الفواتير", style: headStyle },
          { text: "إجمالي الإيراد", style: headStyle },
          { text: "النسبة %", style: headStyle }
        ],
        ...stats.map(p => [
          { text: p.method, style: cellStyle },
          { text: String(p.count), style: numStyle },
          { text: `${moneyFormatter.format(p.total)} ${curr}`, style: numStyle },
          { text: `${tRev > 0 ? Math.round((p.total / tRev) * 100) : 0}%`, style: numStyle }
        ]),
        [
          { text: "الإجمالي", style: totalStyle },
          { text: `${tCount} عملية`, style: totalStyle },
          { text: `${moneyFormatter.format(tRev)} ${curr}`, style: totalStyle },
          { text: "100%", style: totalStyle }
        ]
      ];
      return { widths: ["30%", "20%", "30%", "20%"], body, hasTotal: true };
    }

    if (type === "customers") {
      const rows = getTopCustomers();
      const tInvoices = rows.reduce((s, c) => s + c.count, 0);
      const tSpend = rows.reduce((s, c) => s + c.total, 0);
      const body = [
        [
          { text: "الترتيب", style: headStyle },
          { text: "اسم العميل", style: headStyle },
          { text: "عدد الفواتير", style: headStyle },
          { text: "إجمالي المشتريات", style: headStyle },
          { text: "متوسط الفاتورة", style: headStyle }
        ],
        ...rows.map((c, i) => [
          { text: `#${i + 1}`, style: numStyle },
          { text: c.name, style: cellStyle },
          { text: String(c.count), style: numStyle },
          { text: `${moneyFormatter.format(c.total)} ${curr}`, style: numStyle },
          { text: `${moneyFormatter.format(c.count ? c.total / c.count : 0)} ${curr}`, style: numStyle }
        ]),
        [
          { text: "الإجمالي", style: totalStyle },
          { text: `${rows.length} عميل`, style: totalStyle },
          { text: `${tInvoices} فاتورة`, style: totalStyle },
          { text: `${moneyFormatter.format(tSpend)} ${curr}`, style: totalStyle },
          { text: "—", style: totalStyle }
        ]
      ];
      return { widths: ["12%", "34%", "16%", "20%", "18%"], body, hasTotal: true };
    }

    if (type === "hourly") {
      const hourly = getHourlySales();
      const total = hourly.reduce((s, h) => s + h.value, 0);
      const body = [
        [
          { text: "الساعة", style: headStyle },
          { text: "إجمالي المبيعات", style: headStyle },
          { text: "النسبة %", style: headStyle }
        ],
        ...hourly.map(h => [
          { text: h.label, style: cellStyle },
          { text: `${moneyFormatter.format(h.value)} ${curr}`, style: numStyle },
          { text: `${total > 0 ? Math.round((h.value / total) * 100) : 0}%`, style: numStyle }
        ]),
        [
          { text: "الإجمالي", style: totalStyle },
          { text: `${moneyFormatter.format(total)} ${curr}`, style: totalStyle },
          { text: "100%", style: totalStyle }
        ]
      ];
      return { widths: ["40%", "35%", "25%"], body, hasTotal: true };
    }

    if (type === "margins") {
      const margins = getProfitMargins();
      const body = [
        [
          { text: "الفئة", style: headStyle },
          { text: "هامش الربح %", style: headStyle },
          { text: "التقييم", style: headStyle }
        ],
        ...margins.map(m => [
          { text: m.label, style: cellStyle },
          { text: m.display, style: numStyle },
          { text: m.value >= 30 ? "ممتاز" : m.value >= 15 ? "جيد" : "منخفض", style: numStyle }
        ])
      ];
      return { widths: ["45%", "30%", "25%"], body, hasTotal: false };
    }

    // Default: PL
    const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
    const body = [
      [
        { text: "البند المالي", style: headStyle },
        { text: "القيمة المالية", style: headStyle },
        { text: "النوع", style: headStyle }
      ],
      [
        { text: "إجمالي المبيعات (قيمة البضاعة)", style: cellStyle },
        { text: `${moneyFormatter.format(pl.revenue)} ${curr}`, style: numStyle },
        { text: "إيراد رئيسي", style: numStyle }
      ],
      [
        { text: "الخصومات الممنوحة", style: cellStyle },
        { text: `− ${moneyFormatter.format(pl.discount)} ${curr}`, style: numStyle },
        { text: "خصم", style: numStyle }
      ],
      [
        { text: "إيراد الشحن والتوصيل", style: cellStyle },
        { text: `+ ${moneyFormatter.format(pl.shipping)} ${curr}`, style: numStyle },
        { text: "إيراد إضافي", style: numStyle }
      ],
      [
        { text: "تكلفة البضاعة المباعة (COGS)", style: cellStyle },
        { text: `− ${moneyFormatter.format(pl.cost)} ${curr}`, style: numStyle },
        { text: "تكلفة", style: numStyle }
      ],
      [
        { text: "مجمل الربح", style: totalStyle },
        { text: `${moneyFormatter.format(pl.gross - pl.discount + pl.shipping)} ${curr}`, style: totalStyle },
        { text: "مجمل", style: totalStyle }
      ],
      [
        { text: "المصروفات التشغيلية", style: cellStyle },
        { text: `− ${moneyFormatter.format(pl.expenses)} ${curr}`, style: numStyle },
        { text: "مصروفات", style: numStyle }
      ],
      [
        { text: "الضريبة المحصلة", style: cellStyle },
        { text: `${moneyFormatter.format(pl.tax)} ${curr}`, style: numStyle },
        { text: "ضريبة", style: numStyle }
      ],
      [
        { text: "صافي الربح النهائي", style: totalStyle },
        { text: `${moneyFormatter.format(pl.netProfit)} ${curr}`, style: totalStyle },
        { text: pl.netProfit >= 0 ? "أرباح" : "خسارة", style: totalStyle }
      ]
    ];
    return { widths: ["50%", "30%", "20%"], body, hasTotal: true };
  }

  /* --- محرك تصدير Excel الاحترافي XMLSS --- */
  function exportReportExcel() {
    const type = state.report?.type || "summary";
    const label = (reportTypes.find(t => t.id === type) || {}).label || "تقرير";
    const safeLabel = label.replace(/^تقرير\s*/, "").replace(/\s+/g, "-");
    const date = new Date().toISOString().slice(0, 10);
    const xml = buildReportExcelWorkbook(type);
    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.settings.storeName || "المتجر"}-${safeLabel}-${date}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toastMessage("تم تصدير ملف Excel بنجاح");
  }

  function xmlssEsc(val) {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function buildReportExcelWorkbook(type) {
    const store = state.settings.storeName || "خيط بوتيك";
    const typeInfo = reportTypes.find(t => t.id === type) || reportTypes[0];
    const curr = state.settings.currency || "ج.م";
    const dateStr = new Date().toLocaleDateString("ar-EG-u-nu-latn");

    const excelData = getReportExcelStructuredData(type);

    let rowsXml = "";
    
    // Header Info Block
    rowsXml += `
      <Row ss:Height="26">
        <Cell ss:StyleID="Title" ss:MergeAcross="${excelData.columns.length - 1}">
          <Data ss:Type="String">${xmlssEsc(store)} — ${xmlssEsc(typeInfo.label)}</Data>
        </Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:StyleID="Meta" ss:MergeAcross="${excelData.columns.length - 1}">
          <Data ss:Type="String">الفترة: ${xmlssEsc(reportPeriodLabel())} | تاريخ الاستخراج: ${xmlssEsc(dateStr)} | العملة: ${xmlssEsc(curr)}</Data>
        </Cell>
      </Row>
      <Row ss:Height="10"/>
    `;

    // Table Column Headers
    rowsXml += `<Row ss:Height="22">`;
    excelData.columns.forEach(col => {
      rowsXml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlssEsc(col)}</Data></Cell>`;
    });
    rowsXml += `</Row>`;

    // Data Rows
    excelData.rows.forEach((r, idx) => {
      const isEven = idx % 2 === 0;
      rowsXml += `<Row ss:Height="19">`;
      r.forEach(cell => {
        const isNum = typeof cell === "number";
        const style = isNum ? (isEven ? "Num" : "NumZebra") : (isEven ? "Text" : "TextZebra");
        const typeAttr = isNum ? 'ss:Type="Number"' : 'ss:Type="String"';
        const val = isNum ? cell : xmlssEsc(cell);
        rowsXml += `<Cell ss:StyleID="${style}"><Data ${typeAttr}>${val}</Data></Cell>`;
      });
      rowsXml += `</Row>`;
    });

    // Totals Row
    if (excelData.totals) {
      rowsXml += `<Row ss:Height="22">`;
      excelData.totals.forEach(cell => {
        const isNum = typeof cell === "number";
        const typeAttr = isNum ? 'ss:Type="Number"' : 'ss:Type="String"';
        const val = isNum ? cell : xmlssEsc(cell);
        rowsXml += `<Cell ss:StyleID="Total"><Data ${typeAttr}>${val}</Data></Cell>`;
      });
      rowsXml += `</Row>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:x="urn:schemas-microsoft-com:office:excel">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#0F172A"/>
    </Style>
    <Style ss:ID="Title">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="14" ss:Bold="1" ss:Color="#0F766E"/>
      <Interior ss:Color="#F0FDFA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Meta">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Color="#64748B"/>
      <Interior ss:Color="#F0FDFA" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="Text">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
    </Style>
    <Style ss:ID="TextZebra">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
    </Style>
    <Style ss:ID="Num">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10"/>
      <NumberFormat ss:Format="#,##0.00"/>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
    </Style>
    <Style ss:ID="NumZebra">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10"/>
      <NumberFormat ss:Format="#,##0.00"/>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F1F5F9"/>
      </Borders>
    </Style>
    <Style ss:ID="Total">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0F172A"/>
      <NumberFormat ss:Format="#,##0.00"/>
      <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#94A3B8"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#0F172A"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="${xmlssEsc(typeInfo.label.slice(0, 30))}">
    <Table>
      ${excelData.columns.map(() => '<Column ss:Width="120"/>').join("")}
      ${rowsXml}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <DisplayRightToLeft/>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>4</SplitHorizontal>
      <TopRowBottomPane>4</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;
  }

  function getReportExcelStructuredData(type) {
    if (type === "summary") {
      const series = getDailySeries();
      const tSales = series.reduce((s, d) => s + d.sales, 0);
      const tProf = series.reduce((s, d) => s + d.profit, 0);
      return {
        columns: ["التاريخ", "إجمالي المبيعات", "صافي الربح", "هامش الربح %"],
        rows: series.map(d => [
          d.date,
          Number(d.sales.toFixed(2)),
          Number(d.profit.toFixed(2)),
          d.sales > 0 ? Math.round((d.profit / d.sales) * 100) : 0
        ]),
        totals: [
          `الإجمالي (${series.length} يوم)`,
          Number(tSales.toFixed(2)),
          Number(tProf.toFixed(2)),
          tSales > 0 ? Math.round((tProf / tSales) * 100) : 0
        ]
      };
    }

    if (type === "inventory") {
      const prods = filteredReportProducts();
      const tQty = prods.reduce((s, p) => s + Number(p.quantity || 0), 0);
      const tRetail = prods.reduce((s, p) => s + Number(p.price || 0) * Number(p.quantity || 0), 0);
      return {
        columns: ["الصنف", "SKU", "الفئة", "الكمية", "سعر البيع", "التكلفة", "قيمة المخزون", "الحالة"],
        rows: prods.map(p => [
          p.name,
          p.sku || "",
          p.category || "عام",
          Number(p.quantity || 0),
          Number(p.price || 0),
          Number(p.cost || 0),
          Number((Number(p.price || 0) * Number(p.quantity || 0)).toFixed(2)),
          Number(p.quantity || 0) <= 0 ? "نافد" : Number(p.quantity || 0) <= Number(p.lowStock || 0) ? "منخفض" : "متوفر"
        ]),
        totals: ["الإجمالي", "", "", tQty, "", "", Number(tRetail.toFixed(2)), ""]
      };
    }

    if (type === "lowstock") {
      const items = filteredReportProducts().filter(p => Number(p.quantity || 0) <= Number(p.lowStock || 0));
      const tMissing = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)), 0);
      const tCost = items.reduce((s, p) => s + Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0)) * Number(p.cost || 0), 0);
      return {
        columns: ["الصنف", "SKU", "الفئة", "المتبقي", "حد التنبيه", "النقص بالقطع", "تكلفة التوريد"],
        rows: items.map(p => {
          const miss = Math.max(0, Number(p.lowStock || 0) - Number(p.quantity || 0));
          return [
            p.name,
            p.sku || "",
            p.category || "عام",
            Number(p.quantity || 0),
            Number(p.lowStock || 0),
            miss,
            Number((miss * Number(p.cost || 0)).toFixed(2))
          ];
        }),
        totals: [`الإجمالي (${items.length} تنبيه)`, "", "", "", "", tMissing, Number(tCost.toFixed(2))]
      };
    }

    if (type === "product-profit") {
      const rows = getProductProfitability();
      const tQty = rows.reduce((s, p) => s + p.qty, 0);
      const tRev = rows.reduce((s, p) => s + p.revenue, 0);
      const tProf = rows.reduce((s, p) => s + p.profit, 0);
      return {
        columns: ["الصنف", "القطع المباعة", "إجمالي الإيراد", "إجمالي التكلفة", "صافي الربح", "الهامش %"],
        rows: rows.map(p => [
          p.name,
          p.qty,
          Number(p.revenue.toFixed(2)),
          Number(p.cost.toFixed(2)),
          Number(p.profit.toFixed(2)),
          p.margin
        ]),
        totals: [
          `الإجمالي (${rows.length} صنف)`,
          tQty,
          Number(tRev.toFixed(2)),
          "",
          Number(tProf.toFixed(2)),
          tRev > 0 ? Math.round((tProf / tRev) * 100) : 0
        ]
      };
    }

    if (type === "top") {
      const rows = topProductsByQty();
      const total = rows.reduce((s, p) => s + p.value, 0);
      return {
        columns: ["الترتيب", "الصنف", "الكمية المباعة", "النسبة المئوية %"],
        rows: rows.map((p, i) => [
          `#${i + 1}`,
          p.label,
          p.value,
          total > 0 ? Math.round((p.value / total) * 100) : 0
        ]),
        totals: ["الإجمالي", `${rows.length} صنف`, total, 100]
      };
    }

    if (type === "categories") {
      const cats = totalsByCategory();
      const total = cats.reduce((s, c) => s + c.value, 0);
      return {
        columns: ["الفئة", "إجمالي الإيراد", "النسبة المئوية %"],
        rows: cats.map(c => [
          c.label,
          Number(c.value.toFixed(2)),
          total > 0 ? Math.round((c.value / total) * 100) : 0
        ]),
        totals: [`الإجمالي (${cats.length} فئات)`, Number(total.toFixed(2)), 100]
      };
    }

    if (type === "payments") {
      const stats = getPaymentStats();
      const tRev = stats.reduce((s, p) => s + p.total, 0);
      const tCount = stats.reduce((s, p) => s + p.count, 0);
      return {
        columns: ["طريقة الدفع", "عدد العمليات", "إجمالي التحصيل", "النسبة %"],
        rows: stats.map(p => [
          p.method,
          p.count,
          Number(p.total.toFixed(2)),
          tRev > 0 ? Math.round((p.total / tRev) * 100) : 0
        ]),
        totals: ["الإجمالي", tCount, Number(tRev.toFixed(2)), 100]
      };
    }

    if (type === "customers") {
      const rows = getTopCustomers();
      const tCount = rows.reduce((s, c) => s + c.count, 0);
      const tSpend = rows.reduce((s, c) => s + c.total, 0);
      return {
        columns: ["الترتيب", "اسم العميل", "عدد الفواتير", "إجمالي المشتريات", "متوسط الفاتورة"],
        rows: rows.map((c, i) => [
          `#${i + 1}`,
          c.name,
          c.count,
          Number(c.total.toFixed(2)),
          Number((c.count ? c.total / c.count : 0).toFixed(2))
        ]),
        totals: ["الإجمالي", `${rows.length} عميل`, tCount, Number(tSpend.toFixed(2)), ""]
      };
    }

    if (type === "hourly") {
      const hourly = getHourlySales();
      const total = hourly.reduce((s, h) => s + h.value, 0);
      return {
        columns: ["الساعة", "إجمالي المبيعات", "النسبة %"],
        rows: hourly.map(h => [
          h.label,
          Number(h.value.toFixed(2)),
          total > 0 ? Math.round((h.value / total) * 100) : 0
        ]),
        totals: ["الإجمالي", Number(total.toFixed(2)), 100]
      };
    }

    if (type === "margins") {
      const margins = getProfitMargins();
      return {
        columns: ["الفئة", "هامش الربح %", "التقييم"],
        rows: margins.map(m => [
          m.label,
          m.value,
          m.value >= 30 ? "ممتاز" : m.value >= 15 ? "جيد" : "منخفض"
        ]),
        totals: null
      };
    }

    // Default: PL
    const pl = getPLData(getFilteredSales(), getExpensesByRange(state._reportFrom, state._reportTo));
    return {
      columns: ["البند المالي", "القيمة المالية", "النوع"],
      rows: [
        ["إجمالي المبيعات (قيمة البضاعة)", Number(pl.revenue.toFixed(2)), "إيراد"],
        ["الخصومات الممنوحة", Number((-pl.discount).toFixed(2)), "خصم"],
        ["إيراد الشحن والتوصيل", Number(pl.shipping.toFixed(2)), "إيراد إضافي"],
        ["تكلفة البضاعة المباعة (COGS)", Number((-pl.cost).toFixed(2)), "تكلفة"],
        ["المصروفات التشغيلية", Number((-pl.expenses).toFixed(2)), "مصروفات"],
        ["الضريبة المحصلة", Number(pl.tax.toFixed(2)), "ضريبة"],
        ["صافي الربح النهائي", Number(pl.netProfit.toFixed(2)), pl.netProfit >= 0 ? "أرباح" : "خسارة"]
      ],
      totals: null
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
    return whatsappReceiptText(sale);
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
    state.report.ready = false;
    state.report.loading = false;
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
    state.report.ready = false;
    state.report.loading = false;
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

    function getDailySeries() {
    const byDay = new Map();
    getFilteredSales().forEach(sale => {
      const date = new Date(sale.date);
      const day = Number.isNaN(date.getTime()) ? String(sale.date || "غير محدد") : date.toISOString().slice(0, 10);
      const net = netSale(sale);
      const current = byDay.get(day) || { date: day, sales: 0, profit: 0, qty: 0, invoices: 0 };
      current.sales += net.total;
      current.profit += net.profit;
      current.qty += net.qty;
      current.invoices += 1;
      byDay.set(day, current);
    });
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
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
    return `<span class="num">${moneyFormatter.format(Number(value || 0))} ${state.settings.currency}</span>`;
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
    const choice = await state.deferredInstallPrompt.userChoice.catch(() => null);
    if (choice && choice.outcome === "accepted") appInstalled = true;
    state.deferredInstallPrompt = null;
    updateInstallButtons();
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js?v=20260827-reportfix2").catch(() => {
        console.info("Service worker registration is available when served over localhost or HTTPS.");
      });
    }
  }

  init().catch(err => {
    console.error("init failed:", err);
    if (Array.isArray(window.__errs)) window.__errs.push("init:" + (err && err.message || String(err)));
    const splash = document.getElementById("splashScreen");
    if (splash) {
      splash.classList.add("is-leaving");
      splash.setAttribute("aria-hidden", "true");
      window.setTimeout(() => splash.classList.add("is-done"), 700);
    }
  });

})();
