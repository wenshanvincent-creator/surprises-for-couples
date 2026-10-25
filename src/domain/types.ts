export interface Asset {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface Memory {
  id: string;
  date: string;
  title: string;
  body: string;
  assetIds: string[];
}

export interface Project {
  schemaVersion: 1;
  id: string;
  title: string;
  names: [string, string];
  startDate: string;
  dedication: string;
  letter: string;
  occasion: { title: string; date: string } | null;
  accent: string;
  memories: Memory[];
  surprises: string[];
  assets: Asset[];
}

export interface ProjectBundle {
  project: Project;
  blobs: Record<string, Blob>;
}

export interface RecipientProps {
  project: Project;
  assetUrls: Record<string, string>;
}
