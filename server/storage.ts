import {
  users,
  folders,
  files,
  aiCommands,
  type User,
  type UpsertUser,
  type InsertFolder,
  type Folder,
  type InsertFile,
  type File,
  type InsertAiCommand,
  type AiCommand,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByUserId(userId: string): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  updateFolder(id: number, updates: Partial<Folder>): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFilesByUserId(userId: string): Promise<File[]>;
  getFilesByFolderId(folderId: number): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  updateFile(id: number, updates: Partial<File>): Promise<File>;
  deleteFile(id: number): Promise<void>;
  
  // AI command operations
  createAiCommand(command: InsertAiCommand): Promise<AiCommand>;
  getAiCommandsByUserId(userId: string): Promise<AiCommand[]>;
  updateAiCommand(id: number, updates: Partial<AiCommand>): Promise<AiCommand>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Folder operations
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const result = await db.insert(folders).values(folder).returning();
    return result[0];
  }

  async getFoldersByUserId(userId: string): Promise<Folder[]> {
    return await db.select().from(folders).where(eq(folders.userId, userId)).orderBy(asc(folders.name));
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }

  async updateFolder(id: number, updates: Partial<Folder>): Promise<Folder> {
    const [updatedFolder] = await db
      .update(folders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFilesByUserId(userId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.userId, userId)).orderBy(desc(files.createdAt));
  }

  async getFilesByFolderId(folderId: number): Promise<File[]> {
    return await db.select().from(files).where(eq(files.folderId, folderId)).orderBy(desc(files.createdAt));
  }

  async getFileById(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async updateFile(id: number, updates: Partial<File>): Promise<File> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // AI command operations
  async createAiCommand(command: InsertAiCommand): Promise<AiCommand> {
    const [newCommand] = await db.insert(aiCommands).values(command).returning();
    return newCommand;
  }

  async getAiCommandsByUserId(userId: string): Promise<AiCommand[]> {
    return await db.select().from(aiCommands).where(eq(aiCommands.userId, userId)).orderBy(desc(aiCommands.createdAt));
  }

  async updateAiCommand(id: number, updates: Partial<AiCommand>): Promise<AiCommand> {
    const [updatedCommand] = await db
      .update(aiCommands)
      .set(updates)
      .where(eq(aiCommands.id, id))
      .returning();
    return updatedCommand;
  }
}

export const storage = new DatabaseStorage();
