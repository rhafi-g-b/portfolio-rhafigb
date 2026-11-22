import { z } from "zod";

export const messageIdSchema = z.string().uuid("ID pesan tidak valid.");

export const messageReadToggleSchema = z.object({
  id: z.string().uuid("ID pesan tidak valid."),
  is_read: z.boolean(),
});

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};