"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Compass,
  PlusCircle,
  Target,
  UserRound,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: Compass,
  addExpense: PlusCircle,
  transactions: WalletCards,
  goals: Target,
  insights: BarChart3,
  profile: UserRound,
} as const;

export type NavIcon = keyof typeof iconMap;

type NavLinkProps = {
  href: string;
  label: string;
  icon: NavIcon;
};

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname.startsWith(href);
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
          : "text-slate-700 hover:bg-white/80 hover:text-slate-900",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
