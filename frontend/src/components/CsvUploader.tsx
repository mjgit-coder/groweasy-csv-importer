"use client";

import React, { useState, useCallback, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2, Play } from "lucide-react";
import ResultsTable from "./ResultsTable";

export default function CsvUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [stats, setStats] = useState({ imported: 0, skipped: 0 });
  const [processedData, setProcessedData] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    setError(null);
    setFile(file);
    setProcessedData([]);
    setStats({ imported: 0, skipped: 0 });
    setProgress({ current: 0, total: 0 });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn(results.errors);
        }

        const data = results.data;
        if (data.length > 0) {
          setHeaders(Object.keys(data[0] as object));
          setCsvData(data);
        } else {
          setError("The uploaded CSV is empty or unreadable.");
        }
      },
      error: (error) => {
        setError(error.message);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    if (isProcessing) return;
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setError(null);
    setProcessedData([]);
    setStats({ imported: 0, skipped: 0 });
    setProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    if (csvData.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProcessedData([]);
    setStats({ imported: 0, skipped: 0 });

    const CHUNK_SIZE = 15;
    let imported = 0;
    let skipped = 0;
    const allCleanedData: any[] = [];

    const totalChunks = Math.ceil(csvData.length / CHUNK_SIZE);
    setProgress({ current: 0, total: totalChunks });

    try {
      for (let i = 0; i < csvData.length; i += CHUNK_SIZE) {
        const batch = csvData.slice(i, i + CHUNK_SIZE);

        const response = await fetch('http://localhost:5000/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          let errorMsg = `Server returned ${response.status}`;
          try {
            const errResult = await response.json();
            if (errResult.error) errorMsg = errResult.error;
          } catch (e) {
            
          }
          throw new Error(errorMsg);
        }

        const result = await response.json();

        if (result.status === "success") {
          imported += result.validated;
          skipped += result.skipped;
          allCleanedData.push(...result.data);

          setStats({ imported, skipped });
          setProcessedData([...allCleanedData]);
        } else {
          throw new Error(result.error);
        }

        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isComplete = progress.current > 0 && progress.current === progress.total;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {!file && (
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-colors ${
              isDragging
                ? "border-[#296554] bg-emerald-50"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".csv"
              className="hidden"
            />
            <div className="w-16 h-16 mb-4 rounded-full bg-[#296554]/10 flex items-center justify-center">
              <UploadCloud className="w-8 h-8 text-[#296554]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isDragging ? "Drop the file here" : "Click or drag CSV file to upload"}
            </h3>
            <p className="text-gray-500 text-sm">
              Please provide a valid CSV file with your CRM data.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 text-red-700 bg-white border-l-4 border-red-500 rounded-lg shadow-md">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {file && csvData.length > 0 && !isComplete && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-white rounded-xl shadow-md">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#296554]/10 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-[#296554]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center">
                  {file.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {csvData.length} rows detected • {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={clearFile}
                disabled={isProcessing}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              {!isProcessing && progress.current === 0 && (
                <button
                  onClick={handleConfirm}
                  className="flex items-center px-6 py-2.5 bg-[#f16e44] hover:bg-[#d95c34] text-white text-sm font-bold rounded-full transition-colors shadow-md"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Process Data
                </button>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-700 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#f16e44]" />
                  Processing records...
                </h4>
                <span className="text-sm font-bold text-[#f16e44]">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div 
                  className="bg-[#f16e44] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Batch {progress.current} of {progress.total}
              </p>
            </div>
          )}

          {!isProcessing && progress.current === 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Data Preview</h3>
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  First 10 rows
                </span>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 font-bold border-b border-gray-100 w-12 text-center">#</th>
                      {headers.map((header, idx) => (
                        <th key={idx} className="px-6 py-4 font-bold border-b border-gray-100 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {csvData.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-center font-medium">
                          {rowIdx + 1}
                        </td>
                        {headers.map((header, colIdx) => (
                          <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {row[header] || <span className="text-gray-300 italic">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {(processedData.length > 0 || isComplete) && (
        <ResultsTable 
          data={processedData} 
          stats={stats} 
          isComplete={isComplete} 
        />
      )}
      
      {isComplete && (
        <div className="flex justify-center pt-6 pb-10">
          <button
            onClick={clearFile}
            className="px-8 py-3 bg-white text-[#296554] font-bold rounded-full transition-colors shadow-lg hover:shadow-xl"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
