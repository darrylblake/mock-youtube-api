import { createClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";

export const client = createClient<Database>(
  // @ts-ignore
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
