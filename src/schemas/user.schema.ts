import { z } from "zod";

// Schema for incoming User data from the backend
export const UserResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"], { message: "Role is required" }),
  status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]).catch("INVITED"),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// Form schema for creating/updating a user (Payload)
export const UserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.enum(["admin", "user"], { message: "Role is required" }),
  status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]),
  sendInvitation: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof UserFormSchema>;
