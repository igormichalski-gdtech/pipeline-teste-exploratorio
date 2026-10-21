---
name: teste-exploratorio
description: Roda testes exploratórios com personas de usuários comuns no sistema do repositório atual. Prepara e sobe o ambiente local, solta agentes-persona que usam só a interface (sem ler código), verifica cada achado reproduzindo-o e entrega um relatório de bugs com as capturas junto de cada achado. Use quando pedirem "teste exploratório", "testar como usuário", "rodar as personas" ou /teste-exploratorio.
argument-hint: "[preparar | rodar | relatorio] [modulo=...] [personas=...] [modo=economico|padrao]"
---

# Teste exploratório com personas

Pipeline em 6 etapas. Você (sessão principal) é o **orquestrador**: pode ler o código,
mas nunca passa detalhes técnicos para os agentes-persona. O valor do teste vem de a
persona NÃO saber como o sistema funciona por dentro.

Arquivos de apoio desta skill (leia quando a etapa pedir):
- `personas.md` — base de conhecimento para montar personas (facetas, níveis de habilidade, o que sabem e não sabem) e as 3 personas padrão.
- `missoes-e-tours.md` — como escrever missões, tours exploratórios e o catálogo "dados como as pessoas digitam".
- `formato.md` — formato dos achados, do relatório e do histórico.
- `PESQUISA.md` — fundamentos e fontes (para justificar decisões; não precisa ler para rodar).

Estado do produto fica no repositório, em `.exploratorio/`:

```
.exploratorio/
  config.md               # como subir/derrubar o ambiente, URLs, usuários por papel, limites (gerado na etapa 1)
  mapa-do-produto.md      # módulos e tarefas em linguagem de usuário (sem termos técnicos)
  personas.md             # personas escolhidas para ESTE produto
  missoes.md              # banco de missões por módulo
  historico.md            # uma linha por execução + status de cada achado ao longo do tempo
  capturas/               # saída do navegador dos agentes (prints)
  execucoes/<AAAA-MM-DD-HHMM>/
    plano.md  achados-<persona>.md  verificacao.md  relatorio.md
```

Argumentos: `preparar` força a etapa 1 de novo; `rodar` pula direto para a etapa 2 (exige `config.md`);
`relatorio` só refaz a etapa 6 da última execução. Sem argumento: etapas 1 (se faltar config) a 6.
`modo=economico` usa Haiku nos exploradores (ver "Modelos e custo").

---

## Etapa 1 · Preparar o ambiente (só na primeira vez ou com `preparar`)

Delegue ao agente **`exploratorio-preparador`** (ele lê o código e sobe tudo). Passe:
"Prepare o ambiente de teste exploratório deste repositório e gere os arquivos em .exploratorio/".

Ao voltar, confira `.exploratorio/config.md` e mostre ao usuário, em poucas linhas: como o ambiente
sobe, URL, usuários criados, serviços externos desligados e qualquer pendência. **Peça confirmação
antes da primeira execução** se o preparador apontou algo que toca fora da máquina (serviços reais,
banco que não é local, credenciais de produção). Nunca rode contra produção.

Depois, com base em `mapa-do-produto.md` e em `personas.md` desta skill, escreva:
- `.exploratorio/personas.md`: as personas deste produto (adapte as 3 padrão ao público real do
  sistema; mantenha a estrutura "sabe / não sabe / comportamento").
- `.exploratorio/missoes.md`: 3 a 6 missões por módulo, seguindo `missoes-e-tours.md`.

## Etapa 2 · Subir o ambiente e planejar a execução

1. Suba o ambiente com os comandos de `config.md` (em background quando forem servidores) e faça o
   health check descrito lá. Se falhar, chame o `exploratorio-preparador` para consertar.
2. Crie `.exploratorio/execucoes/<AAAA-MM-DD-HHMM>/plano.md` com a matriz persona × missões.
   Padrão: todas as personas do produto; para cada uma, as missões do módulo pedido (ou as 2 mais
   importantes de cada módulo, priorizando onde o histórico tem achados abertos e o que mudou no
   `git log` desde a última execução). Cada sessão de persona: no máximo ~6 missões + 1 tour livre.
3. Cada persona usa um usuário próprio do `config.md` (evita conflito de dados e de limite de taxa)
   e um prefixo de dados próprio, ex.: `EXPL-CARLA `.

## Etapa 3 · Explorar (agentes-persona em paralelo)

Para cada linha do plano, lance o agente **`exploratorio-persona`** (paralelo até o limite
`paralelismo` do `config.md`; padrão 3). O prompt de cada um contém SOMENTE:

- o cartão da persona (copiado de `.exploratorio/personas.md`);
- acesso: URL inicial, e-mail e senha, tamanho de tela;
- o prefixo de dados e o id de execução + slug da persona (para nomear os prints);
- as missões em linguagem de usuário, exatamente como em `missoes.md`;
- o tempo do tour livre e o módulo.

**Proibido no prompt da persona:** nomes de arquivos, rotas internas além da URL inicial, nomes de
componentes, regras de validação, bugs já conhecidos, "dicas" de como fazer. Se você souber que algo
está quebrado, NÃO conte; o teste é ver se a persona tropeça.

Salve o retorno de cada agente em `execucoes/<id>/achados-<persona>.md`.

**Como lançar (recomendado):** grave cada prompt em `execucoes/<id>/prompts/<persona>.md` e rode cada
persona num processo próprio, em background:
`claude -p --agent exploratorio-persona --model <sonnet|haiku> --allowedTools "mcp__navegador__*" --output-format json < prompts/<persona>.md > saida-<persona>.json`
(o mesmo para o `exploratorio-verificador`). Vantagens: lê a definição atual do agente (a sessão não
recarrega agentes editados), a permissão do navegador vale só para esse processo e o JSON traz
`total_cost_usd` e `session_id` para a medição de consumo. O `result` do JSON é o texto dos achados.

Na primeira execução num projeto, o Claude Code pede permissão para as ferramentas
`mcp__navegador__*`. Avise o usuário para escolher "sempre permitir neste projeto" (ou adicionar
`"mcp__navegador__*"` em `permissions.allow`); sem isso, agentes em paralelo ficam parados esperando.
O navegador dos agentes não abre `file://`, então a persona não consegue ler o código por ele.

## Etapa 4 · Verificar (cortar falso positivo)

Agentes de navegador erram por não esperar carregamento e por "achar" bugs (WebTestBench, ver
`PESQUISA.md`). Para cada achado BLOQUEIA, ATRAPALHA ou DÚVIDA, lance o agente
**`exploratorio-verificador`** com o passo a passo exato e os valores digitados (pode agrupar até 5
achados do mesmo módulo por agente). Ele reproduz duas vezes e devolve: CONFIRMADO, INTERMITENTE ou
NÃO REPRODUZIDO, com prints e, se houver, erros de console/rede. Achados INCOMODA entram sem
verificação, marcados "não verificado". Grave em `execucoes/<id>/verificacao.md`.

## Etapa 5 · Triagem (aqui o código pode ser lido)

Você mesmo, sem delegar:
1. Junte achados iguais vistos por personas diferentes (conta como mais forte: "visto por 2 de 3").
2. Descarte NÃO REPRODUZIDO (liste no fim do relatório, uma linha cada).
3. Para cada achado, encontre no código a causa provável e o `arquivo:linha`. Classifique o tipo:
   **bug** (comportamento errado), **regra ruim para o usuário** (funciona como programado, mas a
   regra atrapalha; ex.: exigir `https://`), **texto/rótulo**, **layout**, **falta de recurso**.
4. Severidade final: ALTA (bloqueia tarefa comum ou perde/expõe dado), MÉDIA (atrapalha tarefa comum
   ou bloqueia tarefa rara), BAIXA (incomoda). Leve em conta quantas personas tropeçaram.
5. Compare com `historico.md`: NOVO, RECORRENTE (ainda aberto) ou CORRIGIDO (estava lá, sumiu).

## Etapa 6 · Relatório e limpeza

1. Organize as capturas: mova para `execucoes/<id>/evidencias/` só os prints que vão no relatório e
   o resto de `.exploratorio/capturas/` (snapshots `.yml` da página, logs de console, downloads e
   prints de passagem) para `execucoes/<id>/bruto/`. `capturas/` fica vazia para a próxima execução;
   `bruto/` pode ser apagada depois da triagem.
   Escreva `execucoes/<id>/relatorio.md` no formato de `formato.md`, com as imagens apontando para
   `evidencias/`: só achados, cada um com seus prints logo abaixo dele, ordenados por severidade. Nada de "prova de que rodou" além da tabela de
   missões (que é dado: mostra onde as personas desistiram).
2. Meça o consumo: anote o horário de início da execução (etapa 2) e, ao final, rode
   `python3 -I ~/.claude/skills/teste-exploratorio/medir-tokens.py --desde <início ISO> orquestrador=<jsonl da sessão> <agente>=<jsonl do subagente> ...`
   (as transcrições ficam em `~/.claude/projects/<projeto>/<sessão>.jsonl` e `.../<sessão>/subagents/agent-<id>.jsonl`).
   Cole a tabela no fim do relatório, em "Consumo", e acrescente no histórico o custo total e o custo
   por achado confirmado.
3. Atualize `historico.md`.
4. Apague os dados criados (prefixos `EXPL-`) pela interface ou pelo comando de limpeza do
   `config.md`, e derrube o ambiente se o `config.md` mandar.
5. Responda ao usuário em até 12 linhas: personas × missões concluídas/desistidas, achados por
   severidade, os 3 mais importantes, custo total, caminho do relatório. Ofereça gerar PDF/HTML se fizer sentido.

---

## Modelos e custo

| Papel | Agente | Modelo | Por quê |
|---|---|---|---|
| Orquestrador e triagem | sessão principal | o da sessão (Opus) | lê código, junta achados, decide severidade |
| Preparar ambiente | `exploratorio-preparador` | `inherit` | trabalho de engenharia (docker, migração, seed) |
| Persona | `exploratorio-persona` | `sonnet` (padrão) · `haiku` em `modo=economico` | é o que mais gasta tokens; precisa de bom julgamento visual |
| Verificar | `exploratorio-verificador` | `sonnet` | reprodução precisa, evita falso positivo |

Em `modo=economico`, passe `model: haiku` ao lançar `exploratorio-persona`. Use o econômico para
rodadas frequentes (toda semana, depois de cada entrega) e o padrão para rodadas antes de release.
Preços de referência por milhão de tokens (entrada/saída): Haiku 5.5 US$ 0,10/0,50 · Sonnet 5.5
US$ 2/10 · Opus 5.5 US$ 4/20. Em assinatura do Claude Code, o custo vira consumo do limite de uso.

Para economizar sem perder qualidade: menos missões por sessão (contexto menor), `maxTurns` do
agente, e só verificar o que não for INCOMODA.
