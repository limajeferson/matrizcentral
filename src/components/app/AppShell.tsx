import type { ReactNode } from "react";
import { AppHeader } from "@/components/app/AppHeader";

export type AppShellProps = {
  /** Nav lateral esquerda (feed/conteúdos/fórum/conta/suporte + formatos). */
  left: ReactNode;
  /** Conteúdo central (rail + lista mista de conteúdo/fórum). */
  center: ReactNode;
  /** Sidebar direita (comunidade). */
  right: ReactNode;
  /** Slot do menu de usuário (avatar/dropdown ou link "Entrar" se deslogado). */
  userMenu: ReactNode;
};

/**
 * Shell da área logada: top bar (logo + busca visual + sino + `userMenu`) e
 * grid responsivo de 3 colunas (`260px 1fr 320px`), que colapsa para 1
 * coluna abaixo de `lg`. Client-agnóstico — recebe as colunas já montadas
 * pelo chamador (server component), então funciona com ou sem sessão.
 */
export function AppShell({ left, center, right, userMenu }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader userMenu={userMenu} mobileNav={left} />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr_320px] lg:px-6">
        <aside className="hidden lg:sticky lg:top-24 lg:order-none lg:block lg:self-start">{left}</aside>
        <main className="order-1 min-w-0 space-y-6 lg:order-none">{center}</main>
        <aside className="order-3 lg:sticky lg:top-24 lg:order-none lg:self-start">{right}</aside>
      </div>
    </div>
  );
}

export default AppShell;
