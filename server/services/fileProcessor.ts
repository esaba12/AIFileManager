import { storage } from "../storage";
import { ocrService } from "./ocr";
import { openaiService } from "./openai";
import { File } from "@shared/schema";

interface ProcessingOptions {
  processOcr: boolean;
  generateSummary: boolean;
  autoTag: boolean;
}

class FileProcessor {
  async processFile(file: File, options: ProcessingOptions): Promise<void> {
    try {
      let ocrText = "";
      let summary = "";
      let tags: string[] = [];

      // Extract text using OCR for supported file types
      if (options.processOcr && this.isOCRSupported(file.mimeType)) {
        try {
          ocrText = await ocrService.extractText(file.filePath);
        } catch (error) {
          console.error("OCR failed for file:", file.id, error);
        }
      }

      // Use OCR text or fallback to file name for AI processing
      const textForAI = ocrText || file.originalName;

      // Generate AI summary
      if (options.generateSummary && textForAI) {
        try {
          summary = await openaiService.summarizeDocument(textForAI, file.originalName);
        } catch (error) {
          console.error("Summary generation failed for file:", file.id, error);
        }
      }

      // Generate tags
      if (options.autoTag && textForAI) {
        try {
          tags = await openaiService.generateTags(textForAI, file.originalName);
        } catch (error) {
          console.error("Tag generation failed for file:", file.id, error);
        }
      }

      // Update file with processed data
      await storage.updateFile(file.id, {
        ocrText,
        aiSummary: summary,
        tags,
        processingStatus: "completed",
      });

      console.log(`File processed successfully: ${file.originalName}`);
    } catch (error) {
      console.error("File processing failed:", error);
      await storage.updateFile(file.id, {
        processingStatus: "failed",
      });
    }
  }

  private isOCRSupported(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'application/pdf',
    ];
    return supportedTypes.includes(mimeType);
  }
}

export const fileProcessor = new FileProcessor();
