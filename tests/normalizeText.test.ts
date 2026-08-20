import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  countWords,
  calculateReadingTime,
  hasMeaningfulContent,
} from '@/lib/extraction/normalizeText';

describe('normalizeText', () => {
  it('unifies carriage returns and trims line boundaries', () => {
    const input = '  Hello \r\n World!  \r\n Next line.  ';
    const output = normalizeText(input);
    expect(output).toBe('Hello\nWorld!\nNext line.');
  });

  it('collapses multiple spaces into a single space', () => {
    const input = 'This   has     excessive       spacing.';
    const output = normalizeText(input);
    expect(output).toBe('This has excessive spacing.');
  });

  it('collapses 3+ consecutive newlines into 2 (paragraph break)', () => {
    const input = 'Paragraph 1\n\n\n\n\nParagraph 2';
    const output = normalizeText(input);
    expect(output).toBe('Paragraph 1\n\nParagraph 2');
  });

  it('strips non-printable control characters while keeping tabs and newlines', () => {
    const input = 'Clean\x00 text\x07 with \x08control chars';
    const output = normalizeText(input);
    expect(output).toBe('Clean text with control chars');
  });
});

describe('countWords', () => {
  it('returns 0 for empty or whitespace text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n  \t ')).toBe(0);
  });

  it('counts words accurately in standard sentence', () => {
    expect(countWords('The quick brown fox jumps over the lazy dog.')).toBe(9);
  });

  it('handles hyphenated and apostrophe words properly', () => {
    expect(countWords("State-of-the-art AI shouldn't fail.")).toBe(4);
  });
});

describe('calculateReadingTime', () => {
  it('returns 0 for 0 words', () => {
    expect(calculateReadingTime(0)).toBe(0);
  });

  it('returns minimum 1 minute for small text', () => {
    expect(calculateReadingTime(50)).toBe(1);
  });

  it('calculates ~200 wpm appropriately', () => {
    expect(calculateReadingTime(600)).toBe(3);
    expect(calculateReadingTime(1050)).toBe(6);
  });
});

describe('hasMeaningfulContent', () => {
  it('rejects short or empty strings', () => {
    expect(hasMeaningfulContent('')).toBe(false);
    expect(hasMeaningfulContent('abc')).toBe(false);
  });

  it('rejects random OCR symbol noise', () => {
    expect(hasMeaningfulContent('... / / | | _ ~ ! @ # $ %')).toBe(false);
  });

  it('accepts readable text with standard alphanumeric ratio', () => {
    expect(hasMeaningfulContent('Executive Summary: Q4 financial revenue grew by 18% year over year.')).toBe(true);
  });
});
