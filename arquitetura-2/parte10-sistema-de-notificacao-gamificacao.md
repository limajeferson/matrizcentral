// Notificações automáticas ao usuário
const NOTIFICATIONS = {
  xp_gained: {
    template: "Você ganhou +{XP} XP por {ACTION}! 🎉",
    trigger: "immediate"
  },

  badge_unlocked: {
    template: "Badge desbloqueada: {BADGE_NAME}! Parabéns! 🏆",
    trigger: "immediate",
    sound: true
  },

  level_up: {
    template: "Você subiu para Level {LEVEL}! Desbloqueia: {FEATURE} 🚀",
    trigger: "immediate",
    sound: true,
    animation: true
  },

  streak_milestone: {
    template: "Você tem {DAYS} dias de streak! Continue assim! 🔥",
    trigger: "daily",
    condition: "streak_days % 7 === 0"
  },

  challenge_completed: {
    template: "Desafio completo! {BADGE_NAME} + {XP} XP",
    trigger: "immediate",
    sound: true
  },

  challenge_almost_done: {
    template: "Quase lá! Complete {REMAINING} para terminar o desafio {CHALLENGE}",
    trigger: "when_80_percent",
    conditions: "challenge.progress > 80%"
  },

  ranking_improved: {
    template: "Você subiu para #{RANK}! 📈 Você está melhorando!",
    trigger: "daily",
    condition: "rank_improved_today"
  },

  daily_reminder: {
    template: "Bom dia, {NAME}! Continue seu streak! 🌟",
    trigger: "8am_every_day",
    personalized: true
  },

  new_product_available: {
    template: "Novo produto desbloqueado para seu perfil! {PRODUCT_NAME}",
    trigger: "when_eligible",
    condition: "level >= required_level && has_prerequisites"
  }
};