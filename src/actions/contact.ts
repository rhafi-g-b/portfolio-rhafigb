"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validators/contact";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string>;
  timestamp?: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;
const contactRateLimitStore = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  if (contactRateLimitStore.size < 200) {
    return;
  }

  for (const [key, entry] of contactRateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      contactRateLimitStore.delete(key);
    }
  }
}

function checkContactRateLimit(ip: string): {
  allowed: boolean;
  retryMinutes: number;
} {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const existing = contactRateLimitStore.get(ip);
  if (!existing || existing.resetAt <= now) {
    contactRateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryMinutes: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryMinutes = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 60000)
    );
    return { allowed: false, retryMinutes };
  }

  existing.count += 1;
  contactRateLimitStore.set(ip, existing);
  return { allowed: true, retryMinutes: 0 };
}

async function resolveClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function extractFieldErrors(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function submitContactMessageAction(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Pesan Anda berhasil dikirim. Terima kasih telah menghubungi.",
      timestamp: Date.now(),
    };
  }

  const parsed = contactFormSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali kolom yang ditandai sebelum mengirim.",
      fieldErrors: extractFieldErrors(parsed.error.issues),
      timestamp: Date.now(),
    };
  }

  const ip = await resolveClientIp();
  const limit = checkContactRateLimit(ip);
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Terlalu banyak pengiriman pesan. Silakan coba lagi dalam ${limit.retryMinutes} menit.`,
      timestamp: Date.now(),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return {
      status: "error",
      message: "Gagal mengirim pesan saat ini. Silakan coba beberapa saat lagi.",
      timestamp: Date.now(),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/messages");

  return {
    status: "success",
    message: "Pesan Anda berhasil dikirim. Saya akan segera membalas via email.",
    timestamp: Date.now(),
  };
}