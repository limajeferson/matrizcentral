### Tutorial: como criar sua VPS Always Free na Oracle sem cair nos mesmos buracos

Este tutorial segue o caminho de sucesso — os passos que funcionam. Mas cada passo abaixo existe porque um deles falhou primeiro, numa tentativa real (relatada em detalhe no case desta mesma biblioteca). Se você pular direto para "como fazer certo", ainda vale saber por que cada instrução existe: é o que evita repetir o mesmo erro.

## Mapa dos 4 obstáculos reais, causa e correção

| Obstáculo | O que parecia ser | Causa real | Correção |
| --- | --- | --- | --- |
| Formulário não aplicava a imagem escolhida | Erro de clique / navegador | O console roda dentro de um iframe; o clique no logo do publisher só filtra, não seleciona a versão | Clicar na linha exata da versão numa tabela interna, não no cartão do publisher |
| "Out of host capacity" ao criar a instância ARM | Erro de configuração da conta | Pool físico de servidores da região esgotado, sem relação com a conta | Retry automatizado, sem tentar "consertar" a configuração |
| HTTP 429 ao acelerar o retry para 15 segundos | Servidor da Oracle instável | Limite de requisições por janela de tempo acumulada, não por velocidade instantânea | Manter o intervalo em 60 segundos (o teto que a própria Oracle recomenda) |
| SSH não conectava numa instância já "Running" | Firewall bloqueando a porta 22 | Tabela de rotas da subnet pública vazia — sem regra apontando para o Internet Gateway | Adicionar a rota `0.0.0.0/0` para o Internet Gateway antes de suspeitar de firewall |

## Passo 1 — Escolha a imagem certa, clicando no lugar certo

No console da Oracle, ao criar a instância, clicar no cartão do sistema operacional (ex.: "Ubuntu") só filtra a lista de imagens disponíveis — não seleciona nenhuma delas. É preciso rolar até a tabela abaixo do filtro e clicar na linha da versão exata que você quer (ex.: "Canonical Ubuntu 24.04"). Antes de avançar, confirme no resumo da revisão final que o sistema operacional mostrado bate com o que você escolheu — o formulário não avisa quando isso diverge.

## Passo 2 — Configure o shape Always Free corretamente

Para a instância gratuita "de verdade" (Ampere ARM), o shape é `VM.Standard.A1.Flex`, com até 4 OCPUs e 24 GB de RAM disponíveis no total da conta (verifique o limite atual na sua região, a Oracle já reduziu essa cota antes). Existe também uma segunda cota Always Free independente, em AMD (`VM.Standard.E2.1.Micro`) — as duas convivem sem conflito, e vale usar a AMD como ambiente de teste enquanto a ARM não sai.

## Passo 3 — Se aparecer "Out of host capacity", não mude a configuração

Esse erro não tem relação com como você preencheu o formulário. É esgotamento temporário do pool físico da região, compartilhado entre todos os usuários do plano gratuito. A resposta certa é automatizar a tentativa (via API/SDK, não ficando clicando manualmente), não reconfigurar a instância.

## Passo 4 — Configure o retry com intervalo de 60 segundos, nunca menos

Se você automatizar a tentativa, resista à tentação de acelerar o intervalo. A Oracle recomenda oficialmente um backoff de até 60 segundos como teto seguro — e testes reais confirmam: intervalos menores (ex.: 15 segundos) esbarram num limite de requisições por volume acumulado em poucos minutos, sem aumentar a chance real de conseguir capacidade.

## Passo 5 — Depois que a instância subir, verifique a rota antes do firewall

Se o SSH não conectar mesmo com a instância em estado "Running", confira a tabela de rotas da subnet pública antes de mexer em regras de firewall. Ela precisa ter uma regra `0.0.0.0/0` apontando para o Internet Gateway da VCN. Sem essa rota, nenhum tráfego de entrada ou saída chega à instância, independente de qualquer configuração de porta liberada.

## Resumo prático

Nenhum desses quatro passos é intuitivo a partir da documentação oficial — todos vieram de diagnosticar um problema real até a causa raiz. Seguir essa ordem evita repetir o mesmo tempo perdido: confirme a imagem antes de criar, não brigue com o erro de capacidade, mantenha o retry em 60 segundos, e verifique a rota antes do firewall.
