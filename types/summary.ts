import { SummaryLength } from './document';

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

export interface SummarizeRequest {
  text: string;
  length: SummaryLength;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  wordCount: number;
  model?: string;
  chunksProcessed?: number;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}
