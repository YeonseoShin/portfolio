# Changelog

## [1.0.0] - 2024-12

### Added
- 측면 이미지 업로드 → Claude Vision API 관절 좌표 추출 파이프라인 연동
- SVG `<line>` / `<circle>` 기반 14관절 스켈레톤 오버레이 렌더링
- `calcAngle()`: 세 점 벡터 내적 기반 삼각함수 각도 계산 유틸
- 스쿼트 / 데드리프트 종목별 관절 각도 기준 정의
- `usePoseAnalysis` 커스텀 훅 — 로딩·에러·결과 상태 통합 관리
- `AngleDashboard`: 운동 페이즈, 각도 진행 바, 자세 피드백, 좌표 테이블

## [0.3.0] - 2024-11

### Added
- Vite + React + TypeScript 프로젝트 초기 세팅
- `JointMap`, `PoseAnalysisResult` 등 공유 타입 정의
- `SkeletonOverlay` 컴포넌트 — 정규화 좌표 → SVG viewBox 좌표 변환 로직

### Fixed
- `object-fit: contain` 렌더 영역 역산 오차 수정

## [0.2.0] - 2024-10

### Added
- 비전 AI 백엔드 팀과 API 인터페이스 설계 (관절 좌표 정규화 방식 합의)
- 이미지 업로드 UI 및 드래그 앤 드롭 구현

## [0.1.0] - 2024-09

### Added
- 프로젝트 기획 및 역할 분담
- 프론트엔드 기술 스택 확정 (React + TypeScript + Vite)
