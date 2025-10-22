// src/components/NetworkTest.tsx
"use client";
import React, { useState } from "react";
import { useAuth } from "./authcontext";

const NetworkTest: React.FC = () => {
  const { token, apiBaseUrl } = useAuth();
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);
  // const [uploadFile, setUploadFile] = useState<File | null>(null);


  // Funzione per testare il download
  const testDownload = async () => {
    if (!token) return;
    setIsError(false);
    setIsDownloading(true);
    setDownloadSpeed(null);
    const downloadUrl = `${apiBaseUrl}/NetworkTest/download`;
    const startTime = performance.now();
    try {
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // in secondi
        const fileSizeBits = blob.size * 8; // dimensione in bit
        const speedMbps = fileSizeBits / duration / (1024 * 1024);
        setDownloadSpeed(speedMbps);
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
    const uploadUrl = `${apiBaseUrl}/NetworkTest/upload`;

    // 10 MB di dati random
    const sizeInBytes = 10 * 1024 * 1024;
    const randomData = generateRandomData(sizeInBytes);
    const blob = new Blob([randomData], { type: "application/octet-stream" });
    const formData = new FormData();
    formData.append("file", blob, "random.dat");

    const startTime = performance.now();
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // s
        const fileSizeBits = sizeInBytes * 8; // bit
        const speedMbps = fileSizeBits / duration / (1024 * 1024);
        setUploadSpeed(speedMbps);
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      console.error("Upload error:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
          {/* icona tachimetro */}
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

      <div className="flex flex-wrap gap-3 mb-4">
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Velocità di download</div>
          <div className="mt-1 text-xl font-semibold">
            {downloadSpeed !== null ? `${downloadSpeed.toFixed(2)} Mbps` : '—'}
          </div>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Velocità di upload</div>
          <div className="mt-1 text-xl font-semibold">
            {uploadSpeed !== null ? `${uploadSpeed.toFixed(2)} Mbps` : '—'}
          </div>
        </div>
      </div>

      {isError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">Si è verificato un errore durante il test.</p>
      )}
    </div>
  );
};

export default NetworkTest;
