#!/usr/bin/env python3
"""
v6 -> v6.1 일괄 변환기
  - Page 1 (시스템 개념도) 삭제, 총 5장 -> 4장
  - 최소 글자 크기 9pt -> 10pt
  - 콘텐츠 폭 확대 (ML 0.4 -> 0.3, CW 6.7 -> 6.9)
  - 플로우챠트:
      * 레인 높이 2.75 -> 4.1 (1.5배)
      * 레인 사이 간격 10pt (약 0.14in)
      * '(React 18)', '(API/Mock)' 삭제
      * 하단 테이블 좌우 -> 상하 배치
  - 출력 파일명 _v6.pptx -> _v6.1.pptx
"""
import os
import re
import glob

HERE = os.path.dirname(os.path.abspath(__file__))


# 1) 콘텐츠 폭 확대: ML 0.4 -> 0.3, CW 6.7 -> 6.9
MARGIN_SWAPS = [
    (re.compile(r"^ML\s*=\s*Inches\(0\.4\)[^\n]*", re.MULTILINE),
     "ML = Inches(0.3)       # 좌우 마진"),
    (re.compile(r"^CW\s*=\s*Inches\(6\.7\)[^\n]*", re.MULTILINE),
     "CW = Inches(6.9)       # 콘텐츠 폭 = 7.5 - 0.3*2"),
]


# 2) _run 최소 9pt -> 10pt
RUN_CLAMP_SWAP = (
    re.compile(r"sz = max\(sz, 9\)"),
    "sz = max(sz, 10)"
)


# 3) _title 내 'f{pg}/5' -> 'f{pg}/4'
TITLE_PG_SWAP = (
    re.compile(r"f'\{pg\}/5'"),
    "f'{pg}/4'"
)


# 4) p1_concept 함수 제거
P1_BLOCK_PATTERN = re.compile(
    r"# ═+\n# Page 1: 시스템 개념도\n# ═+\n\n"
    r"def p1_concept\(prs\):.*?(?=\n\n# ═+\n# Page 2)",
    re.DOTALL
)


# 5) main 함수 수정: p1 호출 제거 + print 라벨 재번호
MAIN_P1_SWAP = (
    re.compile(
        r"    print\('\[1/5\] 시스템 개념도\.\.\.'\)\n"
        r"    p1_concept\(prs\)\n"
        r"    print\('\[2/5\] 목표모델\.\.\.'\)\n"
        r"    p2_target\(prs\)\n"
        r"    print\('\[3/5\] 유스케이스\.\.\.'\)\n"
        r"    p3_usecase\(prs\)\n"
        r"    print\('\[4/5\] 스토리보드\.\.\.'\)\n"
        r"    p4_storyboard\(prs\)\n"
        r"    print\('\[5/5\] 플로우차트\.\.\.'\)\n"
        r"    p5_flowchart\(prs\)"
    ),
    "    print('[1/4] 목표모델...')\n"
    "    p2_target(prs)\n"
    "    print('[2/4] 유스케이스...')\n"
    "    p3_usecase(prs)\n"
    "    print('[3/4] 스토리보드...')\n"
    "    p4_storyboard(prs)\n"
    "    print('[4/4] 플로우차트...')\n"
    "    p5_flowchart(prs)"
)


# 6) 각 page pg 번호 재조정 (2->1, 3->2, 4->3, 5->4)
#    _title(s, '...', '...', N) 형식; 함수 블록 추출 후 치환
def _renumber_pg(src, fn_name, old_n, new_n):
    """함수 블록 내 첫 번째 _title(..., old_n) -> (..., new_n)"""
    block_pat = re.compile(
        rf"(def {fn_name}\(prs\):.*?)(?=\ndef p\d_|\ndef main|\Z)",
        re.DOTALL
    )

    def _sub(m):
        block = m.group(1)
        # _title(...) 호출 내 마지막 ', N)' 을 ', new_n)' 으로 치환 (첫 매칭만)
        block = re.sub(
            rf", {old_n}\)\n",
            f", {new_n})\n",
            block,
            count=1
        )
        return block

    return block_pat.sub(_sub, src, count=1)


# 7) p5_flowchart 함수 전체 수정
P5_BLOCK_PATTERN = re.compile(
    r"(def p5_flowchart\(prs\):.*?)(?=\ndef main|\Z)",
    re.DOTALL
)


def _p5_transform(match):
    block = match.group(1)

    # 7-1) 레인명 단순화
    block = block.replace("'프론트엔드 (React 18)'", "'프론트엔드'")
    block = block.replace("'백엔드 (API/Mock)'", "'백엔드'")

    # 7-2) 레인 크기/간격 추가 (10pt ≈ 0.14in)
    block = block.replace(
        "LN_W = CW // 4\n    LN_H = Inches(2.75)",
        "LGAP = Inches(0.14)  # 레인 사이 간격 (10pt)\n"
        "    LN_W = (CW - 3 * LGAP) // 4\n"
        "    LN_H = Inches(4.1)   # 다이어그램 높이 1.5배"
    )

    # 7-3) x 좌표 계산 (LGAP 반영)
    block = block.replace(
        "lx = ML + LN_W * i",
        "lx = ML + (LN_W + LGAP) * i"
    )
    block = block.replace(
        "sx = ML + LN_W * lane + Inches(0.06)",
        "sx = ML + (LN_W + LGAP) * lane + Inches(0.07)"
    )
    block = block.replace(
        "fx = ML + LN_W * 1 + Inches(0.06)",
        "fx = ML + (LN_W + LGAP) * 1 + Inches(0.07)"
    )

    # 7-4) 하단 테이블 좌우 -> 상하 배치
    # 첫 번째 테이블: LW -> CW
    block = re.sub(
        r"    LW = int\(CW \* 0\.52\)\n"
        r"    _tbl\(s, ML, dy, LW, Inches\(1\.42\),",
        "    _tbl(s, ML, dy, CW, Inches(1.6),",
        block
    )
    # cws 재계산: LW -> CW
    block = block.replace(
        "cws=[int(LW * r)",
        "cws=[int(CW * r)"
    )
    # 두 번째 테이블: RX/RW 삭제, y 좌표 아래로
    block = re.sub(
        r"    RX = ML \+ LW \+ Inches\(0\.12\)\n"
        r"    RW = CW - LW - Inches\(0\.12\)\n"
        r"    _tbl\(s, RX, dy, RW, Inches\(1\.42\),",
        "    _tbl(s, ML, dy + Inches(1.6) + Inches(0.1), CW, Inches(1.6),",
        block
    )

    return block


def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1) 콘텐츠 폭 확대
    for pattern, repl in MARGIN_SWAPS:
        src = pattern.sub(repl, src)

    # 2) _run 최소 10pt
    src = RUN_CLAMP_SWAP[0].sub(RUN_CLAMP_SWAP[1], src)

    # 3) 페이지 번호 분모 /5 -> /4
    src = TITLE_PG_SWAP[0].sub(TITLE_PG_SWAP[1], src)

    # 4) p1_concept 함수 제거
    src, n_p1 = P1_BLOCK_PATTERN.subn('', src)

    # 5) main 함수 수정
    src, n_main = MAIN_P1_SWAP[0].subn(MAIN_P1_SWAP[1], src)

    # 6) p2~p5 pg 번호 재조정
    for fn, old_n, new_n in [
        ('p2_target', 2, 1),
        ('p3_usecase', 3, 2),
        ('p4_storyboard', 4, 3),
        ('p5_flowchart', 5, 4),
    ]:
        src = _renumber_pg(src, fn, old_n, new_n)

    # 7) p5_flowchart 전체 수정
    src, n_p5 = P5_BLOCK_PATTERN.subn(_p5_transform, src)

    # 8) 파일명/주석 v6 -> v6.1
    src = src.replace('_분석설계_v6.pptx', '_분석설계_v6.1.pptx')
    src = src.replace(' PPTX v6 (portrait)', ' PPTX v6.1 (portrait, 4페이지)')
    src = src.replace('system_level_spec_guide_v6.md', 'system_level_spec_guide_v6.1.md')

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(src)

    return n_p1, n_main, n_p5


def main():
    srcs = sorted(glob.glob(os.path.join(HERE, 'generate_sys*_v6.py')))
    print(f'대상 스크립트: {len(srcs)}개')
    for src in srcs:
        base = os.path.basename(src)
        new_name = base.replace('_v6.py', '_v6_1.py')
        dst = os.path.join(HERE, new_name)
        n_p1, n_main, n_p5 = transform(src, dst)
        status = 'OK' if (n_p1 and n_main and n_p5) else 'PARTIAL'
        print(f'  [{status}] {base} p1_del={n_p1} main={n_main} p5={n_p5}')
    print('\n변환 완료.')


if __name__ == '__main__':
    main()
