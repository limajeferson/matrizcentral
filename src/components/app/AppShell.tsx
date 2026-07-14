import type { ReactNode } from "react";
import { IconBell, IconSearch } from "@/components/ui/icons";

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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
          <a href="/feed" className="shrink-0 text-lg font-bold tracking-tight">
            Matriz <span className="text-violet-600">Central</span>
          </a>

          <div className="relative hidden max-w-md flex-1 md:block">
            <IconSearch
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="Buscar conteúdo (em breve)"
              disabled
              aria-label="Buscar conteúdo (em breve)"
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="Notificações"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <IconBell size={18} />
            </button>
            {userMenu}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr_320px] lg:px-6">
        <aside className="order-2 lg:sticky lg:top-24 lg:order-none lg:self-start">{left}</aside>
        <main className="order-1 min-w-0 space-y-6 lg:order-none">{center}</main>
        <aside className="order-3 lg:sticky lg:top-24 lg:order-none lg:self-start">{right}</aside>
      </div>
    </div>
  );
}

export default AppShell;
