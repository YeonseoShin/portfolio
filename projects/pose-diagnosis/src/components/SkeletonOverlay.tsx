import type { JointMap, JointName, NormalizedCoord } from '../types'

const CONNECTIONS: [JointName, JointName][] = [
  ['head', 'neck'],
  ['neck', 'leftShoulder'], ['neck', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
]

interface Props {
  joints: JointMap
  /** 실제 렌더된 이미지의 컨테이너 내 위치/크기 정보 */
  imageLayout: { offsetX: number; offsetY: number; width: number; height: number; containerW: number; containerH: number }
}

export default function SkeletonOverlay({ joints, imageLayout }: Props) {
  const { offsetX, offsetY, width, height, containerW, containerH } = imageLayout

  /** 정규화 좌표 → SVG viewBox(0~100) 좌표 변환 */
  function toSVG(coord: NormalizedCoord): [number, number] {
    return [
      ((offsetX + coord[0] * width) / containerW) * 100,
      ((offsetY + coord[1] * height) / containerH) * 100,
    ]
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {/* 뼈대 연결선 */}
      {CONNECTIONS.map(([a, b]) => {
        const pa = joints[a], pb = joints[b]
        if (!pa || !pb) return null
        const [x1, y1] = toSVG(pa)
        const [x2, y2] = toSVG(pb)
        return (
          <line
            key={`${a}-${b}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#6c7fff"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.85"
          />
        )
      })}

      {/* 관절 포인트 */}
      {(Object.entries(joints) as [JointName, NormalizedCoord][]).map(([name, coord]) => {
        if (!coord) return null
        const [cx, cy] = toSVG(coord)
        const isHead = name === 'head'
        return (
          <circle
            key={name}
            cx={cx} cy={cy}
            r={isHead ? 2.2 : 1.2}
            fill={isHead ? '#6c7fff' : '#fff'}
            stroke="#6c7fff"
            strokeWidth={isHead ? 0 : 0.5}
          />
        )
      })}
    </svg>
  )
}
