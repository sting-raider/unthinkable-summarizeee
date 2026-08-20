'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  ArrowRight,
  FileText,
  ScanText,
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
  const handleLoadSample = () => {
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
    <div className="min-h-screen">
      <header className="mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-y border-[var(--ink)] py-2 font-utility text-[10px] uppercase tracking-[0.18em] sm:text-[11px]">
          <span>Vol. 01 / The reading issue</span>
          <span className="inline-flex items-center gap-2 text-[var(--cobalt)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Private browser extraction</span>
            <span className="sm:hidden">Private</span>
          </span>
        </div>

        <div className="relative flex items-end justify-between overflow-hidden border-b-4 border-[var(--ink)] py-4 sm:py-6">
          <div className="absolute bottom-0 left-[19%] top-0 hidden w-2 bg-[var(--cobalt)] sm:block" aria-hidden="true" />
          <h1 className="font-editorial text-[clamp(3.75rem,12vw,10rem)] font-semibold leading-[0.73] tracking-[-0.075em]">
            The Abstract
          </h1>
          <p className="mb-1 hidden max-w-[175px] text-right text-xs leading-4 text-[var(--muted)] lg:block">
            An intelligent reading desk for documents worth understanding.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ink)] py-2 font-utility text-[9px] uppercase tracking-[0.16em] sm:text-[10px]">
          <span>PDF & image reader</span>
          <span className="text-[var(--oxblood)]">Extraction / Synthesis / Key points</span>
          <span className="hidden sm:inline">Powered by DeepSeek</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-12">
        {!document && (
          <section className="grid border-b border-[var(--ink)] lg:grid-cols-12">
            <div className="relative border-b border-[var(--ink)] py-12 pr-0 sm:py-16 lg:col-span-7 lg:border-b-0 lg:border-r lg:pr-12 xl:py-20">
              <p className="mb-7 font-utility text-[10px] uppercase tracking-[0.22em] text-[var(--oxblood)]">
                The document brief, reconsidered
              </p>
              <h2 className="max-w-[760px] font-editorial text-[clamp(3.6rem,8vw,8rem)] font-medium leading-[0.78] tracking-[-0.055em]">
                Turn the source <span className="italic text-[var(--cobalt)]">into signal.</span>
              </h2>
              <div className="mt-10 grid max-w-2xl gap-6 border-t border-[var(--rule)] pt-5 sm:grid-cols-[1fr_1.4fr]">
                <p className="font-utility text-[10px] uppercase leading-5 tracking-[0.14em] text-[var(--muted)]">
                  For reports, research, scans, and the long reads waiting in your tabs.
                </p>
                <p className="text-base leading-7 text-[var(--ink)] sm:text-lg">
                  Extract any PDF or image in your browser, then shape it into a clear brief with the depth you need.
                </p>
              </div>
            </div>

            <div className="flex items-center py-10 lg:col-span-5 lg:pl-10 xl:pl-14">
              {!isBusy && (
                <UploadDropzone
                  onFileSelected={handleFileSelected}
                  disabled={isBusy}
                  onSelectSample={handleLoadSample}
                />
              )}
              {(stage === 'extracting' || stage === 'ocr') && (
                <ProcessingStatus stage={stage} ocrProgress={ocrProgress} pdfProgress={pdfProgress} />
              )}
            </div>
          </section>
        )}

        {!document && (
          <section className="grid border-b border-[var(--ink)] sm:grid-cols-3">
            {[
              { icon: FileText, title: 'Read the source', copy: 'PDF text and image OCR are extracted locally.' },
              { icon: ScanText, title: 'Set the depth', copy: 'Choose a quick brief or a fuller editorial digest.' },
              { icon: BookOpen, title: 'Keep the insight', copy: 'Copy, download, or regenerate the finished summary.' },
            ].map((item, index) => (
              <article
                key={item.title}
                className={`group py-7 sm:px-6 ${index < 2 ? 'border-b border-[var(--rule)] sm:border-b-0 sm:border-r' : ''} ${index === 0 ? 'sm:pl-0' : ''}`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-[var(--cobalt)]" strokeWidth={1.5} />
                  <span className="font-editorial text-2xl italic text-[var(--rule)]">0{index + 1}</span>
                </div>
                <h3 className="font-editorial text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">{item.copy}</p>
              </article>
            ))}
          </section>
        )}

        {errorMessage && (
          <div className="py-6">
            <ErrorMessage
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
              onRetry={document ? () => handleGenerateSummary(selectedLength) : undefined}
            />
          </div>
        )}

        {(stage === 'extracting' || stage === 'ocr') && document && (
          <div className="py-10">
            <ProcessingStatus stage={stage} ocrProgress={ocrProgress} pdfProgress={pdfProgress} />
          </div>
        )}

        {document && (
          <section className="editorial-reveal py-8 sm:py-12">
            <div className="mb-8 grid gap-5 border-b-4 border-[var(--ink)] pb-6 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <p className="font-utility text-[10px] uppercase tracking-[0.2em] text-[var(--oxblood)]">The reading desk</p>
                <h2 className="mt-2 font-editorial text-5xl font-medium tracking-[-0.035em] sm:text-7xl">A brief in progress.</h2>
              </div>
              <p className="max-w-xs text-sm leading-6 text-[var(--muted)] md:text-right">
                Source text stays in context while you choose the shape of the final edit.
              </p>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-7">
                <SelectedFile document={document} onRemove={handleReset} onReplace={handleReset} disabled={isBusy} />
                <ExtractedTextPreview text={document.text} wordCount={document.wordCount} />

                {!summaryResult && (
                  <div className="paper-panel p-5 sm:p-8">
                    <SummaryLengthSelector value={selectedLength} onChange={setSelectedLength} disabled={isBusy} />

                    {isSummarizing && <div className="mt-8"><ProcessingStatus stage="summarizing" /></div>}

                    {!isSummarizing && (
                      <div className="mt-8 flex justify-end border-t border-[var(--ink)] pt-5">
                        <button
                          type="button"
                          onClick={() => handleGenerateSummary(selectedLength)}
                          disabled={isBusy}
                          className="group inline-flex w-full items-center justify-between bg-[var(--ink)] px-5 py-4 font-utility text-[11px] uppercase tracking-[0.12em] text-white transition hover:bg-[var(--cobalt)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-72"
                        >
                          <span>Compose {selectedLength} brief</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {summaryResult && (
                  <div className="space-y-7">
                    <div className="border-y border-[var(--ink)] py-5">
                      <SummaryLengthSelector
                        value={selectedLength}
                        onChange={(newLen) => {
                          setSelectedLength(newLen);
                          handleGenerateSummary(newLen);
                        }}
                        disabled={isBusy}
                      />
                    </div>
                    {isSummarizing && <ProcessingStatus stage="summarizing" />}
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

              <aside className="border-t border-[var(--ink)] pt-5 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
                <p className="font-utility text-[10px] uppercase tracking-[0.18em] text-[var(--oxblood)]">Editorial note</p>
                <p className="mt-5 font-editorial text-3xl leading-tight">
                  “Clarity is the courtesy a summary owes its source.”
                </p>
                <div className="mt-8 space-y-3 border-t border-[var(--rule)] pt-5 font-utility text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  <div className="flex justify-between gap-4"><span>Source words</span><span>{document.wordCount.toLocaleString()}</span></div>
                  <div className="flex justify-between gap-4"><span>Reading time</span><span>{document.readingTimeMinutes} min</span></div>
                  <div className="flex justify-between gap-4"><span>Current edit</span><span>{selectedLength}</span></div>
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto mt-10 w-full max-w-[1440px] px-4 pb-6 sm:px-8 lg:px-12">
        <div className="grid gap-6 border-t-4 border-[var(--ink)] pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-editorial text-3xl font-semibold">The Abstract</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Original files remain in your browser. Only extracted text is summarized.</p>
          </div>
          <p className="font-utility text-[9px] uppercase tracking-[0.16em] text-[var(--muted)] sm:text-right">
            Next.js / PDF.js / Tesseract / DeepSeek
          </p>
        </div>
      </footer>
    </div>
  );
}
