# O que "grátis para sempre" não conta: nossa jornada até uma VPS Always Free

Quando decidimos hospedar o assistente de voz do nosso case em uma VPS Oracle Cloud Always Free, a expectativa era simples: preencher um formulário, esperar alguns minutos, e ter um servidor Linux rodando sem custo. Não foi assim. Registramos aqui o processo real — inclusive as partes em que erramos — porque é isso que diferencia "ler sobre" de "ter tentado".

## O primeiro obstáculo pareceu ser bug de configuração. Era falta de capacidade

A primeira tentativa de criar a instância Ampere ARM (o shape gratuito de verdade, mais potente que o AMD básico) voltou com "Out of host capacity". Nossa primeira suposição foi errada: achamos que tínhamos configurado algo errado. Não tínhamos — é o pool físico de servidores da região esgotado, compartilhado entre todo mundo que pediu o mesmo recurso grátis. Não existe horário mágico para tentar de novo; a capacidade varia minuto a minuto.

## Descobrimos um bug real no console, não no nosso processo

Antes de aceitar "é só esperar", fomos atrás de outra explicação: o formulário de criação de instância da Oracle tinha um bug de verdade. Selecionar "Ubuntu" como sistema operacional simplesmente não aplicava — o formulário continuava marcando outra distribuição por baixo, mesmo com Ubuntu destacado na tela. Só entendemos o porquê inspecionando o código da página: a aplicação roda inteira dentro de um "quadro" escondido (iframe), e clicar no logo do Ubuntu só filtra a lista — era preciso clicar na linha exata da versão numa tabela mais abaixo. Sem essa descoberta, toda tentativa continuaria saindo errada, silenciosamente.

## Delegamos um passo simples e ele deu errado

No meio do processo, pedimos a um assistente automatizado que clicasse em "Criar" numa tela que já estava configurada. Ele reportou sucesso. Só que a instância criada tinha o nome padrão da Oracle, não o nome que tínhamos definido — e o tipo de servidor também estava errado. A aba tinha perdido a configuração antes do clique, e ninguém verificou se o resultado batia com o esperado antes de comemorar. Corrigimos apagando a instância errada e mudando a forma como delegamos esse tipo de passo: nunca mais um clique de interface sem confirmar o estado antes de agir.

## Tentamos ir mais rápido, e isso nos custou tempo

Depois de decidir tentar criar a instância repetidamente até dar certo, a pergunta óbvia foi: com que frequência? Testamos a cada 15 segundos. Em nove minutos, a Oracle começou a recusar as chamadas por excesso de requisições. Intuitivamente, "mais rápido" parecia melhor — mas o limite não é de velocidade, é de volume acumulado numa janela de tempo. Voltamos para um intervalo de 60 segundos, que a própria documentação da Oracle já recomendava como teto seguro, e o processo rodou horas sem problema.

## Quando finalmente subiu, nada conversava com a internet

Conseguimos criar uma instância AMD grátis (uma cota separada, que não disputa com a ARM) para testar enquanto a tentativa da instância principal continuava em segundo plano. Ela subiu, mas o acesso remoto simplesmente não respondia. Não era firewall — já tínhamos conferido isso. Era a tabela de rotas da rede: o portão de saída para a internet existia, mas nenhuma regra apontava tráfego para ele. Um detalhe de configuração de rede que passou despercebido lá atrás, e que só um teste de conexão real revelou.

## O que essa jornada ensina

Nenhum desses problemas estava documentado de forma óbvia antes de aparecer. Cada um exigiu parar, desconfiar da explicação mais fácil e confirmar com evidência — não com suposição. "Grátis para sempre" descreve o preço, não o caminho até lá. O relato técnico completo, com os números medidos em cada etapa, está no relatório da Matriz Central sobre esse case.
