'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FolderContents } from '@/lib/types';
import Breadcrumbs from '@/components/Breadcrumbs';
import FileGrid from '@/components/FileGrid';
import UploadDropzone from '@/components/UploadDropzone';
import ShareDialog from '@/components/ShareDialog';

export default function FolderPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<FolderContents | null>(null);
  const [shareTarget, setShareTarget] = useState<string | null>(null);

  const load = async () => {
    const result = await api.getFolder(params.id);
    setData(result);
  };

  useEffect(() => { load(); }, [params.id]);

  if (!data) return <p className="p-8 text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6 p-8">
      <Breadcrumbs path={data.path} onMoved={load} />
      <UploadDropzone folderId={params.id} onUploaded={load} />
      <FileGrid
        folders={data.children.folders}
        files={data.children.files}
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