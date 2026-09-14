/* STATE MANAGEMENT */
let currentLevel = 0;
const totalLevels = 5;

/* 1. AUTO-START AUDIO CONTROLLER 
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let isPlaying = false;   */


/* AUDIO CONTROLLER */
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let isPlaying = false;

function playAudio() {
  if (bgMusic && !isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add("playing");
    }).catch(err => {
      console.log("Autoplay was blocked by browser. Waiting for interaction:", err);
    });
  }
}

function toggleMusic() {
  if (!bgMusic) return;
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
    isPlaying = false;
  } else {
    playAudio();
  }
}

musicBtn.addEventListener("click", toggleMusic);

// 1. പേജ് ലോഡ് ആകുമ്പോൾ തന്നെ പ്ലേ ചെയ്യാൻ ട്രൈ ചെയ്യുന്നു:
window.addEventListener("DOMContentLoaded", () => {
  playAudio();
});

// 2. ബ്രൗസർ തടഞ്ഞാൽ, യൂസർ സ്ക്രീനിൽ ആദ്യമായി എവിടെയെങ്കിലും ഒരു തവണ തൊടുമ്പോൾ ഉടൻ പാട്ട് സ്റ്റാർട്ട് ആകും:
["click", "touchstart", "keydown"].forEach(event => {
  document.addEventListener(event, function startOnFirstGesture() {
    playAudio();
    // ഒറ്റത്തവണ വർക്ക് ചെയ്താൽ ലിസണർ റിമൂവ് ചെയ്യും
    document.removeEventListener(event, startOnFirstGesture);
  }, { once: true });
});
/* function playAudio() {
  if (!isPlaying && bgMusic) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add("playing");
    }).catch(err => {
      console.log("Autoplay waiting for first touch/interaction:", err);
    });
  }
}

function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
    isPlaying = false;
  } else {
    playAudio();
  }
}

musicBtn.addEventListener("click", toggleMusic);

// പേജ് ലോഡ് ആകുമ്പോൾ തന്നെ സ്വയം പ്ലേ ആക്കാൻ ശ്രമിക്കുന്നു:
window.addEventListener("load", () => {
  playAudio();
});

// ബ്രൗസർ ഓട്ടോപ്ലേ തടഞ്ഞാൽ, സ്ക്രീനിൽ ആദ്യമായി എവിടെയെങ്കിലും ഒരു തവണ തൊടുമ്പോൾ ഉടൻ പാട്ട് പ്ലേ ആകും:
document.body.addEventListener("click", function initOnFirstClick() {
  playAudio();
  document.body.removeEventListener("click", initOnFirstClick);
}, { once: true });                */

/* NAVIGATION CONTROLLER */
function updateProgress(lvl) {
  currentLevel = lvl;
  const percentage = (lvl / totalLevels) * 100;
  document.getElementById("progressFill").style.width = `${percentage}%`;
  document.getElementById("currentLevelText").innerText = `Level ${lvl} of ${totalLevels}`;
}

function goToLevel(lvl) {
  // പസിൽ ടൈമർ ഓടുന്നുണ്ടെങ്കിൽ ക്ലിയർ ചെയ്യാൻ
  if (lvl !== 2 && puzzleTimerInterval) {
    clearInterval(puzzleTimerInterval);
  }

  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`screen${lvl}`);
  if (target) target.classList.add("active");
  updateProgress(lvl);
  
  if (lvl === 2) initPuzzle();
  if (lvl === 4) initScratchCard();
}

/* 2. LEVEL 1: NOSTALGIA QUIZ */
function handleQuizAnswer(isCorrect) {
  const feedback = document.getElementById("quizFeedback");
  if (isCorrect) {
    feedback.innerText = "അടിപൊളി! നിനക്ക് ഇതെല്ലാം ഓർമ്മയുണ്ട് അല്ലേ? ❤️";
    triggerConfetti();
    setTimeout(() => goToLevel(2), 1200);
  }
}

/* 3. LEVEL 2: 3x3 PHOTO PUZZLE & TROLL OPTIONS */
let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const winningBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let puzzleTimerInterval = null;
let timeLeft = 45;
let puzzleSolved = false;

function initPuzzle() {
  puzzleSolved = false;
  timeLeft = 45;
  document.getElementById("timeUpOptions").classList.add("hidden");
  document.getElementById("puzzleNextBtn").classList.add("hidden");
  document.getElementById("puzzleStatus").innerText = "കഷ്ണങ്ങളിൽ ക്ലിക്ക് ചെയ്ത് ശരിയായ സ്ഥാനത്തേക്ക് മാറ്റുക";
  
  // ഷഫിൾ ചെയ്യുന്നു
  board = [1, 2, 0, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
  renderPuzzle();
  startPuzzleTimer();
}

function startPuzzleTimer() {
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
  
  const timerDisplay = document.getElementById("puzzleTimer");
  timerDisplay.innerText = `⏳ സമയം: ${timeLeft}s`;

  puzzleTimerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `⏳ സമയം: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(puzzleTimerInterval);
      if (!puzzleSolved) {
        showTimeUpTroll();
      }
    }
  }, 1000);
}

function showTimeUpTroll() {
  document.getElementById("timeUpOptions").classList.remove("hidden");
  document.getElementById("puzzleStatus").innerText = "സമയം കഴിഞ്ഞു!";
}

function giveExtraTime() {
  document.getElementById("timeUpOptions").classList.add("hidden");
  document.getElementById("puzzleStatus").innerText = "ശരി, 1 മിനിറ്റ് കൂടി തന്നു! വേഗം ചെയ്യ് 🔥";
  timeLeft = 60;
  startPuzzleTimer();
}

function autoSolvePuzzle() {
  clearInterval(puzzleTimerInterval);
  puzzleSolved = true;
  document.getElementById("timeUpOptions").classList.add("hidden");
  
  board = [...winningBoard];
  renderPuzzle(true);
  
  document.getElementById("puzzleStatus").innerText = "സാരമില്ല, ഞാൻ ശരിയാക്കി തന്നു! ഇനി മുന്നോട്ട് പോകാം ✨";
  document.getElementById("puzzleNextBtn").classList.remove("hidden");
  triggerConfetti();
}

function renderPuzzle(forceFull = false) {
  const container = document.getElementById("puzzleBoard");
  container.innerHTML = "";

  board.forEach((val, idx) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");

    if (val === 8 && !forceFull) {
      tile.classList.add("empty");
    } else {
      const row = Math.floor(val / 3);
      const col = val % 3;
      tile.style.backgroundPosition = `-${col * 88}px -${row * 88}px`;
      if (!forceFull) {
        tile.addEventListener("click", () => swapTiles(idx));
      }
    }
    container.appendChild(tile);
  });

  if (!forceFull) checkPuzzleWin();
}

function swapTiles(idx) {
  if (puzzleSolved) return;
  const emptyIdx = board.indexOf(8);
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
    puzzleSolved = true;
    clearInterval(puzzleTimerInterval);
    renderPuzzle(true);
    document.getElementById("timeUpOptions").classList.add("hidden");
    document.getElementById("puzzleStatus").innerText = "പൊളിച്ചു! സ്വന്തമായി തന്നെ സോൾവ് ചെയ്തു! 🎉";
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

/* 5. LEVEL 4: SCRATCH CARD & CIPHER */
let scratchInitialized = false;
function initScratchCard() {
  if (scratchInitialized) return;
  scratchInitialized = true;

  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    ctx.arc(x, y, 18, 0, Math.PI * 2);
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

/* 6. LEVEL 5: INTERACTIVE CAKE & CONFETTI */
let candleBlown = false;
function blowCandle() {
  if (candleBlown) return;
  candleBlown = true;
  document.getElementById("flame").style.display = "none";
  document.getElementById("cakeHint").innerText = "Yay! Happy Birthday! 🎉";
  triggerConfetti();
}

function triggerConfetti() {
  try {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  } catch (e) {}
}

function celebrateAgain() {
  triggerConfetti();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
