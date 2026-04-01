import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function SignUpPage() {
  const { user } = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const message = !isSupabaseConfigured()
    ? "Local mode is on. Your account and finance data stay on this device."
    : undefined;

  return <AuthForm mode="signup" message={message} />;
}
