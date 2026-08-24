'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileItem, FolderItem } from '@/lib/types';
import RenameDialog from './RenameDialog';
import { api } from '@/lib/api';

type DragItem = { id: string; kind: 'file' | 'folder' };

export default function FileGrid({
  folders,
  files,
  onDeleteFile,
  onDeleteFolder,
  onShareFile,
  onRefresh
}: {
  folders: FolderItem[];
  files: FileItem[];
  onDeleteFile: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onShareFile: (id: string) => void;
  onRefresh: () => void;
}) {
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; kind: 'file' | 'folder' } | null>(null);
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

  return (
    <>
      {moveError && <p className="mb-2 text-sm text-red-600">{moveError}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            draggable
            onDragStart={(e) => handleDragStart(e, { id: folder.id, kind: 'folder' })}
            onDragOver={(e) => { e.preventDefault(); setDragOverId(folder.id); }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, folder.id)}
            className={`group relative rounded-lg border p-4 hover:bg-gray-50 ${
              dragOverId === folder.id ? 'border-black bg-gray-50' : ''
            }`}
          >
            <Link href={`/folder/${folder.id}`}>
              <p className="truncate text-sm font-medium">📁 {folder.name}</p>
            </Link>
            <div className="absolute right-2 top-2 hidden gap-2 group-hover:flex">
              <button onClick={() => setRenameTarget({ id: folder.id, name: folder.name, kind: 'folder' })} className="text-xs text-gray-500">Rename</button>
              <button onClick={() => onDeleteFolder(folder.id)} className="text-xs text-red-500">Delete</button>
            </div>
          </div>
        ))}
        {files.map((file) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, { id: file.id, kind: 'file' })}
            className="group relative rounded-lg border p-4"
          >
            <p className="truncate text-sm font-medium">📄 {file.name}</p>
            <p className="text-xs text-gray-400">{formatSize(file.size_bytes)}</p>
            <div className="absolute right-2 top-2 hidden flex-wrap justify-end gap-2 group-hover:flex">
              <button onClick={() => handleDownload(file.id)} className="text-xs text-green-600">Download</button>
              <button onClick={() => handleStar(file.id)} className="text-xs text-yellow-500">★</button>
              <button onClick={() => setRenameTarget({ id: file.id, name: file.name, kind: 'file' })} className="text-xs text-gray-500">Rename</button>
              <button onClick={() => onShareFile(file.id)} className="text-xs text-blue-500">Share</button>
              <button onClick={() => onDeleteFile(file.id)} className="text-xs text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {renameTarget && (
        <RenameDialog
          initialName={renameTarget.name}
          onCancel={() => setRenameTarget(null)}
          onConfirm={handleRename}
        />
      )}
    </>
  );
}