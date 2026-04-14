#!/usr/bin/env python3
"""
v7 -> v8 일괄 변환기
  - 제목줄(_title):
      * 글자 10pt, 한 줄 표시 (title — sub 형태로 결합)
      * 높이 0.72 -> 0.30
      * 폭 SW(7.5) -> CW(6.96), 좌측 ML(0.27)부터 시작
  - 본문 시작 y0 조정 (상단 여백 축소):
      * p2_target: 1.0 -> 0.50
      * p3/p4/p5: 0.82 -> 0.40
  - 출력 파일명 _v7.pptx -> _v8.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))


# 1) _title 함수 전체 교체
TITLE_PATTERN = re.compile(
    r"def _title\(s, title, sub, pg\):\n"
    r"    \"\"\"\[A\] 제목 영역 \(portrait\)[^\"]*\"\"\"\n"
    r"    bar = s\.shapes\.add_shape\(MSO_SHAPE\.RECTANGLE, 0, 0, SW, Inches\(0\.72\)\)\n"
    r"    bar\.fill\.solid\(\)\n"
    r"    bar\.fill\.fore_color\.rgb = HBAR\n"
    r"    bar\.line\.color\.rgb = BORD\n"
    r"    bar\.line\.width = Pt\(0\.5\)\n"
    r"    _tb\(s, ML, Inches\(0\.06\), Inches\(5\.5\), Inches\(0\.36\), title, 20, True, CHAR\)\n"
    r"    if sub:\n"
    r"        _tb\(s, ML, Inches\(0\.42\), Inches\(6\.5\), Inches\(0\.26\), sub, 10, False, CHAR\)"
)

TITLE_REPLACEMENT = (
    'def _title(s, title, sub, pg):\n'
    '    """[A] 제목 영역 (v8) — 10pt 한 줄, 폭 CW, 높이 0.30"""\n'
    '    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, ML, 0, CW, Inches(0.30))\n'
    '    bar.fill.solid()\n'
    '    bar.fill.fore_color.rgb = HBAR\n'
    '    bar.line.color.rgb = BORD\n'
    '    bar.line.width = Pt(0.5)\n'
    "    txt = f'{title} — {sub}' if sub else title\n"
    '    _tb(s, ML + Inches(0.08), Inches(0.05), CW - Inches(0.16), Inches(0.20),\n'
    '        txt, 10, True, CHAR, PP_ALIGN.LEFT)'
)


# 2) 본문 시작 y0 조정 (제목줄 축소에 맞춰 위로 올림)
Y0_SWAPS = [
    (re.compile(r"y0 = Inches\(1\.0\)"), "y0 = Inches(0.50)"),
    (re.compile(r"y0 = Inches\(0\.82\)"), "y0 = Inches(0.40)"),
]


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) _title 함수 교체 (callable lambda로 백슬래시 이슈 회피)
    src, n_title = TITLE_PATTERN.subn(lambda m: TITLE_REPLACEMENT, src)

    # 2) y0 조정
    n_y0 = 0
    for pattern, repl in Y0_SWAPS:
        src, n = pattern.subn(repl, src)
        n_y0 += n

    # 3) 파일명/주석 v7 -> v8
    src = src.replace('_분석설계_v7.pptx', '_분석설계_v8.pptx')
    src = src.replace(' PPTX v7 (portrait, 4페이지)', ' PPTX v8 (portrait, 4페이지)')
    src = src.replace('system_level_spec_guide_v7.md', 'system_level_spec_guide_v8.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)

    return n_title, n_y0


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v7.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v7.py', '_v8.py')
        dst = os.path.join(HERE, new_name)
        n_title, n_y0 = transform(src, dst)
        status = 'OK' if (n_title and n_y0 >= 3) else 'PARTIAL'
        print(f'  [{status}] {base} title={n_title} y0={n_y0}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
