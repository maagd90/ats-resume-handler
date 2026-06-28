"use client";

import { IconUpload } from "@/components/icons";
import { useCallback, useState } from "react";

export default function UploadZone({
  onFile,
  accept = ".pdf,.docx,.txt",
  label = "Upload your resume",
}: {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handle = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setFileName(file.name);
      onFile(file);
    },
    [onFile],
  );

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
        dragging ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <IconUpload />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{label}</p>
      <p className="mt-1 text-xs text-slate-500">Drag & drop or click to browse · PDF, DOCX, TXT</p>
      {fileName && <p className="mt-3 rounded-lg bg-white px-3 py-1 text-xs font-medium text-brand-700">{fileName}</p>}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />
    </label>
  );
}
