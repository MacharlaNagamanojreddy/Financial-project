"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInAction, signUpAction } from "@/app/(auth)/actions";
import { initialFormState } from "@/lib/types";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { SubmitButton } from "./submit-button";

type AuthFormProps = {
  mode: "login" | "signup";
  message?: string;
  disabled?: boolean;
};

export function AuthForm({ mode, message, disabled = false }: AuthFormProps) {
  const router = useRouter();
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction] = useActionState(action, initialFormState);

  useEffect(() => {
    if (state.status === "success" && state.redirectTo) {
      startTransition(() => {
        router.push(state.redirectTo!);
        router.refresh();
      });
    }
  }, [router, state.redirectTo, state.status]);

  const fieldError = (fieldName: string) => state.fieldErrors?.[fieldName]?.[0];

  return (
    <div className="surface-card-strong w-full max-w-xl p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          {mode === "login" ? "Sign in to your dashboard" : "Start tracking with confidence"}
        </h2>
        <p className="text-sm leading-7 text-muted">
          {mode === "login"
            ? "Use your email and password to get back to your dashboard."
            : "Create an account and optionally add your starting balance, income, and budget."}
        </p>
      </div>

      {message ? (
        <div className="mt-6 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {state.message ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="mt-6 space-y-5">
        {mode === "signup" ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <Input name="fullName" placeholder="Maya Chen" disabled={disabled} />
            {fieldError("fullName") ? (
              <p className="text-sm text-rose-600">{fieldError("fullName")}</p>
            ) : null}
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={disabled}
          />
          {fieldError("email") ? (
            <p className="text-sm text-rose-600">{fieldError("email")}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <Input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            disabled={disabled}
          />
          {fieldError("password") ? (
            <p className="text-sm text-rose-600">{fieldError("password")}</p>
          ) : null}
        </label>

        {mode === "signup" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Current balance</span>
                <Input
                  name="currentBalance"
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  disabled={disabled}
                />
                {fieldError("currentBalance") ? (
                  <p className="text-sm text-rose-600">{fieldError("currentBalance")}</p>
                ) : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Monthly income</span>
                <Input
                  name="monthlyIncome"
                  type="number"
                  step="0.01"
                  placeholder="4200"
                  disabled={disabled}
                />
                {fieldError("monthlyIncome") ? (
                  <p className="text-sm text-rose-600">{fieldError("monthlyIncome")}</p>
                ) : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Monthly budget</span>
                <Input
                  name="monthlyBudget"
                  type="number"
                  step="0.01"
                  placeholder="2800"
                  disabled={disabled}
                />
                {fieldError("monthlyBudget") ? (
                  <p className="text-sm text-rose-600">{fieldError("monthlyBudget")}</p>
                ) : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Currency</span>
                <Select name="currency" defaultValue="USD" disabled={disabled}>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
                {fieldError("currency") ? (
                  <p className="text-sm text-rose-600">{fieldError("currency")}</p>
                ) : null}
              </label>
            </div>
          </>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SubmitButton
            type="submit"
            pendingLabel={mode === "login" ? "Signing in..." : "Creating account..."}
            disabled={disabled}
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </SubmitButton>

          <Link
            href={mode === "login" ? "/sign-up" : "/login"}
            className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </Link>
        </div>
      </form>
    </div>
  );
}
