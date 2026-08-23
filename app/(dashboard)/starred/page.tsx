'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FileItem } from '@/lib/types';

export default function StarredPage() {
  const [files, setFiles] = useState<FileItem[] | null>(null);

  useEffect(() => {
    api.getStarred().then((res) => setFiles(res.results));
  }, []);

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-lg font-semibold">Starred</h1>
      {files === null && <p className="text-sm text-gray-400">Loading...</p>}
      {files?.length === 0 && <p className="text-sm text-gray-400">No starred files yet.</p>}
      <div className="space-y-2">
        {files?.map((file) => (
          <div key={file.id} className="rounded border p-3 text-sm">📄 {file.name}</div>
        ))}
      </div>
    </div>
  );
}