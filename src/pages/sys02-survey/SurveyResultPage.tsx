import { useParams } from 'react-router-dom'
import { Button, Card, Col, List, Rate, Result, Row, Statistic, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Bar } from '@ant-design/charts'
import { PageContainer } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'

const { Title, Text } = Typography

interface QuestionResult {
  question: {
    id: string
    questionText: string
    questionType: string
    options: string[]
    orderIndex: number
  }
  optionCounts: { option: string; count: number; ratio: number }[]
  textAnswers: string[]
  averageRating?: number
  ratingDistribution?: { score: number; count: number }[]
}

interface SurveyResultData {
  survey: { surveyName: string; isPublicResult: boolean; description: string }
  totalTarget: number
  totalResponse: number
  responseRate: number
  questionResults: QuestionResult[]
}

interface SurveyResultPageProps {
  surveyId?: string
}

// 설문 결과 분석 페이지 (SURV-02/04)
export default function SurveyResultPage({ surveyId: propSurveyId }: SurveyResultPageProps) {
  const { id: paramId } = useParams<{ id: string }>()
  const id = propSurveyId || paramId

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'results', id],
    queryFn: () => apiClient.get<SurveyResultData>(`/sys02/surveys/${id}/results`),
    enabled: !!id,
  })

  const result = (data as { data?: SurveyResultData } | undefined)?.data ?? (data as SurveyResultData | undefined)

  if (isLoading) {
    return <PageContainer title="설문 결과 분석" loading />
  }

  // 비공개 설문 처리
  if (result?.survey && !result.survey.isPublicResult) {
    return (
      <PageContainer title="설문 결과 분석">
        <Result
          status="info"
          title="결과가 비공개 처리된 설문입니다."
          subTitle="이 설문의 결과는 공개되지 않습니다."
        />
      </PageContainer>
    )
  }

  const handleExcelDownload = () => {
    // Mock 엑셀 다운로드
    const csvContent = '문항,응답수\n' + (result?.questionResults || []).map((q) => `${q.question.questionText},${q.optionCounts.reduce((sum, o) => sum + o.count, 0)}`).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '설문결과.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageContainer
      title="설문 결과 분석"
      extra={[
        <Button key="excel" onClick={handleExcelDownload}>
          엑셀 다운로드
        </Button>,
      ]}
    >
      {/* 상단 통계 요약 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="총 대상자"
              value={result?.totalTarget || 0}
              suffix="명"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="응답자"
              value={result?.totalResponse || 0}
              suffix="명"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="응답률"
              value={result?.responseRate || 0}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 문항별 결과 */}
      {(result?.questionResults || []).map((qr, idx) => (
        <Card
          key={qr.question.id}
          style={{ marginBottom: 16 }}
          title={
            <Text strong>
              {idx + 1}. {qr.question.questionText}
            </Text>
          }
        >
          {/* 객관식 (radio/checkbox): Bar 차트 */}
          {(qr.question.questionType === 'radio' || qr.question.questionType === 'checkbox') && (
            <Bar
              data={qr.optionCounts.map((oc) => ({
                option: oc.option,
                count: oc.count,
                ratio: oc.ratio,
              }))}
              xField="count"
              yField="option"
              height={200}
              label={{
                text: (d: { option: string; count: number; ratio: number }) => `${d.ratio}%`,
              }}
            />
          )}

          {/* 주관식 (textarea): 텍스트 목록 */}
          {qr.question.questionType === 'textarea' && (
            <List
              size="small"
              dataSource={qr.textAnswers}
              renderItem={(item) => <List.Item>{item}</List.Item>}
              pagination={{ pageSize: 5 }}
            />
          )}

          {/* 평점 (rate): 평균 + 분포 */}
          {qr.question.questionType === 'rate' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <Text>평균 평점: </Text>
                <Rate
                  disabled
                  value={qr.averageRating || 0}
                  allowHalf
                />
                <Text strong style={{ marginLeft: 8 }}>
                  {qr.averageRating?.toFixed(1)} / 5.0
                </Text>
              </div>
              {qr.ratingDistribution && (
                <Bar
                  data={qr.ratingDistribution.map((d) => ({
                    option: `${d.score}점`,
                    count: d.count,
                    ratio: 0,
                  }))}
                  xField="count"
                  yField="option"
                  height={200}
                />
              )}
            </>
          )}
        </Card>
      ))}

      {(!result?.questionResults || result.questionResults.length === 0) && (
        <Card>
          <Result status="info" title="아직 응답 결과가 없습니다." />
        </Card>
      )}
    </PageContainer>
  )
}
