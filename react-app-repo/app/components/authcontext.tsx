"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextProps {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("https://localhost:5071/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }
      const data = await response.json();
      setToken(data.token);
    } catch (error: any) {
      alert("Errore di login: " + error.message);
    }
  };

  const disconnect = async () => {
    try {
        if(!token){
            throw new Error("Già disconnesso!");
        }
      setToken(null);
    } catch (error: any) {
      alert("Errore: " + error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, disconnect }}>
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