"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./authcontext";

const Login: React.FC = () => {
  const { token, login, disconnect, user, apiBaseUrl, apiHostRoot, setApiHostRoot } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [clientIp, setClientIp] = useState<string | null>(null);
  const [clientXff, setClientXff] = useState<string | null>(null);

  const handleLogin = async () => {
    setSubmitError(null);
    let hasError = false;
    if (!username.trim()) {
      setUsernameError("Campo obbligatorio");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Campo obbligatorio");
      hasError = true;
    }
    if (hasError) return;
    try {
      await login(username, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(msg || "Errore di login");
    }
  };

  const handleDisconnect = async () => {
    setUsername("");
    setPassword("");
    setUsernameError(null);
    setPasswordError(null);
    setSubmitError(null);
    await disconnect();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  } as const;

  useEffect(() => {
    if (!apiBaseUrl) return;
    const ctrl = new AbortController();
    fetch(`${apiBaseUrl}/NetworkTest/client`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setClientIp(data.ip ?? null);
          setClientXff(data.xForwardedFor ?? null);
        }
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [apiBaseUrl]);

  return (
    <div className="w-full flex items-center justify-center">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {token == null ? (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-foreground/80">
                  <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Accedi</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Inserisci le tue credenziali per continuare
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="apiBaseUrl"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Server API
                </label>
                <div className="relative">
                  <input
                    id="apiBaseUrl"
                    type="url"
                    placeholder="http://server[:port]"
                    className={`mt-1 block w-full rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 border-neutral-200 dark:border-neutral-700`}
                    value={apiHostRoot}
                    onChange={(e) => setApiHostRoot(e.target.value)}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 dark:text-neutral-400 select-none">/api</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">URL effettivo: {apiBaseUrl || '(imposta host)'} — salvato nel browser.</p>
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  className={`mt-1 block w-full rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 ${usernameError ? 'border-red-500 dark:border-red-400' : 'border-neutral-200 dark:border-neutral-700'}`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); if (usernameError) setUsernameError(null); }}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{usernameError}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`mt-1 block w-full rounded-lg border bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 ${passwordError ? 'border-red-500 dark:border-red-400' : 'border-neutral-200 dark:border-neutral-700'}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.82 2.98-5.17 5.5-6.56"/>
                        <path d="M1 1l22 22"/>
                        <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/>
                        <path d="M14.12 14.12L9.88 9.88"/>
                        <path d="M21 21l-3-3"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>

              <motion.button
                type="button"
                onClick={handleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg h-10 flex items-center justify-center bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
              >
                Accedi
              </motion.button>
              {submitError && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>
              )}

              <div className="mt-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm text-neutral-700 dark:text-neutral-300">
                <div>IP client: {clientIp ?? '—'}</div>
                {clientXff && <div>X-Forwarded-For: {clientXff}</div>}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Benvenuto {user}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Sei autenticato. Puoi disconnetterti quando vuoi.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={handleDisconnect}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg h-10 flex items-center justify-center bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
            >
              Disconnetti
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
