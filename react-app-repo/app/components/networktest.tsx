// src/components/NetworkTest.tsx
"use client";
import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "./authcontext";
import Speedometer from "./speedometer";

const NetworkTest: React.FC = () => {
  const { token, apiBaseUrl } = useAuth();
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [serverUploadSpeed, setServerUploadSpeed] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [durationSec, setDurationSec] = useState<number>(10);
  const [chunkKB] = useState<number>(256);

  const instSpeed = useRef(0); // Mbps instantaneous
  const [visualSpeed, setVisualSpeed] = useState(0);

  const gaugeMax = useMemo(() => {
    const m = Math.max(downloadSpeed ?? 0, uploadSpeed ?? 0, visualSpeed);
    if (m < 100) return 100;
    if (m < 300) return 300;
    if (m < 600) return 600;
    if (m < 1000) return 1000;
    return Math.ceil(m / 500) * 500;
  }, [downloadSpeed, uploadSpeed, visualSpeed]);

  // Funzione per testare il download (stream in tempo reale)
  const testDownload = async () => {
    if (!token) return;
    setIsError(false);
    setIsDownloading(true);
    setDownloadSpeed(null);
    setVisualSpeed(0);
    const downloadUrl = `${apiBaseUrl}/NetworkTest/stream?durationSec=${durationSec}&chunkKB=${chunkKB}`;
    const start = performance.now();
    let received = 0;
    let lastMarkBytes = 0;
    let lastMarkTime = start;
    try {
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            received += value.byteLength;
            const now = performance.now();
            const dt = (now - lastMarkTime) / 1000;
            if (dt >= 0.15) {
              const dBytes = received - lastMarkBytes;
              const mbps = (dBytes * 8) / dt / (1024 * 1024);
              instSpeed.current = mbps;
              setVisualSpeed(mbps);
              lastMarkTime = now;
              lastMarkBytes = received;
            }
          }
        }
        const totalTime = (performance.now() - start) / 1000;
        const avgMbps = (received * 8) / totalTime / (1024 * 1024);
        setDownloadSpeed(avgMbps);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Download error:", error);
      setIsError(true);
    }
    setIsDownloading(false);
  };

  // Genera dati random per upload (senza selezione file)
  const generateRandomData = (totalSize: number): Uint8Array => {
    const maxChunkSize = 65536; // limite per getRandomValues
    const randomData = new Uint8Array(totalSize);
    for (let offset = 0; offset < totalSize; offset += maxChunkSize) {
      const chunkSize = Math.min(maxChunkSize, totalSize - offset);
      const chunk = randomData.subarray(offset, offset + chunkSize);
      crypto.getRandomValues(chunk);
    }
    return randomData;
  };

  const testUploadRandom = async () => {
    if (!token) return;
    setIsError(false);
    setIsUploading(true);
    setUploadSpeed(null);
    setServerUploadSpeed(null);
    setVisualSpeed(0);
    const uploadUrl = `${apiBaseUrl}/NetworkTest/upload`;

    const endTime = performance.now() + durationSec * 1000;
    let totalSent = 0; // bytes
    let serverBytes = 0;
    let serverWeightedMbps = 0;
    const chunkSize = 4 * 1024 * 1024; // 4MB per richiesta

    while (performance.now() < endTime) {
      const sizeInBytes = chunkSize;
      const randomData = generateRandomData(sizeInBytes);
      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl, true);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        const start = performance.now();
        xhr.upload.onprogress = (evt) => {
          const now = performance.now();
          const dt = Math.max(0.001, (now - start) / 1000);
          const loaded = evt.lengthComputable ? evt.loaded : Math.min(sizeInBytes, (now - start) * 50_000);
          const mbps = (loaded * 8) / dt / (1024 * 1024);
          instSpeed.current = mbps;
          setVisualSpeed(mbps);
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            const end = performance.now();
            const dt = Math.max(0.001, (end - start) / 1000);
            totalSent += sizeInBytes;
            try {
              const json = JSON.parse(xhr.responseText);
              if (typeof json?.mbps === 'number' && typeof json?.sizeReceived === 'number') {
                serverWeightedMbps += json.mbps * json.sizeReceived;
                serverBytes += json.sizeReceived;
              }
            } catch {}
            resolve();
          }
        };
        const formData = new FormData();
        formData.append("file", new Blob([randomData], { type: "application/octet-stream" }), "random.dat");
        xhr.send(formData);
      });
    }
    const totalTime = durationSec;
    const avgClientMbps = (totalSent * 8) / totalTime / (1024 * 1024);
    setUploadSpeed(avgClientMbps);
    if (serverBytes > 0) setServerUploadSpeed(serverWeightedMbps / serverBytes);
    setIsUploading(false);
  };

  return (
    <div className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-foreground/80">
            <path d="M20.39 18.39A10 10 0 1 0 5.61 3.61 10 10 0 0 0 20.39 18.39z"/>
            <path d="M12 12l4-4"/>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Test di Velocità di Rete</h2>
        {!token && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Accedi per eseguire i test</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={testDownload}
          disabled={!token || isDownloading || isUploading}
          className={`rounded-lg h-10 px-4 flex items-center justify-center bg-foreground text-background transition-colors font-medium ${(!token || isDownloading || isUploading) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#383838] dark:hover:bg-[#ccc]'}`}
        >
          {isDownloading ? 'Download in corso…' : 'Avvia Test Download'}
        </button>
        <button
          onClick={testUploadRandom}
          disabled={!token || isDownloading || isUploading}
          className={`rounded-lg h-10 px-4 flex items-center justify-center bg-foreground text-background transition-colors font-medium ${(!token || isDownloading || isUploading) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#383838] dark:hover:bg-[#ccc]'}`}
        >
          {isUploading ? 'Upload in corso…' : 'Avvia Test Upload'}
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <label className="text-neutral-600 dark:text-neutral-400">Durata:</label>
          <select
            className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2 py-1"
            value={durationSec}
            onChange={(e) => setDurationSec(parseInt(e.target.value, 10))}
          >
            <option value={5}>5 s</option>
            <option value={10}>10 s</option>
            <option value={15}>15 s</option>
            <option value={30}>30 s</option>
          </select>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center">
        <Speedometer speed={visualSpeed} max={gaugeMax} label="Mbps" showValue={false} />
      </div>

      <div className="mb-6 text-center">
        <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-xl bg-black/[.04] dark:bg-white/[.06] border border-black/10 dark:border-white/10">
          <span className="text-4xl sm:text-5xl font-semibold tracking-tight bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
            {visualSpeed.toFixed(1)}
          </span>
          <span className="text-lg text-foreground/70">Mbps</span>
        </div>
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {isDownloading ? 'Download in corso' : isUploading ? 'Upload in corso' : 'Pronto'}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Velocità download media</div>
          <div className="mt-1 text-xl font-semibold">
            {downloadSpeed !== null ? `${downloadSpeed.toFixed(2)} Mbps` : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Velocità upload media</div>
          <div className="mt-1 text-xl font-semibold">
            {(serverUploadSpeed ?? uploadSpeed) !== null ? `${(serverUploadSpeed ?? uploadSpeed)!.toFixed(2)} Mbps` : '—'}
          </div>
          {(serverUploadSpeed !== null && uploadSpeed !== null) && (
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              client: {uploadSpeed.toFixed(2)} Mbps · server: {serverUploadSpeed.toFixed(2)} Mbps
            </div>
          )}
        </div>
      </div>

      {isError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">Si è verificato un errore durante il test.</p>
      )}
    </div>
  );
};

export default NetworkTest;
