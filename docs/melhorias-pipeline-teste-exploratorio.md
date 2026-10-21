# Melhorias para o pipeline de teste exploratório (/teste-exploratorio)

Lições da execução 2026-10-19-1626 no gd-ticket-new (5 personas, 20 achados, US$ 22,37).
Use este arquivo como entrada para ajustar a skill (`~/.claude/skills/teste-exploratorio/`) e os
agentes `exploratorio-persona`, `exploratorio-verificador` e `exploratorio-preparador`.

## 1. Falso positivo: jeito de digitar não é bug (decisão do Igor, 20/10/2026)

**O que aconteceu:** o achado "Preço do ingresso se mistura com o valor que já estava no campo" saiu
como ALTA / bug. O campo de valor em reais junta os números digitados com os que já estavam. Isso
só acontece quando a pessoa clica no meio ou no começo do valor e digita por cima. Com dois cliques
(ou selecionando tudo), o valor é apagado e a digitação funciona (`7000` → R$ 70,00). O Igor
classificou como **não é bug**: é o comportamento comum desse tipo de campo, e o usuário real dá
dois cliques e reescreve.

**Por que passou:** a persona e o verificador digitaram tecla a tecla com o cursor em uma posição
qualquer. Ninguém testou o jeito mais comum de substituir um valor (duplo clique / selecionar tudo
e digitar). O verificador confirmou "2/2" porque repetiu o mesmo jeito errado.

**Mudanças sugeridas:**
- **Verificador:** antes de dar CONFIRMADO em achado de digitação/edição de campo, repetir também
  do jeito mais comum de substituir um valor: duplo clique (ou selecionar tudo) e digitar. Se o
  jeito comum funciona, classificar como **NÃO É BUG (forma de digitar)** e não como CONFIRMADO.
- **Triagem (orquestrador):** achado que depende da posição do cursor ou de um gesto incomum não
  entra como bug. No máximo INCOMODA "não verificado", fora da contagem de severidade, ou descartado.
  Severidade ALTA exige que o problema aconteça no caminho que a maioria das pessoas usa.
- **Persona:** o comportamento "digita do jeito dela" vale para o FORMATO do dado (vírgula, espaço,
  sem https), não para a mecânica do campo. Para trocar um valor que já existe, a persona faz o que
  todo mundo faz (duplo clique ou apagar e digitar), a não ser que o cartão diga o contrário.
- **Formato do achado:** acrescentar o campo "Como digitou/editou" (clicou e digitou por cima,
  selecionou tudo, apagou antes) para a triagem enxergar isso.

## 1b. Falso positivo: efeito da câmera falsa (decisão do Igor, 20/10/2026)

**O que aconteceu:** "Portaria: quem acabou de entrar aparece como 'já usado'" saiu como ALTA. A
portaria volta a ler a câmera 1,5 s depois de liberar; o vídeo da câmera falsa segura cada QR por
6 s, então o mesmo QR era lido de novo e a tela mostrava "já usado". O Igor classificou como
**não é bug**: na porta real é difícil o QR ficar parado na câmera depois da liberação, e se ele for
lido de novo, "já usado" é a resposta certa.

**Por que passou:** o cenário de teste (vídeo em loop, 6 s por QR) criou uma condição artificial,
e a triagem confirmou pelo código sem perguntar se a condição acontece na vida real.

**Mudanças sugeridas:**
- **Preparador:** no vídeo da câmera falsa, mostrar cada QR por pouco tempo (cerca de 1 s) e
  intercalar com quadros sem QR, imitando a pessoa que mostra e tira o celular.
- **Triagem:** achado que só aparece por causa de um recurso simulado (câmera falsa, simulador de
  pagamento, e-mail local) só entra se a mesma condição for plausível no uso real. Na dúvida,
  vira DÚVIDA para o humano, não ALTA.
- **Regra geral (vale para 1 e 1b):** antes de dar ALTA, perguntar "uma pessoa real, do jeito
  comum, chegaria nesse resultado?". Se a resposta depende de um gesto incomum ou de um artefato do
  teste, não é ALTA.

## 2. Missões que conflitam com as regras de segurança do agente

- A persona tem a regra "não concluir pagamentos" e "parar antes de confirmar o que envia algo para
  fora (e-mail, mensagem, cobrança)". Mesmo assim, as missões pediram pagar pendências (M-FIN-4) e
  mudar data e cancelar evento (M-SEN-1), que avisam compradores. Resultado: 2 desistências que não
  dizem nada sobre o sistema.
- **Mudança:** ao escrever `missoes.md`, o orquestrador marca as missões que esbarram nessas regras.
  Se o ambiente é local, o pagamento é simulado e o e-mail cai só no Mailpit, liberar
  explicitamente no prompt da persona: "neste ambiente você pode confirmar pagamento/e-mail".
  Caso contrário, não escrever a missão.

## 3. Separar desistência por causa do sistema de desistência por causa do teste

- Das 9 desistências, só 6 foram obstáculos do sistema. As outras: regra de segurança (2) e
  limite do cenário (1, a fila da câmera falsa não deixa escolher o ingresso).
- **Mudança:** na tabela de missões do relatório, a coluna "Resultado" ganha o motivo da
  desistência em uma de três categorias: SISTEMA, AMBIENTE, CENÁRIO DO TESTE. Só SISTEMA conta como
  sinal de problema.

## 4. Itens do ambiente que viraram achado e custaram tempo

- **Links para outra porta:** "Ver página" e "Abrir ingresso" apontam para `localhost:3000`, mas a
  loja local está na 13000. Duas personas marcaram como BLOQUEIA.
  → O preparador deve conferir os links que saem do painel para a loja e listar em `config.md`
  ("indisponível: links para a loja apontam para :3000").
- **Simulador de pagamento:** o saldo fixo de R$ 1.000.000 gerou achados de "saldo não mexe" e
  "saldo absurdo".
  → Avisar a persona no prompt, em linguagem dela, que "o saldo grande da conta é de teste".
  Outra opção é o orquestrador descartar automaticamente achados que citam esse valor.
- **Dado preparado que não existia:** a divergência de pagamento ficou "expirada" e não gerou
  revisão, e a Sandra procurou algo que não existia.
  → O preparador deve VALIDAR cada dado prometido em `config.md` (consultar a tela ou o banco)
  antes de entregar, e o orquestrador deve conferir antes de escrever a missão.

## 5. Portaria com câmera falsa

- A câmera falsa funcionou com o `--agents` JSON e o MCP com `--config`. Mas o vídeo em loop deixa o
  QR na frente da câmera por 6 s, o que provocou o achado "liberado vira já usado". Na vida real
  o tempo é parecido (2 a 5 s), por isso esse achado foi mantido, mas vale registrar a dependência.
- **Mudança:** o preparador gera vídeos por cenário (um ingresso por vídeo, ou "válido → já usado")
  para as missões específicas, como a reentrada, em vez de uma fila única que a persona não controla.
- Documentar na skill como lançar a persona com câmera:
  `claude -p --agents <json com mcpServers --config> --agent exploratorio-persona-camera`.

## 6. Custo

- Uma sessão (Lucas, eventos) custou US$ 4,60 sozinha, com 155 chamadas e 5 missões mais um tour
  de "dados ruins" em 3 formulários.
- **Mudança:** limitar o tour de dados ruins a 1 formulário por sessão, ou baixar o `maxTurns`
  dessa sessão. O padrão de ~6 missões por sessão está bom; a sessão cara foi a do tour.

## 7. Verificador e ações destrutivas

- O verificador não pôde reproduzir "excluir membro sem confirmação" porque é destrutivo.
- **Mudança:** o preparador cria dados descartáveis com prefixo (membro `EXPL-VERIF`, convite
  `EXPL-VERIF`) para o verificador poder confirmar ações destrutivas sem tocar no que as personas
  usaram.

## 8. Triagem: separar bug de sugestão (revisão do Igor, 20/10/2026)

Dos 20 achados da execução, só 2 ficaram como bug depois da revisão. 11 viraram sugestão de
melhoria e 7 saíram (2 descartados antes, 5 na revisão). O relatório tratava tudo como bug, e
isso infla a lista.

**Critério do Igor:** fica como bug só o que uma pessoa real, fazendo do jeito comum, encontra com o
sistema **mostrando ou fazendo algo errado**.

**Mudanças sugeridas na Etapa 5 (triagem) e no formato do relatório:**
- Três destinos para cada achado:
  - **BUG:** o sistema erra, ou seja, dado errado, regra validada descumprida ou tarefa comum impossível.
  - **SUGESTÃO:** funciona, mas a experiência pode melhorar (falta de confirmação, rótulo, texto,
    acabamento, recurso que não existe). Vai numa seção separada, sem severidade e fora da contagem.
  - **RETIRADO:** já coberto por um bug dos testes automatizados, é regra validada da spec, é
    artefato do ambiente/teste, ou são números certos com bases diferentes.
- **Números diferentes entre telas:** antes de chamar de bug, conferir se cada número está certo na
  sua própria base. Exemplos: bruto com e sem a venda estornada; vendidos com e sem o cancelado. Se
  estiverem, é SUGESTÃO de rótulo, não bug.
- **Falta de confirmação** ("excluiu sem perguntar") é SUGESTÃO de UX, não bug, a menos que a spec
  exija confirmação.
- **Regra validada da spec** (ex.: RN-43) que incomoda a persona é pergunta para o PO, não bug.
- **Cruzar com os bugs conhecidos** dos testes automatizados (e2e/api-tests) antes de reportar, e
  retirar o que já está coberto (ex.: PORT-04 e PORT-05).
- **Antes de entregar:** reler cada BUG e perguntar "uma pessoa real chegaria nisso do jeito comum, e
  o sistema está errado?". Se não, rebaixar.

## 9. Confirmar a intenção antes de dar ALTA (20/10/2026)

O último ALTA da execução ("o Financeiro não vê eventos e não consegue reembolsar") era
**comportamento intencional**, confirmado pelo dev. O papel Financeiro não lista eventos de
propósito; a tela de reembolsos funciona para ele pelo link. O achado nasceu de uma missão minha
(dar reembolso à persona Financeiro) que supôs um caminho que o produto não oferece a esse papel.

**Mudanças sugeridas:**
- **Missões:** só dar a uma persona tarefas que o papel dela faz pela navegação do produto. Na
  dúvida, conferir a matriz de papéis (spec) e o menu daquele papel antes de escrever a missão.
- **Triagem:** achado que diz "o papel X não consegue fazer Y" vira DÚVIDA para o dev/PO, e não
  ALTA, até alguém confirmar que X deveria fazer Y por aquele caminho.
- **Resultado da execução 2026-10-19-1626:** depois da revisão, sobrou 1 bug baixo (capacidade
  exibida 180 × 230), 11 sugestões e 8 retirados. Sinal de que a triagem precisa ser bem mais
  rígida antes de entregar.

## 10. Navegador do Playwright fecha caixinhas do navegador sozinho (20/10/2026)

Na reprodução manual do PORT-05, o QA usou a janela "Chrome for Testing" aberta pelo Playwright (a
da câmera falsa). A lixeira do histórico abre um `window.prompt`, e o Playwright **fecha
automaticamente** todo `prompt`, `alert` e `confirm` quando o script não registra um tratador de
`dialog`. Resultado: o clique "não faz nada", o que parece bug, mas é artefato da ferramenta.

**Mudanças sugeridas:**
- O script que abre a portaria com câmera (`abrir-portaria-camera.mjs`) deve registrar
  `page.on('dialog', …)` para deixar a caixinha aberta para a pessoa, ou avisar na janela que ela só
  serve para a portaria.
- Personas e verificador rodam pelo Playwright MCP, que trata diálogos com `browser_handle_dialog`.
  Na triagem, um achado do tipo "o botão não faz nada" em tela com `window.prompt`/`confirm` precisa
  conferir se o diálogo foi tratado antes de virar achado.
- Em reprodução manual, orientar o humano a usar o navegador dele, e não a janela do Playwright.

## 11. Falso negativo: menu cortado na tabela de Equipes de evento (21/10/2026)

O QA achou na mão um bug visual que nenhuma camada pegou. O menu "⋯" da linha do time abre preso
dentro da caixa da tabela (`overflow: hidden`), cortado e com rolagem interna. A causa é
`Dropdown.Content` sem `strategy="fixed"` em `equipes-evento/team-list.tsx:76`.

**Por que o pipeline não pegou:**
- **Cobertura:** nenhuma missão passou por Equipes de evento. As missões cobriram só parte das telas
  do escopo, e o tour do "coletor de lixo" foi feito em um único módulo (Financeiro).
- **Teste automatizado:** o Playwright rola o item para dentro da área visível antes de clicar, então
  o teste de RF-CTA-22 passou com o menu cortado. Nenhuma camada confere o visual.

**Mudanças sugeridas:**
- **Plano da execução:** gerar a matriz "tela do escopo × sessão que passa por ela" e garantir que toda
  tela do `mapa-do-produto.md` seja visitada por ao menos uma persona (missão ou tour). Listar no
  relatório as telas não visitadas.
- **Persona:** ao abrir menus "⋯", seletores e calendários, olhar se a lista aparece inteira. Menu
  cortado, com rolagem interna ou escondido atrás de outro elemento é achado de layout.
- **Tour "coletor de lixo":** fazer em todas as telas do escopo (pode ser dividido entre sessões),
  abrindo cada menu de ação das tabelas.
- **Achados visuais:** separar "layout quebrado no caminho comum" (bug) de "acabamento" (sugestão).
  Menu cortado que obriga a rolar para achar a ação conta como bug de layout.

## 12. Falso negativo: campo de resgate multiplica por 100 com ponto decimal (21/10/2026)

O QA achou na mão: no Resgatar, `150.00` vira R$ 15.000,00, `10.50` vira R$ 1.050,00 e `000000.1` vira
R$ 1,00 (`moneyToCents` em `financeiro/wallet-payout-overlays.tsx:458` remove todos os pontos). A tela
de senha não mostra o valor.

**Por que passou:** o catálogo já tinha `1500.50`, mas o tour de dados ruins rodou só nos formulários de
evento, e a persona do resgate digitou `150,00`. A queixa "a senha não mostrou o valor" ficou como
INCOMODA.

**Mudanças:**
- Lista obrigatória de **campos de risco** (dinheiro e dado sensível) no plano. Toda execução passa em
  cada um com os formatos de valor do catálogo e registra o valor mostrado antes de confirmar.
- **Confirmação de operação financeira** sem valor e destino visíveis vai para a triagem como risco.
- Valor interpretado diferente do digitado, em formato comum, é **BUG ALTA**.
- A persona não confirma resgate suspeito; o verificador confirma interceptando a requisição.

## 12. Falso negativo: resgate lê `150.00` como R$ 15.000,00 (21/10/2026)

**O que aconteceu:** o QA achou na mão um bug grave no resgate (Financeiro › Carteira › Resgatar). O
campo "Quanto você quer resgatar?" remove todos os pontos antes de ler o número: `150.00` vira
R$ 15.000,00, `10.50` vira R$ 1.050,00 e `000000.1` vira R$ 1,00. A tela de senha que vem depois não
mostra o valor, e a pessoa confirma sem ver. Causa: `moneyToCents` em
`apps/organizer-admin/src/app/dashboard/[tenantId]/financeiro/wallet-payout-overlays.tsx:458`, num
`TextField` comum, sem máscara.

**Por que o pipeline não pegou:**
- O catálogo "dados como as pessoas digitam" já tinha `1500.50`, mas o tour de dados ruins foi aplicado
  só nos formulários de evento (uma sessão), e a persona do resgate (Marcos) digitou `150,00`.
- A cobertura foi escolhida pelo sorteio do tour, não pelo risco: o campo que tira dinheiro da empresa
  ficou fora do teste de entrada de dados.
- A queixa "a senha não mostrou o valor" virou INCOMODA e ninguém a ligou ao risco de valor errado.

**Mudanças (decisão do Igor):**
1. **Campos de risco obrigatórios em toda execução.** Antes do plano, o orquestrador lista no escopo
   todo campo que move dinheiro ou dado sensível (valor de resgate/saque, preço, desconto, meta, valor
   de cobrança, chave Pix, CPF/CNPJ) e garante que ao menos uma sessão passe em cada um com o catálogo
   de dados ruins. A lista fica no `plano.md` e no relatório ("campos de risco cobertos / não cobertos").
2. **Valor em dinheiro com todos os formatos, sempre:** `150,00`, `150.00`, `1.500,00`, `1500`,
   `R$ 150`, `10.50`, `0,1`, `000000.1`, colado com espaço. Para cada um, a persona anota o valor que
   a tela mostra ANTES de confirmar. Valor na confirmação diferente do digitado, ou sem valor para
   conferir, é achado.
3. **Ações financeiras irreversíveis:** a persona confere se a confirmação (senha/OTP) mostra o valor
   e o destino. A falta disso, em operação que tira dinheiro, vai para a triagem como risco, não como
   INCOMODA.
4. **Triagem:** "valor interpretado diferente do digitado" em campo de dinheiro, com formato comum
   (ponto decimal é comum no teclado do celular), é BUG ALTA pelo critério (pessoa real, jeito comum,
   sistema faz algo errado). Diferente do preço do ingresso, que só falhava digitando por cima sem
   selecionar.
5. **Segurança do teste:** a persona NÃO confirma o resgate com valor suspeito; para na senha e
   registra. O verificador confirma pelo valor exibido (ou pela requisição), sem mover dinheiro.

**Aplicado em 21/10/2026:** `missoes-e-tours.md` (campos de risco e formatos de dinheiro),
`SKILL.md` (Etapa 2: lista de campos de risco no plano; Etapa 5: regra de triagem), `triagem.md`
(dinheiro interpretado diferente = BUG ALTA; confirmação sem valor/destino = risco),
`formato.md` (seção de campos de risco no relatório) e agentes `exploratorio-persona` e
`exploratorio-verificador`.
