"use client";

import { useEffect, useCallback } from "react";

/* ─── Color Utility Helpers ─── */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function darkenColor(hex: string, amount: number): string {
    const hsl = hexToHSL(hex);
    return hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount));
}

function lightenColor(hex: string, amount: number): string {
    const hsl = hexToHSL(hex);
    return hslToHex(hsl.h, Math.min(100, hsl.s + 5), Math.min(100, hsl.l + amount));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

/* ─── Apply All Theme Variables ─── */
export function applyThemeColors(color: string) {
    const root = document.documentElement;
    const dark = darkenColor(color, 15);
    const light = lightenColor(color, 15);
    const rgb = hexToRgb(color);

    root.style.setProperty("--primary", color);
    root.style.setProperty("--primary-dark", dark);
    root.style.setProperty("--primary-light", light);
    root.style.setProperty("--sidebar-active-bg", color);
    root.style.setProperty("--sidebar-hover-bg", `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`);
    root.style.setProperty("--ring", color);
    root.style.setProperty("--primary-rgb", `${rgb.r},${rgb.g},${rgb.b}`);
}

/* ─── Reset to Default Theme ─── */
export const DEFAULT_PRIMARY = "#B50104";

export function resetThemeColors() {
    localStorage.removeItem("appThemeColor");
    applyThemeColors(DEFAULT_PRIMARY);
}

/* ─── Provider Component ─── */
export default function ThemeProvider() {
    const init = useCallback(() => {
        const saved = localStorage.getItem("appThemeColor");
        if (saved) applyThemeColors(saved);
    }, []);

    useEffect(() => {
        init();
        window.addEventListener("storage", init);
        return () => window.removeEventListener("storage", init);
    }, [init]);

    return null;
}
