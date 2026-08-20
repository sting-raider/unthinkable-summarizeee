import { createWorker } from 'tesseract.js';
import { normalizeText, countWords, calculateReadingTime, hasMeaningfulContent } from './normalizeText';
import { ExtractedDocument, OCRProgressInfo } from '@/types/document';

interface ImageExtractOptions {
  onProgress?: (progressInfo: OCRProgressInfo) => void;
}

/**
 * Extracts text from an image file using Tesseract.js OCR in the browser.
 */
export async function extractImageText(
  file: File,
  options?: ImageExtractOptions
): Promise<ExtractedDocument> {
  // Translate Tesseract internal status strings into user-friendly status labels
  const formatStatus = (status: string): string => {
    switch (status) {
      case 'loading tesseract core':
        return 'Loading OCR engine...';
      case 'initializing tesseract':
        return 'Initializing language models...';
      case 'loading language traineddata':
        return 'Loading English dictionary...';
      case 'initializing api':
        return 'Preparing image scanner...';
      case 'recognizing text':
        return 'Recognizing text...';
      default:
        return 'Processing image...';
    }
  };

  let worker;
  try {
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (options?.onProgress && m.status) {
          const progressPercent = typeof m.progress === 'number' ? Math.round(m.progress * 100) : 0;
          options.onProgress({
            status: formatStatus(m.status),
            progress: progressPercent,
          });
        }
      },
    });

    const imageUrl = URL.createObjectURL(file);
    let ret;
    try {
      ret = await worker.recognize(imageUrl);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }

    const rawText = ret.data.text;
    const normalized = normalizeText(rawText);

    if (!normalized || !hasMeaningfulContent(normalized, 10)) {
      throw new Error(
        "We couldn't detect enough readable text in this image. Try uploading a clearer, higher-resolution document or screenshot."
      );
    }

    const wordCount = countWords(normalized);

    return {
      fileName: file.name,
      fileType: file.type || 'image/png',
      fileSizeBytes: file.size,
      text: normalized,
      pageCount: 1,
      wordCount,
      readingTimeMinutes: calculateReadingTime(wordCount),
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Image OCR recognition failed. Please try a different image.');
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}
