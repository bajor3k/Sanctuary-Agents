// src/contexts/auth-context-mock.tsx
"use client";

import * as React from "react";

export interface AppUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    getIdToken: () => Promise<string>;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    breakDate: string;
    photoUrl: string;
    initials: string;
}

interface AuthContextType {
    user: AppUser | null;
    userProfile: UserProfile | null;
    accessToken: string | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProviderInternal({ children }: { children: React.ReactNode }) {
    // MOCK USER
    const mockUser: AppUser = {
        uid: "mock-user-123",
        displayName: "Bajor (Dev)",
        email: "dev@local",
        photoURL: "",
        getIdToken: async () => "mock-token"
    };

    const mockProfile: UserProfile = {
        firstName: "Bajor",
        lastName: "Dev",
        breakDate: "01/01/2026",
        photoUrl: "",
        initials: "BD"
    };

    const [user, setUser] = React.useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = React.useState(false); // Do not start loading, or simulate short load

    const signIn = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setUser(mockUser);
            setIsLoading(false);
        }, 500);
    };

    const signOut = async () => {
        setUser(null);
    };

    const updateProfile = () => { };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile: user ? mockProfile : null,
            accessToken: "mock-token",
            isLoading,
            signIn,
            signOut,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Simplified AuthProvider wrapper that ignores MSAL for now
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <AuthProviderInternal>{children}</AuthProviderInternal>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
