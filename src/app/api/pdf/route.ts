import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';

async function getBrowser() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        // On Vercel / production: use @sparticuz/chromium
        const chromium = (await import('@sparticuz/chromium')).default;
        const puppeteer = (await import('puppeteer-core')).default;

        const executablePath = await chromium.executablePath();
        return puppeteer.launch({
            args: chromium.args,
            executablePath,
            headless: true,
        });
    } else {
        // On local dev: use local puppeteer with bundled chromium
        const puppeteer = (await import('puppeteer')).default;

        // Try to find locally installed Puppeteer chromium
        const homeDir = os.homedir();
        const { existsSync } = await import('fs');

        const headlessShellPath = path.join(
            homeDir, '.cache', 'puppeteer', 'chrome-headless-shell',
            'win64-150.0.7871.24', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'
        );
        const chromePath = path.join(
            homeDir, '.cache', 'puppeteer', 'chrome',
            'win64-150.0.7871.24', 'chrome-win64', 'chrome.exe'
        );

        const executablePath = existsSync(headlessShellPath)
            ? headlessShellPath
            : existsSync(chromePath)
                ? chromePath
                : undefined;

        return puppeteer.launch({
            headless: true,
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        });
    }
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
        await page.setContent(html, {
            waitUntil: 'load',
            timeout: 30000,
        });

        // Wait for fonts and images to render
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
