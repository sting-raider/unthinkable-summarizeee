import { normalizeText, countWords, calculateReadingTime, hasMeaningfulContent } from './normalizeText';
import { ExtractedDocument } from '@/types/document';

interface PdfExtractOptions {
  onProgress?: (current: number, total: number) => void;
}

/**
 * Initializes PDF.js worker in browser environment.
 */
async function initPdfWorker() {
  const pdfjsLib = await import('pdfjs-dist');
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Use local worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
  return pdfjsLib;
}

/**
 * Extracts text content page by page from a PDF File or ArrayBuffer.
 */
export async function extractPdfText(
  file: File,
  options?: PdfExtractOptions
): Promise<ExtractedDocument> {
  const pdfjsLib = await initPdfWorker();

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error('Failed to read PDF file. The file may be damaged or inaccessible.');
  }

  let loadingTask;
  try {
    loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('password')) {
      throw new Error('This PDF is password-protected. Please upload an unlocked PDF.');
    }
    throw new Error('Failed to parse PDF document. It might be corrupted.');
  }

  let pdfDoc;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('password') || message.toLowerCase().includes('encrypted')) {
      throw new Error('This PDF is password-protected. Please upload an unlocked PDF.');
    }
    throw new Error('Could not open PDF. The file may be corrupted or invalid.');
  }

  const numPages = pdfDoc.numPages;
  if (numPages === 0) {
    throw new Error('The PDF document contains 0 pages.');
  }

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (options?.onProgress) {
      options.onProgress(pageNum, numPages);
    }

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items into lines based on transform Y position or item flow
    let lastY: number | null = null;
    let pageString = '';

    for (const item of textContent.items) {
      if ('str' in item) {
        const textItem = item as { str: string; transform: number[] };
        const currentY = textItem.transform ? textItem.transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          // Significant vertical jump -> new line
          pageString += '\n' + textItem.str;
        } else {
          // Same line -> add space if needed
          if (pageString && !pageString.endsWith(' ') && !pageString.endsWith('\n') && textItem.str) {
            pageString += ' ';
          }
          pageString += textItem.str;
        }
        lastY = currentY;
      }
    }

    if (pageString.trim()) {
      pageTexts.push(pageString.trim());
    }
  }

  const rawJoined = pageTexts.join('\n\n');
  const normalized = normalizeText(rawJoined);

  if (!normalized || !hasMeaningfulContent(normalized)) {
    throw new Error(
      "We couldn't extract readable text from this PDF. It may contain scanned image pages rather than selectable text."
    );
  }

  const wordCount = countWords(normalized);

  return {
    fileName: file.name,
    fileType: file.type || 'application/pdf',
    fileSizeBytes: file.size,
    text: normalized,
    pageCount: numPages,
    wordCount,
    readingTimeMinutes: calculateReadingTime(wordCount),
  };
}
