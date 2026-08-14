import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";
import { es, enUS, type Locale as DateFnsLocale } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Locale-aware date formatting -----------------------------------------
// A tiny module-level locale, kept in sync by the I18n provider so date helpers
// stay locale-aware without threading a locale through every call site.

type AppLocale = "es" | "en";
let currentLocale: AppLocale = "es";
const dateFnsLocales: Record<AppLocale, DateFnsLocale> = { es, en: enUS };

export function setDateLocale(locale: AppLocale) {
  currentLocale = locale;
}

const dayWords: Record<AppLocale, { today: string; tomorrow: string; yesterday: string }> = {
  es: { today: "Hoy", tomorrow: "Mañana", yesterday: "Ayer" },
  en: { today: "Today", tomorrow: "Tomorrow", yesterday: "Yesterday" },
};

function fmt(date: Date, pattern: string): string {
  return format(date, pattern, { locale: dateFnsLocales[currentLocale] });
}

export function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDay(value: string | Date): string {
  const date = toDate(value);
  const words = dayWords[currentLocale];
  if (isToday(date)) return words.today;
  if (isTomorrow(date)) return words.tomorrow;
  if (isYesterday(date)) return words.yesterday;
  return fmt(date, "EEE, d MMM");
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return `${formatDay(date)} · ${fmt(date, "h:mm a")}`;
}

export function formatTime(value: string | Date): string {
  return fmt(toDate(value), "h:mm a");
}

export function formatFullDate(value: string | Date): string {
  const pattern =
    currentLocale === "es" ? "d 'de' MMMM 'de' yyyy" : "MMMM d, yyyy";
  return fmt(toDate(value), pattern);
}

export function formatMonthYear(value: string | Date): string {
  return fmt(toDate(value), "MMMM yyyy");
}

/** Formats "HH:mm" or "HH:mm:ss" as a friendly local time. */
export function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return fmt(d, "h:mm a");
}

export function formatAmount(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : String(parseFloat(value.toFixed(4)));
}

/** Human-readable countdown between now and a future date. */
export function formatCountdown(
  target: string | Date,
  now: Date = new Date()
): string {
  const diffMs = toDate(target).getTime() - now.getTime();
  const es = currentLocale === "es";
  if (diffMs <= 0) return es ? "ahora" : "now";
  const totalMinutes = Math.round(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const prefix = es ? "en" : "in";
  if (days > 0) return `${prefix} ${days}d ${hours}h`;
  if (hours > 0) return `${prefix} ${hours}h ${minutes}m`;
  return `${prefix} ${minutes}m`;
}
