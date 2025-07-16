import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { onboardingSchema } from "@shared/schema";
import { openaiService } from "./services/openai";
import { fileProcessor } from "./services/fileProcessor";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = onboardingSchema.parse(req.body);
      
      // Update user with onboarding data
      await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        industry: validatedData.industry,
        teamSize: validatedData.teamSize,
        businessDescription: validatedData.businessDescription,
        storageType: validatedData.storageType || "local",
        storagePlan: validatedData.storagePlan || "basic",
      });

      // Generate folder structure using AI
      const folderStructure = await openaiService.generateFolderStructure(
        validatedData.industry,
        validatedData.businessDescription,
        validatedData.folderStructure
      );

      // Create folders in database
      for (const folder of folderStructure) {
        await storage.createFolder({
          userId,
          name: folder.name,
          parentId: folder.parentId,
          path: folder.path,
        });
      }

      res.json({ success: true, folderStructure });
    } catch (error) {
      console.error("Error in onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Folder routes
  app.get('/api/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await storage.getFoldersByUserId(userId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post('/api/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, parentId } = req.body;
      
      // Build path based on parent folder
      let path = name;
      if (parentId) {
        const parentFolder = await storage.getFolderById(parentId);
        if (parentFolder) {
          path = `${parentFolder.path}/${name}`;
        }
      }
      
      const folder = await storage.createFolder({
        userId,
        name,
        parentId: parentId || null,
        path,
      });
      res.json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.put('/api/folders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const { name, parentId } = req.body;
      
      // Build new path if name or parent changed
      let path = name;
      if (parentId) {
        const parentFolder = await storage.getFolderById(parentId);
        if (parentFolder) {
          path = `${parentFolder.path}/${name}`;
        }
      }
      
      const updatedFolder = await storage.updateFolder(folderId, {
        name,
        parentId: parentId || null,
        path,
      });
      res.json(updatedFolder);
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  app.delete('/api/folders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      
      // Check if folder has any files or subfolders
      const files = await storage.getFilesByFolderId(folderId);
      const allFolders = await storage.getFoldersByUserId(req.user.claims.sub);
      const subfolders = allFolders.filter(f => f.parentId === folderId);
      
      if (files.length > 0 || subfolders.length > 0) {
        return res.status(400).json({ message: "Cannot delete folder with files or subfolders" });
      }
      
      await storage.deleteFolder(folderId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // File routes
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { folderId } = req.query;
      
      let files;
      if (folderId) {
        files = await storage.getFilesByFolderId(parseInt(folderId as string));
      } else {
        files = await storage.getFilesByUserId(userId);
      }
      
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post('/api/files/upload', isAuthenticated, upload.array('files'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      const { folderId, processOcr = true, generateSummary = true, autoTag = true } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of files) {
        // Create file record
        const newFile = await storage.createFile({
          userId,
          folderId: folderId ? parseInt(folderId) : null,
          name: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          filePath: file.path,
          processingStatus: "processing",
        });

        // Process file asynchronously
        fileProcessor.processFile(newFile, {
          processOcr: processOcr === 'true',
          generateSummary: generateSummary === 'true',
          autoTag: autoTag === 'true',
        });

        uploadedFiles.push(newFile);
      }

      res.json({ files: uploadedFiles });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  app.get('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFileById(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.put('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const updatedFile = await storage.updateFile(fileId, req.body);
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.put('/api/files/:id/move', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const { folderId } = req.body;
      
      const updatedFile = await storage.updateFile(fileId, {
        folderId: folderId || null,
      });
      res.json(updatedFile);
    } catch (error) {
      console.error("Error moving file:", error);
      res.status(500).json({ message: "Failed to move file" });
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFileById(fileId);
      
      if (file) {
        // Delete physical file
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
        
        await storage.deleteFile(fileId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // AI command routes
  app.post('/api/ai/command', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { command } = req.body;

      const aiCommand = await storage.createAiCommand({
        userId,
        command,
        status: "processing",
      });

      // Process command asynchronously
      openaiService.processCommand(aiCommand.id, command, userId);

      res.json(aiCommand);
    } catch (error) {
      console.error("Error processing AI command:", error);
      res.status(500).json({ message: "Failed to process AI command" });
    }
  });

  app.get('/api/ai/commands', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commands = await storage.getAiCommandsByUserId(userId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching AI commands:", error);
      res.status(500).json({ message: "Failed to fetch AI commands" });
    }
  });

  // Export routes
  app.get('/api/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = await storage.getFilesByUserId(userId);
      const folders = await storage.getFoldersByUserId(userId);
      
      // Create export structure
      const exportData = {
        folders,
        files: files.map(file => ({
          ...file,
          // Remove file path for security
          filePath: undefined,
        })),
        exportDate: new Date().toISOString(),
      };

      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
