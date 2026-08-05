# Setup do matrizcentral (nova máquina)

Guia de montagem do ambiente nesta máquina (Windows + PowerShell).
Repositório: https://github.com/limajeferson/matrizcentral (branch `master`).

## Estado atual desta máquina

| Ferramenta | Status |
|-----------|--------|
| `winget`  | ✅ v1.28 |
| `gh`      | ✅ instalado, **não autenticado** |
| `git`     | ❌ falta instalar |
| `node`/`npm` | ❌ falta instalar |

---

## Passo 1 — Instalar Git e Node.js LTS

No prompt do Claude Code, rode com o prefixo `!` (executa direto na sessão):

```
! winget install --id Git.Git -e --source winget
! winget install --id OpenJS.NodeJS.LTS -e --source winget
```

> ⚠️ **Depois de instalar, FECHE e REABRA o terminal / a sessão do Claude Code.**
> O `PATH` só é atualizado em terminais novos — sem isso, `git` e `node` continuarão "não encontrados".

Após reabrir, confirme:

```
! git --version
! node --version
! npm --version
```

---

## Passo 2 — Autenticar no GitHub (opcional, mas recomendado)

O repositório é **público**, então o clone funciona sem login.
O login só é necessário para `push`. Faça:

```
! gh auth login
```
Escolha: **GitHub.com** → **HTTPS** → autenticar pelo navegador.
Isso também configura as credenciais do Git automaticamente.

---

## Passo 3 — Trazer o código para esta pasta

Esta pasta já contém `CLAUDE.md`, `SETUP.md` e `claude-chat.md`, que **não** existem no
repositório. Por isso não dá para usar `git clone` direto aqui. Use o método abaixo,
que preserva esses arquivos e baixa o projeto:

```
! git init
! git remote add origin https://github.com/limajeferson/matrizcentral.git
! git fetch origin
! git checkout -t origin/master
```

> Alternativa (pasta limpa): clonar ao lado e copiar o `CLAUDE.md` para dentro
> `git clone https://github.com/limajeferson/matrizcentral.git ../matrizcentral-repo`

Confirme que o código chegou:

```
! git log --oneline -5
! Get-ChildItem
```

---

## Passo 4 — Instalar as dependências

```
! npm install
```
Isso recria a pasta `node_modules/` (que está no `.gitignore`).

---

## Passo 5 — Configurar variáveis de ambiente

Crie o arquivo **`.env.local`** (nunca commitar) a partir do `.env.example`:

```
! Copy-Item .env.example .env.local
```

Depois preencha os valores em `.env.local`:

```env
# Supabase (banco + auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (pagamento) — STRIPE_SECRET_KEY é exigido no build de /api/checkout
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# E-mail transacional (Brevo)
BREVO_API_KEY=

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

> 🔑 Pegue os valores nos dashboards do **Supabase**, **Stripe** e **Brevo**
> (ou copie do `.env.local` do primeiro computador). Nunca faça commit deste arquivo.

---

## Passo 6 — Rodar e validar

```
! npm run dev      # sobe em http://localhost:3000
! npm run lint     # checa o padrão de código
! npm run test     # roda os testes (Vitest)
```

---

## Fluxo diário (múltiplas máquinas)

- **Ao começar:** `git pull` → `npm install` (se `package.json` mudou)
- **Ao terminar:** `git add -A` → `git commit -m "..."` → `git push`
- Mantenha sempre o trabalho pushado antes de trocar de máquina.
