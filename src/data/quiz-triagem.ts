import type { TriagemQuestion } from "@/lib/quiz-scoring";

export const QUIZ_TRIAGEM: TriagemQuestion[] = [
  {
    id: 1,
    text: "Qual é sua principal linguagem de programação?",
    type: "radio",
    options: [
      { text: "Python", points: { dev_python_aia: 3 } },
      { text: "JavaScript/TypeScript", points: { dev_nodejs_web: 3 } },
      { text: "Go/Rust", points: { devops_infra: 2 } },
      { text: "Não programo", points: { ceo_financeiro: 3, pm_product: 2 } },
    ],
  },
  {
    id: 2,
    text: "Qual seu principal objetivo com LLM local?",
    type: "radio",
    options: [
      { text: "Automação de código/prompts", points: { dev_python_aia: 3, dev_nodejs_web: 2 } },
      { text: "Deploy em produção", points: { devops_infra: 3 } },
      { text: "Análise de dados/financeiro", points: { ceo_financeiro: 3 } },
      { text: "Entender capacidades para produto", points: { pm_product: 3 } },
      { text: "Testar ideias de startup", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 3,
    text: "Quantas horas/semana você dedica a aprender tecnologia?",
    type: "radio",
    options: [
      { text: "0-5 horas", points: { ceo_financeiro: 2, pm_product: 1 } },
      { text: "5-10 horas", points: { pm_product: 2, founder_builder: 2 } },
      { text: "10+ horas", points: { dev_python_aia: 3, dev_nodejs_web: 3, devops_infra: 3 } },
    ],
  },
  {
    id: 4,
    text: "Você prefere conteúdo sobre...",
    type: "checkbox",
    options: [
      { text: "Código + implementação", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Infraestrutura + deployment", points: { devops_infra: 2 } },
      { text: "ROI + decisões de negócio", points: { ceo_financeiro: 2 } },
      { text: "Features + UX", points: { pm_product: 2 } },
      { text: "Go-to-market + growth", points: { founder_builder: 2 } },
    ],
  },
  {
    id: 5,
    text: "Seu maior bloqueador é?",
    type: "radio",
    options: [
      { text: "Falta de conhecimento técnico", points: { dev_python_aia: 1, dev_nodejs_web: 1 } },
      { text: "Como calcular ROI", points: { ceo_financeiro: 3 } },
      { text: "Timing de mercado", points: { founder_builder: 3 } },
      { text: "Alinhamento com produto", points: { pm_product: 2 } },
      { text: "Nenhum bloqueio, quero escalar", points: { devops_infra: 2 } },
    ],
  },
  {
    id: 6,
    text: "Qual dessas frases mais combina com você?",
    type: "radio",
    options: [
      { text: "Gosto de mexer no código até funcionar do meu jeito", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Prefiro garantir que o sistema não caia", points: { devops_infra: 3 } },
      { text: "Prefiro entender o impacto financeiro antes de mexer em nada", points: { ceo_financeiro: 3 } },
      { text: "Prefiro entender o que o usuário final vai sentir", points: { pm_product: 3 } },
    ],
  },
  {
    id: 7,
    text: "Onde você roda a maior parte do seu trabalho hoje?",
    type: "radio",
    options: [
      { text: "Terminal e editor de código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Servidores e ferramentas de deploy (Docker, CI/CD)", points: { devops_infra: 3 } },
      { text: "Planilhas e relatórios", points: { ceo_financeiro: 3 } },
      { text: "Ferramentas de gestão de produto (roadmap, backlog)", points: { pm_product: 3 } },
    ],
  },
  {
    id: 8,
    text: "O que mais te empolga em rodar uma IA localmente?",
    type: "checkbox",
    options: [
      { text: "Não pagar mensalidade de API", points: { founder_builder: 2, ceo_financeiro: 2 } },
      { text: "Privacidade dos dados", points: { devops_infra: 2, ceo_financeiro: 1 } },
      { text: "Poder customizar o comportamento do modelo", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Validar uma ideia de produto rápido e sem custo", points: { founder_builder: 2, pm_product: 1 } },
    ],
  },
  {
    id: 9,
    text: "Qual hardware você tem disponível hoje?",
    type: "radio",
    options: [
      { text: "PC/notebook com GPU dedicada", points: { dev_python_aia: 2, dev_nodejs_web: 1 } },
      { text: "Servidor ou VPS que eu administro", points: { devops_infra: 3 } },
      { text: "Só um notebook comum, sem GPU forte", points: { ceo_financeiro: 1, pm_product: 1, founder_builder: 1 } },
    ],
  },
  {
    id: 10,
    text: "Como você prefere aprender algo novo?",
    type: "radio",
    options: [
      { text: "Seguindo um tutorial passo a passo e codando junto", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Lendo um resumo executivo direto ao ponto", points: { ceo_financeiro: 3 } },
      { text: "Vendo casos de uso reais de outros produtos", points: { pm_product: 2, founder_builder: 2 } },
      { text: "Testando em um ambiente controlado antes de confiar", points: { devops_infra: 2 } },
    ],
  },
  {
    id: 11,
    text: "Você já usa alguma ferramenta de IA no seu dia a dia de trabalho?",
    type: "radio",
    options: [
      { text: "Sim, uso para escrever/revisar código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Sim, uso para automatizar deploy/infra", points: { devops_infra: 3 } },
      { text: "Sim, uso para análises e relatórios", points: { ceo_financeiro: 2 } },
      { text: "Ainda não uso no trabalho", points: { pm_product: 1, founder_builder: 1 } },
    ],
  },
  {
    id: 12,
    text: "Qual desses times você mais parece com o dia a dia?",
    type: "radio",
    options: [
      { text: "Engenharia de produto/backend", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "SRE/Plataforma/Infraestrutura", points: { devops_infra: 3 } },
      { text: "Financeiro/Operações", points: { ceo_financeiro: 3 } },
      { text: "Produto/UX", points: { pm_product: 3 } },
      { text: "Founders/early-stage", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 13,
    text: "O que você faria primeiro com um LLM local funcionando?",
    type: "radio",
    options: [
      { text: "Integraria em um script Python que já uso", points: { dev_python_aia: 3 } },
      { text: "Integraria em uma API/rota que já mantenho", points: { dev_nodejs_web: 3 } },
      { text: "Colocaria atrás de monitoramento antes de qualquer uso real", points: { devops_infra: 3 } },
      { text: "Calcularia quanto isso economiza por mês", points: { ceo_financeiro: 3 } },
      { text: "Testaria um protótipo de produto novo", points: { founder_builder: 3 } },
    ],
  },
  {
    id: 14,
    text: "Como você mede sucesso de um projeto de IA?",
    type: "checkbox",
    options: [
      { text: "Corretude/qualidade técnica da resposta", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Estabilidade e uptime", points: { devops_infra: 2 } },
      { text: "Redução de custo mensurável", points: { ceo_financeiro: 2, founder_builder: 1 } },
      { text: "Satisfação do usuário final", points: { pm_product: 2 } },
    ],
  },
  {
    id: 15,
    text: "Qual frase melhor descreve sua relação com prazos?",
    type: "radio",
    options: [
      { text: "Prefiro entregar rápido e iterar depois", points: { founder_builder: 3, dev_nodejs_web: 1 } },
      { text: "Prefiro validar bem antes de subir qualquer coisa", points: { devops_infra: 2, ceo_financeiro: 1 } },
      { text: "Prefiro alinhar com o time antes de definir prazo", points: { pm_product: 3 } },
    ],
  },
  {
    id: 16,
    text: "O que mais te frustra em ferramentas de IA baseadas em nuvem?",
    type: "checkbox",
    options: [
      { text: "Custo por token/mensalidade", points: { founder_builder: 2, ceo_financeiro: 2 } },
      { text: "Falta de controle sobre o modelo", points: { dev_python_aia: 2, dev_nodejs_web: 1 } },
      { text: "Dependência de terceiros para operar (SLA, disponibilidade)", points: { devops_infra: 2 } },
      { text: "Dificuldade de justificar o ROI internamente", points: { ceo_financeiro: 1, pm_product: 1 } },
    ],
  },
  {
    id: 17,
    text: "Se pudesse escolher, você preferia aprender...",
    type: "radio",
    options: [
      { text: "Detalhes técnicos de arquitetura de modelos", points: { dev_python_aia: 2 } },
      { text: "Como conectar IA a ferramentas e APIs (MCP, integrações)", points: { dev_nodejs_web: 3 } },
      { text: "Como manter isso rodando de forma confiável", points: { devops_infra: 3 } },
      { text: "Como decidir se vale o investimento", points: { ceo_financeiro: 3 } },
    ],
  },
  {
    id: 18,
    text: "Qual seu nível de experiência com terminal/linha de comando?",
    type: "radio",
    options: [
      { text: "Uso todos os dias, sem problema", points: { dev_python_aia: 2, dev_nodejs_web: 2, devops_infra: 2 } },
      { text: "Uso o básico quando preciso", points: { pm_product: 1, founder_builder: 1 } },
      { text: "Prefiro evitar quando possível", points: { ceo_financeiro: 2 } },
    ],
  },
  {
    id: 19,
    text: "Você está construindo ou já opera algum produto/empresa hoje?",
    type: "radio",
    options: [
      { text: "Sim, sou founder ou parte do time fundador", points: { founder_builder: 3 } },
      { text: "Sim, mas em uma empresa maior/estabelecida", points: { ceo_financeiro: 2, pm_product: 1 } },
      { text: "Não, trabalho como profissional técnico em um time", points: { dev_python_aia: 1, dev_nodejs_web: 1, devops_infra: 1 } },
    ],
  },
  {
    id: 20,
    text: "O que você espera conseguir fazer em 30 dias depois deste ebook?",
    type: "checkbox",
    options: [
      { text: "Ter um LLM local rodando e integrado ao meu código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Ter um LLM local rodando de forma estável em servidor", points: { devops_infra: 2 } },
      { text: "Ter clareza se vale o investimento para minha empresa", points: { ceo_financeiro: 2 } },
      { text: "Ter uma feature ou protótipo validado", points: { pm_product: 1, founder_builder: 2 } },
    ],
  },
];
