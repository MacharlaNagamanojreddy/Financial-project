import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EXPENSE_CATEGORIES } from "./constants";

const CATEGORY_COLORS = [
  "#1f7a65",
  "#3b82f6",
  "#d18b36",
  "#c65c50",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f97316",
  "#0ea5e9",
  "#64748b",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(value: string | Date, pattern = "MMM d, yyyy") {
  return format(new Date(value), pattern);
}

export function getCategoryColor(category: string) {
  const index = EXPENSE_CATEGORIES.findIndex((item) => item === category);

  if (index >= 0) {
    return CATEGORY_COLORS[index];
  }

  const fallbackIndex =
    Array.from(category).reduce((hash, character) => hash + character.charCodeAt(0), 0) %
    CATEGORY_COLORS.length;

  return CATEGORY_COLORS[fallbackIndex];
}

export function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    const [first = "", second = ""] = name.trim().split(/\s+/);
    return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  }

  return (email?.slice(0, 2) ?? "NF").toUpperCase();
}

export function getScoreAppearance(score: number) {
  if (score >= 80) {
    return {
      label: "Excellent",
      badgeClass: "bg-emerald-100 text-emerald-700",
      accentClass: "from-emerald-500 to-teal-500",
      progressClass: "bg-emerald-500",
      textClass: "text-emerald-700",
    };
  }

  if (score >= 65) {
    return {
      label: "Healthy",
      badgeClass: "bg-teal-100 text-teal-700",
      accentClass: "from-teal-500 to-cyan-500",
      progressClass: "bg-teal-500",
      textClass: "text-teal-700",
    };
  }

  if (score >= 50) {
    return {
      label: "Building",
      badgeClass: "bg-amber-100 text-amber-700",
      accentClass: "from-amber-500 to-orange-500",
      progressClass: "bg-amber-500",
      textClass: "text-amber-700",
    };
  }

  return {
    label: "Needs attention",
    badgeClass: "bg-rose-100 text-rose-700",
    accentClass: "from-rose-500 to-orange-500",
    progressClass: "bg-rose-500",
    textClass: "text-rose-700",
  };
}
