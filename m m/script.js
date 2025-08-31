const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const progressEl = document.getElementById("progress");
const restartBtn = document.getElementById("restart");
const againBtn = document.getElementById("again");
const banner = document.getElementById("gameover");
const finalText = document.getElementById("finalText");
const difficultySel = document.getElementById("difficulty");
const bestEl = document.getElementById("best");

const CELLS = 9,
  COLS = 3;
let score = 0,
  activeIndex = -1,
  prevIndex = -1;
let ballEl = null;
let timeLeft = 20;
let moveIntervalId = null,
  secondTimerId = null;
let running = false;

const BEST_KEY = "react-game-best";
const bestSaved = Number(localStorage.getItem(BEST_KEY) || 0);
bestEl.textContent = `Rekord: ${bestSaved}`;

// Daraja sozlamalari: to'pning katakdan katakka o'tish periodi
const PERIODS = {
  easy: 1400,
  normal: 1100,
  hard: 800,
};

// Panjara yaratish
for (let i = 0; i < CELLS; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.index = i;
  cell.addEventListener("click", () => handleClick(i, cell));
  game.appendChild(cell);
}

function handleClick(i, cell) {
  if (!running) return;
  if (i !== activeIndex) return;

  // Ochko: 1–9
  const pts = Math.floor(Math.random() * 9) + 1;
  score += pts;
  scoreEl.textContent = `Ball: ${score}`;

  // +N pop-ani
  const pop = document.createElement("div");
  pop.className = "points show";
  pop.textContent = `+${pts}`;
  cell.appendChild(pop);
  setTimeout(() => pop.remove(), 820);
}

function indexToRC(i) {
  return { r: Math.floor(i / COLS), c: i % COLS };
}

function moveBall(toIndex, fromIndex) {
  const cells = document.querySelectorAll(".cell");
  const target = cells[toIndex];

  if (!ballEl) {
    ballEl = document.createElement("div");
    ballEl.className = "ball";
    target.appendChild(ballEl);
    activeIndex = toIndex;
    return;
  }

  const from = indexToRC(fromIndex);
  const to = indexToRC(toIndex);
  const dx = to.c - from.c;
  const dy = to.r - from.r;

  const exitX = 50 + dx * 100;
  const exitY = 50 + dy * 100;
  const enterX = 50 - dx * 100;
  const enterY = 50 - dy * 100;

  // chiqish (eski katak ichidan chetiga)
  ballEl.animate(
    [
      { left: "50%", top: "50%" },
      { left: exitX + "%", top: exitY + "%" },
    ],
    { duration: 230, fill: "forwards", easing: "ease-in" }
  ).onfinish = () => {
    ballEl.remove();
    ballEl = document.createElement("div");
    ballEl.className = "ball";
    target.appendChild(ballEl);
    ballEl.style.left = enterX + "%";
    ballEl.style.top = enterY + "%";

    // kirish (yangi katakka qarama-qarshi tomondan)
    ballEl.animate(
      [
        { left: enterX + "%", top: enterY + "%" },
        { left: "50%", top: "50%" },
      ],
      { duration: 230, fill: "forwards", easing: "ease-out" }
    );
  };

  activeIndex = toIndex;
}

function activateNext() {
  prevIndex = activeIndex;
  let next;
  do {
    next = Math.floor(Math.random() * CELLS);
  } while (next === prevIndex);
  moveBall(next, prevIndex);
}

function startRound() {
  clearTimers();
  score = 0;
  timeLeft = 20;
  scoreEl.textContent = `Ball: ${score}`;
  timerEl.textContent = `Vaqt: ${timeLeft}s`;
  progressEl.style.transform = `scaleX(1)`;
  banner.style.display = "none";

  running = true;
  // birinchi ball
  activateNext();

  // darajaga qarab to‘p ko‘chish periodi
  const period = PERIODS[difficultySel.value] || PERIODS.normal;
  moveIntervalId = setInterval(activateNext, period);

  // sekundomer + progress line
  secondTimerId = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) return;
    timerEl.textContent = `Vaqt: ${timeLeft}s`;
    const p = Math.max(0, timeLeft / 20);
    progressEl.style.transform = `scaleX(${p})`;

    if (timeLeft <= 0) {
      endRound();
    }
  }, 1000);
}

function endRound() {
  running = false;
  clearTimers();
  // Rekordni yangilash
  const best = Number(localStorage.getItem(BEST_KEY) || 0);
  if (score > best) {
    localStorage.setItem(BEST_KEY, String(score));
    bestEl.textContent = `Rekord: ${score}`;
  }
  finalText.textContent = `O‘yin tugadi! Yakuniy ball: ${score}`;
  banner.style.display = "flex";
}

function clearTimers() {
  if (moveIntervalId) {
    clearInterval(moveIntervalId);
    moveIntervalId = null;
  }
  if (secondTimerId) {
    clearInterval(secondTimerId);
    secondTimerId = null;
  }
}

function hardResetBall() {
  // kataklardan to‘pni tozalash
  if (ballEl && ballEl.parentElement) ballEl.parentElement.removeChild(ballEl);
  ballEl = null;
  activeIndex = -1;
  prevIndex = -1;
}

function restart() {
  hardResetBall();
  startRound();
}

restartBtn.addEventListener("click", restart);
againBtn.addEventListener("click", restart);
difficultySel.addEventListener("change", () => {
  // daraja o‘zgarsa, davrni yangilaymiz
  if (running) {
    clearInterval(moveIntervalId);
    const period = PERIODS[difficultySel.value] || PERIODS.normal;
    moveIntervalId = setInterval(activateNext, period);
  }
});

// Avto start
startRound();
