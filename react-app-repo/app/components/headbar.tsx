"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type TabItem = {
  id: string;
  label: string;
};

interface HeadbarProps {
  items: TabItem[];
  activeId: string;
  queryKey?: string;
}

const Headbar: React.FC<HeadbarProps> = ({ items, activeId, queryKey = "tool" }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set(queryKey, id);
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="w-full max-w-5xl mx-auto">
      <nav className="bg-white/70 backdrop-blur border border-black/10 dark:border-white/20 rounded-full px-2 py-1 flex gap-1">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ` +
                (isActive
                  ? "bg-foreground text-background"
                  : "hover:bg-black/[.06] dark:hover:bg-white/[.06]")
              }
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Headbar;

