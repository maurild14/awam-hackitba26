import { HttpError } from "../lib/httpError.js";

/**
 * @param {{ adminClient: import("@supabase/supabase-js").SupabaseClient }} dependencies
 */
export function createProfileModel({ adminClient }) {
  return {
    /**
     * @param {string} userId
     */
    async getByUserId(userId) {
      const { data, error } = await adminClient
        .from("profiles")
        .select("id, username, role, mp_customer_id, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "PROFILE_READ_FAILED",
          "Could not load the current profile."
        );
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        role: data.role,
        mpCustomerId: data.mp_customer_id,
        createdAt: data.created_at
      };
    }
  };
}
