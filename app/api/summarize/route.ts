import { NextRequest, NextResponse } from 'next/server';
import { SummaryLength } from '@/types/document';
import { generateDocumentSummary } from '@/lib/summarization/summarize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_INPUT_TEXT_CHARS = 500000; // ~100k words

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { text, length } = body;

    // Validate text
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Document text is required and cannot be empty.' },
        { status: 400 }
      );
    }

    if (text.length > MAX_INPUT_TEXT_CHARS) {
      return NextResponse.json(
        { error: 'Document text is too large (exceeds 500,000 characters limit).' },
        { status: 413 }
      );
    }

    // Validate length
    const validLengths: SummaryLength[] = ['short', 'medium', 'long'];
    if (!length || !validLengths.includes(length)) {
      return NextResponse.json(
        { error: "Invalid summary length. Must be 'short', 'medium', or 'long'." },
        { status: 400 }
      );
    }

    const result = await generateDocumentSummary(text.trim(), length);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    // Check specific error keywords to map status codes
    const lower = message.toLowerCase();
    if (lower.includes('rate limit')) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    if (lower.includes('api key') || lower.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please ensure DEEPSEEK_API_KEY is configured.' },
        { status: 500 }
      );
    }
    if (lower.includes('unavailable') || lower.includes('connect')) {
      return NextResponse.json(
        { error: 'The AI summarization service is temporarily unavailable. Please try again in a few moments.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
