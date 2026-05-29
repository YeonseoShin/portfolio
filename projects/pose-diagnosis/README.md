# 운동 자세 및 관절 궤적 진단 인터페이스

측면 촬영 이미지를 업로드하면 비전 AI가 신체 관절 좌표를 추출하고, 삼각함수 기반 각도 계산과 SVG 스켈레톤으로 실시간 자세를 시각화하는 웹 애플리케이션입니다.

## 팀 구성 및 역할

| 역할 | 담당 |
|------|------|
| **프론트엔드** (본 레포) | 신연서 |
| 비전 AI 모델 연동 / 관절 좌표 추출 파이프라인 | 팀원 |

> 이 레포지토리는 **프론트엔드** 파트만 포함합니다.  
> 비전 AI 백엔드는 별도 레포에서 관리되며, 추출된 관절 좌표 배열을 이 앱으로 전달합니다.

## 프론트엔드 담당 구현 내용

### 1. SVG 실시간 스켈레톤 렌더링
- Claude Vision API가 추출한 14개 관절의 정규화 좌표(0~1)를 수신
- `<line>` 요소로 뼈대 연결선, `<circle>` 요소로 관절 포인트를 이미지 위에 오버레이
- 이미지 `object-fit: contain` 렌더 영역을 역산하여 정확한 좌표 매핑

### 2. 삼각함수 기반 관절 각도 계산 (`src/utils/angleUtils.ts`)
```ts
// 세 점의 공간 좌표 → 벡터 내적 → Math.acos → 각도(도)
export function calcAngle(a, b, c): number {
  const v1 = [a[0] - b[0], a[1] - b[1]]
  const v2 = [c[0] - b[0], c[1] - b[1]]
  const cos = dot(v1, v2) / (mag(v1) * mag(v2))
  return Math.round(Math.acos(cos) * 180 / Math.PI)
}
```

### 3. 커스텀 훅으로 분석 상태 관리 (`src/hooks/usePoseAnalysis.ts`)
- `isLoading`, `error`, `result` 상태를 한 곳에서 관리
- `useCallback`으로 불필요한 재생성 방지

### 4. 대시보드 UI (`src/components/AngleDashboard.tsx`)
- 운동 페이즈, 관절 각도 + 진행 바, 자세 피드백, 좌표 테이블

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (개발 서버 / 빌드)
- **Anthropic Claude Vision API** (`claude-sonnet-4-20250514`)

## 프로젝트 구조

```
src/
├── types/
│   └── index.ts              # 타입 정의 (JointMap, PoseAnalysisResult 등)
├── hooks/
│   └── usePoseAnalysis.ts    # API 호출 + 분석 상태 관리 훅
├── utils/
│   ├── angleUtils.ts         # 삼각함수 각도 계산 로직
│   └── claudeApi.ts          # Claude Vision API 호출
├── components/
│   ├── SkeletonOverlay.tsx   # SVG 스켈레톤 렌더링
│   └── AngleDashboard.tsx    # 각도·피드백 대시보드
├── App.tsx
├── App.css
└── main.tsx
```

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 Anthropic API 키를 입력하고 측면 촬영 이미지를 업로드하세요.

> **API 키 보안**: 키는 브라우저 메모리에서만 사용되며 서버로 전송되거나 저장되지 않습니다.

## 지원 운동

- 스쿼트 (Squat)
- 데드리프트 (Deadlift)
