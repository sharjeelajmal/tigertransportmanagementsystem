export interface InvoiceItem {
  id: string;
  cargoDetails: string;
  vehicle: string;
  rate: number;
  qty: number;
  amount: number;
}

export interface Meta {
  invoiceNo: string;
  billingDate: string;
  invoiceDate: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  remarks: string;
  discount: number;
  advance: number;
  partyName: string;
  vehicleNo: string;
  vehicleDetail: string;
  pickupFrom: string;
  deliverTo: string;
}

export interface PageData {
  id: string;
  items: InvoiceItem[];
}

export const R1 = "#6B0C10";
export const R2 = "#A31620";
export const GRAD = `linear-gradient(135deg, ${R1} 0%, ${R2} 100%)`;

export const fmt = (n: number) => Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const makeItem = (): InvoiceItem => ({ id: `i_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, cargoDetails: "", vehicle: "", rate: 0, qty: 1, amount: 0 });
export const today = () => new Date().toLocaleDateString("en-GB");
export const genNo = () => { const d = new Date(); return `TTM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`; };

export const downloadInvoicePDF = async (filename: string) => {
  const container = document.querySelector('.inv-pages-container') as HTMLElement;
  if (!container) return;

  // ── Wait for all web fonts to fully load ──────────────────────────────────────
  // CRITICAL: Without this, html2canvas renders with system font metrics, causing
  // text overlap with adjacent elements (e.g. TIGER TRANSPORTS line / INVOICE text).
  await document.fonts.ready;

  // ── Dynamically import — prevents SSR "self is not defined" errors ─────────────
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // ── STEP 1: Hide all no-print elements ────────────────────────────────────────
  const noPrintEls = Array.from(container.querySelectorAll('.no-print')) as HTMLElement[];
  noPrintEls.forEach(el => { el.style.display = 'none'; });

  // ── STEP 2: Remove screen-scale transforms so capture is at 100% ──────────────
  const scaleHolders = Array.from(document.querySelectorAll('.inv-screen-scale-holder')) as HTMLElement[];
  const scaleWraps = Array.from(document.querySelectorAll('.inv-screen-scale-wrap')) as HTMLElement[];
  const holderSnaps = scaleHolders.map(el => ({ el, width: el.style.width, height: el.style.height }));
  const wrapSnaps = scaleWraps.map(el => ({ el, transform: el.style.transform }));
  scaleHolders.forEach(el => { el.style.width = '794px'; el.style.height = '1123px'; });
  scaleWraps.forEach(el => { el.style.transform = 'none'; });

  // ── CRITICAL: Fix container width so html2canvas captures from x=0 ────────────
  // The container is width:100% with alignItems:center on screen. This means the
  // 794px invoice is centered inside a wider container (e.g. at x=323px in 1440px).
  // html2canvas(container, { width:794 }) captures the LEFT 794px of the container
  // which is gray background + only the left half of the invoice.
  // Fix: shrink container to 794px and left-align so invoice starts at x=0.
  const containerWidthSnap = container.style.width;
  const containerAlignSnap = container.style.alignItems;
  const containerGapSnap = container.style.gap;
  container.style.width = '794px';
  container.style.alignItems = 'flex-start';
  container.style.gap = '0px';

  // ── Force browser reflow BEFORE html2canvas reads computed styles ──────────────
  // Style mutations are batched. Without this wait, html2canvas may read stale
  // computed transform/width values causing misaligned element positions.
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  // ── STEP 3: PRINT MODE — Replace inputs/textareas with plain spans ─────────────
  // html2canvas reads the DOM's rendered text — NOT React's .value property.
  // We must swap inputs for spans before capture, then restore after.
  type Snap = { parent: Element; original: Element; placeholder: HTMLSpanElement };
  const snapshots: Snap[] = [];

  (Array.from(container.querySelectorAll('input, textarea')) as (HTMLInputElement | HTMLTextAreaElement)[])
    .forEach(el => {
      const value = el.value ?? '';
      const cs = window.getComputedStyle(el);
      const span = document.createElement('span');
      span.textContent = value;
      span.style.cssText = [
        `display:inline-block`,
        `font-family:${cs.fontFamily}`,
        `font-size:${cs.fontSize}`,
        `font-weight:${cs.fontWeight}`,
        `color:${cs.color}`,
        `background:transparent`,
        `line-height:${cs.lineHeight}`,
        `letter-spacing:${cs.letterSpacing}`,
        `text-align:${cs.textAlign}`,
        `text-transform:${cs.textTransform}`,
        `width:${cs.width}`,
        `padding:${cs.padding}`,
        `border:none`,
        `outline:none`,
        `white-space:pre-wrap`,
        `word-break:break-word`,
        `vertical-align:middle`,
      ].join(';');
      const parent = el.parentElement!;
      parent.insertBefore(span, el);
      parent.removeChild(el);
      snapshots.push({ parent, original: el, placeholder: span });
    });

  // ── STEP 4: Capture with html2canvas ─────────────────────────────────────────
  // scroll offsets must be negated so html2canvas anchors correctly
  // regardless of how far the user has scrolled the page.
  const canvas = await html2canvas(container, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: false,
    width: 794,
    height: 1123,
    windowWidth: 794,
    windowHeight: 1123,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    backgroundColor: '#c9c9c9',
  } as any);

  // ── STEP 5: Create PDF sized EXACTLY to the canvas ───────────────────────────
  // PDF page height = canvas.height / canvas.width × 210mm
  // This is mathematically guaranteed to fit the entire canvas on ONE page.
  // No page-splitting → no blank trailing pages. Ever.
  const pdfWidthMm = 210;
  const pdfHeightMm = (canvas.height / canvas.width) * pdfWidthMm;

  const pdf = new jsPDF({
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
    orientation: 'portrait',
    compress: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.97);
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);
  pdf.save(filename);

  // ── STEP 6: Restore everything ────────────────────────────────────────────────
  snapshots.forEach(({ parent, original, placeholder }) => {
    parent.insertBefore(original, placeholder);
    parent.removeChild(placeholder);
  });
  holderSnaps.forEach(({ el, width, height }) => { el.style.width = width; el.style.height = height; });
  wrapSnaps.forEach(({ el, transform }) => { el.style.transform = transform; });
  // Restore container
  container.style.width = containerWidthSnap;
  container.style.alignItems = containerAlignSnap;
  container.style.gap = containerGapSnap;
  noPrintEls.forEach(el => { el.style.display = ''; });
};




export const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&display=swap');

@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    overflow: visible !important;
  }

  @page {
    size: 210mm 297mm;
    margin: 0mm;
  }

  /* Hide all UI controls */
  .no-print, .action-bar, header, aside { display: none !important; }

  /* Pages container: remove screen gap */
  .inv-pages-container {
    display: block !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 210mm !important;
  }

  /* Outer wrapper */
  .inv-screen-scale-holder {
    width: 210mm !important;
    height: auto !important;
    overflow: visible !important;
  }

  .inv-screen-scale-wrap {
    width: 210mm !important;
    height: auto !important;
    transform: none !important;
  }

  .inv-outer {
    display: block !important;
    position: static !important;
    width: 210mm !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    page-break-after: always !important;
    break-after: page !important;
  }

  /* Last outer wrapper: no extra page break */
  .inv-outer:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* The actual invoice page */
  .inv-page-wrap {
    width: 210mm !important;
    height: 296mm !important;
    min-height: unset !important;
    max-height: 296mm !important;
    overflow: hidden !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Make sure the main app containers don't add space */
  main, body, html, [class*="min-h"], .invoice-print-root { 
    min-height: unset !important; 
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
  }

  input, textarea {
    border: none !important;
    background: transparent !important;
    outline: none !important;
    padding: 0 !important;
    resize: none !important;
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
  }
}
`;

