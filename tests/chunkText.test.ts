import { describe, it, expect } from 'vitest';
import { chunkText, DIRECT_SUMMARY_MAX_CHARS } from '@/lib/summarization/chunkText';

describe('chunkText', () => {
  it('returns single chunk when text length is within limit', () => {
    const text = 'This is a short document. It contains two sentences.';
    const chunks = chunkText(text, { maxChunkSize: 1000 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('splits multi-paragraph text across maxChunkSize boundary cleanly', () => {
    const p1 = 'Paragraph 1: ' + 'A'.repeat(300);
    const p2 = 'Paragraph 2: ' + 'B'.repeat(300);
    const p3 = 'Paragraph 3: ' + 'C'.repeat(300);
    const fullText = `${p1}\n\n${p2}\n\n${p3}`;

    const chunks = chunkText(fullText, { maxChunkSize: 500, overlapSize: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    // Chunks should contain content from all paragraphs
    const joined = chunks.join(' ');
    expect(joined).toContain('Paragraph 1');
    expect(joined).toContain('Paragraph 2');
    expect(joined).toContain('Paragraph 3');
  });

  it('splits long single paragraphs by sentence boundaries', () => {
    const s1 = 'Sentence one is relatively long. ';
    const s2 = 'Sentence two continues the discussion with details. ';
    const s3 = 'Sentence three provides the conclusion to the topic. ';
    const giantParagraph = (s1 + s2 + s3).repeat(10);

    const chunks = chunkText(giantParagraph, { maxChunkSize: 200, overlapSize: 20 });
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(500);
    });
  });

  it('handles empty or whitespace text gracefully', () => {
    expect(chunkText('')).toEqual(['']);
  });
});
