// Desafios automáticos que ativam
const CHALLENGES_TEMPLATE = [
  {
    title: "🎯 Desafio Diário",
    type: "daily",
    recurring: true,
    xp_reward: 50,
    badge_id: "conquistador_diario",
    description: "Complete 2 Quizzes",
    condition: { quiz_count: 2 },
    starts_at: "every_day_at_00:00",
    ends_at: "every_day_at_23:59"
  },

  {
    title: "📚 Desafio Semanal",
    type: "weekly",
    recurring: true,
    xp_reward: 200,
    badge_id: "campeao_semanal",
    description: "Leia 2 Ebooks Completos",
    condition: { ebooks_complete: 2 },
    starts_at: "every_monday_at_00:00",
    ends_at: "every_sunday_at_23:59"
  },

  {
    title: "👥 Desafio Social",
    type: "weekly",
    recurring: true,
    xp_reward: 150,
    badge_id: "ajudante",
    description: "Ajude 1 pessoa na comunidade",
    condition: { community_help_count: 1 },
    starts_at: "every_monday_at_00:00",
    ends_at: "every_sunday_at_23:59"
  },

  {
    title: "🔥 Desafio de Consistência",
    type: "special",
    xp_reward: 100,
    badge_id: "streak_semanal",
    description: "7 dias de estudo consecutivo",
    condition: { study_streak_days: 7 },
    auto_trigger: true
  },

  {
    title: "🏆 Desafio Master",
    type: "monthly",
    recurring: true,
    xp_reward: 500,
    badge_id: "mestre_do_conhecimento",
    description: "Complete todos os 6 Ebooks deste mês",
    condition: { ebooks_complete_month: 6 },
    starts_at: "every_month_day_1_at_00:00",
    ends_at: "every_month_last_day_at_23:59"
  }
];