// src/components/NetworkTest.tsx
"use client";
import React, { useState } from "react";
import { useAuth } from "./authcontext";

const NetworkTest: React.FC = () => {
  const { token } = useAuth();
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isError, setIsError] = useState(false);
  //const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Funzione per testare il download
  const testDownload = async () => {
    if (!token) {
        alert("Effettua prima il login.");
        return;
      }
    setIsDownloading(true);
    const downloadUrl = "https://localhost:5071/api/NetworkTest/download"; // Aggiorna l'URL se necessario
    const startTime = performance.now();
    try {
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // in secondi
      const fileSizeBits = blob.size * 8; // dimensione in bit
      const speedMbps = fileSizeBits / duration / (1024 * 1024);
      setDownloadSpeed(speedMbps);
    } catch (error) {
      console.error("Download error:", error);
    }
    setIsDownloading(false);
  };

  // Gestione della selezione del file per l'upload
  /*const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  // Funzione per testare l'upload
  const testUpload = async () => {
    if (!token) {
        alert("Effettua prima il login.");
        return;
      }
    if (!uploadFile) {
      alert("Seleziona un file prima di eseguire il test di upload.");
      return;
    }
    setIsError(false);
    setIsUploading(true);
    const uploadUrl = "https://localhost:5071/api/NetworkTest/upload"; // Aggiorna l'URL se necessario
    const formData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    const startTime = performance.now();
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",      
        headers: { Authorization: `Bearer ${token}` },  
        body: formData,
      });
      const result = await response.json();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // in secondi
      const fileSizeBits = uploadFile.size * 8;
      const speedMbps = fileSizeBits / duration / (1024 * 1024);
      setUploadSpeed(speedMbps);
    } catch (error) {
      setIsError(true);
      console.error("Upload error:", error);
    }
    setIsUploading(false);
  };*/

  const generateRandomData = (totalSize: number): Uint8Array => {
    const maxChunkSize = 65536; // limite per getRandomValues
    const randomData = new Uint8Array(totalSize);
    for (let offset = 0; offset < totalSize; offset += maxChunkSize) {
      const chunkSize = Math.min(maxChunkSize, totalSize - offset);
      // Ottieni una sottovista sull'array randomData e riempi con dati casuali
      const chunk = randomData.subarray(offset, offset + chunkSize);
      crypto.getRandomValues(chunk);
    }
    return randomData;
  };

  const testUploadRandom = async () => {
    if (!token) {
      alert("Effettua prima il login.");
      return;
    }
    setIsError(false);
    setIsUploading(true);
    const uploadUrl = "https://localhost:5071/api/NetworkTest/upload";
    
    // Dimensione dei dati random (ad esempio, 10 MB)
    const sizeInBytes = 10 * 1024 * 1024;
    const randomData = generateRandomData(sizeInBytes);
    
    // Crea un Blob dai dati casuali
    const blob = new Blob([randomData], { type: "application/octet-stream" });
    
    // Prepara il FormData
    const formData = new FormData();
    // Usa un nome fittizio per il file, ad esempio "random.dat"
    formData.append("file", blob, "random.dat");
    
    const startTime = performance.now();
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // tempo in secondi
      const fileSizeBits = sizeInBytes * 8; // conversione in bit
      const speedMbps = fileSizeBits / duration / (1024 * 1024);
      setUploadSpeed(speedMbps);
    } catch (error) {
      setIsError(true);
      console.error("Upload error:", error);
    }
    setIsUploading(false);
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Test di Velocità di Rete</h2>

      {/* Sezione Download */}
      <div className="mb-6">
        <button
          onClick={testDownload}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Avvia Test Download
        </button>
        {isDownloading && (
          <p className="mt-2 text-blue-500 animate-pulse">
            Download in corso...
          </p>
        )}
        {downloadSpeed !== null && !isDownloading && (
          <p className="mt-2">
            Velocità di download: {downloadSpeed.toFixed(2)} Mbps
          </p>
        )}
      </div>

      {/* Sezione Upload file */}
      {/*<div>
        <input type="file" onChange={handleFileSelect} className="mb-4" />
        <button
          onClick={testUpload}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Avvia Test Upload
        </button>        
        {isError && (
          <p className="mt-2 text-red-500 animate-pulse">
            Errore!
          </p>
        )}
        {isUploading && (
          <p className="mt-2 text-green-500 animate-pulse">
            Upload in corso...
          </p>
        )}
        {uploadSpeed !== null && !isUploading && (
          <p className="mt-2">
            Velocità di upload: {uploadSpeed.toFixed(2)} Mbps
          </p>
        )}
      </div> */}

      {/* Sezione Upload Random data */}
      <div>
        <button
          onClick={testUploadRandom}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Avvia Test Upload
        </button>
        {isUploading && (
          <p className="mt-2 text-green-500 animate-pulse">
            Upload in corso...
          </p>
        )}
        {isError && (
          <p className="mt-2 text-red-500 animate-pulse">
            Errore!
          </p>
        )}
        {uploadSpeed !== null && !isUploading && (
          <p className="mt-2">
            Velocità di upload: {uploadSpeed.toFixed(2)} Mbps
          </p>
        )}
      </div>
    </div>
  );
};

export default NetworkTest;
