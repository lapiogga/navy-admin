#!/usr/bin/env python3
"""
v3 → v4 일괄 변환기
  - 폰트: 맑은 고딕 → Freesentation 5 Medium
  - 최소 9pt 보장 (_run 함수에 sz clamp 추가)
  - 색상 팔레트 파스텔 톤으로 전환
  - 출력 파일명 _v3.pptx → _v4.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))

# ═══ 치환 규칙 ═══
# 색상 팔레트 (원본 → 파스텔)
PALETTE = [
    # (old_line_pattern, new_line)
    (r"NAVY\s*=\s*RGBColor\(0x1B,\s*0x3A,\s*0x5C\)",
     "NAVY  = RGBColor(0x6B, 0x8E, 0xA8)"),
    (r"TEAL\s*=\s*RGBColor\(0x2E,\s*0x7D,\s*0x9B\)",
     "TEAL  = RGBColor(0x8E, 0xC5, 0xC0)"),
    (r"SKY\s*=\s*RGBColor\(0x4E,\s*0xAB,\s*0xE6\)",
     "SKY   = RGBColor(0xA8, 0xC8, 0xE8)"),
    (r"MINT\s*=\s*RGBColor\(0xD1,\s*0xFA,\s*0xE5\)",
     "MINT  = RGBColor(0xDC, 0xF5, 0xE4)"),
    (r"PEACH\s*=\s*RGBColor\(0xFE,\s*0xE2,\s*0xE2\)",
     "PEACH = RGBColor(0xFC, 0xD4, 0xD0)"),
    (r"CREAM\s*=\s*RGBColor\(0xFE,\s*0xF3,\s*0xC7\)",
     "CREAM = RGBColor(0xFD, 0xEE, 0xC2)"),
    (r"ICE\s*=\s*RGBColor\(0xE8,\s*0xF4,\s*0xFD\)",
     "ICE   = RGBColor(0xE4, 0xEE, 0xF8)"),
    (r"SNOW\s*=\s*RGBColor\(0xF5,\s*0xF7,\s*0xFA\)",
     "SNOW  = RGBColor(0xF7, 0xF9, 0xFC)"),
    (r"CHAR\s*=\s*RGBColor\(0x21,\s*0x21,\s*0x21\)",
     "CHAR  = RGBColor(0x4A, 0x4A, 0x4A)"),
    (r"ASH\s*=\s*RGBColor\(0x66,\s*0x66,\s*0x66\)",
     "ASH   = RGBColor(0x99, 0x99, 0x99)"),
    (r"GRN\s*=\s*RGBColor\(0x2E,\s*0x7D,\s*0x32\)",
     "GRN   = RGBColor(0xA4, 0xD4, 0xB4)"),
    (r"WARN\s*=\s*RGBColor\(0xF5,\s*0x7C,\s*0x00\)",
     "WARN  = RGBColor(0xF5, 0xCC, 0xA0)"),
    (r"ERR\s*=\s*RGBColor\(0xC6,\s*0x28,\s*0x28\)",
     "ERR   = RGBColor(0xF0, 0xB2, 0xAE)"),
    (r"LBLUE\s*=\s*RGBColor\(0xDB,\s*0xEA,\s*0xFE\)",
     "LBLUE = RGBColor(0xDC, 0xEA, 0xFE)"),
    (r"LSUB\s*=\s*RGBColor\(0xA0,\s*0xD0,\s*0xE8\)",
     "LSUB  = RGBColor(0xC5, 0xDC, 0xEC)"),
]

# 테이블 셀 헤더/스트라이프 HEX
HEX_SWAPS = [
    ("'1B3A5C'", "'6B8EA8'"),
    ("'F0F4F8'", "'E4EEF8'"),
    ("'FBFBFB'", "'F7F9FC'"),
]

FONT_OLD = "FONT = '맑은 고딕'"
FONT_NEW = "FONT = 'Freesentation 5 Medium'"

# _run 함수 clamp 삽입 (docstring 다음 줄에 min(sz, 9) 추가)
RUN_OLD = 'def _run(p, txt, sz=9, b=False, c=CHAR):\n    """단락에 서식 런 추가"""\n    r = p.add_run()'
RUN_NEW = 'def _run(p, txt, sz=9, b=False, c=CHAR):\n    """단락에 서식 런 추가 (최소 9pt 보장)"""\n    sz = max(sz, 9)\n    r = p.add_run()'


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) 폰트 교체
    src = src.replace(FONT_OLD, FONT_NEW)

    # 2) 색상 팔레트 교체 (정규식으로 값 변경, 정렬 공백 유지)
    for pattern, repl in PALETTE:
        src = re.sub(pattern, repl, src)

    # 3) 테이블 셀 HEX 교체
    for old, new in HEX_SWAPS:
        src = src.replace(old, new)

    # 4) _run 함수에 sz clamp 삽입
    if RUN_OLD in src:
        src = src.replace(RUN_OLD, RUN_NEW)

    # 5) 출력 파일명 v3 → v4 (script 내부)
    src = src.replace('_분석설계_v3.pptx', '_분석설계_v4.pptx')
    # 스크립트 상단 주석의 버전 태그도 업데이트
    src = src.replace(' PPTX v3', ' PPTX v4')
    src = src.replace('system_level_spec_guide_v3.md', 'system_level_spec_guide_v4.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v3.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v3.py', '_v4.py')
        dst = os.path.join(HERE, new_name)
        transform(src, dst)
        print(f'  ✓ {base} → {new_name}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
