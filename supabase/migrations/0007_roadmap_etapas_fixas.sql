-- Reestrutura study_roadmap de "semanas por perfil" para 5 etapas fixas,
-- iguais para todos os perfis (conteúdo adaptado do que já existia em
-- week_1..4 de cada perfil nas migrations 0002 e 0003).

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste com seus próprios prompts", "Rode seu primeiro modelo local"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para sua máquina"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o ebook recomendado para o seu perfil", "Aplique em uma tarefa real do seu dia a dia", "Documente o resultado obtido"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Identifique 1 tarefa repetitiva no seu fluxo", "Monte uma automação simples usando o modelo local", "Valide o resultado com 2-3 execuções"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'dev_python_aia';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste a API HTTP local", "Rode seu primeiro modelo local"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para sua máquina"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o Ebook MCP: Integrações Avançadas", "Chame o LLM local a partir de uma rota Next.js/Node", "Documente o endpoint criado"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Implemente um servidor MCP simples", "Conecte a um agente de IA", "Valide 1 ferramenta MCP funcional"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'dev_nodejs_web';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 5 do Ebook LLM Local (Performance por Hardware)", "Instale Ollama em um servidor de teste", "Rode seu primeiro modelo local em rede interna"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para o servidor"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o Ebook LLM no Seu Servidor", "Containerize o setup (Docker)", "Documente o setup reproduzível"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Configure logs e métricas básicas de uso", "Teste sob carga simulada", "Documente runbook de operação"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'devops_infra';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender o que é uma IA local e se faz sentido para sua empresa.", "checklist": ["Leia Cap 0 e 1 do Ebook LLM Local", "Leia Cap 5: Performance por Hardware (visão de custo)", "Avalie se faz sentido para sua empresa"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Entender o custo-benefício dos modelos disponíveis.", "checklist": ["Leia a tabela comparativa de modelos", "Identifique o modelo com melhor custo-benefício", "Estime o investimento necessário"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Aplicar IA local a um processo financeiro real.", "checklist": ["Leia o Ebook CEO + IA: Decisões Financeiras", "Identifique 1 processo financeiro que poderia usar IA", "Mapeie 1 caso de uso"]},
  "automacoes": {"title": "Automações", "objective": "Avaliar viabilidade e definir plano de ação.", "checklist": ["Converse com seu time técnico sobre viabilidade", "Estime custo vs. benefício do caso mapeado", "Defina próximos passos com o time"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'ceo_financeiro';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender as capacidades reais de LLMs locais.", "checklist": ["Leia Cap 1-3 do Ebook LLM Local", "Teste um modelo local você mesmo", "Anote o que é possível fazer hoje"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher modelos adequados para casos de produto.", "checklist": ["Leia a tabela comparativa de modelos", "Compare 2 modelos para diferentes casos de uso", "Registre as diferenças observadas"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Organizar conhecimento e aplicar ao roadmap do produto.", "checklist": ["Leia o Ebook NotebookLM + Obsidian", "Organize uma base de conhecimento do seu produto", "Mapeie onde IA local poderia entrar no produto"]},
  "automacoes": {"title": "Automações", "objective": "Validar e comunicar 1 feature candidata.", "checklist": ["Valide a ideia com o time técnico", "Prepare um resumo executivo do caso de uso", "Documente a proposta"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'pm_product';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Ter um ambiente de testes funcionando sem custo recorrente.", "checklist": ["Leia Cap 1-2 e 6 do Ebook LLM Local (setup + hardware por budget)", "Rode seu primeiro LLM local", "Confirme o ambiente sem custo recorrente"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher um modelo leve o suficiente para prototipagem rápida.", "checklist": ["Leia a tabela comparativa de modelos", "Escolha um modelo leve para prototipagem", "Teste a latência de resposta"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Montar e validar um protótipo funcional.", "checklist": ["Leia o Ebook Harness + PTC: Automação", "Monte um protótipo simples usando o LLM local", "Teste o protótipo com 3-5 pessoas"]},
  "automacoes": {"title": "Automações", "objective": "Decidir o próximo passo com base no aprendizado validado.", "checklist": ["Ajuste o protótipo com base no feedback", "Decida se vale migrar para produção ou API paga", "Documente a decisão tomada"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'founder_builder';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender o que a IA faz bem e o que ela não faz.", "checklist": ["Leia os capítulos 0 e 1 do ebook (sem pressa, são introdutórios)", "Experimente uma IA gratuita com tarefas do seu dia", "Anote o que mais te surpreendeu"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Ver uma IA rodando no seu próprio computador.", "checklist": ["Leia o capítulo de setup passo a passo", "Instale o LM Studio e teste um modelo pequeno", "Rode seu primeiro modelo local"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Criar um sistema seu para organizar o que aprende.", "checklist": ["Leia o ebook NotebookLM + Obsidian", "Crie seu primeiro caderno de anotações com IA", "Guarde 1 aprendizado importante"]},
  "automacoes": {"title": "Automações", "objective": "Consolidar o aprendizado e definir o próximo passo.", "checklist": ["Revise o que mais te interessou até aqui", "Refaça o quiz de validação para consolidar", "Escolha qual trilha seguir a partir daqui"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'estudante_curioso';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Decidir conscientemente qual IA usar (e quanto pagar, se pagar).", "checklist": ["Leia os capítulos 0 e 1 do ebook", "Compare o que você usa hoje com opções gratuitas e pagas", "Anote sua decisão"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher um modelo local sem precisar usar terminal.", "checklist": ["Leia o capítulo de setup com LM Studio (sem terminal)", "Instale e teste um modelo local", "Confirme que está funcionando"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Acelerar 1 tarefa recorrente do seu trabalho com IA.", "checklist": ["Leia o ebook NotebookLM + Obsidian", "Monte um fluxo de anotações e resumos com IA", "Aplique em 1 tarefa recorrente"]},
  "automacoes": {"title": "Automações", "objective": "Ter uma rotina com IA funcionando no dia a dia.", "checklist": ["Aplique o fluxo em mais uma área do trabalho", "Meça o tempo economizado", "Documente a rotina criada"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'profissional_produtividade';
