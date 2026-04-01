"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createGoalAction } from "@/app/(app)/goals/actions";
import { initialFormState } from "@/lib/types";
import { Input } from "../ui/input";
import { SubmitButton } from "./submit-button";

type GoalFormProps = {
  defaultDeadline: string;
};

export function GoalForm({ defaultDeadline }: GoalFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createGoalAction, initialFormState);

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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Goal name</span>
        <Input name="name" placeholder="Emergency fund" />
        {fieldError("name") ? (
          <p className="text-sm text-rose-600">{fieldError("name")}</p>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Target amount</span>
          <Input name="targetAmount" type="number" step="0.01" placeholder="10000" />
          {fieldError("targetAmount") ? (
            <p className="text-sm text-rose-600">{fieldError("targetAmount")}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Starting amount</span>
          <Input name="currentAmount" type="number" step="0.01" placeholder="1500" />
          {fieldError("currentAmount") ? (
            <p className="text-sm text-rose-600">{fieldError("currentAmount")}</p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Deadline</span>
        <Input name="deadline" type="date" defaultValue={defaultDeadline} />
        {fieldError("deadline") ? (
          <p className="text-sm text-rose-600">{fieldError("deadline")}</p>
        ) : null}
      </label>

      <SubmitButton type="submit" pendingLabel="Creating goal...">
        Create goal
      </SubmitButton>
    </form>
  );
}
