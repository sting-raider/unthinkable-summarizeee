# The Abstract

The Abstract is a private, browser-first document summarizer. Drop in a PDF or image, extract readable text locally, choose the amount of detail, and generate a structured brief with key takeaways using the DeepSeek API.

The interface is designed as an editorial reading desk: source material stays visible, summaries are treated as finished briefs, and every action is explicit.

## What it does

- Accepts PDF, PNG, JPG, JPEG, and WebP files up to 10 MB.
- Extracts PDF text page by page with PDF.js in the browser.
- Extracts text from images with Tesseract.js OCR in the browser.
- Normalizes extracted text and checks that it contains meaningful content.
- Generates short, standard, or extended summaries with key points.
- Uses map-reduce summarization for long documents.
- Lets you preview and copy extracted text.
- Lets you copy the brief, copy Markdown, download a `.md` file, regenerate, or start another brief.

## Privacy model

Original files are never uploaded. PDF parsing and image OCR happen in the browser. After extraction, only the resulting text and selected summary length are sent to the Next.js `/api/summarize` route, which calls DeepSeek. Your DeepSeek key stays on the server and is never exposed to the browser.

## Stack

- Next.js 16 App Router and Turbopack
- React 19 and TypeScript
- Tailwind CSS 4
- PDF.js for PDF extraction
- Tesseract.js for image OCR
- DeepSeek for structured summarization
- Vitest for unit tests
- Lucide React for interface icons

## Project structure

```text
app/
  page.tsx                 Reading desk UI and workflow state
  layout.tsx               Fonts, metadata, and document shell
  globals.css              Editorial design tokens and global styles
  api/summarize/route.ts   Server route for DeepSeek summarization

components/
  upload/                  Upload dropzone and selected source
  processing/              PDF, OCR, and summarization progress
  summary/                 Length selector, source preview, brief, and key points
  ui/                      Shared badges and error messaging

lib/
  extraction/              PDF/OCR extraction and text normalization
  summarization/           DeepSeek provider, prompts, chunking, and synthesis
  validation/              File type, size, and content checks

types/                     Shared document and summary contracts
tests/                      Validation, extraction, chunking, and prompt tests
public/pdf.worker.min.js   Browser PDF.js worker
```

## Requirements

- Node.js 18 or newer
- A DeepSeek API key

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/sting-raider/unthinkable-summarizeee.git
cd unthinkable-summarizeee
npm install
```

Create `.env.local` from the example file:

```bash
cp .env.example .env.local
```

Add your DeepSeek configuration:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

`DEEPSEEK_MODEL` and `DEEPSEEK_BASE_URL` are optional. The defaults are `deepseek-v4-flash` and `https://api.deepseek.com`.

## Run locally

Start the development server on the default port:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use port 3005:

```bash
npm run dev -- -p 3005
```

Open [http://localhost:3005](http://localhost:3005).

## Verify the project

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

## Summarization flow

1. The user selects or drops a supported file.
2. The browser validates the file and extracts text locally.
3. Extracted text is normalized and counted.
4. The user selects Brief, Standard, or Extended detail.
5. The client posts `{ text, length }` to `/api/summarize`.
6. The server sends a grounded prompt to DeepSeek.
7. Long text is chunked, summarized, and synthesized into one result.
8. The API returns `{ summary, keyPoints, wordCount, chunksProcessed }`.

## API

### `POST /api/summarize`

Request body:

```json
{
  "text": "Extracted document text",
  "length": "short"
}
```

`length` accepts `short`, `medium`, or `long`.

Successful response:

```json
{
  "summary": "A grounded summary of the source.",
  "keyPoints": ["First takeaway", "Second takeaway"],
  "wordCount": 120,
  "model": "deepseek-v4-flash",
  "chunksProcessed": 1
}
```

The route validates the request, maps provider failures to clear HTTP errors, and validates the structured response before returning it.

## License

This project is private and currently has no published open-source license.
