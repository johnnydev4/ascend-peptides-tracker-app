import {
  Home,
  Syringe,
  CalendarDays,
  Pill,
  Target,
  Sparkles,
  Calculator,
  Clock,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** i18n key for the label. */
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "nav.dashboard", icon: Home },
  { href: "/treatments", label: "nav.treatments", icon: Syringe },
  { href: "/calendar", label: "nav.calendar", icon: CalendarDays },
  { href: "/doses", label: "nav.doses", icon: Pill },
  { href: "/injection-sites", label: "nav.injectionSites", icon: Target },
  { href: "/side-effects", label: "nav.sideEffects", icon: Sparkles },
  { href: "/calculator", label: "nav.calculator", icon: Calculator },
  { href: "/history", label: "nav.history", icon: Clock },
  { href: "/settings", label: "nav.settings", icon: Settings },
];

/** Subset shown in the mobile bottom bar. */
export const MOBILE_NAV = ["/dashboard", "/treatments", "/calendar"];
