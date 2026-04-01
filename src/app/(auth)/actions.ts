"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearLocalSession, signInLocal, signUpLocal } from "@/lib/local-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/env";
import type { FormState } from "@/lib/types";
import { loginSchema, signUpSchema, toFormErrorState } from "@/lib/validation";

export async function signInAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return toFormErrorState(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    const localResult = await signInLocal(parsed.data);

    if ("error" in localResult) {
      return {
        status: "error",
        message: localResult.error,
      };
    }

    revalidatePath("/");

    return {
      status: "success",
      redirectTo: "/",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/");

  return {
    status: "success",
    redirectTo: "/",
  };
}

export async function signUpAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    currentBalance: formData.get("currentBalance"),
    monthlyIncome: formData.get("monthlyIncome"),
    monthlyBudget: formData.get("monthlyBudget"),
    currency: formData.get("currency"),
  });

  if (!parsed.success) {
    return toFormErrorState(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    const localResult = await signUpLocal(parsed.data);

    if ("error" in localResult) {
      return {
        status: "error",
        message: localResult.error,
      };
    }

    revalidatePath("/");

    return {
      status: "success",
      redirectTo: "/",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { siteUrl } = getSupabaseConfig();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/login`,
      data: {
        full_name: parsed.data.fullName,
        current_balance: parsed.data.currentBalance,
        monthly_income: parsed.data.monthlyIncome,
        monthly_budget: parsed.data.monthlyBudget,
        currency: parsed.data.currency,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/");

  return data.session
    ? {
        status: "success",
        redirectTo: "/",
      }
    : {
        status: "success",
        message: "Account created. Check your email to confirm your sign-up.",
        redirectTo: "/login?message=Check%20your%20email%20to%20confirm%20your%20sign-up.",
      };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } else {
    await clearLocalSession();
  }

  revalidatePath("/");
  redirect("/login");
}
