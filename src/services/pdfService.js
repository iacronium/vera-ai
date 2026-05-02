/**
 * pdfService.js
 * Extracts plain text from a PDF File object using pdfjs-dist (browser build).
 * The worker source is set to the local bundled worker to avoid bundler issues.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Point the worker at the bundled worker file so Vite/bundlers don't need
// special configuration to handle the worker module.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/**
 * Extracts all text content from a PDF file.
 * Text from each page is concatenated with a newline separator.
 *
 * @param {File} file - A PDF File object (e.g. from an <input type="file"> element).
 * @returns {Promise<string>} The full extracted text of the PDF.
 * @throws {Error} With a descriptive message if the PDF cannot be parsed.
 */
export async function extractTextFromPDF(file) {
  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (readError) {
    throw new Error(
      `Failed to extract text from PDF: could not read file — ${readError.message}`
    );
  }

  let pdf;
  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    pdf = await loadingTask.promise;
  } catch (parseError) {
    throw new Error(
      `Failed to extract text from PDF: ${parseError.message}`
    );
  }

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(pageText);
    } catch (pageError) {
      throw new Error(
        `Failed to extract text from PDF: error reading page ${pageNum} — ${pageError.message}`
      );
    }
  }

  return pageTexts.join('\n');
}
