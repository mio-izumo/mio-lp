# 澪の受け取りページ（ウルトラへの引き継ぎ・11/24）

澪は12/22までDMの自動返信が送れない。代わりにプロフィールのリンクをこのページにして、自動返信と同じ流れをページの上で再現している。

- 本番：https://mio-izumo.pages.dev/（Cloudflare Pages「mio-izumo」）
- 数字のページ：https://mio-izumo.pages.dev/kanri?k=＜鍵＞
  - 鍵はこのフォルダの `.kanri_key` に入っている（git には入れていない）。鍵が無いと404になる。
  - 🔴本人「クソほど見にくい」（11/24）→ **作り直すのがウルトラの仕事**。
- 同じページの写しが GitHub Pages にもある（/mio-lp/uketori/）。ただし数字は取れない。本番は Cloudflare の方。

## 流れ（自動返信と同じ2段）
1. 投稿の言葉（例：結ぶ）を送る → その投稿の1通目（2つ目の言葉を頼む）
2. 2つ目の言葉（例：結びます）を送る → 2通目 → LINEのボタン（lin.ee/tlTM2Vw）
- 投稿ごとの言葉と文面は `index.html` の `POSTS`（key・from・kw・kw2・msg1・msg2）。合わない言葉は最新のフィードに当てる。
- 今の投稿：`1125f` フィード 結ぶ→結びます／`1125r` リール 断ち切る→断ち切ります

## 記録（D1）
- `functions/log.js`：ページから open / send / reply / line を受けて、D1「mio-izumo-log」（id 05815746-44f1-4453-8fe7-26275b6c3f7c）の表 `ev(ts, d=日本の日付, ev, k=投稿のkey, vid=端末ごとのID, ig)` に1行ずつ入れる。打った文そのものは残さない。
- 段：open（リンクを押して開いた）→ send（1回目を送った）→ reply（2回目を送った＝2通目が出た）→ line（LINEのボタンを押した）
- `?auto=1` や `?p=` を付けて開くと試しの扱いになり、記録しない。
- 11/24夜：本番で「結ぶ」「断ち切る」を最後まで打ち、4段すべて記録されたのを確かめた（試しの行は消した）。

## 触り方
- 数字を見る（ターミナル）：`./stats.sh`
- 中身をそのまま見る：`npx --prefix ~/ig-autoreply wrangler d1 execute mio-izumo-log --remote --json --command "SELECT * FROM ev ORDER BY ts DESC LIMIT 50"`
  - 🔴 wrangler は **ig-autoreply の wrangler.toml が無いフォルダで動かす**（このフォルダか scratchpad）。ig-autoreply の中で動かすと、別の D1 を見に行って失敗する。
- 上げる：`./deploy.sh`（言葉の重なりを check_kw.py で見る → public/ を組む → `wrangler pages deploy --branch main`）
- 数字のページの中身：`functions/kanri.js`（投稿の名前は先頭の `LABEL`）。Pages Functions なので、ここを書き換えて deploy.sh で上がる。
- 秘密：`KANRI_KEY`（Pages の secret）。鍵を変えるときは `.kanri_key` も一緒に変える。

## 決まり
- 同じ言葉は7日あけないと使えない（check_kw.py が止める）。
- 新しい澪の投稿を出すたびに、`POSTS` に1件と `kanri.js` の `LABEL` に1件足して deploy.sh（足すのは制作のチャット）。
- 30人を超えるまで、詰まりの判定はしない。
