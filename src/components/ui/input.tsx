import type { ComponentPropsWithRef } from "react";

type InputProps = ComponentPropsWithRef<"input"> & {
  hasError?: boolean;
};

export function Input({
  hasError = false,
  className = "",
  ref,
  ...props
}: InputProps) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle transition-all duration-150 focus:outline-none focus:ring-2 ${
        hasError
          ? "border-danger focus:border-danger focus:ring-danger/15"
          : "border-line hover:border-line-strong focus:border-accent focus:ring-accent/15"
      } disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}