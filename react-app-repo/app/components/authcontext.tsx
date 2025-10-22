"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface AuthContextProps {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
  user: string | null;
  apiBaseUrl: string; // sempre hostRoot + '/api'
  apiHostRoot: string; // es. http://server[:port]
  setApiHostRoot: (url: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [apiHostRoot, setApiHostRootState] = useState<string>("");

  // Carica base URL da localStorage al mount (client only)
  useEffect(() => {
    try {
      const savedRoot = window.localStorage.getItem("apiHostRoot");
      if (savedRoot) {
        setApiHostRootState(savedRoot);
        return;
      }
      const env = process.env.NEXT_PUBLIC_API_URL || "";
      if (env) {
        // se termina con /api, rimuovilo per ottenere l'host root
        const root = env.replace(/\/?api\/?$/, "");
        setApiHostRootState(root);
      }
    } catch {}
  }, []);

  const setApiHostRoot = (url: string) => {
    setApiHostRootState(url);
    try { window.localStorage.setItem("apiHostRoot", url); } catch {}
  };

  const apiBaseUrl = apiHostRoot ? `${apiHostRoot.replace(/\/$/, "")}/api` : "";

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        let message = "Login failed";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {}
        throw new Error(message);
      }
      const data = await response.json();
      setToken(data.token);
      setUser(username);
    } catch (error: unknown) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const disconnect = async () => {
    try {
      if (!token) {
        throw new Error("Già disconnesso!");
      }
      setToken(null);
      setUser(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Errore disconnect: " + error.message);
      } else {
        alert("Errore disconnect: " + String(error));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, disconnect, user, apiBaseUrl, apiHostRoot, setApiHostRoot }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

