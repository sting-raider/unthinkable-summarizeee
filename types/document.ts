export type SummaryLength = 'short' | 'medium' | 'long';

export type ProcessingStage =
  | 'idle'
  | 'extracting'
  | 'ocr'
  | 'summarizing'
  | 'complete'
  | 'error';

export interface ExtractedDocument {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  text: string;
  pageCount?: number;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface OCRProgressInfo {
  status: string;
  progress: number;
}
