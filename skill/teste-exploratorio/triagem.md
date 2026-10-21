# Triagem: BUG, DÚVIDA, SUGESTÃO ou RETIRADO

Aplique a árvore a cada achado, **na ordem**, e pare no primeiro passo que decidir. Registre o passo
e a fonte usada (é isso que deixa a decisão auditável). Na dúvida entre dois destinos, escolha o mais
fraco (SUGESTÃO antes de BUG, DÚVIDA antes de ALTA).

## Os quatro destinos

| Destino | Quando | Conta na severidade? |
|---|---|---|
| **BUG** | Uma pessoa real, do jeito comum, encontra o sistema mostrando ou fazendo algo errado | Sim |
| **DÚVIDA** | Pode ser bug ou intencional, e só o dev/PO sabe. Vai como pergunta de sim ou não | Não |
| **SUGESTÃO** | Funciona, mas a experiência pode melhorar | Não |
| **RETIRADO** | Não é problema do sistema (ambiente, ferramenta, duplicado, regra validada, decisão anterior, bases diferentes) | Não |

## A árvore

**1. Veio do ambiente, do recurso simulado ou da ferramenta?** → RETIRADO (ambiente)
- O verificador classificou como NÃO REPRODUZIDO, SÓ NO GESTO DA PERSONA ou DEPENDE DE RECURSO SIMULADO.
- Depende de um item de "Indisponível", "Recursos simulados" ou "Valores de teste conhecidos" do
  `config.md` (ex.: saldo fixo do simulador, link para a porta errada, câmera falsa segurando o QR).
  Pergunta de controle: "a mesma condição acontece no uso real, com a frequência normal?". Se não → RETIRADO.
- "O botão não faz nada" numa tela que abre `prompt`/`confirm`/`alert`: confira na transcrição se o
  diálogo foi tratado (`browser_handle_dialog`). Se a ferramenta fechou o diálogo → RETIRADO (ferramenta).

**2. Já é bug conhecido?** → RETIRADO (duplicado de `<ID>`)
- Compare com `conhecimento/bugs-conhecidos.md` pela tela e pelo sintoma, não só pelo texto.
  Achado que acrescenta um sintoma novo ao mesmo defeito: RETIRADO com nota no bug conhecido.

**3. Já foi decidido?** → aplique a decisão de `conhecimento/decisoes.md`
- Vale se a área não mudou desde a decisão (compare o commit da decisão com o `git log` dos arquivos
  da área). Se mudou, siga a árvore e, se der o mesmo resultado, cite a decisão antiga.

**4. A spec descreve esse comportamento?**
- Regra validada/confirmada ou comportamento intencional documentado → RETIRADO ("conforme RN-43").
  Se incomodou a persona, a dificuldade vira SUGESTÃO ou pergunta ao PO (não BUG).
- Regra "a validar" → DÚVIDA para o PO, citando a regra.
- Contradiz uma regra validada, a pós-condição de um caso de uso, a matriz de papéis ou uma ressalva
  da gestão → segue para o passo 5 com a citação (forte candidato a BUG).

**5. É uma classe de BUG?** Só estas, e sempre no caminho comum:
- **Dado errado:** valor gravado ou exibido diferente do digitado ou do que a regra calcula. Em campo
  de dinheiro, "valor interpretado diferente do digitado" com formato comum (`150.00`, `150,00`,
  `1.500,00`, `R$ 150`) é sempre BUG ALTA, mesmo que a persona tenha parado antes de confirmar.
  Não confundir com o gesto incomum de digitar por cima sem selecionar (passo 1).
- **Erro técnico na tela:** erro 500, tela branca, mensagem crua de sistema ou em inglês com nome interno.
- **Dado de outro cliente ou usuário** aparecendo, ou ação permitida contra a matriz de papéis.
- **Perda de dado:** salvou e sumiu; editou um e mudou outro.
- **Regra validada descumprida** (citação do passo 4).
- **Tarefa comum impossível** pelo caminho que o papel tem (depois do passo 6 confirmar que o papel
  deveria fazê-la).
- **Layout quebrado no caminho comum:** ação inalcançável ou escondida (menu cortado que obriga a
  rolar para achar a ação, botão coberto, conteúdo fora da tela sem rolagem).
→ Se sim: BUG. Se não: siga.

**5b. Operação que tira dinheiro sem mostrar valor e destino na confirmação?**
- Junto com valor interpretado errado → faz parte do mesmo BUG ALTA (agrava: a pessoa não tem como ver).
- Sozinho → DÚVIDA de risco para o PO, no topo da lista de dúvidas ("A confirmação do resgate deveria
  mostrar valor e destino?"). Nunca SUGESTÃO nem INCOMODA.

**6. "O papel X não consegue Y"?** → DÚVIDA para o dev
- Pergunta: "O <papel> deveria conseguir <Y> por <caminho>? (matriz de papéis: <o que diz>)".
- Antes disso, confira se a missão era viável: se o papel não tem o caminho pela navegação e a matriz
  não diz que deveria, é RETIRADO (missão inválida) e a missão sai de `missoes.md`.

**7. Números diferentes entre telas?**
- Recalcule cada número na própria base (bruto com e sem estorno, vendidos com e sem cancelado).
  Se cada um está certo na sua base → SUGESTÃO de rótulo ("deixar claro que inclui o estornado").
  Se algum está errado na própria base → BUG (dado errado).

**8. O resto** → SUGESTÃO
- Falta de confirmação (a menos que a spec exija), rótulo, texto, ordem dos campos, acabamento visual,
  recurso que não existe, termo técnico, tutorial, desempenho que incomoda mas não impede.

## Severidade (só para BUG)

| | Dinheiro, cálculo, dado de cliente, permissão | Regra de restrição, fluxo, ação disparada | Exibição e layout |
|---|---|---|---|
| Tarefa comum, papel comum | **ALTA** | MÉDIA | MÉDIA se esconde a ação; BAIXA se só exibe errado |
| Tarefa rara ou papel raro | MÉDIA | BAIXA | BAIXA |

## Portão de ALTA

Um BUG só fica ALTA se as quatro respostas forem "sim". Se alguma for "não", rebaixe ou mude o destino.
1. O verificador reproduziu do **jeito comum** (não só do jeito da persona)?
2. A condição acontece no **uso real**, sem recurso simulado nem valor de teste?
3. **Não é** bug conhecido nem decisão anterior, e a spec **não** descreve isso como regra?
4. O problema **não é** "o papel X não consegue Y" sem confirmação do dev?

## Antes de entregar

Releia cada BUG e responda por escrito, em uma linha: "Uma pessoa real chegaria nisso do jeito comum,
e o sistema está errado porque ___ (fonte)". Se a lacuna não tiver uma fonte objetiva (regra, valor
digitado × gravado, mensagem de erro, print do layout), rebaixe para SUGESTÃO ou DÚVIDA.
