import { useState, useRef, useCallback } from 'react'
import type { ExerciseType } from './types'
import { usePoseAnalysis } from './hooks/usePoseAnalysis'
import { computeAngles } from './utils/angleUtils'
import SkeletonOverlay from './components/SkeletonOverlay'
import AngleDashboard from './components/AngleDashboard'
import './App.css'

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [exercise, setExercise] = useState<ExerciseType>('squat')
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { result, isLoading, error, analyze } = usePoseAnalysis()

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setDataUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!dataUrl || !apiKey) return
    await analyze(dataUrl, exercise, apiKey)
  }

  /** object-fit: contain 기준으로 이미지 실제 렌더 영역 계산 */
  const getImageLayout = () => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return null
    const containerW = container.clientWidth
    const containerH = container.clientHeight
    const scale = Math.min(containerW / img.naturalWidth, containerH / img.naturalHeight)
    const width = img.naturalWidth * scale
    const height = img.naturalHeight * scale
    return { offsetX: (containerW - width) / 2, offsetY: (containerH - height) / 2, width, height, containerW, containerH }
  }

  const angles = result ? computeAngles(result.joints, exercise) : []
  const imageLayout = getImageLayout()

  return (
    <div className="app">
      <header className="header">
        <div className="logo-mark">PD</div>
        <h1>운동 자세 진단 인터페이스</h1>
        <span className="header-sub">Pose Diagnosis · Claude Vision</span>
      </header>

      <main className="main">
        {/* LEFT */}
        <div className="left-panel">
          {/* API Key */}
          <div className="field">
            <label className="field-label">
              Anthropic API Key <span className="tag">로컬에서만 사용</span>
            </label>
            <input
              type="password"
              className="api-input"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {/* Exercise selector */}
          <div className="field">
            <label className="field-label">운동 종목 선택</label>
            <div className="ex-selector">
              {(['squat', 'deadlift'] as ExerciseType[]).map((ex) => (
                <button
                  key={ex}
                  className={`ex-btn ${exercise === ex ? 'active' : ''}`}
                  onClick={() => setExercise(ex)}
                >
                  {ex === 'squat' ? '스쿼트' : '데드리프트'}
                </button>
              ))}
            </div>
          </div>

          {/* Upload zone */}
          <label
            className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="upload-icon">📸</div>
            <h3>측면 촬영 이미지 업로드</h3>
            <p>측면에서 촬영한 사진을 드래그하거나 클릭하여 업로드하세요</p>
          </label>

          {/* Canvas */}
          <div className="canvas-container" ref={containerRef}>
            {!dataUrl && (
              <div className="canvas-placeholder">
                <div className="big">🦴</div>
                <p>이미지를 업로드하면 스켈레톤이 표시됩니다</p>
              </div>
            )}
            {dataUrl && (
              <img
                ref={imgRef}
                src={dataUrl}
                alt="업로드된 운동 이미지"
                className="preview-img"
              />
            )}
            {result && imageLayout && (
              <SkeletonOverlay joints={result.joints} imageLayout={imageLayout} />
            )}
            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner" />
                <p className="loading-text">Claude Vision이 관절을 분석 중입니다...</p>
              </div>
            )}
          </div>

          {/* Analyze button */}
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={!dataUrl || !apiKey || isLoading}
          >
            {isLoading ? <span className="btn-spinner" /> : null}
            {isLoading ? '분석 중...' : dataUrl ? '자세 분석 시작' : '이미지를 먼저 업로드하세요'}
          </button>

          {error && <p className="error-text">오류: {error}</p>}
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          {result ? (
            <AngleDashboard
              angles={angles}
              feedback={result.feedback}
              phase={result.phase}
              phaseDesc={result.phaseDesc}
              joints={result.joints}
            />
          ) : (
            <div className="empty-panel">
              <p>분석 결과가 여기에 표시됩니다</p>
            </div>
          )}

          <div className="status-bar">
            <span className="status-dot" />
            {isLoading
              ? 'Claude Vision 분석 중...'
              : result
              ? `분석 완료 · ${exercise === 'squat' ? '스쿼트' : '데드리프트'}`
              : '대기 중 — 이미지를 업로드하고 분석을 시작하세요'}
          </div>
        </div>
      </main>
    </div>
  )
}
