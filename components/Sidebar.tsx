'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import StorageIndicator from './StorageIndicator';
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
        <div className="flex items-center gap-2 px-1 pb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
            C
          </span>
          <span className="text-base font-semibold">
            <span className="text-black">Cloud</span>
            <span className="text-blue-600">Drive</span>
          </span>
        </div>

        <SearchBar />
        <div className="space-y-1">
          <Link href="/" className="block rounded px-3 py-2 hover:bg-gray-100">📁 My Drive</Link>
          <Link href="/starred" className="block rounded px-3 py-2 hover:bg-gray-100">⭐ Starred</Link>
          <Link href="/trash" className="block rounded px-3 py-2 hover:bg-gray-100">🗑️ Trash</Link>
          <Link href="/activity" className="block rounded px-3 py-2 hover:bg-gray-100">🕒 Activity</Link>
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <StorageIndicator />
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}