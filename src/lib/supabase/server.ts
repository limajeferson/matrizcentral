import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function getSupabaseServerClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        // O Next 14 intercepta o fetch global e pode gravar GETs no Data Cache
        // (que persiste entre deploys). Leitura de banco é por request, nunca
        // cacheável pelo framework: o fórum serviu respostas velhas em produção
        // por causa disto (2026-07-22). `force-dynamic` na página NÃO cobre
        // fetch de terceiros de forma confiável — o no-store explícito cobre.
        fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}
