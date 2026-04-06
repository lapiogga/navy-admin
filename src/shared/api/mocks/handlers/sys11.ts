import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

// 타입 정의
interface ResearchItem {
  id: string
  title: string
  author: string
  department: string
  category: string
  description: string
  fileUrl: string
  fileName: string
  downloadCount: number
  viewCount: number
  researchYear: number
  budget: number
  progressStatus: string
  createdAt: string
  updatedAt: string
}

interface ResearchCategory {
  id: string
  name: string
  parentId?: string
  sortOrder: number
}

// Mock 카테고리 데이터
const categories: ResearchCategory[] = [
  { id: 'cat-1', name: '전략연구', sortOrder: 1 },
  { id: 'cat-2', name: '작전연구', sortOrder: 2 },
  { id: 'cat-3', name: '교육훈련', sortOrder: 3 },
  { id: 'cat-4', name: '인사관리', sortOrder: 4 },
  { id: 'cat-5', name: '군수지원', sortOrder: 5 },
  { id: 'cat-6', name: '기타', sortOrder: 6 },
]

const CATEGORY_NAMES = ['전략연구', '작전연구', '교육훈련', '인사관리', '군수지원', '기타']

const PROGRESS_STATUSES = ['최초평가', '중간평가', '최종평가']

// Mock 연구자료 데이터 (30건)
const researchItems: ResearchItem[] = Array.from({ length: 30 }, (_, i) => {
  const category = CATEGORY_NAMES[i % CATEGORY_NAMES.length]
  const createdAt = faker.date.recent({ days: 180 }).toISOString().split('T')[0]
  return {
    id: `research-${i + 1}`,
    title: `[${category}] ${faker.lorem.words({ min: 3, max: 6 })} 연구`,
    author: faker.person.lastName() + faker.person.firstName(),
    department: `제${faker.number.int({ min: 1, max: 5 })}대대`,
    category,
    description: faker.lorem.paragraph(),
    fileUrl: `/files/research-${i + 1}.pdf`,
    fileName: `연구자료_${i + 1}.pdf`,
    downloadCount: faker.number.int({ min: 0, max: 200 }),
    viewCount: faker.number.int({ min: 10, max: 500 }),
    researchYear: faker.number.int({ min: 2020, max: 2026 }),
    budget: faker.number.int({ min: 1000000, max: 100000000 }),
    progressStatus: faker.helpers.arrayElement(PROGRESS_STATUSES),
    createdAt,
    updatedAt: createdAt,
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

export const sys11Handlers = [
  // 연구자료 목록 (keyword/category 필터 + 페이지네이션)
  http.get('/api/sys11/research', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''
    const category = url.searchParams.get('category') || ''
    const progressStatus = url.searchParams.get('progressStatus') || ''

    let filtered = [...researchItems]
    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.title.includes(keyword) ||
          item.author.includes(keyword) ||
          item.department.includes(keyword),
      )
    }
    if (category) {
      filtered = filtered.filter((item) => item.category === category)
    }
    if (progressStatus) {
      filtered = filtered.filter((item) => item.progressStatus === progressStatus)
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 연구자료 통계
  http.get('/api/sys11/research/stats', () => {
    const thisMonthItems = researchItems.filter((item) => {
      const created = new Date(item.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    })

    const categoryCount: Record<string, number> = {}
    researchItems.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    })
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
    const totalDownloads = researchItems.reduce((sum, item) => sum + item.downloadCount, 0)

    return HttpResponse.json({
      success: true,
      data: {
        total: researchItems.length,
        thisMonth: thisMonthItems.length,
        topCategory,
        totalDownloads,
      },
    })
  }),

  // 최신 5건
  http.get('/api/sys11/research/recent', () => {
    const sorted = [...researchItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json({ success: true, data: paginate(sorted.slice(0, 5), 0, 5) })
  }),

  // 인기 5건 (downloadCount 내림차순)
  http.get('/api/sys11/research/popular', () => {
    const sorted = [...researchItems].sort((a, b) => b.downloadCount - a.downloadCount)
    return HttpResponse.json({ success: true, data: paginate(sorted.slice(0, 5), 0, 5) })
  }),

  // 연구자료 상세
  http.get('/api/sys11/research/:id', ({ params }) => {
    const item = researchItems.find((r) => r.id === params.id)
    if (!item) return HttpResponse.json({ success: false, message: '자료를 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ success: true, data: item })
  }),

  // 연구자료 등록
  http.post('/api/sys11/research', async ({ request }) => {
    const body = await request.json() as Partial<ResearchItem>
    const newItem: ResearchItem = {
      id: `research-${Date.now()}`,
      title: body.title || '',
      author: body.author || '홍길동',
      department: body.department || '제1대대',
      category: body.category || '기타',
      description: body.description || '',
      fileUrl: `/files/research-${Date.now()}.pdf`,
      fileName: `연구자료_${Date.now()}.pdf`,
      downloadCount: 0,
      viewCount: 0,
      researchYear: (body.researchYear as number) || new Date().getFullYear(),
      budget: (body.budget as number) || 0,
      progressStatus: (body.progressStatus as string) || '최초평가',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    researchItems.push(newItem)
    return HttpResponse.json({ success: true, data: newItem })
  }),

  // 연구자료 수정
  http.put('/api/sys11/research/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<ResearchItem>
    const index = researchItems.findIndex((r) => r.id === params.id)
    if (index === -1) return HttpResponse.json({ success: false, message: '자료를 찾을 수 없습니다' }, { status: 404 })
    researchItems[index] = {
      ...researchItems[index],
      ...body,
      updatedAt: new Date().toISOString().split('T')[0],
    }
    return HttpResponse.json({ success: true, data: researchItems[index] })
  }),

  // 연구자료 삭제
  http.delete('/api/sys11/research/:id', ({ params }) => {
    const index = researchItems.findIndex((r) => r.id === params.id)
    if (index !== -1) researchItems.splice(index, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // 카테고리 목록
  http.get('/api/sys11/categories', () => {
    return HttpResponse.json({ success: true, data: categories })
  }),

  // 카테고리 등록
  http.post('/api/sys11/categories', async ({ request }) => {
    const body = await request.json() as Partial<ResearchCategory>
    const newCategory: ResearchCategory = {
      id: `cat-${Date.now()}`,
      name: body.name || '',
      parentId: body.parentId,
      sortOrder: categories.length + 1,
    }
    categories.push(newCategory)
    return HttpResponse.json({ success: true, data: newCategory })
  }),

  // 카테고리 삭제
  http.delete('/api/sys11/categories/:id', ({ params }) => {
    const index = categories.findIndex((c) => c.id === params.id)
    if (index !== -1) categories.splice(index, 1)
    return HttpResponse.json({ success: true, data: null })
  }),

  // 카테고리별 통계 (년도별)
  http.get('/api/sys11/stats', ({ request }) => {
    const url = new URL(request.url)
    void url.searchParams.get('year')
    const stats = CATEGORY_NAMES.map((cat) => ({
      category: cat,
      totalCount: faker.number.int({ min: 5, max: 30 }),
      totalBudget: faker.number.int({ min: 10000000, max: 500000000 }),
    }))
    return HttpResponse.json({ success: true, data: stats })
  }),

  // 다운로드 이력
  http.get('/api/sys11/download-history', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const boardType = url.searchParams.get('boardType') || ''
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: `dl-${i + 1}`,
      downloaderName: faker.person.lastName() + faker.person.firstName(),
      downloaderUnit: faker.helpers.arrayElement(['1사단', '2사단', '해병대사령부']),
      fileName: faker.system.fileName(),
      downloadedAt: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
      boardType: faker.helpers.arrayElement(['연구자료', '자료실']),
    }))
    const filtered = boardType
      ? items.filter((item) => item.boardType === boardType)
      : items
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),

  // 자료실 목록 (research와 동일 데이터, 파일 다운로드 중심)
  http.get('/api/sys11/files', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '0')
    const size = parseInt(url.searchParams.get('size') || '10')
    const keyword = url.searchParams.get('keyword') || ''

    let filtered = [...researchItems]
    if (keyword) {
      filtered = filtered.filter(
        (item) => item.title.includes(keyword) || item.fileName.includes(keyword),
      )
    }
    return HttpResponse.json({ success: true, data: paginate(filtered, page, size) })
  }),
]
