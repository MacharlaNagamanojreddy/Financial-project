"use server";

import { revalidatePath } from "next/cache";
import { addLocalExpense, getLocalViewer } from "@/lib/local-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { FormState } from "@/lib/types";
import { expenseSchema, toFormErrorState } from "@/lib/validation";

function revalidateExpenseViews() {
  ["/", "/add-expense", "/transactions", "/insights", "/profile"].forEach((path) =>
    revalidatePath(path),
  );
}

export async function addExpenseAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    date: formData.get("date"),
    note: formData.get("note"),
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

    const result = await addLocalExpense(localViewer.user.id, parsed.data);

    if ("error" in result) {
      return {
        status: "error",
        message: result.error,
      };
    }

    revalidateExpenseViews();

    return {
      status: "success",
      message: "Expense saved.",
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

  const rpcResult = await supabase.rpc("add_expense_with_balance", {
    expense_amount: parsed.data.amount,
    expense_category: parsed.data.category,
    expense_date: parsed.data.date,
    expense_note: parsed.data.note?.trim() || null,
  });

  if (rpcResult.error) {
    const profileResult = await supabase
      .from("profiles")
      .select("current_balance")
      .eq("id", user.id)
      .maybeSingle();

    const insertResult = await supabase.from("expenses").insert({
      user_id: user.id,
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: parsed.data.date,
      note: parsed.data.note?.trim() || null,
    });

    if (insertResult.error) {
      return {
        status: "error",
        message: insertResult.error.message,
      };
    }

    if (profileResult.data) {
      await supabase
        .from("profiles")
        .update({
          current_balance:
            Number(profileResult.data.current_balance ?? 0) - parsed.data.amount,
        })
        .eq("id", user.id);
    }
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "Expense saved.",
  };
}
