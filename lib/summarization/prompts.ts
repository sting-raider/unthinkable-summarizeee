import { SummaryLength } from '@/types/document';

export const SYSTEM_PROMPT = `You are a professional, highly accurate document analysis and summarization assistant.
Your job is to read documents and produce faithful, well-structured summaries with extracted key points.

Rules:
1. Grounding: Summarize ONLY information explicitly contained in the provided text. Do NOT hallucinate, extrapolate, or bring in outside knowledge.
2. Structure: You must return valid JSON strictly matching the requested schema.
3. Clarity: Maintain objective, direct, and professional tone.
4. Accuracy: Preserve all critical numbers, statistics, names, metrics, and dates accurately.`;

export function getSummaryLengthInstruction(length: SummaryLength): string {
  switch (length) {
    case 'short':
      return 'Generate a concise, high-level summary (approx. 100–150 words) covering only the most essential message and primary conclusion.';
    case 'long':
      return 'Generate a comprehensive, detailed summary (approx. 500–700 words) thoroughly preserving the core arguments, context, supporting evidence, key findings, and implications.';
    case 'medium':
    default:
      return 'Generate a balanced, well-rounded summary (approx. 250–400 words) covering the main ideas, core arguments, and important supporting details.';
  }
}

export function buildDirectPrompt(text: string, length: SummaryLength): string {
  const lengthInstruction = getSummaryLengthInstruction(length);

  return `Please analyze and summarize the following document.

Summary Target: ${length.toUpperCase()}
Instruction: ${lengthInstruction}

Key Points Instruction: Extract between 3 to 6 distinct, high-impact key takeaway points from the document.

Output format: You must respond ONLY with a valid JSON object matching this exact TypeScript structure:
{
  "summary": "Full prose summary formatted into clear paragraphs where appropriate.",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ]
}

Document Content:
---
${text}
---`;
}

export function buildChunkPrompt(chunkText: string, chunkIndex: number, totalChunks: number): string {
  return `Analyze and summarize part ${chunkIndex + 1} of ${totalChunks} of a larger document.
Extract the key facts, findings, numbers, and main themes from this specific section.

Output format: You must respond ONLY with a valid JSON object:
{
  "summary": "Concise section summary capturing all core facts and arguments.",
  "keyPoints": [
    "Important point from this section 1",
    "Important point from this section 2"
  ]
}

Section Content:
---
${chunkText}
---`;
}

export function buildSynthesisPrompt(
  chunkSummaries: { summary: string; keyPoints: string[] }[],
  length: SummaryLength
): string {
  const lengthInstruction = getSummaryLengthInstruction(length);
  const combinedData = chunkSummaries
    .map(
      (c, i) =>
        `### Section ${i + 1}:\nSummary: ${c.summary}\nKey Points:\n${c.keyPoints.map((p) => `- ${p}`).join('\n')}`
    )
    .join('\n\n');

  return `The following are intermediate summaries and key points extracted from consecutive sections of a long document.
Synthesize them into a single, cohesive, unified final summary and a master list of key takeaway points.

Final Summary Target: ${length.toUpperCase()}
Instruction: ${lengthInstruction}

Output format: You must respond ONLY with a valid JSON object:
{
  "summary": "Unified prose summary synthesizing the entire document seamlessly without awkward section transitions.",
  "keyPoints": [
    "Master key takeaway point 1",
    "Master key takeaway point 2",
    "Master key takeaway point 3",
    "Master key takeaway point 4",
    "Master key takeaway point 5"
  ]
}

Intermediate Summaries:
---
${combinedData}
---`;
}
