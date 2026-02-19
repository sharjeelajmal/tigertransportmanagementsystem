"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-gray-50 text-foreground">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
