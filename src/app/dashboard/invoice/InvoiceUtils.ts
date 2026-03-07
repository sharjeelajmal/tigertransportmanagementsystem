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
  const element = document.querySelector(".inv-pages-container") as HTMLElement;
  if (!element) return;

  // Dynamically import html2pdf to prevent "self is not defined" SSR error
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true, windowWidth: 794 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  // Temporarily bypass any mobile zoom or transform scaling so the PDF captures perfect 100% width
  const originalZoom = element.style.zoom;
  const originalTransform = element.style.transform;
  const scaleHolders = Array.from(document.querySelectorAll(".inv-screen-scale-holder")) as HTMLElement[];
  const scaleWraps = Array.from(document.querySelectorAll(".inv-screen-scale-wrap")) as HTMLElement[];
  const holderStyles = scaleHolders.map((el) => ({ el, width: el.style.width, height: el.style.height }));
  const wrapStyles = scaleWraps.map((el) => ({ el, transform: el.style.transform }));
  element.style.zoom = '1';
  element.style.transform = 'none';
  scaleHolders.forEach((el) => {
    el.style.width = '794px';
    el.style.height = '1123px';
  });
  scaleWraps.forEach((el) => {
    el.style.transform = 'none';
  });

  // Before generating, we briefly adjust the UI to look like print (hide buttons)
  const noPrintElements = Array.from(document.querySelectorAll(".no-print")) as HTMLElement[];
  const noPrintDisplay = noPrintElements.map((el) => ({ el, display: el.style.display }));
  noPrintElements.forEach((el) => {
    el.style.display = "none";
  });

  // Generate and save
  await html2pdf().set(opt).from(element).save();

  // Restore UI
  element.style.zoom = originalZoom;
  element.style.transform = originalTransform;
  holderStyles.forEach(({ el, width, height }) => {
    el.style.width = width;
    el.style.height = height;
  });
  wrapStyles.forEach(({ el, transform }) => {
    el.style.transform = transform;
  });
  noPrintDisplay.forEach(({ el, display }) => {
    el.style.display = display;
  });
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

