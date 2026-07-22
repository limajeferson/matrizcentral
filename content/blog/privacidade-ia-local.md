# Privacidade em IA: o que muda quando os dados não saem da sua máquina

Todo prompt digitado numa IA na nuvem vira tráfego de rede: sai do seu
computador, passa por servidores de terceiros e, dependendo do contrato de
uso, pode ser guardado, revisado por humanos ou usado para treinar versões
futuras do modelo. Para conversas triviais isso raramente importa. Para
outras, importa muito.

## Quando o dado é sensível de verdade

Existem categorias de informação em que enviar o conteúdo para fora da sua
máquina não é só um detalhe técnico, é um risco concreto:

- Documentos jurídicos com nomes, processos e cláusulas de contrato
- Anotações de saúde, sintomas ou resultados de exames
- Planilhas financeiras, folha de pagamento ou dados de clientes
- Código-fonte proprietário e segredos de negócio

Em todos esses casos, a pergunta não é "esse serviço é confiável", é "por que
esse dado precisa sair da minha máquina para eu ter uma resposta". Rodando um
modelo localmente, a resposta é simples: não precisa.

## LGPD e a cadeia de responsabilidade

A Lei Geral de Proteção de Dados trata dado pessoal como algo que continua
sob responsabilidade de quem o coletou, mesmo depois de repassado a um
fornecedor. Usar uma IA na nuvem para processar dado de cliente, paciente ou
funcionário significa formalizar esse repasse: mapear o fornecedor, entender
onde o dado é processado e garantir que o uso está coberto por uma base
legal. É trabalho de conformidade que existe mesmo quando o serviço é sério
e bem-intencionado.

Com um modelo rodando localmente, esse elo da cadeia simplesmente não existe.
O dado entra, é processado no próprio disco e não sai da máquina. Não há
terceiro para mapear, porque não há terceiro no meio.

## Profissões que já sentem esse peso

Advogados que lidam com processos sigilosos, profissionais de saúde que
anotam evolução de paciente, contadores com acesso a dados financeiros de
clientes — todos esses trabalham com informação que tem dever de sigilo
profissional, muitas vezes reforçado por lei ou código de ética da própria
categoria. Colar um trecho de processo ou um resumo de prontuário numa IA na
nuvem pode configurar quebra desse sigilo, independentemente da intenção.

A IA local remove esse dilema: o profissional pode usar a ferramenta com a
mesma liberdade de quem consulta suas próprias anotações em papel, porque a
informação nunca deixa o ambiente sob seu controle.

## Privacidade não é para quem "tem algo a esconder"

Vale repetir um ponto que costuma ser mal-entendido: preferir manter dados
sob controle próprio não é sinal de que existe algo ilícito ali. É a mesma
lógica de fechar a porta de casa ou não deixar documentos abertos em cima da
mesa. Rascunhos de trabalho, ideias ainda não lançadas, dúvidas pessoais de
saúde — tudo isso é informação que faz sentido manter privada por padrão, não
por exceção.

## O que rodar localmente resolve — e o que não resolve

É importante ser direto sobre os limites: rodar um modelo local elimina o
risco de o dado trafegar para um servidor de terceiros e ficar sujeito à
política de uso de outra empresa. Isso não substitui boas práticas básicas de
segurança do próprio computador, como manter o sistema atualizado e proteger
o acesso físico à máquina. A IA local resolve o elo mais frágil da cadeia —
o envio para fora — não todos os elos.

## Privacidade como característica, não como concessão

O ponto central é este: privacidade não deveria ser um recurso premium
escondido atrás de um plano corporativo caro, nem uma promessa de política
de uso que muda com o tempo. Com processamento local, ela é uma consequência
direta de como o sistema funciona — o dado fica onde você está.

Se você lida com informação sensível no dia a dia, seja em processos
jurídicos, prontuários, planilhas de cliente ou qualquer outro material que
não deveria circular fora do seu controle, vale conhecer como montar esse
tipo de fluxo de trabalho. Para quem quer sair do zero com um roadmap
prático de configuração, a Matriz Central reúne esse caminho em um único
lugar, sem mensalidade.
