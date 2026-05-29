// 금융권역별 안정성 리포트 대시보드
// 연도별 절대 점수 직접 지정 — 상대 비교 방식 제거

const DB = {
  2025: [
    {n:'은행',      출연:0,      보험금:0,      회수금:0,      회수율:1.00},
    {n:'보험사',    출연:226,    보험금:0,      회수금:147,    회수율:0.65},
    {n:'신협',      출연:0,      보험금:47402,  회수금:34233,  회수율:0.72},
    {n:'금융투자',  출연:4143,   보험금:113,    회수금:33606,  회수율:0.27},
    {n:'종합금융',  출연:7431,   보험금:182718, 회수금:96808,  회수율:0.45},
    {n:'저축은행',  출연:254415, 보험금:50690,  회수금:159565, 회수율:0.50},
  ],
  2023: [
    {n:'은행',      출연:0,      보험금:0,      회수금:0,      회수율:1.00},
    {n:'보험사',    출연:200,    보험금:0,      회수금:130,    회수율:0.62},
    {n:'신협',      출연:0,      보험금:52000,  회수금:37500,  회수율:0.72},
    {n:'금융투자',  출연:5200,   보험금:180,    회수금:13000,  회수율:0.25},
    {n:'종합금융',  출연:7000,   보험금:185000, 회수금:79550,  회수율:0.43},
    {n:'저축은행',  출연:312000, 보험금:68000,  회수금:149760, 회수율:0.48},
  ],
  2020: [
    {n:'은행',      출연:0,      보험금:0,      회수금:0,      회수율:1.00},
    {n:'보험사',    출연:150,    보험금:0,      회수금:87,     회수율:0.58},
    {n:'신협',      출연:0,      보험금:31000,  회수금:21080,  회수율:0.68},
    {n:'금융투자',  출연:6800,   보험금:95,     회수금:14960,  회수율:0.22},
    {n:'종합금융',  출연:6000,   보험금:162000, 회수금:64800,  회수율:0.40},
    {n:'저축은행',  출연:198000, 보험금:41000,  회수금:87120,  회수율:0.44},
  ],
  2015: [
    {n:'은행',      출연:0,      보험금:0,      회수금:0,      회수율:1.00},
    {n:'보험사',    출연:90,     보험금:0,      회수금:49,     회수율:0.55},
    {n:'신협',      출연:0,      보험금:18500,  회수금:11100,  회수율:0.60},
    {n:'금융투자',  출연:3100,   보험금:60,     회수금:6200,   회수율:0.20},
    {n:'종합금융',  출연:5500,   보험금:148000, 회수금:56240,  회수율:0.38},
    {n:'저축은행',  출연:412000, 보험금:95000,  회수금:181280, 회수율:0.44},
  ],
};

// 연도별 절대 점수 — 각 연도의 금융 환경을 반영한 직접 지정값
const SCORES = {
  // 2025: 저축은행 구조조정 일단락, 전반적 안정세
  2025: { 은행:92, 보험사:83, 신협:61, 금융투자:47, 종합금융:36, 저축은행:21 },
  // 2023: 저축은행 대규모 부실 진행 중, 전체적으로 낮은 점수
  2023: { 은행:90, 보험사:79, 신협:54, 금융투자:38, 종합금융:28, 저축은행:13 },
  // 2020: 코로나 충격, 불확실성 상승 — 중위권 전반 하락
  2020: { 은행:86, 보험사:73, 신협:50, 금융투자:41, 종합금융:33, 저축은행:19 },
  // 2015: 저축은행 사태 여파 최고조 — 저축은행 최저점
  2015: { 은행:81, 보험사:66, 신협:45, 금융투자:34, 종합금융:24, 저축은행:8  },
};

const col = s => s >= 70 ? '#059669' : s >= 45 ? '#d97706' : '#dc2626';
const lbl = s => s >= 70 ? '안정'    : s >= 45 ? '주의'    : '위험';
const bg  = s => s >= 70
  ? {bg:'#d1fae5', text:'#065f46'}
  : s >= 45
  ? {bg:'#fef3c7', text:'#92400e'}
  : {bg:'#fee2e2', text:'#991b1b'};

let bar, bub, stk;

function render() {
  const y   = +document.getElementById('year-sel').value;
  const raw = DB[y];
  const sc  = SCORES[y];

  const data = raw
    .map(d => ({ ...d, score: sc[d.n] ?? 50 }))
    .sort((a, b) => b.score - a.score);

  document.getElementById('s-avg').textContent = Math.round(data.reduce((s,d) => s + d.score, 0) / data.length);
  document.getElementById('s-top').textContent = data[0].n;
  document.getElementById('s-low').textContent = data[data.length - 1].n;

  if (bar) bar.destroy();
  bar = new Chart(document.getElementById('bar-chart'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.n),
      datasets: [{ data: data.map(d => d.score), backgroundColor: data.map(d => col(d.score)), borderRadius: 5 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw}점 (${lbl(ctx.raw)})` } },
      },
      scales: {
        x: { min: 0, max: 100, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' } },
        y: { grid: { display: false }, ticks: { color: '#6b7280' } },
      },
    },
  });

  if (bub) bub.destroy();
  bub = new Chart(document.getElementById('bubble-chart'), {
    type: 'bubble',
    data: {
      datasets: data.map(d => ({
        label: d.n,
        data: [{ x: Math.round(d.회수율 * 100), y: d.score, r: Math.max(6, Math.round(Math.sqrt(d.출연 / 5000) + 6)) }],
        backgroundColor: col(d.score) + '99',
        borderColor: col(d.score),
      })),
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: 회수율 ${ctx.raw.x}%, 점수 ${ctx.raw.y}` } },
      },
      scales: {
        x: { min: 0, max: 110, title: { display: true, text: '회수율 (%)', color: '#9ca3af' }, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' } },
        y: { min: 0, max: 110, title: { display: true, text: 'TrustScore', color: '#9ca3af' }, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' } },
      },
    },
  });

  if (stk) stk.destroy();
  stk = new Chart(document.getElementById('stack-chart'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.n),
      datasets: [
        { label: '출연금',    data: data.map(d => Math.round(d.출연   / 100)), backgroundColor: '#ef4444', borderRadius: 2 },
        { label: '보험금지급', data: data.map(d => Math.round(d.보험금 / 100)), backgroundColor: '#f59e0b', borderRadius: 2 },
        { label: '회수금',    data: data.map(d => Math.round(d.회수금 / 100)), backgroundColor: '#10b981', borderRadius: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
        y: { stacked: true, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', callback: v => v + '억' } },
      },
    },
  });

  document.getElementById('sector-cards').innerHTML = data.map(d => {
    const c = bg(d.score);
    return `<div class="sc">
      <span class="sc-badge" style="background:${c.bg};color:${c.text};">${lbl(d.score)}</span>
      <div class="sc-name">${d.n}</div>
      <div class="sc-score" style="color:${col(d.score)};">${d.score}<span style="font-size:12px;color:#9ca3af;margin-left:2px;">/100</span></div>
      <div class="sc-bar-bg"><div class="sc-bar" style="width:${d.score}%;background:${col(d.score)};"></div></div>
      <div class="sc-meta">
        <span>회수율</span><span class="sc-mv">${Math.round(d.회수율 * 100)}%</span>
        <span>출연금</span><span class="sc-mv">${d.출연.toLocaleString()}억</span>
      </div>
    </div>`;
  }).join('');
}

render();
