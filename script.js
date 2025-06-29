//Flappy Dragon
let attempts = [];
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const homeScreen = document.getElementById("homeScreen");
const playBtn = document.getElementById("playBtn");
const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const scoreText = document.getElementById("currentScore");
const bestText = document.getElementById("bestScore");
const startSign = document.getElementById("startSign");
const bgOverlay = document.getElementById("bgOverlay");
const livesDisplay = document.getElementById("livesDisplay");

// 🎵 Sounds (hosted)
const hitSound = new Audio("https://assets.mixkit.co/active_storage/sfx/213/213-preview.mp3");
const pointSound = new Audio("https://cdn.freesound.org/previews/350/350875_5450487-lq.mp3");
const bgMusic = new Audio("https://cdn.freesound.org/previews/545/545457_6714882-lq.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.2;

// Images
const pipeTopImg = new Image();
pipeTopImg.src = "https://i.postimg.cc/g0tkSq4h/upper-pipe-Copy.png";
const pipeBottomImg = new Image();
pipeBottomImg.src = "https://i.postimg.cc/hGtt138g/Lower-pipe-Copy.png";
const dragonImg = new Image();
dragonImg.src = "https://i.postimg.cc/ryY8ZNqM/New-Sprite.png";

let gravity = 0.3;
let flap = -6;
let pipeGap = 225;
let pipeWidth = 44;
let bird, pipes, score, gameOver, lives;
let highScore = localStorage.getItem("flappyHighScore") || 0;

function drawInitialFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(dragonImg, bird.x - 35, bird.y - 35, 70, 70);
}

function updateHearts() {
  livesDisplay.innerText = "❤️".repeat(lives);
}

function resetGame(isNew = false) {
  if (isNew) lives = 3;
  if (isNew) {
  lives = 3;
  attempts = []; // ✅ Clear old scores
}
  bird = { x: 50, y: 150, radius: 17.5, velocity: 0 };
  pipes = [];
  score = 0;
  gameOver = false;
  overlay.style.display = "none";
  bgOverlay.style.display = "block";
  startSign.style.display = "block";
  updateHearts();
  drawInitialFrame();
}

function startGame() {
  bgMusic.play();
  bgOverlay.style.display = "none";
  startSign.style.display = "none";
  bird.velocity = flap;
  update();
}

function update() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird.velocity += gravity;
  bird.y += bird.velocity;
  ctx.drawImage(dragonImg, bird.x - 35, bird.y - 35, 70, 70);

  if (!pipes.length || pipes[pipes.length - 1].x < canvas.width - 150) {
    let topH = Math.floor(Math.random() * 200) + 50;
    pipes.push({ x: canvas.width, topHeight: topH, bottomY: topH + pipeGap });
  }

  for (let p of pipes) {
    p.x -= 2;
    ctx.drawImage(pipeTopImg, p.x, 0, pipeWidth, p.topHeight);
    ctx.drawImage(pipeBottomImg, p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);
    if (
      bird.x + bird.radius > p.x &&
      bird.x - bird.radius < p.x + pipeWidth &&
      (bird.y - bird.radius < p.topHeight || bird.y + bird.radius > p.bottomY)
    ) return endGame();
    if (Math.floor(p.x + pipeWidth) == Math.floor(bird.x)) {
      score++;
      pointSound.play();
    }
  }

  if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) return endGame();

  const boxW = 110, boxH = 40, boxX = canvas.width - boxW - 10, boxY = 10;
  ctx.beginPath();
ctx.moveTo(boxX + 10, boxY);
ctx.lineTo(boxX + boxW - 10, boxY);
ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + 10);
ctx.lineTo(boxX + boxW, boxY + boxH - 10);
ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - 10, boxY + boxH);
ctx.lineTo(boxX + 10, boxY + boxH);
ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - 10);
ctx.lineTo(boxX, boxY + 10);
ctx.quadraticCurveTo(boxX, boxY, boxX + 10, boxY);
ctx.closePath();

ctx.fillStyle = "#fff";
ctx.fill();
ctx.strokeStyle = "#000";
ctx.stroke();
ctx.fillStyle = "black";
ctx.font = "20px sans-serif";
ctx.textAlign = "center";
ctx.fillText(`Score: ${score}`, boxX + boxW / 2, boxY + 26);

  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  lives--;
  updateHearts();
  hitSound.play();
  bgMusic.pause();

  attempts.push(score); // ✅ Store score from each attempt

  const isNewHigh = score > highScore;
  if (isNewHigh) {
    highScore = score;
    localStorage.setItem("flappyHighScore", highScore);
  }

  scoreText.innerText = `Score: ${score}`;
  bestText.innerText = isNewHigh
    ? `All time Best Score: ${highScore} 🏆`
    : `All time Best Score: ${highScore}`;

  if (lives === 0) {
    document.getElementById("gameOverText").innerText = "Game Over!";
    restartBtn.innerText = "Restart Game";

    // ✅ Show Best out of three
    const bestOfThree = Math.max(...attempts);
    document.getElementById("bestOutOfThree").innerText = `Best out of three: ${bestOfThree}`;
    document.getElementById("bestOutOfThree").style.display = "block";
  } else {
    document.getElementById("gameOverText").innerText = "You lost a life!";
    restartBtn.innerText = `Play Again (${lives})`;

    // ✅ Hide during non-final rounds
    document.getElementById("bestOutOfThree").style.display = "none";
  }

  restartBtn.style.display = "block";
  overlay.style.display = "flex";
}

// Input
canvas.setAttribute("tabindex", "0");
canvas.addEventListener("keydown", e => {
  if (!gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
    bird.velocity = flap;
  }
});
canvas.addEventListener("click", () => {
  if (!gameOver) {
    bird.velocity = flap;
  }
});
canvas.addEventListener("touchstart", () => {
  if (!gameOver) {
    bird.velocity = flap;
  }
});


playBtn.addEventListener("click", () => {
  homeScreen.style.display = "none";
  resetGame(true);
});
restartBtn.addEventListener("click", () => {
  const isOut = lives === 0;
  resetGame(isOut);
});
quitBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  homeScreen.style.display = "flex";
});
startSign.addEventListener("click", startGame);

function createParticle() {
  const particle = document.createElement("div");
  particle.classList.add("particle");
  particle.style.left = Math.random() * 100 + "vw";
  particle.style.animationDuration = (Math.random() * 3 + 3) + "s";
  particle.style.width = particle.style.height = Math.random() * 4 + 2 + "px";
  document.getElementById("particles").appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 6000);
}

setInterval(createParticle, 300);

