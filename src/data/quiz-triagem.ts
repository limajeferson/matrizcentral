import type { TriagemQuestion } from "@/lib/quiz-scoring";

/**
 * Banco de perguntas da triagem — democratizado e ramificado.
 *
 * Q1 seleciona o objetivo; Q2 identifica a relação com programação.
 * Perguntas técnicas só aparecem para quem programa (showIf sobre Q2);
 * o ramo não-técnico recebe perguntas equivalentes sem jargão.
 * A pontuação alimenta 8 perfis (ver lib/quiz-scoring.ts).
 */
export const QUIZ_TRIAGEM: TriagemQuestion[] = [
  // ---------- Cabeça comum ----------
  {
    id: 1,
    text: "O que te traz aqui?",
    type: "radio",
    options: [
      {
        text: "Quero ter minha própria IA rodando no meu computador",
        points: { dev_python_aia: 2, devops_infra: 1, profissional_produtividade: 1 },
      },
      {
        text: "Quero integrar IA no que eu construo",
        points: { dev_nodejs_web: 3, dev_python_aia: 1 },
      },
      {
        text: "Quero usar IA para melhorar meu negócio",
        points: { ceo_financeiro: 3 },
      },
      {
        text: "Quero mais produtividade no meu dia a dia",
        points: { profissional_produtividade: 3 },
      },
      {
        text: "Quero entender IA do zero, sem pressa",
        points: { estudante_curioso: 3 },
      },
      {
        text: "Quero construir e vender coisas feitas com IA",
        points: { founder_builder: 3 },
      },
    ],
  },
  {
    id: 2,
    text: "Você programa?",
    type: "radio",
    options: [
      {
        text: "Sim, é meu trabalho ou hobby",
        points: { dev_python_aia: 1, dev_nodejs_web: 1, devops_infra: 1 },
      },
      {
        text: "Um pouco — já mexi em código ou automações",
        points: { founder_builder: 1, estudante_curioso: 1 },
      },
      {
        text: "Não programo — sem problema, o quiz se adapta a você",
        points: { profissional_produtividade: 2, ceo_financeiro: 1 },
      },
    ],
  },

  // ---------- Ramo técnico (quem programa ou já mexeu) ----------
  {
    id: 3,
    text: "Qual é sua principal linguagem de programação?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0, 1] },
    options: [
      { text: "Python", points: { dev_python_aia: 3 } },
      { text: "JavaScript/TypeScript", points: { dev_nodejs_web: 3 } },
      { text: "Go/Rust ou outras de infra", points: { devops_infra: 2 } },
      {
        text: "Low-code / automações (n8n, Make, planilhas)",
        points: { founder_builder: 2, profissional_produtividade: 1 },
      },
    ],
  },
  {
    id: 4,
    text: "Qual seu principal objetivo com uma IA local?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0] },
    options: [
      {
        text: "Automação de código e prompts no meu fluxo",
        points: { dev_python_aia: 3, dev_nodejs_web: 2 },
      },
      { text: "Colocar em produção com confiabilidade", points: { devops_infra: 3 } },
      {
        text: "Privacidade: dados que não podem ir para a nuvem",
        points: { devops_infra: 1, profissional_produtividade: 1, ceo_financeiro: 1 },
      },
      {
        text: "Prototipar produtos rápido e sem custo por uso",
        points: { founder_builder: 2 },
      },
    ],
  },
  {
    id: 5,
    text: "Qual hardware você tem disponível hoje?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0, 1] },
    options: [
      { text: "PC/notebook com GPU dedicada", points: { dev_python_aia: 2, dev_nodejs_web: 1 } },
      { text: "Servidor ou VPS que eu administro", points: { devops_infra: 3 } },
      {
        text: "Só um notebook comum",
        points: { estudante_curioso: 1, profissional_produtividade: 1 },
      },
    ],
  },
  {
    id: 6,
    text: "Qual seu nível com terminal/linha de comando?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0] },
    options: [
      {
        text: "Uso todos os dias, sem problema",
        points: { dev_python_aia: 2, dev_nodejs_web: 2, devops_infra: 2 },
      },
      { text: "Uso o básico quando preciso", points: { founder_builder: 1 } },
      {
        text: "Prefiro interfaces gráficas",
        points: { profissional_produtividade: 1, pm_product: 1 },
      },
    ],
  },
  {
    id: 7,
    text: "Onde você passa a maior parte do trabalho hoje?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0] },
    options: [
      { text: "Editor de código", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Docker, CI/CD e infraestrutura", points: { devops_infra: 3 } },
      { text: "Notebooks e análise de dados", points: { dev_python_aia: 2 } },
      { text: "Ferramentas de gestão de produto", points: { pm_product: 2 } },
    ],
  },
  {
    id: 8,
    text: "O que você faria primeiro com uma IA local funcionando?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [0, 1] },
    options: [
      { text: "Integraria num script ou projeto Python", points: { dev_python_aia: 3 } },
      { text: "Integraria numa API ou app web", points: { dev_nodejs_web: 3 } },
      {
        text: "Colocaria atrás de monitoramento antes de uso real",
        points: { devops_infra: 3 },
      },
      {
        text: "Testaria um protótipo de produto novo",
        points: { founder_builder: 2, pm_product: 1 },
      },
    ],
  },

  // ---------- Ramo não-técnico (quem não programa ou mexeu pouco) ----------
  {
    id: 9,
    text: "Qual IA você usa hoje?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [1, 2] },
    options: [
      {
        text: "Nenhuma ainda — quero começar do jeito certo",
        points: { estudante_curioso: 2 },
      },
      {
        text: "ChatGPT, Gemini ou Claude na versão gratuita",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      { text: "Já assino uma IA paga", points: { profissional_produtividade: 2 } },
      {
        text: "Uso várias, dependendo da tarefa",
        points: { founder_builder: 1, profissional_produtividade: 1 },
      },
    ],
  },
  {
    id: 10,
    text: "O que mais pesa na hora de escolher uma IA?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [1, 2] },
    options: [
      {
        text: "Preço — saber se vale pagar ou dá para usar grátis",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      {
        text: "Privacidade dos meus dados",
        points: { ceo_financeiro: 1, profissional_produtividade: 1 },
      },
      { text: "Facilidade — sem complicação técnica", points: { estudante_curioso: 2 } },
      {
        text: "Qualidade das respostas para o meu trabalho",
        points: { profissional_produtividade: 2 },
      },
    ],
  },
  {
    id: 11,
    text: "O uso é mais pessoal ou para negócio?",
    type: "radio",
    showIf: { questionId: 2, optionIndexes: [1, 2] },
    options: [
      {
        text: "Pessoal — estudo, organização, dia a dia",
        points: { profissional_produtividade: 2, estudante_curioso: 1 },
      },
      { text: "Para o meu negócio", points: { ceo_financeiro: 2, founder_builder: 1 } },
      {
        text: "Para a empresa onde trabalho",
        points: { pm_product: 2, ceo_financeiro: 1 },
      },
      { text: "Ainda estou explorando", points: { estudante_curioso: 2 } },
    ],
  },
  {
    id: 12,
    text: "Que tarefas você quer acelerar com IA?",
    type: "checkbox",
    showIf: { questionId: 2, optionIndexes: [1, 2] },
    options: [
      {
        text: "Escrever textos, e-mails e documentos",
        points: { profissional_produtividade: 2 },
      },
      { text: "Planilhas, relatórios e análises", points: { ceo_financeiro: 2 } },
      { text: "Estudar e resumir conteúdos", points: { estudante_curioso: 2 } },
      { text: "Criar conteúdo para redes/produtos", points: { founder_builder: 2 } },
    ],
  },

  // ---------- Cauda comum ----------
  {
    id: 13,
    text: "Quanto tempo por semana você tem para aprender?",
    type: "radio",
    options: [
      {
        text: "Até 2 horas",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      { text: "2 a 5 horas", points: { pm_product: 1, ceo_financeiro: 1 } },
      { text: "5 a 10 horas", points: { founder_builder: 2, estudante_curioso: 1 } },
      {
        text: "Mais de 10 horas",
        points: { dev_python_aia: 2, dev_nodejs_web: 2, devops_infra: 2 },
      },
    ],
  },
  {
    id: 14,
    text: "Como você prefere aprender?",
    type: "radio",
    options: [
      {
        text: "Passo a passo, mão na massa",
        points: { dev_python_aia: 1, dev_nodejs_web: 1, estudante_curioso: 1 },
      },
      { text: "Resumo direto ao ponto", points: { ceo_financeiro: 2 } },
      {
        text: "Vídeo e áudio (podcast)",
        points: { estudante_curioso: 1, profissional_produtividade: 1 },
      },
      {
        text: "Casos reais de quem já aplicou",
        points: { pm_product: 2, founder_builder: 1 },
      },
    ],
  },
  {
    id: 15,
    text: "Que tipo de conteúdo mais te interessa?",
    type: "checkbox",
    options: [
      { text: "Código e implementação", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Infraestrutura e operação", points: { devops_infra: 2 } },
      { text: "Retorno e decisões de negócio", points: { ceo_financeiro: 2 } },
      { text: "Produtividade pessoal", points: { profissional_produtividade: 2 } },
      { text: "Fundamentos, começando do zero", points: { estudante_curioso: 2 } },
      { text: "Produto e experiência do usuário", points: { pm_product: 2 } },
    ],
  },
  {
    id: 16,
    text: "O que mais te incomoda nas IAs que você conhece?",
    type: "checkbox",
    options: [
      {
        text: "Custo de mensalidades e créditos",
        points: { founder_builder: 1, ceo_financeiro: 1, profissional_produtividade: 1 },
      },
      {
        text: "Falta de controle sobre o comportamento",
        points: { dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Meus dados irem para a nuvem",
        points: { devops_infra: 1, ceo_financeiro: 1 },
      },
      {
        text: "Complexidade — parece coisa de especialista",
        points: { estudante_curioso: 2 },
      },
    ],
  },
  {
    id: 17,
    text: "Qual profundidade você busca agora?",
    type: "radio",
    options: [
      {
        text: "Só o essencial para aplicar hoje",
        points: { profissional_produtividade: 2, ceo_financeiro: 1 },
      },
      { text: "Passo a passo completo, do início ao fim", points: { estudante_curioso: 2 } },
      {
        text: "Quero os detalhes técnicos por trás",
        points: { dev_python_aia: 2, devops_infra: 1 },
      },
    ],
  },
  {
    id: 18,
    text: "Qual é a sua situação hoje?",
    type: "radio",
    options: [
      {
        text: "Trabalho em uma empresa",
        points: { pm_product: 1, profissional_produtividade: 1 },
      },
      { text: "Tenho meu próprio negócio", points: { ceo_financeiro: 2 } },
      { text: "Sou founder / estou começando algo", points: { founder_builder: 2 } },
      {
        text: "Trabalho por conta própria",
        points: { founder_builder: 1, profissional_produtividade: 1 },
      },
      { text: "Estudando ou explorando possibilidades", points: { estudante_curioso: 2 } },
    ],
  },
  {
    id: 19,
    text: "O que você quer ter conquistado em 30 dias?",
    type: "checkbox",
    options: [
      {
        text: "Minha IA rodando no meu computador",
        points: { dev_python_aia: 2, devops_infra: 1 },
      },
      {
        text: "Uma feature ou protótipo com IA funcionando",
        points: { dev_nodejs_web: 2, founder_builder: 1 },
      },
      { text: "Clareza para decidir sobre IA no negócio", points: { ceo_financeiro: 2 } },
      {
        text: "Uma rotina de trabalho mais rápida com IA",
        points: { profissional_produtividade: 2 },
      },
      { text: "Entender os fundamentos com segurança", points: { estudante_curioso: 2 } },
    ],
  },
  {
    id: 20,
    text: "Como você vai medir se valeu a pena?",
    type: "checkbox",
    options: [
      {
        text: "Qualidade técnica do que eu construir",
        points: { dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Estabilidade — funciona sem eu me preocupar",
        points: { devops_infra: 2 },
      },
      { text: "Economia e retorno para o negócio", points: { ceo_financeiro: 2 } },
      { text: "Tempo que eu ganhar de volta", points: { profissional_produtividade: 2 } },
      { text: "Confiança para ir além do básico", points: { estudante_curioso: 2 } },
      { text: "Satisfação de quem usa o que eu faço", points: { pm_product: 2 } },
    ],
  },
];
