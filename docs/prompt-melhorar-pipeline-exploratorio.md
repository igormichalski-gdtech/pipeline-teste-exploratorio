# Prompt: melhorar o pipeline de teste exploratório com personas

Cole o texto abaixo numa sessão do Claude Code aberta em `~/Documents/gd-ticket-new`.

---

Você vai revisar e melhorar o meu pipeline de teste exploratório com personas, com base no resultado
real da primeira execução. Leia tudo antes de propor qualquer coisa.

## Material

1. `~/Desktop/resultado-pipeline-teste-exploratorio.md`: os resultados da execução 2026-10-19-1626.
   Foram 20 achados entregues, e na revisão humana sobraram 0 bugs, 11 sugestões e 9 retirados. Tem
   também o custo e a comparação com os testes automatizados.
2. `~/Desktop/melhorias-pipeline-teste-exploratorio.md`: as lições 1 a 11, cada uma com o que
   aconteceu, por que passou e a mudança sugerida.
3. **Definição atual do pipeline:**
   - `~/.claude/skills/teste-exploratorio/SKILL.md`, `personas.md`, `missoes-e-tours.md`, `formato.md`
     e `PESQUISA.md`;
   - `~/.claude/agents/exploratorio-preparador.md`, `exploratorio-persona.md` e
     `exploratorio-verificador.md`.
4. **A execução em si:** `~/Documents/gd-ticket-new/.exploratorio/`, com `config.md`, `personas.md`,
   `missoes.md`, `historico.md` e `execucoes/2026-10-19-1626/` (relatório já revisado, achados por
   persona, verificação e prompts usados).

## Decisões que já tomei (não discuta, aplique)

- **Critério de bug:** fica como bug só o que uma pessoa real, fazendo do jeito comum, encontra com o
  sistema mostrando ou fazendo algo errado.
- **Fora da lista de bugs:** gesto incomum (ex.: digitar por cima do valor sem selecionar) e efeito
  de recurso simulado (câmera falsa, simulador de pagamento) não são bug.
- **UX:** falta de confirmação, rótulo, texto e acabamento são sugestão, não bug.
- **Regra validada da spec e comportamento intencional** (confirmado pelo dev) não são bug.
- **Números certos com bases diferentes** entre telas não são bug.
- **Layout quebrado no caminho comum é bug.** Exemplo: menu cortado que obriga a rolar para achar a
  ação.

## O que eu quero

1. **Diagnóstico curto:** quais lições são as mais importantes, e se alguma proposta do arquivo de
   melhorias está errada ou é cara demais. Responda também às 7 perguntas da seção 10 do arquivo de
   resultados, com a sua recomendação para cada uma.
2. **Implementação:** aplique as mudanças na skill e nos 3 agentes. Prioridade:
   - **Triagem com três destinos** (BUG / SUGESTÃO / RETIRADO), com o critério acima, e relatório com
     as seções separadas e só os BUGs contados por severidade.
   - **Verificador** que repete também o jeito comum da interação, e não só o da persona.
   - **Antes de dar ALTA:** checar a spec e os bugs conhecidos dos testes automatizados, e tratar como
     DÚVIDA para o dev qualquer "o papel X não consegue Y".
   - **Missões:** só com caminhos que o papel tem pela navegação, sem esbarrar nas regras de segurança
     do agente (ou liberando-as explicitamente quando o ambiente é simulado).
   - **Cobertura:** toda tela do escopo visitada (matriz tela × sessão) e menus de ação abertos e
     conferidos visualmente.
   - **Preparador:** valida os dados que promete, confere links entre apps e gera câmera falsa
     realista (QR por cerca de 1 s).
   - **Motivo da desistência** classificado (SISTEMA / AMBIENTE / CENÁRIO DO TESTE).
   - **Custo:** limite do tour de dados ruins e `maxTurns` por sessão.
3. **Antes de editar,** copie os arquivos originais para `~/.claude/skills/teste-exploratorio/_backup-<data>/`.
4. **No fim,** me entregue:
   - a lista do que mudou em cada arquivo, em uma linha por mudança;
   - o que você decidiu NÃO mudar e por quê;
   - uma estimativa de como a execução 2026-10-19-1626 teria saído com o pipeline novo (quantos
     achados em cada destino).

Não rode uma execução nova do pipeline sem me perguntar.
