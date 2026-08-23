'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function Breadcrumbs({
  path,
  onMoved
}: {
  path: { id: string; name: string }[];
  onMoved: () => void;
}) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverId(null);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const item = JSON.parse(raw);

    if (item.kind === 'file') await api.moveFile(item.id, targetFolderId);
    else await api.moveFolder(item.id, targetFolderId);
    onMoved();
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600">
      <span
        onDragOver={(e) => { e.preventDefault(); setDragOverId('root'); }}
        onDragLeave={() => setDragOverId(null)}
        onDrop={(e) => handleDrop(e, null)}
        className={`rounded px-1 ${dragOverId === 'root' ? 'bg-gray-100' : ''}`}
      >
        <Link href="/" className="hover:underline">My Drive</Link>
      </span>
      {path.map((p) => (
        <span key={p.id} className="flex items-center gap-2">
          <span>/</span>
          <span
            onDragOver={(e) => { e.preventDefault(); setDragOverId(p.id); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, p.id)}
            className={`rounded px-1 ${dragOverId === p.id ? 'bg-gray-100' : ''}`}
          >
            <Link href={`/folder/${p.id}`} className="hover:underline">{p.name}</Link>
          </span>
        </span>
      ))}
    </nav>
  );
}