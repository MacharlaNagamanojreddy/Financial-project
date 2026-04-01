import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ user }, query] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/");
  }

  const setupMessage =
    query.setup === "1"
      ? "Finish setting up your account, then sign in to continue."
      : undefined;
  const pageMessage =
    typeof query.message === "string" ? decodeURIComponent(query.message) : setupMessage;

  return <AuthForm mode="login" message={pageMessage} />;
}
