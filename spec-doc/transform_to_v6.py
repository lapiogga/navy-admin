#!/usr/bin/env python3
"""
v5 -> v6 일괄 변환기 (landscape -> portrait)
  - 슬라이드 크기: 10 x 5.625 (landscape) -> 7.5 x 10 (portrait)
  - CW: 9.2 -> 6.7
  - 박스 높이/간격 확장 (세로 공간 활용)
  - _title 내부 하드코딩 폭/좌표 portrait 기준으로 조정
  - 출력 파일명 _v5.pptx -> _v6.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))

# 1) 슬라이드/콘텐츠 크기 변경 (landscape -> portrait)
SIZE_SWAPS = [
    (re.compile(r"^SW\s*=\s*Inches\(10\)", re.MULTILINE), "SW = Inches(7.5)"),
    (re.compile(r"^SH\s*=\s*Inches\(5\.625\)", re.MULTILINE), "SH = Inches(10)"),
    (re.compile(r"^CW\s*=\s*Inches\(9\.2\)", re.MULTILINE), "CW = Inches(6.7)       # 콘텐츠 폭 = 7.5 - 0.4*2"),
]

# 2) _title 함수 portrait에 맞게 재작성
TITLE_PATTERN = re.compile(
    r"def _title\(s, title, sub, pg\):\n"
    r"(?:    \"\"\"[^\"]*\"\"\"\n)?"
    r"    bar = s\.shapes\.add_shape\(MSO_SHAPE\.RECTANGLE, 0, 0, SW, Inches\(0\.72\)\)\n"
    r"    bar\.fill\.solid\(\)\n"
    r"    bar\.fill\.fore_color\.rgb = HBAR\n"
    r"    bar\.line\.color\.rgb = BORD\n"
    r"    bar\.line\.width = Pt\(0\.5\)\n"
    r"    _tb\(s, ML, Inches\(0\.06\), Inches\(7\.5\), Inches\(0\.36\), title, 22, True, CHAR\)\n"
    r"    if sub:\n"
    r"        _tb\(s, ML, Inches\(0\.42\), Inches\(8\.5\), Inches\(0\.26\), sub, 11, False, CHAR\)\n"
    r"    _tb\(s, Inches\(9\.0\), Inches\(0\.18\), Inches\(0\.6\), Inches\(0\.3\),\n"
    r"        f'\{pg\}/5', 12, True, CHAR, PP_ALIGN\.RIGHT\)"
)

TITLE_REPLACEMENT = (
    'def _title(s, title, sub, pg):\n'
    '    """[A] 제목 영역 (portrait) — 연한 바 + 진한 테두리 + 검정 글자"""\n'
    '    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, Inches(0.72))\n'
    '    bar.fill.solid()\n'
    '    bar.fill.fore_color.rgb = HBAR\n'
    '    bar.line.color.rgb = BORD\n'
    '    bar.line.width = Pt(0.5)\n'
    '    _tb(s, ML, Inches(0.06), Inches(5.5), Inches(0.36), title, 20, True, CHAR)\n'
    '    if sub:\n'
    '        _tb(s, ML, Inches(0.42), Inches(6.5), Inches(0.26), sub, 10, False, CHAR)\n'
    '    _tb(s, Inches(6.5), Inches(0.18), Inches(0.6), Inches(0.3),\n'
    "        f'{pg}/5', 12, True, CHAR, PP_ALIGN.RIGHT)"
)

# 3) 박스 높이/간격 추가 확장 (portrait 세로 공간 활용)
HEIGHT_SWAPS = [
    # 박스 높이: v5 값을 portrait용 약 1.4~1.5배로 확대
    (re.compile(r"(^|\n)(\s+)LH\s*=\s*Inches\(0\.44\)"),  r"\1\2LH = Inches(0.62)"),
    (re.compile(r"(^|\n)(\s+)AH\s*=\s*Inches\(0\.46\)"),  r"\1\2AH = Inches(0.66)"),
    (re.compile(r"(^|\n)(\s+)UH\s*=\s*Inches\(0\.48\)"),  r"\1\2UH = Inches(0.70)"),
    (re.compile(r"(^|\n)(\s+)RH\s*=\s*Inches\(0\.52\)"),  r"\1\2RH = Inches(0.78)"),
    (re.compile(r"(^|\n)(\s+)GH\s*=\s*Inches\(0\.58\)"),  r"\1\2GH = Inches(0.90)"),
    (re.compile(r"(^|\n)(\s+)SBH\s*=\s*Inches\(0\.40\)"), r"\1\2SBH = Inches(0.56)"),
    # 간격: portrait에서 약간 확대
    (re.compile(r"(^|\n)(\s+)GAP\s*=\s*Inches\(0\.05\)"), r"\1\2GAP = Inches(0.08)"),
    (re.compile(r"(^|\n)(\s+)AG\s*=\s*Inches\(0\.03\)"),  r"\1\2AG = Inches(0.06)"),
    (re.compile(r"(^|\n)(\s+)UG\s*=\s*Inches\(0\.03\)"),  r"\1\2UG = Inches(0.06)"),
    (re.compile(r"(^|\n)(\s+)GG\s*=\s*Inches\(0\.03\)"),  r"\1\2GG = Inches(0.06)"),
    (re.compile(r"(^|\n)(\s+)RG\s*=\s*Inches\(0\.03\)"),  r"\1\2RG = Inches(0.06)"),
]

# 4) 페이지 내 하드코딩 폭 조정 (landscape CW=9.2 -> portrait CW=6.7 비율)
# 주요 하드코딩 Inches 값들: 가로 방향 폭만 축소
HARDCODED_WIDTH_SWAPS = [
    # Page 2 As-Is/To-Be 폭
    (re.compile(r"AW\s*=\s*Inches\(3\.5\)"),   "AW = Inches(2.6)"),
    # Page 3 바운더리 폭 및 액터 폭
    (re.compile(r"BW\s*=\s*Inches\(6\.2\)"),   "BW = Inches(4.3)"),
    (re.compile(r"AW\s*=\s*Inches\(1\.15\)"),  "AW = Inches(1.0)"),
    # Page 4 로그인/대시보드 박스 및 그룹 박스
    (re.compile(r"Inches\(1\.3\),\s*Inches\(0\.35\),\s*\n?\s*'로그인"), "Inches(1.1), Inches(0.35),\n         '로그인"),
    (re.compile(r"GW\s*=\s*Inches\(4\.5\)"),   "GW = Inches(3.2)"),
    # Page 4 UC 박스 폭
    (re.compile(r"UW\s*=\s*Inches\(2\.95\)"),  "UW = Inches(2.0)"),
]


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) 슬라이드/콘텐츠 크기
    for pattern, repl in SIZE_SWAPS:
        src = pattern.sub(repl, src)

    # 2) _title 함수 교체
    src, n_title = TITLE_PATTERN.subn(lambda m: TITLE_REPLACEMENT, src)

    # 3) 박스 높이/간격 확장
    for pattern, repl in HEIGHT_SWAPS:
        src = pattern.sub(repl, src)

    # 4) 주요 하드코딩 폭 축소
    for pattern, repl in HARDCODED_WIDTH_SWAPS:
        src = pattern.sub(repl, src)

    # 5) 파일명/주석 v5 -> v6
    src = src.replace('_분석설계_v5.pptx', '_분석설계_v6.pptx')
    src = src.replace(' PPTX v5', ' PPTX v6 (portrait)')
    src = src.replace('system_level_spec_guide_v5.md', 'system_level_spec_guide_v6.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)

    return n_title


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v5.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v5.py', '_v6.py')
        dst = os.path.join(HERE, new_name)
        n_title = transform(src, dst)
        status = 'OK' if n_title else 'PARTIAL'
        print(f'  [{status}] {base} title={n_title}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
