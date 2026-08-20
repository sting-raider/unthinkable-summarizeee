# Document Summary Assistant

A modern, fast, and privacy-preserving AI web application that extracts text from documents (PDFs and images) directly in your browser and generates structured, grounded summaries and key takeaway points using **DeepSeek AI**.

![Document Summary Assistant](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.jpg)

---

## 🌟 Key Features

- 📄 **Multi-Format Upload**: Seamless drag-and-drop or file picker for `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp`.
- 🔒 **100% Client-Side Extraction**: Documents are parsed locally inside the browser using PDF.js and Tesseract.js OCR. Original files are **never uploaded** to the server, preserving document privacy and reducing server execution limits.
- ⚡ **DeepSeek AI Integration**: Generates grounded executive summaries with structured JSON output enforcing zero hallucination.
- 🎚️ **Customizable Detail Levels**:
  - **Short** (~100–150 words): High-level snapshot & critical conclusion.
  - **Medium** (~250–400 words): Balanced overview & core arguments.
  - **Long** (~500–700 words): Comprehensive analysis & supporting context.
- 💡 **Key Takeaways**: Automatically extracts 3–6 distinct, high-impact bulleted takeaway points.
- 📚 **Long Document Handling**: Automatic semantic paragraph chunking and Map-Reduce synthesis for documents exceeding direct context limits.
- 📋 **Productivity Actions**: Single-click copy for Summary or Full Markdown, Download as `.md`, and Extracted Text preview accordion.
- 📱 **Fully Responsive**: Mobile-first design built with Tailwind CSS, supporting viewports from 375px to 1440px+.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          Browser (Client-Side)                         │
│                                                                        │
│  1. Upload Document (.pdf, .png, .jpg, .jpeg, .webp)                   │
│  2. Validate File (Size <= 10MB, MIME type, Extension, Non-empty)      │
│  3. Extraction:                                                        │
│     ├─ PDF: PDF.js extracts text per page + page counts                │
│     └─ Image: Tesseract.js extracts text via OCR with live progress    │
│  4. Normalization (Clean whitespace, strip OCR noise, count words)     │
│  5. Select Summary Length (Short / Medium / Long)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST /api/summarize { text, length }
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js Server API Route                        │
│                                                                        │
│  6. Validate payload structure and length bounds                       │
│  7. DeepSeek AI Provider (`deepseek-chat`):                            │
│     ├─ Small/Medium text: Direct structured summary prompt             │
│     └─ Large text (>12k chars): Map-reduce chunking & synthesis        │
│  8. Output Schema Validation: { summary: string, keyPoints: string[] } │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON { summary, keyPoints }
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Results View & UX                             │
│                                                                        │
│  • Formatted Executive Summary                                         │
│  • Bulleted Key Takeaways                                              │
│  • Compression & Word Count Metrics                                    │
│  • Collapsible Extracted Text Viewer                                   │
│  • Copy / Download (.md) / Upload Another Actions                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI & Styling**: React 19, Tailwind CSS 4, Lucide React icons
- **Client Extraction**: `pdfjs-dist` (PDF parsing), `tesseract.js` (Image OCR)
- **AI Backend**: DeepSeek API (`deepseek-chat` model)
- **Testing**: Vitest, React Testing Library, JSDOM
- **Deployment**: Vercel ready

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+ installed
- DeepSeek API Key ([Get one at platform.deepseek.com](https://platform.deepseek.com/))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/document-summary-assistant.git
cd document-summary-assistant
npm install
```

### 2. Configure Environment Variables

Copy the example configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your DeepSeek API key:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🧪 Testing

Run the automated Vitest unit test suite:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## ⚠️ Known Limitations

1. **Scanned PDF Text**: Client-side PDF.js extracts embedded vector text streams. Scanned PDF documents without embedded text layers require pre-rendering to images before OCR.
2. **OCR Quality**: OCR accuracy is dependent on source image clarity, contrast, and resolution.
3. **API Rate Limits**: Standard free-tier DeepSeek API keys are subject to requests-per-minute limits. The application implements sequential batching and graceful error recovery.

---

## 🔮 Future Roadmap

- [ ] Multi-lingual OCR language pack selector.
- [ ] Export summary directly to PDF format.
- [ ] Audio text-to-speech summary playback.
- [ ] Interactive Q&A chat over the extracted document.
