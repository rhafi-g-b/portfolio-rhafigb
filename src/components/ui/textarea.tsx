import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export function Textarea({
  hasError = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:ring-2 ${
        hasError
          ? "border-danger focus:border-danger focus:ring-danger/15"
          : "border-line hover:border-line-strong focus:border-ink focus:ring-ink/10"
      } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}