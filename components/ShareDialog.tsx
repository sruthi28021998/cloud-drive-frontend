'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ShareDialog({
  resourceType,
  resourceId,
  onClose
}: {
  resourceType: 'file' | 'folder';
  resourceId: string;
  onClose: () => void;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shares, setShares] = useState<{ id: string; email: string; name: string; role: string }[]>([]);

  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareError, setShareError] = useState('');

  const loadShares = async () => {
    const result = await api.listSharesFor(resourceType, resourceId);
    setShares(result.shares);
  };

  useEffect(() => { loadShares(); }, [resourceId]);

  const handleAddShare = async () => {
    setShareError('');
    try {
      const user = await api.lookupByEmail(shareEmail.trim());
      await api.createShare({
        resourceType,
        resourceId,
        granteeUserId: user.id,
        role: shareRole
      });
      setShareEmail('');
      loadShares();
    } catch (err: any) {
      setShareError(err.message);
    }
  };

  const handleCreateLink = async () => {
    setError('');
    try {
      const result = await api.createLinkShare({
        resourceType, resourceId,
        expiresAt: expiresAt || undefined,
        password: password || undefined
      });
      setLinkUrl(`${window.location.origin}/share/${result.token}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevoke = async (shareId: string) => {
    await api.revokeShare(shareId);
    loadShares();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6">
        <h2 className="text-lg font-semibold">Share</h2>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Share with a person</label>
          {shareError && <p className="text-sm text-red-600">{shareError}</p>}
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <select
              value={shareRole}
              onChange={(e) => setShareRole(e.target.value as 'viewer' | 'editor')}
              className="rounded border px-2 py-2 text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              onClick={handleAddShare}
              disabled={!shareEmail.trim()}
              className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {shares.length > 0 && (
          <div className="space-y-1 border-t pt-3">
            <p className="text-xs text-gray-500">People with access</p>
            {shares.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name || s.email} · {s.role}</span>
                <button onClick={() => handleRevoke(s.id)} className="text-xs text-red-500">Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t pt-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="text-sm text-gray-600">Or create a public link</label>
          <label className="text-xs text-gray-500">Expires (optional)</label>
          <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          <label className="text-xs text-gray-500">Password (optional)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
        </div>

        <button onClick={handleCreateLink} className="w-full rounded bg-black py-2 text-sm text-white">Create link</button>
        {linkUrl && <div className="rounded bg-gray-50 p-2 text-xs break-all">{linkUrl}</div>}
        <button onClick={onClose} className="w-full text-sm text-gray-500">Close</button>
      </div>
    </div>
  );
}