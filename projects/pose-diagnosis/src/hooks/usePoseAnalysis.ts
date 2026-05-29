import { useState, useCallback } from 'react'
import type { ExerciseType, PoseAnalysisResult } from '../types'
import { analyzeImage } from '../utils/claudeApi'

interface UsePoseAnalysisReturn {
  result: PoseAnalysisResult | null
  isLoading: boolean
  error: string | null
  analyze: (dataUrl: string, exercise: ExerciseType, apiKey: string) => Promise<void>
  reset: () => void
}

export function usePoseAnalysis(): UsePoseAnalysisReturn {
  const [result, setResult] = useState<PoseAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (dataUrl: string, exercise: ExerciseType, apiKey: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64Data = dataUrl.split(',')[1]
      const mediaType = dataUrl.split(';')[0].split(':')[1]
      const data = await analyzeImage(base64Data, mediaType, exercise, apiKey)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, isLoading, error, analyze, reset }
}
