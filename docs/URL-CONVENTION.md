# URL Convention (해군 행정포탈)

## 기본 경로

| 경로 | 설명 |
|------|------|
| `/login` | 로그인 페이지 |
| `/` | 메인 포탈 대시보드 |
| `/demo` | 공통 컴포넌트 데모 (Phase 0) |

## 서브시스템 경로 패턴

`/sys{번호}/{대메뉴슬러그}/{소메뉴슬러그}`

예시:
- `/sys01/application/write` -- 초과근무 신청서 작성
- `/sys01/application/list` -- 초과근무 신청 목록
- `/sys02/survey/create` -- 설문 생성

## 서브시스템 번호 대응표

| 번호 | 시스템 | URL prefix | pages/ 폴더 |
|------|--------|-----------|-------------|
| 01 | 초과근무관리체계 | /sys01 | sys01-overtime |
| 02 | 설문종합관리체계 | /sys02 | sys02-survey |
| 03 | 성과관리체계 | /sys03 | sys03-performance |
| 04 | 인증서발급신청체계 | /sys04 | sys04-certificate |
| 05 | 행정규칙포탈체계 | /sys05 | sys05-admin-rules |
| 06 | 해병대규정관리체계 | /sys06 | sys06-regulations |
| 07 | 군사자료관리체계 | /sys07 | sys07-mil-data |
| 08 | 부대계보관리체계 | /sys08 | sys08-unit-lineage |
| 09 | 영현보훈체계 | /sys09 | sys09-memorial |
| 10 | 주말버스예약관리체계 | /sys10 | sys10-weekend-bus |
| 11 | 연구자료종합관리체계 | /sys11 | sys11-research |
| 12 | 지시건의사항관리체계 | /sys12 | sys12-directives |
| 13 | 지식관리체계 | /sys13 | sys13-knowledge |
| 14 | 나의 제언 | /sys14 | sys14-suggestion |
| 15 | 보안일일결산체계 | /sys15 | sys15-security |
| 16 | 회의실예약관리체계 | /sys16 | sys16-meeting-room |
| 17 | 검열결과관리체계 | /sys17 | sys17-inspection |
| 18 | 직무기술서관리체계 | /sys18 | sys18-job-desc |

## 공통 기능 경로

`/common/{기능슬러그}`

| 경로 | 설명 |
|------|------|
| /common/auth-group | 권한관리 |
| /common/code-mgmt | 코드관리 |
| /common/board | 공통게시판 |
| /common/approval | 결재관리 |
| /common/system-mgr | 시스템관리 |
| /common/menu-mgmt | 메뉴관리 |

## 경로 상수 참조

모든 경로는 `src/shared/config/routes.ts`의 `ROUTES` 상수를 사용한다.
URL을 하드코딩하지 않는다.

```typescript
import { ROUTES } from '@/shared/config/routes'
navigate(ROUTES.SYS01.ROOT)  // '/sys01'
navigate(ROUTES.COMMON.AUTH_GROUP)  // '/common/auth-group'
```

## 서브시스템 메타데이터

`src/entities/subsystem/config.ts`의 `SUBSYSTEM_META` 객체에서 서브시스템 정보를 조회한다.

## Phase 0 이후 변경 금지 항목

- URL prefix 패턴 (`/sys{번호}`)
- 서브시스템 번호 매핑
- 공통 기능 경로 패턴 (`/common/{슬러그}`)
- ROUTES 상수 키 이름
