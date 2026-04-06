import { http, HttpResponse } from 'msw'

// 노선 Mock 데이터
const routes = [
  {
    id: 'r1',
    name: '서울→포항',
    departure: '서울',
    destination: '포항',
    stopover: '청주, 대구',
    timetable: ['08:00', '10:00', '14:00'],
  },
  {
    id: 'r2',
    name: '서울→청주',
    departure: '서울',
    destination: '청주',
    stopover: '수원',
    timetable: ['08:00', '10:00', '14:00'],
  },
  {
    id: 'r3',
    name: '서울→대전',
    departure: '서울',
    destination: '대전',
    stopover: '천안',
    timetable: ['08:00', '10:00', '14:00'],
  },
  {
    id: 'r4',
    name: '서울→광주',
    departure: '서울',
    destination: '광주',
    stopover: '대전, 전주',
    timetable: ['08:00', '10:00', '14:00'],
  },
  {
    id: 'r5',
    name: '서울→부산',
    departure: '서울',
    destination: '부산',
    stopover: '대구, 경주',
    timetable: ['08:00', '10:00', '14:00'],
  },
]

// 배차 Mock 데이터 10건
const dispatches = Array.from({ length: 10 }, (_, i) => ({
  id: `d${i + 1}`,
  routeId: routes[i % 5].id,
  direction: i % 2 === 0 ? '상행' : '하행',
  operationDate: `2026-04-${String(5 + i).padStart(2, '0')}`,
  departureTime: ['08:00', '10:00', '14:00'][i % 3],
  departure: i % 2 === 0 ? routes[i % 5].departure : routes[i % 5].destination,
  destination: i % 2 === 0 ? routes[i % 5].destination : routes[i % 5].departure,
  stopover: routes[i % 5].stopover,
  totalSeats: 40,
  vehicleNo: `해병-${1000 + i}`,
  assignStatus: i % 3 === 0 ? 'unassigned' : 'assigned',
  reservedCount: Math.floor(Math.random() * 30),
}))

// 좌석 생성 함수 (배차당 40석)
function generateSeats(dispatchId: string) {
  const statuses = ['available', 'reserved', 'unavailable'] as const
  return Array.from({ length: 40 }, (_, i) => {
    const row = Math.floor(i / 4) + 1
    const col = ['A', 'B', 'C', 'D'][i % 4]
    const rand = Math.random()
    const status = rand < 0.7 ? 'available' : rand < 0.9 ? 'reserved' : 'unavailable'
    return {
      id: `${dispatchId}-${row}${col}`,
      seatNo: `${row}${col}`,
      status: statuses.includes(status as typeof statuses[number]) ? status : 'available',
    }
  })
}

// 예약 Mock 데이터 15건
const reservations = Array.from({ length: 15 }, (_, i) => ({
  id: `res${i + 1}`,
  routeId: routes[i % 5].id,
  routeName: routes[i % 5].name,
  operationDate: `2026-04-${String(5 + (i % 10)).padStart(2, '0')}`,
  departureTime: ['08:00', '10:00', '14:00'][i % 3],
  seatNo: `${Math.floor(i / 4) + 1}${'ABCD'[i % 4]}`,
  unit: ['1사단', '2사단', '포병여단', '본부대', '지원대'][i % 5],
  userName: ['김해병', '이병장', '박상병', '최일병', '정해병'][i % 5],
  rank: ['대령', '중령', '소령', '대위', '중위', '소위', '준위', '원사', '상사', '중사'][i % 10],
  militaryId: `2026-${String(1000 + i).padStart(6, '0')}`,
  status: ['reserved', 'cancelled', 'waiting'][i % 3] as 'reserved' | 'cancelled' | 'waiting',
}))

// 예약시간 Mock 데이터
const schedules = Array.from({ length: 12 }, (_, i) => ({
  id: `sch${i + 1}`,
  routeId: routes[i % 5].id,
  rank: ['대령', '중령', '소령', '대위'][Math.floor(i / 3) % 4],
  operationDate: `2026-04-${String(5 + (i % 7)).padStart(2, '0')}`,
  reservationRank: (i % 5) + 1,
  openTime: `${8 + (i % 4)}:00`,
  closeTime: `${16 + (i % 4)}:00`,
}))

// 사용현황 Mock 데이터
const usageStats = Array.from({ length: 10 }, (_, i) => ({
  id: `us${i + 1}`,
  operationDate: `2026-04-${String(5 + i).padStart(2, '0')}`,
  routeId: routes[i % 5].id,
  routeName: routes[i % 5].name,
  unit: ['1사단', '2사단', '포병여단', '본부대', '지원대'][i % 5],
  totalSeats: 40,
  usedSeats: 10 + (i % 25),
  get usageRate() {
    return `${Math.round((this.usedSeats / this.totalSeats) * 100)}%`
  },
}))

// 대기자 Mock 데이터 10건
const waitlist = Array.from({ length: 10 }, (_, i) => ({
  id: `w${i + 1}`,
  waitingNo: i + 1,
  operationDate: `2026-04-${String(5 + (i % 7)).padStart(2, '0')}`,
  route: routes[i % 5].name,
  userName: ['김해병', '이병장', '박상병', '최일병', '정해병', '홍길동', '장수민', '이준혁', '강다원', '윤세아'][i],
  rank: ['상병', '일병', '병장', '이병', '하사', '상병', '일병', '중사', '대위', '소위'][i],
  unit: ['1사단', '2사단', '포병여단', '본부대', '지원대'][i % 5],
  waitingDate: `2026-04-${String(1 + i).padStart(2, '0')}`,
  assignedSeat: i < 3 ? `${i + 1}A` : null,
  status: (i < 3 ? 'assigned' : i < 8 ? 'waiting' : 'cancelled') as 'assigned' | 'waiting' | 'cancelled',
}))

// 위규자 Mock 데이터 5건
const violators = Array.from({ length: 5 }, (_, i) => ({
  id: `vio${i + 1}`,
  userName: ['김철수', '이영희', '박민준', '최수연', '정도현'][i],
  militaryId: `2024-${String(100 + i).padStart(6, '0')}`,
  rank: ['병장', '상병', '일병', '하사', '중사'][i],
  unit: ['1사단', '2사단', '포병여단', '본부대', '지원대'][i],
  violationType: (['cancel_no_show', 'refuse_board', 'other', 'cancel_no_show', 'refuse_board'] as const)[i],
  violationReason: '규정 위반 사유',
  sanctionStart: i < 3 ? '2026-03-01' : '2026-01-01',
  sanctionEnd: i < 3 ? '2026-06-30' : '2026-03-31',
  registeredAt: '2026-03-01',
}))

export const sys10Handlers = [
  // 노선 목록
  http.get('/api/sys10/routes', () => {
    return HttpResponse.json({ content: routes, totalElements: routes.length })
  }),

  // 좌석 현황
  http.get('/api/sys10/routes/:id/seats', ({ params }) => {
    const seats = generateSeats(String(params.id))
    return HttpResponse.json({ content: seats, totalElements: seats.length })
  }),

  // 예약 신청
  http.post('/api/sys10/reservations', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newReservation = {
      id: `res${Date.now()}`,
      ...body,
      status: 'reserved',
    }
    return HttpResponse.json(newReservation, { status: 201 })
  }),

  // 예약 취소
  http.put('/api/sys10/reservations/:id/cancel', ({ params }) => {
    return HttpResponse.json({ id: params.id, status: 'cancelled' })
  }),

  // 예약현황 목록
  http.get('/api/sys10/reservations', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = reservations.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: reservations.length })
  }),

  // 배차 목록
  http.get('/api/sys10/dispatches', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = dispatches.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: dispatches.length })
  }),

  // 배차 등록
  http.post('/api/sys10/dispatches', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newDispatch = { id: `d${Date.now()}`, ...body }
    return HttpResponse.json(newDispatch, { status: 201 })
  }),

  // 배차 수정
  http.put('/api/sys10/dispatches/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const updated = { id: params.id, ...body }
    return HttpResponse.json(updated)
  }),

  // 배차 삭제
  http.delete('/api/sys10/dispatches/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, deleted: true })
  }),

  // 배차별 좌석 현황 (SeatGrid readOnly용)
  http.get('/api/sys10/dispatches/:id/seats', ({ params }) => {
    const seats = generateSeats(String(params.id))
    return HttpResponse.json({ content: seats, totalElements: seats.length })
  }),

  // 예약시간 목록
  http.get('/api/sys10/schedule', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = schedules.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: schedules.length })
  }),

  // 예약시간 등록
  http.post('/api/sys10/schedule', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newSchedule = { id: `sch${Date.now()}`, ...body }
    return HttpResponse.json(newSchedule, { status: 201 })
  }),

  // 예약시간 수정
  http.put('/api/sys10/schedule/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const updated = { id: params.id, ...body }
    return HttpResponse.json(updated)
  }),

  // 예약시간 삭제
  http.delete('/api/sys10/schedule/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, deleted: true })
  }),

  // 사용현황
  http.get('/api/sys10/usage', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = usageStats.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: usageStats.length })
  }),

  // 대기자 목록
  http.get('/api/sys10/waitlist', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = waitlist.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: waitlist.length })
  }),

  // 자동 배정
  http.post('/api/sys10/waitlist/auto-assign', () => {
    const waitingItems = waitlist.filter((w) => w.status === 'waiting')
    const assignCount = Math.min(waitingItems.length, 5)
    waitingItems.slice(0, assignCount).forEach((w) => {
      w.status = 'assigned'
    })
    return HttpResponse.json({ assignedCount: assignCount })
  }),

  // 수동 배정 가능 좌석 목록
  http.get('/api/sys10/waitlist/:id/available-seats', ({ params }) => {
    const seats = Array.from({ length: 5 }, (_, i) => ({
      id: `seat-${params.id}-${i + 1}`,
      seatNo: `${i + 1}A`,
    }))
    return HttpResponse.json(seats)
  }),

  // 수동 배정
  http.post('/api/sys10/waitlist/:id/manual-assign', ({ params }) => {
    const item = waitlist.find((w) => w.id === params.id)
    if (item) item.status = 'assigned'
    return HttpResponse.json({ id: params.id, status: 'assigned' })
  }),

  // 위규자 목록
  http.get('/api/sys10/violators', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const start = page * size
    const items = violators.slice(start, start + size)
    return HttpResponse.json({ content: items, totalElements: violators.length })
  }),

  // 위규자 등록
  http.post('/api/sys10/violators', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newViolator = { id: `vio${Date.now()}`, registeredAt: new Date().toISOString().slice(0, 10), ...body }
    violators.push(newViolator as typeof violators[0])
    return HttpResponse.json(newViolator, { status: 201 })
  }),

  // 위규자 수정
  http.put('/api/sys10/violators/:id', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const idx = violators.findIndex((v) => v.id === params.id)
    if (idx !== -1) Object.assign(violators[idx], body)
    return HttpResponse.json({ id: params.id, ...body })
  }),

  // 위규자 삭제
  http.delete('/api/sys10/violators/:id', ({ params }) => {
    const idx = violators.findIndex((v) => v.id === params.id)
    if (idx !== -1) violators.splice(idx, 1)
    return HttpResponse.json({ id: params.id, deleted: true })
  }),
]
