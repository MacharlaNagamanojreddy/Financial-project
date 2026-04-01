import {
  CircleDollarSign,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { APP_NAME } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { Card } from "./ui/card";
import { NavLink, type NavIcon } from "./nav-link";

const navigation = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/add-expense", label: "Add Expense", icon: "addExpense" },
  { href: "/transactions", label: "Transactions", icon: "transactions" },
  { href: "/goals", label: "Goals", icon: "goals" },
  { href: "/insights", label: "Insights", icon: "insights" },
  { href: "/profile", label: "Profile", icon: "profile" },
] satisfies Array<{
  href: string;
  label: string;
  icon: NavIcon;
}>;

type AppShellProps = {
  children: React.ReactNode;
  fullName?: string | null;
  email?: string | null;
};

export function AppShell({ children, fullName, email }: AppShellProps) {
  const today = format(new Date(), "EEEE, MMMM d");
  const initials = getInitials(fullName, email);

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <aside className="hidden w-[290px] shrink-0 flex-col gap-4 lg:flex">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                  Personal finance
                </p>
                <h2 className="text-xl font-semibold text-slate-900">{APP_NAME}</h2>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
          </Card>

          <Card className="p-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Daily focus
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Keep the app honest by logging spending the same day.
              </h3>
              <p className="text-sm leading-7 text-muted">
                Small updates make the insights sharper and the wellness score more useful.
              </p>
            </div>
          </Card>
        </aside>

        <div className="flex-1 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted">{today}</p>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Welcome back{fullName ? `, ${fullName.split(" ")[0]}` : ""}.
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/add-expense"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-teal-500 px-5 text-sm font-medium text-white transition hover:bg-teal-600"
                >
                  Add expense
                </Link>
                <div className="flex items-center gap-3 rounded-full border border-line bg-white/80 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {initials}
                  </div>
                  <div className="pr-2">
                    <p className="text-sm font-medium text-slate-900">
                      {fullName || "Your account"}
                    </p>
                    <p className="text-xs text-muted">{email}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <main className="space-y-6">{children}</main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-20 px-4 lg:hidden">
        <div className="mx-auto max-w-lg rounded-[30px] border border-line bg-white/90 p-3 shadow-[var(--shadow)] backdrop-blur-xl">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {navigation.map((item) => (
              <div key={item.href} className="min-w-max">
                <NavLink {...item} />
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
