"use client";

import { useCallback, useState } from "react";
import { Upload, Camera, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  className?: string;
  showCamera?: boolean;
}

export function FileUpload({
  label,
  accept = "image/*,.pdf",
  maxSizeMB = 5,
  onFileSelect,
  className,
  showCamera = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB}MB`);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg", className)}>
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-900 truncate">
            {selectedFile.name}
          </p>
          <p className="text-xs text-emerald-700">
            {(selectedFile.size / 1024).toFixed(0)}KB
          </p>
        </div>
        <button
          onClick={handleClear}
          className="p-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
          aria-label="Remove file"
        >
          <X className="w-4 h-4 text-emerald-700" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-6",
          "border-2 border-dashed rounded-lg cursor-pointer",
          "transition-colors duration-200",
          dragOver
            ? "border-primary bg-sky-50"
            : "border-slate-300 hover:border-primary hover:bg-sky-50/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          {showCamera && (
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-500 mt-1">
            Drag & drop or tap to browse. Max {maxSizeMB}MB.
          </p>
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
