import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/email-validation";
import { requestMagicLink } from "@/lib/auth-session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  try {
    const status = await requestMagicLink(email);
    return NextResponse.json({ status });
  } catch (err) {
    console.error("Falha ao processar pedido de magic link:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar o link agora. Tente novamente." },
      { status: 500 }
    );
  }
}
