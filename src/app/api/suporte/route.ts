import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { validateContactInput } from "@/lib/suporte";
import { createSupportMessage } from "@/lib/support-data";
import { sendSupportNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const v = validateContactInput({ email: body?.email, message: body?.message });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const user = await getSessionUser();
  const ok = await createSupportMessage(user?.id ?? null, body.email, body.message);
  if (!ok) return NextResponse.json({ error: "Não foi possível registrar sua mensagem." }, { status: 500 });

  try { await sendSupportNotification({ fromEmail: body.email, message: body.message }); }
  catch (err) { console.error("Falha ao notificar suporte (mensagem já registrada):", err); }

  return NextResponse.json({ ok: true });
}
