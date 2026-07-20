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

export const R1 = "#000000";
export const R2 = "#000000";
export const GRAD = `linear-gradient(135deg, ${R1} 0%, ${R2} 100%)`;

export const fmt = (n: number) => Number(n || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const makeItem = (): InvoiceItem => ({ id: `i_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, cargoDetails: "", vehicle: "", rate: 0, qty: 1, amount: 0 });
export const today = () => new Date().toLocaleDateString("en-GB");
export const genNo = () => { const d = new Date(); return `TTM-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`; };

export const downloadInvoicePDF = async (filename: string) => {
  const container = document.querySelector('.inv-pages-container') as HTMLElement;
  if (!container) return;

  // Sync input values to attributes so outerHTML captures them
  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
          if (input.checked) input.setAttribute('checked', 'checked');
          else input.removeAttribute('checked');
      } else {
          input.setAttribute('value', input.value);
      }
  });

  const textareas = container.querySelectorAll('textarea');
  textareas.forEach(ta => {
      ta.textContent = ta.value;
  });

  // Collect ALL stylesheets from the page (link tags + style tags)
  const baseUrl = window.location.origin;
  let allStyles = '';

  // Inline <style> tags
  document.querySelectorAll('style').forEach(style => {
      allStyles += style.innerHTML + '\n';
  });

  // External <link rel="stylesheet"> tags — fetch them inline
  const linkFetches = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(async (link) => {
      const href = (link as HTMLLinkElement).href;
      try {
          const res = await fetch(href);
          if (res.ok) allStyles += await res.text() + '\n';
      } catch { /* skip unreachable */ }
  });
  await Promise.all(linkFetches);

  // Get invoice container outer HTML
  const containerHtml = container.outerHTML;

  // Build clean standalone HTML — no React/Next.js scripts at all
  const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${filename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: 'Montserrat', sans-serif; }
    .no-print { display: none !important; }
    .inv-pages-container { display: flex; flex-direction: column; align-items: flex-start; gap: 0; width: 794px; }
    .inv-screen-scale-holder { width: 794px !important; height: 1123px !important; overflow: hidden; }
    .inv-screen-scale-wrap { width: 794px !important; height: 1123px !important; transform: none !important; }
    ${allStyles}
  </style>
</head>
<body>
${containerHtml.replace(/src="\/Images\//g, `src="${baseUrl}/Images/`).replace(/src='\/Images\//g, `src='${baseUrl}/Images/`)}
</body>
</html>`;

  try {
      const response = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: cleanHtml, filename, baseUrl }),
      });

      if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to generate PDF on the server');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  } catch (err) {
      console.error("PDF download error:", err);
      alert("PDF download failed. Please use browser print button as backup.");
  }
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

