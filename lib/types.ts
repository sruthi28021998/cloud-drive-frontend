export interface FileItem {
  id: string;
  name: string;
  mime_type: string;
  size_bytes: number;
  folder_id: string | null;
  updated_at: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  updated_at: string;
}

export interface FolderContents {
  folder: FolderItem;
  children: { folders: FolderItem[]; files: FileItem[] };
  path: { id: string; name: string }[];
}