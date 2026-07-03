const LEVELS = [
  {
    level: 1,
    name: "🌱 Aprendiz",
    required_xp: 0,
    description: "Você iniciou sua jornada de aprendizado",
    unlock_features: ["view_dashboard"]
  },

  {
    level: 2,
    name: "📚 Estudante",
    required_xp: 500,
    description: "Completou sua triagem e começou a estudar",
    unlock_features: ["view_badges", "access_community"]
  },

  {
    level: 3,
    name: "🎯 Praticante",
    required_xp: 1200,
    description: "Completou o primeiro produto com validação",
    unlock_features: ["download_certificates", "see_leaderboard"]
  },

  {
    level: 4,
    name: "⚡ Especialista",
    required_xp: 2500,
    description: "Domina 3+ produtos",
    unlock_features: ["early_access_new_products", "mentor_badge"]
  },

  {
    level: 5,
    name: "🏆 Mestre",
    required_xp: 5000,
    description: "Completou a jornada de aprendizado (6+ produtos)",
    unlock_features: ["master_certificate", "exclusive_community", "offer_1_on_1"]
  },

  {
    level: 6,
    name: "👑 Lenda",
    required_xp: 10000,
    description: "Você é uma referência na comunidade",
    unlock_features: ["featured_profile", "ambassador_program", "lifetime_access"]
  }
];