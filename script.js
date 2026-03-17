// Game configuration and state variables
const GOAL_CANS = 25;
const GAME_SECONDS = 30;
const WIN_THRESHOLD = 20;
let currentCans = 0;
let timeLeft = GAME_SECONDS;
let gameActive = false;
let spawnInterval;
let timerInterval;
let bestScore = Number(localStorage.getItem("waterQuestBest") || "0");

const scoreEl = document.getElementById("current-cans");
const timerEl = document.getElementById("timer");
const bestScoreEl = document.getElementById("best-score");
const achievementEl = document.getElementById("achievements");
const startBtn = document.getElementById("start-game");
const gridEl = document.querySelector(".game-grid");
const statusFillEl = document.getElementById("status-fill");

function updateBestScore() {
  bestScoreEl.textContent = String(bestScore).padStart(2, "0");
}

function updateStatusBar() {
  const progress = Math.max(0, Math.min(100, (currentCans / GOAL_CANS) * 100));
  statusFillEl.style.width = `${progress}%`;
}

function updateScore() {
  scoreEl.textContent = String(currentCans);
  updateStatusBar();
}

function updateTimer() {
  timerEl.textContent = String(timeLeft);
}

function createGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    gridEl.appendChild(cell);
  }
}

function spawnTarget() {
  if (!gameActive) return;

  const cells = document.querySelectorAll(".grid-cell");

  cells.forEach((cell) => {
    cell.innerHTML = "";
  });

  const randomCell = cells[Math.floor(Math.random() * cells.length)];
  const showRock = Math.random() < 0.3;

  if (showRock) {
    randomCell.innerHTML = `
      <div class="rock-wrapper">
        <div class="rock" aria-label="rock"></div>
      </div>
    `;
    return;
  }

  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can" aria-label="water can"></div>
    </div>
  `;
}

function saveBestScore() {
  if (currentCans > bestScore) {
    bestScore = currentCans;
    localStorage.setItem("waterQuestBest", String(currentCans));
  }
  updateBestScore();
  return bestScore;
}

function goToRestartPage() {
  const bestScore = saveBestScore();
  const params = new URLSearchParams({
    ended: "1",
    score: String(currentCans),
    best: String(bestScore),
    goal: String(GOAL_CANS),
    win: String(WIN_THRESHOLD)
  });
  window.location.href = `restart.html?${params.toString()}`;
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  goToRestartPage();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimer();
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimer();
      endGame();
    }
  }, 1000);
}

function startGame() {
  if (gameActive) return;

  gameActive = true;
  currentCans = 0;
  timeLeft = GAME_SECONDS;
  updateScore();
  updateTimer();
  createGrid();

  startBtn.disabled = true;
  startBtn.textContent = "Game Running";
  achievementEl.textContent = "Tap cans to collect drops.";

  spawnTarget();
  spawnInterval = setInterval(spawnTarget, 750);
  startTimer();
}

function adjustScore(delta, message) {
  currentCans = Math.max(0, currentCans + delta);
  if (currentCans > bestScore) {
    bestScore = currentCans;
    localStorage.setItem("waterQuestBest", String(bestScore));
    updateBestScore();
  }
  updateScore();
  achievementEl.textContent = message;
}

gridEl.addEventListener("click", (event) => {
  if (!gameActive) return;

  const can = event.target.closest(".water-can");
  if (can) {
    adjustScore(1, "hit");
    can.parentElement.innerHTML = "";
    return;
  }

  const rock = event.target.closest(".rock");
  if (!rock) return;

  adjustScore(-2, "Rock hit: -2 points.");
  rock.parentElement.innerHTML = "";
});

updateScore();
updateTimer();
updateBestScore();
createGrid();
startBtn.addEventListener("click", startGame);
