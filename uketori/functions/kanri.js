// 受け取りページの数字を見る画面：/kanri?k=<合言葉>（合言葉は Pages の秘密 KANRI_KEY）
const LABEL = { '1125f': '11/25 フィード（結ぶ→結びます）', '1125r': '11/25 リール（断ち切る→断ち切ります）', other: '合わない言葉（最新のフィードへ）' };
const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function onRequestGet({ request, env }) {
  const k = new URL(request.url).searchParams.get('k') || '';
  if (!env.KANRI_KEY || k !== env.KANRI_KEY) return new Response('Not found', { status: 404 });
  const q = (sql) => env.DB.prepare(sql).all().then((r) => r.results);
  const days = await q(`SELECT d,
      COUNT(DISTINCT CASE WHEN ev='open' THEN vid END) o,
      COUNT(DISTINCT CASE WHEN ev='send' THEN vid END) s,
      COUNT(DISTINCT CASE WHEN ev='reply' THEN vid END) r,
      COUNT(DISTINCT CASE WHEN ev='line' THEN vid END) l,
      COUNT(DISTINCT CASE WHEN ev='open' AND ig=1 THEN vid END) oi
    FROM ev GROUP BY d ORDER BY d DESC LIMIT 30`);
  const posts = await q(`SELECT k,
      COUNT(DISTINCT CASE WHEN ev='send' THEN vid END) s,
      COUNT(DISTINCT CASE WHEN ev='reply' THEN vid END) r,
      COUNT(DISTINCT CASE WHEN ev='line' THEN vid END) l, MIN(d) d0
    FROM ev WHERE ev IN ('send','reply','line') GROUP BY k ORDER BY d0 DESC`);
  const tot = days.reduce((a, x) => ({ o: a.o + x.o, s: a.s + x.s, r: a.r + x.r, l: a.l + x.l }), { o: 0, s: 0, r: 0, l: 0 });
  // いちばん落ちている段（30人を超えてから見る）
  const steps = [['開いた → 1回目を送った（投稿の言葉を打つ所）', tot.o ? tot.s / tot.o : 1], ['1回目 → 2回目を送った（1通目を読んで打つ所）', tot.s ? tot.r / tot.s : 1], ['2回目 → LINEを押した（2通目を読んでボタンを押す所）', tot.r ? tot.l / tot.r : 1]];
  const worst = steps.slice().sort((a, b) => a[1] - b[1])[0];
  const neck = tot.o < 30 ? 'まだ数が少ないので、30人を超えてから見ます' : `一番落ちているのは「${worst[0]}」（${Math.round(worst[1] * 100)}%）`;
  const row = (x) => `<tr><td>${esc(x.d)}</td><td>${x.o}</td><td>${x.s}<small>${pct(x.s, x.o)}</small></td><td>${x.r}<small>${pct(x.r, x.s)}</small></td><td>${x.l}<small>${pct(x.l, x.r)}</small></td><td>${pct(x.l, x.o)}</td></tr>`;
  const prow = (x) => `<tr><td>${esc(LABEL[x.k] || x.k)}</td><td>${x.s}</td><td>${x.r}<small>${pct(x.r, x.s)}</small></td><td>${x.l}<small>${pct(x.l, x.r)}</small></td></tr>`;
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>澪 受け取りページの数字</title>
<style>
:root{--bg:#121013;--card:#1c1916;--ink:#f0e8d8;--sub:#a89a80;--gold:#E7C24B;--line:rgba(240,232,216,.12)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,"Hiragino Sans",sans-serif;font-size:15px;line-height:1.6}
main{max-width:720px;margin:0 auto;padding:20px 16px 40px}h1{font-size:19px;margin:0 0 4px}p.s{color:var(--sub);font-size:13px;margin:0 0 18px}
.kpi{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}.kpi div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.kpi b{display:block;font-size:24px;color:var(--gold)}.kpi span{font-size:12px;color:var(--sub)}
.neck{background:var(--card);border-left:3px solid var(--gold);padding:10px 12px;border-radius:8px;margin-bottom:22px}
h2{font-size:16px;margin:22px 0 8px}table{width:100%;border-collapse:collapse;background:var(--card);border-radius:12px;overflow:hidden}
th,td{padding:9px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}th{font-size:12px;color:var(--sub);font-weight:500}
td:first-child,th:first-child{text-align:left;white-space:normal}small{color:var(--sub);margin-left:6px;font-size:12px}
.note{color:var(--sub);font-size:12.5px;margin-top:22px}
</style></head><body><main>
<h1>澪 受け取りページの数字</h1><p class="s">mio-izumo.pages.dev（プロフィールのリンク）・人数は同じ端末を1人で数える・日付は日本時間</p>
<div class="kpi"><div><span>開いた（リンクを押した）</span><b>${tot.o}</b></div><div><span>1回目を送った</span><b>${tot.s}</b><span>開いた人の${pct(tot.s, tot.o)}</span></div><div><span>2回目を送った</span><b>${tot.r}</b><span>1回目の${pct(tot.r, tot.s)}</span></div><div><span>LINEを押した</span><b>${tot.l}</b><span>2回目の${pct(tot.l, tot.r)}</span></div></div>
<div class="neck">${neck}</div>
<h2>日ごと</h2><table><tr><th>日付</th><th>開いた</th><th>1回目</th><th>2回目</th><th>LINE</th><th>全体</th></tr>${days.map(row).join('') || '<tr><td colspan="6">まだありません</td></tr>'}</table>
<h2>投稿ごと（送った言葉で分ける）</h2><table><tr><th>投稿</th><th>1回目</th><th>2回目</th><th>LINE</th></tr>${posts.map(prow).join('') || '<tr><td colspan="4">まだありません</td></tr>'}</table>
<p class="note">開いた人は、どの投稿から来たかはまだ分かりません（1回目の言葉で分かれます）。率は1つ前の段から何%残ったか。LINEの友だち追加は、リストインシートの lin.ee/tlTM2Vw の経路で見ます。</p>
</main></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
