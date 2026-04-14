#!/usr/bin/env python3
"""
v6.1 -> v7 일괄 변환기
  - 플로우챠트 LN_H: 4.1 -> 3.2
  - 페이지 번호 삭제 (_title 내 pg 출력 제거)
  - 플로우챠트 상단 오브젝트 겹침 방지:
      * SBH: 0.56 -> 0.36
      * 검증 실패 박스 제거 (SBH 축소로 공간 부족)
  - CW: 6.9 -> 6.96
  - ML: 0.3 -> 0.27
  - 표 테두리/셀 라인 색상: '808080' -> '000000'
  - 출력 파일명 _v6.1.pptx -> _v7.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))


# 1) 콘텐츠 폭/마진 조정
MARGIN_SWAPS = [
    (re.compile(r"^ML\s*=\s*Inches\(0\.3\)[^\n]*", re.MULTILINE),
     "ML = Inches(0.27)      # 좌우 마진"),
    (re.compile(r"^CW\s*=\s*Inches\(6\.9\)[^\n]*", re.MULTILINE),
     "CW = Inches(6.96)      # 콘텐츠 폭 = 7.5 - 0.27*2"),
]


# 2) 표 셀 테두리 색상: 회색 -> 검정
BORDER_COLOR_SWAP = (
    re.compile(r"_cell_border\(cell, '808080', 0\.5\)"),
    "_cell_border(cell, '000000', 0.5)"
)


# 3) _title 내 페이지 번호 출력 블록 제거
TITLE_PG_REMOVE = (
    re.compile(
        r"\n    _tb\(s, Inches\(6\.5\), Inches\(0\.18\), Inches\(0\.6\), Inches\(0\.3\),\n"
        r"        f'\{pg\}/4', 12, True, CHAR, PP_ALIGN\.RIGHT\)"
    ),
    ""
)


# 4) p5_flowchart 영역 조정 (LN_H/SBH 축소 + 검증 실패 박스 제거)
P5_BLOCK_PATTERN = re.compile(
    r"(def p5_flowchart\(prs\):.*?)(?=\ndef main|\Z)",
    re.DOTALL
)


def _p5_transform(match):
    block = match.group(1)

    # 4-1) LN_H 축소 (4.1 -> 3.2)
    block = block.replace(
        "LN_H = Inches(4.1)   # 다이어그램 높이 1.5배",
        "LN_H = Inches(3.2)   # 다이어그램 높이 (겹침 방지 축소)"
    )

    # 4-2) SBH 축소 (0.56 -> 0.36)
    block = block.replace(
        "SBH = Inches(0.56)          # 단계 박스 높이",
        "SBH = Inches(0.36)          # 단계 박스 높이 (겹침 방지)"
    )

    # 4-3) 검증 실패 박스 블록 제거
    block = re.sub(
        r"\n    # 판단 분기 표시[^\n]*\n"
        r"    fx = ML \+ \(LN_W \+ LGAP\) \* 1 \+ Inches\(0\.07\)\n"
        r"    fy = y0 \+ LN_HDR \+ Inches\(0\.95\)\n"
        r"    _box\(s, fx, fy, SBW, Inches\(0\.12\),\n"
        r"         '[^']*',\n"
        r"         fill=PEACH, stk=ERR, sw=1, sz=5, fc=ERR, al=PP_ALIGN\.CENTER\)\n",
        "\n",
        block
    )

    return block


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) 마진/폭 조정
    for pattern, repl in MARGIN_SWAPS:
        src = pattern.sub(repl, src)

    # 2) 표 테두리 색상
    src, n_border = BORDER_COLOR_SWAP[0].subn(BORDER_COLOR_SWAP[1], src)

    # 3) 페이지 번호 제거
    src, n_pg = TITLE_PG_REMOVE[0].subn(TITLE_PG_REMOVE[1], src)

    # 4) p5_flowchart 조정
    src, n_p5 = P5_BLOCK_PATTERN.subn(_p5_transform, src)

    # 5) 파일명/주석 v6.1 -> v7
    src = src.replace('_분석설계_v6.1.pptx', '_분석설계_v7.pptx')
    src = src.replace(' PPTX v6.1 (portrait, 4페이지)', ' PPTX v7 (portrait, 4페이지)')
    src = src.replace('system_level_spec_guide_v6.1.md', 'system_level_spec_guide_v7.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)

    return n_border, n_pg, n_p5


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v6_1.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v6_1.py', '_v7.py')
        dst = os.path.join(HERE, new_name)
        n_border, n_pg, n_p5 = transform(src, dst)
        status = 'OK' if (n_border and n_pg and n_p5) else 'PARTIAL'
        print(f'  [{status}] {base} border={n_border} pg={n_pg} p5={n_p5}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
