import type { MenuDataItem } from '@ant-design/pro-components'

/**
 * 서브시스템별 메뉴 구조.
 * 대메뉴 > 소메뉴 2단 구조. ProLayout route 형식.
 */
export const SUBSYSTEM_MENUS: Record<string, MenuDataItem[]> = {
  sys01: [
    {
      name: '신청서 관리',
      path: '/sys01/1',
      children: [
        { name: '신청서 작성', path: '/sys01/1/1' },
        { name: '신청서 결재', path: '/sys01/1/2' },
        { name: '일괄처리', path: '/sys01/1/3' },
        { name: '일괄처리 승인', path: '/sys01/1/4' },
        { name: '월말결산', path: '/sys01/1/5' },
      ],
    },
    {
      name: '현황조회',
      path: '/sys01/2',
      children: [
        { name: '나의 근무현황', path: '/sys01/2/1' },
        { name: '나의 부재관리', path: '/sys01/2/2' },
        { name: '부대 근무 현황', path: '/sys01/2/3' },
        { name: '부대 근무 통계', path: '/sys01/2/4' },
        { name: '부대 부재 현황', path: '/sys01/2/5' },
        { name: '월말결산 현황', path: '/sys01/2/6' },
        { name: '자료 출력', path: '/sys01/2/7' },
      ],
    },
    {
      name: '부대관리',
      path: '/sys01/3',
      children: [
        { name: '부대인원 조회', path: '/sys01/3/1' },
        { name: '최대인정시간', path: '/sys01/3/2' },
        { name: '근무시간 관리', path: '/sys01/3/3' },
        { name: '공휴일 관리', path: '/sys01/3/4' },
        { name: '결재선 관리', path: '/sys01/3/5' },
      ],
    },
    {
      name: '당직업무',
      path: '/sys01/4',
      children: [
        { name: '초과근무자 관리', path: '/sys01/4/1' },
        { name: '당직개소 관리', path: '/sys01/4/2' },
        { name: '당직개소 변경', path: '/sys01/4/3' },
        { name: '개인별 당직개소 승인', path: '/sys01/4/4' },
        { name: '개인별 부서 이동 승인', path: '/sys01/4/5' },
      ],
    },
    {
      name: '개인설정',
      path: '/sys01/5',
      children: [
        { name: '개인설정 정보', path: '/sys01/5/1' },
        { name: '개인별 당직개소 설정', path: '/sys01/5/2' },
        { name: '개인별 부서 설정', path: '/sys01/5/3' },
      ],
    },
    {
      name: '게시판',
      path: '/sys01/6',
      children: [
        { name: '공지사항', path: '/sys01/6/1' },
        { name: '질의응답', path: '/sys01/6/2' },
      ],
    },
    {
      name: '관리자',
      path: '/sys01/7',
      children: [
        { name: '권한관리', path: '/sys01/7/1' },
      ],
    },
  ],
  sys02: [
    {
      name: '설문관리',
      path: '/sys02/1',
      children: [
        { name: '게시판', path: '/sys02/1/1' },
        { name: '나의 설문관리', path: '/sys02/1/2' },
        { name: '설문참여', path: '/sys02/1/3' },
        { name: '지난 설문보기', path: '/sys02/1/4' },
        { name: '체계관리', path: '/sys02/1/5' },
      ],
    },
    {
      name: '시스템',
      path: '/sys02/2',
      children: [
        { name: '공통코드관리', path: '/sys02/2/1' },
        { name: '권한관리', path: '/sys02/2/2' },
      ],
    },
  ],
  sys03: [
    {
      name: '메인화면',
      path: '/sys03/1',
      children: [
        { name: '메인화면', path: '/sys03/1/1' },
      ],
    },
    {
      name: '기준정보관리',
      path: '/sys03/2',
      children: [
        { name: '시스템관리', path: '/sys03/2/1' },
        { name: '평가조직 관리', path: '/sys03/2/2' },
        { name: '업무실적(개인)', path: '/sys03/2/3' },
        { name: '과제관리', path: '/sys03/2/4' },
      ],
    },
    {
      name: '연간과제관리',
      path: '/sys03/3',
      children: [
        { name: '추진진도율', path: '/sys03/3/1' },
        { name: '과제등록', path: '/sys03/3/2' },
        { name: '업무실적 입력', path: '/sys03/3/3' },
        { name: '과제실적 승인', path: '/sys03/3/4' },
        { name: '과제실적 평가', path: '/sys03/3/5' },
        { name: '업무실적(개인) 평가', path: '/sys03/3/6' },
      ],
    },
    {
      name: '평가결과',
      path: '/sys03/4',
      children: [
        { name: '평가결과', path: '/sys03/4/1' },
        { name: '입력현황', path: '/sys03/4/2' },
      ],
    },
    {
      name: '게시판',
      path: '/sys03/5',
      children: [
        { name: '공지사항', path: '/sys03/5/1' },
        { name: '질의응답', path: '/sys03/5/2' },
        { name: '자료실', path: '/sys03/5/3' },
      ],
    },
    {
      name: '과제검색',
      path: '/sys03/6',
      children: [
        { name: '과제검색', path: '/sys03/6/1' },
      ],
    },
  ],
  sys04: [
    {
      name: '인증서발급신청',
      path: '/sys04/1',
      children: [
        { name: '게시판', path: '/sys04/1/1' },
        { name: '인증서 신청', path: '/sys04/1/2' },
        { name: '인증서 승인/관리', path: '/sys04/1/3' },
        { name: '인증서 등록대장', path: '/sys04/1/4' },
      ],
    },
    {
      name: '시스템',
      path: '/sys04/2',
      children: [
        { name: '공통코드관리', path: '/sys04/2/1' },
        { name: '사용자별권한등록', path: '/sys04/2/2' },
      ],
    },
  ],
  sys05: [
    {
      name: '해군규정',
      path: '/sys05/1',
      children: [
        { name: '현행규정', path: '/sys05/1/1' },
      ],
    },
    {
      name: '예규',
      path: '/sys05/2',
      children: [
        { name: '해군본부', path: '/sys05/2/1' },
        { name: '예하부대', path: '/sys05/2/2' },
      ],
    },
    {
      name: '지시',
      path: '/sys05/3',
      children: [
        { name: '지시문서', path: '/sys05/3/1' },
      ],
    },
  ],
  sys06: [
    {
      name: '해병대규정',
      path: '/sys06/1',
      children: [
        { name: '현행규정', path: '/sys06/1/1' },
      ],
    },
    {
      name: '예규',
      path: '/sys06/2',
      children: [
        { name: '해병대사령부', path: '/sys06/2/1' },
        { name: '예하부대', path: '/sys06/2/2' },
      ],
    },
    {
      name: '지시',
      path: '/sys06/3',
      children: [
        { name: '지시문서', path: '/sys06/3/1' },
      ],
    },
    {
      name: '게시판',
      path: '/sys06/4',
      children: [
        { name: '공지사항', path: '/sys06/4/1' },
        { name: '규정예고', path: '/sys06/4/2' },
        { name: '자료실', path: '/sys06/4/3' },
      ],
    },
    {
      name: '관리자',
      path: '/sys06/5',
      children: [
        { name: '권한관리', path: '/sys06/5/1' },
      ],
    },
  ],
  sys07: [
    {
      name: '군사자료 관리',
      path: '/sys07/1',
      children: [
        { name: '군사자료 관리', path: '/sys07/1/1' },
        { name: '군사자료 활용', path: '/sys07/1/2' },
        { name: '통계자료', path: '/sys07/1/3' },
      ],
    },
    {
      name: '해기단자료',
      path: '/sys07/2',
      children: [
        { name: '해기단자료', path: '/sys07/2/1' },
      ],
    },
    {
      name: '관리자',
      path: '/sys07/3',
      children: [
        { name: '코드관리', path: '/sys07/3/1' },
        { name: '권한관리', path: '/sys07/3/2' },
      ],
    },
  ],
  sys08: [
    {
      name: '게시판',
      path: '/sys08/1',
      children: [
        { name: '게시판', path: '/sys08/1/1' },
      ],
    },
    {
      name: '권한신청',
      path: '/sys08/2',
      children: [
        { name: '권한신청', path: '/sys08/2/1' },
        { name: '권한관리', path: '/sys08/2/2' },
        { name: '권한조회', path: '/sys08/2/3' },
      ],
    },
    {
      name: '주요활동',
      path: '/sys08/3',
      children: [
        { name: '주요활동 관리', path: '/sys08/3/1' },
        { name: '주요활동 결재', path: '/sys08/3/2' },
      ],
    },
    {
      name: '주요직위자',
      path: '/sys08/4',
      children: [
        { name: '주요직위자 관리', path: '/sys08/4/1' },
      ],
    },
    {
      name: '제원/계승부대',
      path: '/sys08/5',
      children: [
        { name: '제원/계승부대 관리', path: '/sys08/5/1' },
      ],
    },
    {
      name: '부대기/부대마크',
      path: '/sys08/6',
      children: [
        { name: '부대기/부대마크 관리', path: '/sys08/6/1' },
      ],
    },
    {
      name: '통계 및 출력',
      path: '/sys08/7',
      children: [
        { name: '입력 통계', path: '/sys08/7/1' },
      ],
    },
    {
      name: '부대기록부',
      path: '/sys08/8',
      children: [
        { name: '부대기록부', path: '/sys08/8/1' },
      ],
    },
  ],
  sys09: [
    {
      name: '게시판',
      path: '/sys09/1',
      children: [
        { name: '게시판', path: '/sys09/1/1' },
      ],
    },
    {
      name: '자료입력',
      path: '/sys09/2',
      children: [
        { name: '사망자 관리', path: '/sys09/2/1' },
        { name: '상이자 관리', path: '/sys09/2/2' },
        { name: '전공사상심사 관리', path: '/sys09/2/3' },
      ],
    },
    {
      name: '통계 및 자료 출력',
      path: '/sys09/3',
      children: [
        { name: '국가유공자 요건 해당사실 확인서(사망자)', path: '/sys09/3/1' },
        { name: '국가유공자 요건 해당사실 확인서(상이자)', path: '/sys09/3/2' },
        { name: '전공사상심사결과', path: '/sys09/3/3' },
        { name: '순직/사망확인서', path: '/sys09/3/4' },
        { name: '사망자 현황 보고서', path: '/sys09/3/5' },
        { name: '상이자 현황 보고서', path: '/sys09/3/6' },
        { name: '신분별 사망자 현황', path: '/sys09/3/7' },
        { name: '월별 사망자 현황', path: '/sys09/3/8' },
        { name: '연도별 사망자 현황', path: '/sys09/3/9' },
        { name: '부대별 사망자 현황', path: '/sys09/3/10' },
        { name: '부대별 사망자 명부', path: '/sys09/3/11' },
        { name: '전사망자 명부', path: '/sys09/3/12' },
        { name: '전사망자 확인증 발급대장', path: '/sys09/3/13' },
      ],
    },
  ],
  sys10: [
    {
      name: '주말버스',
      path: '/sys10/1',
      children: [
        { name: '게시판', path: '/sys10/1/1' },
        { name: '주말버스 예약', path: '/sys10/1/2' },
        { name: '주말버스 대기자관리', path: '/sys10/1/3' },
        { name: '주말버스 예약현황', path: '/sys10/1/4' },
        { name: '주말버스 배차관리', path: '/sys10/1/5' },
        { name: '예약시간관리', path: '/sys10/1/6' },
        { name: '주말버스 사용현황', path: '/sys10/1/7' },
        { name: '주말버스 위규자관리', path: '/sys10/1/8' },
        { name: '타군 사용자 관리', path: '/sys10/1/9' },
      ],
    },
    {
      name: '관리자',
      path: '/sys10/2',
      children: [
        { name: '코드관리', path: '/sys10/2/1' },
        { name: '권한관리', path: '/sys10/2/2' },
      ],
    },
  ],
  sys11: [
    {
      name: '연구자료종합관리',
      path: '/sys11/1',
      children: [
        { name: '메인화면', path: '/sys11/1/1' },
        { name: '연구자료', path: '/sys11/1/2' },
        { name: '자료실', path: '/sys11/1/3' },
        { name: '공지사항', path: '/sys11/1/4' },
        { name: '관리자', path: '/sys11/1/5' },
      ],
    },
    {
      name: '시스템',
      path: '/sys11/2',
      children: [
        { name: '사용자별권한등록', path: '/sys11/2/1' },
      ],
    },
  ],
  sys12: [
    {
      name: '게시판',
      path: '/sys12/1',
      children: [
        { name: '공지사항', path: '/sys12/1/1' },
        { name: '질의응답', path: '/sys12/1/2' },
      ],
    },
    {
      name: '지시사항',
      path: '/sys12/2',
      children: [
        { name: '대통령', path: '/sys12/2/1' },
        { name: '국방부장관', path: '/sys12/2/2' },
        { name: '지휘관 지시사항', path: '/sys12/2/3' },
      ],
    },
    {
      name: '건의사항',
      path: '/sys12/3',
      children: [
        { name: '지휘관 건의사항', path: '/sys12/3/1' },
      ],
    },
    {
      name: '관리자',
      path: '/sys12/4',
      children: [
        { name: '관리자', path: '/sys12/4/1' },
      ],
    },
  ],
  sys13: [
    {
      name: '게시판',
      path: '/sys13/1',
      children: [
        { name: '게시판', path: '/sys13/1/1' },
      ],
    },
    {
      name: '지식관리',
      path: '/sys13/2',
      children: [
        { name: '나의 지식 관리', path: '/sys13/2/1' },
        { name: '지식 관리', path: '/sys13/2/2' },
      ],
    },
    {
      name: '지식열람',
      path: '/sys13/3',
      children: [
        { name: '지식열람', path: '/sys13/3/1' },
      ],
    },
    {
      name: '지식통계',
      path: '/sys13/4',
      children: [
        { name: '지식통계', path: '/sys13/4/1' },
      ],
    },
    {
      name: '관리자',
      path: '/sys13/5',
      children: [
        { name: '코드관리', path: '/sys13/5/1' },
        { name: '메뉴관리', path: '/sys13/5/2' },
        { name: '권한관리', path: '/sys13/5/3' },
      ],
    },
  ],
  sys14: [
    {
      name: '나의제언',
      path: '/sys14/1',
      children: [
        { name: '메인화면', path: '/sys14/1/1' },
        { name: '공지사항', path: '/sys14/1/2' },
        { name: '제언확인', path: '/sys14/1/3' },
        { name: '관리자', path: '/sys14/1/4' },
      ],
    },
    {
      name: '시스템',
      path: '/sys14/2',
      children: [
        { name: '사용자별권한등록', path: '/sys14/2/1' },
      ],
    },
  ],
  sys15: [
    {
      name: '메인화면',
      path: '/sys15/1',
      children: [
        { name: '메인화면', path: '/sys15/1/1' },
      ],
    },
    {
      name: '비밀/매체관리',
      path: '/sys15/2',
      children: [
        { name: '저장매체 관리', path: '/sys15/2/1' },
        { name: '비밀 관리', path: '/sys15/2/2' },
        { name: '비밀 예고문 관리', path: '/sys15/2/3' },
        { name: '보안자재/암호장비 관리', path: '/sys15/2/4' },
        { name: '비밀/매체 인계/인수', path: '/sys15/2/5' },
      ],
    },
    {
      name: '보안일일결산',
      path: '/sys15/3',
      children: [
        { name: '개인보안일일결산', path: '/sys15/3/1' },
        { name: '사무실보안일일결산', path: '/sys15/3/2' },
        { name: '일일보안점검관', path: '/sys15/3/3' },
        { name: '개인보안수준평가', path: '/sys15/3/4' },
        { name: '부재처리', path: '/sys15/3/5' },
        { name: '보안교육', path: '/sys15/3/6' },
      ],
    },
    {
      name: '결재',
      path: '/sys15/4',
      children: [
        { name: '결재대기', path: '/sys15/4/1' },
        { name: '결재완료', path: '/sys15/4/2' },
      ],
    },
    {
      name: '결산종합현황',
      path: '/sys15/5',
      children: [
        { name: '비밀/매체관리', path: '/sys15/5/1' },
        { name: '개인보안일일결산', path: '/sys15/5/2' },
        { name: '사무실보안일일결산', path: '/sys15/5/3' },
        { name: '부재처리', path: '/sys15/5/4' },
      ],
    },
    {
      name: '개인설정 관리',
      path: '/sys15/6',
      children: [
        { name: '개인설정 관리', path: '/sys15/6/1' },
      ],
    },
    {
      name: '게시판',
      path: '/sys15/7',
      children: [
        { name: '공지사항', path: '/sys15/7/1' },
        { name: '질의응답', path: '/sys15/7/2' },
      ],
    },
    {
      name: '관리자',
      path: '/sys15/8',
      children: [
        { name: '점검항목관리', path: '/sys15/8/1' },
        { name: '휴무일 관리', path: '/sys15/8/2' },
        { name: '알림시간 관리', path: '/sys15/8/3' },
        { name: '로그이력 관리', path: '/sys15/8/4' },
        { name: '예외처리 관리', path: '/sys15/8/5' },
      ],
    },
    {
      name: '시스템',
      path: '/sys15/9',
      children: [
        { name: '공통코드관리', path: '/sys15/9/1' },
        { name: '권한관리', path: '/sys15/9/2' },
      ],
    },
  ],
  sys16: [
    {
      name: '회의실 예약관리',
      path: '/sys16/1',
      children: [
        { name: '공지사항', path: '/sys16/1/1' },
        { name: '회의예약신청', path: '/sys16/1/2' },
        { name: '내예약확인', path: '/sys16/1/3' },
        { name: '회의현황', path: '/sys16/1/4' },
        { name: '회의예약관리', path: '/sys16/1/5' },
        { name: '회의실 관리', path: '/sys16/1/6' },
      ],
    },
    {
      name: '시스템',
      path: '/sys16/2',
      children: [
        { name: '공통코드관리', path: '/sys16/2/1' },
      ],
    },
  ],
  sys17: [
    {
      name: '검열결과 관리',
      path: '/sys17/1',
      children: [
        { name: '공지사항', path: '/sys17/1/1' },
        { name: '검열부대 지정', path: '/sys17/1/2' },
        { name: '검열계획', path: '/sys17/1/3' },
        { name: '검열결과', path: '/sys17/1/4' },
        { name: '결재', path: '/sys17/1/5' },
        { name: '추진현황', path: '/sys17/1/6' },
      ],
    },
    {
      name: '시스템',
      path: '/sys17/2',
      children: [
        { name: '공통코드관리', path: '/sys17/2/1' },
        { name: '부대관리', path: '/sys17/2/2' },
        { name: '사용자별권한등록', path: '/sys17/2/3' },
        { name: '접속로그', path: '/sys17/2/4' },
      ],
    },
    {
      name: '데이터',
      path: '/sys17/3',
      children: [
        { name: '검열계획 정보', path: '/sys17/3/1' },
      ],
    },
  ],
  sys18: [
    {
      name: '직무기술서 관리',
      path: '/sys18/1',
      children: [
        { name: '게시판', path: '/sys18/1/1' },
        { name: '조직진단 대상 관리', path: '/sys18/1/2' },
        { name: '직무기술서 작성', path: '/sys18/1/3' },
        { name: '결재', path: '/sys18/1/4' },
        { name: '직무기술서 조회(관리자)', path: '/sys18/1/5' },
      ],
    },
    {
      name: '관리자',
      path: '/sys18/2',
      children: [
        { name: '공통코드관리', path: '/sys18/2/1' },
        { name: '표준업무시간관리', path: '/sys18/2/2' },
        { name: '사용자권한관리', path: '/sys18/2/3' },
      ],
    },
  ],
  common: [
    {
      name: '시스템관리',
      path: '/common/1',
      children: [
        { name: '체계담당자', path: '/common/1/1' },
        { name: '메뉴관리', path: '/common/1/2' },
        { name: '메시지 관리', path: '/common/1/3' },
        { name: '장애로그 조회', path: '/common/1/4' },
        { name: '접속로그 조회', path: '/common/1/5' },
      ],
    },
    {
      name: '결재관리',
      path: '/common/2',
      children: [
        { name: '결재선 관리', path: '/common/2/1' },
      ],
    },
    {
      name: '코드관리',
      path: '/common/3',
      children: [
        { name: '코드그룹 관리', path: '/common/3/1' },
        { name: '코드 관리', path: '/common/3/2' },
      ],
    },
    {
      name: '공통게시판',
      path: '/common/4',
      children: [
        { name: '게시판 설정', path: '/common/4/1' },
      ],
    },
    {
      name: '권한관리',
      path: '/common/5',
      children: [
        { name: '권한그룹 등록', path: '/common/5/1' },
        { name: '권한그룹별 메뉴 등록', path: '/common/5/2' },
        { name: '메뉴별 권한그룹 등록', path: '/common/5/3' },
        { name: '권한그룹별 사용자 등록', path: '/common/5/4' },
        { name: '권한그룹별 사용부대 등록', path: '/common/5/5' },
      ],
    },
  ],
}
