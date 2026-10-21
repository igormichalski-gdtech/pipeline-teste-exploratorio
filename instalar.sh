#!/bin/bash
# Liga a skill e os agentes deste repositório ao Claude Code do usuário (~/.claude), por links.
# Rode de novo depois de clonar em outra máquina. Editar os arquivos aqui já vale no Claude Code.
set -e
R="$(cd "$(dirname "$0")" && pwd)"
mkdir -p ~/.claude/skills ~/.claude/agents
ligar() {
  if [ -e "$2" ] && [ ! -L "$2" ]; then mv "$2" "$2.antes-$(date +%Y%m%d%H%M%S)"; echo "guardado: $2.antes-*"; fi
  ln -sfn "$1" "$2"; echo "ok: $2 -> $1"
}
ligar "$R/skill/teste-exploratorio" ~/.claude/skills/teste-exploratorio
for a in "$R"/agents/*.md; do ligar "$a" ~/.claude/agents/"$(basename "$a")"; done
# Navegador usado pelos agentes (Playwright MCP fixado no frontmatter dos agentes)
npx -y @playwright/mcp@0.0.83 install-browser chrome-for-testing >/dev/null 2>&1 && echo "ok: navegador dos agentes"
