import type { TriagemQuestion } from "@/lib/quiz-scoring";

/**
 * Banco de perguntas do Diagnóstico Inicial.
 *
 * Sem ramificação técnica: todas as perguntas são sempre visíveis (nenhuma
 * usa `showIf`). O objetivo não é medir conhecimento técnico, e sim mapear
 * uso, objetivo, contexto e tempo disponível para recomendar uma trilha.
 * A pontuação alimenta os mesmos 8 perfis internos (ver lib/quiz-scoring.ts),
 * que continuam existindo como classificação interna — nunca exibidos como
 * "perfil" na UI (ver dashboard: "Sua Trilha Recomendada").
 */
export const QUIZ_TRIAGEM: TriagemQuestion[] = [
  {
    id: 1,
    text: "Como você utiliza IA hoje?",
    type: "radio",
    options: [
      {
        text: "Todos os dias",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Algumas vezes por semana",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      {
        text: "Estou começando",
        points: { estudante_curioso: 2 },
      },
      {
        text: "Ainda não utilizo",
        points: { estudante_curioso: 3 },
      },
    ],
  },
  {
    id: 2,
    text: "Qual é seu principal objetivo?",
    type: "radio",
    options: [
      {
        text: "Economizar com assinaturas",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Ter mais privacidade",
        points: { devops_infra: 2, ceo_financeiro: 1 },
      },
      {
        text: "Trabalhar sem depender da internet",
        points: { devops_infra: 2, profissional_produtividade: 1 },
      },
      {
        text: "Aprender IA local",
        points: { estudante_curioso: 3 },
      },
      {
        text: "Automatizar tarefas",
        points: { founder_builder: 2, dev_nodejs_web: 1 },
      },
    ],
  },
  {
    id: 3,
    text: "Como você prefere aprender?",
    type: "radio",
    options: [
      {
        text: "Quero o caminho mais simples",
        points: { profissional_produtividade: 2, estudante_curioso: 1 },
      },
      {
        text: "Quero entender como funciona",
        points: { dev_python_aia: 2, devops_infra: 1 },
      },
      {
        text: "Um equilíbrio entre teoria e prática",
        points: { pm_product: 2, dev_nodejs_web: 1, estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 4,
    text: "Qual computador você pretende utilizar?",
    type: "radio",
    options: [
      {
        text: "Notebook básico",
        points: { estudante_curioso: 1, profissional_produtividade: 1 },
      },
      {
        text: "Notebook intermediário",
        points: { profissional_produtividade: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Desktop",
        points: { dev_python_aia: 1, devops_infra: 1 },
      },
      {
        text: "Ainda não sei",
        points: { estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 5,
    text: "Você pretende utilizar IA principalmente para:",
    type: "radio",
    options: [
      {
        text: "Trabalho",
        points: { profissional_produtividade: 2, pm_product: 2 },
      },
      {
        text: "Estudos",
        points: { estudante_curioso: 2 },
      },
      {
        text: "Empresa",
        points: { ceo_financeiro: 2, founder_builder: 1 },
      },
      {
        text: "Projetos pessoais",
        points: { founder_builder: 1, dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Ainda estou descobrindo",
        points: { estudante_curioso: 2 },
      },
    ],
  },
  {
    id: 6,
    text: "Quanto tempo você pretende dedicar inicialmente?",
    type: "radio",
    options: [
      {
        text: "Até 30 minutos",
        points: { profissional_produtividade: 1 },
      },
      {
        text: "Cerca de 1 hora",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      {
        text: "Algumas horas",
        points: { dev_python_aia: 1, devops_infra: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Aos poucos",
        points: { estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 7,
    text: "O que mais incomoda você hoje?",
    type: "radio",
    options: [
      {
        text: "Pagar assinatura todo mês",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Limites de uso",
        points: { dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Falta de privacidade",
        points: { devops_infra: 2, ceo_financeiro: 1 },
      },
      {
        text: "Depender da internet",
        points: { devops_infra: 2 },
      },
      {
        text: "Não saber por onde começar",
        points: { estudante_curioso: 3 },
      },
    ],
  },
];
