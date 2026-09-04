'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB display cap (informational only, not enforced server-side)

export default function StorageIndicator() {
  const [usedBytes, setUsedBytes] = useState<number | null>(null);

  useEffect(() => {
    api.getStorageUsage().then((res) => setUsedBytes(res.usedBytes)).catch(() => {});
  }, []);

  const formatGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);

  if (usedBytes === null) return null;

  const percent = Math.min(100, (usedBytes / QUOTA_BYTES) * 100);

  return (
    <div className="space-y-1 px-1 text-xs text-gray-500">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-blue-600" style={{ width: `${percent}%` }} />
      </div>
      <p>{formatGB(usedBytes)} of {formatGB(QUOTA_BYTES)} GB used</p>
    </div>
  );
}