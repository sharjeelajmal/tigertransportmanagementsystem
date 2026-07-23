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
export const genNo = (type: string = "inbound") => {
  const prefix = String(type).toLowerCase() === "allocation" ? "OT" : "TT";
  return `${prefix}${String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0")}`;
};

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
    color-adjust: exact !important;
    box-sizing: border-box !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    color: #111 !important;
    overflow: visible !important;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }

  /* Hide UI chrome */
  .no-print,
  .action-bar,
  header,
  aside,
  nav,
  button.no-print {
    display: none !important;
  }

  .inv-pages-container {
    display: block !important;
    gap: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 210mm !important;
    background: #fff !important;
  }

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
    background: #fff !important;
  }

  .inv-outer:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .inv-page-wrap {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    overflow: hidden !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Keep critical blocks together */
  .inv-summary,
  .inv-footer,
  table {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  thead {
    display: table-header-group !important;
  }

  tr, td, th {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Borders stay visible on laser/inkjet */
  table,
  th,
  td,
  .inv-page-wrap [style*="border"] {
    border-color: #222 !important;
  }

  main,
  body,
  html,
  [class*="min-h"],
  .invoice-print-root {
    min-height: unset !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
  }

  input,
  textarea {
    border: none !important;
    background: transparent !important;
    outline: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    resize: none !important;
    color: #111 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
  }

  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  img {
    max-width: 100% !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
`;

