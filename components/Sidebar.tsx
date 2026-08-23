import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 space-y-4 border-r p-4 text-sm">
      <SearchBar />
      <div className="space-y-1">
        <Link href="/" className="block rounded px-3 py-2 hover:bg-gray-100">📁 My Drive</Link>
        <Link href="/starred" className="block rounded px-3 py-2 hover:bg-gray-100">⭐ Starred</Link>
        <Link href="/trash" className="block rounded px-3 py-2 hover:bg-gray-100">🗑️ Trash</Link>
      </div>
    </aside>
  );
}