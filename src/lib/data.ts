import { getLocalFinanceSnapshot } from "./local-store";
import { isSupabaseConfigured } from "./supabase/env";
import { createServerSupabaseClient } from "./supabase/server";
import type { Expense, Goal, Profile } from "./types";

export type FinanceSnapshot = {
  profile: Profile | null;
  expenses: Expense[];
  goals: Goal[];
  error: string | null;
};

export async function getFinanceSnapshot(userId: string): Promise<FinanceSnapshot> {
  if (!isSupabaseConfigured()) {
    return getLocalFinanceSnapshot(userId);
  }

  const supabase = await createServerSupabaseClient();

  const [profileResult, expensesResult, goalsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("deadline", { ascending: true }),
  ]);

  const errors = [profileResult.error, expensesResult.error, goalsResult.error].filter(Boolean);

  return {
    profile: profileResult.data ?? null,
    expenses: expensesResult.data ?? [],
    goals: goalsResult.data ?? [],
    error: errors.length
      ? "The Supabase schema is missing or the current user cannot access finance records yet."
      : null,
  };
}
