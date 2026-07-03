-- 1. USERS EXTENDED (adiciona campos gamification)
ALTER TABLE users ADD COLUMN (
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_level_xp INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}', -- Array de badge IDs
  completed_ebooks TEXT[] DEFAULT '{}',
  completed_challenges TEXT[] DEFAULT '{}',
  study_streak INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  profile_visibility TEXT DEFAULT 'public' -- public/private
);

-- 2. BADGES (Types de conquistas)
CREATE TABLE badges (
  id TEXT PRIMARY KEY, -- "autoconhecimento", "iniciado", etc
  name TEXT,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER,
  unlock_condition TEXT, -- JSON: {type: "quiz_completion", value: 1}
  rarity TEXT, -- common, rare, epic, legendary
  created_at TIMESTAMP DEFAULT now()
);

-- 3. XP_TRANSACTIONS (Log de todos XP ganhos)
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  xp_amount INTEGER,
  action_type TEXT, -- "purchase", "quiz", "ebook_complete", "challenge", etc
  reference_id TEXT, -- ID do ebook, quiz, challenge
  description TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- 4. BADGES_EARNED (Relação user → badges conquistadas)
CREATE TABLE badges_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id TEXT REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT now(),
  progress_percentage INTEGER DEFAULT 100,
  UNIQUE(user_id, badge_id)
);

-- 5. LEVELS (Definição de níveis)
CREATE TABLE levels (
  level_number INTEGER PRIMARY KEY,
  name TEXT, -- "Aprendiz", "Praticante", "Especialista", etc
  required_xp INTEGER, -- XP total acumulado para este level
  description TEXT,
  unlock_badge_id TEXT REFERENCES badges(id),
  rewards TEXT -- JSON: {bonus_ebook: true, community_access: true}
);

-- 6. CERTIFICATES (Certificados digitais)
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  certificate_type TEXT, -- "ebook_completion", "course_completion", "master"
  product_id TEXT, -- qual ebook/curso
  title TEXT, -- "Certificado: LLM Local Setup"
  issued_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP, -- NULL se não expira
  verification_code TEXT UNIQUE, -- Para validar no site
  pdf_url TEXT -- URL do PDF gerado
);

-- 7. CHALLENGES (Desafios semanais/diários)
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  challenge_type TEXT, -- "daily", "weekly", "monthly"
  xp_reward INTEGER,
  badge_id TEXT REFERENCES badges(id),
  condition JSON, -- {quiz_count: 2, ebooks_complete: 1, etc}
  starts_at TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- 8. CHALLENGES_PROGRESS (Progresso do usuário em challenges)
CREATE TABLE challenges_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  challenge_id UUID REFERENCES challenges(id),
  progress_json JSON, -- {quizzes_done: 1/2, ebooks_complete: 0/1}
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  xp_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, challenge_id)
);

-- 9. LEADERBOARD (Ranking em tempo real)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  profile_id TEXT,
  total_xp INTEGER,
  level INTEGER,
  badges_count INTEGER,
  week_xp INTEGER, -- XP da semana atual
  rank_weekly INTEGER,
  rank_all_time INTEGER,
  updated_at TIMESTAMP DEFAULT now()
);

-- 10. STUDY_SESSIONS (Rastreamento de sessões)
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ebook_id TEXT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,
  pages_read INTEGER,
  completion_percentage INTEGER
);

-- 11. ACHIEVEMENTS_LOGS (Log de quando ganhou cada conquista)
CREATE TABLE achievements_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT, -- "badge", "level_up", "certificate"
  achievement_id TEXT,
  timestamp TIMESTAMP DEFAULT now(),
  description TEXT
);  