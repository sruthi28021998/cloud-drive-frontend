'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Version {
  id: string;
  version_number: number;
  size_bytes: number;
  created_at: string;
}

export default function VersionHistoryDialog({
  fileId,
  fileName,
  onClose
}: {
  fileId: string;
  fileName: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const result = await api.listVersions(fileId);
    setVersions(result.versions);
    setCurrentVersionId(result.currentVersionId);
  };

  useEffect(() => { load(); }, [fileId]);

  const handleUploadNewVersion = async (file: File) => {
    setError('');
    try {
      const mimeType = file.type || 'application/octet-stream';
      const init = await api.initVersionUpload(fileId, { mimeType, sizeBytes: file.size });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', init.uploadUrl);
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

      await api.completeVersionUpload(fileId, {
        storageKey: init.storageKey,
        versionNumber: init.versionNumber,
        sizeBytes: file.size
      });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevert = async (versionId: string) => {
    await api.revertVersion(fileId, versionId);
    load();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold">Version history — {fileName}</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <label className="block">
          <span className="text-sm text-gray-600">Upload a new version</span>
          <input
            type="file"
            onChange={(e) => e.target.files?.[0] && handleUploadNewVersion(e.target.files[0])}
            className="mt-1 block w-full text-sm"
          />
        </label>

        <div className="space-y-2 border-t pt-3">
          {versions.length === 0 && <p className="text-sm text-gray-400">No older versions yet.</p>}
          {versions.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-sm">
              <span>
                v{v.version_number} · {formatSize(v.size_bytes)}
                {v.id === currentVersionId && <span className="ml-2 text-xs text-green-600">(current)</span>}
              </span>
              {v.id !== currentVersionId && (
                <button onClick={() => handleRevert(v.id)} className="text-xs text-blue-500">Revert</button>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full text-sm text-gray-500">Close</button>
      </div>
    </div>
  );
}