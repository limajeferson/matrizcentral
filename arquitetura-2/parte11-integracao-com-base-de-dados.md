-- Função: Adicionar XP após completar ebook
CREATE OR REPLACE FUNCTION add_xp_ebook_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere transação de XP
  INSERT INTO xp_transactions (user_id, xp_amount, action_type, reference_id, description)
  VALUES (NEW.user_id, 150, 'ebook_complete', NEW.ebook_id, 'Completou ebook ' || NEW.ebook_id);
  
  -- Atualiza total XP do usuário
  UPDATE users 
  SET total_xp = total_xp + 150
  WHERE id = NEW.user_id;
  
  -- Checa se desbloqueou badges
  PERFORM check_badge_unlock(NEW.user_id);
  PERFORM check_level_up(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_ebook_completion
AFTER UPDATE ON purchases
FOR EACH ROW
WHEN (NEW.downloaded = true AND OLD.downloaded = false)
EXECUTE FUNCTION add_xp_ebook_completion();

-- Função: Checar Level UP
CREATE OR REPLACE FUNCTION check_level_up(user_id UUID)
RETURNS void AS $$
DECLARE
  new_level INTEGER;
  current_xp INTEGER;
BEGIN
  SELECT total_xp INTO current_xp FROM users WHERE id = user_id;
  
  new_level := (
    SELECT level_number FROM levels
    WHERE required_xp <= current_xp
    ORDER BY level_number DESC
    LIMIT 1
  );
  
  UPDATE users
  SET current_level = new_level
  WHERE id = user_id AND current_level < new_level;
  
  -- Insere achievement log
  IF new_level > (SELECT current_level FROM users WHERE id = user_id) THEN
    INSERT INTO achievements_logs (user_id, achievement_type, achievement_id, description)
    VALUES (user_id, 'level_up', 'level_' || new_level, 'Subiu para Level ' || new_level);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar Study Streak
CREATE OR REPLACE FUNCTION update_study_streak()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    study_streak = CASE 
      WHEN DATE(last_activity_date) = CURRENT_DATE - 1 THEN study_streak + 1
      WHEN DATE(last_activity_date) = CURRENT_DATE THEN study_streak
      ELSE 1
    END,
    last_activity_date = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função: Gerar Certificado
CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER AS $$
BEGIN
  -- Após passar no quiz de validação
  IF NEW.quiz_score >= 70 THEN
    INSERT INTO certificates (
      user_id, 
      certificate_type, 
      product_id, 
      title,
      verification_code,
      pdf_url
    ) VALUES (
      NEW.user_id,
      'ebook_completion',
      NEW.product_id,
      'Certificado: ' || NEW.product_name,
      gen_random_uuid()::text,
      '/certificates/' || gen_random_uuid()::text || '.pdf'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;