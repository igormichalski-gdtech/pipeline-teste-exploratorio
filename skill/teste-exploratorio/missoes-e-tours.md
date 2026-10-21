# Missões, tours e dados realistas

## Missões

Uma missão é uma tarefa real, com objetivo de negócio e dados concretos, escrita como alguém pediria
para a persona no trabalho. Ela diz **o quê**, nunca **como**.

**Boa:** "Crie uma campanha para receber contatos pelo Instagram da clínica
(www.instagram.com/clinicabella) e coloque o link da política de privacidade que fica no site
(clinicabella.com.br/privacidade)."

**Ruim:** "Abra Marketing > Nova campanha, preencha Sites autorizados e valide a origem."
(diz o caminho, usa termo técnico e entrega a regra)

Regras:
- Use o vocabulário da persona e dados com cara de reais (nomes, telefones, endereços, valores).
- Dados que o sistema exige únicos (e-mail, CPF/CNPJ, telefone) precisam ser diferentes em cada
  sessão de persona da mesma execução. Ao montar o prompt, troque-os por variações
  (`juliana.prado+carla@...`, `juliana.prado+carlah@...`); senão uma persona tropeça no dado da outra.
- Inclua dados no formato em que as pessoas os têm à mão (ver catálogo abaixo), não no formato que o
  sistema espera.
- Cubra também o que acontece depois: "...e confira se o cliente aparece na sua lista".
- Inclua missões de **correção** ("você digitou o telefone errado ontem, corrija") e de
  **consulta** ("descubra quantas vendas a equipe fechou este mês").
- 3 a 6 missões por módulo; priorize as tarefas mais frequentes do dia a dia e as que mexem com
  dinheiro ou com o cliente final.

### Teste de viabilidade (toda missão passa antes de entrar em `missoes.md`)

1. **O papel tem o caminho?** Confira na matriz de papéis (`conhecimento/fontes.md`) e no menu real
   daquele papel (o preparador lista o menu de cada papel no `mapa-do-produto.md`) que a persona
   chega à tarefa **navegando**. Não dê a uma persona uma tarefa que o papel dela só alcança por link
   direto ou que pertence a outro papel. Se a dúvida é justamente "esse papel deveria conseguir?",
   não escreva a missão: registre a pergunta como DÚVIDA no plano.
2. **Esbarra nas regras de segurança do agente?** A persona não conclui pagamentos e para antes de
   confirmar envios para fora (e-mail, mensagem, cobrança, aviso a clientes). Se a missão exige isso:
   - ambiente simulado (pagamento de teste, e-mail só local) → a sessão recebe a **liberação explícita**
     no prompt ("neste ambiente você pode confirmar pagamento e envio de e-mail; nada sai da máquina");
   - caso contrário → a missão não entra.
3. **O dado existe?** Missão que depende de dado preparado ("a revisão de pagamento pendente") só
   entra se o item tiver ✓ na lista de dados prometidos do `config.md`.
4. **A missão é independente?** Se depende de outra missão dar certo, dê a ela um dado preparado
   próprio ("a Juliana já está cadastrada"), para que uma falha não derrube as seguintes.
5. **O recurso simulado deixa fazer?** Se a missão precisa escolher algo que o recurso simulado não
   controla (ex.: qual ingresso aparece na câmera falsa), peça ao preparador um cenário próprio.

Formato em `.exploratorio/missoes.md`:

```markdown
## <Módulo em linguagem de usuário>
- [M-<mod>-1] (Carla, Rogério) <missão>
- [M-<mod>-2] (Bruno) <missão>
```

## Tours (exploração livre guiada)

Depois das missões, cada persona faz um tour de 10 a 15 minutos. Escolha um por sessão e varie entre
execuções (adaptados de Whittaker e da prática de exploratory testing):

| Tour | O que fazer |
|---|---|
| **Do dinheiro** | o caminho que gera receita ou atende o cliente final, de ponta a ponta, como um cliente novo |
| **Dos marcos** | ir de uma tela importante para outra pelo caminho mais natural; anotar onde se perde |
| **Dos dados ruins** | usar o catálogo abaixo nos campos de **um** formulário por sessão (é o tour mais caro) |
| **Do desfazer** | criar algo, editar, cancelar no meio, voltar, excluir, tentar recuperar |
| **Da interrupção** | começar um cadastro longo, sair para outra tela, voltar, recarregar a página |
| **Do celular** | a mesma missão principal em 390×844, só com toque (sem teclado físico) |
| **Do coletor de lixo** | visitar as telas atribuídas no plano, uma a uma, abrindo cada menu "⋯", seletor e calendário e olhando se a lista aparece inteira |
| **Do novato** | primeiro dia: entrar e tentar entender sozinho para que serve cada área |

Escreva o tour como um "charter" (formato de Elisabeth Hendrickson):
"Explore **<área>** com **<recurso ou técnica>** para descobrir **<que tipo de problema>**."

## Campos de risco (obrigatórios em toda execução)

Antes de montar o plano, liste no escopo **todo campo que move dinheiro ou dado sensível**: valor de
resgate/saque/transferência, preço, desconto, cupom, meta, valor de cobrança, taxa, chave Pix,
CPF/CNPJ, dados bancários. Para cada campo, uma sessão com um papel que tenha acesso passa por ele
com o catálogo de dados ruins. A lista vai no `plano.md` (campo · tela · sessão responsável) e no
relatório ("campos de risco cobertos / não cobertos"). Campo de risco nunca depende do sorteio de tour.

**Valor em dinheiro, sempre com todos estes formatos:** `150,00` · `150.00` · `1.500,00` · `1500` ·
`R$ 150` · `10.50` · `0,1` · `000000.1` · colado com espaço no fim. Para cada um, a persona anota o
valor que a tela mostra **antes de confirmar** (no campo, no resumo, na tela de confirmação). Valor
mostrado diferente do digitado, ou nenhum valor para conferir antes de confirmar, é achado.

**Ação financeira irreversível** (resgate, saque, estorno, pagamento, cobrança): a persona confere se a
confirmação (senha, OTP, "tem certeza?") mostra o **valor e o destino**. Ela nunca confirma a operação
com valor suspeito: para na senha/OTP e registra. Com valor certo, só confirma se a sessão tiver a
liberação explícita de ambiente simulado.

## Cobertura de telas

O plano tem a matriz **tela do escopo × sessão que passa por ela**, montada a partir das telas do
`mapa-do-produto.md`:

1. Marque as telas que cada missão atravessa.
2. As telas que sobrarem são divididas entre as sessões no tour "do coletor de lixo" (cerca de 5 a 8
   telas por sessão, com um papel que tenha acesso a elas).
3. A varredura de layout (`varredura-layout.mjs`) passa por **todas** as telas do escopo, com um
   usuário de cada papel, independentemente das personas.
4. O relatório lista as telas não visitadas por nenhuma persona e o motivo.

## Dados como as pessoas digitam

Para cada tipo de campo, use os valores abaixo. Em cada um, o esperado é **aceitar e normalizar** ou
**recusar com uma mensagem que a persona entenda e consiga corrigir**. Recusar algo razoável com
mensagem técnica é achado.

| Campo | Valores |
|---|---|
| Site / link | `www.empresa.com.br` · `empresa.com.br` · `https://empresa.com.br/` · `HTTPS://EMPRESA.COM.BR` · `instagram.com/empresa` · `@empresa` · link colado com espaço no fim |
| Telefone | `67 99999-1234` · `(67) 99999-1234` · `67999991234` · `+55 67 99999 1234` · `999991234` (sem DDD) · fixo `(67) 3333-4444` |
| E-mail | `Maria.Silva@Gmail.com` · com espaço no fim · `maria@empresa` (sem .com) |
| CPF / CNPJ | com e sem pontuação · colado de PDF com espaços |
| Data | `5/3` · `05/03/2026` · `5 de março` · data no passado · fim de semana · 29/02 |
| Hora / duração | `15h` · `15:30` · `3 da tarde` · `1h30` · `90 min` |
| Valor | `150,00` · `150.00` · `1.500,00` · `1500` · `R$ 150` · `10.50` · `0,1` · `000000.1` · `1500.50` · `0` · negativo · colado com espaço |
| Nome / texto | acentos e cedilha · `D'Ávila` · emoji · 1 caractere · texto muito longo colado · só espaços |
| Quantidade | `0` · `1` · `-1` · `1,5` · `1000000` |
| Arquivo | foto do celular grande (8 MB) · PDF · imagem com nome com acento e espaço |

Também: deixe campo obrigatório vazio; preencha e apague; cole em vez de digitar; dê duplo clique
em "Salvar"; aperte Enter no meio do formulário.
