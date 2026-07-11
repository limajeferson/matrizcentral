# pedido como seguiu

## pedido

```
/superpowers:brainstorming Pense e elabora, entenda, faça um dogfooding total do site, entenda toda jornada, utilize skills, plugins, conectores, para elaborar formas de você transitar no site com a visão de cliente. Utilize design, marketing, engenharia, arquitetura de sistemas, legal, operações, produção, produto, faça cada etapa como uma atividade separada, divida por frentes para entender como cada uma deve se comportar, identificar erros, fazer debug, para o site estar completo. Entenda que cada botão, cada ação, cada jornada, cada experiência, cada interface deve estar funcional, triagem, feed e landing page, login, acesso, cadastro, modelo de perfil de cliente para separar qual área do site ele pode acessar ou não. Tudo, analise o projeto e faça uma auditoria completa, inclu~indo segurança, para uma entrega objetiva. Página de pagamento, pós pagamento, negativa, recebimento de e-mail, emails de aviso de novo ciclo para quem assinou o plano de 1 conteúdo mensal, aviso de novos conteúdos para os assinantes do plano de 12 meses (advanced), a newsletter, o blog, como funcionará o feed, como funcionará o perfil de usuários, como funcionará a gamificação, como funcionará o fórum, como funcionará o canal de autoatendimento para clientes que entrem em contato, como funcionará a jornada de CRM, o pós vendas, o funil de vendas, as estratégias de marketing, a calendarização, os períodos de sazonalidade. E outras coisas que envolvem toda a jornada, entenda e estruture. Utilize o 'superpowers:writing-plans' para elaborar e organizar como será aplicado, as frentes e as etapas de aplicação. E utilize o 'superpowers:subagent-driven-development' para operacionalizar as atividades e atuações de cada frente e etapa, melhorando individualmente cada necessidade, onde e como atuar garantindo a melhor estruturação e aplicação de cada ponto, até os que eu não incluí e você entendeu que é importante para o projeto. Pode seguir agora com todas as frentes. você tem autonomia, eu autorizo, não precisa ficar pedindo permissão, atue sempre no que você decidir ser recomendado e foque na entrega objetiva
```

## resposta

```
Auditoria de pagamentos, webhook e e-mail
Auditoria de jornada do cliente e dados
Auditoria de integridade da gamificação
Auditoria de frontend, marketing e conversão

5 auditores rodando em background — te aviso conforme os relatórios chegarem. Enquanto isso, vamos desenhar a Frente 1: Login real, que destrava assinaturas, feed, fórum e CRM.

A primeira decisão de arquitetura da fundação (a frente planejada deixou ela em aberto): hoje o acesso é por token no e-mail — o cliente compra por R$47 e cai direto no dashboard, sem criar conta. É baixo atrito, ótimo pra conversão de compra por impulso. Mas assinatura e comunidade precisam de identidade persistente ("quem é esse usuário" ao longo do tempo). A questão é como o login real convive com o token atual.
```

# pedido

```
Perfeito: Seguimos com login (opção A — conviver: token pro acesso imediato pós-compra, login pra voltar/assinar/comunidade). Fundação decidida. ✅

Agora preciso te entregar o que você pediu — a auditoria — porque ela muda a ordem inteligente das coisas. Os 5 auditores acharam problemas que afetam cliente e receita AGORA, e alguns são consertos rápidos.

Resumo da auditoria — o que dói pra valer

🔴 Críticos (afetam quem já compra hoje):

1. Dá pra falsificar o certificado. O quiz de validação confia no "passei: sim" enviado pelo navegador — qualquer comprador emite o certificado (o entregável que você vende) sem estudar nada. (3 auditores confirmaram, independentemente.)
2. O cliente pode pagar e nunca receber o acesso. Se o e-mail (Brevo) falhar ou o token não gravar, o sistema responde "ok" pra Stripe e ela não reenvia — o cliente pagou, não recebeu o link, e não tem como recuperar sozinho.
3. O certificado pode sumir pra quem cumpriu tudo. Dependendo da ordem (concluir a trilha antes do quiz), o cliente faz tudo certo e nunca recebe o certificado, sem conserto pela tela.
4. A landing promete "todo o sistema por R$47", mas o R$47 entrega só o ebook + diagnóstico. A plataforma/gamificação/certificado estão no plano Advanced "em breve". Isso gera sensação de isca → reembolso e abandono (e contradiz seu próprio posicionamento no CLAUDE.md).

🟠 Altos (relevantes, mas o login já resolve a maioria):
- Cliente reembolsado continua com acesso por 1 ano (o webhook não trata reembolso).
- XP, badges e ranking são forjáveis chamando as APIs direto.
- Token na URL, 1 ano, sem revogar — vaza fácil (isso o login conserta de raiz).
- Vários links mortos no menu das subpáginas, formulários que travam sem internet, e um contador "3 Apresentações" que não existe no acervo.

🟢 O que está BEM (pra você ficar tranquilo): o webhook valida assinatura e não processa pagamento duplicado; nenhum segredo vaza; ninguém acessa dados de outro cliente; o banco bate com o código.

Minha recomendação de ordem (alinhada com "receita primeiro")

Fazer um conserto rápido dos 4 críticos primeiro (protege o R$47 que já entra hoje e corta reembolso), e depois construir o login — que já resolve de quebra 3 dos "altos" (reembolso, token vazável, forja de XP). Os 4 críticos são consertos de dias, não semanas.

Ou seja: Hardening (4 críticos) → Login (fundação) → Assinaturas → ...

Sigo assim — começando pelo hardening dos 4 críticos agora? (Vou salvar o relatório completo da auditoria num arquivo também, pra registro.) Se preferir ir direto pro login e deixar os bugs pra depois, é só dizer.
```

# resposta

```
Siga com o hardening dos 4 críticos agora, organize a execucao, e atue sem interromper, para acelerar atuando com autonomia
```

# alinhamento

```
Fechado. Vou executar o hardening dos 4 críticos com autonomia, sem parar pra perguntar — só te reporto no fim. Organizando a execução agora: branch dedicada, relatório da auditoria salvo, e os 4 consertos com teste + verificação no navegador.
```

# Retorno

```
Hardening completo. Reportando o fechamento — trabalho todo verificado e commitado na branch hardening-criticos.

✅ Os 4 críticos, corrigidos e verificados

┌─────┬───────────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  #  │                             Problema                              │                                                          O que mudou                                                           │
├─────┼───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1   │ Dava pra falsificar o certificado (quiz pontuado no navegador)    │ A nota agora é recalculada no servidor; o cliente só envia as respostas. Forja não passa (tem teste provando).                 │
├─────┼───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3   │ Certificado sumia pra quem cumpria tudo fora de ordem             │ Emissão disparada pelos dois gatilhos (trilha e quiz), em qualquer ordem.                                                      │
├─────┼───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2   │ Cliente pagava e podia ficar sem acesso                           │ Webhook idempotente e recuperável (Stripe reentrega e completa) + a tela de sucesso já mostra o link de acesso + reenvio por   │
│     │                                                                   │ e-mail self-service.                                                                                                           │
├─────┼───────────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4   │ Landing prometia "todo o sistema por R$47", /oferta parecia       │ Card Start agora lista o que o R$47 realmente entrega (plataforma, gamificação, certificado); Advanced reposicionado na        │
│     │ entregar menos                                                    │ cadência de conteúdo.                                                                                                          │
└─────┴───────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

Como verifiquei (o gate do projeto)

- tsc exit 0 · npm run test 106 testes passando (novos: anti-forja no quiz, recuperação no webhook) · lint só com o warning pré-existente.
- No navegador, contra Stripe + Supabase reais: a /oferta mostra os planos alinhados, e a /checkout/sucesso?session_id=… resolveu o acesso da minha compra de teste real e exibiu "Seu acesso está pronto: Começar meu diagnóstico →".

Entregas registradas

- Relatório completo da auditoria + o que foi corrigido + o backlog (altos/médios pra próximas frentes): docs/frentes/hardening-criticos/README.md.
- Tudo commitado na branch hardening-criticos (commit 0aee161, 19 arquivos). Não fiz push nem merge — está local, aguardando sua decisão.
- Dev server rodando em localhost:3000 (subi pra verificar).

Um ponto que decidi e você deve saber

O crítico #4 é o único de copy/posicionamento (não é bug de segurança). Alinhei a /oferta à verdade do código e à landing, mas o texto/tiering é a sua voz de marca — recomendo dar uma olhada nesse card e ajustar as palavras se quiser. Os outros 3 são correções técnicas objetivas.
```

# 

```

```