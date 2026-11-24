#!/bin/bash
# 受け取りページを mio-izumo.pages.dev（プロフィールのリンク）へ上げる。GitHub Pages の方も push しておく。
set -e
cd "$(dirname "$0")"
B=$(mktemp -d)
sed 's#\.\./img/profile\.jpg#img/profile.jpg#g' index.html > "$B/index.html"
mkdir -p "$B/img" && cp ../img/profile.jpg "$B/img/"
cd "$B" && npx --prefix ~/ig-autoreply wrangler pages deploy .  --project-name mio-izumo --branch main --commit-dirty=true 2>&1 | tail -3
cd / && rm -rf "${B:?}"
