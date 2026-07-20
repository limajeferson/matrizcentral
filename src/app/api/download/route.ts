import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

/**
 * O download em arquivo foi aposentado — o material agora é lido direto na
 * plataforma (`/biblioteca/[slug]`). Esta rota continua viva (não é 404 mudo)
 * só para orientar quem ainda tem o link antigo salvo: valida o token como
 * sempre validou e responde 410 com o link de resgate. Token inválido/expirado
 * segue 404, exatamente como antes — é essa validação que distingue os dois
 * casos.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token inválido ou expirado" }, { status: 404 });
  }

  return NextResponse.json(
    {
      error:
        "O download em arquivo foi aposentado — seu material agora é lido direto na plataforma.",
      resgate: `/entrar/resgate?token=${encodeURIComponent(token)}`,
    },
    { status: 410 }
  );
}
