import { SELLER, isIdentityComplete } from "@/data/legal";

/**
 * Identificação do fornecedor — Decreto 7.962/2013, art. 2º, I e II.
 *
 * Se a identidade não estiver preenchida, NÃO renderiza nada. Exibir
 * "__PREENCHER__" seria pior que omitir: passaria a impressão de
 * identificação sem identificar. A ausência é detectável pelo teste de
 * isIdentityComplete e pelo checklist da frente.
 */
export default function SellerIdentityBlock({
  variant = "footer",
}: {
  variant?: "footer" | "page";
}) {
  if (!isIdentityComplete(SELLER)) return null;

  return (
    <address className={`mc-seller-identity mc-seller-identity--${variant}`}>
      <span>{SELLER.legalName}</span>
      <span>
        {SELLER.taxIdLabel} {SELLER.taxId}
      </span>
      <span>{SELLER.address}</span>
      <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
    </address>
  );
}
