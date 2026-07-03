insert into profiles (id, name, description, recommended_ebooks, study_roadmap) values
(
  'dev_python_aia',
  'Dev Python + IA Local',
  'Você é desenvolvedor Python e quer dominar LLMs locais em produção. Seu roadmap é prático e orientado a código.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_claude_code_python", "title": "Claude Code: Python Edition", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste com seus próprios prompts", "Resultado esperado: rodando LLM localmente"]},
    "week_2": {"title": "Integração: Python + LLM", "items": ["Leia o Ebook Claude Code Python Edition", "Integre em um projeto seu existente", "Resultado esperado: LLM rodando via Python API"]},
    "week_3": {"title": "Conectores Avançados", "items": ["Explore integrações MCP", "Implemente um conector simples", "Resultado esperado: LLM conectado a 1-2 ferramentas"]},
    "week_4": {"title": "Produção", "items": ["Documente seu setup", "Teste em outro ambiente", "Resultado esperado: setup replicável"]}
  }'::jsonb
),
(
  'dev_nodejs_web',
  'Dev JS/TS + Web Apps',
  'Você constrói aplicações web e quer integrar LLMs locais em produtos JavaScript/TypeScript, sem depender de APIs pagas.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_mcp_integracoes", "title": "MCP: Integrações Avançadas", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste a API HTTP local", "Resultado esperado: LLM respondendo via requisição HTTP"]},
    "week_2": {"title": "Integração: Node/TS + LLM", "items": ["Leia o Ebook MCP: Integrações Avançadas", "Chame o LLM local a partir de uma rota Next.js/Node", "Resultado esperado: endpoint próprio consumindo o LLM local"]},
    "week_3": {"title": "Ferramentas e Protocolo MCP", "items": ["Implemente um servidor MCP simples", "Conecte a um agente de IA", "Resultado esperado: 1 ferramenta MCP funcional"]},
    "week_4": {"title": "Produto", "items": ["Integre no seu app existente", "Documente o setup", "Resultado esperado: feature de IA local rodando no seu produto"]}
  }'::jsonb
),
(
  'devops_infra',
  'DevOps + Infra + Deploy',
  'Você cuida de infraestrutura e deploy e quer colocar LLMs locais em produção de forma confiável, com monitoramento e observabilidade.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_llm_servidor", "title": "LLM no Seu Servidor", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Fundação: Setup Local", "items": ["Leia cap 5 do Ebook LLM Local (Performance por Hardware)", "Instale Ollama em um servidor de teste", "Resultado esperado: LLM rodando em servidor, acessível via rede interna"]},
    "week_2": {"title": "Deploy Confiável", "items": ["Leia o Ebook LLM no Seu Servidor", "Containerize o setup (Docker)", "Resultado esperado: setup reproduzível via container"]},
    "week_3": {"title": "Observabilidade", "items": ["Configure logs e métricas básicas de uso", "Teste sob carga simulada", "Resultado esperado: visibilidade de uso e falhas"]},
    "week_4": {"title": "Produção", "items": ["Documente runbook de operação", "Defina plano de rollback", "Resultado esperado: setup pronto para produção"]}
  }'::jsonb
),
(
  'ceo_financeiro',
  'CEO/Gestor Financeiro',
  'Você é líder e quer entender IA para tomar melhores decisões financeiras. Seu roadmap é executivo e orientado a ROI.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased", "note": "Foque nos capítulos 0, 1 e 5"},
    {"order": 2, "product_id": "ebook_ceo_ia_financeiro", "title": "CEO + IA: Decisões Financeiras", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Entender: O que é LLM Local?", "items": ["Leia Cap 0 e 1 do Ebook LLM Local", "Leia Cap 5: Performance por Hardware (visão de custo)", "Resultado esperado: saber se faz sentido para sua empresa"]},
    "week_2": {"title": "Aplicar: IA para Decisões Financeiras", "items": ["Leia o Ebook CEO + IA: Decisões Financeiras", "Identifique 1 processo financeiro que poderia usar IA", "Resultado esperado: 1 caso de uso mapeado"]},
    "week_3": {"title": "Avaliar", "items": ["Estime custo vs. benefício do caso mapeado", "Converse com seu time técnico sobre viabilidade", "Resultado esperado: decisão de seguir ou não"]},
    "week_4": {"title": "Escalar", "items": ["Defina próximos passos com o time técnico", "Resultado esperado: plano de ação definido"]}
  }'::jsonb
),
(
  'pm_product',
  'Product Manager',
  'Você define produto e quer entender as capacidades reais de LLMs locais para tomar decisões de roadmap e UX informadas.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_notebooklm_obsidian", "title": "NotebookLM + Obsidian: Combo Infinito", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Entender Capacidades", "items": ["Leia Cap 1-3 do Ebook LLM Local (tipos e capacidades)", "Teste um modelo local você mesmo", "Resultado esperado: entendimento prático do que é possível"]},
    "week_2": {"title": "Organização e Conhecimento", "items": ["Leia o Ebook NotebookLM + Obsidian", "Organize uma base de conhecimento do seu produto", "Resultado esperado: 1 fluxo de documentação com IA"]},
    "week_3": {"title": "Aplicar ao Roadmap", "items": ["Mapeie onde IA local poderia entrar no seu produto", "Valide com o time técnico", "Resultado esperado: 1 feature candidata documentada"]},
    "week_4": {"title": "Comunicar", "items": ["Prepare um resumo executivo do caso de uso", "Resultado esperado: proposta pronta para priorização"]}
  }'::jsonb
),
(
  'founder_builder',
  'Founder + Growth',
  'Você está construindo um produto ou empresa e quer usar IA local para testar ideias rápido, sem depender de custos recorrentes de API.',
  '[
    {"order": 1, "product_id": "ebook_llm_local", "title": "LLM Local: Setup Completo", "status": "already_purchased"},
    {"order": 2, "product_id": "ebook_harness_ptc", "title": "Harness + PTC: Automação", "is_free": true, "unlock_at": "after_quiz"}
  ]'::jsonb,
  '{
    "week_1": {"title": "Setup Rápido", "items": ["Leia Cap 1-2 e 6 do Ebook LLM Local (setup + hardware por budget)", "Rode seu primeiro LLM local", "Resultado esperado: ambiente de testes funcionando sem custo recorrente"]},
    "week_2": {"title": "Prototipar", "items": ["Leia o Ebook Harness + PTC: Automação", "Monte um protótipo simples usando o LLM local", "Resultado esperado: 1 protótipo funcional"]},
    "week_3": {"title": "Validar", "items": ["Teste o protótipo com 3-5 pessoas", "Ajuste com base no feedback", "Resultado esperado: aprendizado validado"]},
    "week_4": {"title": "Decidir", "items": ["Decida se vale migrar para produção ou API paga", "Resultado esperado: decisão informada de próximo passo"]}
  }'::jsonb
);
