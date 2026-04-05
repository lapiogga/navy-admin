# Phase 2: 메인 포탈 (00_포탈) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 02-메인 포탈
**Areas discussed:** 대시보드 구성, 세션 만료 UX, 서브시스템 전환 방식, 로그인 화면 브랜딩

---

## 대시보드 구성

| Option | Description | Selected |
|--------|-------------|----------|
| 공지사항 영역 | PTL-02에 명시된 공지사항 목록. 상단에 최신 3~5건 표시, Mock 데이터 | ✓ |
| 빠른 접근/즐겨찾기 | 자주 사용하는 서브시스템을 상단에 핀 고정 | |
| 카드만으로 충분 | 현재 구조 유지 | ✓ (카드 유지) |

**User's choice:** 공지사항 영역 추가 + 서브시스템 카드 유지 (즐겨찾기 생략)

### 공지사항 배치

| Option | Description | Selected |
|--------|-------------|----------|
| 상단 배너 | 카드 그리드 위에 최신 3건 한 줄씩 표시 | ✓ |
| 좌측 사이드 패널 | 카드 그리드 좌측에 공지사항 패널 배치 | |
| Claude 재량 | Claude가 적절히 결정 | |

**User's choice:** 상단 배너
**Notes:** 미리보기 확인 후 선택

---

## 세션 만료 UX

### 세션 만료 조건

| Option | Description | Selected |
|--------|-------------|----------|
| Idle 감지 | 마우스/키보드 활동 없이 N분 경과 시 만료 | |
| 고정 시간 세션 | 30분 SESSION_DURATION 유지 | |
| Idle + 사전 경고 | Idle N분 전에 경고 모달 표시 + 연장 버튼 | ✓ |

**User's choice:** Idle + 사전 경고

### 만료 안내 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 모달 안내 | 만료 30초 전 antd Modal: 카운트다운 + 연장/로그아웃 | ✓ |
| 상단 알림 | notification으로 우측 상단 경고 | |
| Claude 재량 | | |

**User's choice:** 모달 안내

---

## 서브시스템 전환 방식

### 열기 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 같은 창 라우팅 | navigate()로 같은 창 이동 | |
| 새 창 (window.open) | 현재 방식 유지, 독립 창 | ✓ |
| Claude 재량 | | |

**User's choice:** 새 창 (window.open)

### 나가기 동작

| Option | Description | Selected |
|--------|-------------|----------|
| 헤더 나가기 버튼 | '메인으로' 버튼, window.close() + opener.focus() | ✓ |
| beforeunload 가드 | 창 닫기 시 확인 대화상자 | |
| Claude 재량 | | |

**User's choice:** 헤더 나가기 버튼

---

## 로그인 화면 브랜딩

### 브랜딩 수준

**User's choice:** (Other) 해병대규정관리체계를 제외한 나머지는 모두 해군(navy)에서 사용하는 시스템. 해군(NAVY)로 통일, marine 사용하지 않음.

### 보안 경고문

| Option | Description | Selected |
|--------|-------------|----------|
| 추가 | 로그인 폼 하단에 경고문 표시 | |
| 불필요 | MVP에서 생략 | ✓ |

**User's choice:** 불필요

---

## Claude's Discretion

- Idle 감지 이벤트 목록
- 공지사항 Mock 데이터 구조
- 세션 만료 Modal UI 패턴
- '메인으로' 버튼 위치/스타일

## Deferred Ideas

None
