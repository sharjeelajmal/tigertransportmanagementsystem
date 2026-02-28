"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "manager" | null;

interface AuthContextType {
    role: Role;
    username: string;
    isAdmin: boolean;
    isManager: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    role: null,
    username: "",
    isAdmin: false,
    isManager: false,
    loading: true,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                setRole(data.role || null);
                setUsername(data.username || "");
            })
            .catch(() => setRole(null))
            .finally(() => setLoading(false));
    }, []);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setRole(null);
            setUsername("");
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                role,
                username,
                isAdmin: role === "admin",
                isManager: role === "manager",
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
