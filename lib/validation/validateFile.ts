import { FileValidationResult } from '@/types/document';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'] as const;

/**
 * Validates an uploaded file for size, format, and non-empty content.
 */
export function validateFile(file: File | null | undefined): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'Please select a file to upload.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty (0 bytes). Please upload a valid document.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit. (Your file: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasSupportedExt = SUPPORTED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  const isSupportedMime = file.type ? SUPPORTED_MIME_TYPES.includes(file.type as (typeof SUPPORTED_MIME_TYPES)[number]) : false;

  if (!hasSupportedExt && !isSupportedMime) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PDF, PNG, JPG, JPEG, or WebP file.',
    };
  }

  return { valid: true };
}

/**
 * Formats bytes to human-readable string (e.g. 1.2 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
