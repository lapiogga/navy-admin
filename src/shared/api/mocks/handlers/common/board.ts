import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type {
  BoardConfig,
  BoardCategory,
  BoardPost,
  BoardAttachment,
  BoardComment,
  BoardAdmin,
  BoardUser,
  BoardUnit,
} from '@/entities/board/types'

// ── 서브시스템 정의 ──────────────────────────────────────────

interface SubsystemDef {
  code: string
  name: string
}

const subsystems: SubsystemDef[] = [
  { code: 'sys01', name: '초과근무관리' },
  { code: 'sys02', name: '설문종합관리' },
  { code: 'sys03', name: '성과관리' },
  { code: 'sys04', name: '인증서발급신청' },
  { code: 'sys05', name: '행정규칙포탈' },
  { code: 'sys06', name: '해병대규정관리' },
  { code: 'sys07', name: '군사자료관리' },
  { code: 'sys08', name: '부대계보관리' },
  { code: 'sys09', name: '영현보훈' },
  { code: 'sys10', name: '주말버스예약관리' },
  { code: 'sys11', name: '연구자료종합관리' },
  { code: 'sys12', name: '지시건의사항관리' },
  { code: 'sys13', name: '지식관리' },
  { code: 'sys14', name: '나의 제언' },
  { code: 'sys15', name: '보안일일결산' },
  { code: 'sys16', name: '회의실예약관리' },
  { code: 'sys17', name: '검열결과관리' },
  { code: 'sys18', name: '직무기술서관리' },
]

// 서브시스템별 공지사항 제목 템플릿
const noticeTopics: Record<string, string[]> = {
  sys01: ['초과근무 신청 마감일 안내', '야근 수당 정산 기준 변경', '특근 신청 절차 개선', '초과근무 한도 조정 공지', '당직근무 편성표 배포', '초과근무 실적 보고 양식', '근무시간 기록 시스템 점검', '월별 초과근무 현황 보고'],
  sys02: ['부대 만족도 설문 실시', '교육훈련 평가 설문 안내', '복지 개선 의견조사', '설문 작성 기한 연장', '설문결과 분석보고서 공유', '신규 설문 시스템 사용법', '분기별 설문 일정 공지'],
  sys03: ['성과평가 일정 안내', '목표관리제 시행 공지', 'BSC 평가 기준 개정', '성과 면담 일정표', '핵심성과지표 제출 안내', '우수부대 포상 기준', '성과보고서 작성 가이드', '성과등급 조정 기준 변경'],
  sys04: ['인증서 발급 시스템 점검', '전자인증서 도입 안내', '인증서 갱신 절차 변경', '보안인증서 발급 기준', '인증서 분실 시 재발급 안내', '신규 인증서 종류 추가'],
  sys05: ['행정규칙 개정 사항 안내', '신규 행정규칙 제정 공지', '규칙 열람 시스템 개선', '행정규칙 폐지 목록', '규칙 제개정 의견수렴', '행정규칙 시행일 변경'],
  sys06: ['해병대 규정 개정 공포', '규정 제정 절차 안내', '규정 열람 권한 변경', '규정 예고 일정표', '규정 해석 질의 안내', '규정집 PDF 다운로드 안내', '규정 교육 자료 배포'],
  sys07: ['군사자료 분류체계 변경', '보안등급별 열람 기준', '자료 등록 절차 안내', '군사자료 폐기 일정', '신규 자료 등록 요청', '자료실 시스템 정기점검', '군사자료 목록 갱신'],
  sys08: ['부대 계보 자료 갱신 요청', '부대 연혁 기록 기준', '계보 자료 제출 안내', '부대 변천사 편찬 일정', '부대마크 등록 절차', '계보 DB 정기 백업', '부대 창설일 확인 요청'],
  sys09: ['현충일 행사 안내', '순직장병 추모제 일정', '보훈 대상자 확인 절차', '영현 관리 점검 일정', '추모비 관리 기준', '보훈 기록 갱신 안내', '영현봉안관 참배 절차'],
  sys10: ['주말버스 노선 변경 안내', '버스 예약 시스템 점검', '설 연휴 특별 운행', '추석 특별 운행 안내', '주말버스 탑승 수칙', '노선별 시간표 변경', '예약 취소 규정 안내'],
  sys11: ['연구과제 공모 안내', '논문 제출 기한 연장', '연구비 정산 기준', '학술대회 참가 안내', '연구자료 공유 플랫폼', '연구 윤리 교육 일정', '우수 연구 포상 안내'],
  sys12: ['대통령 지시사항 하달', '국방부장관 지시 전파', '지시사항 이행점검 일정', '건의사항 처리 현황', '지시사항 완료 보고 기한', '건의사항 접수 안내', '분기 지시이행 현황'],
  sys13: ['지식 공유 우수사례 포상', '지식관리 시스템 업데이트', 'CoP 활동 안내', '지식맵 갱신 요청', '전문가 네트워크 등록', '지식 경진대회 일정', '베스트 프랙티스 공유'],
  sys14: ['제언 우수사례 발표', '제도개선 제언 공모전', '제언 심사 결과 안내', '제언 포상 기준 변경', '월별 우수 제언 선정', '제언 제출 가이드라인'],
  sys15: ['보안점검 일정 공지', '보안서약서 제출 안내', '보안 위반 사례 공유', '보안등급 재분류 안내', 'PC 보안 점검 일정', '비밀문서 관리 기준', '보안 교육 이수 안내', '일일보안결산 양식 변경'],
  sys16: ['회의실 예약 시스템 점검', '신규 회의실 개방 안내', '화상회의 장비 사용법', '회의실 이용 수칙 변경', '예약 취소 패널티 안내', '회의실 예약 가능시간 변경'],
  sys17: ['검열 일정 사전 안내', '검열결과 보고 양식 변경', '부대 자체검열 기준', '검열 대비 체크리스트', '검열 시정조치 기한', '검열 우수부대 포상'],
  sys18: ['직무기술서 갱신 안내', '신규 직무 등록 절차', '직무분석 일정 공지', '직무기술서 작성 가이드', '직무역량 평가 기준', '직무 재배치 안내', '직무기술서 승인 절차'],
}

// 서브시스템별 QnA 제목 템플릿
const qnaTopics: Record<string, string[]> = {
  sys01: ['초과근무 신청이 반려되었는데 사유를 모르겠습니다', '야근수당 계산 기준이 궁금합니다', '특근명령서 출력 방법', '초과근무 시간 수정 가능한가요?', '당직근무와 초과근무 중복 처리'],
  sys02: ['설문 응답 수정이 가능한가요?', '설문 결과 엑셀 다운로드 방법', '익명 설문 작성자 확인 여부', '설문 마감일 연장 요청', '설문 문항 추가 방법'],
  sys03: ['성과지표 입력 오류 수정 방법', 'BSC 가중치 변경 가능 여부', '성과 면담 일정 변경 요청', '성과등급 이의신청 절차', '목표 수정 승인 프로세스'],
  sys04: ['인증서 재발급 소요 기간', '인증서 비밀번호 초기화', '인증서 유효기간 확인 방법', '타 시스템 인증서 호환 여부'],
  sys05: ['행정규칙 검색 방법 문의', '규칙 개정 의견 제출 절차', '폐지된 규칙 열람 가능 여부', '규칙 간 충돌 시 적용 기준'],
  sys06: ['규정 해석 문의 절차', '규정 제개정 소요 기간', '규정 열람 권한 신청', '구 규정과 신 규정 비교 방법', '규정 예고 의견 제출'],
  sys07: ['군사자료 열람 신청 방법', '자료 보안등급 변경 절차', '자료 다운로드 오류 해결', '자료 등록 시 필수항목 안내'],
  sys08: ['부대 계보 자료 수정 요청', '부대마크 파일 규격', '부대 연혁 기록 기준일', '계보 자료 열람 권한', '부대 통폐합 시 계보 처리'],
  sys09: ['보훈 대상자 등록 절차', '추모행사 참석 신청', '영현봉안관 방문 예약', '보훈 기록 수정 요청'],
  sys10: ['예약 취소 후 재예약 가능 시점', '주말버스 노선 추가 요청', '탑승 인원 변경 방법', '예약 확인서 출력', '버스 지연 시 대처 방안'],
  sys11: ['연구비 신청 서류 목록', '논문 투고 절차 문의', '연구자료 공유 범위', '공동연구 신청 방법'],
  sys12: ['지시사항 이행 기한 연장 요청', '건의사항 처리 현황 확인', '지시사항 완료 보고 양식', '건의사항 비공개 처리 기준'],
  sys13: ['지식 등록 카테고리 문의', 'CoP 가입 방법', '지식맵 수정 요청', '우수지식 추천 기준'],
  sys14: ['제언 심사 진행 현황 확인', '제언 수정 가능 여부', '포상금 지급 기준', '제언 반려 시 재제출'],
  sys15: ['보안점검 항목 해석 문의', '보안서약서 양식 변경 건', 'PC 보안 소프트웨어 설치 오류', '비밀문서 열람 기록 확인', '보안등급 재분류 신청'],
  sys16: ['회의실 예약 충돌 해결', '화상회의 장비 대여 절차', '예약 취소 패널티 면제 요청', '회의실 이용시간 연장'],
  sys17: ['검열결과 이의신청 절차', '시정조치 기한 연장 방법', '자체검열 양식 다운로드', '검열 대비 자료 목록'],
  sys18: ['직무기술서 작성 예시', '직무분석 참여 대상 확인', '직무역량 자가평가 방법', '직무기술서 승인 기간'],
}

// ── Mock 데이터 ──────────────────────────────────────────────

// 공통 게시판 설정 (기존)
const commonBoardConfigs: BoardConfig[] = [
  {
    id: 'board-1',
    boardName: '공지사항',
    boardType: 'NOTICE',
    subsystemCode: 'common',
    description: '전체 공지사항 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: false,
    maxAttachSize: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'board-2',
    boardName: '질의응답',
    boardType: 'QNA',
    subsystemCode: 'common',
    description: '질문과 답변 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: true,
    maxAttachSize: 5,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 'board-3',
    boardName: '자료실',
    boardType: 'DATA',
    subsystemCode: 'common',
    description: '자료 공유 게시판',
    useCategory: true,
    useAttachment: true,
    useComment: false,
    maxAttachSize: 50,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 'board-4',
    boardName: '자유게시판',
    boardType: 'FREE',
    subsystemCode: 'common',
    description: '자유 토론 게시판',
    useCategory: false,
    useAttachment: true,
    useComment: true,
    maxAttachSize: 10,
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 'board-5',
    boardName: '건의사항',
    boardType: 'FREE',
    subsystemCode: 'common',
    description: '건의 및 제안 게시판',
    useCategory: false,
    useAttachment: false,
    useComment: true,
    maxAttachSize: 0,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
]

// 18개 서브시스템별 공지사항/질의응답 게시판 설정 동적 생성
const sysBoardConfigs: BoardConfig[] = subsystems.flatMap((sys) => [
  {
    id: `${sys.code}-notice`,
    boardName: `${sys.name} 공지사항`,
    boardType: 'NOTICE',
    subsystemCode: sys.code,
    description: `${sys.name}체계 공지사항 게시판`,
    useCategory: true,
    useAttachment: true,
    useComment: false,
    maxAttachSize: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: `${sys.code}-qna`,
    boardName: `${sys.name} 질의응답`,
    boardType: 'QNA',
    subsystemCode: sys.code,
    description: `${sys.name}체계 질의응답 게시판`,
    useCategory: true,
    useAttachment: true,
    useComment: true,
    maxAttachSize: 5,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
])

// sys03-data: 성과관리 자료실 (별도 boardId 사용)
const sys03DataConfig: BoardConfig = {
  id: 'sys03-data',
  boardName: '성과관리 자료실',
  boardType: 'DATA',
  subsystemCode: 'sys03',
  description: '성과관리체계 자료실 게시판',
  useCategory: true,
  useAttachment: true,
  useComment: false,
  maxAttachSize: 50,
  createdAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
}

// sys18은 boardId="sys18" 패턴 사용 (notice/qna 구분 없이)
const sys18BoardConfig: BoardConfig = {
  id: 'sys18',
  boardName: '직무기술서관리 게시판',
  boardType: 'FREE',
  subsystemCode: 'sys18',
  description: '직무기술서관리체계 통합 게시판',
  useCategory: true,
  useAttachment: true,
  useComment: true,
  maxAttachSize: 10,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockBoardConfigs: BoardConfig[] = [
  ...commonBoardConfigs,
  ...sysBoardConfigs,
  sys03DataConfig,
  sys18BoardConfig,
]

// 공통 카테고리 (기존)
const commonCategories: BoardCategory[] = [
  { id: 'cat-1', boardId: 'board-1', categoryName: '일반공지', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-2', boardId: 'board-1', categoryName: '긴급공지', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-3', boardId: 'board-1', categoryName: '훈련공지', sortOrder: 3, useYn: 'Y' },
  { id: 'cat-4', boardId: 'board-2', categoryName: '행정질의', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-5', boardId: 'board-2', categoryName: '기술질의', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-6', boardId: 'board-3', categoryName: '교육자료', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-7', boardId: 'board-3', categoryName: '업무양식', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-8', boardId: 'board-3', categoryName: '규정집', sortOrder: 3, useYn: 'Y' },
  { id: 'cat-9', boardId: 'board-3', categoryName: '매뉴얼', sortOrder: 4, useYn: 'Y' },
]

// 서브시스템별 카테고리
const sysCategories: BoardCategory[] = subsystems.flatMap((sys) => [
  { id: `cat-${sys.code}-notice-1`, boardId: `${sys.code}-notice`, categoryName: '일반공지', sortOrder: 1, useYn: 'Y' },
  { id: `cat-${sys.code}-notice-2`, boardId: `${sys.code}-notice`, categoryName: '긴급공지', sortOrder: 2, useYn: 'Y' },
  { id: `cat-${sys.code}-qna-1`, boardId: `${sys.code}-qna`, categoryName: '업무질의', sortOrder: 1, useYn: 'Y' },
  { id: `cat-${sys.code}-qna-2`, boardId: `${sys.code}-qna`, categoryName: '시스템질의', sortOrder: 2, useYn: 'Y' },
])

// sys03-data 카테고리
const sys03DataCategories: BoardCategory[] = [
  { id: 'cat-sys03-data-1', boardId: 'sys03-data', categoryName: '성과보고서', sortOrder: 1, useYn: 'Y' },
  { id: 'cat-sys03-data-2', boardId: 'sys03-data', categoryName: '평가양식', sortOrder: 2, useYn: 'Y' },
  { id: 'cat-sys03-data-3', boardId: 'sys03-data', categoryName: '교육자료', sortOrder: 3, useYn: 'Y' },
]

const mockCategories: BoardCategory[] = [...commonCategories, ...sysCategories, ...sys03DataCategories]

const units = ['해병대사령부', '해병대1사단', '해병대2사단', '교육훈련단', '해병대6여단']
const ranks = ['소위', '중위', '대위', '소령', '중령', '대령', '하사', '중사', '상사']

function generatePosts(boardId: string, count: number): BoardPost[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `post-${boardId}-${i + 1}`
    const hasAttach = Math.random() > 0.6
    const attachments: BoardAttachment[] = hasAttach
      ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (__, j) => ({
          id: `attach-${id}-${j}`,
          postId: id,
          fileName: `${faker.system.fileName()}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 10000,
          mimeType: 'application/pdf',
          uploadedAt: faker.date.recent({ days: 30 }).toISOString(),
        }))
      : []

    return {
      id,
      boardId,
      categoryId: mockCategories.find((c) => c.boardId === boardId)?.id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
      authorId: faker.string.uuid(),
      authorName: faker.person.lastName() + faker.person.firstName(),
      authorUnit: faker.helpers.arrayElement(units),
      viewCount: Math.floor(Math.random() * 500),
      isPinned: i === 0,
      status: 'ACTIVE',
      attachments,
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  })
}

// 서브시스템별 도메인 맥락이 있는 게시글 생성
function generateSysNoticePosts(sysCode: string, count: number): BoardPost[] {
  const boardId = `${sysCode}-notice`
  const topics = noticeTopics[sysCode] ?? []
  return Array.from({ length: count }, (_, i) => {
    const id = `post-${boardId}-${i + 1}`
    const title = topics[i % topics.length] ?? faker.lorem.sentence()
    const hasAttach = Math.random() > 0.5
    const attachments: BoardAttachment[] = hasAttach
      ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (__, j) => ({
          id: `attach-${id}-${j}`,
          postId: id,
          fileName: `${faker.system.fileName()}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 10000,
          mimeType: 'application/pdf',
          uploadedAt: faker.date.recent({ days: 30 }).toISOString(),
        }))
      : []

    return {
      id,
      boardId,
      categoryId: i < 2 ? `cat-${sysCode}-notice-2` : `cat-${sysCode}-notice-1`,
      title,
      content: faker.lorem.paragraphs(2),
      authorId: faker.string.uuid(),
      authorName: faker.person.lastName() + faker.person.firstName(),
      authorUnit: faker.helpers.arrayElement(units),
      viewCount: Math.floor(Math.random() * 300) + 10,
      isPinned: i < 2,
      status: 'ACTIVE',
      attachments,
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  })
}

function generateSysQnaPosts(sysCode: string, count: number): BoardPost[] {
  const boardId = `${sysCode}-qna`
  const topics = qnaTopics[sysCode] ?? []
  return Array.from({ length: count }, (_, i) => {
    const id = `post-${boardId}-${i + 1}`
    const title = topics[i % topics.length] ?? faker.lorem.sentence()

    return {
      id,
      boardId,
      categoryId: i % 2 === 0 ? `cat-${sysCode}-qna-1` : `cat-${sysCode}-qna-2`,
      title,
      content: faker.lorem.paragraphs(1),
      authorId: faker.string.uuid(),
      authorName: faker.person.lastName() + faker.person.firstName(),
      authorUnit: faker.helpers.arrayElement(units),
      viewCount: Math.floor(Math.random() * 150) + 5,
      isPinned: false,
      status: 'ACTIVE',
      attachments: [],
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      updatedAt: faker.date.recent({ days: 20 }).toISOString(),
    }
  })
}

// 공통 게시판 게시글
const commonPosts: BoardPost[] = [
  ...generatePosts('board-1', 20),
  ...generatePosts('board-2', 15),
  ...generatePosts('board-3', 25),
  ...generatePosts('board-4', 18),
  ...generatePosts('board-5', 12),
]

// 서브시스템별 공지사항/QnA 게시글 (각 시스템당 notice 7~10개, qna 3~5개)
const sysPosts: BoardPost[] = subsystems.flatMap((sys) => [
  ...generateSysNoticePosts(sys.code, faker.number.int({ min: 7, max: 10 })),
  ...generateSysQnaPosts(sys.code, faker.number.int({ min: 3, max: 5 })),
])

// sys03-data 자료실 게시글
const sys03DataPosts: BoardPost[] = generatePosts('sys03-data', 10)

// sys18 통합 게시판용 추가 게시글 (boardId="sys18")
const sys18Posts: BoardPost[] = generatePosts('sys18', 8)

const mockPosts: BoardPost[] = [...commonPosts, ...sysPosts, ...sys03DataPosts, ...sys18Posts]

function generateComments(postId: string, count: number): BoardComment[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `comment-${postId}-${i + 1}`,
    postId,
    content: faker.lorem.sentence(),
    authorId: faker.string.uuid(),
    authorName: faker.person.lastName() + faker.person.firstName(),
    createdAt: faker.date.recent({ days: 10 }).toISOString(),
  }))
}

const mockComments: BoardComment[] = mockPosts.flatMap((post) => {
  const count = Math.floor(Math.random() * 5)
  return generateComments(post.id, count)
})

const mockBoardAdmins: BoardAdmin[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, i) => ({
    id: `admin-${board.id}-${i + 1}`,
    boardId: board.id,
    userId: faker.string.uuid(),
    userName: faker.person.lastName() + faker.person.firstName(),
    userRank: faker.helpers.arrayElement(ranks),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

const mockBoardUsers: BoardUser[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
    id: `buser-${board.id}-${i + 1}`,
    boardId: board.id,
    userId: faker.string.uuid(),
    userName: faker.person.lastName() + faker.person.firstName(),
    userRank: faker.helpers.arrayElement(ranks),
    userUnit: faker.helpers.arrayElement(units),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

const mockBoardUnits: BoardUnit[] = mockBoardConfigs.flatMap((board) =>
  Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => ({
    id: `bunit-${board.id}-${i + 1}`,
    boardId: board.id,
    unitCode: `UNIT-${String(i + 1).padStart(2, '0')}`,
    unitName: faker.helpers.arrayElement(units),
    assignedAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
  })),
)

// ── MSW 핸들러 ──────────────────────────────────────────────

export const boardHandlers = [
  // ── 게시판 설정 ──

  http.get('/api/common/board-configs', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    const filtered = keyword
      ? mockBoardConfigs.filter(
          (b) => b.boardName.includes(keyword) || b.description.includes(keyword),
        )
      : mockBoardConfigs

    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardConfig>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/board-configs', async ({ request }) => {
    const body = (await request.json()) as Omit<BoardConfig, 'id' | 'createdAt' | 'updatedAt'>
    const newConfig: BoardConfig = {
      ...body,
      id: faker.string.uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockBoardConfigs.push(newConfig)
    const result: ApiResult<BoardConfig> = {
      success: true,
      data: newConfig,
      message: '등록되었습니다',
    }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.get('/api/common/board-configs/:id', ({ params }) => {
    const config = mockBoardConfigs.find((b) => b.id === params.id)
    if (!config) return HttpResponse.json({ success: false, message: '게시판을 찾을 수 없습니다' }, { status: 404 })
    const result: ApiResult<BoardConfig> = { success: true, data: config }
    return HttpResponse.json(result)
  }),

  http.put('/api/common/board-configs/:id', async ({ params, request }) => {
    const idx = mockBoardConfigs.findIndex((b) => b.id === params.id)
    if (idx === -1) return HttpResponse.json({ success: false, message: '게시판을 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardConfig>
    mockBoardConfigs[idx] = { ...mockBoardConfigs[idx], ...body, updatedAt: new Date().toISOString() }
    const result: ApiResult<BoardConfig> = { success: true, data: mockBoardConfigs[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/board-configs/:id', ({ params }) => {
    const idx = mockBoardConfigs.findIndex((b) => b.id === params.id)
    if (idx !== -1) mockBoardConfigs.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 카테고리 ──

  http.get('/api/common/boards/:boardId/categories', ({ params }) => {
    const categories = mockCategories.filter((c) => c.boardId === params.boardId)
    const result: ApiResult<BoardCategory[]> = { success: true, data: categories }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/categories', async ({ params, request }) => {
    const body = (await request.json()) as Omit<BoardCategory, 'id' | 'boardId'>
    const newCat: BoardCategory = { ...body, id: faker.string.uuid(), boardId: params.boardId as string }
    mockCategories.push(newCat)
    const result: ApiResult<BoardCategory> = { success: true, data: newCat, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.put('/api/common/boards/:boardId/categories/:id', async ({ params, request }) => {
    const idx = mockCategories.findIndex((c) => c.id === params.id && c.boardId === params.boardId)
    if (idx === -1) return HttpResponse.json({ success: false, message: '카테고리를 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardCategory>
    mockCategories[idx] = { ...mockCategories[idx], ...body }
    const result: ApiResult<BoardCategory> = { success: true, data: mockCategories[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/boards/:boardId/categories/:id', ({ params }) => {
    const idx = mockCategories.findIndex((c) => c.id === params.id && c.boardId === params.boardId)
    if (idx !== -1) mockCategories.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 게시글 최신 N건 ──

  http.get('/api/common/boards/:boardId/recent', ({ params, request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') ?? '5')
    const filtered = mockPosts
      .filter((p) => p.boardId === params.boardId && p.status === 'ACTIVE')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        title: p.title,
        authorName: p.authorName,
        createdAt: p.createdAt,
        viewCount: p.viewCount,
      }))
    const result: ApiResult<typeof filtered> = { success: true, data: filtered }
    return HttpResponse.json(result)
  }),

  // ── 게시글 ──

  http.get('/api/common/boards/:boardId/posts', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''
    const categoryId = url.searchParams.get('categoryId') ?? ''

    let filtered = mockPosts.filter((p) => p.boardId === params.boardId && p.status === 'ACTIVE')
    if (keyword) {
      filtered = filtered.filter((p) => p.title.includes(keyword) || p.content.includes(keyword))
    }
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId)
    }

    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardPost>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.get('/api/common/boards/:boardId/posts/:id', ({ params }) => {
    const post = mockPosts.find((p) => p.id === params.id && p.boardId === params.boardId)
    if (!post) return HttpResponse.json({ success: false, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    // 조회수 증가
    post.viewCount += 1
    const result: ApiResult<BoardPost> = { success: true, data: post }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/posts', async ({ params, request }) => {
    const body = (await request.json()) as Partial<BoardPost>
    const newPost: BoardPost = {
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      categoryId: body.categoryId,
      title: body.title ?? '',
      content: body.content ?? '',
      authorId: 'user-mock',
      authorName: '홍길동',
      authorUnit: '해병대사령부',
      viewCount: 0,
      isPinned: body.isPinned ?? false,
      status: 'ACTIVE',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockPosts.push(newPost)
    const result: ApiResult<BoardPost> = { success: true, data: newPost, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.put('/api/common/boards/:boardId/posts/:id', async ({ params, request }) => {
    const idx = mockPosts.findIndex((p) => p.id === params.id && p.boardId === params.boardId)
    if (idx === -1) return HttpResponse.json({ success: false, message: '게시글을 찾을 수 없습니다' }, { status: 404 })
    const body = (await request.json()) as Partial<BoardPost>
    mockPosts[idx] = { ...mockPosts[idx], ...body, updatedAt: new Date().toISOString() }
    const result: ApiResult<BoardPost> = { success: true, data: mockPosts[idx], message: '수정되었습니다' }
    return HttpResponse.json(result)
  }),

  http.delete('/api/common/boards/:boardId/posts/:id', ({ params }) => {
    const idx = mockPosts.findIndex((p) => p.id === params.id && p.boardId === params.boardId)
    if (idx !== -1) mockPosts[idx].status = 'DELETED'
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 댓글 ──

  http.get('/api/common/posts/:postId/comments', ({ params }) => {
    const comments = mockComments.filter((c) => c.postId === params.postId)
    const result: ApiResult<BoardComment[]> = { success: true, data: comments }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/posts/:postId/comments', async ({ params, request }) => {
    const body = (await request.json()) as { content: string }
    const newComment: BoardComment = {
      id: faker.string.uuid(),
      postId: params.postId as string,
      content: body.content,
      authorId: 'user-mock',
      authorName: '홍길동',
      createdAt: new Date().toISOString(),
    }
    mockComments.push(newComment)
    const result: ApiResult<BoardComment> = { success: true, data: newComment, message: '등록되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/posts/:postId/comments/:id', ({ params }) => {
    const idx = mockComments.findIndex((c) => c.id === params.id && c.postId === params.postId)
    if (idx !== -1) mockComments.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 첨부파일 ──

  http.post('/api/common/board/attachments', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const newAttach: BoardAttachment = {
      id: faker.string.uuid(),
      postId: '',
      fileName: file?.name ?? 'unknown',
      fileSize: file?.size ?? 0,
      mimeType: file?.type ?? 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    }
    const result: ApiResult<BoardAttachment> = { success: true, data: newAttach, message: '업로드되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/board/attachments/:id', () => {
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 관리자설정 ──

  http.get('/api/common/boards/:boardId/admins', ({ params }) => {
    const admins = mockBoardAdmins.filter((a) => a.boardId === params.boardId)
    const result: ApiResult<BoardAdmin[]> = { success: true, data: admins }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/admins', async ({ params, request }) => {
    const body = (await request.json()) as { userIds: string[] }
    const newAdmins: BoardAdmin[] = body.userIds.map((userId) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      userId,
      userName: faker.person.lastName() + faker.person.firstName(),
      userRank: faker.helpers.arrayElement(ranks),
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardAdmins.push(...newAdmins)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/admins/:adminId', ({ params }) => {
    const idx = mockBoardAdmins.findIndex(
      (a) => a.id === params.adminId && a.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardAdmins.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 사용자설정 ──

  http.get('/api/common/boards/:boardId/users', ({ params, request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')

    const filtered = mockBoardUsers.filter((u) => u.boardId === params.boardId)
    const content = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<BoardUser>> = {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        size,
        number: page,
      },
    }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/users', async ({ params, request }) => {
    const body = (await request.json()) as { userIds: string[] }
    const newUsers: BoardUser[] = body.userIds.map((userId) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      userId,
      userName: faker.person.lastName() + faker.person.firstName(),
      userRank: faker.helpers.arrayElement(ranks),
      userUnit: faker.helpers.arrayElement(units),
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardUsers.push(...newUsers)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/users/:userId', ({ params }) => {
    const idx = mockBoardUsers.findIndex(
      (u) => u.id === params.userId && u.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardUsers.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),

  // ── 부대설정 ──

  http.get('/api/common/boards/:boardId/units', ({ params }) => {
    const boardUnits = mockBoardUnits.filter((u) => u.boardId === params.boardId)
    const result: ApiResult<BoardUnit[]> = { success: true, data: boardUnits }
    return HttpResponse.json(result)
  }),

  http.post('/api/common/boards/:boardId/units', async ({ params, request }) => {
    const body = (await request.json()) as { units: { unitCode: string; unitName: string }[] }
    const newUnits: BoardUnit[] = body.units.map((u) => ({
      id: faker.string.uuid(),
      boardId: params.boardId as string,
      unitCode: u.unitCode,
      unitName: u.unitName,
      assignedAt: new Date().toISOString().split('T')[0],
    }))
    mockBoardUnits.push(...newUnits)
    const result: ApiResult = { success: true, data: undefined as never, message: '저장되었습니다' }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/common/boards/:boardId/units/:unitId', ({ params }) => {
    const idx = mockBoardUnits.findIndex(
      (u) => u.id === params.unitId && u.boardId === params.boardId,
    )
    if (idx !== -1) mockBoardUnits.splice(idx, 1)
    const result: ApiResult = { success: true, data: undefined as never, message: '삭제되었습니다' }
    return HttpResponse.json(result)
  }),
]
