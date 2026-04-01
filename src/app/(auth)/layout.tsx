import type { ReactNode } from "react";
import { CircleDollarSign, Sparkles, Target, TrendingUp } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="surface-card-strong hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[28px] bg-slate-900 text-white">
              <CircleDollarSign className="h-8 w-8" />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Money, made calmer
              </p>
              <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-slate-900">
                {APP_NAME} keeps your spending, savings, and goals readable at a glance.
              </h1>
              <p className="max-w-xl text-base leading-8 text-muted">
                Built for young professionals who want clarity without spreadsheets or intimidating financial language.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Spending clarity",
                body: "See where your money goes each month in a few seconds.",
              },
              {
                icon: Target,
                title: "Goal momentum",
                body: "Track savings goals with pacing that feels motivating.",
              },
              {
                icon: Sparkles,
                title: "Simple insights",
                body: "Get short, plain-language nudges you can act on.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[28px] border border-line bg-white/75 p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">{children}</section>
      </div>
    </div>
  );
}
