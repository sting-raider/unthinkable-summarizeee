import { describe, it, expect } from 'vitest';
import {
  getSummaryLengthInstruction,
  buildDirectPrompt,
  buildChunkPrompt,
  buildSynthesisPrompt,
  SYSTEM_PROMPT,
} from '@/lib/summarization/prompts';

describe('prompts', () => {
  it('returns appropriate guidance for short, medium, and long targets', () => {
    const shortDesc = getSummaryLengthInstruction('short');
    const medDesc = getSummaryLengthInstruction('medium');
    const longDesc = getSummaryLengthInstruction('long');

    expect(shortDesc).toContain('100–150 words');
    expect(medDesc).toContain('250–400 words');
    expect(longDesc).toContain('500–700 words');
  });

  it('builds direct prompt with valid schema requirements and grounding instructions', () => {
    const text = 'Important financial document details.';
    const prompt = buildDirectPrompt(text, 'medium');

    expect(prompt).toContain('MEDIUM');
    expect(prompt).toContain('"summary"');
    expect(prompt).toContain('"keyPoints"');
    expect(prompt).toContain(text);
  });

  it('builds chunk prompt with chunk indices', () => {
    const chunk = 'Section 2 text content.';
    const prompt = buildChunkPrompt(chunk, 1, 4);

    expect(prompt).toContain('part 2 of 4');
    expect(prompt).toContain(chunk);
  });

  it('builds synthesis prompt combining intermediate section summaries', () => {
    const summaries = [
      { summary: 'Section 1 summary.', keyPoints: ['Point 1A', 'Point 1B'] },
      { summary: 'Section 2 summary.', keyPoints: ['Point 2A'] },
    ];
    const prompt = buildSynthesisPrompt(summaries, 'long');

    expect(prompt).toContain('Section 1 summary.');
    expect(prompt).toContain('Point 1A');
    expect(prompt).toContain('Section 2 summary.');
    expect(prompt).toContain('LONG');
  });
});
