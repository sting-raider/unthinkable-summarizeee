export interface ChunkOptions {
  maxChunkSize?: number; // target max characters per chunk (default 10,000)
  overlapSize?: number;  // overlap characters between consecutive chunks (default 400)
}

export const DIRECT_SUMMARY_MAX_CHARS = 12000; // ~2,500-3,000 words

/**
 * Splits a long text document into coherent chunks preserving paragraph and sentence boundaries.
 */
export function chunkText(text: string, options?: ChunkOptions): string[] {
  const maxChunkSize = options?.maxChunkSize || 10000;
  const overlapSize = options?.overlapSize || 400;

  if (!text || text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  // Split primarily on paragraph breaks (\n\n)
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // If single paragraph exceeds maxChunkSize, split it by sentences
    if (trimmedPara.length > maxChunkSize) {
      // Flush current accumulated chunk if any
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentences = trimmedPara.match(/[^.!?]+[.!?]+|\S+/g) || [trimmedPara];
      let sentenceChunk = '';

      for (const sentence of sentences) {
        if ((sentenceChunk + ' ' + sentence).length > maxChunkSize && sentenceChunk.trim()) {
          chunks.push(sentenceChunk.trim());
          sentenceChunk = sentence;
        } else {
          sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + sentence : sentence;
        }
      }

      if (sentenceChunk.trim()) {
        currentChunk = sentenceChunk.trim();
      }
      continue;
    }

    // Normal paragraph accumulation
    if ((currentChunk + '\n\n' + trimmedPara).length > maxChunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        // Add overlap from the end of current chunk if feasible
        const overlap = currentChunk.slice(-overlapSize).trim();
        currentChunk = overlap ? `${overlap}\n\n${trimmedPara}` : trimmedPara;
      } else {
        currentChunk = trimmedPara;
      }
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}
