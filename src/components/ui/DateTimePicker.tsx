"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn, formatWith } from "@/lib/utils";
import { FieldWrapper } from "@/components/ui/Field";

// Native <input type="date|time|datetime-local"> renders an OS/browser popup we
// cannot theme. These components replace them with popovers built from the app's
// own design tokens, and always present dates as DD/MM/YYYY regardless of locale.

const triggerBase =
  "w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink transition-colors focus:border-tan focus:outline-none disabled:opacity-50 flex items-center gap-2 text-left";

// --- value <-> Date helpers (all local time, no timezone drift) -------------

function parseDateValue(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function parseTimeValue(v: string): { h: number; m: number } | null {
  const m = /(\d{2}):(\d{2})/.exec(v);
  if (!m) return null;
  return { h: Number(m[1]), m: Number(m[2]) };
}

const pad = (n: number) => String(n).padStart(2, "0");

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// --- Positioned popover, portalled to <body> --------------------------------

function Popover({
  anchorRef,
  open,
  onClose,
  children,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const panelH = panel?.offsetHeight ?? 320;
      const panelW = panel?.offsetWidth ?? r.width;
      const gap = 6;
      const below = r.bottom + gap;
      const openUp = below + panelH > window.innerHeight && r.top - gap - panelH > 0;
      const top = openUp ? r.top - gap - panelH : below;
      let left = r.left;
      const overflowRight = left + panelW - window.innerWidth;
      if (overflowRight > 0) left = Math.max(8, left - overflowRight - 8);
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target))
        return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      className="fixed z-[60] rounded-2xl border border-line bg-surface shadow-raised p-3 animate-[fade-in_0.12s_ease-out]"
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// --- Calendar grid ----------------------------------------------------------

function CalendarGrid({
  selected,
  onPick,
}: {
  selected: Date | null;
  onPick: (d: Date) => void;
}) {
  const [view, setView] = useState<Date>(startOfMonth(selected ?? new Date()));
  const today = new Date();

  const weekdayLabels = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return formatWith(d, "EEEEEE");
    });
  }, []);

  const days = useMemo(() => {
    const from = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
    const to = endOfWeek(endOfMonth(view), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: from, end: to });
  }, [view]);

  return (
    <div className="w-[17rem]">
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView((v) => addMonths(v, -1))}
          className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-ink capitalize">
          {formatWith(view, "LLLL yyyy")}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView((v) => addMonths(v, 1))}
          className="rounded-lg p-1.5 text-muted hover:bg-cream-deep hover:text-ink transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weekdayLabels.map((w, i) => (
          <span
            key={i}
            className="h-7 flex items-center justify-center text-[11px] font-medium text-muted capitalize"
          >
            {w}
          </span>
        ))}
        {days.map((d) => {
          const inMonth = isSameMonth(d, view);
          const isSelected = selected && isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onPick(d)}
              className={cn(
                "h-9 rounded-lg text-sm transition-colors",
                isSelected
                  ? "bg-ink text-cream font-semibold"
                  : inMonth
                    ? "text-ink hover:bg-cream-deep"
                    : "text-muted/50 hover:bg-cream-deep",
                !isSelected && isToday && "ring-1 ring-tan font-semibold"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Time picker (hour / minute columns) ------------------------------------

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function TimeColumns({
  hour,
  minute,
  onChange,
}: {
  hour: number;
  minute: number;
  onChange: (h: number, m: number) => void;
}) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hourRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "center" });
    minRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "center" });
  }, []);

  // Include the current minute even if it isn't a 5-minute step.
  const minutes = MINUTES.includes(minute)
    ? MINUTES
    : [...MINUTES, minute].sort((a, b) => a - b);

  const label = (n: number) => pad(n);
  const cell =
    "w-full rounded-lg px-3 py-1.5 text-sm text-center transition-colors cursor-pointer";

  return (
    <div className="flex gap-2 w-[17rem]">
      <div
        ref={hourRef}
        className="flex-1 max-h-48 overflow-y-auto flex flex-col gap-0.5 pr-1"
      >
        {HOURS.map((h) => (
          <button
            key={h}
            type="button"
            data-active={h === hour}
            onClick={() => onChange(h, minute)}
            className={cn(
              cell,
              h === hour ? "bg-ink text-cream font-semibold" : "text-ink hover:bg-cream-deep"
            )}
          >
            {label(h)}
          </button>
        ))}
      </div>
      <div className="w-px bg-line" aria-hidden />
      <div
        ref={minRef}
        className="flex-1 max-h-48 overflow-y-auto flex flex-col gap-0.5 pl-1"
      >
        {minutes.map((m) => (
          <button
            key={m}
            type="button"
            data-active={m === minute}
            onClick={() => onChange(hour, m)}
            className={cn(
              cell,
              m === minute ? "bg-ink text-cream font-semibold" : "text-ink hover:bg-cream-deep"
            )}
          >
            {label(m)}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Public fields ----------------------------------------------------------

interface FieldChrome {
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
}

/** Themed date field. Value is `yyyy-MM-dd`, displayed as DD/MM/YYYY. */
export function DateField({
  value,
  onChange,
  label,
  error,
  hint,
  disabled,
  placeholder = "DD/MM/AAAA",
}: FieldChrome & { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected = parseDateValue(value);

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={!!error}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerBase, error && "border-terracotta/60")}
      >
        <CalendarDays className="size-4 text-muted shrink-0" aria-hidden />
        <span className={cn(!selected && "text-muted/70")}>
          {selected ? formatWith(selected, "dd/MM/yyyy") : placeholder}
        </span>
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)}>
        <CalendarGrid
          selected={selected}
          onPick={(d) => {
            onChange(ymd(d));
            setOpen(false);
          }}
        />
      </Popover>
    </FieldWrapper>
  );
}

/** Themed time field. Value is `HH:mm`, displayed as a localized clock time. */
export function TimeField({
  value,
  onChange,
  label,
  error,
  hint,
  disabled,
  placeholder = "--:--",
}: FieldChrome & { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();
  const parsed = parseTimeValue(value);
  const display = useMemo(() => {
    if (!parsed) return null;
    const d = new Date();
    d.setHours(parsed.h, parsed.m, 0, 0);
    return formatWith(d, "h:mm a");
  }, [parsed]);

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={!!error}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerBase, error && "border-terracotta/60")}
      >
        <Clock className="size-4 text-muted shrink-0" aria-hidden />
        <span className={cn(!display && "text-muted/70")}>
          {display ?? placeholder}
        </span>
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)}>
        <TimeColumns
          hour={parsed?.h ?? 8}
          minute={parsed?.m ?? 0}
          onChange={(h, m) => onChange(`${pad(h)}:${pad(m)}`)}
        />
      </Popover>
    </FieldWrapper>
  );
}

/** Themed date+time field. Value is `yyyy-MM-dd'T'HH:mm`, shown as DD/MM/YYYY · time. */
export function DateTimeField({
  value,
  onChange,
  label,
  error,
  hint,
  disabled,
  placeholder = "DD/MM/AAAA --:--",
}: FieldChrome & { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const id = useId();

  const [datePart = "", timePart = ""] = value.split("T");
  const selected = parseDateValue(datePart);
  const parsedTime = parseTimeValue(timePart);
  const hour = parsedTime?.h ?? 8;
  const minute = parsedTime?.m ?? 0;

  const commit = (d: Date | null, h: number, m: number) => {
    if (!d) return;
    onChange(`${ymd(d)}T${pad(h)}:${pad(m)}`);
  };

  const display = useMemo(() => {
    if (!selected) return null;
    const d = new Date(selected);
    d.setHours(hour, minute, 0, 0);
    return `${formatWith(selected, "dd/MM/yyyy")} · ${formatWith(d, "h:mm a")}`;
  }, [selected, hour, minute]);

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={!!error}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerBase, error && "border-terracotta/60")}
      >
        <CalendarDays className="size-4 text-muted shrink-0" aria-hidden />
        <span className={cn(!display && "text-muted/70")}>
          {display ?? placeholder}
        </span>
      </button>
      <Popover anchorRef={ref} open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3">
          <CalendarGrid
            selected={selected}
            onPick={(d) => commit(d, hour, minute)}
          />
          <div className="border-t border-line pt-3">
            <p className="px-1 pb-2 text-[11px] font-medium text-muted uppercase tracking-wide">
              {formatWith(new Date(0, 0, 0, hour, minute), "h:mm a")}
            </p>
            <TimeColumns
              hour={hour}
              minute={minute}
              onChange={(h, m) => commit(selected ?? new Date(), h, m)}
            />
          </div>
        </div>
      </Popover>
    </FieldWrapper>
  );
}
