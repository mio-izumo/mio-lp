#!/bin/bash
# 受け取りページの数字：日ごとに 開いた人 → 送った人 → LINEを押した人（人数＝同じ端末は1人）と、送った言葉がどの投稿に当たったか
cd "$(dirname "$0")"
npx --prefix ~/ig-autoreply wrangler d1 execute mio-izumo-log --remote --json --command "
SELECT d AS 日,
  COUNT(DISTINCT CASE WHEN ev='open' THEN vid END) AS 開いた,
  COUNT(DISTINCT CASE WHEN ev='send' THEN vid END) AS 送った,
  COUNT(DISTINCT CASE WHEN ev='line' THEN vid END) AS LINEを押した
FROM ev GROUP BY d ORDER BY d DESC LIMIT 14" 2>/dev/null | python3 -c "
import json,sys
r=json.load(sys.stdin)[0]['results']
print('日付        開いた  送った(率)   LINE(率)')
for x in r:
  o,s,l=x['開いた'],x['送った'],x['LINEを押した']
  print(f\"{x['日']}  {o:5}  {s:5}({s/o*100 if o else 0:4.0f}%)  {l:5}({l/s*100 if s else 0:4.0f}%)\")"
npx --prefix ~/ig-autoreply wrangler d1 execute mio-izumo-log --remote --json --command "SELECT d AS 日, k AS 投稿, COUNT(DISTINCT vid) AS 人 FROM ev WHERE ev='send' GROUP BY d,k ORDER BY d DESC" 2>/dev/null | python3 -c "
import json,sys
for x in json.load(sys.stdin)[0]['results']: print(x['日'], x['投稿'], x['人'])"
