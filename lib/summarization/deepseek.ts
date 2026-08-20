import { SummaryLength } from '@/types/document';
import { SummaryResult } from '@/types/summary';
import {
  SYSTEM_PROMPT,
  buildDirectPrompt,
  buildChunkPrompt,
  buildSynthesisPrompt,
} from './prompts';

export interface SummarizationProvider {
  summarize(text: string, length: SummaryLength): Promise<SummaryResult>;
  summarizeChunk(chunk: string, index: number, total: number): Promise<SummaryResult>;
  synthesize(chunkSummaries: SummaryResult[], length: SummaryLength): Promise<SummaryResult>;
}

/**
 * Extracts and cleans JSON string from LLM responses that might include markdown backticks.
 */
function cleanJsonOutput(raw: string): string {
  const trimmed = raw.trim();
  // Remove markdown json wrappers ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  return trimmed;
}

export class DeepSeekSummarizationProvider implements SummarizationProvider {
  private apiKey: string;
  private baseUrl: string;
  public readonly model: string;

  constructor(
    apiKey?: string,
    baseUrl?: string,
    model?: string
  ) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.baseUrl = baseUrl || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    this.model = model || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  }

  private async callDeepSeek(userPrompt: string): Promise<SummaryResult> {
    if (!this.apiKey) {
      throw new Error(
        'DeepSeek API key is not configured. Please set the DEEPSEEK_API_KEY environment variable in .env.local.'
      );
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
    } catch (networkError: unknown) {
      const msg = networkError instanceof Error ? networkError.message : String(networkError);
      throw new Error(`Failed to connect to DeepSeek API: ${msg}`);
    }

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        errorBody = response.statusText;
      }

      if (response.status === 401) {
        throw new Error('Invalid DeepSeek API key. Please check your DEEPSEEK_API_KEY configuration.');
      }
      if (response.status === 429) {
        throw new Error('DeepSeek API rate limit reached. Please wait a moment and try again.');
      }
      if (response.status >= 500) {
        throw new Error('DeepSeek service is temporarily unavailable. Please try again shortly.');
      }

      throw new Error(`DeepSeek API error (${response.status}): ${errorBody || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Received an empty response from DeepSeek AI.');
    }

    try {
      const cleaned = cleanJsonOutput(content);
      const parsed = JSON.parse(cleaned);

      if (!parsed || typeof parsed.summary !== 'string') {
        throw new Error('DeepSeek response did not contain a valid summary string.');
      }

      const keyPoints = Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
        : [];

      return {
        summary: parsed.summary.trim(),
        keyPoints: keyPoints.length > 0 ? keyPoints : ['Key summary point extracted from document.'],
      };
    } catch (parseError: unknown) {
      const msg = parseError instanceof Error ? parseError.message : 'Invalid JSON format';
      throw new Error(`Failed to parse AI summary output: ${msg}`);
    }
  }

  async summarize(text: string, length: SummaryLength): Promise<SummaryResult> {
    const prompt = buildDirectPrompt(text, length);
    return this.callDeepSeek(prompt);
  }

  async summarizeChunk(chunk: string, index: number, total: number): Promise<SummaryResult> {
    const prompt = buildChunkPrompt(chunk, index, total);
    return this.callDeepSeek(prompt);
  }

  async synthesize(chunkSummaries: SummaryResult[], length: SummaryLength): Promise<SummaryResult> {
    const prompt = buildSynthesisPrompt(chunkSummaries, length);
    return this.callDeepSeek(prompt);
  }
}
