"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Truck,
    MapPin,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    ClipboardList,
    Receipt,
    Wallet,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const navGroups = [
    {
        label: "Overview",
        items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
    },
    {
        label: "Management",
        items: [
            { name: "Staff", icon: Users, path: "/dashboard/staff" },
            { name: "Attendance", icon: ClipboardList, path: "/dashboard/attendance" },
            { name: "Payroll", icon: Wallet, path: "/dashboard/payroll" },
            { name: "Vehicles", icon: Truck, path: "/dashboard/vehicles" },
            { name: "Expenses", icon: Receipt, path: "/dashboard/expenses" },
            { name: "Routes", icon: MapPin, path: "/dashboard/routes" },
        ],
    },
    {
        label: "Insights",
        items: [
            { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
            { name: "Reports", icon: FileText, path: "/dashboard/reports" },
        ],
    },
    {
        label: "System",
        items: [{ name: "Settings", icon: Settings, path: "/dashboard/settings" }],
    },
];

const sidebarStyle = {
    background: "linear-gradient(180deg, #B50104 0%, #8B0003 100%)",
    boxShadow: "4px 0 24px rgba(181,1,4,0.25)",
};

function NavContent({
    collapsed,
    onLinkClick,
}: {
    collapsed?: boolean;
    onLinkClick?: () => void;
}) {
    const pathname = usePathname();

    const isActive = (path: string) =>
        path === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(path);

    return (
        <>
            {/* Nav */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 px-2 mb-1.5"
                                >
                                    {group.label}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={onLinkClick}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <motion.div
                                            whileHover={{ x: collapsed ? 0 : 3 }}
                                            whileTap={{ scale: 0.97 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="flex items-center gap-3 rounded-xl cursor-pointer relative overflow-hidden"
                                            style={{
                                                padding: collapsed ? "10px" : "10px 12px",
                                                justifyContent: collapsed ? "center" : "flex-start",
                                                background: active
                                                    ? "rgba(255,255,255,0.18)"
                                                    : "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!active)
                                                    (e.currentTarget as HTMLElement).style.background =
                                                        "rgba(255,255,255,0.09)";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!active)
                                                    (e.currentTarget as HTMLElement).style.background =
                                                        "transparent";
                                            }}
                                        >
                                            {/* Active pill */}
                                            {active && !collapsed && (
                                                <motion.div
                                                    layoutId="activePill"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white"
                                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                                />
                                            )}

                                            {/* Icon */}
                                            <div
                                                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                                                style={{
                                                    background: active
                                                        ? "rgba(255,255,255,0.2)"
                                                        : "transparent",
                                                }}
                                            >
                                                <item.icon
                                                    size={16}
                                                    style={{
                                                        color: active
                                                            ? "#ffffff"
                                                            : "rgba(255,255,255,0.55)",
                                                    }}
                                                />
                                            </div>

                                            {/* Label */}
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                                                        style={{
                                                            color: active
                                                                ? "#ffffff"
                                                                : "rgba(255,255,255,0.55)",
                                                        }}
                                                    >
                                                        {item.name}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>

                                            {!collapsed && active && (
                                                <ChevronRight
                                                    size={13}
                                                    className="ml-auto text-white/60 flex-shrink-0"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 h-px bg-white/15 flex-shrink-0" />

            {/* User + Logout */}
            <div className="p-3 flex-shrink-0 space-y-1">
                <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl overflow-hidden"
                    style={{
                        background: "rgba(0,0,0,0.15)",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ color: "#B50104" }}
                    >
                        A
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 min-w-0 overflow-hidden"
                            >
                                <p className="text-white text-xs font-bold leading-none truncate">Admin</p>
                                <p className="text-white/40 text-[10px] mt-0.5 truncate">Super Admin</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150"
                    style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                    title={collapsed ? "Logout" : undefined}
                >
                    <LogOut size={16} className="text-white/50 flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-semibold text-white/50 whitespace-nowrap overflow-hidden"
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}

export default function Sidebar() {
    const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-screen sticky top-0 left-0 z-40 hidden md:flex flex-col flex-shrink-0 overflow-hidden"
                style={{
                    ...sidebarStyle,
                    borderRadius: "0 20px 20px 0",
                }}
            >
                {/* Brand + Toggle */}
                <div className="flex items-center justify-between px-4 py-5 flex-shrink-0">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                key="brand"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2.5 overflow-hidden"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md flex-shrink-0">
                                    <Truck className="w-4 h-4" style={{ color: "#B50104" }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-extrabold text-sm leading-tight tracking-wide truncate">
                                        TransportMS
                                    </p>
                                    <p className="text-white/50 text-[10px] font-medium truncate">
                                        Fleet Management
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle btn */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            marginLeft: collapsed ? "auto" : "0",
                            marginRight: collapsed ? "auto" : "0",
                        }}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
                            <Menu size={15} className="text-white" />
                        </motion.div>
                    </motion.button>
                </div>

                <div className="mx-4 h-px bg-white/15 flex-shrink-0" />

                <NavContent collapsed={collapsed} />
            </motion.aside>

            {/* ── Mobile Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-50 bg-black/50 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden overflow-hidden"
                            style={sidebarStyle}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-5 py-5 flex-shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md">
                                        <Truck className="w-4 h-4" style={{ color: "#B50104" }} />
                                    </div>
                                    <div>
                                        <p className="text-white font-extrabold text-sm leading-tight">TransportMS</p>
                                        <p className="text-white/50 text-[10px] font-medium">Fleet Management</p>
                                    </div>
                                </div>
                                {/* Close btn */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMobileOpen(false)}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.15)" }}
                                >
                                    <X size={16} className="text-white" />
                                </motion.button>
                            </div>

                            <div className="mx-4 h-px bg-white/15 flex-shrink-0" />

                            <NavContent onLinkClick={() => setMobileOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
