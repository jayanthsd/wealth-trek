import { createClient } from "@/utils/supabase/server";

export function getDb() {
  return createClient();
}
