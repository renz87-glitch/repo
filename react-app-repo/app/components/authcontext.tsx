"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface AuthContextProps {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
  user: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
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
      setUser(username);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Errore di login: " + error.message);
      } else {
        alert("Errore di login: " + String(error));
      }
    }
  };

  const disconnect = async () => {
    try {
        if(!token){
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
    <AuthContext.Provider value={{ token, login, disconnect, user }}>
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