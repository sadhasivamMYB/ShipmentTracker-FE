import { z } from "zod";

const ALLOWED_DOCUMENT_CODES = ["PFI", "IINS", "BL", "EXPORT_PFI", "EINS", "FI", "PAAR", "FORM_M", "SGD"] as const;

// Schema for incoming DocumentType data from the backend
export const DocumentTypeResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  documentCode: z.enum(ALLOWED_DOCUMENT_CODES),
  description: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type DocumentTypeResponse = z.infer<typeof DocumentTypeResponseSchema>;

// Form schema for creating/updating a DocumentType (Payload)
export const DocumentTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  documentCode: z.enum(ALLOWED_DOCUMENT_CODES, { message: "Document code must be one of the allowed values" }),
  description: z.string().max(255).optional().nullable(),
  status: z.enum(["active", "inactive"]),
});

export type DocumentTypeFormData = z.infer<typeof DocumentTypeFormSchema>;
