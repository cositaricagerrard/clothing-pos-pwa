# Working Memory — Clothing POS PWA

## Goal
- تنفيذ نظام مستندات PDF الاحترافي (ERP RTL) للفواتير A4/الحرارية والتقارير المطبوعة وورق المعاينة في متجر الملابس PWA، مع الحفاظ على ترتيب أعمدة RTL وكل البيانات/الحسابات.
- **الجولة الأخيرة (PDF Issue Report):** إصلاح مشاكل التصميم المرصودة — تباين الألوان، هوامش/تباعدات البطاقات وشريط المجموع النهائي، المحاذاة العمودية في جدول الأصناف، رقم مقروء أسفل الباركود، واتساق أزرار التحكم أسفل الشاشة.

## Constraints & Preferences
- مواصفات التصميم الكاملة في `C:\Users\MO-3AMAR\AppData\Local\Temp\opencode\pdf-design\BRIEF.md` (A4/A5/Thermal، هوامش 15–20mm، عنوان مستند 20–24px، أعمدة جدول قابلة للإخفاء عند الفراغ، صفوف متناوبة، صور 30–36px، إجمالي 16–20px وزن 700، إجمالي نهائي hero، ترقيم «صفحة N من M»، تكرار header في كل صفحة).
- الحفاظ على كل البيانات/الحسابات/المنطق؛ يكفي التصميم فقط (المظهر/الخط/التباعد/الهوامش).
- قاعدة short-invoice: لا محتوى وهمي ولا تمديد صفوف — فقط فواصل متعمدة متوازنة مع فراغ سفلي مقبول.
- ألوان PDF: primary #0F766E، dark #172033، ثانوي #475569، borders #CBD5E1/#E5E7EB، fill #F8FAFC، danger #B91C1C، gold #B58A4A (سطر رفيع واحد كحد أقصى).
- **قواعد التباين الجديدة:** نص dochead (التاريخ/الدفع) على هيدر فاتح = #475569 (لا #94A3B8)؛ عناوين بطاقات البيانات لا تقل عن #475569 على خلفياتها؛ النص الشكري/التذييل لا أفتح من secondary؛ عمود القيمة في صفوف البطاقات `width:"*"` ليلتف بدل التفيض على الحدود.
- Typography: Cairo/CairoSemiBold فقط؛ title 20–24، sections 14–16، body 11–13، جدول 10–12، ثانوي 9–10، إجمالي 16–18، footer 8–10؛ `defaultStyle.lineHeight` ~1.15.
- #1 GUARDRAIL: آلية `applyRTLToNode` — A4: `rtl:true` + `pdfMoneyParts` (array-text غير مكتشف)؛ حراري: مصفوفات معكوسة مسبقاً + `moneyText` نص-موحّد. ممنوع تغيير نوع نصوص الخلايا أو ترتيب المصفوفات. أعمدة A4 فيزيائية يسار→يمين: `الإجمالي، السعر، الكمية، الصنف، صورة، #`؛ الحرارية: `#، الصنف، كمية، السعر، الإجمالي`.
- ممنوع تغيير `metric()`/`reportTypes`/`applyAccent()`/بنية `state`/منطق checkout/save.

## Progress
### Done
- **مهمة نظام PDF الاحترافي:** البحث والعمارة والتنفيذ عبر subagent + إصلاحاتي الشخصية لملاءمة صفحة 1 للفواتير القصيرة (3 أصناف = صفحة واحدة): pageMargins [38,42,38,58]، تقليص paddings، `defaultStyle.lineHeight` 0.72→~1.15.
- **جولة إصلاحات التصميم (PDF Issue Report) — كلها مطبقة ومتحقق منها:**
  1. **التباين:** `docMetaColor` للهيدر الفاتح #94A3B8→#475569 (app.js + `.invoice-dochead small` في styles.css)؛ تحمير ألوان العناوين/القيم في القوالب (boutique #7f4a63، atelier #665d52، runway #2f6f68، luxury #5f5a50)؛ thanksColor (classic/modern/minimal #475569، boutique #8b4664، atelier #7c7469، luxury #8a857b)؛ footer page-number وthermal thanks muted→secondary.
  2. **البطاقات:** padding داخلي للبطاقات 12→14 (PDF) و`.inv-card` 14px→16px، `.invoice-meta` gap 14px؛ `pdfInfoRow`/thermal `metaRow`: عمود القيمة `width:"*"` (يلتف بدل التفيض) والعنوان `width:"auto"`.
  3. **شريط المجموع النهائي:** paddingLeft/Right 5→14 (PDF) و`14px 20px` (HTML `grandPadding`).
  4. **إيقاع الأقسام:** headerRule bottom 4→5، infoSection 4→5، sectionTitle 3→4، totalsNode 6→8.
  5. **المحاذاة:** `.invoice-table td` و`.invoice-thumb img` → `vertical-align: middle`.
  6. **الباركود:** أُضيف `<p class="barcode-label">` برقم الفاتورة تحت الباركود في المعاينة + `.code-strip` gap 10→12.
  7. **الأزرار:** `button.danger.ghost` أصبح أحمر فعلاً (كان `.ghost` يتجاوز لون `.danger`) + hover/focus؛ كل أزرار `.dialog-actions` موحّدة `10px 16px` / `min-width: 94px`.
- **جولة مطابقة PDF↔المعاينة (Typography System Rebuild):** قياس فعلي بالأدوات `font-metrics.js` (PDF القديم: title 21، store 22، جدول 9.5–10، meta 9، فراغ 116pt) و`preview-metrics.js` (المعاينة: brandH2 23، docheadH3 20، badge 12.5، cardH4 14، td 12.5، totals 15، grand 18، footer 11). اعتماد قاعدة pt≈px (نسبة 1:1 بين المعاينة 586px وA4 595pt).

  **انتهى (كلها محققة في `buildInvoiceByTemplate` 4856):** title 20، store 21، badge 11.5، dochead meta 10، tagline 10، card titles 14، card values 11.5، card labels 10، th 11، item name (تلقائي 11/compact 10)، item meta 9.5، money cells 10.5، totals values 12.5 + labels 11، words 9.5، grand money 17 + label 15.5، footer 9.5، page numbers 9، QR label 8، thumbs 30px، QR 60px. `itemNameSize` للقوالب السبعة: classic 11، modern 11.5، boutique/atelier 11، runway/minimal 11.5، luxury 11. أعمدة الجدول [24,40,"*",46,66,78]، حشو الصفوف 4.5، `lineHeight` 1.15→1.08، ترييمات مسافات (header padding 6.5، infoSection 4، card padding 13، pdfInfoRow margin 1.5، sectionTitle 2.5، totalsNode 5، grand padding 6).

  **التحقق النهائي:** `node --check` OK؛ كل السيناريوهات أُعيد توليدها عبر `pdf-design-shots.js` + `gen-3default.js`؛ 1–3 أصناف = **صفحة واحدة** (grand@634/696/753)؛ returns صفحة واحدة مع المجموع المرتجع −899 و grand 2,118.58 عبر `gen-returns.js` (بعد انتظار 2.5s لانتهاء معالجة المرتجع async)؛ qr-hidden/لارج-امونتs/luxury/runway صفحة واحدة؛ longnames/mixednames صفحتان؛ 20 صنف = 4 صفحات (تكرار header + grand 11,327.04 في صفحة 4)؛ التقرير صفحتان؛ Regression براوزر **12/12** بعد كل التعديلات.

### In Progress
- (لا شيء)

### Blocked
- (لا شيء)

## Key Decisions
- **تبني قاعدة pt≈px (نسبة 1:1) لمطابقة PDF بمعاينة المتصفح** بدل مقياس 0.72 القديم — هذا كان مصدر الفجوة البصرية التاريخية.
- استرجاع المساحة العمودية من الهوامش وعامل الأسطر (lineHeight 1.08) بدل تقليص الخطوط، لإبقاء أحجام المعاينة وملاءمة صفحة واحدة لحالات 1–3 أصناف.
- الوضع **compact** (عند وجود منتجات مرتجعة أو مبيعات-مدفوعة بوضع سريع): كل الأحجام تتقلص قليلاً (title 18، card 12.5/10.5، th 10، item 10، grand money 15) مع هوامش [14,18,14,54] — سقط المرتجع في صفحة واحدة مع استمرار وضوحه.
- إبقاء الإجمالي النهائي hero: grand 17pt داكن عريض على الشريط الملوّن + تسمية 15.5pt؛ الإجمالي 12.5 والسعر/الكمية 10.5–11 في الجدول.
- توزيع المهام: subagent نفّذ العمارة، ثم راجعتُ وأصلحتُ ملاءمة صفحة 1 (المستخدم طلبها صراحةً).
- `docMetaColor` الفاتح = `PDF_DESIGN.secondary` وليس `muted` — التباين على fill الهيدر الفاتح يتطلب أغمق.
- عمود القيمة `width:"*"` + العنوان `width:"auto"` في صفوف البطاقات — يضمن التباعد ولا تفيض القيم الطويلة على الحدود (تم التحقق: القيم يسار والعناوين يمين).
- أزرار التحكم: زر الحذف «danger ghost» أحمر صريح بحدود ملوّنة، وكل الأزرار بنفس الحشو/العرض الأدنى لاتساق بصري.
- ألوان القوالب الداكنة الخفيفة (boutique/atelier/runway/luxury) حُمّرت عن عمد لتحقيق ≥ ~4.5:1 على خلفياتها الكريمية.

## Next Steps
1. (اختياري) إذا أُعجب المستخدم بالنتيجة، لا حاجة لخطوات أخرى؛ التطبيق يعمل والـ server على 8765.
2. أي تعديلات تصميم إضافية حسب ملاحظات المستخدم.

## Critical Context
- خادم 8765 يعمل (`Start-Process node serve-pwa.js`) — يقدّم ملفات المشروع الحالية مباشرة.
- x-الأعمدة (عادي، non-compact) بعد التعديلات: A4 `الإجمالي@x63`, `السعر@x153`, `الكمية@x219`, `الصنف@x351`, `صورة@x483`, `#@x536`؛ حراري `الإجمالي@x29`, `السعر@x76`, `كمية@x115`, `الصنف@x158`, `#@x206`. جدول المرتجعات compact: `الإجمالي@x521`, `السعر@x443`, `الكمية@x377`, `الصنف@x177`.
- قياسات الوضع الحالي للحالة العادية 3 أصناف: header title 20@top76، badge 11.5، store 21@top124، tagline 10@top154-157، dochead meta 10، card titles 14@top225/236، card values 11.5، th 11@top395-435، totals values 12.5@x162، words 9.5، grand money 17+label 15.5@top753، footer 9.5@top810، pages 9@top832.
- مواضع grand لكل الحالات (صفحة واحدة): 1item@634، 2items@696، 3default@753، large-amounts@694، qr-hidden@696، luxury@696، runway@698، returns@734 (compact).
- **مهم:** `downloadInvoicePdf` يقرأ `state.sales.find(id===state.currentInvoiceId)` — عند اختبار المرتجعات، يجب الانتظار ≥2.5s بعد `confirmReturnButton` قبل الضغط على زر التحميل وإلا نُزّل PDF بلا كتلة المرتجعات (المعاينة HTML تُحدَّث قبل الحفظ بقليل).
- مسارات أدوات الاختبار: `C:\Users\MO-3AMAR\AppData\Local\Temp\opencode\node_modules\playwright`، `pdfjs-dist`، `serve-pwa.js`، `verify-columns.js` (يستخدم أسماء ملفات قديمة — استعمل `dump-pages.js` بديلاً)، `pdf-design-shots.js` (السيناريوهات العشرة)، `pdf-design-to-png.js`، `regression-test.js` (12/12)، `gen-3default.js`، `gen-returns.js`.
- أدوات القياس في `C:\Users\MO-3AMAR\AppData\Local\Temp\opencode\pdf-design\`: `font-metrics.js`، `preview-metrics.js`، `layout-summary.js`، `dump-pages.js` (يقبل اسم ملف argv[2])، `multi-check.js`، `extract-totals.js`، `low-region.js`.
- ملاحظة: المخرجات كلها في `pdf-design\shots\` بصيغتي PDF وPNG (بما فيها كل صفحات 20-item).

## Relevant Files
- `C:\Users\MO-3AMAR\Desktop\ahmed sayed\clothing-pos-pwa\app.js` (~7020 سطر): `invoiceHtml` 3672، `downloadInvoicePdf` 4017، `INVOICE_TEMPLATES` 4594 (itemNameSize لقوالب الـ7)، `buildInvoiceDoc` 4851، `buildInvoiceByTemplate` 4856 (كل تحريرات الجولة الجديدة)، `buildThermalInvoiceDoc` 5231، `pdfInfoRow` 5409، `pdfSoftCard` 5419، `pdfItemsHeader` 5439، `pdfItemsLayout` 5453، `buildReportDoc` 5505، `DOC_DESIGN` 5713، `PDF_DESIGN` 5725.
- `C:\Users\MO-3AMAR\Desktop\ahmed sayed\clothing-pos-pwa\styles.css` — `.invoice-paper` 1809، `.invoice-brand h2` 1846، `.invoice-brand-text p` 1852، `.inv-num-tag` 1887، `.inv-card h4` 1926، `.invoice-table th/td` 1965، `.cart-totals` 1011، `.code-strip` 2006 — قيم المعاينة (todo: مواءمة نهائية اختيارية).
- `C:\Users\MO-3AMAR\Desktop\ahmed sayed\clothing-pos-pwa\index.html` — أزرار `#invoiceDialog` (حذف/استرجاع/إغلاق/مشاركة/حرارية/تحميل PDF) سطور 112–125.
- `C:\Users\MO-3AMAR\AppData\Local\Temp\opencode\pdf-design\BRIEF.md` — المواصفات الكاملة.
- `C:\Users\MO-3AMAR\AppData\Local\Temp\opencode\pdf-design\shots\` — مخرجات السيناريوهات (PDF+PNG).