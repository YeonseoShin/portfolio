// WordSprint — 퀴즈 핵심 로직
let currentLevel = 'basic';
let currentIdx   = 0;
let words        = [];
let score        = 0;
let combo        = 0;
let bestCombo    = 0;
let correctCount = 0;
let timerInterval;
let timeLeft     = 10;
const TIMER_MAX  = 10;
let history      = [];

const HISTORY_KEY = 'wordsprint_history';

// ── 화면 전환 ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function showStart() { loadStartStats(); showScreen('screen-start'); }

// ── 게임 시작 ──
function startGame(level) {
  currentLevel = level;
  words        = shuffle([...WORDS[level]]).slice(0, 10);
  currentIdx   = 0;
  score        = 0;
  combo        = 0;
  bestCombo    = 0;
  correctCount = 0;
  history      = [];
  showScreen('screen-quiz');
  loadQuestion();
}

// ── 문제 로드 ──
function loadQuestion() {
  clearInterval(timerInterval);
  const word = words[currentIdx];

  document.getElementById('q-word').textContent = word.en;
  document.getElementById('q-pron').textContent = word.pron;
  document.getElementById('q-pos').textContent  = word.pos;
  document.getElementById('q-progress').textContent = `${currentIdx + 1} / ${words.length}`;
  document.getElementById('q-feedback').classList.add('hidden');

  // 콤보 표시
  const comboEl = document.getElementById('q-combo');
  if (combo >= 2) {
    comboEl.textContent = `🔥 콤보 ×${combo}`;
    comboEl.classList.remove('hidden');
  } else {
    comboEl.classList.add('hidden');
  }

  // 보기 생성: 오답 3개 + 정답 1개 섞기
  const wrong   = WORDS[currentLevel]
    .filter(w => w !== word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [...wrong, word].sort(() => Math.random() - 0.5);

  const container = document.getElementById('options');
  container.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className    = 'option-btn';
    btn.textContent  = c.ko;
    btn.dataset.correct = String(c === word);
    btn.addEventListener('click', () => handleAnswer(btn));
    container.appendChild(btn);
  });

  // 타이머 시작
  timeLeft = TIMER_MAX;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 3) document.getElementById('q-timer').classList.add('urgent');
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerUI() {
  document.getElementById('q-timer').textContent = `⏱ ${String(timeLeft).padStart(2,'0')}`;
  document.getElementById('timer-bar').style.width = (timeLeft / TIMER_MAX * 100) + '%';
  document.getElementById('timer-bar').style.background = timeLeft <= 3 ? '#dc2626' : '#059669';
}

// ── 답변 처리 ──
function handleAnswer(btn) {
  clearInterval(timerInterval);
  document.getElementById('q-timer').classList.remove('urgent');
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  const isCorrect = btn.dataset.correct === 'true';
  if (isCorrect) {
    combo++;
    bestCombo    = Math.max(bestCombo, combo);
    correctCount++;
    score       += 10 + (combo - 1) * 5; // 콤보 보너스
    btn.classList.add('correct');
    showFeedback(true, `+${10 + (combo - 1) * 5}점${combo > 1 ? ` (콤보 보너스 +${(combo-1)*5})` : ''}`);
  } else {
    combo = 0;
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn')
      .forEach(b => { if (b.dataset.correct === 'true') b.classList.add('correct'); });
    const ans = words[currentIdx].ko;
    showFeedback(false, `정답: ${ans}`);
  }

  history.push({ word: words[currentIdx].en, correct: isCorrect });
  setTimeout(nextQuestion, 1000);
}

function handleTimeout() {
  combo = 0;
  document.querySelectorAll('.option-btn')
    .forEach(b => { b.disabled = true; if (b.dataset.correct === 'true') b.classList.add('correct'); });
  showFeedback(false, `시간 초과! 정답: ${words[currentIdx].ko}`);
  history.push({ word: words[currentIdx].en, correct: false });
  setTimeout(nextQuestion, 1100);
}

function showFeedback(ok, msg) {
  const el = document.getElementById('q-feedback');
  el.textContent  = ok ? `✓ 정답! ${msg}` : `✗ 오답. ${msg}`;
  el.className    = `q-feedback ${ok ? 'ok' : 'fail'}`;
}

function nextQuestion() {
  currentIdx++;
  if (currentIdx >= words.length) { showResult(); return; }
  loadQuestion();
}

// ── 결과 화면 ──
function showResult() {
  saveHistory();
  const pct = Math.round(correctCount / words.length * 100);
  document.getElementById('r-score').textContent     = score;
  document.getElementById('r-correct').textContent   = `${correctCount}/${words.length}`;
  document.getElementById('r-best-combo').textContent= `×${bestCombo}`;
  document.getElementById('r-emoji').textContent     = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
  document.getElementById('r-title').textContent     = pct >= 80 ? '훌륭해요!' : pct >= 50 ? '잘 했어요!' : '계속 도전해요!';
  document.getElementById('r-history').innerHTML     = history.map(h =>
    `<div class="r-hist-item"><span class="r-hist-word">${h.word}</span><span class="r-hist-mark" style="color:${h.correct?'#059669':'#dc2626'}">${h.correct ? '✓' : '✗'}</span></div>`
  ).join('');
  showScreen('screen-result');
}

// ── localStorage 히스토리 ──
function saveHistory() {
  const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  prev.push({ date: new Date().toLocaleDateString('ko-KR'), level: currentLevel, score, correct: correctCount, total: words.length });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(prev.slice(-20)));
}

function loadStartStats() {
  const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const el   = document.getElementById('start-stats');
  if (!data.length) { el.textContent = '아직 플레이 기록이 없습니다.'; return; }
  const last = data[data.length - 1];
  el.textContent = `최근 기록: ${last.level} 레벨 · ${last.correct}/${last.total} 정답 · ${last.score}점`;
}

// ── 유틸 ──
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

// 시작
showStart();
