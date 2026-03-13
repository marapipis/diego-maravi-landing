import { createClient } from "@supabase/supabase-js";

// Cliente server-side con service role (acceso total, solo en servidor)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient() {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    }
    return createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });
}

export { getSupabaseClient };
