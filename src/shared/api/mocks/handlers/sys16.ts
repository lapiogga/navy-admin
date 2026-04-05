import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

// 타입 정의
type ReservationStatus = 'pending' | 'approved' | 'rejected'

interface MeetingRoom {
  id: string
  name: string
  location: string
  capacity: number
  description: string
  photos: { id: string; url: string }[]
  equipment: { id: string; name: string; quantity: number }[]
  schedule: { day: string; enabled: boolean; startTime: string; endTime: string }[]
}

interface Reservation {
  id: string
  roomId: string
  roomName: string
  applicant: string
  unit: string
  purpose: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  createdAt: string
  processedAt?: string
}

// Mock 데이터 생성
const DAYS = ['월', '화', '수', '목', '금', '토', '일']
const EQUIPMENT_NAMES = ['빔프로젝터', '화이트보드', '마이크', '스크린', 'TV']

const createSchedule = () =>
  DAYS.map((day, index) => ({
    day,
    enabled: index < 5,
    startTime: '09:00',
    endTime: '18:00',
  }))

const meetingRooms: MeetingRoom[] = Array.from({ length: 5 }, (_, i) => ({
  id: `room-${i + 1}`,
  name: `제${i + 1}회의실`,
  location: `${faker.number.int({ min: 1, max: 5 })}층 ${faker.number.int({ min: 100, max: 500 })}호`,
  capacity: faker.number.int({ min: 5, max: 30 }),
  description: `${i + 1}번 회의실입니다.`,
  photos: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, j) => ({
    id: `photo-${i + 1}-${j + 1}`,
    url: `https://picsum.photos/seed/${i * 10 + j}/400/300`,
  })),
  equipment: EQUIPMENT_NAMES.slice(0, faker.number.int({ min: 2, max: 4 })).map((name, j) => ({
    id: `eq-${i + 1}-${j + 1}`,
    name,
    quantity: faker.number.int({ min: 1, max: 3 }),
  })),
  schedule: createSchedule(),
}))

const STATUSES: ReservationStatus[] = ['pending', 'approved', 'rejected']
const reservations: Reservation[] = Array.from({ length: 25 }, (_, i) => {
  const room = meetingRooms[i % meetingRooms.length]
  const status = STATUSES[i % 3]
  return {
    id: `res-${i + 1}`,
    roomId: room.id,
    roomName: room.name,
    applicant: faker.person.lastName() + faker.person.firstName(),
    unit: `제${faker.number.int({ min: 1, max: 9 })}대대`,
    purpose: faker.lorem.sentence(),
    date: `2026-04-${String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0')}`,
    startTime: '10:00',
    endTime: '12:00',
    status,
    createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    processedAt: status !== 'pending' ? faker.date.recent({ days: 7 }).toISOString().split('T')[0] : undefined,
  }
})

// 페이지네이션 유틸리티
function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
  }
}

export const sys16Handlers = [
  // 예약 신청
  http.post('/api/sys16/reservations', async ({ request }) => {
    const body = await request.json() as Partial<Reservation>
    const room = meetingRooms.find((r) => r.id === body.roomId) || meetingRooms[0]
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      roomId: room.id,
      roomName: room.name,
      applicant: '홍길동',
      unit: '제1대대',
      purpose: body.purpose || '',
      date: body.date || '',
      startTime: body.startTime || '',
      endTime: body.endTime || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }
    reservations.push(newReservation)
    return HttpResponse.json({ success: true, data: newReservation })
  }),

  // 내 예약 목록
  http.get('/api/sys16/reservations/my', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const myReservations = reservations.filter((_, i) => i % 3 === 0)
    return HttpResponse.json({ success: true, data: paginate(myReservations, page, size) })
  }),

  // 전체 예약 목록 (관리자)
  http.get('/api/sys16/reservations/status', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    return HttpResponse.json({ success: true, data: paginate(reservations, page, size) })
  }),

  // 예약 목록 (관리자, status 필터)
  http.get('/api/sys16/reservations', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const status = url.searchParams.get('status')
    const filtered = status ? reservations.filter((r) => r.status === status) : reservations
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 예약 상세
  http.get('/api/sys16/reservations/:id', ({ params }) => {
    const reservation = reservations.find((r) => r.id === params.id)
    if (!reservation) return HttpResponse.json({ success: false, message: '예약을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: reservation })
  }),

  // 예약 수정
  http.put('/api/sys16/reservations/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<Reservation>
    const index = reservations.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '예약을 찾을 수 없습니다' }, { status: 404 })
    reservations[index] = { ...reservations[index], ...body }
    return HttpResponse.json({ success: true, data: reservations[index] })
  }),

  // 예약 삭제
  http.delete('/api/sys16/reservations/:id', ({ params }) => {
    const index = reservations.findIndex((r) => r.id === params.id)
    if (index !== -1) reservations.splice(index, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // 예약 승인
  http.patch('/api/sys16/reservations/:id/approve', ({ params }) => {
    const index = reservations.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '예약을 찾을 수 없습니다' }, { status: 404 })
    reservations[index] = { ...reservations[index], status: 'approved', processedAt: new Date().toISOString().split('T')[0] }
    return HttpResponse.json({ success: true, data: reservations[index] })
  }),

  // 예약 반려
  http.patch('/api/sys16/reservations/:id/reject', ({ params }) => {
    const index = reservations.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '예약을 찾을 수 없습니다' }, { status: 404 })
    reservations[index] = { ...reservations[index], status: 'rejected', processedAt: new Date().toISOString().split('T')[0] }
    return HttpResponse.json({ success: true, data: reservations[index] })
  }),

  // 회의실 목록
  http.get('/api/sys16/meeting-rooms', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    return HttpResponse.json({ success: true, data: paginate(meetingRooms, page, size) })
  }),

  // 회의실 상세
  http.get('/api/sys16/meeting-rooms/:id', ({ params }) => {
    const room = meetingRooms.find((r) => r.id === params.id)
    if (!room) return HttpResponse.json({ success: false, message: '회의실을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: room })
  }),

  // 회의실 등록
  http.post('/api/sys16/meeting-rooms', async ({ request }) => {
    const body = await request.json() as Partial<MeetingRoom>
    const newRoom: MeetingRoom = {
      id: `room-${Date.now()}`,
      name: body.name || '',
      location: body.location || '',
      capacity: body.capacity || 0,
      description: body.description || '',
      photos: [],
      equipment: [],
      schedule: createSchedule(),
    }
    meetingRooms.push(newRoom)
    return HttpResponse.json({ success: true, data: newRoom })
  }),

  // 회의실 수정
  http.put('/api/sys16/meeting-rooms/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<MeetingRoom>
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '회의실을 찾을 수 없습니다' }, { status: 404 })
    meetingRooms[index] = { ...meetingRooms[index], ...body }
    return HttpResponse.json({ success: true, data: meetingRooms[index] })
  }),

  // 회의실 삭제
  http.delete('/api/sys16/meeting-rooms/:id', ({ params }) => {
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index !== -1) meetingRooms.splice(index, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // 시간대 설정
  http.put('/api/sys16/meeting-rooms/:id/schedule', async ({ params, request }) => {
    const body = await request.json() as MeetingRoom['schedule']
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '회의실을 찾을 수 없습니다' }, { status: 404 })
    meetingRooms[index] = { ...meetingRooms[index], schedule: body }
    return HttpResponse.json({ success: true, data: meetingRooms[index] })
  }),

  // 장비 목록
  http.get('/api/sys16/meeting-rooms/:id/equipment', ({ params }) => {
    const room = meetingRooms.find((r) => r.id === params.id)
    if (!room) return HttpResponse.json({ success: false, message: '회의실을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: room.equipment })
  }),

  // 장비 추가
  http.post('/api/sys16/meeting-rooms/:id/equipment', async ({ params, request }) => {
    const body = await request.json() as { name: string; quantity: number }
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '회의실을 찾을 수 없습니다' }, { status: 404 })
    const newEquipment = { id: `eq-${Date.now()}`, name: body.name, quantity: body.quantity }
    meetingRooms[index] = { ...meetingRooms[index], equipment: [...meetingRooms[index].equipment, newEquipment] }
    return HttpResponse.json({ success: true, data: newEquipment })
  }),

  // 장비 삭제
  http.delete('/api/sys16/meeting-rooms/:id/equipment/:eqId', ({ params }) => {
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index !== -1) {
      meetingRooms[index] = {
        ...meetingRooms[index],
        equipment: meetingRooms[index].equipment.filter((e) => e.id !== params.eqId),
      }
    }
    return HttpResponse.json({ success: true, data: null })
  }),

  // 사진 업로드
  http.post('/api/sys16/meeting-rooms/:id/photos', ({ params }) => {
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    const newPhoto = { id: `photo-${Date.now()}`, url: `https://picsum.photos/seed/${Date.now()}/400/300` }
    if (index !== -1) {
      meetingRooms[index] = { ...meetingRooms[index], photos: [...meetingRooms[index].photos, newPhoto] }
    }
    return HttpResponse.json({ success: true, data: newPhoto })
  }),

  // 사진 삭제
  http.delete('/api/sys16/meeting-rooms/:id/photos/:photoId', ({ params }) => {
    const index = meetingRooms.findIndex((r) => r.id === params.id)
    if (index !== -1) {
      meetingRooms[index] = {
        ...meetingRooms[index],
        photos: meetingRooms[index].photos.filter((p) => p.id !== params.photoId),
      }
    }
    return HttpResponse.json({ success: true, data: null })
  }),
]
