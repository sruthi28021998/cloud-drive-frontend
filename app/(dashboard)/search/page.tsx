'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FileItem } from '@/lib/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<FileItem[] | null>(null);
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    if (!q) return;
    setResults(null);
    api.search(q, type, sort).then((res) => setResults(res.results));
  }, [q, type, sort]);

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-lg font-semibold">Search results for "{q}"</h1>

      <div className="flex gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border px-2 py-1 text-sm">
          <option value="all">All types</option>
          <option value="image/png">PNG images</option>
          <option value="image/jpeg">JPEG images</option>
          <option value="application/pdf">PDF</option>
          <option value="text/plain">Text</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded border px-2 py-1 text-sm">
          <option value="date">Newest first</option>
          <option value="name">Name (A–Z)</option>
          <option value="size">Largest first</option>
        </select>
      </div>

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

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-400">Loading...</p>}>
      <SearchResults />
    </Suspense>
  );
}