import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = (supabaseToken: string) => {
  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => supabaseToken,
  });
};
