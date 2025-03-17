"use client";

import React, { useState } from "react";;
import { motion } from "framer-motion";
import { useAuth } from "./authcontext";

const Login: React.FC = () => {
  const { token, login, disconnect, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login(username, password);
  };

  const handleDisconnect = async () => {
    // ripulisco le credenziali
    setUsername("");
    setPassword("");
    await disconnect();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="bg-white p-4 rounded shadow-md w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        {token == null ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <motion.button
                type="button"
                onClick={handleLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-500 text-white py-2 rounded transition-colors hover:bg-blue-600"
              >
                Accedi
              </motion.button>
            </div>
          </>
        ) : (
          <>

            <h2 className="text-2xl font-bold mb-6 text-center">Benvenuto {user}
            </h2>
            <motion.button
              type="button"
              onClick={handleDisconnect}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-500 text-white py-2 rounded transition-colors hover:bg-blue-600"
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