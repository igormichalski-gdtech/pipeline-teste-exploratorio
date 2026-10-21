# Formatos

## Achado bruto (o que o agente-persona devolve)

```markdown
### [BLOQUEIA|ATRAPALHA|INCOMODA|DÚVIDA] <título curto, do ponto de vista da persona>
- **Persona / missão:** Carla · M-mkt-1
- **Onde:** <tela / menu / etapa, como a persona chamaria>
- **O que eu estava tentando:** <uma frase>
- **Passo a passo:** 1. ... 2. ... (com os valores exatos digitados, entre crases)
- **Como digitei/editei:** campo vazio e digitei · selecionei tudo e digitei · cliquei no meio e digitei por cima · colei
- **O que aconteceu:** <literal, com o texto exato da mensagem>
- **O que eu esperava:** <na voz da persona>
- **Frequência:** sempre | às vezes | uma vez
- **Prints:** .exploratorio/capturas/<arquivo>.png (1 a 3; o problema tem que estar visível)
```

Impacto: BLOQUEIA (não concluiu) · ATRAPALHA (concluiu com esforço ou contornando) · INCOMODA
(concluiu, experiência ruim) · DÚVIDA (pode ser intencional). O impacto é da persona; o destino
(BUG/DÚVIDA/SUGESTÃO/RETIRADO) é decidido só na triagem.

Além dos achados, o agente devolve:

```markdown
## Missões
| Missão | Resultado | Motivo da desistência | Tentativas | Tempo aprox. | Comentário da persona |
|---|---|---|---|---|---|
| M-mkt-1 | CONCLUIU / CONCLUIU EM PARTE / DESISTIU | SISTEMA · AMBIENTE · CENÁRIO DO TESTE (só se desistiu) | 3 | 6 min | "..." |

## Telas por onde passei
<lista dos nomes das telas, como aparecem no menu ou no título>

## O que mais irritaria no dia a dia
1. ... 2. ... 3. ...
```

Motivo da desistência: **SISTEMA** (a tela impediu ou confundiu) · **AMBIENTE** (algo indisponível
ou simulado neste ambiente) · **CENÁRIO DO TESTE** (a missão pedia algo proibido ao agente, o dado
preparado não existia, o recurso simulado não deixava escolher). Só SISTEMA conta como sinal.

## Resultado do verificador (por achado)

```markdown
### V-<n> · <tela>
- **Classe:** uma das abaixo
- **Jeito da persona:** 1ª <o que aconteceu> · 2ª <o que aconteceu>
- **Jeito comum:** <o que fez (ex.: selecionou tudo e digitou; esperou 1 s com o QR)> → <o que aconteceu>
- **Diálogos do navegador:** nenhum · tratado (<qual>) · não tratado
- **Recurso simulado envolvido:** não · sim (<qual>, e se a condição é plausível no uso real)
- **Console/rede:** <erros relevantes ou "nada relevante">
- **Prints:** .exploratorio/capturas/<arquivo>.png
```

Classes: **CONFIRMADO** (acontece do jeito da persona e do jeito comum) · **SÓ NO GESTO DA
PERSONA** (o jeito comum funciona) · **DEPENDE DE RECURSO SIMULADO** (só acontece pela condição
artificial) · **INTERMITENTE** (uma de duas) · **NÃO REPRODUZIDO**.

## Relatório da execução (`execucoes/<id>/relatorio.md`)

Cada achado com seus prints logo abaixo, no mesmo bloco. Nada de capturas de "deu certo".

```markdown
# Teste exploratório · <produto> · <data>

Personas: ... · Modo: padrão · Commit: <sha curto> · Escopo: <telas/módulos>

**Resultado:** <n> BUGS (<a> alto · <m> médios · <b> baixos) · <d> DÚVIDAS · <s> SUGESTÕES · <r> RETIRADOS

## 1. Bugs (<n>)
### ALTA · <título> · NOVO
**Por que é bug:** <uma pessoa real chega nisso do jeito comum e o sistema está errado porque ___ (fonte)>
**Quem tropeçou:** Carla (desistiu), Rogério · **Verificação:** CONFIRMADO, jeito comum incluído
**O que acontece:** <2–3 frases>
**Como reproduzir:** 1. ... 2. ... (valores exatos)
**Onde no código:** `arquivo:linha` — <causa provável>
![<legenda>](evidencias/<arquivo>.png)

## 2. Dúvidas para o dev/PO (<d>)
### D-1 · <pergunta de sim ou não>
**Contexto:** <o que a persona tentou e o que aconteceu> · **Fonte:** <regra a validar / matriz de papéis>
**Se a resposta for sim:** vira BUG <severidade>. **Se for não:** registrar em `decisoes.md` como intencional.
![...](evidencias/...)

## 3. Sugestões de melhoria (<s>) — sem severidade
### S-1 · <título> · <tipo: confirmação | rótulo/texto | acabamento | recurso | fluxo>
<o que acontece · por que confunde · sugestão em 1 frase> · ![...](evidencias/...)

## 4. Retirados (<r>)
| Achado | Motivo | Fonte |
|---|---|---|
| Portaria marca "já usado" | Recurso simulado: câmera segurava o QR por 6 s | config.md · Recursos simulados |
| Cores por motivo de recusa | Duplicado | bugs-conhecidos.md · PORT-04 |
| Evento com cortesia não pode ser escondido | Regra validada | RN-43 |

## 5. Cobertura de telas
| Tela do escopo | Sessões que passaram | Varredura de layout |
|---|---|---|
| Equipes de evento | lucas-eventos (tour) | 2 menus abertos, 1 cortado |
**Não visitadas:** <telas> — <motivo>

## 5b. Campos de risco
| Campo | Tela | Sessão | Formatos testados | Valor mostrado antes de confirmar | Resultado |
|---|---|---|---|---|---|
| Valor do resgate | Financeiro › Carteira › Resgatar | marcos | 150,00 · 150.00 · 1.500,00 · … | sim / não | ok · BUG · DÚVIDA |
**Não cobertos:** <campos> — <motivo>

## 6. Missões
| Missão | Persona | Resultado | Motivo da desistência |
|---|---|---|---|

## 7. Consumo
<tabela do medir-tokens.py> · Custo total: US$ X · por persona: US$ Y · por BUG: US$ Z
```

## Histórico (`historico.md`)

```markdown
## Execuções
| Id | Data | Commit | Modo | Personas | BUGS (A/M/B) | Dúvidas | Sugestões | Retirados | Custo | Por BUG |
|---|---|---|---|---|---|---|---|---|---|---|

## Achados
| Chave | Título | Destino | Severidade | Primeira vez | Última vez | Status |
|---|---|---|---|---|---|---|
| mkt-site-https | Campanha exige https:// no site | SUGESTÃO | — | 2026-10-19 | 2026-10-19 | ABERTO |
```

Status: ABERTO, CORRIGIDO (não apareceu e o verificador confirmou que sumiu), IGNORADO (a equipe
decidiu manter; anote em `decisoes.md`).

## Decisões (`conhecimento/decisoes.md`)

```markdown
| Data | Commit | Área / tela | Achado | Decisão | Quem | Motivo |
|---|---|---|---|---|---|---|
| 2026-10-20 | 455dcc38 | Reembolsos | Financeiro não vê eventos | INTENCIONAL | dev | O papel não lista eventos; reembolsa pelo link |
| 2026-10-20 | 455dcc38 | Campo de valor | Digitar por cima mistura o valor | NÃO É BUG | QA | Gesto incomum; selecionar e digitar funciona |
```

Decisões: É BUG (com severidade) · INTENCIONAL · NÃO É BUG · SUGESTÃO ACEITA · SUGESTÃO RECUSADA.

## Consumo

Tabela gerada por `medir-tokens.py` (uma linha por agente e modelo), seguida de:
`Custo total: US$ X · por persona: US$ Y · por BUG: US$ Z`. Prefira o `total_cost_usd` dos
processos `claude -p` quando existir; a estimativa do script é só para a sessão principal.
