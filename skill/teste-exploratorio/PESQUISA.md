# Fundamentos do pipeline (pesquisa de 19/10/2026)

Por que o pipeline tem cada peça. As fontes estão no fim.

## 1. Personas: o que existe de base de conhecimento

- **GenderMag (Oregon State University).** Método consolidado de inspeção de software com personas
  definidas por 5 facetas cognitivas: motivação, estilo de processamento de informação,
  autoeficácia com computador, atitude a risco e estilo de aprendizado (por processo ou fuçando).
  Três personas (Abi, Pat e Tim) cobrem a maior parte dos estilos. Abi: autoeficácia baixa, culpa a
  si mesma e desiste; Tim: autoeficácia alta, culpa a tecnologia; Pat: no meio, insiste por um tempo
  e é avessa a perder tempo sem benefício. → É a base das 3 personas padrão (`personas.md`).
- **OCDE/PIAAC, resumido por Jakob Nielsen (NN/g), "The Distribution of Users' Computer Skills:
  Worse Than You Think".** 215.942 pessoas de 16 a 65 anos em 33 países: 14% abaixo do nível 1, 29%
  no nível 1, 26% no nível 2 e só 5% no nível 3 (o nível de quem desenvolve). Pessoas acima de 65 anos
  ficaram de fora e tendem a ser menos proficientes. → O usuário típico é nível 1–2; toda execução
  tem pelo menos uma persona nível 1.

## 2. Limites de usar IA como usuário

- **Superhuman bias.** Modelos instruídos a "agir como um aluno de 5º ano" acertam 96–99% de
  questões em que alunos reais acertam 69%. Prompt de persona sozinho quase não muda isso, e modelos
  maiores foram piores. O que funcionou foi **limitar explicitamente o que o modelo tem disponível**
  (no estudo, a quantidade de informação que ele "lembra"). ("Act Like a 5th Grader is Not Enough",
  arXiv 2608.30033.) → No pipeline: o agente-persona não tem acesso ao código (limite real de
  ferramenta), o cartão tem listas fechadas de "sabe/não sabe", orçamento de tentativas e
  comportamentos observáveis, e a regra de não reler instruções já fechadas.
- **Usuários sintéticos são positivos demais e variam pouco.** A NN/g relata que participantes
  sintéticos tendem a agradar, completam tudo e têm variabilidade artificialmente baixa; servem para
  gerar hipóteses, não para substituir pessoas. Em teste de árvore, o ChatGPT foi muito melhor que
  pessoas reais. → O prompt manda "não ser gentil com o sistema", a missão não precisa ser concluída
  e desistir é resultado válido. O pipeline **não substitui** teste com usuários reais: ele acha
  candidatos a problema de forma barata e repetível.
- **Fidelidade à persona não acompanha competência.** Simuladores podem soar como novatos e agir
  como especialistas (AgentPersonaBench); simuladores de clientes "nunca vão embora" (arXiv
  2606.20708). → Mesma resposta: limites de comportamento verificáveis e registro de desistência.

## 3. Agentes de navegador achando bugs

- **WebTestBench (arXiv 2603.25226).** Benchmark de teste web ponta a ponta com agentes rodando em
  Claude Code + Playwright MCP. Nenhum modelo passou de 30% de F1; os principais problemas foram:
  checklists incompletos (requisitos implícitos esquecidos), falsos positivos por não esperar
  carregamento assíncrono, falsos negativos por marcar "passou" sem evidência, e perda de estado em
  sessões longas. Com o checklist pronto, o F1 quase dobrou. → No pipeline: missões e tours
  escritos antes (o "checklist"), regra de esperar antes de acusar, print obrigatório como evidência,
  sessões curtas (até ~6 missões) e uma etapa separada de **verificação** que reproduz cada achado
  duas vezes.
- **UXAgent (Amazon, CHI 2025).** Sistema que gera personas e solta agentes de IA num site para
  simular testes de usabilidade; os próprios autores posicionam como piloto antes do estudo com
  pessoas, não como substituto. → Mesmo posicionamento aqui.

## 4. Teste exploratório tradicional (o que copiamos)

- **Charters (Elisabeth Hendrickson, "Explore It!"):** "Explore <alvo> com <recursos> para
  descobrir <informação>". Sessões com tempo fechado (SBTM, James Bach), tipicamente 60–90 min.
- **Tours (James Whittaker, "Exploratory Software Testing"):** roteiros temáticos como o do dinheiro,
  dos marcos, dos dados ruins, do coletor de lixo. → `missoes-e-tours.md`.

## 5. Ferramenta e custo

- **Playwright MCP** usa snapshots da árvore de acessibilidade, bem mais baratos que screenshots para
  decidir onde clicar, mas que **não mostram problemas visuais** (algo cobrindo um botão, texto
  cortado). → O agente usa o snapshot para agir e tira print nas telas importantes para enxergar.
  Ferramentas que leem o "por dentro" (`browser_evaluate`, rede, console) ficam fora do agente-persona
  e só o verificador usa.
- **Modelos (preço por milhão de tokens, entrada/saída):** Haiku 5.5 US$0,10/0,50 · Sonnet 5.5
  US$2/10 · Opus 5.5 US$4/20. A persona é quem mais consome (muitas idas e vindas); por isso Sonnet
  por padrão e Haiku no modo econômico. Triagem e leitura de código ficam no modelo mais forte, que
  roda pouco. O estudo de "superhuman bias" achou que modelos menores imitaram melhor o novato;
  vale comparar os dois modos no seu produto antes de fixar um.

## Fontes
- GenderMag — Foundations: https://gendermag.org/foundations.php · Handout do método: https://gendermag.org/Docs/GenderMagHandout-2021-0404.pdf · Personas vs. estereótipos (CHI 2017): https://web.engr.oregonstate.edu/~burnett/Reprints/chi17-GenderMagPersonas-vs-stereotypes.pdf
- Nielsen, "The Distribution of Users' Computer Skills: Worse Than You Think": https://nngroup.com/articles/computer-skill-levels
- NN/g, Synthetic users: https://nngroup.com/articles/synthetic-users/ · Synthetic users vs. human respondents: https://www.nngroup.com/articles/synthetic-users-vs-human-respondents/
- "Act Like a 5th Grader is Not Enough: Bounding Knowledge in LLM-Based User Simulators": https://arxiv.org/html/2608.30033
- "Simulated Customers Never Walk Away": https://arxiv.org/pdf/2606.20708 · Benchmarking Persona-Driven User Simulation: https://arxiv.org/html/2610.04379v1
- WebTestBench: https://arxiv.org/html/2603.25226
- UXAgent: https://arxiv.org/pdf/2502.12561 · https://dl.acm.org/doi/10.1145/3706599.3719729
- Playwright MCP, snapshots: https://playwright.dev/mcp/snapshots
- Subagentes do Claude Code: https://code.claude.com/docs/en/sub-agents

## Versão 2 (21/10/2026): o que mudou e por quê

A primeira execução no GD Ticket entregou 20 achados e, na revisão humana, nenhum ficou como bug.
- **Oráculo.** A persona só tem o oráculo "o que uma pessoa gostaria" (Bolton, HICCUPPS: *Users'
  desires*); bug de regra precisa do oráculo *Claims* (spec). Daí a triagem consultar spec, bugs
  conhecidos e decisões, e as personas produzirem por padrão SUGESTÃO.
  https://developsense.com/resource/Oracles.pdf
- **Agentes geram "melhorias".** No soap opera testing automatizado, a maioria dos achados verdadeiros
  dos agentes eram melhorias (19 de 32 no Firefox), contra 3 de 27 dos humanos; os falsos positivos
  vieram de alucinação, leitura de print, elemento errado e sugestões desnecessárias.
  https://arxiv.org/pdf/2412.08581
- **Verificar tentando derrubar.** Agentes comuns produzem provas plausíveis; o que filtra é analisar
  antes de provar (AnyPoC, 9,8× mais falsos rejeitados; QASecClaw, −88,6% de falsos positivos).
  Daí o verificador cego (sem a conclusão) e com o "jeito comum".
  https://arxiv.org/html/2604.11950v1 · https://arxiv.org/html/2605.01885
- **Severidade instável em LLM** (κ ≈ 0,5 para existir o problema, α ≈ 0 para severidade): daí a
  severidade por tabela, só para BUG. https://arxiv.org/abs/2512.04262v1
- **Teste guiado por requisito e por mudança** (AUITestAgent, RippleGUItester): próximos passos
  possíveis, ainda não implementados (trilha de conformidade e planejamento por git diff).
  https://arxiv.org/html/2407.09018v1 · https://arxiv.org/pdf/2603.03121
- **Varredura de layout determinística:** o falso negativo do menu cortado (lição 11) não depende de
  julgamento; um script que abre os menus e mede corte e rolagem é mais barato e mais confiável que
  uma persona olhando.
