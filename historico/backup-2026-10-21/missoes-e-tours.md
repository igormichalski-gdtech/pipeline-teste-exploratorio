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
| **Dos dados ruins** | usar o catálogo abaixo em todos os campos de um formulário |
| **Do desfazer** | criar algo, editar, cancelar no meio, voltar, excluir, tentar recuperar |
| **Da interrupção** | começar um cadastro longo, sair para outra tela, voltar, recarregar a página |
| **Do celular** | a mesma missão principal em 390×844, só com toque (sem teclado físico) |
| **Do coletor de lixo** | visitar todas as telas do menu, uma a uma, procurando o que está estranho |
| **Do novato** | primeiro dia: entrar e tentar entender sozinho para que serve cada área |

Escreva o tour como um "charter" (formato de Elisabeth Hendrickson):
"Explore **<área>** com **<recurso ou técnica>** para descobrir **<que tipo de problema>**."

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
| Valor | `1500` · `1.500` · `1.500,00` · `R$ 1.500` · `1500.50` · `0` · negativo |
| Nome / texto | acentos e cedilha · `D'Ávila` · emoji · 1 caractere · texto muito longo colado · só espaços |
| Quantidade | `0` · `1` · `-1` · `1,5` · `1000000` |
| Arquivo | foto do celular grande (8 MB) · PDF · imagem com nome com acento e espaço |

Também: deixe campo obrigatório vazio; preencha e apague; cole em vez de digitar; dê duplo clique
em "Salvar"; aperte Enter no meio do formulário.
