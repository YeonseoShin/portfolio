export type ExerciseType = 'squat' | 'deadlift'

export type JointName =
  | 'head' | 'neck'
  | 'leftShoulder' | 'rightShoulder'
  | 'leftElbow' | 'rightElbow'
  | 'leftWrist' | 'rightWrist'
  | 'leftHip' | 'rightHip'
  | 'leftKnee' | 'rightKnee'
  | 'leftAnkle' | 'rightAnkle'

/** 정규화된 좌표 [x, y] (0.0 ~ 1.0) */
export type NormalizedCoord = [number, number]

export type JointMap = Partial<Record<JointName, NormalizedCoord>>

export type FeedbackType = 'good' | 'warn' | 'bad'

export interface FeedbackItem {
  type: FeedbackType
  text: string
}

/** Claude Vision API 응답 */
export interface PoseAnalysisResult {
  joints: JointMap
  phase: string
  phaseDesc: string
  feedback: FeedbackItem[]
}

export interface AngleResult {
  name: string
  value: number
  status: FeedbackType
}
