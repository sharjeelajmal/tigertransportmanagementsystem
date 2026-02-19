"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
    mobileOpen: false,
    setMobileOpen: () => { },
    collapsed: false,
    setCollapsed: () => { },
});

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider
            value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);
