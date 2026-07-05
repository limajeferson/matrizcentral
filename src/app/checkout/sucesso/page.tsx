import NeuralBackdrop from "@/components/marketing/v2/NeuralBackdrop";
import "../checkout-dark.css";

export default function CheckoutSucessoPage() {
  return (
    <div className="mc-checkout">
      <NeuralBackdrop />
      <div className="mc-checkout-card">
        <span className="mc-checkout-success" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1>Compra confirmada!</h1>
        <p>Verifique seu e-mail para receber o link do seu quiz de triagem.</p>
      </div>
    </div>
  );
}
