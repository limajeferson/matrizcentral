import { SELLER, isIdentityComplete } from "@/data/legal";
import { getSellerIdentity } from "@/data/seller-identity.server";

/**
 * Identificação do fornecedor — Decreto 7.962/2013, art. 2º, I e II.
 *
 * Se a identidade não estiver preenchida, NÃO renderiza nada. Exibir
 * "__PREENCHER__" seria pior que omitir: passaria a impressão de
 * identificação sem identificar. A ausência é detectável pelo teste de
 * isIdentityComplete e pelo checklist da frente.
 *
 * Server component: os campos sensíveis (legalName, taxId, address) vêm de
 * variável de ambiente de servidor via getSellerIdentity(), não de SELLER.
 */
export default function SellerIdentityBlock({
  variant = "footer",
}: {
  variant?: "footer" | "page";
}) {
  const identity = getSellerIdentity();
  if (!isIdentityComplete(identity)) return null;

  return (
    <address className={`mc-seller-identity mc-seller-identity--${variant}`}>
      <span>{identity.legalName}</span>
      <span>
        {SELLER.taxIdLabel} {identity.taxId}
      </span>
      <span>{identity.address}</span>
      <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
    </address>
  );
}
