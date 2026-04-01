"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/(app)/profile/actions";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { initialFormState, type Profile } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { SubmitButton } from "./submit-button";

type ProfileFormProps = {
  profile: Profile | null;
  email: string;
};

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, initialFormState);

  useEffect(() => {
    if (state.status === "success") {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router, state.status]);

  const fieldError = (fieldName: string) => state.fieldErrors?.[fieldName]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "border border-rose-200 bg-rose-50 text-rose-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <Input value={email} readOnly disabled />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Full name</span>
        <Input
          name="fullName"
          defaultValue={profile?.full_name ?? ""}
          placeholder="Maya Chen"
        />
        {fieldError("fullName") ? (
          <p className="text-sm text-rose-600">{fieldError("fullName")}</p>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Current balance</span>
          <Input
            name="currentBalance"
            type="number"
            step="0.01"
            defaultValue={profile?.current_balance ?? 0}
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
            defaultValue={profile?.monthly_income ?? 0}
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
            defaultValue={profile?.monthly_budget ?? 0}
          />
          {fieldError("monthlyBudget") ? (
            <p className="text-sm text-rose-600">{fieldError("monthlyBudget")}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Currency</span>
          <Select name="currency" defaultValue={profile?.currency ?? "USD"}>
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

      <SubmitButton type="submit" pendingLabel="Saving profile...">
        Save profile
      </SubmitButton>
    </form>
  );
}
