# Engineering Approach: Document Summary Assistant

The application uses a hybrid client-first architecture separating heavy parsing from inference. The Next.js frontend handles file validation, document extraction, and interactive UI states, while a lightweight Next.js serverless API route interfaces with the DeepSeek API (`deepseek-chat`).

Document parsing is executed entirely client-side using PDF.js for vector PDFs and Tesseract.js for image OCR with live progress tracking. Extracted text undergoes whitespace normalization, control character stripping, and alphanumeric ratio heuristics to eliminate OCR noise before transmission.

Summaries are generated using grounded system prompts enforcing strict JSON output (`{ summary, keyPoints }`). For documents exceeding direct prompt limits (>12,000 characters), a map-reduce strategy divides text into overlapping paragraph chunks, summarizes them sequentially, and synthesizes intermediate findings into a cohesive final overview.

Because documents are parsed client-side, original files are never uploaded to the server, protecting privacy and serverless execution quotas. The interface provides granular loading states, copy/download utilities, and robust error recovery mapping API statuses (400, 413, 429, 503) to clear user feedback.
