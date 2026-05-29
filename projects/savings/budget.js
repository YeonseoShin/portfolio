// SpendLens — 카테고리별 지출 집계, 과소비 감지, 차트 렌더링
const STORAGE_TX  = 'spendlens_tx';
const STORAGE_BUD = 'spendlens_budget';

const CAT_ICONS  = { 식비:'🍚', 교통:'🚌', 쇼핑:'🛍', 문화:'🎬', 의료:'💊', 기타:'📦' };
const CAT_COLORS = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626','#6b7280'];
const CAT_LIST   = ['식비','교통','쇼핑','문화','의료','기타'];

// 카테고리별 한도 (기본값)
const DEFAULT_CAT_LIMITS = { 식비: 0.35, 교통: 0.15, 쇼핑: 0.20, 문화: 0.15, 의료: 0.10, 기타: 0.05 };

let catChart, dailyChart;

// ── 데이터 ──
function loadTx()     { return JSON.parse(localStorage.getItem(STORAGE_TX)  || '[]'); }
function saveTx(data) { localStorage.setItem(STORAGE_TX, JSON.stringify(data)); }
function loadBudget() { return JSON.parse(localStorage.getItem(STORAGE_BUD) || '{"total":500000}'); }
function saveBudget(b){ localStorage.setItem(STORAGE_BUD, JSON.stringify(b)); }

// ── 집계 ──
function analyzeSpending(transactions, budget) {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const thisMonth = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // 카테고리별 합산
  const byCategory = CAT_LIST.reduce((acc, cat) => {
    acc[cat] = thisMonth.filter(tx => tx.category === cat).reduce((s, tx) => s + tx.amount, 0);
    return acc;
  }, {});

  const totalSpent = Object.values(byCategory).reduce((s, v) => s + v, 0);

  // 과소비 경고 (카테고리별 기본 비율 대비 90% 초과)
  const warnings = CAT_LIST.flatMap(cat => {
    const limit = budget.total * DEFAULT_CAT_LIMITS[cat];
    const spent = byCategory[cat];
    if (spent === 0 || !limit) return [];
    const ratio = spent / limit;
    if (ratio >= 1.0)  return [{ cat, ratio: Math.round(ratio * 100), level: 'danger' }];
    if (ratio >= 0.9)  return [{ cat, ratio: Math.round(ratio * 100), level: 'caution' }];
    return [];
  });

  // 일별 지출
  const byDay = {};
  for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
    byDay[d] = thisMonth.filter(tx => new Date(tx.date).getDate() === d)
                        .reduce((s, tx) => s + tx.amount, 0);
  }

  return { thisMonth, byCategory, totalSpent, warnings, byDay };
}

// ── 렌더링 ──
function render() {
  const tx      = loadTx();
  const budget  = loadBudget();
  const { thisMonth, byCategory, totalSpent, warnings, byDay } = analyzeSpending(tx, budget);

  const remain  = budget.total - totalSpent;
  const now     = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed  = now.getDate();
  const dailyAvg    = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const projected   = dailyAvg * daysInMonth;
  const saveEst     = Math.max(0, budget.total - Math.round(projected));

  document.getElementById('s-budget').textContent = fmt(budget.total);
  document.getElementById('s-spent').textContent  = fmt(totalSpent);
  document.getElementById('s-remain').textContent = fmt(Math.max(0, remain));
  document.getElementById('s-save').textContent   = fmt(saveEst);
  document.getElementById('s-period').textContent = `${now.getMonth() + 1}월 기준`;
  document.getElementById('s-remain-sub').textContent = remain < 0 ? '⚠️ 한도 초과' : '남은 예산';

  // 예산 바
  const pct = budget.total > 0 ? Math.min(100, Math.round(totalSpent / budget.total * 100)) : 0;
  document.getElementById('budget-bar').style.width = pct + '%';
  document.getElementById('budget-bar').style.background = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#7c3aed';
  document.getElementById('budget-pct').textContent = pct + '%';

  // 경고 메시지
  document.getElementById('warnings').innerHTML = warnings.map(w =>
    `<div class="warn-item ${w.level}">${w.level === 'danger' ? '🚨' : '⚠️'} ${w.cat} 지출이 권장 한도의 ${w.ratio}%에 달했습니다.</div>`
  ).join('');

  // 도넛 차트
  const cats  = CAT_LIST.filter(c => byCategory[c] > 0);
  const vals  = cats.map(c => byCategory[c]);
  const cols  = cats.map(c => CAT_COLORS[CAT_LIST.indexOf(c)]);
  if (catChart) catChart.destroy();
  catChart = new Chart(document.getElementById('cat-chart'), {
    type: 'doughnut',
    data: { labels: cats, datasets: [{ data: vals, backgroundColor: cols, borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
  });
  document.getElementById('cat-legend').innerHTML = cats.map((c, i) =>
    `<div class="leg-item"><span class="leg-dot" style="background:${cols[i]};"></span>${c} ${fmt(vals[i])}</div>`
  ).join('');

  // 일별 막대 차트 (최근 15일)
  const today = now.getDate();
  const dayLabels = Array.from({ length: Math.min(today, 15) }, (_, i) => `${today - 14 + i}일`).filter(l => parseInt(l) >= 1);
  const dayVals   = dayLabels.map(l => byDay[parseInt(l)] || 0);
  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(document.getElementById('daily-chart'), {
    type: 'bar',
    data: { labels: dayLabels, datasets: [{ data: dayVals, backgroundColor: '#ddd6fe', borderRadius: 4, hoverBackgroundColor: '#7c3aed' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } }, y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', callback: v => v >= 10000 ? (v/10000)+'만' : v } } } },
  });

  // 거래 목록
  const list = document.getElementById('tx-list');
  if (thisMonth.length === 0) {
    list.innerHTML = '<div class="empty-tx">이번달 지출 내역이 없습니다.</div>';
    return;
  }
  list.innerHTML = [...thisMonth].reverse().map(tx =>
    `<div class="tx-item">
      <div class="tx-cat-icon">${CAT_ICONS[tx.category] || '📦'}</div>
      <div class="tx-info">
        <div class="tx-title">${tx.memo || tx.category}</div>
        <div class="tx-meta">${tx.category} · ${new Date(tx.date).toLocaleDateString('ko-KR')}</div>
      </div>
      <div class="tx-amount">-${fmt(tx.amount)}</div>
      <button class="tx-delete" onclick="deleteTx('${tx.id}')" title="삭제">×</button>
    </div>`
  ).join('');
}

// ── 거래 추가 ──
function addTransaction() {
  const amount = parseInt(document.getElementById('m-amount').value);
  if (!amount || amount <= 0) { alert('금액을 입력해주세요.'); return; }
  const tx = {
    id: Date.now().toString(),
    amount,
    category: document.getElementById('m-category').value,
    memo: document.getElementById('m-memo').value.trim(),
    date: new Date().toISOString(),
  };
  const data = loadTx();
  data.push(tx);
  saveTx(data);
  closeModal();
  document.getElementById('m-amount').value = '';
  document.getElementById('m-memo').value   = '';
  render();
}

function deleteTx(id) {
  saveTx(loadTx().filter(tx => tx.id !== id));
  render();
}
function clearAll() {
  if (!confirm('모든 거래 내역을 삭제할까요?')) return;
  saveTx([]);
  render();
}

// ── 예산 설정 ──
function editBudget() {
  const v = prompt('월 예산 한도 (원):', loadBudget().total);
  if (!v) return;
  const n = parseInt(v.replace(/,/g, ''));
  if (!n || n <= 0) { alert('올바른 금액을 입력해주세요.'); return; }
  saveBudget({ total: n });
  render();
}

// ── 모달 ──
function openModal()  { document.getElementById('modal-bg').classList.remove('hidden'); }
function closeModal(e){ if (!e || e.target === document.getElementById('modal-bg')) document.getElementById('modal-bg').classList.add('hidden'); }

// ── 유틸 ──
function fmt(n) { return '₩' + Math.round(n).toLocaleString('ko-KR'); }

// 샘플 데이터 (첫 방문 시)
function seedSampleData() {
  if (loadTx().length > 0) return;
  const now = new Date();
  const samples = [
    { cat: '식비', amt: 8500, memo: '편의점 점심' },
    { cat: '교통', amt: 1500, memo: '지하철' },
    { cat: '식비', amt: 13000, memo: '친구들이랑 저녁' },
    { cat: '쇼핑', amt: 35000, memo: '옷 구매' },
    { cat: '문화', amt: 15000, memo: '영화' },
    { cat: '식비', amt: 6000, memo: '카페' },
    { cat: '교통', amt: 3200, memo: '버스' },
    { cat: '식비', amt: 22000, memo: '외식' },
    { cat: '쇼핑', amt: 50000, memo: '온라인 쇼핑' },
    { cat: '기타', amt: 12000, memo: '잡화' },
  ];
  const txs = samples.map((s, i) => ({
    id: (Date.now() + i).toString(),
    amount: s.amt,
    category: s.cat,
    memo: s.memo,
    date: new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - i)).toISOString(),
  }));
  saveTx(txs);
}

seedSampleData();
render();
