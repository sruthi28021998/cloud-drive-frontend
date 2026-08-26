'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function FileThumbnail({ fileId, mimeType, name }: { fileId: string; mimeType: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mimeType.startsWith('image/')) return;
    api.getFile(fileId).then((res) => setUrl(res.signedUrl)).catch(() => {});
  }, [fileId, mimeType]);

  if (mimeType.startsWith('image/') && url) {
    return <img src={url} alt={name} className="h-24 w-full rounded object-cover" />;
  }

  const icon = mimeType === 'application/pdf' ? '📕'
    : mimeType.startsWith('image/') ? '🖼️'
    : mimeType.includes('zip') ? '🗜️'
    : '📄';

  return <div className="flex h-24 w-full items-center justify-center rounded bg-gray-50 text-3xl">{icon}</div>;
}