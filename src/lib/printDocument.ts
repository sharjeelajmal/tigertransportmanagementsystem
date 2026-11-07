/**
 * Print / PDF helpers for report modals.
 * A report renders its printable markup inside one element; these helpers wrap that
 * markup in a standalone HTML document with the report's own CSS (Tailwind is not available there).
 */

const escapeHtml = (s: string): string =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function buildPrintHtml(title: string, css: string, bodyHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

/** Opens the document in a new window and starts printing. Returns false if the popup was blocked. */
export function printHtml(html: string): boolean {
    const w = window.open('', '_blank');
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 600);
    return true;
}

/** Renders the document to PDF on the server (/api/pdf) and downloads it. Throws on failure. */
export async function downloadPdf(html: string, filename: string): Promise<void> {
    const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, filename }),
    });
    if (!res.ok) throw new Error(`PDF generation failed (${res.status})`);

    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/** Safe file name part: "FARAZ (PROGRESSIVE)" → "FARAZ__PROGRESSIVE_" */
export const fileSafe = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, '_');
