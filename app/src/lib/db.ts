import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

export async function getAuthenticatedClient() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return { userId: null, supabase: null };
  }

  // Use the new Third-Party Auth method (no template needed)
  const token = await getToken();
  if (!token) {
    return { userId, supabase: null };
  }

  return { userId, supabase: createClient(token) };
}
