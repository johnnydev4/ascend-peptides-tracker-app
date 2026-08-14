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
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/treatments", label: "Treatments", icon: Syringe },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/doses", label: "Doses", icon: Pill },
  { href: "/injection-sites", label: "Injection Sites", icon: Target },
  { href: "/side-effects", label: "Side Effects", icon: Sparkles },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Subset shown in the mobile bottom bar. */
export const MOBILE_NAV = ["/dashboard", "/treatments", "/calendar"];
