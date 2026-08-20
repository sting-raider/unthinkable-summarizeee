/**
 * Normalizes extracted text from PDF or OCR:
 * - Unifies line endings (\r\n -> \n)
 * - Normalizes horizontal whitespace
 * - Collapses excessive vertical whitespace (max 2 newlines)
 * - Trims extraneous whitespace at line start/end
 * - Preserves paragraph boundaries
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Unify line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove null bytes and non-printable control chars except \n and \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace tabs and multiple horizontal spaces with a single space
    .replace(/[^\S\n]+/g, ' ')
    // Trim each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Collapse 3 or more consecutive newlines into 2 (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Accurately counts words in a text string.
 */
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  const matches = text.trim().match(/[\w\d'-]+/gu);
  return matches ? matches.length : 0;
}

/**
 * Calculates estimated reading time in minutes (assumes ~200 wpm).
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Heuristic check to ensure OCR or PDF text has meaningful content.
 * Checks minimum character length and ratio of alphanumeric characters.
 */
export function hasMeaningfulContent(text: string, minChars = 15): boolean {
  if (!text || text.trim().length < minChars) return false;
  const clean = text.replace(/\s+/g, '');
  if (clean.length < minChars) return false;

  const alphaNumericMatches = clean.match(/[\p{L}\p{N}]/gu);
  if (!alphaNumericMatches) return false;

  // At least 40% of characters should be alphanumeric letters or numbers
  const ratio = alphaNumericMatches.length / clean.length;
  return ratio >= 0.4;
}
