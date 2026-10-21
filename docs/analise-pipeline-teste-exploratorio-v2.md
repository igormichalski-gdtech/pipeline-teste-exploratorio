# Análise do pipeline de teste exploratório e proposta da versão 2

20/10/2026. Base: `resultado-pipeline-teste-exploratorio.md` (GD Ticket, execução 2026-10-19-1626),
`melhorias-pipeline-teste-exploratorio.md`, a execução no Dealto (2026-10-19-1428), a especificação
GDT-REQ-002 (`~/Documents/gd-ticket-requisitos`), o `api-tests/COBERTURA.md` do gd-ticket-new e
pesquisa (fontes no fim).

---

## 1. Diagnóstico em uma frase

O pipeline atual só tem **um oráculo**: o que uma pessoa comum *gostaria* que acontecesse. Com esse
oráculo, ele acha atrito de uso (as 11 sugestões são reais), mas não consegue dizer se o sistema está
**errado**. Errado é sempre relativo a uma regra, e a persona, de propósito, não conhece as regras.
Por isso houve 0 bugs e 100% de falso positivo como bug, enquanto os testes guiados pela
especificação acharam 9 bugs no mesmo commit.

Isso não é defeito de prompt. É o desenho. Pedir à persona que "ache bugs" pede algo que ela não tem
como julgar.

## 2. O que os números dizem

| | Dealto (19/10) | GD Ticket (19/10) |
|---|---|---|
| Achados entregues | 20 (1 A · 11 M · 8 B) | 20 (3 A · 11 M · 6 B) |
| Revisão humana | **não houve** (a triagem foi minha) | QA + dev, achado por achado |
| Bugs depois da revisão | ? | 0 (ou 1 baixo, segundo o arquivo de melhorias) |
| Custo | ≈ US$ 18 | US$ 22,37 |
| Bugs da mesma área achados pelos testes guiados pela spec | — | 9 |

Duas leituras importantes:

1. **Os 20 achados do Dealto também não foram validados por gente.** A probabilidade de a mesma
   inflação existir lá é alta. Dos 20, os que têm cara de bug inequívoco são poucos: o valor em reais
   gravado mil vezes menor, a carteira que não leva as oportunidades e talvez a busca. O resto é
   sugestão. O capítulo 12 do relatório do Dealto deveria passar pela mesma triagem nova antes de
   ser levado a sério.
2. **O ALTA mais forte do Dealto não veio das personas.** O valor em reais veio do verificador e de
   uma checagem minha. Das personas vieram atritos de uso.

## 3. Causas, ligadas à pesquisa

| Causa | Evidência na execução | O que a pesquisa diz |
|---|---|---|
| **Sem oráculo de regra** | Personas não viram que faltava tipo e assento na portaria (PORT-03) nem a cor por motivo (PORT-04), embora a tela estivesse ao alcance | Bolton (HICCUPPS): "Claims" (spec, docs) e "Users' desires" são oráculos diferentes; cada um acha um tipo de problema. AUITestAgent: teste de GUI orientado a requisito chega a 94% de acerto na verificação justamente porque cada passo tem o resultado esperado vindo do requisito |
| **Agentes geram "melhorias" como se fossem bugs** | 11 de 20 eram UX | Soap opera testing automatizado (Su et al.): entre os achados verdadeiros dos agentes, a maioria eram melhorias (19 de 32 no Firefox, 15 de 21 no WordPress, 11 de 15 no AntennaPod), contra 3 de 27 dos testadores humanos. Os falsos positivos tiveram 4 causas: alucinação, leitura do print, elemento errado e "sugestões desnecessárias de melhoria" |
| **Intencional tratado como bug** | Financeiro sem eventos (intencional), RN-43 | RippleGUItester: só separa bug de mudança intencional porque compara com a *intenção declarada* da mudança; sem intenção escrita, o agente não tem como saber |
| **Verificador confirma o que lhe disseram** | Repetiu o gesto incomum e confirmou 2/2 | AnyPoC: agentes comuns "jogam o jogo" e produzem provas plausíveis; o que filtra falso positivo é um analisador que tenta derrubar o relato antes de prová-lo (rejeitou 9,8× mais falsos que Claude Code e Codex). QASecClaw: agente filtro cortou 88,6% dos falsos positivos perdendo 3,1% dos verdadeiros |
| **Artefatos do ambiente** | Câmera falsa, saldo fixo, links para a porta errada | Falsos positivos de agentes visuais vêm muito de timing e de leitura de tela (estudos de GUI testing com LLM) |
| **Severidade instável** | 3 ALTA, todos derrubados | Avaliação heurística por LLM: concordância razoável sobre *se* há problema (κ ≈ 0,5) e quase nenhuma sobre *severidade* (α ≈ 0). Severidade não pode ser decisão livre do modelo |
| **Persona "superpoderosa"** | Bruno decifrando regex | "Act like a 5th grader is not enough": limite de conhecimento por prompt quase não funciona; limite real de ferramenta funciona |

## 4. Proposta: pipeline v2

A ideia central é **separar os dois trabalhos** e dar a cada um o oráculo certo:

- **Trilha A, conformidade exploratória:** um testador experiente que **conhece as regras** da área e
  explora pela tela procurando onde o sistema as descumpre. Oráculo: a especificação validada. Ela
  produz **BUG**.
- **Trilha B, usabilidade com personas:** a atual, cega de propósito. Oráculo: o que a pessoa
  esperava. Ela produz **SUGESTÃO**, e só em casos inequívocos produz BUG.
- **Uma base de conhecimento** compartilhada pela triagem, com a spec, os bugs conhecidos e as
  decisões humanas anteriores. É ela que permite chegar ao "humano só nas dúvidas".

```
                    ┌── Base de conhecimento (uma vez por versão da spec) ──┐
                    │ regras (RN), casos de uso, papéis, glossário,         │
                    │ bugs conhecidos (COBERTURA.md, [BUG ...] nos testes), │
                    │ decisões humanas anteriores (decisoes.md)             │
                    └───────────────┬───────────────────────────────────────┘
Preparar ─► Planejar ─┬─► Trilha A: conformidade (conhece a regra) ─┐
 (+ validar dados     │                                              ├─► Verificar cego ─► Defensor do produto ─► Triagem por árvore ─► Relatório
  e realismo)         └─► Trilha B: personas (não conhece)  ─────────┘   (+ jeito comum)   (tenta provar que       (BUG / SUGESTÃO /      (BUG à parte,
                                                                                            é intencional)          DÚVIDA / RETIRADO)    sugestões, fila de dúvidas)
                                                                                                                                │
                                                                         respostas do humano às DÚVIDAS ─► decisoes.md ◄────────┘
```

### 4.1 Base de conhecimento (nova etapa 0, agente `exploratorio-analista`)

Lê a especificação uma vez por versão e gera arquivos estruturados em `.exploratorio/conhecimento/`:

- `regras.json`: para cada RN, o texto, o tipo (Restrição, Cálculo, Derivação, Ação), a situação
  (`confirmado`, `validado`, `a validar`), a área e a evidência no código (`events.service.ts:1965`).
  A GDT-REQ-002 já traz tudo isso numa tabela LaTeX, então a extração pode ser por script, sem LLM.
- `casos-de-uso.json`: pré-condições, fluxo principal, fluxos alternativos e **pós-condições** de cada
  UC. As pós-condições viram resultado esperado ("ingresso marcado como usado, com data, hora e
  porteiro").
- `papeis.json`: a matriz de papéis e permissões (tabela 4.x), **incluindo as ressalvas da gestão**
  ("leitor não deveria ver dados financeiros").
- `bugs-conhecidos.json`: extraído do `COBERTURA.md` e das tags `[BUG XXX]` / `knownBug(...)` dos
  testes, com ID, regra e status (aberto ou corrigido em qual commit).
- `cobertura.json`: o que já é testado por e2e ou API, e por qual camada ("só API", "tela", "W", "P").
- `decisoes.md`: o histórico de decisões humanas ("Financeiro não lista eventos: intencional, dev,
  20/10"; "digitar por cima no campo de valor: não é bug, QA, 20/10").

**Atenção a um risco da GDT-REQ-002:** desde a versão 0.3 ela "passa a descrever só o comportamento
atual", com evidência no código. Uma regra extraída do código concorda com o código por construção,
então não acha bug. Os 9 bugs do QA vieram de três fontes: o que foi **validado pela gestão**
("tela validada em 14/10"), as **ressalvas** e o que está **a validar**. A Trilha A deve priorizar
essas fontes como oráculo e tratar o resto como "comportamento conhecido", útil para retirar falso
positivo e fraco para achar bug.

### 4.2 Planejamento guiado por risco e por mudança

- **Onde a automação não cobre:** cruzar `regras.json` com `cobertura.json`. Regras "só API", sem
  teste e com situação `validado` viram charters da Trilha A pela tela. O exploratório complementa a
  suíte automatizada em vez de repeti-la.
- **Onde o código mudou** (abordagem do RippleGUItester): `git diff` desde a última execução → arquivos
  alterados → RNs cuja evidência aponta para esses arquivos → charters. A spec já tem o mapa
  RN → `arquivo:linha`, e isso dá uma priorização praticamente de graça.
- **Missões viáveis:** para cada missão, conferir na matriz de papéis se aquele papel faz aquilo pela
  navegação (evita o caso do Financeiro). Missões que esbarram nas regras de segurança só entram se o
  ambiente permitir explicitamente ("aqui o pagamento é simulado, pode pagar").
- **Cenários encadeados** (soap opera): a Trilha A também roda histórias que atravessam várias regras,
  como "compra → transferência → reembolso parcial → entrada na portaria com o QR antigo". É onde os
  bugs de integração aparecem (o estorno duplicado no razão é desse tipo).

### 4.3 Trilha A: conformidade exploratória (novo agente `exploratorio-conformidade`)

- **Quem é:** um QA sênior da área, que recebe o charter, as regras relevantes (texto exato, com ID) e
  as pós-condições dos UCs. Não recebe código nem bugs conhecidos.
- **Formato do charter:** "Explore *reembolso parcial pelo organizador* para verificar *RN-21, RN-95 e
  UC-14 pós-condições*, como *Organizador e Financeiro*".
- **Técnicas que ele aplica:**
  - **Resultado esperado em cada passo:** passos orientados a requisito, no estilo do AUITestAgent,
    em vez de buscar um objetivo final.
  - **Diferencial por papel:** a mesma ação com cada papel da matriz. O que um papel vê ou faz e não
    deveria vira BUG citando a matriz; o leitor vendo dados financeiros sai daqui.
  - **Invariantes e relações metamórficas** vindas das regras de cálculo e derivação. Exemplos:
    "estornar uma venda reduz o bruto em exatamente o valor da venda"; "vendidos + disponíveis =
    capacidade do lote"; "a soma dos lançamentos do razão de um pedido estornado é zero". Isso
    resolve o caso "números diferentes entre telas": em vez de achar estranho, ele verifica a conta
    da regra.
  - **Fronteiras das restrições:** limites numéricos das RNs (61 min recusa, 59 min entra; motivo de
    5 a 1000 caracteres).
- **Formato da saída:** todo achado cita a regra e traz "esperado (com a citação)" × "observado
  (literal + print)". Sem citação, não é BUG da Trilha A.

### 4.4 Trilha B: personas (a atual, com outro contrato)

- **O que não muda:** continua sem acesso a código e a spec. O valor dela é o olhar de quem não sabe.
- **Classificação padrão:** todo achado sai como **SUGESTÃO**.
- **Quando vira BUG:** só se cair numa das classes inequívocas, que não precisam de spec:
  1. erro técnico na tela (500, mensagem crua, tela quebrada);
  2. **valor gravado diferente do que foi digitado** ou exibido (o caso do dinheiro);
  3. dado de outra empresa ou de outro usuário aparecendo;
  4. perda de dado (salvou e sumiu; editou um e mudou outro);
  5. tarefa comum do papel sem nenhum caminho possível, *depois* de a matriz confirmar que o papel
     deveria fazê-la.
- **Ajustes vindos das lições:**
  - "digitar do jeito dela" vale para o formato do dado, não para a mecânica do campo;
  - o campo "como digitei/editei" passa a ser obrigatório no achado;
  - o motivo de desistência passa a ter categoria: SISTEMA, AMBIENTE ou CENÁRIO DO TESTE.
- **Custo:** modo econômico (Haiku) é o padrão desta trilha. Sugestão de UX não justifica Sonnet.

### 4.5 Verificação em duas camadas

1. **Verificador cego.** Recebe só os passos, sem o título nem a conclusão, e descreve o que aconteceu.
   - **Segunda forma:** repete do **jeito comum** (selecionar tudo e digitar, clicar onde todo mundo
     clica, esperar o tempo normal).
   - **Recurso simulado:** quando houver, confere se a condição é plausível na vida real (QR na
     câmera por 1 s, não por 6 s).
   - **Comparação:** quem compara o resultado com o achado é o orquestrador.
   - **Controle:** de vez em quando entra um achado falso para medir se ele o derruba.
2. **Defensor do produto** (novo agente `exploratorio-defensor`, Sonnet, com acesso à base de
   conhecimento e ao código).
   - **O que faz:** tenta provar que o achado **não é bug**, com cinco perguntas: está na spec como
     regra? já é bug conhecido? já foi decidido antes (`decisoes.md`)? é artefato do ambiente? os
     números estão certos nas suas próprias bases?
   - **Saída:** devolve a defesa com citação, ou "não consegui defender".
   - **Quem passa:** só achados que o defensor não derruba. É o padrão "analisador antes de provar"
     do AnyPoC e do filtro do QASecClaw.

### 4.6 Triagem por árvore de decisão

A ordem é fixa e cada passo é verificável. A decisão não fica na impressão do modelo.

1. Depende de artefato do teste ou do ambiente? → **RETIRADO** (ambiente).
2. Já é bug conhecido (`bugs-conhecidos.json`)? → **RETIRADO** (duplicado de PORT-04), com link.
3. Já decidido em `decisoes.md`? → aplica a decisão.
4. A spec descreve exatamente esse comportamento?
   - situação `validado` ou `confirmado` → **RETIRADO** ("conforme RN-43"); se incomoda a persona,
     vira **SUGESTÃO** ou pergunta para o PO;
   - situação `a validar` → **DÚVIDA** para o PO, com a RN citada.
5. Contradiz uma regra validada, uma pós-condição de UC, a matriz de papéis ou uma ressalva da
   gestão? → **BUG** (com a citação).
6. A spec não fala nada:
   - classe inequívoca da Trilha B? → **BUG**;
   - "o papel X não consegue Y"? → **DÚVIDA** para o dev;
   - o resto → **SUGESTÃO**.
7. **Severidade só para BUG**, por tabela, nunca por opinião:

   | | Regra de cálculo/derivação, dinheiro ou dado de cliente | Restrição ou ação disparada | Texto, cor ou exibição |
   |---|---|---|---|
   | Acontece no caminho comum | ALTA | MÉDIA | BAIXA |
   | Só em caminho raro ou papel raro | MÉDIA | BAIXA | BAIXA |

8. **Última checagem antes de ALTA:** "uma pessoa real, do jeito comum, chega nisso, e o sistema
   está errado segundo uma fonte citada?". Se a resposta não for "sim" para as duas partes, rebaixa.

### 4.7 Humano no mínimo: a fila de dúvidas e a memória de decisões

- **O que o humano vê:** só a fila de **DÚVIDAS**, com perguntas fechadas, não a lista inteira. Por
  exemplo: "O Financeiro deveria conseguir reembolsar pela lista de eventos? (RN-xx não cobre.) [sim
  = bug / não = intencional]". A meta é de 5 a 10 minutos por execução.
- **O que acontece com a resposta:** vira uma linha em `decisoes.md` e entra na base de conhecimento.
  Na execução seguinte, a triagem aplica a decisão sozinha, e o sistema aprende o produto. É a
  "co-aprendizagem humano-IA" que o estudo de soap opera testing aponta como caminho.
- **Proposta de spec:** as decisões que se repetem viram sugestão de atualização da especificação
  (nova RN ou ressalva), que o analista prepara para a gestão validar.

### 4.8 Ambiente realista e verificado

- **Preparador:** valida cada dado prometido no `config.md` (consulta a tela ou o banco).
- **Simulações e limitações:** os recursos simulados ganham parâmetros de realismo (câmera 1 s com QR
  e 1 s sem; um vídeo por cenário). Os links que saem do painel são conferidos, e a lista
  "indisponível" é obrigatória.
- **Valores de teste:** `config.md` ganha a seção "valores de teste conhecidos" (saldo de R$ 1.000.000,
  porta 3000). A triagem descarta automaticamente achados que dependem deles.
- **Dados descartáveis:** o preparador cria dados com prefixo para o verificador confirmar ações
  destrutivas.

### 4.9 Medir antes de mudar: o gabarito

Já existe material rotulado para isso:

- **Os 20 achados do GD Ticket**, cada um com a decisão humana e o motivo. Servem para medir precisão
  e a triagem nova.
- **Os bugs reais com commit conhecido:** PORT-01 a PORT-05, ORG-01 a ORG-04, o estorno duplicado e a
  tarifa devolvida. Servem para medir quanto se encontra: rodar a Trilha A no commit *anterior* à
  correção e ver se ela encontra o bug.
- **Os 20 achados do Dealto**, depois de uma revisão humana rápida.

**Metas para a v2 ser considerada melhor:**

| Métrica | Atual (GD) | Meta v2 |
|---|---|---|
| Precisão do BUG (aceitos pelo humano / entregues como BUG) | 0% | ≥ 70% |
| Recall em bugs conhecidos de tela (PORT-03/04/05, ORG-03/04) | 0 de 5 | ≥ 3 de 5 |
| Minutos de revisão humana por execução | toda a lista | ≤ 10 (só DÚVIDAS) |
| Custo por bug aceito | indefinido | ≤ US$ 5 |

Cada mudança no pipeline (prompt, modelo, persona) roda contra o gabarito antes de ser adotada.

## 5. Respostas às perguntas da seção 10

1. **Objetivo:** os dois, em trilhas separadas. "Achar bugs" com a Trilha A, que conhece a regra;
   "achar atrito de uso" com a Trilha B, que não conhece. O relatório tem BUGS à parte e SUGESTÕES
   sem severidade.
2. **Triagem em três destinos:** sim, e com quatro: BUG, SUGESTÃO, DÚVIDA e RETIRADO. A DÚVIDA é o que
   permite tirar o humano da revisão da lista inteira.
3. **Consultar a spec e os bugs conhecidos antes da severidade:** sim. É a etapa de maior ganho e
   menor custo (seções 4.1 e 4.6). "O papel X não consegue Y" vira DÚVIDA.
4. **Verificador no jeito comum:** sim, e cego. Além dele, entra o defensor do produto.
5. **Cenários simulados realistas:** sim, com a seção "valores de teste conhecidos" para a triagem.
6. **Custo:** com o desenho atual, não compensa como caçador de bugs. Na v2, a Trilha B em Haiku
   (cerca de US$ 1 por persona) pode rodar a cada entrega. A Trilha A, guiada por risco e mudança,
   fica restrita às áreas alteradas e roda antes de release.
7. **A persona deve conhecer a spec?** Não. O valor dela é não saber. A conformidade fica com a
   Trilha A, que complementa os testes automatizados: ela cobre o que é "só API" pela tela, os
   cenários encadeados e as diferenças entre papéis, que a suíte scriptada não cobre.

## 6. Plano de implementação

| Fase | O que entra | Por que nessa ordem | Esforço |
|---|---|---|---|
| **1** | Base de conhecimento (script que lê `07-regras-negocio.tex`, a matriz de papéis, as pós-condições dos UCs, o `COBERTURA.md` e as tags `[BUG]`) + triagem por árvore + relatório BUG/SUGESTÃO/DÚVIDA + `decisoes.md` semeado com as 20 decisões do GD | Ataca diretamente os 100% de falso positivo, sem nenhuma sessão nova de navegador | baixo |
| **2** | Verificador cego com "jeito comum" + defensor do produto + realismo do ambiente | Corta os falsos positivos que sobrarem da fase 1 | médio |
| **3** | Trilha A (agente de conformidade) com charters a partir de regras validadas, ressalvas e "só API" | É onde estão os bugs reais | médio/alto |
| **4** | Gabarito e métricas; rodar a Trilha A no commit antes das correções de PORT/ORG | Prova (ou derruba) a v2 com números | médio |
| **5** | Planejamento por mudança (git diff → RN → charter) e cenários encadeados | Foca o custo onde o risco está | médio |

**Teste rápido da fase 1:** reprocessar os 20 achados do GD Ticket com a triagem nova, sem rodar
nenhuma persona. Se ela chegar sozinha a algo próximo da decisão humana (≈ 0 a 1 BUG, 11 SUGESTÕES,
o resto RETIRADO), a fase 1 está validada a custo quase zero.

## 7. Riscos

- **Spec descrevendo o código:** se tudo na spec vem do código, a Trilha A não acha nada (seção 4.1).
  Mitigação: priorizar o que foi validado pela gestão, as ressalvas e as telas validadas.
- **Leitura errada da spec pelo modelo:** todo BUG cita o texto exato da regra, o defensor confere e o
  verificador reproduz.
- **Contaminação da persona:** a Trilha B nunca recebe a base de conhecimento. Isso é garantido pelas
  ferramentas, não só pelo prompt.
- **Decisões velhas:** `decisoes.md` guarda data e commit; quando o código da área muda (pelo mapa
  RN → arquivo), a decisão volta a ser DÚVIDA.
- **Custo da Trilha A:** charters por risco e por mudança, não a spec inteira a cada execução.

## Fontes

- Bolton, oráculos e HICCUPPS: https://developsense.com/resource/Oracles.pdf · https://developsense.com/?p=1256
- AUITestAgent, teste de GUI orientado a requisitos (Meituan): https://arxiv.org/html/2407.09018v1
- Automated Soap Opera Testing Directed by LLMs and Scenario Knowledge: https://arxiv.org/pdf/2412.08581
- RippleGUItester, teste exploratório guiado por mudança: https://arxiv.org/pdf/2603.03121
- From Business Requirements to Test Assertions (oráculos a partir de requisitos): https://arxiv.org/html/2607.10277v1
- CANDOR, oráculos por consenso de múltiplos agentes: https://arxiv.org/html/2506.02943v4
- AnyPoC, validação de relatos de bug antes da prova: https://arxiv.org/html/2604.11950v1
- QASecClaw, agente filtro de falsos positivos: https://arxiv.org/html/2605.01885
- Execução confiável de casos de teste em linguagem natural: https://link.springer.com/article/10.1007/s11219-026-09767-2
- Relações metamórficas geradas a partir de requisitos: https://arxiv.org/abs/2401.17019v2
- Avaliação heurística por LLM (concordância e severidade): https://arxiv.org/abs/2512.04262v1 · https://arxiv.org/html/2506.16345v1 · https://arxiv.org/html/2507.02306v1
- WebTestBench: https://arxiv.org/html/2603.25226
- "Act Like a 5th Grader is Not Enough": https://arxiv.org/html/2608.30033
- NN/g, usuários sintéticos: https://nngroup.com/articles/synthetic-users/
