Tempo: 5-7 minutos
Questões: 18-20
Objetivo: Classificar usuário em 1 de 6 perfis

PERFIS POSSÍVEIS:
├─ dev_python_aia (Dev Python + IA interesse)
├─ dev_nodejs_web (Dev JS/TS + Web apps)
├─ devops_infra (DevOps + Infra focus)
├─ ceo_financeiro (CEO + Gestão financeira)
├─ pm_product (PM + Product thinking)
└─ founder_builder (Founder + Growth hacking)

___
Questões (amostra)

```
const quizQuestions = [
  {
    id: 1,
    text: "Qual é sua principal linguagem de programação?",
    type: "radio",
    options: [
      { text: "Python", points: { dev_python_aia: 3 } },
      { text: "JavaScript/TypeScript", points: { dev_nodejs_web: 3 } },
      { text: "Go/Rust", points: { devops_infra: 2 } },
      { text: "Não programo", points: { ceo_financeiro: 3, pm_product: 2 } }
    ]
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
      { text: "Testar ideias de startup", points: { founder_builder: 3 } }
    ]
  },

  {
    id: 3,
    text: "Quantas horas/semana você dedica a aprender tech?",
    type: "radio",
    options: [
      { text: "0-5 horas", points: { ceo_financeiro: 2, pm_product: 1 } },
      { text: "5-10 horas", points: { pm_product: 2, founder_builder: 2 } },
      { text: "10+ horas", points: { dev_python_aia: 3, dev_nodejs_web: 3, devops_infra: 3 } }
    ]
  },

  {
    id: 4,
    text: "Você prefere conteúdo sobre...",
    type: "checkbox", // múltiplas respostas
    options: [
      { text: "Código + implementação", points: { dev_python_aia: 2, dev_nodejs_web: 2 } },
      { text: "Infraestrutura + deployment", points: { devops_infra: 2 } },
      { text: "ROI + decisões de negócio", points: { ceo_financeiro: 2 } },
      { text: "Features + UX", points: { pm_product: 2 } },
      { text: "Go-to-market + growth", points: { founder_builder: 2 } }
    ]
  },

  {
    id: 5,
    text: "Seu maior blocador é?",
    type: "radio",
    options: [
      { text: "Falta de conhecimento técnico", points: { dev_python_aia: 1, dev_nodejs_web: 1 } },
      { text: "Como calcular ROI", points: { ceo_financeiro: 3 } },
      { text: "Timing de mercado", points: { founder_builder: 3 } },
      { text: "Alinhamento com produto", points: { pm_product: 2 } },
      { text: "Nenhum blocker, quero escalar", points: { devops_infra: 2 } }
    ]
  }

  // ... mais 15-17 perguntas assim
]

// SCORING
function calculateProfile(answers) {
  const scores = {
    dev_python_aia: 0,
    dev_nodejs_web: 0,
    devops_infra: 0,
    ceo_financeiro: 0,
    pm_product: 0,
    founder_builder: 0
  }

  answers.forEach(answer => {
    const question = quizQuestions.find(q => q.id === answer.questionId)
    const option = question.options.find(o => o.text === answer.selected)
    
    Object.entries(option.points).forEach(([profile, points]) => {
      scores[profile] += points
    })
  })

  // Perfil = maior pontuação
  const profileId = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  )

  return profileId // Ex: "dev_python_aia"
}
```