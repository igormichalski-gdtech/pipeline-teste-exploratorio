#!/usr/bin/env node
// Varredura de layout do teste exploratório: abre cada menu de ação, seletor, lista suspensa e
// calendário das telas indicadas e marca o que aparece cortado, com rolagem interna ou fora da tela.
// Só abre e fecha gatilhos; nunca clica em itens dos menus.
//
// Uso (rode a partir da raiz do repositório do produto, onde o Playwright está instalado):
//   node ~/.claude/skills/teste-exploratorio/varredura-layout.mjs \
//     --base http://localhost:3002 --rotas .exploratorio/execucoes/<id>/layout/rotas.txt \
//     --estado .exploratorio/ambiente/estado-admin.json --tela 1440x900 \
//     --saida .exploratorio/execucoes/<id>/layout/admin-desktop [--max-gatilhos 30]
//
// rotas.txt: uma rota por linha ("/equipes-evento"), opcionalmente seguida de " | nome da tela".
// --estado: storageState do Playwright com a sessão já logada (gerado pelo preparador).
// --fechar "Pular,Fechar": botões que fecham tutoriais e avisos antes de varrer (padrão abaixo).
// --gatilhos "<seletor CSS>": seletores extras de gatilho específicos do produto.
// Saída: resultado.json, resumo.md e um print por problema.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const arg = (nome, padrao) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : padrao;
};
const base = arg('base');
const rotasArq = arg('rotas');
const saida = resolve(arg('saida', 'varredura-layout'));
const [largura, altura] = arg('tela', '1440x900').split('x').map(Number);
const maxGatilhos = Number(arg('max-gatilhos', '30'));
if (!base || !rotasArq) {
  console.error('Faltam --base e --rotas. Veja o cabeçalho do script.');
  process.exit(2);
}

const req = createRequire(join(process.cwd(), 'noop.js'));
let pw;
for (const nome of ['playwright', '@playwright/test']) {
  try { pw = req(nome); break; } catch { /* tenta o próximo */ }
}
if (!pw) {
  console.error('Playwright não encontrado a partir de', process.cwd(), '(instale ou rode da raiz do produto).');
  process.exit(2);
}

const GATILHOS = [
  ...(arg('gatilhos') ? [arg('gatilhos')] : []),
  '[data-slot="dropdown-menu-trigger"]',
  'button[aria-label*="ações" i]', 'button[aria-label*="opções" i]', 'button[aria-label*="mais" i]',
  'button:text-is("⋯")', 'button:text-is("...")', 'button:text-is("⋮")',
  'button[aria-haspopup]:not([aria-haspopup="false"])',
  '[role="button"][aria-haspopup]:not([aria-haspopup="false"])',
  '[role="combobox"]',
  'button[aria-expanded="false"]',
].join(', ');
// Só menus, listas e calendários; painéis e janelas (role=dialog) ficam de fora de propósito.
const POPUPS = '[role="menu"], [role="listbox"], [data-radix-popper-content-wrapper] [role="grid"], [data-radix-popper-content-wrapper]:has([role="menu"], [role="listbox"], [role="grid"], [role="option"])';
const PERIGOSOS = /sair|logout|excluir|remover|apagar|delete|encerrar|cancelar evento/i;

const FECHAR = (arg('fechar') || 'Pular,Fechar,Entendi,Agora não,Dispensar,Skip,Close,Got it').split(',').map((t) => t.trim());

// Fecha tutoriais, avisos e banners que cobrem a tela (repetido até sumirem).
async function fecharSobreposicoes(p) {
  for (let i = 0; i < 6; i++) {
    let fechou = false;
    for (const t of FECHAR) {
      const b = p.getByRole('button', { name: t, exact: true });
      if (await b.first().isVisible().catch(() => false)) {
        await b.first().click({ timeout: 2000 }).catch(() => {});
        await p.waitForTimeout(250);
        fechou = true;
      }
    }
    if (!fechou) break;
  }
}

const rotas = readFileSync(rotasArq, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  .map((l) => { const [rota, nome] = l.split('|').map((s) => s.trim()); return { rota, nome: nome || rota }; });

mkdirSync(saida, { recursive: true });
const navegador = await pw.chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: largura, height: altura },
  ...(arg('estado') ? { storageState: arg('estado') } : {}),
});
const pagina = await contexto.newPage();
pagina.on('dialog', (d) => d.dismiss().catch(() => {}));

const resultado = [];
let nPrint = 0;

// Mede o popup aberto: fora da tela, rolagem interna e itens cobertos/cortados (elementFromPoint).
async function medir(popup) {
  return popup.evaluate((el, vp) => {
    const r = el.getBoundingClientRect();
    const problemas = [];
    if (r.top < -1 || r.left < -1 || r.bottom > vp.h + 1 || r.right > vp.w + 1)
      problemas.push(`sai da tela (${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)} em ${vp.w}×${vp.h})`);
    // Corte por uma caixa de fora do menu (ex.: tabela com overflow hidden, como no menu "⋯" das linhas).
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const st = getComputedStyle(a);
      if (!/(hidden|auto|scroll|clip)/.test(st.overflow + st.overflowX + st.overflowY)) continue;
      const c = a.getBoundingClientRect();
      if (r.bottom > c.bottom + 2 || r.right > c.right + 2 || r.top < c.top - 2 || r.left < c.left - 2) {
        problemas.push(`cortado pela caixa de fora (${a.tagName.toLowerCase()}${a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : ''}): o menu tem ${Math.round(r.height)} px e cabem ${Math.round(Math.max(0, Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top)))} px`);
        break;
      }
    }
    const roladores = [el, ...el.querySelectorAll('*')].filter((n) => {
      const s = getComputedStyle(n);
      return /(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2;
    });
    const itens = [...el.querySelectorAll('[role="menuitem"], [role="option"], [role="gridcell"], [role="menuitemcheckbox"], [role="menuitemradio"]')]
      .filter((n) => n.getBoundingClientRect().height > 0).slice(0, 60);
    if (roladores.length && itens.length && itens.length <= 12)
      problemas.push(`rolagem interna com só ${itens.length} itens (a lista não cabe no espaço que tem)`);
    // Item visível na área de rolagem dele, mas coberto por outro elemento.
    const cobertos = [];
    for (const it of itens) {
      const b = it.getBoundingClientRect();
      const rol = roladores.find((n) => n.contains(it));
      if (rol) {
        const v = rol.getBoundingClientRect();
        if (b.top < v.top || b.bottom > v.bottom) continue; // fora da área visível de uma rolagem: não conta
      }
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (x < 0 || y < 0 || x > vp.w || y > vp.h) { cobertos.push((it.textContent || '').trim().slice(0, 40) || '(sem texto)'); continue; }
      const topo = document.elementFromPoint(x, y);
      if (!topo || !(it === topo || it.contains(topo) || topo.contains(it)))
        cobertos.push((it.textContent || it.getAttribute('aria-label') || '').trim().slice(0, 40) || '(sem texto)');
    }
    if (cobertos.length) problemas.push(`itens cobertos ou fora da tela: ${cobertos.slice(0, 6).join(' · ')}${cobertos.length > 6 ? ' …' : ''}`);
    return { problemas, itens: itens.length, papel: el.getAttribute('role') || el.querySelector('[role]')?.getAttribute('role') || 'popup' };
  }, { w: largura, h: altura });
}

for (const { rota, nome } of rotas) {
  const url = new URL(rota, base).toString();
  try {
    await pagina.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    resultado.push({ rota, nome, erro: 'não carregou em 30 s' });
    continue;
  }
  await pagina.waitForTimeout(800);
  await fecharSobreposicoes(pagina);
  const gatilhos = await pagina.locator(GATILHOS).all();
  let abertos = 0;
  for (const g of gatilhos.slice(0, maxGatilhos)) {
    if (!(await g.isVisible().catch(() => false)) || !(await g.isEnabled().catch(() => false))) continue;
    const rotulo = ((await g.getAttribute('aria-label')) || (await g.innerText().catch(() => '')) || '').trim().slice(0, 50) || '(ícone)';
    if (PERIGOSOS.test(rotulo)) continue;
    const antes = new Set(await pagina.locator(POPUPS).evaluateAll((ns) => ns.filter((n) => n.getBoundingClientRect().height > 0).map((n, i) => n.outerHTML.length + ':' + i)));
    try {
      await g.scrollIntoViewIfNeeded({ timeout: 2000 });
      await g.click({ timeout: 3000 });
    } catch { continue; }
    await pagina.waitForTimeout(450);
    if (!pagina.url().startsWith(url.split('?')[0])) {
      await pagina.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
      continue;
    }
    const popups = (await pagina.locator(POPUPS).all());
    for (const p of popups) {
      if (!(await p.isVisible().catch(() => false))) continue;
      const m = await medir(p).catch(() => null);
      if (!m) continue;
      abertos++;
      const item = { rota, nome, gatilho: rotulo, popup: m.papel, itens: m.itens, problemas: m.problemas };
      if (m.problemas.length) {
        item.print = join(saida, `problema-${String(++nPrint).padStart(2, '0')}.png`);
        await pagina.screenshot({ path: item.print });
      }
      if (!antes.size || m.problemas.length) resultado.push(item);
      break;
    }
    await pagina.keyboard.press('Escape').catch(() => {});
    await pagina.waitForTimeout(200);
    await fecharSobreposicoes(pagina);
  }
  resultado.push({ rota, nome, gatilhosAbertos: abertos });
}

await navegador.close();
writeFileSync(join(saida, 'resultado.json'), JSON.stringify(resultado, null, 2));
const comProblema = resultado.filter((r) => r.problemas?.length);
const telas = resultado.filter((r) => 'gatilhosAbertos' in r);
const linhas = [
  `# Varredura de layout · ${largura}×${altura}`, '',
  `Telas: ${telas.length} · gatilhos abertos: ${telas.reduce((s, t) => s + t.gatilhosAbertos, 0)} · com problema: ${comProblema.length}`, '',
  '| Tela | Gatilho | Tipo | Problema | Print |', '|---|---|---|---|---|',
  ...comProblema.map((r) => `| ${r.nome} | ${r.gatilho} | ${r.popup} | ${r.problemas.join('; ')} | ${r.print?.split('/').pop() ?? ''} |`),
  '', '| Tela | Gatilhos abertos |', '|---|---|',
  ...telas.map((t) => `| ${t.nome} | ${t.gatilhosAbertos} |`),
  ...resultado.filter((r) => r.erro).map((r) => `\n- ${r.nome}: ${r.erro}`),
];
writeFileSync(join(saida, 'resumo.md'), linhas.join('\n'));
console.log(linhas.slice(0, 3).join('\n'));
