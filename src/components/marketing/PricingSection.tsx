export default function PricingSection() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12 text-center border-t">
      <h2 className="text-2xl font-bold mb-4">O que você recebe</h2>
      <ul className="text-left inline-block space-y-2 text-gray-700">
        <li>✅ Ebook completo (9 capítulos) sobre rodar LLMs localmente</li>
        <li>✅ Triagem de perfil personalizada</li>
        <li>✅ Roadmap de estudo sob medida para o seu perfil</li>
        <li>✅ Um segundo ebook grátis, escolhido pelo seu perfil</li>
        <li>✅ Quiz de validação com certificado de conclusão</li>
      </ul>
      <p className="text-3xl font-bold mt-6">R$47</p>
      <p className="text-sm text-gray-500">Pagamento único via PIX, cartão ou boleto</p>
    </section>
  );
}
