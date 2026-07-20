import ResgateClient from "./ResgateClient";

export default function ResgatePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResgateClient token={searchParams.token ?? null} />;
}
