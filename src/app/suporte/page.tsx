import { FAQ_ITEMS } from "@/components/marketing/v2/faq-data";
import ContatoForm from "@/components/support/ContatoForm";

export const metadata = { title: "Suporte — Matriz Central", description: "Tire dúvidas ou fale com a gente." };

export default function SuportePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="mt-1 text-zinc-600">Veja as dúvidas frequentes ou envie uma mensagem.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Dúvidas frequentes</h2>
        <ul className="space-y-3">
          {FAQ_ITEMS.map((f) => (
            <li key={f.question} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="font-semibold text-zinc-900">{f.question}</p>
              <p className="mt-1 text-sm text-zinc-600">{f.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Fale com a gente</h2>
        <ContatoForm />
      </section>
    </div>
  );
}
