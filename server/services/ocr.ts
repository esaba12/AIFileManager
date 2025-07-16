import { createWorker } from 'tesseract.js';

class OCRService {
  private worker: any = null;

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  async extractText(filePath: string): Promise<string> {
    try {
      await this.initialize();
      
      const { data: { text } } = await this.worker.recognize(filePath);
      return text.trim();
    } catch (error) {
      console.error("OCR processing error:", error);
      throw new Error("Failed to extract text from document");
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
