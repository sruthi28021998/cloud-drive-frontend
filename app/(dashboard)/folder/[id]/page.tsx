'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FolderContents } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import FileGrid from '@/components/FileGrid';
import ShareDialog from '@/components/ShareDialog';
import Toolbar from '@/components/Toolbar';
import UploadDialog from '@/components/UploadDialog';
import NewFolderDialog from '@/components/NewFolderDialog';

export default function FolderPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<FolderContents | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  const load = async () => {
    const result = await api.getFolder(params.id);
    setData(result);
  };

  useEffect(() => { load(); }, [params.id]);

  const handleCreateFolder = async (name: string) => {
    await api.createFolder({ name, parentId: params.id });
    setShowNewFolder(false);
    load();
  };

  if (!data) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Breadcrumbs path={data.path} onMoved={load} />
        <Toolbar
          view={view}
          onViewChange={setView}
          onNewFolder={() => setShowNewFolder(true)}
          onUpload={() => setShowUpload(true)}
        />
      </div>

      <FileGrid
        folders={data.children.folders}
        files={data.children.files}
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
        <UploadDialog folderId={params.id} onClose={() => setShowUpload(false)} onUploaded={load} />
      )}
      {showNewFolder && (
        <NewFolderDialog onCancel={() => setShowNewFolder(false)} onConfirm={handleCreateFolder} />
      )}
    </div>
  );
}