import { describe, it, expect, vi } from 'vitest';
import { generateDocumentSummary } from '@/lib/summarization/summarize';
import { SummarizationProvider } from '@/lib/summarization/deepseek';
import { SummaryResult } from '@/types/summary';

describe('generateDocumentSummary orchestrator', () => {
  it('calls direct summarize when text is within direct size limit', async () => {
    const mockProvider: SummarizationProvider = {
      summarize: vi.fn().mockResolvedValue({
        summary: 'Direct summary result.',
        keyPoints: ['Key takeaway point 1', 'Key takeaway point 2'],
      }),
      summarizeChunk: vi.fn(),
      synthesize: vi.fn(),
    };

    const shortText = 'Small document text under the chunking threshold.';
    const response = await generateDocumentSummary(shortText, 'short', { provider: mockProvider });

    expect(mockProvider.summarize).toHaveBeenCalledWith(shortText, 'short');
    expect(mockProvider.summarizeChunk).not.toHaveBeenCalled();
    expect(mockProvider.synthesize).not.toHaveBeenCalled();

    expect(response.summary).toBe('Direct summary result.');
    expect(response.keyPoints).toHaveLength(2);
    expect(response.chunksProcessed).toBe(1);
    expect(response.wordCount).toBe(3);
  });

  it('chunks and synthesizes when document exceeds direct limit', async () => {
    const mockChunkSummary: SummaryResult = {
      summary: 'Chunk summary.',
      keyPoints: ['Chunk point'],
    };
    const mockFinalSummary: SummaryResult = {
      summary: 'Final synthesized summary across all chunks.',
      keyPoints: ['Synthesized point 1', 'Synthesized point 2'],
    };

    const mockProvider: SummarizationProvider = {
      summarize: vi.fn(),
      summarizeChunk: vi.fn().mockResolvedValue(mockChunkSummary),
      synthesize: vi.fn().mockResolvedValue(mockFinalSummary),
    };

    // Construct text larger than DIRECT_SUMMARY_MAX_CHARS (12,000)
    const longText = 'Paragraph of text content.\n\n'.repeat(600);

    const response = await generateDocumentSummary(longText, 'long', { provider: mockProvider });

    expect(mockProvider.summarize).not.toHaveBeenCalled();
    expect(mockProvider.summarizeChunk).toHaveBeenCalled();
    expect(mockProvider.synthesize).toHaveBeenCalled();

    expect(response.summary).toBe('Final synthesized summary across all chunks.');
    expect(response.chunksProcessed).toBeGreaterThan(1);
  });
});
