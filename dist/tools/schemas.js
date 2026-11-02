import { z } from "zod";
export const integrationTypeEnum = z.enum([
    "api",
    "webhook",
    "message_queue",
    "file_transfer",
    "database",
    "email",
    "sms",
    "other",
]);
export const integrationStatusEnum = z.enum(["active", "inactive", "error", "testing"]);
export const webappTypeEnum = z.enum([
    "webapp",
    "webhook",
    "websocket",
    "callback",
    "document-viewer",
    "document_viewer",
]);
export const processStatusEnum = z.enum(["draft", "active", "inactive", "archived"]);
export const authTransportEnum = z.enum(["cookie", "bearer", "both"]);
export const stepLanguageEnum = z.enum(["javascript", "typescript", "php"]);
export const pageSizeEnum = z.union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)]);
export const tenantIdIgnored = z
    .string()
    .optional()
    .describe("Ignored by the API; auth tenant wins. Kept for backward compatibility.");
export const objectRecord = z.record(z.string(), z.unknown());
