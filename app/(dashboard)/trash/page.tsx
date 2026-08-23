'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TrashItem {
  id: string;
  name: string;
  kind: 'file' | 'folder';
  updated_at: string;
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[] | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    const result = await api.listTrash();
    setItems(result.items);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (item: TrashItem) => {
    setError('');
    try {
      await api.restoreFromTrash({ resourceType: item.kind, resourceId: item.id });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!items) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-lg font-semibold">Trash</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items.length === 0 && <p className="text-sm text-gray-400">Trash is empty.</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm">
              <span>{item.kind === 'folder' ? '📁' : '📄'}</span>
              <span>{item.name}</span>
            </div>
            <button
              onClick={() => handleRestore(item)}
              className="rounded bg-black px-3 py-1 text-xs text-white"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}