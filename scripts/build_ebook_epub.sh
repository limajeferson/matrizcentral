#!/bin/bash
# Gera o .epub do ebook a partir de content/ebooks/ebook_llm_local_matrizcentral.md.
# Requer pandoc (winget install JohnMacFarlane.Pandoc). Saida: content/ebooks/dist/.
#
# Motivo do passo de transformacao: o .md fonte usa <a name="capN"></a> antes de
# cada capitulo (funciona como ancora numa pagina HTML unica) e um indice manual
# linkando para essas ancoras. O pandoc quebra o EPUB em um arquivo .xhtml por
# capitulo, entao um link "#capN" sem o arquivo vira link quebrado dentro do
# leitor. Este script (1) converte as ancoras em atributos de heading do pandoc
# (que viram ids validos em qualquer arquivo do split) e (2) remove o indice
# manual, ja que a navegacao real do EPUB (nav.xhtml) e gerada pelo --toc e e
# essa que os leitores (Google Play Books incluso) usam.

set -e
cd "$(dirname "$0")/.."

SRC="content/ebooks/ebook_llm_local_matrizcentral.md"
OUT_DIR="content/ebooks/dist"
OUT="$OUT_DIR/construa-seu-proprio-chatgpt-particular.epub"
TMP="$(mktemp).md"

mkdir -p "$OUT_DIR"

node -e '
const fs = require("fs");
let src = fs.readFileSync(process.argv[1], "utf-8");
src = src.replace(/<a name="([a-z0-9]+)"><\/a>\n## (.+)/g, (m, anchor, heading) => `## ${heading} {#${anchor}}`);
src = src.replace(/## Índice\n\n(?:- \[.+\]\(#\w+\)\n)+\n---\n\n/, "");
fs.writeFileSync(process.argv[2], src, "utf-8");
' "$SRC" "$TMP"

pandoc "$TMP" \
  -o "$OUT" \
  --toc --toc-depth=2 \
  --split-level=2 \
  --metadata title="Construa Seu Próprio ChatGPT Particular em Poucos Minutos" \
  --metadata author="Matriz Central" \
  --metadata lang="pt-BR" \
  --metadata rights="© 2026 Matriz Central" \
  --metadata date="2026" \
  -f markdown -t epub3

rm -f "$TMP"
echo "EPUB gerado em $OUT"
