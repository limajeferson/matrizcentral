import Link from "next/link";

/**
 * Links de contrato/suporte. Usado no rodapé antigo (/oferta) e nas páginas de
 * checkout, que não têm rodapé próprio. Sem estilo de tema: herda a cor do pai,
 * então funciona no claro (.lp-guide) e no escuro (.mc-checkout).
 */
export default function LegalLinks({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Links legais">
      <Link href="/legal/termos">Termos de uso</Link>
      <Link href="/legal/termos#garantia">Garantia</Link>
      <Link href="/legal/privacidade">Privacidade</Link>
      <Link href="/suporte">Suporte</Link>
    </nav>
  );
}
