"use server";

import { revalidatePath } from "next/cache";
import {
  addLocalGoalContribution,
  createLocalGoal,
  getLocalViewer,
} from "@/lib/local-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { FormState } from "@/lib/types";
import {
  goalContributionSchema,
  goalSchema,
  toFormErrorState,
} from "@/lib/validation";

function revalidateGoalViews() {
  ["/", "/goals", "/insights"].forEach((path) => revalidatePath(path));
}

export async function createGoalAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    currentAmount: formData.get("currentAmount"),
    deadline: formData.get("deadline"),
  });

  if (!parsed.success) {
    return toFormErrorState(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    const localViewer = await getLocalViewer();

    if (!localViewer.user) {
      return {
        status: "error",
        message: "Your session has expired. Sign in again.",
      };
    }

    const result = await createLocalGoal(localViewer.user.id, parsed.data);

    if ("error" in result) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidateGoalViews();

    return {
      status: "success",
      message: "Goal created.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session has expired. Sign in again.",
    };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name: parsed.data.name,
    target_amount: parsed.data.targetAmount,
    current_amount: parsed.data.currentAmount,
    deadline: parsed.data.deadline,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidateGoalViews();

  return {
    status: "success",
    message: "Goal created.",
  };
}

export async function addGoalContributionAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = goalContributionSchema.safeParse({
    goalId: formData.get("goalId"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return toFormErrorState(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    const localViewer = await getLocalViewer();

    if (!localViewer.user) {
      return {
        status: "error",
        message: "Your session has expired. Sign in again.",
      };
    }

    const result = await addLocalGoalContribution(
      localViewer.user.id,
      parsed.data.goalId,
      parsed.data.amount,
    );

    if ("error" in result) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidateGoalViews();

    return {
      status: "success",
      message: "Goal updated.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Your session has expired. Sign in again.",
    };
  }

  const rpcResult = await supabase.rpc("increment_goal_progress", {
    goal_id: parsed.data.goalId,
    contribution_amount: parsed.data.amount,
  });

  if (rpcResult.error) {
    const goalResult = await supabase
      .from("goals")
      .select("current_amount,target_amount")
      .eq("id", parsed.data.goalId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (goalResult.error || !goalResult.data) {
      return {
        status: "error",
        message: goalResult.error?.message ?? "Goal not found.",
      };
    }

    const nextAmount = Math.min(
      Number(goalResult.data.current_amount ?? 0) + parsed.data.amount,
      Number(goalResult.data.target_amount ?? 0),
    );

    const { error } = await supabase
      .from("goals")
      .update({ current_amount: nextAmount })
      .eq("id", parsed.data.goalId)
      .eq("user_id", user.id);

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  revalidateGoalViews();

  return {
    status: "success",
    message: "Goal updated.",
  };
}
