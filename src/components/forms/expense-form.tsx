"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addExpenseAction } from "@/app/(app)/expenses/actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { initialFormState } from "@/lib/types";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { SubmitButton } from "./submit-button";

type ExpenseFormProps = {
  defaultDate: string;
};

export function ExpenseForm({ defaultDate }: ExpenseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addExpenseAction, initialFormState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router, state.status]);

  const fieldError = (fieldName: string) => state.fieldErrors?.[fieldName]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <Input name="amount" type="number" step="0.01" placeholder="48.50" />
          {fieldError("amount") ? (
            <p className="text-sm text-rose-600">{fieldError("amount")}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <Select name="category" defaultValue={EXPENSE_CATEGORIES[0]}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          {fieldError("category") ? (
            <p className="text-sm text-rose-600">{fieldError("category")}</p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Date</span>
        <Input name="date" type="date" defaultValue={defaultDate} />
        {fieldError("date") ? (
          <p className="text-sm text-rose-600">{fieldError("date")}</p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Note</span>
        <Textarea
          name="note"
          placeholder="Coffee with a client, groceries, train pass..."
        />
        {fieldError("note") ? (
          <p className="text-sm text-rose-600">{fieldError("note")}</p>
        ) : null}
      </label>

      <SubmitButton type="submit" pendingLabel="Saving expense...">
        Save expense
      </SubmitButton>
    </form>
  );
}
