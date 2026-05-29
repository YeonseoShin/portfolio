import type { CSSProperties } from 'react'
import type { AngleResult, FeedbackItem, JointMap, JointName, NormalizedCoord } from '../types'

const STATUS_COLOR: Record<string, string> = {
  good: '#3ecf8e',
  warn: '#f59e0b',
  bad:  '#f87171',
}

const KEY_JOINTS: JointName[] = ['neck', 'leftShoulder', 'leftHip', 'leftKnee', 'leftAnkle']

interface Props {
  angles: AngleResult[]
  feedback: FeedbackItem[]
  phase: string
  phaseDesc: string
  joints: JointMap
}

export default function AngleDashboard({ angles, feedback, phase, phaseDesc, joints }: Props) {
  return (
    <>
      {/* 운동 페이즈 */}
      <section style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={labelStyle}>운동 상태</p>
        <span style={phaseBadgeStyle}>● {phase}</span>
        {phaseDesc && <p style={{ fontSize: 12, color: '#8a94a8', marginTop: 10 }}>{phaseDesc}</p>}
      </section>

      {/* 관절 각도 */}
      <section style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={labelStyle}>관절 각도</p>
        {angles.map((a) => (
          <div key={a.name} style={angleRowStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: '#8a94a8' }}>{a.name}</p>
              <div style={barBgStyle}>
                <div style={{ ...barFillStyle, width: `${Math.min(100, Math.round(a.value / 180 * 100))}%`, background: STATUS_COLOR[a.status] }} />
              </div>
            </div>
            <span style={{ ...angleValStyle, color: STATUS_COLOR[a.status] }}>{a.value}°</span>
          </div>
        ))}
      </section>

      {/* 자세 피드백 */}
      <section style={{ padding: '18px 20px', flex: 1, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={labelStyle}>자세 피드백</p>
        {feedback.map((f, i) => (
          <div key={i} style={fbItemStyle}>
            <span style={{ ...fbDotStyle, background: STATUS_COLOR[f.type] }} />
            <span style={{ fontSize: 12, color: '#8a94a8', lineHeight: 1.6 }}>{f.text}</span>
          </div>
        ))}
      </section>

      {/* 좌표 데이터 */}
      <section style={{ padding: '18px 20px' }}>
        <p style={labelStyle}>관절 좌표 데이터</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
          <thead>
            <tr>
              {['관절', 'x', 'y'].map((h) => (
                <th key={h} style={{ color: '#4d5568', fontWeight: 500, textAlign: 'left', padding: '4px 0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KEY_JOINTS.filter((j) => joints[j]).map((j) => {
              const coord = joints[j] as NormalizedCoord
              return (
                <tr key={j}>
                  <td style={coordCellStyle}>{j}</td>
                  <td style={coordCellStyle}>{(coord[0] * 100).toFixed(1)}</td>
                  <td style={coordCellStyle}>{(coord[1] * 100).toFixed(1)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </>
  )
}

const labelStyle: CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#4d5568',
  marginBottom: 14, fontFamily: 'DM Mono, monospace',
}
const phaseBadgeStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '4px 10px', borderRadius: 999,
  fontSize: 12, fontWeight: 500, fontFamily: 'DM Mono, monospace',
  background: 'rgba(108,127,255,0.15)', color: '#6c7fff',
  border: '1px solid rgba(108,127,255,0.3)',
}
const angleRowStyle: CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}
const barBgStyle: CSSProperties = {
  height: 3, background: '#1e2333', borderRadius: 99, marginTop: 5, width: 100,
}
const barFillStyle: CSSProperties = {
  height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
}
const angleValStyle: CSSProperties = {
  fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 500, marginLeft: 16,
}
const fbItemStyle: CSSProperties = {
  display: 'flex', gap: 10, padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)', alignItems: 'flex-start',
}
const fbDotStyle: CSSProperties = {
  width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5,
}
const coordCellStyle: CSSProperties = {
  color: '#8a94a8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
}
