import { getSessionUser } from "@/lib/auth-session";

export default async function SessionNav() {
  const user = await getSessionUser();
  return (
    <a href={user ? "/conta" : "/entrar"} className="mc-session-nav mc-display">
      {user ? "Minha conta" : "Entrar"}
    </a>
  );
}
