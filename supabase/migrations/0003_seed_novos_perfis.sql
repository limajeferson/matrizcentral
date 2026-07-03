insert into profiles (id, name, description, recommended_ebooks, study_roadmap) values
(
  'estudante_curioso',
  'Explorador de IA',
  'Você quer entender IA do zero, no seu ritmo e sem jargão. Seu roadmap começa pelos fundamentos e avança só quando você quiser ir mais fundo.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased", "note": "Comece pelos capítulos 0 e 1 — são escritos para quem está começando"},
    {"order": 2, "product_id": "ebook_notebooklm_obsidian", "title": "NotebookLM + Obsidian: Combo Infinito", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundamentos: o que é uma IA de verdade", "items": ["Leia os capítulos 0 e 1 do ebook (sem pressa, são introdutórios)", "Experimente uma IA gratuita (ChatGPT, Claude ou Gemini) com tarefas do seu dia", "Resultado esperado: entender o que a IA faz bem e o que ela não faz"]},
    "week_2": {"title": "Organize seu aprendizado", "items": ["Leia o ebook NotebookLM + Obsidian", "Crie seu primeiro caderno de anotações com IA", "Resultado esperado: um sistema seu para guardar o que aprende"]},
    "week_3": {"title": "Primeiro contato com IA local", "items": ["Leia o capítulo 6 do ebook (setup passo a passo)", "Se seu computador permitir, instale o LM Studio e teste um modelo pequeno", "Resultado esperado: ver uma IA rodando no seu próprio computador"]},
    "week_4": {"title": "Escolha seu próximo passo", "items": ["Revise o que mais te interessou nas 3 semanas", "Refaça o quiz de validação para consolidar o aprendizado", "Resultado esperado: clareza sobre qual trilha seguir a partir daqui"]}
  }'::jsonb
),
(
  'profissional_produtividade',
  'Profissional + IA',
  'Você não programa — e não precisa. Quer usar IA para trabalhar melhor: saber qual vale assinar, quais são boas e gratuitas, e quando faz sentido ter uma IA só sua.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased", "note": "Trilha sem código: capítulos 0, 1 e 6"},
    {"order": 2, "product_id": "ebook_notebooklm_obsidian", "title": "NotebookLM + Obsidian: Combo Infinito", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Escolha sua IA: assinar, usar grátis ou ter a sua", "items": ["Leia os capítulos 0 e 1 do ebook", "Compare o que você usa hoje com as opções gratuitas e pagas", "Resultado esperado: decisão consciente de qual IA usar (e quanto pagar, se pagar)"]},
    "week_2": {"title": "IA no seu fluxo de trabalho", "items": ["Leia o ebook NotebookLM + Obsidian", "Monte um fluxo de anotações e resumos com IA para o seu trabalho", "Resultado esperado: 1 tarefa recorrente do seu dia acelerada com IA"]},
    "week_3": {"title": "Sua IA particular (sem código)", "items": ["Leia o capítulo 6 do ebook (setup com LM Studio, sem terminal)", "Instale e teste um modelo local para dados que você não quer enviar para a nuvem", "Resultado esperado: saber quando usar IA local vs. nuvem"]},
    "week_4": {"title": "Consolide e valide", "items": ["Aplique o fluxo da semana 2 em mais uma área do trabalho", "Faça o quiz de validação", "Resultado esperado: rotina com IA funcionando e certificado no perfil"]}
  }'::jsonb
);
