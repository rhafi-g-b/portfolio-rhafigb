import type { Metadata } from "next";
import { LoginShell } from "@/components/admin/auth/login-shell";
import { LoginForm } from "@/components/admin/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  );
}