import { describe, it, expect } from 'vitest';
import { validateFile, formatBytes, MAX_FILE_SIZE_BYTES } from '@/lib/validation/validateFile';

describe('validateFile', () => {
  it('should accept valid PDF file', () => {
    const file = new File(['%PDF-1.4 sample content'], 'report.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept valid PNG and JPG images', () => {
    const png = new File(['png-data'], 'screenshot.png', { type: 'image/png' });
    const jpg = new File(['jpg-data'], 'photo.jpg', { type: 'image/jpeg' });
    const webp = new File(['webp-data'], 'graphic.webp', { type: 'image/webp' });

    expect(validateFile(png).valid).toBe(true);
    expect(validateFile(jpg).valid).toBe(true);
    expect(validateFile(webp).valid).toBe(true);
  });

  it('should reject null or undefined file', () => {
    expect(validateFile(null).valid).toBe(false);
    expect(validateFile(undefined).valid).toBe(false);
  });

  it('should reject empty file (0 bytes)', () => {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
    const result = validateFile(emptyFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject files exceeding 10MB limit', () => {
    // Create mock object with size > MAX_FILE_SIZE_BYTES
    const largeFile = {
      name: 'large_manual.pdf',
      type: 'application/pdf',
      size: MAX_FILE_SIZE_BYTES + 1024,
    } as unknown as File;

    const result = validateFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds');
  });

  it('should reject unsupported file extensions (e.g. .exe, .zip, .mp4)', () => {
    const exeFile = new File(['data'], 'malware.exe', { type: 'application/x-msdownload' });
    const zipFile = new File(['data'], 'archive.zip', { type: 'application/zip' });

    expect(validateFile(exeFile).valid).toBe(false);
    expect(validateFile(zipFile).valid).toBe(false);
  });
});

describe('formatBytes', () => {
  it('formats 0 bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats kilobytes correctly', () => {
    expect(formatBytes(2048)).toBe('2 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
