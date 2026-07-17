import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import path from 'path';
import os from 'os';

function findChromePath(): string | undefined {
    const homeDir = os.homedir();
    const { existsSync } = require('fs');

    // Priority 1: chrome-headless-shell (what Puppeteer actually downloads on this machine)
    const headlessShellPath = path.join(
        homeDir, '.cache', 'puppeteer', 'chrome-headless-shell',
        'win64-150.0.7871.24', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'
    );
    if (existsSync(headlessShellPath)) return headlessShellPath;

    // Priority 2: Regular chrome
    const chromePath = path.join(
        homeDir, '.cache', 'puppeteer', 'chrome',
        'win64-150.0.7871.24', 'chrome-win64', 'chrome.exe'
    );
    if (existsSync(chromePath)) return chromePath;

    return undefined;
}

export async function POST(req: NextRequest) {
    try {
        const { html, filename, baseUrl } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
        }

        const executablePath = findChromePath();
        if (!executablePath) {
            return NextResponse.json({ error: 'Chrome executable not found on server' }, { status: 500 });
        }

        const browser = await puppeteer.launch({
            headless: true,
            executablePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--allow-file-access-from-files',
            ],
        });

        const page = await browser.newPage();
        
        // Allow loading resources from the local dev server
        if (baseUrl) {
            await page.setRequestInterception(false);
        }

        await page.emulateMediaType('print');
        
        // Set content with the base URL so relative resources resolve
        await page.setContent(html, { 
            waitUntil: 'load',
            timeout: 30000,
        });

        // Wait extra time for fonts and images to fully render
        await new Promise(r => setTimeout(r, 1000));

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
