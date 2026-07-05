import Link from "next/link";
import NeuralBackdrop from "@/components/marketing/v2/NeuralBackdrop";
import "../checkout-dark.css";

export default function CheckoutCanceladoPage() {
  return (
    <div className="mc-checkout">
      <NeuralBackdrop />
      <div className="mc-checkout-card">
        <h1>Checkout cancelado</h1>
        <p>Sua compra não foi concluída.</p>
        <Link href="/">Voltar para a página inicial</Link>
      </div>
    </div>
  );
}
