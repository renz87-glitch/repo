"use client";

import React, { useState } from "react";
import { useAuth } from "./authcontext";

const Login: React.FC = () => {
  const { token, login, disconnect } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await login(username, password);
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg text-gray-800 mb-8">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {!token ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 m-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-2 rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Accedi
          </button>
        </>
      ) : (
        <>
        <p className="text-green-600 font-bold">Sei autenticato!</p>
        <button
            onClick={handleDisconnect}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Disconnetti
          </button>
        </>
      )}
    </div>
  );
};

export default Login;