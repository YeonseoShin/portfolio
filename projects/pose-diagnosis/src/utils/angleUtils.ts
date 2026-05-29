import type { NormalizedCoord, JointMap, JointName, AngleResult, FeedbackType, ExerciseType } from '../types'

/**
 * 세 점의 좌표를 받아 b를 꼭짓점으로 하는 각도를 계산 (도 단위)
 * 자소서에 기재한 삼각함수 계산 로직
 */
export function calcAngle(
  a: NormalizedCoord,
  b: NormalizedCoord,
  c: NormalizedCoord
): number {
  const v1: NormalizedCoord = [a[0] - b[0], a[1] - b[1]]
  const v2: NormalizedCoord = [c[0] - b[0], c[1] - b[1]]

  const dot = v1[0] * v2[0] + v1[1] * v2[1]
  const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2)
  const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2)

  if (mag1 === 0 || mag2 === 0) return 0

  const cosTheta = Math.min(1, Math.max(-1, dot / (mag1 * mag2)))
  return Math.round((Math.acos(cosTheta) * 180) / Math.PI)
}

function getStatus(val: number, good: [number, number], warn: [number, number]): FeedbackType {
  if (val >= good[0] && val <= good[1]) return 'good'
  if (val >= warn[0] && val <= warn[1]) return 'warn'
  return 'bad'
}

interface AngleDef {
  name: string
  joints: [JointName, JointName, JointName]
  good: [number, number]
  warn: [number, number]
}

const SQUAT_ANGLE_DEFS: AngleDef[] = [
  { name: '무릎 각도', joints: ['leftHip', 'leftKnee', 'leftAnkle'], good: [70, 130], warn: [60, 160] },
  { name: '고관절 각도', joints: ['leftShoulder', 'leftHip', 'leftKnee'], good: [65, 120], warn: [55, 150] },
  { name: '발목 각도', joints: ['leftKnee', 'leftAnkle', 'leftHip'], good: [60, 90], warn: [50, 110] },
  { name: '척추 기울기', joints: ['neck', 'leftHip', 'rightHip'], good: [150, 180], warn: [130, 180] },
]

const DEADLIFT_ANGLE_DEFS: AngleDef[] = [
  { name: '무릎 각도', joints: ['leftHip', 'leftKnee', 'leftAnkle'], good: [140, 175], warn: [120, 180] },
  { name: '고관절 각도', joints: ['leftShoulder', 'leftHip', 'leftKnee'], good: [60, 110], warn: [50, 140] },
  { name: '척추 기울기', joints: ['neck', 'leftHip', 'rightHip'], good: [140, 175], warn: [120, 180] },
  { name: '어깨-고관절', joints: ['leftElbow', 'leftShoulder', 'leftHip'], good: [150, 180], warn: [130, 180] },
]

export function computeAngles(joints: JointMap, exercise: ExerciseType): AngleResult[] {
  const defs = exercise === 'squat' ? SQUAT_ANGLE_DEFS : DEADLIFT_ANGLE_DEFS

  return defs.flatMap((def) => {
    const [a, b, c] = def.joints
    const pa = joints[a], pb = joints[b], pc = joints[c]
    if (!pa || !pb || !pc) return []

    const value = calcAngle(pa, pb, pc)
    const status = getStatus(value, def.good, def.warn)
    return [{ name: def.name, value, status }]
  })
}
