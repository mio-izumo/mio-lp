#!/bin/bash
# 受け取りページを mio-izumo.pages.dev（澪のプロフィールのリンク）へ上げる。計測（functions/log.js → D1 mio-izumo-log）も一緒に上がる。
set -e
cd "$(dirname "$0")"
python3 check_kw.py || { echo "→ 言葉を替えてから上げてください"; exit 1; }
rm -rf public && mkdir -p public/img
cp index.html public/ && cp img/icon.jpg public/img/
npx --prefix ~/ig-autoreply wrangler pages deploy --branch main --commit-dirty=true 2>&1 | tail -2
rm -rf public
