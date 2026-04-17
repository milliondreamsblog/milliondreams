"use client";

import React, { createContext, useContext, useState } from "react";

type Mode = "human" | "agent";

interface NavContextType {
    mode: Mode;
    setMode: (mode: Mode) => void;
    showQR: boolean;
    setShowQR: (show: boolean) => void;
    toggleMode: () => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<Mode>("human");
    const [showQR, setShowQR] = useState(false);

    const toggleMode = () => {
        setMode((prev) => (prev === "human" ? "agent" : "human"));
    };

    return (
        <NavContext.Provider value={{ mode, setMode, showQR, setShowQR, toggleMode }}>
            {children}
        </NavContext.Provider>
    );
}

export function useNav() {
    const context = useContext(NavContext);
    if (context === undefined) {
        throw new Error("useNav must be used within a NavProvider");
    }
    return context;
}
