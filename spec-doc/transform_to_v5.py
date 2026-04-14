#!/usr/bin/env python3
"""
v4 -> v5 일괄 변환기 (regex 기반, docstring 유무 모두 대응)
  - 제목줄/표 헤더 배경 연한색, 글자색 검정
  - 박스/표 테두리 진한색, 두께 0.5pt
  - 본문 글자색 검정에 가깝게
  - 목표모델 페이지: 본문이 제목줄과 겹치지 않게 아래로 이동
  - 스토리보드 URL 패턴: 6pt -> 8pt
  - 표 내부 폰트/여백 확대
  - 출력 파일명 _v4.pptx -> _v5.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))

# 1) 팔레트 색상 swap
PALETTE_SWAPS = [
    (r"CHAR\s*=\s*RGBColor\(0x4A,\s*0x4A,\s*0x4A\)",
     "CHAR  = RGBColor(0x1A, 0x1A, 0x1A)"),
    (r"ASH\s*=\s*RGBColor\(0x99,\s*0x99,\s*0x99\)",
     "ASH   = RGBColor(0x66, 0x66, 0x66)"),
]

# 2) 팔레트 뒤에 신규 색상 추가
LSUB_LINE_PATTERN = re.compile(
    r"(LSUB\s*=\s*RGBColor\(0xC5,\s*0xDC,\s*0xEC\)[^\n]*)"
)
LSUB_APPEND_BLOCK = (
    "\nHBAR  = RGBColor(0xD4, 0xE2, 0xEC)  # 제목바 연한 배경"
    "\nTHBG  = RGBColor(0xD4, 0xE2, 0xEC)  # 표 헤더 연한 배경"
    "\nBORD  = RGBColor(0x4A, 0x6B, 0x8C)  # 박스 테두리 (진한)"
    "\nTBLB  = RGBColor(0x80, 0x80, 0x80)  # 표 테두리 (회색)"
)

# 2.5) _run 함수에 9pt clamp 추가 (docstring 유무 모두 대응)
RUN_PATTERN = re.compile(
    r"def _run\(p, txt, sz=9, b=False, c=CHAR\):\n"
    r"(?:    \"\"\"[^\"]*\"\"\"\n)?"
    r"    r = p\.add_run\(\)"
)
RUN_REPLACEMENT = (
    'def _run(p, txt, sz=9, b=False, c=CHAR):\n'
    '    """단락에 서식 런 추가 (최소 9pt 보장)"""\n'
    '    sz = max(sz, 9)\n'
    '    r = p.add_run()'
)

# 2.6) 박스 높이/간격 일괄 조정 (변수 할당 라인만 매칭, 들여쓰기 그룹 보존)
HEIGHT_SWAPS = [
    # 박스/셀 높이 확대
    (re.compile(r"(^|\n)(\s+)LH\s*=\s*Inches\(0\.37\)"),      r"\1\2LH = Inches(0.44)"),
    (re.compile(r"(^|\n)(\s+)AH\s*=\s*Inches\(0\.38\)"),      r"\1\2AH = Inches(0.46)"),
    (re.compile(r"(^|\n)(\s+)UH\s*=\s*Inches\(0\.4\)"),       r"\1\2UH = Inches(0.48)"),
    (re.compile(r"(^|\n)(\s+)RH\s*=\s*Inches\(0\.44\)"),      r"\1\2RH = Inches(0.52)"),
    (re.compile(r"(^|\n)(\s+)GH\s*=\s*Inches\(0\.5\)"),       r"\1\2GH = Inches(0.58)"),
    (re.compile(r"(^|\n)(\s+)SBH\s*=\s*Inches\(0\.32\)"),     r"\1\2SBH = Inches(0.40)"),
    # 간격 축소 (배치 유지)
    (re.compile(r"(^|\n)(\s+)GAP\s*=\s*Inches\(0\.1\)"),      r"\1\2GAP = Inches(0.05)"),
    (re.compile(r"(^|\n)(\s+)RG\s*=\s*Inches\(0\.06\)"),      r"\1\2RG = Inches(0.03)"),
    (re.compile(r"(^|\n)(\s+)AG\s*=\s*Inches\(0\.05\)"),      r"\1\2AG = Inches(0.03)"),
    (re.compile(r"(^|\n)(\s+)UG\s*=\s*Inches\(0\.06\)"),      r"\1\2UG = Inches(0.03)"),
    (re.compile(r"(^|\n)(\s+)GG\s*=\s*Inches\(0\.06\)"),      r"\1\2GG = Inches(0.03)"),
]

# 3) _title 함수 regex (docstring 유무 모두 매칭)
TITLE_PATTERN = re.compile(
    r"def _title\(s, title, sub, pg\):\n"
    r"(?:    \"\"\"[^\"]*\"\"\"\n)?"
    r"    bar = s\.shapes\.add_shape\(MSO_SHAPE\.RECTANGLE, 0, 0, SW, Inches\(0\.68\)\)\n"
    r"    bar\.fill\.solid\(\)\n"
    r"    bar\.fill\.fore_color\.rgb = NAVY\n"
    r"    bar\.line\.fill\.background\(\)\n"
    r"    _tb\(s, ML, Inches\(0\.06\), Inches\(7\.5\), Inches\(0\.34\), title, 22, True, WHITE\)\n"
    r"    if sub:\n"
    r"        _tb\(s, ML, Inches\(0\.38\), Inches\(8\.5\), Inches\(0\.26\), sub, 11, False, LSUB\)\n"
    r"    _tb\(s, Inches\(9\.0\), Inches\(0\.15\), Inches\(0\.6\), Inches\(0\.3\),\n"
    r"        f'\{pg\}/5', 12, True, WHITE, PP_ALIGN\.RIGHT\)"
)

TITLE_REPLACEMENT = (
    'def _title(s, title, sub, pg):\n'
    '    """[A] 제목 영역 — 연한 바 + 진한 테두리 + 검정 글자"""\n'
    '    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SW, Inches(0.72))\n'
    '    bar.fill.solid()\n'
    '    bar.fill.fore_color.rgb = HBAR\n'
    '    bar.line.color.rgb = BORD\n'
    '    bar.line.width = Pt(0.5)\n'
    '    _tb(s, ML, Inches(0.06), Inches(7.5), Inches(0.36), title, 22, True, CHAR)\n'
    '    if sub:\n'
    '        _tb(s, ML, Inches(0.42), Inches(8.5), Inches(0.26), sub, 11, False, CHAR)\n'
    '    _tb(s, Inches(9.0), Inches(0.18), Inches(0.6), Inches(0.3),\n'
    "        f'{pg}/5', 12, True, CHAR, PP_ALIGN.RIGHT)"
)

# 4) _box 함수 시그니처 (stk=NAVY, sw=1) -> (stk=BORD, sw=0.5)
BOX_SIG_PATTERN = re.compile(
    r"def _box\(s, l, t, w, h, txt, fill=ICE, stk=NAVY, sw=1,"
)
BOX_SIG_REPLACEMENT = (
    "def _box(s, l, t, w, h, txt, fill=ICE, stk=BORD, sw=0.5,"
)

# 5) _tbl 함수 regex (docstring 유무 모두 매칭)
TBL_PATTERN = re.compile(
    r"def _tbl\(s, l, t, w, h, data, cws=None\):\n"
    r"(?:    \"\"\"[^\"]*\"\"\"\n)?"
    r"    rows, cols = len\(data\), len\(data\[0\]\)\n"
    r"    sh = s\.shapes\.add_table\(rows, cols, l, t, w, h\)\n"
    r"    tbl = sh\.table\n"
    r"    if cws:\n"
    r"        for i, cw in enumerate\(cws\):\n"
    r"            tbl\.columns\[i\]\.width = cw\n"
    r"    for r in range\(rows\):\n"
    r"        for c in range\(cols\):\n"
    r"            cell = tbl\.cell\(r, c\)\n"
    r"            cell\.text = ''\n"
    r"            tf = cell\.text_frame\n"
    r"            tf\.word_wrap = True\n"
    r"            tf\.margin_top = tf\.margin_bottom = Inches\(0\.01\)\n"
    r"            tf\.margin_left = Inches\(0\.04\)\n"
    r"            tf\.margin_right = Inches\(0\.03\)\n"
    r"            hdr = \(r == 0\)\n"
    r"            for i, ln in enumerate\(data\[r\]\[c\]\.split\('\\n'\)\):\n"
    r"                p = tf\.paragraphs\[0\] if i == 0 else tf\.add_paragraph\(\)\n"
    r"                _run\(p, ln, 7 if not hdr else 8, hdr, WHITE if hdr else CHAR\)\n"
    r"                p\.alignment = PP_ALIGN\.CENTER if hdr else PP_ALIGN\.LEFT\n"
    r"                p\.space_before = p\.space_after = Pt\(0\)\n"
    r"            _cell_bg\(cell, '6B8EA8' if hdr else \('FFFFFF' if r % 2 == 1 else 'E4EEF8'\)\)\n"
    r"    return tbl"
)

TBL_REPLACEMENT = (
    "def _cell_border(cell, color_hex='808080', width_pt=0.5):\n"
    "    \"\"\"셀 테두리 4면 회색 설정\"\"\"\n"
    "    tcPr = cell._tc.find(qn('a:tcPr'))\n"
    "    if tcPr is None:\n"
    "        tcPr = etree.SubElement(cell._tc, qn('a:tcPr'))\n"
    "    for border in ('a:lnL', 'a:lnR', 'a:lnT', 'a:lnB'):\n"
    "        for existing in tcPr.findall(qn(border)):\n"
    "            tcPr.remove(existing)\n"
    "        ln = etree.SubElement(tcPr, qn(border))\n"
    "        ln.set('w', str(int(width_pt * 12700)))\n"
    "        ln.set('cap', 'flat')\n"
    "        ln.set('cmpd', 'sng')\n"
    "        ln.set('algn', 'ctr')\n"
    "        sf = etree.SubElement(ln, qn('a:solidFill'))\n"
    "        etree.SubElement(sf, qn('a:srgbClr'), val=color_hex)\n"
    "        etree.SubElement(ln, qn('a:prstDash'), val='solid')\n"
    "        etree.SubElement(ln, qn('a:round'))\n"
    "\n"
    "\n"
    "def _tbl(s, l, t, w, h, data, cws=None):\n"
    "    \"\"\"테이블 (멀티라인 셀 지원, 진한 테두리 0.5pt, 연한 헤더 배경). data[0]=헤더\"\"\"\n"
    "    rows, cols = len(data), len(data[0])\n"
    "    sh = s.shapes.add_table(rows, cols, l, t, w, h)\n"
    "    tbl = sh.table\n"
    "    if cws:\n"
    "        for i, cw in enumerate(cws):\n"
    "            tbl.columns[i].width = cw\n"
    "    for r in range(rows):\n"
    "        for c in range(cols):\n"
    "            cell = tbl.cell(r, c)\n"
    "            cell.text = ''\n"
    "            tf = cell.text_frame\n"
    "            tf.word_wrap = True\n"
    "            tf.margin_top = tf.margin_bottom = Inches(0.04)\n"
    "            tf.margin_left = Inches(0.08)\n"
    "            tf.margin_right = Inches(0.06)\n"
    "            hdr = (r == 0)\n"
    "            for i, ln in enumerate(data[r][c].split('\\n')):\n"
    "                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()\n"
    "                _run(p, ln, 9 if not hdr else 10, hdr, CHAR)\n"
    "                p.alignment = PP_ALIGN.CENTER if hdr else PP_ALIGN.LEFT\n"
    "                p.space_before = p.space_after = Pt(0)\n"
    "            _cell_bg(cell, 'D4E2EC' if hdr else ('FFFFFF' if r % 2 == 1 else 'F2F7FB'))\n"
    "            _cell_border(cell, '808080', 0.5)\n"
    "    return tbl"
)

# 6) URL 패턴 폰트 크기 6pt -> 8pt
URL_PT_PATTERN = re.compile(r"r_obj\.font\.size = Pt\(6\)")
URL_PT_REPLACEMENT = "r_obj.font.size = Pt(8)"

# 7) p2_target 내 y0 조정
P2_BLOCK_PATTERN = re.compile(
    r"(def p2_target\(prs\):.*?)(?=\ndef p\d_|\Z)",
    re.DOTALL
)


def _p2_sub(m):
    block = m.group(1)
    block = block.replace("y0 = Inches(0.82)", "y0 = Inches(1.0)", 1)
    block = block.replace("y0 - Inches(0.22)", "y0 - Inches(0.06)")
    return block


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) 팔레트 swap
    for pattern, repl in PALETTE_SWAPS:
        src = re.sub(pattern, repl, src)

    # 2) LSUB 라인 뒤에 HBAR/THBG/BORD 추가 (이미 추가됐으면 skip)
    if 'HBAR' not in src:
        src = LSUB_LINE_PATTERN.sub(
            lambda m: m.group(1) + LSUB_APPEND_BLOCK, src, count=1
        )

    # 2.5) _run 함수에 9pt clamp 추가 (이미 있으면 skip)
    if 'sz = max(sz, 9)' not in src:
        src, n_run = RUN_PATTERN.subn(lambda m: RUN_REPLACEMENT, src)
    else:
        n_run = 0  # 이미 clamp 존재

    # 2.6) 박스 높이/간격 일괄 조정
    for pattern, repl in HEIGHT_SWAPS:
        src = pattern.sub(repl, src)

    # 3) _title 함수 교체 (callable로 백슬래시 해석 방지)
    src, n_title = TITLE_PATTERN.subn(lambda m: TITLE_REPLACEMENT, src)

    # 4) _box 함수 시그니처 교체
    src, n_box = BOX_SIG_PATTERN.subn(lambda m: BOX_SIG_REPLACEMENT, src)

    # 5) _tbl 함수 교체
    src, n_tbl = TBL_PATTERN.subn(lambda m: TBL_REPLACEMENT, src)

    # 6) URL 폰트 크기
    src, n_url = URL_PT_PATTERN.subn(lambda m: URL_PT_REPLACEMENT, src)

    # 7) p2_target y0 조정
    src = P2_BLOCK_PATTERN.sub(_p2_sub, src)

    # 8) 파일명/주석 v4 -> v5
    src = src.replace('_분석설계_v4.pptx', '_분석설계_v5.pptx')
    src = src.replace(' PPTX v4', ' PPTX v5')
    src = src.replace('system_level_spec_guide_v4.md', 'system_level_spec_guide_v5.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)

    return n_title, n_box, n_tbl, n_url


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v4.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v4.py', '_v5.py')
        dst = os.path.join(HERE, new_name)
        n_title, n_box, n_tbl, n_url = transform(src, dst)
        status = 'OK' if (n_title and n_box and n_tbl) else 'PARTIAL'
        print(f'  [{status}] {base} title={n_title} box={n_box} tbl={n_tbl} url={n_url}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
