import Link from "next/link";

export default function CheckoutCanceladoPage() {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="font-bold text-gray-900 text-xl mb-2">Checkout cancelado</h1>
      <p className="text-gray-700 mb-4">Sua compra não foi concluída.</p>
      <Link href="/" className="text-blue-600 underline">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
