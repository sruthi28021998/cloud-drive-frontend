'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import FileGrid from '@/components/FileGrid';
import ShareDialog from '@/components/ShareDialog';
import Toolbar from '@/components/Toolbar';
import UploadDialog from '@/components/UploadDialog';
import NewFolderDialog from '@/components/NewFolderDialog';
import { FolderItem, FileItem } from '@/lib/types';

export default function DashboardPage() {
  const [children, setChildren] = useState<{ folders: FolderItem[]; files: FileItem[] } | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  const load = async () => {
    const result = await api.getRoot();
    setChildren(result.children);
  };

  useEffect(() => { load(); }, []);

  const handleCreateFolder = async (name: string) => {
    await api.createFolder({ name, parentId: null });
    setShowNewFolder(false);
    load();
  };

  if (!children) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">My Drive</h1>
        <Toolbar
          view={view}
          onViewChange={setView}
          onNewFolder={() => setShowNewFolder(true)}
          onUpload={() => setShowUpload(true)}
        />
      </div>

      <FileGrid
        folders={children.folders}
        files={children.files}
        view={view}
        onDeleteFile={async (id) => { await api.deleteFile(id); load(); }}
        onDeleteFolder={async (id) => { await api.deleteFolder(id); load(); }}
        onShareFile={(id) => setShareTarget(id)}
        onRefresh={load}
      />

      {shareTarget && (
        <ShareDialog resourceType="file" resourceId={shareTarget} onClose={() => setShareTarget(null)} />
      )}
      {showUpload && (
        <UploadDialog folderId={null} onClose={() => setShowUpload(false)} onUploaded={load} />
      )}
      {showNewFolder && (
        <NewFolderDialog onCancel={() => setShowNewFolder(false)} onConfirm={handleCreateFolder} />
      )}
    </div>
  );
}