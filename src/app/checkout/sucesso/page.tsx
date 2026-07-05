import NeuralBackdrop from "@/components/marketing/v2/NeuralBackdrop";
import "../checkout-dark.css";

export default function CheckoutSucessoPage() {
  return (
    <div className="mc-checkout">
      <NeuralBackdrop />
      <div className="mc-checkout-card">
        <h1>Compra confirmada!</h1>
        <p>Verifique seu e-mail para receber o link do seu quiz de triagem.</p>
      </div>
    </div>
  );
}
