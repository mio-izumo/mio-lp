// 受け取りページの計測：open（開いた）・send（1回目の言葉を送った）・reply（2回目の言葉を送った）・line（LINEのボタンを押した）
// 打った文そのものは残さない（どの投稿に当たったかの key だけ）
export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) {}
  if (!['open', 'send', 'reply', 'line'].includes(b.ev)) return new Response(null, { status: 204 });
  const ua = request.headers.get('user-agent') || '';
  const now = Date.now();
  const d = new Date(now + 9 * 3600e3).toISOString().slice(0, 10);
  await env.DB.prepare('INSERT INTO ev (ts, d, ev, k, vid, ig) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(now, d, b.ev, String(b.k || '').slice(0, 20), String(b.v || '').slice(0, 40), /Instagram/i.test(ua) ? 1 : 0).run();
  return new Response(null, { status: 204 });
}
