import type { ExerciseType, PoseAnalysisResult } from '../types'

// 개발: Vite 프록시(/api/anthropic) 경유 → CORS 우회
// 프로덕션: 직접 호출 (API 키는 항상 클라이언트에서만 사용, 서버 저장 없음)
const CLAUDE_API_URL =
  import.meta.env.DEV
    ? '/api/anthropic/v1/messages'
    : 'https://api.anthropic.com/v1/messages'

function buildPrompt(exercise: ExerciseType): string {
  const name = exercise === 'squat' ? '스쿼트' : '데드리프트'
  return `이 이미지는 측면에서 촬영한 ${name} 동작 사진입니다.

이미지에서 사람의 신체 관절 위치를 분석하여 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

관절 좌표는 이미지 전체를 기준으로 0.0~1.0 사이의 정규화된 값(x: 왼쪽=0, 오른쪽=1 / y: 위=0, 아래=1)으로 표현하세요.
관절이 보이지 않거나 가려진 경우 null로 설정하세요.

{
  "joints": {
    "head": [x, y],
    "neck": [x, y],
    "leftShoulder": [x, y],
    "rightShoulder": [x, y],
    "leftElbow": [x, y],
    "rightElbow": [x, y],
    "leftWrist": [x, y],
    "rightWrist": [x, y],
    "leftHip": [x, y],
    "rightHip": [x, y],
    "leftKnee": [x, y],
    "rightKnee": [x, y],
    "leftAnkle": [x, y],
    "rightAnkle": [x, y]
  },
  "phase": "운동 구간명 (예: 하강 구간, 최저점, 상승 구간, 준비 자세, 락아웃 등)",
  "phaseDesc": "현재 자세에 대한 한 줄 설명",
  "feedback": [
    {"type": "good|warn|bad", "text": "피드백 내용"}
  ]
}`
}

export async function analyzeImage(
  base64Data: string,
  mediaType: string,
  exercise: ExerciseType,
  apiKey: string
): Promise<PoseAnalysisResult> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            { type: 'text', text: buildPrompt(exercise) },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message ?? `HTTP ${response.status}`)
  }

  const result = await response.json()
  const text: string = result.content.map((b: { text?: string }) => b.text ?? '').join('')
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as PoseAnalysisResult
}
