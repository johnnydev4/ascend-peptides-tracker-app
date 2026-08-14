"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

const inputBase =
  "w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:border-tan focus:outline-none disabled:opacity-50";

export function FieldWrapper({
  label,
  error,
  hint,
  htmlFor,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  // Errors coming from Zod are i18n keys; t() falls back to plain text for
  // any error passed through directly.
  const shownError = error ? t(error) : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-ink-soft"
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {shownError && (
        <p role="alert" className="text-xs text-terracotta">
          {shownError}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, suffix, className, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(inputBase, error && "border-terracotta/60", suffix && "pr-14", className)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, hint, className, id, children, ...props }, ref) {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
      <FieldWrapper label={label} error={error} hint={hint} htmlFor={selectId}>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              inputBase,
              "appearance-none pr-10 cursor-pointer",
              error && "border-terracotta/60",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none"
            aria-hidden
          />
        </div>
      </FieldWrapper>
    );
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const autoId = useId();
    const textareaId = id ?? autoId;
    return (
      <FieldWrapper label={label} error={error} hint={hint} htmlFor={textareaId}>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            inputBase,
            "h-auto min-h-24 py-2.5 resize-y",
            error && "border-terracotta/60",
            className
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
