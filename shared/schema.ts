import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  industry: varchar("industry"),
  teamSize: varchar("team_size"),
  businessDescription: text("business_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  parentId: integer("parent_id"),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  folderId: integer("folder_id").references(() => folders.id),
  name: varchar("name").notNull(),
  originalName: varchar("original_name").notNull(),
  size: integer("size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  filePath: text("file_path").notNull(),
  ocrText: text("ocr_text"),
  aiSummary: text("ai_summary"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  processingStatus: varchar("processing_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiCommands = pgTable("ai_commands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  command: text("command").notNull(),
  result: jsonb("result"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  folders: many(folders),
  files: many(files),
  aiCommands: many(aiCommands),
}));

export const folderRelations = relations(folders, ({ one, many }) => ({
  user: one(users, { fields: [folders.userId], references: [users.id] }),
  children: many(folders),
  files: many(files),
}));

export const fileRelations = relations(files, ({ one }) => ({
  user: one(users, { fields: [files.userId], references: [users.id] }),
  folder: one(folders, { fields: [files.folderId], references: [folders.id] }),
}));

export const aiCommandRelations = relations(aiCommands, ({ one }) => ({
  user: one(users, { fields: [aiCommands.userId], references: [users.id] }),
}));

// Schemas
export const upsertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertFolderSchema = createInsertSchema(folders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiCommandSchema = createInsertSchema(aiCommands).omit({ id: true, createdAt: true });

export const onboardingSchema = z.object({
  industry: z.string().min(1),
  teamSize: z.string().min(1),
  businessDescription: z.string().min(1),
  folderStructure: z.string().min(1),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertAiCommand = z.infer<typeof insertAiCommandSchema>;
export type AiCommand = typeof aiCommands.$inferSelect;
export type OnboardingData = z.infer<typeof onboardingSchema>;
