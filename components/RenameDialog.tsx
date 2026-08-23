'use client';

import { useState } from 'react';

export default function RenameDialog({
  initialName,
  onCancel,
  onConfirm
}: {
  initialName: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6">
        <h2 className="text-sm font-semibold">Rename</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onConfirm(name.trim())}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded px-3 py-1 text-sm text-gray-500">Cancel</button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            className="rounded bg-black px-3 py-1 text-sm text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}