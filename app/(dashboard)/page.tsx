'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import FileGrid from '@/components/FileGrid';
import UploadDropzone from '@/components/UploadDropzone';
import ShareDialog from '@/components/ShareDialog';
import { FolderItem, FileItem } from '@/lib/types';

export default function DashboardPage() {
  const [children, setChildren] = useState<{ folders: FolderItem[]; files: FileItem[] } | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  const load = async () => {
    const result = await api.getRoot();
    setChildren(result.children);
  };

  useEffect(() => { load(); }, []);

  if (!children) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-lg font-semibold">My Drive</h1>
      <UploadDropzone folderId={null} onUploaded={load} />
      <FileGrid
        folders={children.folders}
        files={children.files}
        onDeleteFile={async (id) => { await api.deleteFile(id); load(); }}
        onDeleteFolder={async (id) => { await api.deleteFolder(id); load(); }}
        onShareFile={(id) => setShareTarget(id)}
        onRefresh={load}
      />
      {shareTarget && (
        <ShareDialog resourceType="file" resourceId={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}