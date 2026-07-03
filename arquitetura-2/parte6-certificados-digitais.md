A. Tipos de Certificados
```
const CERTIFICATE_TYPES = {
  // Por ebook
  "ebook_completion": {
    type: "ebook_completion",
    title_template: "Certificado de Conclusão: {ebook_name}",
    conditions: {
      must_complete_ebook: true,
      must_pass_quiz: true, // 70%+ no quiz de validação
      min_read_time: 120,   // 2 horas mínimo
    },
    valid_for: "lifetime",
    shareable: true,
    template: "certificate_ebook.html"
  },

  // Especialista em Tópico
  "topic_specialist": {
    type: "topic_specialist",
    title_template: "Certificado de Especialista: {topic}",
    conditions: {
      must_complete_ebooks: 3, // 3 ebooks do mesmo tema
      min_avg_quiz_score: 80,
    },
    valid_for: "lifetime",
    shareable: true,
    template: "certificate_specialist.html"
  },

  // Master (Jornada Completa)
  "master_completion": {
    type: "master_completion",
    title_template: "Certificado Master: Jornada Completa",
    conditions: {
      must_complete_all_ebooks: true, // 6 ebooks
      must_achieve_level: 5,
      min_total_xp: 5000,
    },
    valid_for: "lifetime",
    shareable: true,
    premium: true,
    template: "certificate_master.html"
  },

  // Desafio Mensal
  "monthly_challenge": {
    type: "monthly_challenge",
    title_template: "Certificado: Desafio {month}",
    conditions: {
      must_complete_challenge: true,
      challenge_type: "monthly",
    },
    valid_for: "1_month_from_issue",
    shareable: true,
    template: "certificate_challenge.html"
  }
};
```
___
B. Design do Certificado (HTML)
```
<!-- certificate_ebook.html -->
<div class="certificate">
  <div class="certificate-container">
    
    <!-- Header -->
    <div class="certificate-header">
      <img src="/logo-matrizcentral.png" alt="Matriz Central">
      <h1>CERTIFICADO DE CONCLUSÃO</h1>
    </div>

    <!-- Body -->
    <div class="certificate-body">
      <p class="intro">Certificamos que</p>
      
      <h2 class="user-name">{USER_NAME}</h2>
      
      <p class="completion-text">
        completou com êxito o programa
      </p>
      
      <h3 class="course-name">{EBOOK_TITLE}</h3>
      
      <p class="details">
        Demonstrando domínio dos conceitos fundamentais e 
        conquistando a pontuação de <strong>{QUIZ_SCORE}%</strong> 
        no teste de validação.
      </p>

      <!-- Stats -->
      <div class="stats">
        <div class="stat">
          <span class="label">Data de Emissão:</span>
          <span class="value">{ISSUED_DATE}</span>
        </div>
        <div class="stat">
          <span class="label">Código de Verificação:</span>
          <span class="value">{VERIFICATION_CODE}</span>
        </div>
        <div class="stat">
          <span class="label">XP Conquistados:</span>
          <span class="value">{XP_EARNED}</span>
        </div>
      </div>

      <!-- Badges earned with this -->
      <div class="badges-earned">
        <p>Badges Conquistados:</p>
        <div class="badges">
          {BADGES_ICONS}
        </div>
      </div>

      <!-- Signature -->
      <div class="signature">
        <img src="/signature.png" alt="Signature">
        <p>{FOUNDER_NAME}</p>
        <p>Fundador, Matriz Central</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="certificate-footer">
      <p>Validar certificado em: matrizcentral.com.br/verify/{VERIFICATION_CODE}</p>
      <div class="qr-code">
        {QR_CODE_VERIFICATION}
      </div>
    </div>

  </div>
</div>

<style>
  .certificate {
    width: 1000px;
    height: 700px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-family: 'Georgia', serif;
  }

  .certificate-header {
    text-align: center;
    border-bottom: 3px solid white;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }

  .certificate-header img {
    height: 60px;
  }

  .certificate-header h1 {
    color: white;
    font-size: 28px;
    margin: 10px 0 0 0;
    letter-spacing: 2px;
  }

  .user-name {
    color: white;
    font-size: 36px;
    font-weight: bold;
    margin: 30px 0;
  }

  .completion-text, .intro, .details {
    color: rgba(255,255,255,0.9);
    font-size: 16px;
  }

  .course-name {
    color: #FFD700;
    font-size: 24px;
    margin: 20px 0;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin: 30px 0;
    color: white;
  }

  .stat .label {
    font-size: 12px;
    opacity: 0.8;
  }

  .stat .value {
    display: block;
    font-weight: bold;
    font-size: 16px;
  }

  .badges-earned {
    text-align: center;
    color: white;
    margin: 20px 0;
  }

  .badges {
    display: flex;
    justify-content: center;
    gap: 15px;
    font-size: 32px;
    margin-top: 10px;
  }

  .signature {
    text-align: center;
    margin-top: 40px;
    color: white;
  }

  .signature img {
    height: 50px;
    opacity: 0.7;
  }

  .certificate-footer {
    border-top: 2px solid white;
    margin-top: 30px;
    padding-top: 15px;
    text-align: center;
    color: rgba(255,255,255,0.8);
    font-size: 12px;
  }

  .qr-code {
    margin-top: 10px;
  }
</style>
```