# CONSTRUA SEU PRÓPRIO CHATGPT PARTICULAR
## LLM Local: O Guia Definitivo

---

## CAPÍTULO 0: Por Que Você Está Pagando Demais
- O problema: tokens, mensalidades, limites
- Quanto você gastou nos últimos 6 meses? (cálculo interativo)
- A virada: o que mudou em 2025-2026 (modelos open-source competitivos)

---

## CAPÍTULO 1: Tipos de LLM (Organograma de Decisão)

[ORGANOGRAMA VISUAL - Mermaid ou Figma]

         "Qual seu objetivo principal?"
                    │
      ┌─────────────┼─────────────┬──────────────┐
      ▼             ▼             ▼              ▼
   Código        Conversação   Análise de    Criatividade
   /Dev          Geral         Documentos    (texto/imagem)
      │             │             │              │
      ▼             ▼             ▼              ▼
  DeepSeek-     Llama 3.1    Mistral 7B    Dreamshaper/
  Coder, Qwen    8B/70B      + RAG          SDXL (imagem)
  Coder                                     
      │             │             │              │
      ▼             ▼             ▼              ▼
  Hardware      Hardware      Hardware       Hardware
  mínimo:       mínimo:       mínimo:        mínimo:
  RTX 3060      RTX 3060      RTX 3060       RTX 3070+
  12GB VRAM     8GB VRAM      8GB VRAM       8GB VRAM

PRINCÍPIO CENTRAL (sua observação):
"Nem sempre o mais robusto é o melhor"
→ Modelo 70B rodando devagar < Modelo 8B rodando rápido 
  para seu caso de uso específico

---

## CAPÍTULO 2: Melhores Modelos por Objetivo (Tabela Viva)

| Modelo | Tamanho | RAM/VRAM | Velocidade | Melhor Para | Pior Para |
|--------|---------|----------|------------|-------------|-----------|
| Llama 3.1 8B | 8B | 8GB | ⚡⚡⚡⚡ | Conversação geral | Código complexo |
| Llama 3.1 70B | 70B | 48GB+ | ⚡ | Raciocínio profundo | Hardware modesto |
| Mistral 7B | 7B | 6GB | ⚡⚡⚡⚡⚡ | RAG, docs | Criatividade |
| DeepSeek Coder | 6.7B-33B | 8-24GB | ⚡⚡⚡ | Programação | Conversa casual |
| Qwen 2.5 | 7B-72B | 8-48GB | ⚡⚡⚡ | Multilíngue | - |
| Phi-3 | 3.8B | 4GB | ⚡⚡⚡⚡⚡ | Hardware fraco | Tarefas complexas |

[Dados extraídos do NotebookLM + validados por você]

---

## CAPÍTULO 3: Performance por Hardware (Seus Testes)

### Tier 1: Hardware Modesto (GTX 1050Ti / RTX 3050)
- Modelos recomendados: Phi-3, Mistral 7B (quantizado)
- Velocidade esperada: X tokens/seg
- Seu teste real: [screenshot + benchmark]

### Tier 2: Hardware Médio (RTX 3060-3070)
- Modelos recomendados: Llama 3.1 8B, DeepSeek Coder 6.7B
- Velocidade esperada: X tokens/seg

### Tier 3: Hardware Avançado (RTX 4070+/4090)
- Modelos recomendados: Llama 3.1 70B (quantizado), Qwen 72B
- Velocidade esperada: X tokens/seg

---

## CAPÍTULO 4: Linha do Tempo de Evolução (Date-Based)

[Gráfico: Quando cada modelo foi lançado + evolução]

2023 Q4 → Llama 2 lançado
2024 Q2 → Llama 3 supera GPT-3.5 em benchmarks
2024 Q4 → DeepSeek surpreende custo-benefício
2025 Q2 → Modelos open rivalizam GPT-4 em tarefas específicas
2026 → [estado atual, conforme suas fontes]

→ Por que isso importa: modelo "ruim" há 1 ano pode ser 
  o melhor custo-benefício hoje (otimizações, quantização)

---

## CAPÍTULO 5: Setup Passo a Passo (Seu Real Setup)
- Instalação Ollama / LM Studio
- Download do modelo recomendado pro SEU hardware
- Primeiro prompt rodando
- Troubleshooting (CUDA, OOM, etc)

---

## CAPÍTULO 6: Build Sua Máquina (Links Afiliados)

### Upgrade de Entrada (R$ X)
- GPU: [link afiliado]
- RAM: [link afiliado]
- SSD: [link afiliado]

### Upgrade Intermediário (R$ X)
- [componentes + links]

### Build Definitivo (R$ X)
- [componentes + links]

---

## CAPÍTULO 7: Próximos Passos (Teaser Módulo Avançado)
- Dieta de tokens (preview)
- Ecossistema integrado (preview)
- "Cérebro funcional" sem alucinações (preview)
- CTA: "Disponível para assinantes no módulo avançado"
  [Aqui você planta a semente do upsell]