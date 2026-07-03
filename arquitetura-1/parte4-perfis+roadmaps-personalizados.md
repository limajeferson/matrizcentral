const profiles = {
  dev_python_aia: {
    id: "dev_python_aia",
    name: "Dev Python com Foco em IA",
    icon: "🐍🤖",
    description: `Você é desenvolvedor Python e quer dominar 
                   LLMs locais em produção. Seu roadmap é prático 
                   e orientado a código.`,
    
    recommended_ebooks: [
      {
        order: 1,
        product_id: "ebook_llm_local",
        title: "LLM Local: Setup Completo",
        status: "already_purchased",
        download_link: "[autenticado com token]",
        time_estimate: "2-3 horas de leitura"
      },
      {
        order: 2,
        product_id: "ebook_claude_code_python",
        title: "Claude Code: Python Edition",
        is_free: true, // Grátis para este perfil
        unlock_at: "after_quiz",
        time_estimate: "3-4 horas"
      },
      {
        order: 3,
        product_id: "ebook_mcp_integrations",
        title: "MCP: Conectando Ferramentas",
        is_free: false,
        price: 6700,
        unlock_at: "day_7",
        time_estimate: "2-3 horas"
      },
      {
        order: 4,
        product_id: "course_deploy_prod",
        title: "Mini-Curso: Deploy em Produção",
        is_free: false,
        price: 8700,
        unlock_at: "day_14",
        duration: "6 horas de vídeo",
        includes: ["Templates Docker", "GitHub Actions", "Monitoramento"]
      }
    ],

    study_roadmap: {
      week_1: {
        title: "Fundação: Setup Local",
        items: [
          "Leia cap 1-2 do Ebook LLM Local",
          "Instale Ollama + Dreamshaper (siga passo a passo)",
          "Teste com seus próprios prompts",
          "Resultado esperado: Rodando LLM localmente"
        ]
      },
      week_2: {
        title: "Integração: Python + LLM",
        items: [
          "Leia Ebook Claude Code (Python Edition)",
          "Execute exemplos do Ebook",
          "Integre em um projeto seu existente",
          "Resultado esperado: LLM rodando via Python API"
        ]
      },
      week_3: {
        title: "Conectores Avançados",
        items: [
          "Assista mini-curso Deploy (optativo)",
          "Leia Ebook MCP (se comprou)",
          "Implemente MCP connector",
          "Resultado esperado: LLM + 2-3 ferramentas conectadas"
        ]
      },
      week_4: {
        title: "Produção",
        items: [
          "Dockerize sua solução",
          "Teste em servidor",
          "Implemente monitoramento",
          "Resultado esperado: Solução pronta para usar em produção"
        ]
      }
    },

    email_sequences: [
      {
        day: 0,
        subject: "Bem-vindo! Sua jornada como Dev Python + IA começa",
        copy: `Oi [Nome],

Descobrimos que você é um Dev Python com interesse em IA. 
Perfeito! Seu Ebook "LLM Local: Setup Completo" chegou.

Aqui está seu roadmap personalizado:
- SEMANA 1: Instale e rode seu LLM local
- SEMANA 2: Integre com Python
- SEMANA 3-4: Deploy + Otimizações

Comece por aqui: [link download ebook]

Importante: Você também ganhou acesso GRATUITO ao Ebook 
"Claude Code: Python Edition" porque você é Dev Python.
Já está na sua conta!

Abraços,
[Nome seu]`
      },
      {
        day: 3,
        subject: "Dúvida comum: CUDA não detecta GPU",
        copy: `Oi [Nome],

Muitos Devs Python enfrentam esse problema no Capítulo 2.

Se você também está tendo:
- CUDA found but not used
- GPU utilization = 0%

Clique aqui para ver a solução: [link para troubleshooting guide]

(Tá no seu Ebook no Apêndice B também)

Abraços,
[Nome]`
      },
      {
        day: 7,
        subject: "[Oferta] Claude Code: Python + LLM (Agora com 20% desconto)",
        copy: `Oi [Nome],

Semana 1 completa? 🎉

Se você terminou o Ebook LLM Local, sabe que a diversão começa 
quando você integra com Python.

Tem um Ebook "Claude Code: Python Edition" que complementa 
perfeitamente o que você aprendeu.

Valor: R$67
Hoje (24h): R$53 (20% OFF para você)

Inclui:
- 50 templates de código prontos
- Integração LLM + Embeddings
- Cache + otimizações
- Deploy patterns

Quer? [link compra]

(Você já tem acesso GRÁTIS se continuou estudando conforme 
o roadmap. Se não comprou ainda, hoje é dia.)

Abraços,
[Nome]`
      },
      {
        day: 14,
        subject: "Mini-Curso: Deploy em Produção (Vagas limitadas)",
        copy: `Oi [Nome],

Seu LLM rodando local? Code pronto? 

Agora vem a parte importante: COLOCAR EM PRODUÇÃO.

Criei um Mini-Curso de 6h:
- Docker + GPU offloading (12 min)
- GitHub Actions CI/CD (15 min)
- Monitoramento real (10 min)
- 5 Troubleshoots comuns (20 min)
- Template ready-to-deploy (Dockerfile + .yml)

R$87 (hoje: R$69 - 20% OFF)

Clique aqui se quer: [link compra]

Abraços,
[Nome]`
      }
    ]
  },

  ceo_financeiro: {
    id: "ceo_financeiro",
    name: "CEO + Gestor Financeiro",
    icon: "💰📊",
    description: `Você é lider e quer entender IA para tomar 
                   melhores decisões financeiras. Seu roadmap é 
                   executivo e orientado a ROI.`,
    
    recommended_ebooks: [
      {
        order: 1,
        product_id: "ebook_llm_local",
        title: "LLM Local: Setup Completo",
        status: "already_purchased",
        note: "Versão executiva (cap 1, 5, 6 + case de ROI)"
      },
      {
        order: 2,
        product_id: "ebook_ceo_ia_financeiro",
        title: "CEO + IA: Decisões Financeiras com LLM",
        is_free: true,
        unlock_at: "after_quiz"
      },
      {
        order: 3,
        product_id: "course_automacao_financeiro",
        title: "Mini-Curso: Automação Financeira com IA",
        is_free: false,
        price: 12700
      }
    ],

    study_roadmap: {
      week_1: {
        title: "Entender: O que é LLM Local?",
        items: [
          "Leia Cap 1 do Ebook LLM Local (15 min)",
          "Leia Cap 5: ROI + Casos de Uso (20 min)",
          "Vídeo: 'IA Local vs Cloud: Quanto custa?' (8 min)",
          "Resultado: Saber se faz sentido para sua empresa"
        ]
      },
      week_2: {
        title: "Aplicar: IA para Decisões Financeiras",
        items: [
          "Leia Ebook CEO + IA: Financeiro",
          "Case 1: Análise automática de fluxo de caixa",
          "Case 2: Previsão de inadimplência com IA",
          "Resultado: 1 processo financeiro com IA implantado"
        ]
      },
      week_3: {
        title: "Escalar: Automação Completa",
        items: [
          "Assista Mini-Curso (se comprar)",
          "Implemente 2 automações do seu caso",
          "Calcule: quanto economiza/mês?",
          "Resultado: Fluxo de financeiro 30% mais rápido"
        ]
      }
    },

    email_sequences: [
      {
        day: 0,
        subject: "CEO + IA: Seu Ebook chegou (Versão executiva)",
        copy: `Oi [Nome],

Seu Ebook "LLM Local: Setup Completo" chegou - mas leia 
a VERSÃO EXECUTIVA (não é técnica).

Destaques:
- Cap 1: O que é LLM Local (5 min de leitura)
- Cap 5: ROI comparado (quanto economiza?)
- Cap 6: 4 casos de CEO usando IA local

E você ganhou GRATUITO: Ebook "CEO + IA: Decisões Financeiras"

Download: [link]

Abraços,
[Nome]`
      }
    ]
  }
}