import EntrarForm from "./EntrarForm";

export default function EntrarPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="mb-2 text-2xl font-bold">Entrar na sua conta</h1>
      <p className="mb-6 text-gray-600">
        Digite seu e-mail e enviaremos um link de acesso — sem senha.
      </p>
      <EntrarForm initialError={searchParams.erro === "link"} />
    </div>
  );
}
