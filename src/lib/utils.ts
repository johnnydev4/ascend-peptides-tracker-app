import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDay(value: string | Date): string {
  const date = toDate(value);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
}

export function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  return `${formatDay(date)} · ${format(date, "h:mm a")}`;
}

export function formatTime(value: string | Date): string {
  return format(toDate(value), "h:mm a");
}

export function formatFullDate(value: string | Date): string {
  return format(toDate(value), "MMMM d, yyyy");
}

/** Formats "HH:mm" or "HH:mm:ss" as a friendly local time such as "8:00 PM". */
export function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return format(d, "h:mm a");
}

export function formatAmount(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : String(parseFloat(value.toFixed(4)));
}

/** Human-readable countdown between now and a future date, e.g. "in 3h 20m". */
export function formatCountdown(target: string | Date, now: Date = new Date()): string {
  const diffMs = toDate(target).getTime() - now.getTime();
  if (diffMs <= 0) return "now";
  const totalMinutes = Math.round(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}
