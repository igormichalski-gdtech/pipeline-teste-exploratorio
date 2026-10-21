#!/usr/bin/env python3
"""Mede tokens e custo estimado de uma execução do teste exploratório.

Uso:
  medir-tokens.py [--desde 2026-10-19T14:29:00] ROTULO=arquivo.jsonl [ROTULO=arquivo.jsonl ...]

Cada arquivo é uma transcrição do Claude Code (sessão principal ou subagente, em
~/.claude/projects/<projeto>/<sessao>/subagents/agent-<id>.jsonl). --desde filtra mensagens a partir
de um instante (útil para a sessão principal, que tem histórico anterior à execução).
"""
import json, sys
from collections import defaultdict

# US$ por milhão de tokens: entrada, saída, leitura de cache. Escrita de cache = 1,25x entrada (5 min)
# ou 2x entrada (1 h). Haiku 5.5: leitura de cache estimada em 10% da entrada.
PRECOS = {
    'claude-opus-5-5': (4.00, 20.00, 0.20),
    'claude-sonnet-5-5': (2.00, 10.00, 0.20),
    'claude-haiku-5-5': (0.10, 0.50, 0.01),
    'claude-fable-5-1': (10.00, 50.00, 0.25),
}

def medir(caminho, desde):
    por_msg = {}
    for linha in open(caminho):
        try:
            d = json.loads(linha)
        except ValueError:
            continue
        if d.get('type') != 'assistant' or (desde and d.get('timestamp', '') < desde):
            continue
        m = d.get('message') or {}
        if m.get('usage') and m.get('id'):
            por_msg[m['id']] = (m.get('model'), m['usage'])  # a última ocorrência traz o uso final
    tot = defaultdict(lambda: defaultdict(int))
    for modelo, u in por_msg.values():
        t = tot[modelo]
        t['chamadas'] += 1
        t['entrada'] += u.get('input_tokens', 0)
        t['saida'] += u.get('output_tokens', 0)
        t['cache_leitura'] += u.get('cache_read_input_tokens', 0)
        cc = u.get('cache_creation') or {}
        t['cache_escrita_5m'] += cc.get('ephemeral_5m_input_tokens', u.get('cache_creation_input_tokens', 0) if not cc else 0)
        t['cache_escrita_1h'] += cc.get('ephemeral_1h_input_tokens', 0)
    return tot

def custo(modelo, t):
    p = PRECOS.get(modelo)
    if not p:
        return None
    ent, sai, lei = p
    return (t['entrada'] * ent + t['saida'] * sai + t['cache_leitura'] * lei
            + t['cache_escrita_5m'] * ent * 1.25 + t['cache_escrita_1h'] * ent * 2) / 1e6

def main():
    args, desde = sys.argv[1:], None
    if args[:1] == ['--desde']:
        desde, args = args[1], args[2:]
    linhas, total = [], 0.0
    for a in args:
        rotulo, caminho = a.split('=', 1)
        for modelo, t in medir(caminho, desde).items():
            c = custo(modelo, t)
            total += c or 0
            contexto = t['entrada'] + t['cache_leitura'] + t['cache_escrita_5m'] + t['cache_escrita_1h']
            linhas.append((rotulo, modelo, t['chamadas'], contexto, t['cache_leitura'], t['saida'], c))
    print('| Agente | Modelo | Chamadas | Tokens de entrada (total) | dos quais cache lido | Tokens de saída | Custo estimado |')
    print('|---|---|---:|---:|---:|---:|---:|')
    for r, m, ch, ctx, lei, sai, c in linhas:
        print(f'| {r} | {m} | {ch} | {ctx:,} | {lei:,} | {sai:,} | {"US$ %.2f" % c if c is not None else "?"} |'.replace(',', '.'))
    print(f'| **Total** | | | | | | **US$ {total:.2f}** |')

if __name__ == '__main__':
    main()
