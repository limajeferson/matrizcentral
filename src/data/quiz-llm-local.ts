// quiz-llm-local.ts
// Quiz de Validação: "Construa Seu Próprio ChatGPT Particular"
// Produto: LLM Local Setup | Matriz Central
// Pontuação mínima para certificado: 70% (≥ 11/15)
// Recompensa: 100 XP + Badge "Validador" + Certificado

export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  hint: string;
  explanation: string; // Mostrado após responder
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export const QUIZ_LLM_LOCAL: QuizQuestion[] = [
  {
    id: 1,
    question:
      "Qual é a principal vantagem de um modelo de linguagem com arquitetura Mixture of Experts (MoE) em comparação com um modelo denso de mesmo tamanho total de parâmetros?",
    options: [
      { id: "A", text: "Menor necessidade de memória VRAM para carregar o modelo." },
      { id: "B", text: "Maior velocidade de inferência (tokens por segundo)." },
      { id: "C", text: "Capacidade superior de raciocínio lógico em um único passo." },
      { id: "D", text: "Eliminação total de alucinações durante a geração de código." },
    ],
    correctAnswer: "B",
    hint: "Considere como a ativação parcial de parâmetros afeta o desempenho em tempo real.",
    explanation:
      "Modelos MoE ativam apenas uma fração dos parâmetros por token (ex: 4B de 26B no Gemma 4 26B MoE), resultando em velocidades muito maiores — até 66 tokens/segundo vs 18 tokens/segundo de um modelo denso equivalente.",
    difficulty: "medium",
    topic: "Arquitetura de Modelos",
  },
  {
    id: 2,
    question:
      "Ao rodar uma IA localmente, qual componente de hardware é geralmente considerado o maior gargalo para a execução de modelos grandes?",
    options: [
      { id: "A", text: "O espaço disponível em disco rígido ou SSD." },
      { id: "B", text: "A largura de banda da conexão de internet." },
      { id: "C", text: "A velocidade de clock (GHz) do processador principal (CPU)." },
      { id: "D", text: "A quantidade de memória de vídeo (VRAM) da GPU." },
    ],
    correctAnswer: "D",
    hint: "Pense no componente que armazena os 'pesos' do modelo durante o cálculo matemático da inferência.",
    explanation:
      "A VRAM da GPU é o principal gargalo: os pesos do modelo precisam caber inteiramente na memória de vídeo para aceleração eficiente. Um modelo de 7B em FP16 ocupa ~14GB de VRAM — se não couber, o sistema usa RAM (muito mais lento).",
    difficulty: "easy",
    topic: "Hardware",
  },
  {
    id: 3,
    question:
      "O que acontece tecnicamente quando aplicamos a 'quantização' em um modelo de 16-bit para 4-bit?",
    options: [
      { id: "A", text: "Reduz-se a precisão numérica dos parâmetros para economizar memória." },
      { id: "B", text: "O modelo ganha novas capacidades multimodais, como visão e áudio." },
      { id: "C", text: "A janela de contexto do modelo é dobrada automaticamente." },
      { id: "D", text: "Aumenta-se o número de tokens que o modelo pode processar por segundo." },
    ],
    correctAnswer: "A",
    hint: "Lembre-se do compromisso entre o espaço ocupado e a fidelidade da representação dos dados.",
    explanation:
      "Quantização reduz a precisão dos pesos: de 16-bit (2 bytes por parâmetro) para 4-bit (~0.5 bytes), reduzindo o tamanho do modelo em ~4x com mínima perda de qualidade. Um modelo de 7B passa de ~14GB para ~4GB.",
    difficulty: "medium",
    topic: "Quantização",
  },
  {
    id: 4,
    question:
      "No contexto de ferramentas como o Ollama, qual é a principal utilidade de usar modelos no formato GGUF?",
    options: [
      { id: "A", text: "Permitir que o modelo rode tanto em CPU quanto em GPU de forma eficiente." },
      { id: "B", text: "Criptografar as conversas para que nem o sistema operacional as veja." },
      { id: "C", text: "Garantir que o modelo nunca alucine informações de data e hora." },
      { id: "D", text: "Forçar o modelo a responder exclusivamente em linguagem de programação." },
    ],
    correctAnswer: "A",
    hint: "Considere a necessidade de rodar modelos em computadores que não possuem placas de vídeo de última geração.",
    explanation:
      "GGUF (criado pelo llama.cpp) é o formato padrão que permite execução híbrida: parte do modelo na GPU (acelerado) e parte na CPU/RAM quando a VRAM não é suficiente. Isso torna modelos grandes viáveis em hardware modesto.",
    difficulty: "easy",
    topic: "Ferramentas e Formatos",
  },
  {
    id: 5,
    question:
      "Ao utilizar o LM Studio, qual critério é o mais importante para selecionar a 'quantização' correta para sua máquina?",
    options: [
      { id: "A", text: "O tamanho total da quantização deve ser menor que a VRAM disponível na sua GPU." },
      { id: "B", text: "Sempre escolher a maior quantização disponível para garantir velocidade máxima." },
      { id: "C", text: "O nível de quantização deve corresponder ao número de núcleos do seu processador." },
      { id: "D", text: "A quantização deve ser sempre de 16-bit para evitar erros de português." },
    ],
    correctAnswer: "A",
    hint: "Pense no limite físico de armazenamento temporário da sua placa gráfica.",
    explanation:
      "O modelo quantizado precisa caber na VRAM disponível para rodar acelerado na GPU. Exemplo: RTX 3060 com 12GB de VRAM → escolha quantizações que resultem em arquivo menor que 12GB (Q4_K_M de um 7B ocupa ~4.5GB, Q8 ocupa ~7GB).",
    difficulty: "easy",
    topic: "Hardware",
  },
  {
    id: 6,
    question:
      "Qual é a principal diferença funcional entre um modelo do tipo 'Thinking' (como o Qwen 4B Thinking) e um modelo comum?",
    options: [
      { id: "A", text: "O modelo 'Thinking' é capaz de ler as emoções do usuário através do texto." },
      { id: "B", text: "O modelo 'Thinking' não consome memória VRAM extra ao pensar." },
      { id: "C", text: "O modelo 'Thinking' responde instantaneamente sem qualquer latência." },
      { id: "D", text: "O modelo 'Thinking' gera uma cadeia de raciocínio interna antes de dar a resposta final." },
    ],
    correctAnswer: "D",
    hint: "Considere o termo 'Chain of Thought' (Cadeia de Pensamento) aplicado a modelos como o Qwen ou Gemma.",
    explanation:
      "Modelos Thinking usam Chain of Thought (CoT): antes de responder, o modelo 'pensa em voz alta' internamente, gerando tokens de raciocínio que não aparecem na resposta final. Isso melhora muito a qualidade em tarefas complexas, mas aumenta a latência. Por isso existe o parâmetro think=false para co-pilotos de terminal.",
    difficulty: "medium",
    topic: "Tipos de Modelos",
  },
  {
    id: 7,
    question:
      "Em sistemas Apple Silicon (Mac M1/M2/M3), o que caracteriza a 'Memória Unificada' no contexto de rodar IAs locais?",
    options: [
      { id: "A", text: "O sistema apaga todos os outros aplicativos para focar apenas no processamento da IA." },
      { id: "B", text: "A memória é fundida com o SSD para criar um espaço de armazenamento infinito." },
      { id: "C", text: "A memória só aceita modelos desenvolvidos diretamente pela Apple." },
      { id: "D", text: "A memória RAM é compartilhada dinamicamente entre o processador (CPU) e a placa gráfica (GPU)." },
    ],
    correctAnswer: "D",
    hint: "Pense na flexibilidade de alocação de recursos entre o processamento geral e o gráfico.",
    explanation:
      "A Memória Unificada do Apple Silicon elimina a distinção entre RAM e VRAM: toda a memória é acessível tanto pela CPU quanto pela GPU com altíssima largura de banda. Um Mac com 96GB pode usar todos os 96GB para carregar modelos, enquanto um PC com 96GB de RAM e uma GPU de 24GB só consegue usar 24GB para acelerar o modelo.",
    difficulty: "medium",
    topic: "Hardware",
  },
  {
    id: 8,
    question:
      "Por que é considerada uma boa prática utilizar o comando '/clear' ou reiniciar o chat ao mudar drasticamente de assunto em uma LLM local?",
    options: [
      { id: "A", text: "Para garantir que o modelo mude de idioma automaticamente." },
      { id: "B", text: "Porque modelos locais têm um limite de apenas 10 perguntas por dia." },
      { id: "C", text: "Para evitar que o arquivo do modelo no HD seja corrompido pelo excesso de texto." },
      { id: "D", text: "Para liberar o 'KV Cache' e evitar que o contexto antigo polua e atrase as novas respostas." },
    ],
    correctAnswer: "D",
    hint: "Considere o impacto do histórico da conversa na memória de trabalho da IA.",
    explanation:
      "O KV Cache (Key-Value Cache) armazena o contexto da conversa em memória. Quando fica cheio com assuntos irrelevantes para a pergunta atual, o modelo fica mais lento e tende a 'contaminar' novas respostas com contexto antigo. Limpar o contexto é uma forma de 'dieta de tokens' — tema do Módulo Avançado.",
    difficulty: "hard",
    topic: "Boas Práticas",
  },
  {
    id: 9,
    question:
      "Sobre o uso de 'Subagentes' em ferramentas de codificação como o Claude Code ou OpenCode, qual o principal benefício em termos de gestão de recursos?",
    options: [
      { id: "A", text: "Delegar tarefas extensas para manter o contexto do agente principal limpo e focado." },
      { id: "B", text: "Permitir que a IA escreva código sem precisar de nenhuma instrução do usuário." },
      { id: "C", text: "Aumentar a velocidade física da internet durante o download de bibliotecas." },
      { id: "D", text: "Substituir a necessidade de ter uma placa de vídeo dedicada." },
    ],
    correctAnswer: "A",
    hint: "Reflita sobre como evitar que informações excessivamente detalhadas 'estourem' a memória de contexto do modelo principal.",
    explanation:
      "Subagentes recebem tarefas delimitadas e retornam apenas o resultado para o agente principal. Isso mantém a janela de contexto do agente principal limpa e focada, evitando que detalhes de implementação 'poluam' o raciocínio de alto nível — essencial para projetos grandes.",
    difficulty: "hard",
    topic: "Agentes e Ferramentas",
  },
  {
    id: 10,
    question:
      "O modelo 'Gemma 4 12B' é descrito como um modelo 'Denso'. O que isso implica no seu uso prático comparado a um modelo de mesmo tamanho em MoE?",
    options: [
      { id: "A", text: "Ele exige metade da memória RAM necessária para modelos não-densos." },
      { id: "B", text: "Ele armazena todas as respostas em um banco de dados local para consulta futura." },
      { id: "C", text: "Ele processa todos os seus parâmetros a cada token gerado, sendo geralmente mais lento que um MoE." },
      { id: "D", text: "Ele é incapaz de entender imagens, focando apenas em texto puro." },
    ],
    correctAnswer: "C",
    hint: "Pense na diferença entre usar toda a força de uma equipe versus chamar apenas os especialistas necessários.",
    explanation:
      "Modelos densos ativam 100% dos parâmetros para cada token gerado — como mobilizar uma equipe inteira para cada tarefa. MoE ativa apenas os 'especialistas' relevantes. Por isso o Gemma 4 31B Dense (18 tok/s) é mais lento que o Gemma 4 26B MoE (66 tok/s), mesmo sendo similar em tamanho.",
    difficulty: "medium",
    topic: "Arquitetura de Modelos",
  },
  {
    id: 11,
    question:
      "Se você possui uma GPU com apenas 4 GB de VRAM, qual seria a estratégia recomendada para rodar um modelo como o Qwen 3.5 7B?",
    options: [
      { id: "A", text: "Aumentar a velocidade da ventoinha da GPU para que ela processe mais dados por segundo." },
      { id: "B", text: "Conectar dois pendrives na porta USB para servirem como memória de vídeo extra." },
      { id: "C", text: "Rodar o modelo em modo 'Thinking' para compensar a falta de memória." },
      { id: "D", text: "Utilizar uma quantização agressiva (ex: 3-bit ou 4-bit) e reduzir a janela de contexto." },
    ],
    correctAnswer: "D",
    hint: "Considere as técnicas de compressão de modelo e economia de memória de trabalho.",
    explanation:
      "Com 4GB de VRAM, a estratégia é: (1) usar quantização agressiva Q3 ou Q4 para reduzir o modelo ao máximo, (2) reduzir a janela de contexto (num_ctx) para economizar KV Cache. O Qwen 3.5 7B em Q4_K_M ocupa ~4.5GB — ficará na margem, mas pode rodar parcialmente com offload para RAM.",
    difficulty: "medium",
    topic: "Hardware",
  },
  {
    id: 12,
    question:
      "Qual é a função do arquivo 'CLAUDE.md' mencionado em ferramentas de agentes como o Claude Code?",
    options: [
      { id: "A", text: "Armazenar as chaves de API secretas de forma pública no GitHub." },
      { id: "B", text: "Funcionar como um instalador automático de drivers para GPUs da Nvidia." },
      { id: "C", text: "Criptografar o código fonte para que a IA não consiga lê-lo sem permissão." },
      { id: "D", text: "Fornecer diretrizes de projeto e regras de codificação que o agente deve seguir automaticamente." },
    ],
    correctAnswer: "D",
    hint: "Pense nele como um guia de conduta e estilo para o 'engenheiro virtual' que está trabalhando no seu código.",
    explanation:
      "O CLAUDE.md é lido automaticamente pelo Claude Code ao iniciar uma sessão. Nele você define: stack do projeto, convenções de código, regras de commit, o que o agente pode/não pode fazer, e contexto do projeto. É o equivalente a um onboarding para o 'engenheiro virtual'.",
    difficulty: "hard",
    topic: "Agentes e Ferramentas",
  },
  {
    id: 13,
    question:
      "O que caracteriza a capacidade de 'Tool Calling' (Chamada de Ferramentas) em modelos como o GLM-5 ou Qwen 3.6?",
    options: [
      { id: "A", text: "A capacidade da IA de consertar fisicamente problemas no hardware do computador." },
      { id: "B", text: "Um recurso que permite à IA baixar novos modelos de outros sites sem avisar o usuário." },
      { id: "C", text: "A função que traduz automaticamente o código de Python para Java." },
      { id: "D", text: "A habilidade do modelo de decidir usar comandos externos (como busca web ou scripts) para resolver um problema." },
    ],
    correctAnswer: "D",
    hint: "Lembre-se de quando a IA solicita rodar um comando no terminal para verificar o status de um serviço (como o Docker).",
    explanation:
      "Tool Calling permite que o modelo decida autonomamente chamar funções externas: buscar na web, executar scripts, consultar APIs, ler arquivos. O modelo recebe a definição das ferramentas disponíveis e decide quando e como usá-las para resolver o problema do usuário.",
    difficulty: "medium",
    topic: "Agentes e Ferramentas",
  },
  {
    id: 14,
    question:
      "Qual das seguintes ferramentas é mais indicada se você deseja uma interface gráfica amigável para 'navegar' por diferentes modelos no Hugging Face e testá-los com um clique?",
    options: [
      { id: "A", text: "Docker Desktop." },
      { id: "B", text: "LM Studio." },
      { id: "C", text: "Visual Studio Code." },
      { id: "D", text: "Ollama (apenas a instalação base)." },
    ],
    correctAnswer: "B",
    hint: "Pense em uma aplicação que se assemelha a uma 'loja de aplicativos' para modelos de inteligência artificial.",
    explanation:
      "LM Studio tem uma aba 'Discover' que funciona como uma app store para modelos: você busca por nome, vê detalhes (tamanho, VRAM necessária, quantizações disponíveis), baixa com um clique e testa diretamente na interface. Ollama sem interface adicional requer linha de comando para tudo.",
    difficulty: "easy",
    topic: "Ferramentas e Formatos",
  },
  {
    id: 15,
    question:
      "Sobre o setup de modelos locais para privacidade, qual afirmação é VERDADEIRA?",
    options: [
      { id: "A", text: "Modelos locais precisam de uma conexão constante com a internet para validar as licenças de uso." },
      { id: "B", text: "As empresas criadoras dos modelos (como Google ou Meta) recebem um relatório mensal do que você digitou." },
      { id: "C", text: "O processamento ocorre inteiramente na sua máquina e os dados não são enviados para servidores externos." },
      { id: "D", text: "A privacidade só é garantida se você usar apenas modelos com menos de 1 bilhão de parâmetros." },
    ],
    correctAnswer: "C",
    hint: "Considere a principal diferença entre usar o site da Anthropic e rodar um modelo via Ollama com o Wi-Fi desligado.",
    explanation:
      "Modelos locais processam 100% na sua máquina. Você pode rodar o Ollama com o Wi-Fi desligado e ele funciona normalmente — nenhum dado sai do seu computador. Isso é a vantagem fundamental para empresas com dados sensíveis, advogados, médicos, e qualquer pessoa que não queira alimentar os datasets das big techs.",
    difficulty: "easy",
    topic: "Privacidade e Segurança",
  },
];

// Configurações do Quiz
export const QUIZ_CONFIG = {
  productId: "ebook_llm_local",
  title: "Validação de Conhecimento: LLM Local",
  subtitle: "Construa Seu Próprio ChatGPT Particular",
  totalQuestions: 15,
  passingScore: 70, // 70% = 11/15 questões corretas
  xpReward: 100,
  badgeReward: "validador",
  certificateType: "ebook_completion",
  timeLimit: null, // Sem limite de tempo
};

// Distribuição por dificuldade
// Easy: Q2, Q4, Q5, Q14, Q15 (5 questões)
// Medium: Q1, Q3, Q6, Q7, Q10, Q11, Q13 (7 questões)
// Hard: Q8, Q9, Q12 (3 questões)

// Distribuição por tópico
// Arquitetura de Modelos: Q1, Q10
// Hardware: Q2, Q5, Q7, Q11
// Quantização: Q3
// Ferramentas e Formatos: Q4, Q14
// Tipos de Modelos: Q6
// Boas Práticas: Q8
// Agentes e Ferramentas: Q9, Q12, Q13
// Privacidade e Segurança: Q15
