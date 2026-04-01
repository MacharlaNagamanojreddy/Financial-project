import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireUser();

  return (
    <AppShell fullName={profile?.full_name} email={user.email}>
      {children}
    </AppShell>
  );
}
