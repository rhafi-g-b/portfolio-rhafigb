"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginAction, type LoginActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  error: null,
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger-line bg-danger-bg px-3.5 py-3 text-xs font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-ink"
        >
          Alamat Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="admin@domain.com"
          hasError={Boolean(state.error)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-ink"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="••••••••••••"
            hasError={Boolean(state.error)}
            disabled={isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
            }
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-subtle transition-colors hover:text-ink cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full"
      >
        <span>{isPending ? "Memverifikasi..." : "Masuk ke Workspace"}</span>
        {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
    </form>
  );
}