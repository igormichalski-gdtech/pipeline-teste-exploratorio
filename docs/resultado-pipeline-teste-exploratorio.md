# Resultado do pipeline de teste exploratório com personas: execução 2026-10-19-1626

**Para quem vai analisar:** este documento junta os dados de uma execução real do pipeline
`/teste-exploratorio` (skill + agentes `exploratorio-preparador`, `exploratorio-persona` e
`exploratorio-verificador`). Também traz a revisão humana feita depois. O objetivo é decidir se o
framework deve ser alterado e como. As propostas de mudança, detalhadas lição por lição, estão em
`~/Desktop/melhorias-pipeline-teste-exploratorio.md`. Leia aquele arquivo junto com este.

## 1. Resumo em 5 linhas

- **Entrada:** 5 sessões de persona, 27 missões e 20 achados entregues, dos quais 3 ALTA. Custo de US$ 22,37.
- **Revisão humana (QA + dev):** nenhum achado ficou como bug. 11 viraram sugestão de UX e 9 foram retirados.
- **Taxa de falso positivo como bug:** 20 de 20, ou seja, 100%.
- **Os 3 ALTA:** 2 vieram do jeito de testar (forma de digitar e artefato da câmera falsa). O terceiro era comportamento intencional do produto (permissão de papel).
- **Comparação:** no mesmo dia, os testes automatizados guiados pela especificação (Playwright + Postman) acharam 9 bugs reais, que o QA aceitou como bugs.

## 2. Contexto

- **Produto:** Bipu / GD Ticket, venda de ingressos. Repositório `gd-ticket-new`, branch `dev`, commit `455dcc38`.
- **Escopo:** as funcionalidades sob responsabilidade do QA.
  - **Portaria:** PT-01 a PT-05 (código de acesso, leitura por câmera, regras, sessões, histórico).
  - **Painel do organizador:** OR-03, 06, 07, 08, 13, 14, 16 a 20, 22 (evento, ingressos e lotes, área sensível, reembolsos, equipe, financeiro, relatórios, cupons).
- **Referência de comportamento:** a especificação GDT-REQ-002 v0.5, com requisitos, regras de negócio e UML validados pela gestão.
- **Ambiente:** local e compartilhado com as suítes automatizadas, sob uma trava. Pagamento simulado (saldo fixo de R$ 1.000.000), e-mail local (Mailpit) e armazenamento de imagens desligado. Os dados de teste ficaram em empresas próprias com prefixo `EXPL-`.
- **Modelos:** orquestrador e preparador em Opus 5.5; personas e verificador em Sonnet 5.5.

## 3. Como a execução foi montada

| Sessão | Persona | Papel / dispositivo | Missões | Tour |
|---|---|---|---|---|
| jessica | Jéssica, nível 1 | Porteira, celular 390×844, câmera falsa (vídeo com QR em loop) | 4 | Interrupção |
| marcos | Marcos, nível 2 | Dono, notebook | 6 | Novato |
| sandra | Sandra, nível 2 | Financeiro, desktop | 7 | Coletor de lixo |
| lucas-eventos | Lucas, nível 3 | Administrador, desktop | 5 | Dados ruins |
| lucas-portaria | Lucas, nível 3 | Editor, desktop | 5 | Desfazer |

Ordem de execução:
1. **Preparo:** o preparador montou as empresas, os usuários por papel, 4 eventos, vendas, reembolso, cupons e o vídeo da câmera falsa.
2. **Ondas:** 3 personas em paralelo, depois mais 2.
3. **Verificação:** 5 grupos, com até 5 achados por grupo, cada um reproduzido 2 vezes.
4. **Triagem:** o orquestrador localizou cada achado no código, com a ajuda de um agente de busca.

## 4. Funil dos achados

| Etapa | Quantidade | Observação |
|---|---|---|
| Achados brutos das personas | ~48 | Somando BLOQUEIA, ATRAPALHA, INCOMODA e DÚVIDA das 5 sessões |
| Enviados ao verificador | 20 | Os demais eram INCOMODA ou foram tratados pelo orquestrador |
| Não reproduzidos (verificador) | 3 | Descartados na hora |
| Descartados como ambiente (orquestrador) | 4 | Links para a porta errada, saldo do simulador, dado preparado inexistente, aviso no console |
| **Entregues no relatório** | **20** | 3 ALTA · 11 MÉDIA · 6 BAIXA |
| Depois da revisão humana: bug | **0** | |
| Depois da revisão humana: sugestão de UX | 11 | Funciona; a experiência poderia ser melhor |
| Depois da revisão humana: retirado | 9 | Não é bug |

### 4.1 Os 20 achados e a decisão final

| # | Achado entregue | Sev. entregue | Decisão humana | Por quê | Categoria do erro do pipeline |
|---|---|---|---|---|---|
| 1 | Portaria: quem acabou de entrar aparece "já usado" | ALTA | Retirado | O mesmo QR lido de novo dizer "já usado" está correto; foi o vídeo da câmera falsa que segurou o QR por 6 s | Artefato do cenário de teste |
| 2 | Preço se mistura com o valor existente (R$ 550.000,00) | ALTA | Retirado | Só acontece ao digitar por cima sem selecionar; com duplo clique o campo funciona | Gesto incomum (forma de digitar) |
| 3 | Financeiro não vê eventos e não reembolsa | ALTA | Retirado | Intencional, confirmado pelo dev; a tela de reembolso funciona para ele pelo link | Missão supôs um caminho que o papel não tem |
| 4 | Carteira × Resumo × DRE com números diferentes | MÉDIA | Retirado | Cada tela está certa na sua base (1.078 = 990 + 88 da venda estornada) | Números com bases diferentes tratados como erro |
| 5 | Vendidos 5 × 6 (cancelado conta no lote) | MÉDIA | Retirado | Os dois números são defensáveis; o Resumo mostra "1 cancelado" | Mesma categoria |
| 6 | Capacidade 180 × 230 depois de aumentar lote | MÉDIA | Retirado | Intencional: a capacidade do evento é definida pelo organizador | Comportamento intencional |
| 7 | Cancelar ingresso: lixeira e caixa sem contexto | MÉDIA | Retirado | Já coberto por um bug dos testes automatizados (PORT-05) | Duplicado de bug conhecido |
| 8 | Porteiro barrado sem instrução | MÉDIA | Retirado | As cores já são o bug PORT-04; as mensagens dizem o motivo | Duplicado / não verificado |
| 9 | Evento com cortesia não pode ser escondido | BAIXA | Retirado | É regra validada da especificação (RN-43) | Regra da spec tratada como bug |
| 10 | Sair da tela de ingressos descarta sem avisar | MÉDIA | Sugestão | A tela já mostra "Alterações não salvas" | UX tratado como bug |
| 11 | "Encerrar" código da portaria sem confirmar | MÉDIA | Sugestão | O botão faz o que diz | UX tratado como bug |
| 12 | Excluir membro / cancelar convite sem confirmar | MÉDIA | Sugestão | O botão faz o que diz | UX tratado como bug |
| 13 | PIX das pendências com R$ 1,99 sem explicar | MÉDIA | Sugestão | O valor está certo pela RN-85 | Texto tratado como bug |
| 14 | Recarregar a portaria pede o código de novo | MÉDIA | Sugestão | Nada se perde; a linha duplicada some em 2 min | UX tratado como bug |
| 15 | Mudar data em "Dados gerais" falha | MÉDIA | Sugestão | A recusa é a regra certa e a mensagem orienta | Texto tratado como bug |
| 16 | Meta: balão não fecha, sem "quanto falta" | BAIXA | Sugestão | A meta é salva | Acabamento |
| 17 | Diário com códigos técnicos | BAIXA | Sugestão | Os dados estão certos | Texto |
| 18 | Menu "Ingressos" abre Histórico de entradas | BAIXA | Sugestão | Rótulo | Texto |
| 19 | Sem total de entradas / sem registro de recusas | BAIXA | Sugestão | Recurso que não existe | Falta de recurso |
| 20 | Contador da portaria sem legenda | BAIXA | Sugestão | Texto | Texto |

### 4.2 Erros do pipeline, agrupados

| Categoria | Achados | Etapa onde deveria ter sido barrado |
|---|---|---|
| UX, texto ou recurso que não existe tratado como bug | 11 (10–20) | Triagem: falta a categoria "sugestão", fora da contagem |
| Comportamento intencional / regra da spec | 3 (3, 6, 9) | Missões (supor caminho) e triagem (confirmar com spec/dev antes de ALTA) |
| Números certos com bases diferentes | 2 (4, 5) | Triagem: conferir se cada número está certo na própria base |
| Duplicado de bug conhecido dos testes automatizados | 2 (7, 8) | Triagem: cruzar com a lista de bugs conhecidos |
| Gesto incomum (posição do cursor) | 1 (2) | Verificador: repetir do jeito comum |
| Artefato do cenário simulado (câmera falsa) | 1 (1) | Preparo (vídeo realista) e triagem (plausível na vida real?) |

## 5. Missões: concluídas e desistidas

27 missões, das quais 9 terminaram em DESISTIU. Revisando o motivo de cada desistência:

| Motivo | Missões | Diz algo sobre o sistema? |
|---|---|---|
| Obstáculo da tela | 6 (FIN-1, REE-1, REE-2, REL-1, HIS-1, HIS-2) | Em parte. Depois da revisão, as causas viraram sugestão ou eram intencionais (REE-1 e REE-2: Financeiro) |
| Regra de segurança do agente (não pagar, não confirmar envio de e-mail) | 2 (FIN-4, SEN-1) | Não. A missão pedia algo proibido ao agente |
| Ambiente / dado preparado inexistente | 1 (REL-3) | Não |

## 6. Custo

| Agente | Modelo | Custo |
|---|---|---|
| Orquestrador (montagem, triagem, relatório) | Opus 5.5 | US$ 6,63 |
| Preparador do ambiente | Opus 5.5 | US$ 3,43 |
| Busca de causas no código | Opus 5.5 | US$ 0,55 |
| 5 sessões de persona | Sonnet 5.5 | US$ 8,72 (Lucas-eventos sozinho: US$ 4,60, com 155 chamadas, puxado pelo tour de "dados ruins") |
| 5 rodadas do verificador | Sonnet 5.5 | US$ 3,05 |
| **Total** | | **US$ 22,37** |

- **Custo por bug confirmado:** indefinido, porque não houve nenhum.
- **Custo por sugestão de UX aproveitável:** cerca de US$ 2.
- **Fora da conta:** a revisão humana. O QA revisou achado por achado e pediu reprodução manual de 3 deles. Foi esse o trabalho que derrubou todos.

## 7. O que funcionou

- **Preparo isolado:** o preparador montou o ambiente sem derrubar o que estava compartilhado, com empresas próprias e sob a trava. Ele também criou a câmera falsa, que fez a portaria ler QR de verdade num navegador sem câmera.
- **Verificador:** derrubou 3 achados que não se reproduziam e trouxe evidências de rede e console úteis.
- **Achados de ambiente:** o orquestrador identificou e retirou 4 achados que eram do ambiente.
- **Sugestões de UX:** as 11 sugestões têm valor de produto, porque mostram onde uma pessoa comum se confunde. Mas não são bugs.
- **Prints e passo a passo:** permitiram ao QA reproduzir sozinho.

## 8. O que não funcionou

1. **Bug sem filtro:** a triagem não separa "o sistema está errado" de "poderia ser melhor". Tudo entra como bug com severidade, e a lista fica inflada.
2. **ALTA sem conferência:** nenhum dos 3 ALTA passou por "uma pessoa real chega nisso do jeito comum, e o sistema está errado?". Nem por "isso é intencional?", com consulta à spec ou ao dev.
3. **Verificador repetiu o mesmo gesto:** ele refaz exatamente o que a persona fez, inclusive o gesto incomum. Por isso confirmou 2/2 um falso positivo.
4. **Missões supõem caminhos:** a missão do Financeiro supôs que ele navega por eventos. Duas missões pediram ações proibidas pelas regras do agente.
5. **Recursos simulados geraram achados:** a câmera falsa (QR parado 6 s) e o saldo fixo do simulador viraram achados.
6. **Duplicados:** o relatório não cruza com os bugs já conhecidos dos testes automatizados.

## 9. Comparação com os testes automatizados do mesmo dia

No mesmo commit e no mesmo escopo, o QA gerou testes e2e (Playwright) e de API (Postman) a partir das regras validadas da especificação.

- **Bugs reais:** 9, aceitos pelo QA. Exemplos:
  - estorno simultâneo duplicando o lançamento no razão;
  - tarifa lançada como devolvida no estorno externo;
  - leitor vendo dados financeiros, contra a matriz de papéis;
  - portaria sem o tipo e o assento do ingresso;
  - cores por motivo de recusa;
  - motivo de cancelamento fixo.
- **Bugs de tela:** vários desses também aparecem na tela (PORT-03, 04, 05; ORG-03, 04). A tela era alcançável pelas personas, mas elas não acharam esses bugs. As personas não conhecem a regra, então não sabem que deveria haver tipo e assento, ou uma cor por motivo.

**Leitura possível:** o teste exploratório com personas, como está, mede **dificuldade de uso**. Ele não mede **conformidade**. Os bugs de regra vêm da especificação, e as personas, por desenho, não a conhecem.

## 10. Perguntas para a decisão

1. **Objetivo:** o pipeline deve continuar com o objetivo "achar bugs"? Ou deveria virar "achar problemas de usabilidade", com um relatório de sugestões e só bugs inequívocos à parte?
2. **Triagem em três destinos:** vale adotar BUG / SUGESTÃO / RETIRADO e a regra "ALTA só se uma pessoa real, do jeito comum, chega num resultado errado"? Isso está na seção 8 do arquivo de melhorias.
3. **Intencional ou bug:** vale incluir uma etapa que consulta a especificação (matriz de papéis, regras validadas) e a lista de bugs conhecidos antes de dar severidade? E transformar em DÚVIDA para o dev o que for "o papel X não consegue Y"?
4. **Verificador:** ele deve testar também o jeito comum de cada interação, e não só repetir o da persona?
5. **Cenários simulados:** vale ajustá-los para imitar o uso real (QR por 1 s, avisar sobre o saldo de teste)?
6. **Custo:** com 0 bugs e 11 sugestões por US$ 22, compensa rodar com essa frequência? Ou só antes de release, em modo econômico (Haiku) e com menos missões?
7. **Conhecimento da spec:** a persona deve saber algo dela, ou o "olhar de quem não sabe" é o valor e a conformidade fica só com os testes automatizados?

## 11. Arquivos da execução (para consulta)

- **Relatório, já com a revisão humana em cada achado:** `~/Documents/gd-ticket-new/.exploratorio/execucoes/2026-10-19-1626/relatorio.md`
- **Achados brutos de cada persona:** `.../execucoes/2026-10-19-1626/achados-<persona>.md`
- **Resultado do verificador:** `.../execucoes/2026-10-19-1626/verificacao.md`
- **Prompts usados:** `.../execucoes/2026-10-19-1626/prompts/` e `prompts-verif/`
- **Configuração do ambiente, personas e missões:** `~/Documents/gd-ticket-new/.exploratorio/config.md`, `personas.md` e `missoes.md`
- **Histórico, com o status de cada achado:** `~/Documents/gd-ticket-new/.exploratorio/historico.md`
- **Propostas de mudança, lição por lição:** `~/Desktop/melhorias-pipeline-teste-exploratorio.md`
- **Definição do pipeline:** `~/.claude/skills/teste-exploratorio/` e `~/.claude/agents/exploratorio-*.md`
