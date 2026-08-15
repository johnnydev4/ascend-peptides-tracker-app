"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { FieldWrapper, inputBase } from "@/components/ui/Field";
import {
  findPeptide,
  localized,
  searchPeptides,
  type Peptide,
} from "@/lib/peptides";

/**
 * Peptide name field with an autocomplete dropdown of popular peptides.
 * Picking a suggestion autofills the name and notifies the parent so it can
 * show the matching reference info (see {@link PeptideInfoPanel}).
 */
export function PeptideNameField({
  value,
  onChange,
  onBlur,
  onSelect,
  label,
  placeholder,
  hint,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSelect: (peptide: Peptide | null) => void;
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = "peptide-suggestions";

  const suggestions = useMemo(
    () => (open ? searchPeptides(value) : []),
    [open, value]
  );

  // Close the dropdown when clicking/tapping outside the field.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (peptide: Peptide) => {
    onChange(peptide.name);
    onSelect(peptide);
    setOpen(false);
  };

  const handleChange = (next: string) => {
    onChange(next);
    onSelect(findPeptide(next));
    setActive(0);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && suggestions[active]) {
        e.preventDefault();
        choose(suggestions[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor="peptide-name">
      <div ref={containerRef} className="relative">
        <input
          id="peptide-name"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(inputBase, error && "border-terracotta/60")}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        />
        {open && suggestions.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-64 overflow-auto rounded-xl border border-line bg-surface py-1 shadow-raised"
          >
            {suggestions.map((peptide, i) => (
              <li key={peptide.name} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  // mousedown fires before the input's blur, so the pick isn't
                  // lost to the outside-click handler closing the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(peptide);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3.5 py-2 text-left transition-colors",
                    i === active ? "bg-tan-faint" : "hover:bg-tan-faint/60"
                  )}
                >
                  <span className="text-[15px] font-medium text-ink">
                    {peptide.name}
                  </span>
                  <span className="text-xs text-muted">
                    {localized(peptide.fn, locale)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FieldWrapper>
  );
}

/**
 * Compact reference card for a selected peptide. When `peptide` is null it
 * either renders an empty prompt (`showEmpty`) or nothing at all.
 */
export function PeptideInfoPanel({
  peptide,
  showEmpty = false,
  className,
}: {
  peptide: Peptide | null;
  showEmpty?: boolean;
  className?: string;
}) {
  const { t, locale } = useI18n();

  if (!peptide) {
    if (!showEmpty) return null;
    return (
      <div
        className={cn(
          "rounded-card border border-dashed border-line bg-tan-faint/40 px-5 py-6 text-sm text-muted",
          className
        )}
      >
        {t("peptide.empty")}
      </div>
    );
  }

  const rows: { label: string; value: string }[] = [
    { label: t("peptide.function"), value: localized(peptide.fn, locale) },
    { label: t("peptide.dose"), value: localized(peptide.dose, locale) },
    { label: t("peptide.frequency"), value: localized(peptide.freq, locale) },
  ];

  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-soft overflow-hidden",
        className
      )}
    >
      <div className="border-b border-line px-5 pt-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t("peptide.reference")}
        </p>
        <h3 className="mt-0.5 text-base font-semibold text-ink">
          {peptide.name}
        </h3>
      </div>
      <dl className="divide-y divide-line/70">
        {rows.map((row) => (
          <div key={row.label} className="px-5 py-3">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm text-ink-soft">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="flex items-start gap-2 border-t border-line bg-tan-faint/50 px-5 py-3 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t("peptide.disclaimer")}
      </p>
    </div>
  );
}
