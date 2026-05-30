# 신연서 | Data-Driven Developer Portfolio

고려대학교 **영어교육학과** (본전공) · **데이터과학과** (이중전공) 재학 중인 신연서의 포트폴리오입니다.

데이터 수집부터 분석, 시각화, 인터페이스까지 전 과정을 다루는 Data-Driven Developer로,
데이터 파이프라인과 인터페이스가 교차하는 지점에서의 구현 경험을 쌓아왔습니다.

## 배포

GitHub Pages 설정: Settings → Pages → Source: `main` 브랜치, `/ (root)` → Save
→ `https://[유저명].github.io/portfolio/`

---

## 프로젝트 구조

```
portfolio/
├── index.html                        # 메인 포트폴리오
├── style.css                         # 전역 스타일
├── main.js                           # 포트폴리오 인터랙션 로직
├── README.md
└── projects/
    ├── pose-diagnosis/               # 운동 자세 진단 (React + TS)
    │   ├── index.html
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts
    │   └── src/
    │       ├── main.tsx
    │       ├── App.tsx / App.css
    │       ├── types/index.ts
    │       ├── hooks/usePoseAnalysis.ts
    │       ├── utils/angleUtils.ts
    │       ├── utils/claudeApi.ts
    │       └── components/
    │           ├── SkeletonOverlay.tsx
    │           └── AngleDashboard.tsx
    ├── kdic/                         # 금융권역별 안정성 리포트
    │   └── index.html
    ├── news-dashboard/               # 금융 뉴스 경제 흐름 분석 (미리보기)
    │   └── index.html
    ├── kanban/                       # 칸반 보드
    │   ├── index.html
    │   ├── style.css
    │   └── kanban.js
    ├── vocab-game/                   # 영단어 게임
    │   ├── index.html
    │   ├── style.css
    │   ├── quiz.js
    │   └── data/words.js
    └── savings/                      # 저축 도우미
        ├── index.html
        ├── style.css
        └── budget.js
```

---

## 주요 프로젝트

### 운동 자세 및 관절 궤적 진단 인터페이스
- **역할:** 프론트엔드 담당 (팀 프로젝트)
- **스택:** React · TypeScript · SVG · Claude Vision API
- 실행: `cd projects/pose-diagnosis && npm install && npm run dev`

### 금융권역별 안정성 리포트 대시보드
- **역할:** 1인 기획·개발 / **수상:** 예금보험공사 공공데이터 공모전 장려상 (2025.08)
- **스택:** Python · pandas · Altair · Tableau · Chart.js

### 금융 뉴스 경제 흐름 분석 대시보드
- **역할:** 1인 기획·개발
- **스택:** Python · Streamlit · HuggingFace (KR-FinBert) · 네이버 뉴스 API · yfinance · Plotly
- **GitHub:** https://github.com/YeonseoShin/financial-news-dashboard

---

## 사이드 프로젝트

| 프로젝트 | 핵심 기술 |
|---------|---------|
| TaskFlow Kanban | HTML5 Drag & Drop API · Vanilla JS |
| WordSprint 영단어 게임 | Vanilla JS · CSS Animation · localStorage |
| SpendLens 저축 도우미 | Vanilla JS · Chart.js · localStorage |

---

## 연락처
- Email: shinalicelife@naver.com
