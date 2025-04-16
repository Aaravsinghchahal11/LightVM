import { pgTable, text, serial, integer, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// System Resources schema
export const systemResources = pgTable("system_resources", {
  id: serial("id").primaryKey(),
  cpuCores: integer("cpu_cores").notNull(),
  cpuUsagePercent: real("cpu_usage_percent").notNull(),
  totalMemoryGB: real("total_memory_gb").notNull(),
  freeMemoryGB: real("free_memory_gb").notNull(),
  memoryUsagePercent: real("memory_usage_percent").notNull(),
  gpuModel: text("gpu_model"),
  gpuUsagePercent: real("gpu_usage_percent"),
});

export type SystemResources = {
  cpuCores: number;
  cpuUsagePercent: number;
  totalMemoryGB: number;
  freeMemoryGB: number;
  memoryUsagePercent: number;
  gpuModel: string | null;
  gpuUsagePercent: number;
};

// Virtual Machine schema
export const vms = pgTable("vms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  isoName: text("iso_name").notNull(),
  cpuUsage: real("cpu_usage").notNull().default(0),
  memoryUsage: real("memory_usage").notNull().default(0),
  diskUsage: real("disk_usage").notNull().default(0),
  isoPath: text("iso_path").notNull(),
  config: jsonb("config"),
});

export const insertVmSchema = createInsertSchema(vms).omit({ id: true });

export type InsertVM = z.infer<typeof insertVmSchema>;
export type VM = typeof vms.$inferSelect;

// Original users schema (keeping this to maintain compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
