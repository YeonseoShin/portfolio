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


// ══════════════════════════════════════════
//  Hero — Three.js 3D 그래픽
//  떠다니는 와이어프레임 노드 + 엣지 네트워크
// ══════════════════════════════════════════
(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0e17, 1);

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  camera.position.set(0, 0, 28);

  // ── 노드 생성 ──
  const NODE_COUNT = 60;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.18, 8, 8);

  for (let i = 0; i < NODE_COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.7 ? 0x818cf8 : 0x334155,
      transparent: true,
      opacity: Math.random() * 0.5 + 0.3,
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20
    );
    mesh.userData.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.012,
      (Math.random() - 0.5) * 0.008,
      (Math.random() - 0.5) * 0.005
    );
    scene.add(mesh);
    nodes.push(mesh);
  }

  // ── 엣지(연결선) 생성 ──
  const EDGE_DIST = 12;
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.35,
  });
  const edgeGroup = new THREE.Group();
  scene.add(edgeGroup);

  function rebuildEdges() {
    edgeGroup.clear();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < EDGE_DIST) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone(),
          ]);
          edgeGroup.add(new THREE.Line(geo, lineMat));
        }
      }
    }
  }
  rebuildEdges();

  // ── 마우스 패럴랙스 ──
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── 스크롤: 배경색 다크 → 라이트 ──
  const heroEl = document.getElementById('hero');
  function onScroll() {
    const scrollY = window.scrollY;
    const heroH   = heroEl.offsetHeight;
    const t = Math.min(scrollY / (heroH * 0.6), 1); // 0 → 1

    // 배경: #0a0e17 → #ffffff
    const r = Math.round(10  + (255 - 10)  * t);
    const g = Math.round(14  + (255 - 14)  * t);
    const b = Math.round(23  + (255 - 23)  * t);
    heroEl.style.background = `rgb(${r},${g},${b})`;

    // 텍스트 색: 흰 → 검정
    const heroContent = heroEl.querySelector('.hero-content');
    heroContent.style.opacity = t > 0.7 ? 0 : 1 - t * 0.6;

    // canvas 페이드
    canvas.style.opacity = 1 - t;

    // renderer 배경색도 함께
    renderer.setClearColor(new THREE.Color(`rgb(${r},${g},${b})`), 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── 애니메이션 루프 ──
  let edgeTimer = 0;
  function animate() {
    requestAnimationFrame(animate);

    nodes.forEach(n => {
      n.position.add(n.userData.vel);
      if (Math.abs(n.position.x) > 26) n.userData.vel.x *= -1;
      if (Math.abs(n.position.y) > 16) n.userData.vel.y *= -1;
      if (Math.abs(n.position.z) > 12) n.userData.vel.z *= -1;
    });

    edgeTimer++;
    if (edgeTimer % 6 === 0) rebuildEdges();

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();

// ── Scroll reveal (Intersection Observer) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll(
  '.activity-item, .project-card, .side-card, .info-card, .about-text, .section-title, .section-tag'
).forEach((el, i) => {
  el.classList.add('reveal');
  if (el.classList.contains('activity-item')) el.style.transitionDelay = (i % 7 * 55) + 'ms';
  if (el.classList.contains('side-card'))     el.style.transitionDelay = (i % 3 * 70) + 'ms';
  if (el.classList.contains('info-card'))     el.style.transitionDelay = (i % 5 * 45) + 'ms';
  revealObserver.observe(el);
});
