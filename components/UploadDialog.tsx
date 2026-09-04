'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';

export default function UploadDialog({
  folderId,
  onClose,
  onUploaded
}: {
  folderId: string | null;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setProgress(0);
    setError('');
    try {
      const mimeType = file.type || 'application/octet-stream';
      const { fileId, uploadUrl } = await api.initUpload({
        name: file.name,
        mimeType,
        sizeBytes: file.size,
        folderId
      });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

      await api.completeUpload({ fileId });
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Upload files</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-12 text-center transition ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
          {progress !== null ? (
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
          ) : (
            <>
              <span className="text-2xl">☁️</span>
              <p className="text-sm text-gray-500">Drag & drop files, or click to browse</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}