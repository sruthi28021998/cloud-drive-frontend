'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { api } from '@/lib/api';

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col justify-between border-r p-4 text-sm">
      <div className="space-y-4">
        <SearchBar />
        <div className="space-y-1">
          <Link href="/" className="block rounded px-3 py-2 hover:bg-gray-100">📁 My Drive</Link>
          <Link href="/starred" className="block rounded px-3 py-2 hover:bg-gray-100">⭐ Starred</Link>
          <Link href="/trash" className="block rounded px-3 py-2 hover:bg-gray-100">🗑️ Trash</Link>
          <Link href="/activity" className="block rounded px-3 py-2 hover:bg-gray-100">🕒 Activity</Link>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="rounded px-3 py-2 text-left text-red-500 hover:bg-gray-100"
      >
        Logout
      </button>
    </aside>
  );
}