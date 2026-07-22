# Insumo — Conceito tipográfico Matriz Central (NotebookLM "Mastering Typography")

> Gerado em 2026-07-22 no notebook novo criado pelo Claude a pedido do usuário,
> com fontes: Material Design 3 (applying type, overview, type scale) + Google
> Fonts Knowledge (pairing) + brief do projeto (contexto como fonte). Notebook:
> notebooklm.google.com/notebook/f9dcd8ca-466d-42e5-b916-e9584a8fde83

Leia o CONTEXTO DO PROJETO (fonte anexada) e, aplicando as diretrizes do Material Design 3 (applying type, type scale) e do guia de pairing do Google Fonts, gere o CONCEITO TIPOGRÁFICO oficial da Matriz Central. Entregue: (1) TRÊS candidatas de Google Fonts para o wordmark 'MATRIZ CENTRAL' em caixa alta ao lado do cubo isométrico — para cada uma: por que conversa com a geometria do cubo, peso exato, tracking recomendado, e um veredito comparativo ao placeholder Poppins; termine recomendando UMA vencedora com justificativa. (2) O par de sistema (display + corpo) com pesos, escala tipográfica M3 mapeada (display/headline/title/body/label com tamanhos em px para web) e fallbacks. (3) Regras por canal: portal dark-first, thumbnail YouTube 1280x720, capa Spotify 3000x3000, post Instagram — tamanho mínimo, peso mínimo e contraste WCAG sobre #0b0b0f. Formate como um guia prático e objetivo em português.

GUIA DE CONCEITO TIPOGRÁFICO — MATRIZ CENTRAL
Para consolidar a identidade da Matriz Central como uma plataforma de IA local com "autoridade calma" e "conhecimento estruturado"
1
, este guia aplica as diretrizes do Material Design 3 e os princípios de pareamento tipográfico.
(Nota: As famílias tipográficas específicas do Google Fonts sugeridas abaixo e as dimensões exatas em pixels para mídias sociais são recomendações práticas baseadas em padrões da indústria que complementam as diretrizes teóricas fornecidas nas fontes).
1. Candidatas para o Wordmark (Caixa Alta)
O logotipo deve conversar com o cubo isométrico geométrico e de linhas precisas, transmitindo confiança sem hype
1
. A atual fonte Poppins é excessivamente circular e amigável, o que foge do rigor estrutural desejado para a marca.
Candidata A: Outfit
Por que conversa com o cubo: É uma fonte sem serifa estritamente geométrica, mas com legibilidade impecável. Suas linhas retas e proporções racionais imitam a estrutura "em camadas" do cubo
1
.
Peso exato: Bold (700).
Tracking recomendado: +4% (0.04em ou 40 na maioria dos softwares) para dar fôlego, autoridade e solidez.
Veredito vs Poppins: Diferente da Poppins (cujas curvas são círculos perfeitos, soando quase infantis), a Outfit mantém o apelo moderno e acessível, mas adiciona o rigor tecnológico que a IA exige.
Candidata B: Sora
Por que conversa com o cubo: Sora foi desenhada com precisão matemática, possuindo terminais afiados e uma construção de "blocos" que dialoga com a ausência de ornamentos da marca
1
.
Peso exato: SemiBold (600).
Tracking recomendado: +5% (0.05em).
Veredito vs Poppins: É mais rígida e corporativa que a Poppins. Transmite com maior facilidade a promessa de "autoridade calma"
1
.
Candidata C: Space Grotesk
Por que conversa com o cubo: Traz um sutil aspecto "tech/código" em seu DNA, com terminais retos que acompanham muito bem as quistas de um desenho isométrico.
Peso exato: Bold (700).
Tracking recomendado: +2% (0.02em).
Veredito vs Poppins: É muito mais distinta e menos comum que a Poppins, afastando a marca da estética genérica de startups e ancorando-a fortemente na comunidade de tecnologia.
🏆 VENCEDORA: Outfit Justificativa: A Outfit entrega o balanço ideal sugerido pelas boas práticas: tem distinção suficiente para criar uma identidade forte
2
, mas é altamente contida (sem hype). Ao ser aplicada em caixa alta, ao lado esquerdo ou direito do cubo (alinhada pelo eixo vertical central da tipografia com o centro do ícone), ela reforça a promessa de um sistema estruturado, limpo e profissional
1
.
2. Par de Sistema M3 (Display + Corpo) e Escala
Seguindo o princípio de que, se uma fonte primária não oferece tudo o que precisamos, podemos introduzir uma secundária que equilibre harmonia e distinção
2
3
, usaremos um par sem serifa (sans-serif) para refletir a estética contemporânea e geométrica
1
.
Display/Títulos: Outfit (Reforça a personalidade geométrica da marca em tamanhos maiores
4
).
Corpo/Interface: Inter (Fonte neutra, desenhada especificamente para altíssima legibilidade em textos longos e interfaces complexas, compensando o foco expressivo da Outfit
5
).
Fallbacks: font-family: 'Outfit', sans-serif; e font-family: 'Inter', system-ui, -apple-system, sans-serif;.
Mapeamento da Escala Material Design 3 (Web em px) No ambiente web, o alinhamento vertical deve utilizar a altura da linha (line-height) atuando como bounding box
6
7
. As proporções abaixo mapeiam os papéis do MD3
8
:
Display (Outfit - 700 Bold) - Para textos curtos em telas grandes (Hero sections)
4
.
Large: 57px | Medium: 45px | Small: 36px
Line-height recomendado: 1.2x o tamanho da fonte
9
10
.
Headline (Outfit - 600 SemiBold) - Para alta ênfase em telas menores ou passagens primárias
11
.
Large: 32px | Medium: 28px | Small: 24px
Line-height recomendado: 1.2x
10
.
Title (Outfit - 500 Medium) - Para média ênfase (ex: headers de categorias, cards)
12
.
Large: 22px | Medium: 16px | Small: 14px
Line-height recomendado: 1.2x
10
.
Body (Inter - 400 Regular) - Para textos longos (fóruns, relatórios, artigos)
5
13
.
Large: 16px | Medium: 14px | Small: 12px
Line-height recomendado: 1.5x (evita o aperto ou dispersão na leitura)
10
.
Label (Inter - 500 Medium) - Utilitários de UI (botões, badges de Nível/XP)
13
.
Large: 14px | Medium: 12px | Small: 11px
Line-height recomendado: 1.5x
10
.
Regra de Gamificação: Para exibir XP e pontuações variando, utilize números tabulares (monospaced) na fonte Inter para evitar saltos visuais e layout shift
14
.
3. Regras de Uso por Canal e Acessibilidade (Dark-First)
Acessibilidade visual em fundos muito escuros (fundo base: #0b0b0f) exige cuidado rigoroso com pesos e contraste. As regras de contraste WCAG exigem razão de 3:1 para textos grandes e 4.5:1 para textos pequenos
15
.
Portal Web (Dark-First)
Regra de Cor: Use branco puro ou tons off-white para o texto de títulos (on surface). Links no portal devem utilizar os tons de violeta do cubo (#7c5cff ou #a78bfa) com sublinhado obrigatório para acessibilidade
15
16
.
Contraste mínimo: Todo corpo de texto deve obrigatoriamente bater a meta WCAG de 4.5:1 sobre a cor #0b0b0f
15
.
Thumbnail YouTube (1280x720)
Tamanho mínimo: 48px (Utilize os tamanhos da escala Display
4
).
Peso mínimo: Bold (700) ou ExtraBold (800).
Contraste/Cor: Extremamente alto (> 7:1). Textos essenciais devem ser brancos puros ou utilizar o violeta mais claro (#a78bfa)
1
 em destaque, dado o tamanho de exibição reduzido nos celulares.
Capa Spotify Podcast (3000x3000)
Tamanho mínimo: 120px a 150px para o título principal (estas capas são reduzidas a miniaturas minúsculas no app móvel).
Peso mínimo: Bold (700).
Aplicação: Aplique o wordmark MATRIZ CENTRAL (Vencedora: Outfit) priorizando o centro da arte para estabilidade estrutural.
Posts Instagram (Feed/Carrossel)
Tamanho mínimo (Corpo do Post): 24px para garantir que a leitura no smartphone seja confortável sem precisar dar zoom.
Peso mínimo: Medium (500). Evite ao máximo o peso Regular (400) para textos pequenos em postagens, pois em fundos dark como o #0b0b0f as fontes finas perdem nitidez por conta do brilho da tela (efeito halation).
keep_pin
Salvar nas observações
copy_all
thumb_up
thumb_down
Como aplicar os números tabulares na gamificação do portal?
Quais cores On-Surface garantem o contraste 4.5:1 no dark mode?
Pode detalhar o posicionamento do wordmark em relação ao cubo?

===== TURNO =====

Leia o CONTEXTO DO PROJETO (fonte anexada) e, aplicando as diretrizes do Material Design 3 (applying type, type scale) e do guia de pairing do Google Fonts, gere o CONCEITO TIPOGRÁFICO oficial da Matriz Central. Entregue: (1) TRÊS candidatas de Google Fonts para o wordmark 'MATRIZ CENTRAL' em caixa alta ao lado do cubo isométrico — para cada uma: por que conversa com a geometria do cubo, peso exato, tracking recomendado, e um veredito comparativo ao placeholder Poppins; termine recomendando UMA vencedora com justificativa. (2) O par de sistema (display + corpo) com pesos, escala tipográfica M3 mapeada (display/headline/title/body/label com tamanhos em px para web) e fallbacks. (3) Regras por canal: portal dark-first, thumbnail YouTube 1280x720, capa Spotify 3000x3000, post Instagram — tamanho mínimo, peso mínimo e contraste WCAG sobre #0b0b0f. Formate como um guia prático e objetivo em português.

===== TURNO =====

GUIA DE CONCEITO TIPOGRÁFICO — MATRIZ CENTRAL
Para consolidar a identidade da Matriz Central como uma plataforma de IA local com "autoridade calma" e "conhecimento estruturado"
1
, este guia aplica as diretrizes do Material Design 3 e os princípios de pareamento tipográfico.
(Nota: As famílias tipográficas específicas do Google Fonts sugeridas abaixo e as dimensões exatas em pixels para mídias sociais são recomendações práticas baseadas em padrões da indústria que complementam as diretrizes teóricas fornecidas nas fontes).
1. Candidatas para o Wordmark (Caixa Alta)
O logotipo deve conversar com o cubo isométrico geométrico e de linhas precisas, transmitindo confiança sem hype
1
. A atual fonte Poppins é excessivamente circular e amigável, o que foge do rigor estrutural desejado para a marca.
Candidata A: Outfit
Por que conversa com o cubo: É uma fonte sem serifa estritamente geométrica, mas com legibilidade impecável. Suas linhas retas e proporções racionais imitam a estrutura "em camadas" do cubo
1
.
Peso exato: Bold (700).
Tracking recomendado: +4% (0.04em ou 40 na maioria dos softwares) para dar fôlego, autoridade e solidez.
Veredito vs Poppins: Diferente da Poppins (cujas curvas são círculos perfeitos, soando quase infantis), a Outfit mantém o apelo moderno e acessível, mas adiciona o rigor tecnológico que a IA exige.
Candidata B: Sora
Por que conversa com o cubo: Sora foi desenhada com precisão matemática, possuindo terminais afiados e uma construção de "blocos" que dialoga com a ausência de ornamentos da marca
1
.
Peso exato: SemiBold (600).
Tracking recomendado: +5% (0.05em).
Veredito vs Poppins: É mais rígida e corporativa que a Poppins. Transmite com maior facilidade a promessa de "autoridade calma"
1
.
Candidata C: Space Grotesk
Por que conversa com o cubo: Traz um sutil aspecto "tech/código" em seu DNA, com terminais retos que acompanham muito bem as quistas de um desenho isométrico.
Peso exato: Bold (700).
Tracking recomendado: +2% (0.02em).
Veredito vs Poppins: É muito mais distinta e menos comum que a Poppins, afastando a marca da estética genérica de startups e ancorando-a fortemente na comunidade de tecnologia.
🏆 VENCEDORA: Outfit Justificativa: A Outfit entrega o balanço ideal sugerido pelas boas práticas: tem distinção suficiente para criar uma identidade forte
2
, mas é altamente contida (sem hype). Ao ser aplicada em caixa alta, ao lado esquerdo ou direito do cubo (alinhada pelo eixo vertical central da tipografia com o centro do ícone), ela reforça a promessa de um sistema estruturado, limpo e profissional
1
.
2. Par de Sistema M3 (Display + Corpo) e Escala
Seguindo o princípio de que, se uma fonte primária não oferece tudo o que precisamos, podemos introduzir uma secundária que equilibre harmonia e distinção
2
3
, usaremos um par sem serifa (sans-serif) para refletir a estética contemporânea e geométrica
1
.
Display/Títulos: Outfit (Reforça a personalidade geométrica da marca em tamanhos maiores
4
).
Corpo/Interface: Inter (Fonte neutra, desenhada especificamente para altíssima legibilidade em textos longos e interfaces complexas, compensando o foco expressivo da Outfit
5
).
Fallbacks: font-family: 'Outfit', sans-serif; e font-family: 'Inter', system-ui, -apple-system, sans-serif;.
Mapeamento da Escala Material Design 3 (Web em px) No ambiente web, o alinhamento vertical deve utilizar a altura da linha (line-height) atuando como bounding box
6
7
. As proporções abaixo mapeiam os papéis do MD3
8
:
Display (Outfit - 700 Bold) - Para textos curtos em telas grandes (Hero sections)
4
.
Large: 57px | Medium: 45px | Small: 36px
Line-height recomendado: 1.2x o tamanho da fonte
9
10
.
Headline (Outfit - 600 SemiBold) - Para alta ênfase em telas menores ou passagens primárias
11
.
Large: 32px | Medium: 28px | Small: 24px
Line-height recomendado: 1.2x
10
.
Title (Outfit - 500 Medium) - Para média ênfase (ex: headers de categorias, cards)
12
.
Large: 22px | Medium: 16px | Small: 14px
Line-height recomendado: 1.2x
10
.
Body (Inter - 400 Regular) - Para textos longos (fóruns, relatórios, artigos)
5
13
.
Large: 16px | Medium: 14px | Small: 12px
Line-height recomendado: 1.5x (evita o aperto ou dispersão na leitura)
10
.
Label (Inter - 500 Medium) - Utilitários de UI (botões, badges de Nível/XP)
13
.
Large: 14px | Medium: 12px | Small: 11px
Line-height recomendado: 1.5x
10
.
Regra de Gamificação: Para exibir XP e pontuações variando, utilize números tabulares (monospaced) na fonte Inter para evitar saltos visuais e layout shift
14
.
3. Regras de Uso por Canal e Acessibilidade (Dark-First)
Acessibilidade visual em fundos muito escuros (fundo base: #0b0b0f) exige cuidado rigoroso com pesos e contraste. As regras de contraste WCAG exigem razão de 3:1 para textos grandes e 4.5:1 para textos pequenos
15
.
Portal Web (Dark-First)
Regra de Cor: Use branco puro ou tons off-white para o texto de títulos (on surface). Links no portal devem utilizar os tons de violeta do cubo (#7c5cff ou #a78bfa) com sublinhado obrigatório para acessibilidade
15
16
.
Contraste mínimo: Todo corpo de texto deve obrigatoriamente bater a meta WCAG de 4.5:1 sobre a cor #0b0b0f
15
.
Thumbnail YouTube (1280x720)
Tamanho mínimo: 48px (Utilize os tamanhos da escala Display
4
).
Peso mínimo: Bold (700) ou ExtraBold (800).
Contraste/Cor: Extremamente alto (> 7:1). Textos essenciais devem ser brancos puros ou utilizar o violeta mais claro (#a78bfa)
1
 em destaque, dado o tamanho de exibição reduzido nos celulares.
Capa Spotify Podcast (3000x3000)
Tamanho mínimo: 120px a 150px para o título principal (estas capas são reduzidas a miniaturas minúsculas no app móvel).
Peso mínimo: Bold (700).
Aplicação: Aplique o wordmark MATRIZ CENTRAL (Vencedora: Outfit) priorizando o centro da arte para estabilidade estrutural.
Posts Instagram (Feed/Carrossel)
Tamanho mínimo (Corpo do Post): 24px para garantir que a leitura no smartphone seja confortável sem precisar dar zoom.
Peso mínimo: Medium (500). Evite ao máximo o peso Regular (400) para textos pequenos em postagens, pois em fundos dark como o #0b0b0f as fontes finas perdem nitidez por conta do brilho da tela (efeito halation).
keep_pin
Salvar nas observações
copy_all
thumb_up
thumb_down
Como aplicar os números tabulares na gamificação do portal?
Quais cores On-Surface garantem o contraste 4.5:1 no dark mode?
Pode detalhar o posicionamento do wordmark em relação ao cubo?