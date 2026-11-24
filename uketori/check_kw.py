#!/usr/bin/env python3
"""受け取りページの言葉が、7日以内の別の投稿と重なっていないか見る（deploy.sh が上げる前に呼ぶ）"""
import re, sys, datetime as dt, os
s = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')).read()
posts = re.findall(r"key: '([^']+)', from: '([^']+)'.*?kw: \[([^\]]*)\]", s, re.S)
norm = lambda t: re.sub(r"[\s　「」『』。、！!？?・]", "", t)
bad = 0
for i, (k1, f1, w1) in enumerate(posts):
    for k2, f2, w2 in posts[i+1:]:
        gap = abs((dt.date.fromisoformat(f1) - dt.date.fromisoformat(f2)).days)
        if gap > 7: continue
        for a in re.findall(r"'([^']+)'", w1):
            for b in re.findall(r"'([^']+)'", w2):
                if norm(a) in norm(b) or norm(b) in norm(a):
                    print(f"⚠ 言葉が重なっています：{k1}「{a}」と {k2}「{b}」（{gap}日差・7日あけて使う）"); bad += 1
print(f"言葉の重なり：{'なし' if not bad else str(bad)+'か所'}（{len(posts)}件）")
sys.exit(1 if bad else 0)
