import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

// Sparticuz chromium release URL — downloaded at runtime, never bundled
const CHROMIUM_REMOTE_URL =
    'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar';

async function getBrowser() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        const chromium = (await import('@sparticuz/chromium-min')).default;
        const puppeteer = (await import('puppeteer-core')).default;

        const executablePath = await chromium.executablePath(CHROMIUM_REMOTE_URL);

        return puppeteer.launch({
            args: chromium.args,
            executablePath,
            headless: true,
        });
    }

    // Local dev — use locally installed Puppeteer + bundled chromium
    const puppeteer = (await import('puppeteer')).default;
    const { existsSync } = await import('fs');
    const homeDir = os.homedir();

    const candidates = [
        path.join(homeDir, '.cache', 'puppeteer', 'chrome-headless-shell', 'win64-150.0.7871.24', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
        path.join(homeDir, '.cache', 'puppeteer', 'chrome', 'win64-150.0.7871.24', 'chrome-win64', 'chrome.exe'),
    ];

    const executablePath = candidates.find(p => existsSync(p));

    return puppeteer.launch({
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
}

export async function POST(req: NextRequest) {
    try {
        const { html, filename } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
        }

        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.emulateMediaType('print');
        await page.setContent(html, { waitUntil: 'load', timeout: 30000 });

        // Allow extra time for fonts/images to render
        await new Promise(r => setTimeout(r, 1500));

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename || 'invoice.pdf'}"`,
            },
        });
    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
    }
}
