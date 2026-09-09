### Case: o que a Oracle promete vs. o que realmente acontece ao tentar usar o Always Free

"Servidor Linux grátis para sempre" é a promessa do Always Free da Oracle Cloud — 1 OCPU e 6GB de RAM em ARM Ampere, sem cartão cobrado, sem prazo de validade. Este relatório documenta o que aconteceu de verdade ao tentar transformar essa promessa numa instância rodando, para hospedar um assistente de voz local. Não é teoria: são os bugs reais encontrados, as decisões técnicas tomadas no meio do caminho e os números medidos, nesta ordem.

## O bloqueio real: capacidade, não conta

A primeira tentativa de criar a instância `VM.Standard.A1.Flex` (o shape Ampere ARM do Always Free) na região de São Paulo devolveu `Out of host capacity`. Não é erro de configuração nem de cota da conta — é o pool físico de servidores Ampere daquela região esgotado, compartilhado entre todos os usuários free-tier. Não existe padrão de horário confiável para tentar de novo: a capacidade varia minuto a minuto, e relatos da comunidade mostram gente esperando dias em regiões disputadas como São Paulo.

## O bug do console que custou tempo real

Antes de aceitar que o problema era capacidade, foi preciso eliminar outra hipótese: o formulário de criação de instância do console web da Oracle tinha um bug — selecionar "Ubuntu" no seletor de imagem não aplicava a seleção. O formulário continuava mostrando Oracle Linux como imagem escolhida, mesmo com Ubuntu visualmente marcado. A causa só apareceu inspecionando o DOM da aplicação via JavaScript: o console roda inteiro dentro de um `iframe`, e a seleção de "publisher" (Ubuntu) é só um filtro — era preciso clicar na linha específica da versão (`Canonical Ubuntu 24.04`) dentro de uma tabela interna, não no cartão do publisher. Sem essa descoberta, qualquer tentativa de criação continuaria saindo com a imagem errada.

## Uma instância errada, criada por engano

No meio das tentativas, um subagente foi instruído a clicar em "Create" numa aba já configurada. Ele reportou sucesso — mas o nome da instância criada (`instance-20260907-2110`) era o padrão automático da Oracle, não o nome configurado, e o shape era `VM.Standard.E2.1.Micro` (AMD), não o Ampere pedido. A aba tinha perdido o estado do formulário antes do clique, e o subagente confiou no "sucesso" sem verificar se a configuração batia com o que era esperado. A instância errada foi identificada, confirmada via consulta direta à API (não pela interface) e terminada. A lição prática: delegar um clique de UI ambíguo a um agente sem visão completa do estado antes dele agir custa mais para corrigir do que executar com cuidado desde o início.

## A solução: sair do console, ir para a API

Depois desses dois obstáculos, a estratégia mudou: abandonar o clique no navegador e chamar a API da Oracle diretamente pelo SDK Python oficial (`oci`), com uma chave de API própria e um script de retry automatizado tentando criar a instância em loop. Isso eliminou tanto a fragilidade do console quanto a necessidade de supervisão manual — o script roda sozinho e só avisa quando termina (sucesso, erro real ou prazo esgotado).

## O limite de requisições que a velocidade não resolve

Rodando o retry a cada 60 segundos, o script ficou mais de 5 horas sem incidente. Numa tentativa de acelerar para 15 segundos, a Oracle respondeu com `HTTP 429 Too many requests` depois de 33 tentativas — cerca de 9 minutos. A causa não é intervalo curto demais entre chamadas: é um limite por **janela de requisições acumuladas** (modelo *token bucket*), não por velocidade instantânea. A própria documentação da Oracle recomenda backoff exponencial com teto de 60 segundos — ou seja, 60s não é um piso para reduzir, é o teto que a Oracle já considera seguro. Reduzir o intervalo não aumenta a chance de conseguir capacidade; só faz o rate limit aparecer mais cedo.

## O custo real medido, não estimado

Cada tentativa de criação que falha por falta de capacidade não gera nenhuma cobrança — é só uma chamada de API rejeitada, medida em ~1 a 2 segundos de latência ao longo de centenas de tentativas. Para comparar, a calculadora oficial de custos da Oracle foi usada para simular uma instância paga pequena (1 OCPU / 4GB, AMD) como alternativa temporária: **R$27,27 para 7 dias rodando em tempo integral**, com o volume de disco dentro da cota gratuita de 200GB. Um dado real da própria ferramenta da Oracle, não uma estimativa de terceiros.

## A saída de zero custo: a outra cota Always Free

Em vez de pagar, a alternativa encontrada foi criar uma instância `VM.Standard.E2.1.Micro` — o shape AMD que também é Always Free, mas com uma cota separada da do Ampere. As duas convivem sem conflito: o retry do Ampere continuou tentando em paralelo enquanto a instância AMD subiu, grátis, para servir de ambiente de teste imediato.

## O bug de rede que impedia o SSH

Com a instância AMD no ar, o acesso por SSH simplesmente não respondia — timeout de conexão. A causa não era firewall (a regra de porta 22 já estava liberada) nem o boot ainda em andamento: a tabela de rotas da subnet pública estava **vazia**. O Internet Gateway existia e estava habilitado, mas nenhuma regra apontava tráfego `0.0.0.0/0` para ele — um gap de infraestrutura que a criação da VCN, feita antes, tinha deixado incompleto. Adicionar a rota manualmente resolveu o acesso na hora, e a correção vale também para a instância Ampere, quando ela sair, porque usa a mesma rede.

## O que fica provado

Nenhum desses problemas era hipotético: cada um bloqueou o progresso até ser diagnosticado com evidência (inspeção de DOM, consulta direta à API, medição de latência, teste de conectividade), não suposição. O Always Free da Oracle entrega o que promete — mas "grátis" não significa "sem atrito": entre bug de console, rate limit mal-entendido e rede mal configurada, o caminho até uma instância funcional exigiu diagnosticar cada camada separadamente. É o tipo de conhecimento que só aparece tentando de verdade, não lendo a documentação.
