'use client';

export default function Toolbar({
  view,
  onViewChange,
  onNewFolder,
  onUpload
}: {
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex overflow-hidden rounded border">
        <button
          onClick={() => onViewChange('grid')}
          className={`px-2 py-1.5 text-sm ${view === 'grid' ? 'bg-gray-100' : ''}`}
        >
          ▦
        </button>
        <button
          onClick={() => onViewChange('list')}
          className={`px-2 py-1.5 text-sm border-l ${view === 'list' ? 'bg-gray-100' : ''}`}
        >
          ☰
        </button>
      </div>
      <button
        onClick={onNewFolder}
        className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        📁+ New Folder
      </button>
      <button
        onClick={onUpload}
        className="flex items-center gap-1 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        ⬆ Upload
      </button>
    </div>
  );
}