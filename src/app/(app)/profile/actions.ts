"use server";

import { revalidatePath } from "next/cache";
import { getLocalViewer, updateLocalProfile } from "@/lib/local-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { FormState } from "@/lib/types";
import { profileSchema, toFormErrorState } from "@/lib/validation";

function revalidateProfileViews() {
  ["/", "/profile", "/insights"].forEach((path) => revalidatePath(path));
}

export async function updateProfileAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    currentBalance: formData.get("currentBalance"),
    monthlyIncome: formData.get("monthlyIncome"),
    monthlyBudget: formData.get("monthlyBudget"),
    currency: formData.get("currency"),
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

    const result = await updateLocalProfile(localViewer.user.id, {
      ...parsed.data,
      email: localViewer.user.email ?? "",
    });

    if ("error" in result) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidateProfileViews();

    return {
      status: "success",
      message: "Profile updated.",
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

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: parsed.data.fullName,
      current_balance: parsed.data.currentBalance,
      monthly_income: parsed.data.monthlyIncome,
      monthly_budget: parsed.data.monthlyBudget,
      currency: parsed.data.currency,
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidateProfileViews();

  return {
    status: "success",
    message: "Profile updated.",
  };
}
