import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground border border-accent hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
  secondary:
    "bg-surface text-ink border border-line hover:bg-surface-muted hover:border-line-strong shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
  ghost:
    "bg-transparent text-ink-muted border border-transparent hover:bg-surface-muted hover:text-ink",
  danger:
    "bg-danger-bg text-danger border border-danger-line hover:bg-red-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}