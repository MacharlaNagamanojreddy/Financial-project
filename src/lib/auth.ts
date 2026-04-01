import { redirect } from "next/navigation";
import { getLocalViewer, type AppUser } from "./local-store";
import { isSupabaseConfigured } from "./supabase/env";
import { createServerSupabaseClient } from "./supabase/server";
import type { Profile } from "./types";

type ViewerState = {
  user: AppUser | null;
  profile: Profile | null;
  setupRequired: boolean;
};

export async function getCurrentUser(): Promise<ViewerState> {
  if (!isSupabaseConfigured()) {
    const localViewer = await getLocalViewer();

    return {
      user: localViewer.user,
      profile: localViewer.profile,
      setupRequired: false,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      setupRequired: false,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? null,
    setupRequired: false,
  };
}

export async function requireUser() {
  const viewer = await getCurrentUser();

  if (viewer.setupRequired) {
    redirect("/login?setup=1");
  }

  if (!viewer.user) {
    redirect("/login");
  }

  return viewer as {
    user: AppUser;
    profile: Profile | null;
    setupRequired: false;
  };
}
