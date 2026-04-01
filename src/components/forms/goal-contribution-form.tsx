"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addGoalContributionAction } from "@/app/(app)/goals/actions";
import { initialFormState } from "@/lib/types";
import { Input } from "../ui/input";
import { SubmitButton } from "./submit-button";

type GoalContributionFormProps = {
  goalId: string;
};

export function GoalContributionForm({
  goalId,
}: GoalContributionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    addGoalContributionAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router, state.status]);

  const error = state.fieldErrors?.amount?.[0] ?? state.message;

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="goalId" value={goalId} />
      <div className="flex gap-3">
        <Input
          name="amount"
          type="number"
          step="0.01"
          placeholder="250"
          className="h-11"
        />
        <SubmitButton type="submit" size="sm" pendingLabel="Updating...">
          Add
        </SubmitButton>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
