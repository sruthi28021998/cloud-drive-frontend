import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 space-y-1 border-r p-4 text-sm">
      <Link href="/" className="block rounded px-3 py-2 hover:bg-gray-100">📁 My Drive</Link>
      <Link href="/trash" className="block rounded px-3 py-2 hover:bg-gray-100">🗑️ Trash</Link>
    </aside>
  );
}