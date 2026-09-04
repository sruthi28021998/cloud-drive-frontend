'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileItem, FolderItem } from '@/lib/types';
import RenameDialog from './RenameDialog';
import FileThumbnail from './FileThumbnail';
import VersionHistoryDialog from './VersionHistoryDialog';
import { api } from '@/lib/api';

type DragItem = { id: string; kind: 'file' | 'folder' };

export default function FileGrid({
  folders,
  files,
  view = 'grid',
  onDeleteFile,
  onDeleteFolder,
  onShareFile,
  onRefresh
}: {
  folders: FolderItem[];
  files: FileItem[];
  view?: 'grid' | 'list';
  onDeleteFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onShareFile: (id: string) => void;
  onRefresh: () => void;
}) {
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; kind: 'file' | 'folder' } | null>(null);
  const [versionTarget, setVersionTarget] = useState<{ id: string; name: string } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState('');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRename = async (name: string) => {
    if (!renameTarget) return;
    if (renameTarget.kind === 'file') await api.renameFile(renameTarget.id, name);
    else await api.renameFolder(renameTarget.id, name);
    setRenameTarget(null);
    onRefresh();
  };

  const handleStar = async (fileId: string) => {
    await api.addStar({ resourceType: 'file', resourceId: fileId });
    onRefresh();
  };

  const handleDownload = async (fileId: string) => {
    const result = await api.getFile(fileId);
    window.open(result.signedUrl, '_blank');
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverId(null);
    setMoveError('');

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const item: DragItem = JSON.parse(raw);

    if (item.kind === 'folder' && item.id === targetFolderId) return;

    try {
      if (item.kind === 'file') await api.moveFile(item.id, targetFolderId);
      else await api.moveFolder(item.id, targetFolderId);
      onRefresh();
    } catch (err: any) {
      setMoveError(err.message);
    }
  };

  const fileActionButtons = (file: FileItem) => (
    <>
      <button onClick={() => handleDownload(file.id)} className="text-xs text-green-600">Download</button>
      <button onClick={() => handleStar(file.id)} className="text-xs text-yellow-500">★</button>
      <button onClick={() => setRenameTarget({ id: file.id, name: file.name, kind: 'file' })} className="text-xs text-gray-500">Rename</button>
      <button onClick={() => onShareFile(file.id)} className="text-xs text-blue-500">Share</button>
      <button onClick={() => setVersionTarget({ id: file.id, name: file.name })} className="text-xs text-purple-600">Versions</button>
      <button onClick={() => onDeleteFile(file.id)} className="text-xs text-red-500">Delete</button>
    </>
  );

  const folderActionButtons = (folder: FolderItem) => (
    <>
      <button onClick={() => setRenameTarget({ id: folder.id, name: folder.name, kind: 'folder' })} className="text-xs text-gray-500">Rename</button>
      <button onClick={() => onDeleteFolder(folder.id)} className="text-xs text-red-500">Delete</button>
    </>
  );

  return (
    <>
      {moveError && <p className="mb-2 text-sm text-red-600">{moveError}</p>}

      {view === 'list' ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
            <span>Name</span>
            <span>Size</span>
            <span>Actions</span>
          </div>

          {folders.map((folder) => (
            <div
              key={folder.id}
              draggable
              onDragStart={(e) => handleDragStart(e, { id: folder.id, kind: 'folder' })}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(folder.id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleDrop(e, folder.id)}
              className={`group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-2 hover:bg-gray-50 ${
                dragOverId === folder.id ? 'bg-gray-100' : ''
              }`}
            >
              <Link href={`/folder/${folder.id}`} className="min-w-0 truncate text-sm font-medium">
                📁 {folder.name}
              </Link>
              <span className="text-xs text-gray-400">—</span>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100">
                {folderActionButtons(folder)}
              </div>
            </div>
          ))}

          {files.map((file) => (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, { id: file.id, kind: 'file' })}
              className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b px-4 py-2 last:border-b-0 hover:bg-gray-50"
            >
              <span className="min-w-0 truncate text-sm font-medium">📄 {file.name}</span>
              <span className="text-xs text-gray-400">{formatSize(file.size_bytes)}</span>
              <div className="flex flex-wrap gap-3 opacity-0 group-hover:opacity-100">
                {fileActionButtons(file)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {folders.map((folder) => (
            <div
              key={folder.id}
              draggable
              onDragStart={(e) => handleDragStart(e, { id: folder.id, kind: 'folder' })}
              onDragOver={(e) => { e.preventDefault(); setDragOverId(folder.id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleDrop(e, folder.id)}
              className={`group rounded-lg border p-4 hover:bg-gray-50 ${
                dragOverId === folder.id ? 'border-black bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Link href={`/folder/${folder.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">📁 {folder.name}</p>
                </Link>
                <div className="flex shrink-0 gap-3 opacity-0 group-hover:opacity-100">
                  {folderActionButtons(folder)}
                </div>
              </div>
            </div>
          ))}

          {files.map((file) => (
            <div
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, { id: file.id, kind: 'file' })}
              className="group rounded-lg border p-4"
            >
              <FileThumbnail fileId={file.id} mimeType={file.mime_type} name={file.name} />

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">📄 {file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size_bytes)}</p>
                </div>
              </div>

              <div className="mt-2 flex shrink-0 flex-wrap items-center gap-3 opacity-0 group-hover:opacity-100">
                {fileActionButtons(file)}
              </div>
            </div>
          ))}
        </div>
      )}

      {renameTarget && (
        <RenameDialog
          initialName={renameTarget.name}
          onCancel={() => setRenameTarget(null)}
          onConfirm={handleRename}
        />
      )}

      {versionTarget && (
        <VersionHistoryDialog
          fileId={versionTarget.id}
          fileName={versionTarget.name}
          onClose={() => setVersionTarget(null)}
        />
      )}
    </>
  );
}