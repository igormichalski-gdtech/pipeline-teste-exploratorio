# Formatos

## Achado bruto (o que o agente-persona devolve)

```markdown
### [BLOQUEIA|ATRAPALHA|INCOMODA|DÚVIDA] <título curto, do ponto de vista da persona>
- **Persona / missão:** Carla · M-mkt-1
- **Onde:** <tela / menu / etapa, como a persona chamaria>
- **O que eu estava tentando:** <uma frase>
- **Passo a passo:** 1. ... 2. ... (com os valores exatos digitados, entre crases)
- **O que aconteceu:** <literal, com o texto exato da mensagem>
- **O que eu esperava:** <na voz da persona>
- **Frequência:** sempre | às vezes | uma vez
- **Prints:** .exploratorio/capturas/<id>-<persona>-NN.png (1 a 3; o problema tem que estar visível)
```

Impacto: BLOQUEIA (não concluiu) · ATRAPALHA (concluiu com esforço ou contornando) · INCOMODA
(concluiu, experiência ruim) · DÚVIDA (pode ser intencional).

Além dos achados, o agente devolve:

```markdown
## Missões
| Missão | Resultado | Tentativas | Tempo aprox. | Comentário da persona |
|---|---|---|---|---|
| M-mkt-1 | CONCLUIU / DESISTIU / CONCLUIU COM AJUDA DA TELA | 3 | 6 min | "..." |

## O que mais irritaria no dia a dia
1. ... 2. ... 3. ...
```

## Relatório da execução (`execucoes/<id>/relatorio.md`)

Só bugs. Cada achado com seus prints logo abaixo dele, no mesmo bloco. Nada de capturas de "deu certo".

```markdown
# Teste exploratório · <produto> · <data>

Personas: Carla (celular), Rogério (notebook), Bruno (desktop) · Modo: padrão · Commit: <sha curto>

| Missão | Carla | Rogério | Bruno |
|---|---|---|---|
| M-mkt-1 Campanha do Instagram | DESISTIU | CONCLUIU (3 tent.) | CONCLUIU |

## Achados (<n>) — <a> altos · <m> médios · <b> baixos · <k> novos

### ALTA · <título> · NOVO
**Tipo:** bug | regra ruim para o usuário | texto/rótulo | layout | falta de recurso
**Quem tropeçou:** Carla (desistiu), Rogério (3 tentativas) · **Verificação:** CONFIRMADO 2/2
**O que acontece:** <2–3 frases, linguagem simples>
**Como reproduzir:** 1. ... 2. ... (valores exatos)
**Onde no código:** `frontend/src/...:213` — <causa provável em 1 frase>
**Sugestão:** <1 frase, do ponto de vista do usuário; ex.: aceitar sem https e completar sozinho>

![<legenda>](../../capturas/<arquivo>.png)

---

## Não reproduzidos (descartados)
- <título> — persona X; verificador não reproduziu em 2 tentativas.
```

## Histórico (`historico.md`)

```markdown
## Execuções
| Id | Data | Commit | Modo | Personas | Achados (A/M/B) | Novos | Corrigidos |
|---|---|---|---|---|---|---|---|

## Achados
| Chave | Título | Severidade | Primeira vez | Última vez | Status |
|---|---|---|---|---|---|
| mkt-site-https | Campanha exige https:// no site | MÉDIA | 2026-10-19 | 2026-10-19 | ABERTO |
```

A chave é estável (módulo + assunto em 2 ou 3 palavras) para reconhecer o mesmo achado entre
execuções. Status: ABERTO, CORRIGIDO (não apareceu e o verificador confirmou que sumiu), IGNORADO
(a equipe decidiu manter; anote o motivo).

## Consumo (fim do relatório)

Tabela gerada por `medir-tokens.py` (uma linha por agente e modelo), seguida de:
`Custo total: US$ X · por persona: US$ Y · por achado confirmado: US$ Z`.
