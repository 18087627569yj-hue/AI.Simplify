export type AnalysisMode = 'auto' | 'general' | 'crowd_analysis';

export type ImageSource = 'web' | 'upload' | 'paste';

export interface PendingImage {
  id: string;
  src: string;
  thumbnailSrc?: string;
  source: ImageSource;
  createdAt: number;
  pageUrl?: string;
  pageTitle?: string;
  fileName?: string;
  width?: number;
  height?: number;
}

export interface EditableTags {
  subject: string[];
  composition: string[];
  lighting: string[];
  palette: string[];
  style: string[];
}

export interface AnalysisResult {
  mode: Exclude<AnalysisMode, 'auto'>;
  confidence: number;
  prompt: string;
  usageAdvice: string;
  editableTags: EditableTags;
  isMock: boolean;
}

export interface HistoryItem {
  id: string;
  image: PendingImage;
  result: AnalysisResult;
  createdAt: number;
}

export const STORAGE_KEYS = {
  pendingImage: 'promptLens.pendingImage',
  history: 'promptLens.history',
} as const;
