
// src/contexts/auth-context.tsx
"use client";

import * as React from "react";
import { PublicClientApplication, EventType, AccountInfo } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { msalConfig, loginRequest } from "@/lib/auth-config";

// --- Types ---
// Define a generic User type that allows us to move away from Firebase dependencies
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

// --- Msal Instance ---
// This should be outside the component to avoid re-initialization
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance
if (typeof window !== "undefined") {
  msalInstance.initialize().then(() => {
    // Account selection logic is handled in the effect below
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }).catch(e => {
    console.error("MSAL Initialization Error:", e);
  });
}


const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

function AuthProviderInternal({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // --- Effect: Handle Account Integration ---
  React.useEffect(() => {
    const handleAuthChange = async () => {
      if (accounts.length > 0) {
        const activeAccount = accounts[0];
        instance.setActiveAccount(activeAccount);

        // Map MSAL Account to App User
        const appUser: AppUser = {
          uid: activeAccount.localAccountId,
          displayName: activeAccount.name || "",
          email: activeAccount.username || "",
          photoURL: "", // MSAL doesn't give photo directly everywhere, needs Graph/Profile call
          getIdToken: async () => {
            // Silent token acquisition
            try {
              const response = await instance.acquireTokenSilent({
                ...loginRequest,
                account: activeAccount
              });
              return response.accessToken;
            } catch (e) {
              // Fallback to interaction if needed, or return empty
              console.error("Token acquisition failed", e);
              return "";
            }
          }
        };

        setUser(appUser);

        // Get Token
        try {
          const token = await appUser.getIdToken();
          setAccessToken(token);
        } catch (e) {
          console.error("Failed to get initial token", e);
        }

        // Load Profile logic (similar to before)
        const savedProfile = localStorage.getItem(`profile_${appUser.uid}`);
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        } else {
          const names = (appUser.displayName || "").split(' ');
          const first = names[0] || '';
          const last = names.length > 1 ? names[names.length - 1] : '';
          const initials = (first.charAt(0) + last.charAt(0)).toUpperCase();

          setUserProfile({
            firstName: first,
            lastName: names.slice(1).join(' ') || '',
            breakDate: '',
            photoUrl: '',
            initials: initials || '??'
          });
        }
      } else {
        setUser(null);
        setAccessToken(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    };

    handleAuthChange();
  }, [accounts, instance]);


  // --- Actions ---
  const signIn = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const signOut = async () => {
    try {
      const activeAccount = instance.getActiveAccount();
      await instance.logoutPopup({
        account: activeAccount || undefined,
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/"
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUserProfile(prev => {
      const newProfile = prev ? { ...prev, ...data } : {
        firstName: '', lastName: '', breakDate: '', photoUrl: '', initials: '', ...data
      };
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(newProfile));
      return newProfile;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      accessToken,
      isLoading: inProgress === "login" || isLoading, // Also consider MSAL inProgress state
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Main Wrapper ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInternal>{children}</AuthProviderInternal>
    </MsalProvider>
  );
}


export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
