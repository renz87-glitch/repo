"use client";
import React, { Suspense } from "react";
import Headbar from "./components/headbar";
import { TOOLSETS, DEFAULT_TOOL_ID } from "./components/toolsets";
import { useSearchParams } from "next/navigation";

function HomeInner() {
  const searchParams = useSearchParams();
  const activeId = searchParams.get("tool") || DEFAULT_TOOL_ID;
  const active = TOOLSETS.find((t) => t.id === activeId) ?? TOOLSETS[0];

  return (
    <>
      <div className="row-start-1 w-full flex items-center justify-center">
        <Headbar items={TOOLSETS.map(({ id, label }) => ({ id, label }))} activeId={active.id} />
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-3xl">
        <div className="w-full">{active.element}</div>
      </main>
      <footer className="row-start-3" />
    </>
  );
}

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Suspense fallback={<div className="row-start-2">Caricamento…</div>}>
        <HomeInner />
      </Suspense>
    </div>
  );
}
