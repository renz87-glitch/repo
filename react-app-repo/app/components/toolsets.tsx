"use client";

import React from "react";
import Login from "./login";
import NetworkTest from "./networktest";

export type Toolset = {
  id: string;
  label: string;
  element: React.ReactNode;
};

export const TOOLSETS: Toolset[] = [
  { id: "login", label: "Login", element: <Login /> },
  { id: "network", label: "Network Test", element: <NetworkTest /> },
];

export const DEFAULT_TOOL_ID = TOOLSETS[0].id;

