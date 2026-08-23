'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FileItem } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<FileItem[] | null>(null);

  useEffect(() => {
    if (!q) return;
    api.search(q).then((res) => setResults(res.results));
  }, [q]);

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-lg font-semibold">Search results for "{q}"</h1>
      {results === null && <p className="text-sm text-gray-400">Searching...</p>}
      {results?.length === 0 && <p className="text-sm text-gray-400">No results.</p>}
      <div className="space-y-2">
        {results?.map((file) => (
          <div key={file.id} className="rounded border p-3 text-sm">📄 {file.name}</div>
        ))}
      </div>
    </div>
  );
}