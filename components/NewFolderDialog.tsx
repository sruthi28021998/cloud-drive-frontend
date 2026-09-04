'use client';

import { useState } from 'react';

export default function NewFolderDialog({
  onCancel,
  onConfirm
}: {
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-sm font-semibold">New folder</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Untitled folder"
          className="w-full rounded border px-3 py-2 text-sm"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onConfirm(name.trim())}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded px-3 py-1.5 text-sm text-gray-500">Cancel</button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}