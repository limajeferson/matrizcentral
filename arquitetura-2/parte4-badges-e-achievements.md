const badges = {
  // APRENDIZADO FUNDAMENTAL
  "autoconhecimento": {
    id: "autoconhecimento",
    name: "🧠 Autoconhecimento",
    description: "Completou o quiz de triagem e descobriu seu perfil",
    xp_reward: 50,
    unlock_condition: { type: "quiz_completion", product: "triagem" },
    rarity: "common",
    icon: "🧠"
  },

  "primeiro_livro": {
    id: "primeiro_livro",
    name: "📖 Primeiros Passos",
    description: "Completou seu primeiro ebook",
    xp_reward: 100,
    unlock_condition: { type: "ebook_completion", count: 1 },
    rarity: "common",
    icon: "📖"
  },

  "leitor_dedicado": {
    id: "leitor_dedicado",
    name: "📚 Leitor Dedicado",
    description: "Completou 3 ebooks",
    xp_reward: 150,
    unlock_condition: { type: "ebook_completion", count: 3 },
    rarity: "rare",
    icon: "📚"
  },

  "mestre_do_conhecimento": {
    id: "mestre_do_conhecimento",
    name: "🏆 Mestre do Conhecimento",
    description: "Completou todos os 6 ebooks",
    xp_reward: 500,
    unlock_condition: { type: "ebook_completion", count: 6 },
    rarity: "epic",
    icon: "🏆"
  },

  // VALIDAÇÃO
  "validador": {
    id: "validador",
    name: "✅ Validador",
    description: "Fez o quiz de validação após completar ebook",
    xp_reward: 75,
    unlock_condition: { type: "quiz_validation_completion", count: 1 },
    rarity: "common",
    icon: "✅"
  },

  "especialista_certificado": {
    id: "especialista_certificado",
    name: "🎓 Especialista Certificado",
    description: "Conquistou 2 certificados",
    xp_reward: 200,
    unlock_condition: { type: "certificate_count", count: 2 },
    rarity: "rare",
    icon: "🎓"
  },

  // CONSISTÊNCIA
  "streak_semanal": {
    id: "streak_semanal",
    name: "🔥 Fogo Semanal",
    description: "7 dias de estudo consecutivo",
    xp_reward: 100,
    unlock_condition: { type: "study_streak", days: 7 },
    rarity: "rare",
    icon: "🔥"
  },

  "maratonista": {
    id: "maratonista",
    name: "🏃 Maratonista",
    description: "30 dias de estudo consecutivo",
    xp_reward: 300,
    unlock_condition: { type: "study_streak", days: 30 },
    rarity: "epic",
    icon: "🏃"
  },

  "imparavel": {
    id: "imparavel",
    name: "⚡ Imparável",
    description: "90 dias de estudo consecutivo",
    xp_reward: 500,
    unlock_condition: { type: "study_streak", days: 90 },
    rarity: "legendary",
    icon: "⚡"
  },

  // DESAFIOS
  "conquistador_diario": {
    id: "conquistador_diario",
    name: "⭐ Conquistador Diário",
    description: "Completou 5 desafios diários",
    xp_reward: 75,
    unlock_condition: { type: "daily_challenge", count: 5 },
    rarity: "common",
    icon: "⭐"
  },

  "campeao_semanal": {
    id: "campeao_semanal",
    name: "🥇 Campeão Semanal",
    description: "Completou 10 desafios semanais",
    xp_reward: 200,
    unlock_condition: { type: "weekly_challenge", count: 10 },
    rarity: "rare",
    icon: "🥇"
  },

  // COMUNIDADE
  "ajudante": {
    id: "ajudante",
    name: "🤝 Ajudante",
    description: "Ajudou 3 pessoas na comunidade",
    xp_reward: 100,
    unlock_condition: { type: "community_help", count: 3 },
    rarity: "common",
    icon: "🤝"
  },

  "mentor": {
    id: "mentor",
    name: "👨‍🏫 Mentor",
    description: "Ajudou 10 pessoas na comunidade",
    xp_reward: 250,
    unlock_condition: { type: "community_help", count: 10 },
    rarity: "rare",
    icon: "👨‍🏫"
  }
};