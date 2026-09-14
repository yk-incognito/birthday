/* STATE MANAGEMENT */
let currentLevel = 0;
const totalLevels = 5;

/* 1. AUDIO CONTROLLER */
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let isPlaying = false;

function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
  } else {
    bgMusic.play().catch(() => {});
    musicBtn.classList.add("playing");
  }
  isPlaying = !isPlaying;
}

musicBtn.addEventListener("click", toggleMusic);

/* NAVIGATION CONTROLLER */
function updateProgress(lvl) {
  currentLevel = lvl;
  const percentage = (lvl / totalLevels) * 100;
  document.getElementById("progressFill").style.width = `${percentage}%`;
  document.getElementById("currentLevelText").innerText = `Level ${lvl} of ${totalLevels}`;
}

function goToLevel(lvl) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`screen${lvl}`);
  if (target) target.classList.add("active");
  updateProgress(lvl);
  
  if (lvl === 2) initPuzzle();
  if (lvl === 4) initScratchCard();
}

function startQuest() {
  // Start music on user interaction
  if (!isPlaying) toggleMusic();
  goToLevel(1);
}

/* 2. LEVEL 1: NOSTALGIA QUIZ */
function handleQuizAnswer(isCorrect) {
  const feedback = document.getElementById("quizFeedback");
  if (isCorrect) {
    feedback.innerText = "അടിപൊളി! നിനക്ക് ഇതെല്ലാം ഓർമ്മയുണ്ട് അല്ലേ? ❤️";
    triggerConfetti();
    setTimeout(() => goToLevel(2), 1500);
  }
}

/* 3. LEVEL 2: 3x3 SLIDING PHOTO PUZZLE */
let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const winningBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function initPuzzle() {
  // Shuffle puzzle solvably
  board = [1, 2, 0, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
  renderPuzzle();
}

function renderPuzzle() {
  const container = document.getElementById("puzzleBoard");
  container.innerHTML = "";

  board.forEach((val, idx) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    if (val === 8) {
      tile.classList.add("empty");
    } else {
      // Calculate background offset for 3x3
      const row = Math.floor(val / 3);
      const col = val % 3;
      tile.style.backgroundPosition = `-${col * 88}px -${row * 88}px`;
      tile.addEventListener("click", () => swapTiles(idx));
    }
    container.appendChild(tile);
  });

  checkPuzzleWin();
}

function swapTiles(idx) {
  const emptyIdx = board.indexOf(8);
  const validMoves = [
    idx - 1, // Left
    idx + 1, // Right
    idx - 3, // Up
    idx + 3  // Down
  ];

  // Prevent row wrapping jumps
  const isRowAdjacent = Math.floor(idx / 3) === Math.floor(emptyIdx / 3) && Math.abs(idx - emptyIdx) === 1;
  const isColAdjacent = Math.abs(idx - emptyIdx) === 3;

  if (isRowAdjacent || isColAdjacent) {
    [board[idx], board[emptyIdx]] = [board[emptyIdx], board[idx]];
    renderPuzzle();
  }
}

function checkPuzzleWin() {
  const isSolved = board.every((val, idx) => val === winningBoard[idx]);
  if (isSolved) {
    document.getElementById("puzzleStatus").innerText = "പൊളിച്ചു! പസിൽ പൂർത്തിയായി ✨";
    document.getElementById("puzzleNextBtn").classList.remove("hidden");
    triggerConfetti();
  }
}

/* 4. LEVEL 3: RUNAWAY 'NO' BUTTON TRAP */
const noBtn = document.getElementById("noBtn");
const trapBox = document.getElementById("trapBox");

function moveNoButton(e) {
  if (e) e.preventDefault();
  const boxWidth = trapBox.clientWidth - noBtn.offsetWidth;
  const boxHeight = trapBox.clientHeight - noBtn.offsetHeight;

  const randomX = Math.floor(Math.random() * Math.max(boxWidth, 80));
  const randomY = Math.floor(Math.random() * Math.max(boxHeight, 80));

  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
}

noBtn.addEventListener("mouseover", moveNoButton);
noBtn.addEventListener("touchstart", moveNoButton);

function handleYesTrap() {
  triggerConfetti();
  alert("ഞാൻ പറഞ്ഞില്ലേ! സത്യം എപ്പോഴും ജയിക്കും! 😍");
  goToLevel(4);
}

/* 5. LEVEL 4: SCRATCH CARD LOGIC */
let scratchInitialized = false;
function initScratchCard() {
  if (scratchInitialized) return;
  scratchInitialized = true;

  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d");

  // Fill canvas with grey scratch cover
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add decorative label
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#374151";
  ctx.textAlign = "center";
  ctx.fillText("Scratch Here 🪙", canvas.width / 2, canvas.height / 2 + 5);

  let isScratching = false;

  function scratch(e) {
    if (!isScratching) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener("mousedown", () => (isScratching = true));
  canvas.addEventListener("mouseup", () => (isScratching = false));
  canvas.addEventListener("mousemove", scratch);

  canvas.addEventListener("touchstart", (e) => {
    isScratching = true;
    scratch(e);
  });
  canvas.addEventListener("touchend", () => (isScratching = false));
  canvas.addEventListener("touchmove", scratch);
}

function verifySecretCode() {
  const enteredCode = document.getElementById("secretInput").value.trim().toUpperCase();
  const errorElement = document.getElementById("codeError");

  if (enteredCode === "BDAY2026") {
    errorElement.innerText = "";
    triggerConfetti();
    goToLevel(5);
  } else {
    errorElement.innerText = "തെറ്റായ കോഡ്! കാർഡിൽ തെളിഞ്ഞ കോഡ് ശ്രദ്ധിച്ചു നോക്കൂ.";
  }
}

/* 6. LEVEL 5: CAKE & CELEBRATION */
let candleBlown = false;
function blowCandle() {
  if (candleBlown) return;
  candleBlown = true;
  document.getElementById("flame").style.display = "none";
  document.getElementById("cakeHint").innerText = "Yay! Happy Birthday! 🎉";
  triggerConfetti();
}

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function celebrateAgain() {
  triggerConfetti();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
