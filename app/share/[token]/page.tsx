'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [resource, setResource] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const load = async (pwd?: string) => {
    setError('');
    try {
      const result = await api.resolveLink(token, pwd);
      setResource(result);
      setNeedsPassword(false);

      if (result.resourceType === 'file' && result.resource.storage_key) {
        const fileResult = await api.resolveLinkDownload(token, pwd);
        setSignedUrl(fileResult.signedUrl);
      }
    } catch (err: any) {
      if (err.message.includes('Password')) setNeedsPassword(true);
      else setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [token]);
  
  if (needsPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-3 rounded-lg border p-6">
          <p className="text-sm">This link is password protected.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <button onClick={() => load(password)} className="w-full rounded bg-black py-2 text-sm text-white">
            Unlock
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="p-8 text-sm text-red-600">{error}</p>;
  }

  if (!resource) {
    return <p className="p-8 text-sm text-gray-400">Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold">{resource.resource.name}</h1>
      <p className="text-sm text-gray-500">Shared {resource.resourceType}</p>

      {signedUrl && (
        <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded bg-black px-4 py-2 text-sm text-white">
          Open / Download
        </a>
      )}
    </div>
  );
}