'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/api';

export default function UploadDropzone({ folderId, onUploaded }: { folderId: string | null; onUploaded: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
  setProgress(0);
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
      xhr.onload = () => {
        console.log('Upload response status:', xhr.status);
        console.log('Upload response body:', xhr.responseText);
        xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
      };
      xhr.onerror = () => {
        console.log('Upload XHR error, status:', xhr.status);
        reject(new Error('Upload failed (network error)'));
      };
      xhr.send(file);
    });

    await api.completeUpload({ fileId });
    onUploaded();
  } catch (err) {
    console.error(err);
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
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm transition ${
        dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
      />
      {progress !== null ? (
        <p>Uploading... {progress}%</p>
      ) : (
        <p>Drag & drop a file here, or click to browse</p>
      )}
    </div>
  );
}