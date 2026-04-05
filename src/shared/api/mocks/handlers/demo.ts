import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { PageResponse, ApiResult } from '@/shared/api/types'

interface DemoItem {
  id: string
  title: string
  author: string
  status: string
  createdAt: string
  unit: string
}

function generateDemoItems(count: number): DemoItem[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    author: faker.person.fullName(),
    status: faker.helpers.arrayElement(['승인', '반려', '대기', '완료', '진행']),
    createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
    unit: faker.helpers.arrayElement(['해병대사령부', '1사단', '2사단', '교육훈련단']),
  }))
}

const allItems = generateDemoItems(87)

export const demoHandlers = [
  http.get('/api/demo/items', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const keyword = url.searchParams.get('keyword') ?? ''

    let filtered = allItems
    if (keyword) {
      filtered = allItems.filter(
        (item) => item.title.includes(keyword) || item.author.includes(keyword),
      )
    }

    const start = page * size
    const content = filtered.slice(start, start + size)

    const result: ApiResult<PageResponse<DemoItem>> = {
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

  http.post('/api/demo/items', async ({ request }) => {
    const body = await request.json()
    const result: ApiResult<DemoItem> = {
      success: true,
      data: { id: faker.string.uuid(), ...(body as Omit<DemoItem, 'id'>) },
      message: '등록되었습니다',
    }
    return HttpResponse.json(result, { status: 201 })
  }),

  http.delete('/api/demo/items/:id', () => {
    const result: ApiResult = {
      success: true,
      data: undefined as never,
      message: '삭제되었습니다',
    }
    return HttpResponse.json(result)
  }),
]
