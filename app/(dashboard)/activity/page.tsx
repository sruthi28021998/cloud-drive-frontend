'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ActivityItem {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
}

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    api.getActivity().then((res) => setItems(res.activities));
  }, []);

  if (!items) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-lg font-semibold">Activity</h1>
      {items.length === 0 && <p className="text-sm text-gray-400">No activity yet.</p>}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded border p-3 text-sm">
            <span className="capitalize">{item.action}</span> · {item.resource_type} · {new Date(item.created_at).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}