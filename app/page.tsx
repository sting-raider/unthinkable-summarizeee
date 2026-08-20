'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  FileSearch,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ExtractedDocument, ProcessingStage, SummaryLength, OCRProgressInfo } from '@/types/document';
import { SummarizeResponse } from '@/types/summary';
import { validateFile } from '@/lib/validation/validateFile';
import { extractPdfText } from '@/lib/extraction/extractPdfText';
import { extractImageText } from '@/lib/extraction/extractImageText';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { SelectedFile } from '@/components/upload/SelectedFile';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';
import { SummaryLengthSelector } from '@/components/summary/SummaryLengthSelector';
import { SummaryResult } from '@/components/summary/SummaryResult';
import { ExtractedTextPreview } from '@/components/summary/ExtractedTextPreview';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const SAMPLE_DOCUMENT_TEXT = `Artificial Intelligence in Modern Healthcare: Opportunities and Challenges

Recent breakthroughs in artificial intelligence (AI) and machine learning are rapidly transforming the healthcare landscape. From early diagnostic imaging to personalized genomics and automated clinical documentation, algorithmic systems are demonstrating remarkable potential to augment clinical workflows and improve patient outcomes.

In medical diagnostics, deep learning convolutional neural networks (CNNs) have achieved diagnostic parity with specialized radiologists in identifying subtle pulmonary nodules on chest CT scans and detecting diabetic retinopathy in retinal fundus photography. By functioning as a high-reliability second-reader, these AI tools reduce false negative rates and alleviate diagnostic fatigue among overburdened clinical staff.

Furthermore, predictive analytics models deployed in intensive care units (ICUs) analyze continuous physiological telemetry—including heart rate variability, arterial blood pressure, and oxygen saturation—to predict hemodynamic instability and sepsis onset up to 12 hours before clinical manifestation. Early targeted interventions based on these predictive alerts have been linked to a 28% reduction in sepsis-related in-hospital mortality.

Despite these significant advancements, substantial translational challenges remain. Algorithmic bias, resulting from historical training datasets that underrepresent minority demographic cohorts, poses a risk of exacerbating existing healthcare disparities. Additionally, the 'black-box' nature of complex deep architectures complicates clinical interpretability, making it difficult for physicians to understand the underlying rationale for high-stakes recommendations.

To ensure responsible adoption, regulatory bodies such as the FDA and the European Medicines Agency are developing rigorous frameworks for adaptive AI medical devices. These guidelines mandate continuous post-market surveillance, rigorous dataset auditing, and strict cybersecurity protections for sensitive electronic health records (EHR). Ultimately, the future of AI in medicine depends not on replacing human clinicians, but on cultivating collaborative human-in-the-loop systems that prioritize patient safety, ethical governance, and clinical efficacy.`;

export default function Home() {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [document, setDocument] = useState<ExtractedDocument | null>(null);
  const [selectedLength, setSelectedLength] = useState<SummaryLength>('medium');
  const [summaryResult, setSummaryResult] = useState<SummarizeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<OCRProgressInfo | null>(null);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // File Upload & Extraction Handler
  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setSummaryResult(null);

    // 1. Validate File
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');

    try {
      if (isPdf) {
        setStage('extracting');
        setPdfProgress(null);
        const extracted = await extractPdfText(file, {
          onProgress: (current, total) => setPdfProgress({ current, total }),
        });
        setDocument(extracted);
        setStage('idle');
      } else {
        setStage('ocr');
        setOcrProgress({ status: 'Preparing OCR engine...', progress: 0 });
        const extracted = await extractImageText(file, {
          onProgress: (info) => setOcrProgress(info),
        });
        setDocument(extracted);
        setStage('idle');
      }
    } catch (err: unknown) {
      setStage('error');
      const message = err instanceof Error ? err.message : 'Failed to extract text from document.';
      setErrorMessage(message);
    }
  };

  // Sample Loader
  const handleLoadSample = (sampleType: 'sample-doc' | 'sample-image') => {
    setErrorMessage(null);
    setSummaryResult(null);

    const words = SAMPLE_DOCUMENT_TEXT.trim().match(/[\w\d'-]+/gu)?.length || 310;
    const sampleDoc: ExtractedDocument = {
      fileName: 'AI-Healthcare-Clinical-Study.pdf',
      fileType: 'application/pdf',
      fileSizeBytes: 245760,
      text: SAMPLE_DOCUMENT_TEXT,
      pageCount: 2,
      wordCount: words,
      readingTimeMinutes: Math.ceil(words / 200),
    };
    setDocument(sampleDoc);
    setStage('idle');
  };

  // Summarization API Trigger
  const handleGenerateSummary = async (lengthToUse = selectedLength) => {
    if (!document || !document.text) return;

    setErrorMessage(null);
    setIsSummarizing(true);
    setStage('summarizing');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: document.text,
          length: lengthToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setSummaryResult(data);
      setStage('complete');
    } catch (err: unknown) {
      setStage('error');
      const message = err instanceof Error ? err.message : 'Failed to generate summary. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Reset Workflow
  const handleReset = () => {
    setDocument(null);
    setSummaryResult(null);
    setErrorMessage(null);
    setStage('idle');
    setOcrProgress(null);
    setPdfProgress(null);
  };

  const isBusy = stage === 'extracting' || stage === 'ocr' || isSummarizing;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar / Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-4xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Document Summary Assistant
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                Client-Side Extraction • DeepSeek AI Summarization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">100% Private Client-Side Parsing</span>
              <span className="sm:hidden">Private</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        {/* Intro banner */}
        {!document && (
          <div className="text-center space-y-2 py-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Instant, grounded summaries for your documents
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
              Upload a PDF or image to extract readable text directly inside your browser and generate structured summaries with key takeaway points.
            </p>
          </div>
        )}

        {/* Error Alert Display */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={document ? () => handleGenerateSummary(selectedLength) : undefined}
          />
        )}

        {/* 1. Upload Dropzone (When no document selected) */}
        {!document && !isBusy && (
          <UploadDropzone
            onFileSelected={handleFileSelected}
            disabled={isBusy}
            onSelectSample={handleLoadSample}
          />
        )}

        {/* 2. Processing Status (During extraction or OCR) */}
        {(stage === 'extracting' || stage === 'ocr') && (
          <ProcessingStatus
            stage={stage}
            ocrProgress={ocrProgress}
            pdfProgress={pdfProgress}
          />
        )}

        {/* 3. Document Ready View (Document selected) */}
        {document && (
          <div className="space-y-6">
            {/* Selected File Card */}
            <SelectedFile
              document={document}
              onRemove={handleReset}
              onReplace={handleReset}
              disabled={isBusy}
            />

            {/* Extracted Text Collapsible Preview */}
            <ExtractedTextPreview
              text={document.text}
              wordCount={document.wordCount}
            />

            {/* Summary Configuration Card */}
            {!summaryResult && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                <SummaryLengthSelector
                  value={selectedLength}
                  onChange={(len) => setSelectedLength(len)}
                  disabled={isBusy}
                />

                {/* Processing Indicator while AI is summarizing */}
                {isSummarizing && (
                  <ProcessingStatus stage="summarizing" />
                )}

                {/* Generate Summary CTA Button */}
                {!isSummarizing && (
                  <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary(selectedLength)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Generate {selectedLength.toUpperCase()} Summary</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. Results View */}
            {summaryResult && (
              <div className="space-y-6">
                {/* Summary Length Quick-Switch within Results */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <SummaryLengthSelector
                    value={selectedLength}
                    onChange={(newLen) => {
                      setSelectedLength(newLen);
                      handleGenerateSummary(newLen);
                    }}
                    disabled={isBusy}
                  />
                </div>

                {isSummarizing && (
                  <ProcessingStatus stage="summarizing" />
                )}

                {!isSummarizing && (
                  <SummaryResult
                    document={document}
                    result={summaryResult}
                    selectedLength={selectedLength}
                    onUploadAnother={handleReset}
                    onRegenerate={() => handleGenerateSummary(selectedLength)}
                    isRegenerating={isSummarizing}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mx-auto max-w-4xl px-4 space-y-2">
          <p>
            Document Summary Assistant — Built with Next.js, TypeScript, PDF.js, Tesseract.js & DeepSeek AI.
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Client-side text extraction ensures original files remain private in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
