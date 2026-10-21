---
name: teste-exploratorio
description: Roda testes exploratórios com personas de usuários comuns no sistema do repositório atual. Prepara e sobe o ambiente local, solta agentes-persona que usam só a interface (sem ler código), verifica cada achado reproduzindo-o também do jeito comum, faz a triagem contra a especificação e os bugs conhecidos e entrega um relatório que separa BUG, DÚVIDA, SUGESTÃO e RETIRADO. Use quando pedirem "teste exploratório", "testar como usuário", "rodar as personas" ou /teste-exploratorio.
argument-hint: "[preparar | rodar | relatorio] [modulo=...] [personas=...] [modo=economico|padrao]"
---

# Teste exploratório com personas

Pipeline em 6 etapas. Você (sessão principal) é o **orquestrador**: pode ler o código, a
especificação e os testes, mas nunca passa nada disso para os agentes-persona. O valor do teste vem
de a persona NÃO saber como o sistema funciona por dentro.

**O que este pipeline entrega:** atrito de uso (SUGESTÃO) e os bugs que uma pessoa comum encontra
sem precisar conhecer a regra (BUG). Bugs de conformidade com a regra de negócio ("deveria mostrar o
assento") vêm dos testes guiados pela especificação; aqui a especificação serve para **não** chamar
de bug o que é intencional.

**Critério de bug (decisão do dono do pipeline, não discutir):** é BUG só o que uma pessoa real,
fazendo do jeito comum, encontra com o sistema **mostrando ou fazendo algo errado**. Não é bug:
gesto incomum, efeito de recurso simulado, falta de confirmação, rótulo, texto, acabamento, regra
validada da spec, comportamento intencional confirmado pelo dev, números certos em bases diferentes.
**É bug:** layout quebrado no caminho comum (ex.: menu cortado que obriga a rolar para achar a ação).

Arquivos de apoio desta skill (leia quando a etapa pedir):
- `personas.md`: base de conhecimento para montar personas e as 3 personas padrão.
- `missoes-e-tours.md`: como escrever missões viáveis, tours, cobertura de telas e o catálogo
  "dados como as pessoas digitam".
- `triagem.md`: a árvore de decisão BUG / DÚVIDA / SUGESTÃO / RETIRADO e a tabela de severidade.
- `formato.md`: formato dos achados, do relatório e do histórico.
- `varredura-layout.mjs`: script que abre todos os menus de ação das telas e mede corte e rolagem.
- `PESQUISA.md`: fundamentos e fontes.

Estado do produto fica no repositório, em `.exploratorio/`:

```
.exploratorio/
  config.md               # subir/derrubar, URLs, usuários por papel, limites, recursos simulados, valores de teste
  mapa-do-produto.md      # módulos, telas e tarefas em linguagem de usuário, com o papel que faz cada uma
  conhecimento/           # base da triagem (nunca vai para a persona)
    fontes.md             #   onde estão a spec, a matriz de papéis e os bugs conhecidos
    bugs-conhecidos.md    #   bugs abertos dos testes automatizados (ID, regra, tela, sintoma)
    decisoes.md           #   decisões humanas anteriores ("intencional", "não é bug", "é bug")
  personas.md · missoes.md · historico.md
  capturas/               # saída do navegador dos agentes (esvaziada a cada execução)
  execucoes/<AAAA-MM-DD-HHMM>/
    plano.md  prompts/  achados-<persona>.md  verificacao.md  layout/  relatorio.md  evidencias/  bruto/
```

Argumentos: `preparar` força a etapa 1 de novo; `rodar` pula direto para a etapa 2 (exige `config.md`);
`relatorio` só refaz a etapa 6 da última execução. Sem argumento: etapas 1 (se faltar config) a 6.
`modo=economico` usa Haiku nas personas. **Nunca comece uma execução (etapa 3) sem o usuário pedir.**

---

## Etapa 1 · Preparar (só na primeira vez ou com `preparar`)

Delegue ao agente **`exploratorio-preparador`**: "Prepare o ambiente de teste exploratório deste
repositório e gere os arquivos em .exploratorio/". Ele também monta `conhecimento/` (spec, matriz de
papéis, bugs conhecidos dos testes automatizados).

Ao voltar, confira e mostre ao usuário em poucas linhas: como sobe, URL, usuários, o que está
**indisponível**, os **recursos simulados** (com o parâmetro de realismo), os **valores de teste
conhecidos** e a lista de dados prometidos com a marca ✓ de validação. Peça confirmação antes da
primeira execução se algo toca fora da máquina. Nunca rode contra produção.

Depois, com base em `mapa-do-produto.md`, na matriz de papéis e em `personas.md` desta skill, escreva
`.exploratorio/personas.md` e `.exploratorio/missoes.md` seguindo `missoes-e-tours.md`. Toda missão
passa pelo **teste de viabilidade** (papel tem o caminho na navegação? esbarra em regra de segurança
do agente? o dado existe?) antes de entrar no arquivo.

## Etapa 2 · Subir o ambiente e planejar a execução

1. Suba o ambiente com os comandos de `config.md` e rode o health check. Se falhar, chame o preparador.
2. Rode a **checagem de dados prometidos** do `config.md` (o preparador deixou o comando). Missão que
   depende de dado que não passou fica fora do plano.
3. Escreva `execucoes/<id>/plano.md` com:
   - a matriz persona × missões (máx. ~6 missões + 1 tour por sessão);
   - a **matriz de cobertura tela × sessão**: toda tela do escopo no `mapa-do-produto.md` precisa de
     ao menos uma sessão que passe por ela (missão ou tour). O "coletor de lixo" é dividido entre as
     sessões para cobrir as telas que sobrarem;
   - a lista de **campos de risco** do escopo (ver `missoes-e-tours.md`): todo campo que move dinheiro
     ou dado sensível, com a sessão que passa nele com o catálogo de dados ruins. Nenhum fica de fora;
   - as **liberações por sessão**: se o ambiente é simulado (pagamento de teste, e-mail local), a
     sessão recebe a liberação explícita ("neste ambiente você pode confirmar pagamento e envio de
     e-mail"); sem isso, missões que pagam ou enviam algo para fora não entram;
   - o `--max-turns` de cada sessão (padrão 150; sessão com tour de dados ruins: 120);
   - os dados únicos de cada sessão (e-mails, CPF/CNPJ diferentes por persona).
4. Mostre o plano ao usuário em poucas linhas e espere ele mandar rodar.

## Etapa 3 · Explorar (agentes-persona em paralelo)

O prompt de cada persona contém SOMENTE: o cartão da persona; acesso (URL, e-mail, senha, tela);
prefixo de dados e ids; as missões em linguagem de usuário; o tour (com as telas que ele cobre); as
liberações da sessão; e, se houver, a frase em linguagem de usuário sobre valores de teste ("o saldo
grande da conta é de teste, não precisa conferir"). **Proibido:** nomes de arquivos, rotas internas
além da URL inicial, componentes, regras de validação, conteúdo da spec, bugs conhecidos, dicas.

Lance cada persona num processo próprio, em background, com os prompts gravados em `prompts/`:

```
claude -p --agent exploratorio-persona --model <sonnet|haiku> --max-turns <n> \
  --allowedTools "mcp__navegador__*" --output-format json < prompts/<persona>.md > saida-<persona>.json
```

Paralelo até o `paralelismo` do `config.md` (padrão 3). O `result` do JSON vira
`achados-<persona>.md`; `total_cost_usd` e `session_id` vão para a medição de consumo. Sessões que
precisam de navegador especial (câmera falsa, geolocalização) usam a variante descrita em
`config.md`, com `--agents '<json>'` definindo o mesmo agente com outro `mcpServers`.

Na primeira execução num projeto, a permissão `mcp__navegador__*` é concedida só na linha de
comando (`--allowedTools`), sem mexer nas configurações do usuário.

## Etapa 3b · Varredura de layout (determinística, sem LLM)

Em paralelo às personas, rode `varredura-layout.mjs` (ver o cabeçalho do script) em todas as telas
de `conhecimento/telas.md`, com a sessão salva de cada papel (`ambiente/estado-<papel>.json`) e nos
tamanhos de tela das personas. Rode a partir da raiz do produto (usa o Playwright instalado lá). Ele abre cada menu de
ação, seletor e calendário, e marca o que fica cortado, com rolagem interna ou fora da tela. Cada
marca vira um achado candidato a BUG de layout (vai para a verificação como os outros). A saída fica
em `execucoes/<id>/layout/`.

## Etapa 4 · Verificar (cortar falso positivo)

Para cada achado BLOQUEIA, ATRAPALHA, DÚVIDA ou de layout, lance o **`exploratorio-verificador`**
(até 5 achados do mesmo módulo por processo). O prompt do verificador traz, por achado: os passos
exatos, os valores digitados, o "como digitou/editou", o tamanho de tela e o usuário. **Não traz o
título, a conclusão nem o impacto da persona**: ele descreve o que acontece, e quem compara é você.

Ele reproduz do jeito da persona e do **jeito comum**, confere diálogos do navegador e recursos
simulados, e devolve uma das classes de `formato.md`. Achados INCOMODA entram sem verificação,
marcados "não verificado". Ações destrutivas usam os dados descartáveis `EXPL-VERIF` do `config.md`.
Grave tudo em `execucoes/<id>/verificacao.md`.

## Etapa 5 · Triagem (aqui o código e a spec podem ser lidos)

Siga `triagem.md` à risca, achado por achado, na ordem da árvore. Em resumo:

1. Junte achados iguais entre personas e com a varredura de layout.
2. Passe cada um pela árvore: artefato do ambiente/ferramenta → bug conhecido → decisão anterior →
   spec → classe de bug → "papel X não consegue Y" → resto. Cada passo deixa registrada a fonte
   (linha do `config.md`, ID do bug conhecido, linha de `decisoes.md`, ID da regra).
3. Só BUG recebe severidade, pela tabela de `triagem.md`. **ALTA** só depois do portão de ALTA.
   Valor de dinheiro interpretado diferente do digitado, num formato comum (ponto ou vírgula decimal),
   é BUG ALTA. Confirmação de operação que tira dinheiro sem mostrar valor e destino nunca é INCOMODA:
   entra como risco (ver `triagem.md`).
4. Para BUG e DÚVIDA, localize no código a causa provável (`arquivo:linha`). Para economizar, delegue
   a busca a um subagente Sonnet por grupo de achados e só leia os trechos que ele apontar.
5. Compare com `historico.md`: NOVO, RECORRENTE ou CORRIGIDO.

## Etapa 6 · Relatório, aprendizado e limpeza

1. Organize as capturas: os prints usados vão para `execucoes/<id>/evidencias/`; o resto de
   `capturas/` (snapshots `.yml`, logs, downloads, prints de passagem) vai para `bruto/`.
2. Escreva `relatorio.md` no formato de `formato.md`, com seções separadas: **BUGS** (os únicos
   contados por severidade), **DÚVIDAS para o dev/PO** (perguntas de sim ou não), **SUGESTÕES** (sem
   severidade), **RETIRADOS** (uma linha cada, com o motivo e a fonte), **cobertura de telas**
   (incluindo as não visitadas e o motivo), **campos de risco** (cobertos e não cobertos), **missões** (com o motivo de cada desistência:
   SISTEMA / AMBIENTE / CENÁRIO DO TESTE) e **consumo**.
3. Meça o consumo com `medir-tokens.py` e com o `total_cost_usd` de cada processo `claude -p`; no
   histórico, registre o custo total e o custo por BUG.
4. Atualize `historico.md` com o destino de cada achado.
5. **Aprendizado:** quando o usuário (ou o dev/PO) responder às DÚVIDAS ou revisar o relatório,
   registre cada decisão em `conhecimento/decisoes.md` (data, commit, achado, decisão, quem, motivo).
   A triagem da próxima execução aplica essas decisões sozinha.
6. Limpe os dados `EXPL-` pelo comando do `config.md` e derrube o ambiente se o `config.md` mandar.
7. Responda ao usuário em até 12 linhas: bugs por severidade, dúvidas abertas, nº de sugestões e
   retirados, telas não visitadas, custo total e caminho do relatório.

---

## Modelos e custo

| Papel | Agente | Modelo | Por quê |
|---|---|---|---|
| Orquestrador e triagem | sessão principal (de preferência uma sessão nova por execução) | o da sessão (Opus) | árvore de triagem, spec, código |
| Preparar ambiente | `exploratorio-preparador` | `inherit` | engenharia (docker, seed, scripts) |
| Persona | `exploratorio-persona` | `sonnet` (padrão) · `haiku` em `modo=economico` | é o que mais gasta tokens |
| Verificar | `exploratorio-verificador` | `sonnet` | reprodução precisa |
| Buscar causa no código | subagente | `sonnet` | leitura extensa, decisão simples |

Abrir uma sessão nova para cada execução (`/clear` ou `claude -p "/teste-exploratorio rodar"`) evita
pagar o histórico de conversa em toda chamada da orquestração. Preços por milhão de tokens
(entrada/saída): Haiku 5.5 US$ 0,10/0,50 · Sonnet 5.5 US$ 2/10 · Opus 5.5 US$ 4/20.
