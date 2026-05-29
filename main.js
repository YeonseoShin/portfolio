// ── Panel toggle ──
function toggle(id, btn) {
  const el = document.getElementById(id);
  const open = el.classList.toggle('open');
  if (open) {
    btn.innerHTML = btn.innerHTML.replace('▶', '▼').replace('&lt;/&gt;', '▼');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (id === 'pv-kdic') renderKDIC();
  } else {
    btn.innerHTML = btn.innerHTML.replace('▼', '▶');
  }
}

// ── Copy code ──
function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('.code-pre');
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = '복사됨 ✓';
    setTimeout(() => btn.textContent = '복사', 1600);
  });
}

// ── Pose SVG interactive ──
const svg   = document.getElementById('pose-svg');
const nodes = {
  shoulder: document.getElementById('j-shoulder'),
  hip:      document.getElementById('j-hip'),
  knee:     document.getElementById('j-knee'),
  ankle:    document.getElementById('j-ankle'),
};
const bones = {
  spine: document.getElementById('b-spine'),
  thigh: document.getElementById('b-thigh'),
  calf:  document.getElementById('b-calf'),
};
let active = null;
const xy = n => ({ x: parseFloat(n.getAttribute('cx')), y: parseFloat(n.getAttribute('cy')) });

function updatePose() {
  const s = xy(nodes.shoulder), h = xy(nodes.hip), k = xy(nodes.knee), a = xy(nodes.ankle);
  const setLine = (bone, p1, p2) => {
    bone.setAttribute('x1', p1.x); bone.setAttribute('y1', p1.y);
    bone.setAttribute('x2', p2.x); bone.setAttribute('y2', p2.y);
  };
  setLine(bones.spine, s, h);
  setLine(bones.thigh, h, k);
  setLine(bones.calf,  k, a);

  // 삼각함수 각도 계산 (hip–knee–ankle)
  const v1 = { x: h.x - k.x, y: h.y - k.y };
  const v2 = { x: a.x - k.x, y: a.y - k.y };
  const dot  = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  const ang  = mag1 * mag2 > 0
    ? Math.round(Math.acos(Math.min(1, Math.max(-1, dot / (mag1 * mag2)))) * 180 / Math.PI)
    : 0;

  document.getElementById('p-angle').textContent = ang + '°';
  document.getElementById('p-bar').style.width   = Math.min(100, ang / 180 * 100) + '%';

  const col = ang < 70 ? '#ef4444' : ang <= 130 ? '#4f46e5' : '#0891b2';
  const phase = ang < 70 ? '● 최저점' : ang <= 130 ? '● 하강 구간' : '● 준비 자세';
  const txt   = ang < 70 ? '무릎이 과도하게 굽혀졌습니다. 부상 위험이 있습니다.'
              : ang <= 130 ? '안정적인 자세를 유지하고 있습니다.'
              : '무릎이 펴진 상태입니다. 하강을 준비하세요.';

  ['p-angle','p-bar','p-dot'].forEach(id => document.getElementById(id).style[id === 'p-bar' ? 'background' : 'color'] = col);
  document.getElementById('p-dot').style.background = col;
  document.getElementById('p-phase').textContent  = phase;
  document.getElementById('p-phase').style.color  = col;
  document.getElementById('p-text').textContent   = txt;
}

Object.values(nodes).forEach(n => {
  n.addEventListener('mousedown', e => { active = n; e.preventDefault(); });
});
window.addEventListener('mousemove', e => {
  if (!active || !svg) return;
  const ct = svg.getScreenCTM();
  active.setAttribute('cx', (e.clientX - ct.e) / ct.a);
  active.setAttribute('cy', (e.clientY - ct.f) / ct.d);
  updatePose();
});
window.addEventListener('mouseup', () => active = null);
updatePose();

// ── KDIC chart ──
const KDIC_SCORES = {
  2025: { 은행:92, 보험사:83, 신협:61, 금융투자:47, 종합금융:36, 저축은행:21 },
  2023: { 은행:90, 보험사:79, 신협:54, 금융투자:38, 종합금융:28, 저축은행:13 },
  2020: { 은행:86, 보험사:73, 신협:50, 금융투자:41, 종합금융:33, 저축은행:19 },
  2015: { 은행:81, 보험사:66, 신협:45, 금융투자:34, 종합금융:24, 저축은행:8  },
};
let kChart;
function renderKDIC() {
  const y   = +document.getElementById('kdic-year').value;
  const sc  = KDIC_SCORES[y];
  const col = s => s > 70 ? '#059669' : s > 45 ? '#d97706' : '#dc2626';
  const data = Object.entries(sc)
    .map(([n, s]) => ({ n, s }))
    .sort((a, b) => b.s - a.s);

  document.getElementById('k-avg').textContent = Math.round(data.reduce((a, b) => a + b.s, 0) / data.length);
  document.getElementById('k-top').textContent = data[0].n;
  document.getElementById('k-low').textContent = data[data.length - 1].n;

  if (kChart) kChart.destroy();
  kChart = new Chart(document.getElementById('kdic-bar'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.n),
      datasets: [{ data: data.map(d => d.s), backgroundColor: data.map(d => col(d.s)), borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { min: 0, max: 100, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' } },
        y: { grid: { display: false }, ticks: { color: '#6b7280' } },
      },
    },
  });
}


// ── Scroll reveal (Intersection Observer) ──
const revealEls = document.querySelectorAll(
  '.activity-item, .project-card, .side-card, .info-card, .about-text, .section-title, .section-tag'
);

revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => observer.observe(el));

// activity-item에 순서별 딜레이 추가
document.querySelectorAll('.activity-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
});
document.querySelectorAll('.side-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
});
document.querySelectorAll('.info-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 50}ms`;
});

// ── Hero 카드 스택 진입 애니메이션 ──
document.querySelectorAll('.hcard').forEach((el, i) => {
  el.style.animationDelay = `${0.2 + i * 0.12}s`;
});
