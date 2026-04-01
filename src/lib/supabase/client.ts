"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./env";
import type { Database } from "../types";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | undefined;

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();

    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
