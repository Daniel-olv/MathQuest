// ============================================================
//  MATHQUEST — game.js
// ============================================================

// ============================================================
//  1. STARFIELD (fundo animado de estrelas)
// ============================================================
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 120 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.5 + 0.3,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.005
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a <= 0.1 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();


// ============================================================
//  2. ÁUDIO (sons de acerto, erro e vitória)
// ============================================================
function beep(type) {
  try {
    const AC  = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();

    if (type === 'correct') {
      // Melodia ascendente de 3 notas
      [[523, 0], [659, 0.12], [784, 0.24]].forEach(([freq, delay]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.35);
      });

    } else if (type === 'wrong') {
      // Tom grave descendente
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);

    } else if (type === 'win') {
      // Fanfarra de 4 notas
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.4);
        osc.start(ctx.currentTime + i * 0.14);
        osc.stop(ctx.currentTime + i * 0.14 + 0.45);
      });
    }
  } catch (e) {
    // Navegador pode bloquear áudio sem interação — ignora silenciosamente
  }
}


// ============================================================
//  3. BANCO DE PERGUNTAS
// ============================================================
const QUESTIONS = {
  easy: [
    { q: "Quanto é 2 + 2?",    opts: ["3","4","5","6"],           ans: 1, exp: "2 + 2 = 4. Basta somar os dois números!" },
    { q: "Quanto é 5 × 3?",    opts: ["12","15","18","20"],        ans: 1, exp: "5 × 3 significa somar 5 três vezes: 5+5+5 = 15." },
    { q: "Quanto é 10 ÷ 2?",   opts: ["3","4","5","6"],           ans: 2, exp: "10 ÷ 2 = 5. Dividir 10 em 2 partes iguais dá 5 cada." },
    { q: "Quanto é 8 - 3?",    opts: ["4","5","6","7"],           ans: 1, exp: "8 - 3 = 5. Subtraímos 3 de 8." },
    { q: "Quanto é 7 + 9?",    opts: ["15","16","17","18"],        ans: 1, exp: "7 + 9 = 16." },
    { q: "Quanto é 4 × 4?",    opts: ["12","14","16","18"],        ans: 2, exp: "4 × 4 = 16. Quatro vezes quatro é dezesseis." },
    { q: "Quanto é 20 ÷ 4?",   opts: ["4","5","6","7"],           ans: 1, exp: "20 ÷ 4 = 5. Vinte dividido por quatro é cinco." },
    { q: "Quanto é 15 - 7?",   opts: ["7","8","9","10"],          ans: 1, exp: "15 - 7 = 8." },
    { q: "Quanto é 6 × 7?",    opts: ["36","40","42","48"],        ans: 2, exp: "6 × 7 = 42. Seis vezes sete é quarenta e dois." },
    { q: "Quanto é 100 ÷ 5?",  opts: ["15","20","25","30"],        ans: 1, exp: "100 ÷ 5 = 20. Cem dividido por cinco é vinte." },
  ],
  medium: [
    { q: "Quanto é 25% de 200?",                              opts: ["20","50","100","25"],          ans: 1, exp: "25% de 200 = 200 × 0,25 = 50. Dividimos 200 por 4!" },
    { q: "Qual é ½ de 80?",                                   opts: ["30","35","40","45"],           ans: 2, exp: "½ de 80 = 80 ÷ 2 = 40." },
    { q: "Se tenho R$120 e gasto 30%, quanto sobra?",         opts: ["R$80","R$84","R$86","R$90"],   ans: 1, exp: "30% de 120 = 36. Então 120 - 36 = R$84." },
    { q: "Qual é 10% de 350?",                                opts: ["30","35","40","45"],           ans: 1, exp: "10% é só dividir por 10: 350 ÷ 10 = 35." },
    { q: "¾ de 48 é igual a:",                                opts: ["32","34","36","40"],           ans: 2, exp: "¾ de 48: 48÷4=12, depois 12×3 = 36." },
    { q: "Produto custava R$50 e subiu 20%. Quanto custa?",   opts: ["R$55","R$60","R$65","R$70"],   ans: 1, exp: "20% de 50 = 10. Então 50 + 10 = R$60." },
    { q: "Quanto é 2/5 de 100?",                              opts: ["20","30","40","50"],           ans: 2, exp: "2/5 de 100 = 100 ÷ 5 × 2 = 40." },
    { q: "Qual é 50% de 90?",                                 opts: ["40","45","50","55"],           ans: 1, exp: "50% é metade. 90 ÷ 2 = 45." },
    { q: "15% de desconto em R$80, quanto paga?",             opts: ["R$62","R$65","R$68","R$72"],   ans: 2, exp: "15% de 80 = 12. Então 80 - 12 = R$68." },
    { q: "Qual é 1/3 de 99?",                                 opts: ["27","30","33","36"],           ans: 2, exp: "1/3 de 99 = 99 ÷ 3 = 33." },
  ],
  hard: [
    { q: "Resolva: 2x + 6 = 14. Qual é x?",                        opts: ["3","4","5","6"],                    ans: 1, exp: "2x + 6 = 14 → 2x = 8 → x = 4." },
    { q: "Área de um quadrado de lado 7cm?",                        opts: ["14cm²","21cm²","42cm²","49cm²"],    ans: 3, exp: "Área = lado² = 7² = 49cm²." },
    { q: "R$80 é 80% do preço. Qual é o preço original?",           opts: ["R$96","R$100","R$104","R$110"],     ans: 1, exp: "original = 80 ÷ 0,8 = R$100." },
    { q: "Área de um triângulo com base 8 e altura 5?",             opts: ["16","20","24","40"],                ans: 1, exp: "Área = (8×5)÷2 = 20." },
    { q: "Resolva: x² = 25. Qual é x (positivo)?",                  opts: ["4","5","6","7"],                   ans: 1, exp: "x = √25 = 5, pois 5×5 = 25." },
    { q: "Perímetro de um retângulo 6×4?",                          opts: ["20","22","24","26"],                ans: 0, exp: "Perímetro = 2×(6+4) = 20." },
    { q: "R$1000 a 10% ao ano. Valor após 1 ano?",                  opts: ["R$1050","R$1080","R$1100","R$1120"], ans: 2, exp: "1000 × 1,10 = R$1100." },
    { q: "Resolva: 3x - 9 = 0. Qual é x?",                         opts: ["2","3","4","5"],                   ans: 1, exp: "3x = 9 → x = 3." },
    { q: "Volume de um cubo com aresta 3?",                         opts: ["9","18","27","36"],                 ans: 2, exp: "Volume = 3³ = 27." },
    { q: "R$500 a 5% a.a. simples para virar R$625. Quanto tempo?", opts: ["3 anos","4 anos","5 anos","6 anos"], ans: 2, exp: "Juros=125, 25/ano → 5 anos." },
  ]
};


// ============================================================
//  4. ESTADO DO JOGO
// ============================================================
let phase;       // 'easy' | 'medium' | 'hard'
let questions;   // array com as 5 perguntas sorteadas
let idx;         // índice da pergunta atual
let score;       // pontuação acumulada
let correct;     // total de acertos
let wrong;       // total de erros


// ============================================================
//  5. NAVEGAÇÃO ENTRE TELAS
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });
  const el = document.getElementById(id);
  if (id === 'game') {
    el.style.display = 'flex';
  } else {
    el.style.display = 'block';
    el.classList.add('active');
  }
}

// Abre a tela de seleção de fases (antiga Home)
function showPhaseSelection() {
  showScreen('home');
}

// Abre a tela de Boas-Vindas e Créditos
function showWelcome() {
  showScreen('welcome');
}

function showHome() {
  showScreen('home');
}


// ============================================================
//  6. INICIAR / REINICIAR JOGO
// ============================================================
function startGame(p) {
  phase     = p;
  questions = [...QUESTIONS[p]].sort(() => Math.random() - 0.5).slice(0, 5);
  idx       = 0;
  score     = 0;
  correct   = 0;
  wrong     = 0;

  const labels = { easy: 'Fase 1 — Fácil', medium: 'Fase 2 — Médio', hard: 'Fase 3 — Difícil' };
  const badges = { easy: 'badge-easy',      medium: 'badge-medium',   hard: 'badge-hard' };

  document.getElementById('phase-badge').textContent = labels[p];
  document.getElementById('phase-badge').className   = 'phase-badge-header ' + badges[p];
  document.getElementById('score-val').textContent   = '0';
  document.getElementById('game-body').className     = 'game-body phase-' + p;

  showScreen('game');
  renderQ();
}

function restartGame() {
  startGame(phase);
}


// ============================================================
//  7. RENDERIZAR PERGUNTA
// ============================================================
function renderQ() {
  const q     = questions[idx];
  const total = questions.length;

  // Atualiza contador e barra de progresso
  document.getElementById('q-counter').textContent   = `PERGUNTA ${idx + 1} DE ${total}`;
  document.getElementById('prog').style.width        = (idx / total * 100) + '%';
  document.getElementById('q-text').textContent      = q.q;

  // Limpa feedback e botão "próxima"
  const fb = document.getElementById('feedback');
  fb.className  = 'feedback';
  fb.textContent = '';

  document.getElementById('next-wrap').className = 'next-wrap';

  // Monta as opções
  const grid = document.getElementById('opts');
  grid.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach((letra, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.innerHTML = `<span class="opt-key">${letra}</span>${q.opts[i]}`;
    btn.onclick   = () => pick(i, btn);
    grid.appendChild(btn);
  });
}


// ============================================================
//  8. RESPONDER PERGUNTA
// ============================================================
function pick(i, btn) {
  const q = questions[idx];

  // Desabilita todos os botões
  document.querySelectorAll('.opt').forEach(b => (b.disabled = true));

  const flash = document.getElementById('flash');

  if (i === q.ans) {
    // ---- ACERTO ----
    correct++;
    const pts = phase === 'easy' ? 10 : phase === 'medium' ? 20 : 30;
    score += pts;

    document.getElementById('score-val').textContent = score;
    btn.classList.add('correct');

    flash.style.background = 'rgba(64,145,108,0.15)';
    flash.style.opacity = '1';
    setTimeout(() => (flash.style.opacity = '0'), 350);

    const fb = document.getElementById('feedback');
    fb.className   = 'feedback show-correct';
    fb.textContent = '✅ Correto! ' + q.exp;

    beep('correct');
    spawnPts('+' + pts, btn);

  } else {
    // ---- ERRO ----
    wrong++;
    btn.classList.add('wrong');
    document.querySelectorAll('.opt')[q.ans].classList.add('correct');

    flash.style.background = 'rgba(211,47,47,0.15)';
    flash.style.opacity = '1';
    setTimeout(() => (flash.style.opacity = '0'), 350);

    const fb = document.getElementById('feedback');
    fb.className   = 'feedback show-wrong';
    fb.textContent = '❌ Não foi dessa vez! ' + q.exp;

    beep('wrong');
  }

  // Mostra botão "próxima"
  document.getElementById('next-wrap').className = 'next-wrap show';
  document.getElementById('btn-next').textContent =
    idx + 1 >= questions.length ? 'Ver resultado →' : 'Próxima questão →';
}


// ============================================================
//  9. ANIMAÇÃO DE PONTOS FLUTUANTES
// ============================================================
function spawnPts(text, ref) {
  const el  = document.createElement('div');
  el.className   = 'float-pt';
  el.textContent = text;

  const r = ref.getBoundingClientRect();
  el.style.left = r.left + r.width / 2 - 20 + 'px';
  el.style.top  = r.top - 10 + 'px';

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}


// ============================================================
//  10. AVANÇAR PARA PRÓXIMA PERGUNTA
// ============================================================
function nextQ() {
  idx++;
  if (idx >= questions.length) {
    endGame();
  } else {
    renderQ();
  }
}


// ============================================================
//  11. TELA DE RESULTADO FINAL
// ============================================================
function endGame() {
  const pct = correct / questions.length;

  let stars, title, sub;
  if (pct >= 0.9) {
    stars = '⭐⭐⭐';
    title = 'Incrível! Você é um gênio!';
    sub   = 'Desempenho perfeito! Continue assim!';
  } else if (pct >= 0.6) {
    stars = '⭐⭐';
    title = 'Muito bem!';
    sub   = 'Quase perfeito! Mais um pouco de prática!';
  } else {
    stars = '⭐';
    title = 'Continue praticando!';
    sub   = 'Cada erro é uma chance de aprender. Vai de novo!';
  }

  const labels = { easy: 'Fase 1 — Fácil', medium: 'Fase 2 — Médio', hard: 'Fase 3 — Difícil' };

  document.getElementById('r-phase').textContent   = labels[phase];
  document.getElementById('r-stars').textContent   = stars;
  document.getElementById('r-title').textContent   = title;
  document.getElementById('r-sub').textContent     = sub;
  document.getElementById('r-score').textContent   = score;
  document.getElementById('r-correct').textContent = correct;
  document.getElementById('r-wrong').textContent   = wrong;

  showScreen('result');
  if (pct >= 0.6) beep('win');
}