import { SummaryLength } from '@/types/document';
import { SummarizeResponse, SummaryResult } from '@/types/summary';
import { DeepSeekSummarizationProvider, SummarizationProvider } from './deepseek';
import { chunkText, DIRECT_SUMMARY_MAX_CHARS } from './chunkText';
import { countWords } from '../extraction/normalizeText';

interface SummarizeOptions {
  provider?: SummarizationProvider;
}

/**
 * Summarizes text with appropriate direct vs map-reduce chunking strategy.
 */
export async function generateDocumentSummary(
  text: string,
  length: SummaryLength,
  options?: SummarizeOptions
): Promise<SummarizeResponse> {
  const provider = options?.provider || new DeepSeekSummarizationProvider();

  // If text is short enough, summarize directly
  if (text.length <= DIRECT_SUMMARY_MAX_CHARS) {
    const result = await provider.summarize(text, length);
    return {
      summary: result.summary,
      keyPoints: result.keyPoints,
      wordCount: countWords(result.summary),
      model: 'deepseek-chat',
      chunksProcessed: 1,
    };
  }

  // Otherwise, split into chunks and map-reduce
  const chunks = chunkText(text);
  const chunkSummaries: SummaryResult[] = [];

  // Process chunks sequentially or in small batches to respect rate limits
  for (let i = 0; i < chunks.length; i++) {
    const chunkSummary = await provider.summarizeChunk(chunks[i], i, chunks.length);
    chunkSummaries.push(chunkSummary);
  }

  // Synthesize chunk summaries into final structured summary
  const finalResult = await provider.synthesize(chunkSummaries, length);

  return {
    summary: finalResult.summary,
    keyPoints: finalResult.keyPoints,
    wordCount: countWords(finalResult.summary),
    model: 'deepseek-chat',
    chunksProcessed: chunks.length,
  };
}
