"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Role = "admin" | "manager" | null;

interface AuthContextType {
    role: Role;
    isAdmin: boolean;
    isManager: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    role: null,
    isAdmin: false,
    isManager: false,
    loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                setRole(data.role || null);
            })
            .catch(() => setRole(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                role,
                isAdmin: role === "admin",
                isManager: role === "manager",
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
