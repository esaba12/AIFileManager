import OpenAI from "openai";
import { storage } from "../storage";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface FolderStructure {
  name: string;
  parentId: number | null;
  path: string;
}

class OpenAIService {
  async generateFolderStructure(
    industry: string,
    businessDescription: string,
    userPrompt: string,
    documentTypes: string[] = [],
    organizationMethod: string = "by-client",
    collaborationStyle: string = "individual"
  ): Promise<FolderStructure[]> {
    try {
      const prompt = `As an AI assistant for document management, create a folder structure for a ${industry} business. 

Business Description: ${businessDescription}

User Requirements: ${userPrompt}

Document Types: ${documentTypes.join(", ")}
Organization Method: ${organizationMethod}
Collaboration Style: ${collaborationStyle}

Create a logical folder hierarchy that would help organize documents for this business. Consider the specific document types they work with and their preferred organization method. Return the structure as JSON with the following format:
{
  "folders": [
    {
      "name": "Folder Name",
      "parentId": null,
      "path": "Folder Name"
    },
    {
      "name": "Subfolder Name",
      "parentId": 1,
      "path": "Folder Name/Subfolder Name"
    }
  ]
}

Make sure to:
1. Create a practical folder structure suitable for the business type
2. Include common document categories for that industry
3. Use clear, professional folder names
4. Create a logical hierarchy (max 3 levels deep)
5. Include an "Unstructured" folder for unsorted documents`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in document management and business organization. Provide responses in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.folders || [];
    } catch (error) {
      console.error("Error generating folder structure:", error);
      throw new Error("Failed to generate folder structure");
    }
  }

  async summarizeDocument(text: string, fileName: string): Promise<string> {
    try {
      const prompt = `Analyze this document and provide a concise summary focusing on key information that would be useful for business document management.

Document: ${fileName}
Content: ${text}

Provide a summary that includes:
1. Document type and purpose
2. Key details (dates, amounts, parties involved, etc.)
3. Important deadlines or actions required
4. Any other relevant business information

Keep the summary professional and concise (2-3 sentences maximum).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert document analyst. Provide clear, concise summaries for business documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      return response.choices[0].message.content || "Unable to generate summary";
    } catch (error) {
      console.error("Error summarizing document:", error);
      return "Summary generation failed";
    }
  }

  async generateTags(text: string, fileName: string): Promise<string[]> {
    try {
      const prompt = `Analyze this document and generate relevant tags for categorization and search.

Document: ${fileName}
Content: ${text}

Generate 3-8 relevant tags that would help categorize and find this document. Focus on:
1. Document type (contract, invoice, report, etc.)
2. Business category (legal, financial, property, etc.)
3. Key subjects or topics
4. Urgency level if applicable

Return the tags as a JSON array of strings.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in document categorization. Provide responses in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.tags || [];
    } catch (error) {
      console.error("Error generating tags:", error);
      return [];
    }
  }

  async processCommand(commandId: number, command: string, userId: string): Promise<void> {
    try {
      const prompt = `Process this file management command for a document management system:

Command: ${command}

Analyze the command and determine what action should be taken. Common actions include:
1. Moving files between folders
2. Organizing files by criteria
3. Searching for specific files
4. Creating new folders
5. Renaming files or folders

Return a JSON response with:
{
  "action": "move_files|organize|search|create_folder|rename",
  "description": "Description of what will be done",
  "parameters": {
    // Relevant parameters for the action
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for document management. Analyze commands and provide structured responses in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      await storage.updateAiCommand(commandId, {
        result,
        status: "completed",
      });
    } catch (error) {
      console.error("Error processing command:", error);
      await storage.updateAiCommand(commandId, {
        status: "failed",
        result: { error: "Failed to process command" },
      });
    }
  }
}

export const openaiService = new OpenAIService();
