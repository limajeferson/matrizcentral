┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO PRINCIPAL                        │
│              seuproduto.com (seu site)                      │
└─────────────────────────────────────────────────────────────┘
    │
    ├─ /checkout → Stripe Payment
    │              ↓
    │         Email enviado (Brevo)
    │         Token gerado (Supabase)
    │
    ├─ /quiz/[token] → Triagem Interativa
    │                  ↓
    │             Salva respostas (Supabase)
    │             Calcula perfil (IA/lógica)
    │             Atualiza userData
    │
    ├─ /dashboard/[token] → Área do Aluno
    │                       ├─ Seu Perfil
    │                       ├─ Roadmap Personalizado
    │                       ├─ Download Ebook 1
    │                       ├─ Acesso Ebook 2 (Grátis)
    │                       ├─ Upsells recomendados
    │                       └─ Histórico de aprendizado
    │
    └─ /admin → Panel de Gestão
                ├─ Vendas + Token Status
                ├─ Reembolsos (Política)
                ├─ Dados de Triagem (CSV)
                └─ Sequências de Email

┌─────────────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (Supabase)                  │
└─────────────────────────────────────────────────────────────┘

Tabelas:

1. users
   ├─ id (UUID)
   ├─ email
   ├─ stripe_customer_id
   ├─ created_at
   └─ metadata (JSON)

2. purchases
   ├─ id
   ├─ user_id
   ├─ product_id ("ebook_llm_local")
   ├─ price (4700 = R$47)
   ├─ status ("paid" | "refunded")
   ├─ stripe_payment_id
   ├─ downloaded (boolean) ← CHAVE!
   ├─ refund_window_expires (date)
   └─ created_at

3. tokens
   ├─ token (unique, ABC123XYZ)
   ├─ purchase_id
   ├─ valid_until (30 dias)
   ├─ triaged (boolean)
   ├─ profile_id (FK → profiles)
   └─ created_at

4. quiz_responses
   ├─ id
   ├─ token
   ├─ question_id
   ├─ answer (JSON ou texto)
   ├─ timestamp
   └─ calculated_profile → profiles.id

5. profiles
   ├─ id ("dev_python_aia", "ceo_financeiro", etc)
   ├─ name
   ├─ description
   ├─ recommended_ebooks (JSON array)
   ├─ study_roadmap (JSON)
   └─ email_sequence_id

6. recommended_products
   ├─ id
   ├─ profile_id
   ├─ product_id
   ├─ order (sequência de estudo)
   ├─ is_free (boolean)
   ├─ email_day_trigger (dia 7, 14, 21)
   └─ copy_email (template)

7. refund_requests
   ├─ id
   ├─ purchase_id
   ├─ reason
   ├─ status ("approved" | "denied" | "pending")
   ├─ triaged_status
   ├─ downloaded_status
   └─ created_at