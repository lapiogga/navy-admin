import type { SubsystemMeta } from './types'

export const SUBSYSTEM_META: Record<string, SubsystemMeta> = {
  sys01: { code: 'SYS01', name: '초과근무관리체계', path: '/sys01', componentPrefix: 'Overtime', processCount: 99 },
  sys02: { code: 'SYS02', name: '설문종합관리체계', path: '/sys02', componentPrefix: 'Survey', processCount: 31 },
  sys03: { code: 'SYS03', name: '성과관리체계', path: '/sys03', componentPrefix: 'Performance', processCount: 76 },
  sys04: { code: 'SYS04', name: '인증서발급신청체계', path: '/sys04', componentPrefix: 'Certificate', processCount: 14 },
  sys05: { code: 'SYS05', name: '행정규칙포탈체계', path: '/sys05', componentPrefix: 'AdminRules', processCount: 15 },
  sys06: { code: 'SYS06', name: '해병대규정관리체계', path: '/sys06', componentPrefix: 'Regulations', processCount: 30 },
  sys07: { code: 'SYS07', name: '군사자료관리체계', path: '/sys07', componentPrefix: 'MilData', processCount: 40 },
  sys08: { code: 'SYS08', name: '부대계보관리체계', path: '/sys08', componentPrefix: 'UnitLineage', processCount: 59 },
  sys09: { code: 'SYS09', name: '영현보훈체계', path: '/sys09', componentPrefix: 'Memorial', processCount: 35 },
  sys10: { code: 'SYS10', name: '주말버스예약관리체계', path: '/sys10', componentPrefix: 'WeekendBus', processCount: 44 },
  sys11: { code: 'SYS11', name: '연구자료종합관리체계', path: '/sys11', componentPrefix: 'Research', processCount: 19 },
  sys12: { code: 'SYS12', name: '지시건의사항관리체계', path: '/sys12', componentPrefix: 'Directives', processCount: 32 },
  sys13: { code: 'SYS13', name: '지식관리체계', path: '/sys13', componentPrefix: 'Knowledge', processCount: 23 },
  sys14: { code: 'SYS14', name: '나의 제언', path: '/sys14', componentPrefix: 'Suggestion', processCount: 16 },
  sys15: { code: 'SYS15', name: '보안일일결산체계', path: '/sys15', componentPrefix: 'Security', processCount: 138 },
  sys16: { code: 'SYS16', name: '회의실예약관리체계', path: '/sys16', componentPrefix: 'MeetingRoom', processCount: 21 },
  sys17: { code: 'SYS17', name: '검열결과관리체계', path: '/sys17', componentPrefix: 'Inspection', processCount: 25 },
  sys18: { code: 'SYS18', name: '직무기술서관리체계', path: '/sys18', componentPrefix: 'JobDesc', processCount: 47 },
} as const
