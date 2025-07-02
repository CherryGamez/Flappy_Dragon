// Flappy Dragon
window.addEventListener("DOMContentLoaded", () => {
    const tutorialOverlay = document.getElementById("tutorialOverlay");
    const startTutorialBtn = document.getElementById("startTutorialBtn");

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let attempts = [];
    let dragonSize = canvas.height * 0.12;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dragonSize = canvas.height * 0.12; // update size when screen changes
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    let pipeWidth = canvas.width * 0.075; // 10% of screen width
    let pipeGap = canvas.height * 0.40; // 25% vertical space between pipes
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

    let gravity = 0.20;
    let flap = -6;
    let bird,
    pipes,
    score,
    gameOver,
    lives;
    let highScore = localStorage.getItem("flappyHighScore") || 0;

    function drawInitialFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let dragonSize = canvas.height * 0.12;
        ctx.drawImage(dragonImg, bird.x - dragonSize / 2, bird.y - dragonSize / 2, dragonSize, dragonSize);
    }

    function updateHearts() {
        livesDisplay.innerText = "❤️".repeat(lives);
    }

    function resetGame(isNew = false) {
        if (isNew)
            lives = 3;
        if (isNew) {
            lives = 3;
            attempts = []; // ✅ Clear old scores
        }
        bird = {
            x: 125,
            y: 250,
            radius: 17.5,
            velocity: 0
        };
        pipes = [];
        score = 0;
        gameOver = false;
        overlay.style.display = "none";
        bgOverlay.style.display = "block";
        startSign.style.display = "block";
        updateHearts();
        drawInitialFrame();
    }

    startTutorialBtn.addEventListener("click", () => {
        tutorialOverlay.style.display = "none";
        resetGame(true);
    });

    function startGame() {
        bgMusic.play();
        bgOverlay.style.display = "none";
        startSign.style.display = "none";
        bird.velocity = flap;
        update();
    }
    let starTimer = 0;
    function update() {
        if (gameOver)
            return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bird.velocity += gravity;
        bird.y += bird.velocity;
        starTimer += 1;
        if (starTimer % 5 === 0) {
            // create 2 sparkles every few frames
            for (let i = 0; i < 2; i++) {
                createStarTrail(bird.x, bird.y + (Math.random() * 20 - 10));
            }
        }
        let dragonSize = canvas.height * 0.12; // or tweak 0.15 if you want it bigger
        ctx.drawImage(dragonImg, bird.x - dragonSize / 2, bird.y - dragonSize / 2, dragonSize, dragonSize);

        if (!pipes.length || pipes[pipes.length - 1].x < canvas.width - 250) {
            let topH = Math.floor(Math.random() * 200) + 50;
            pipes.push({
                x: canvas.width,
                topHeight: topH,
                bottomY: topH + pipeGap
            });
        }

        for (let p of pipes) {
            p.x -= canvas.width * 0.003;
            ctx.drawImage(pipeTopImg, p.x, 0, pipeWidth, p.topHeight);
            ctx.drawImage(pipeBottomImg, p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);
            if (
                bird.x + bird.radius > p.x &&
                bird.x - bird.radius < p.x + pipeWidth &&
                (bird.y - bird.radius < p.topHeight || bird.y + bird.radius > p.bottomY))
                return endGame();
            if (!p.scored && p.x + pipeWidth < bird.x) {
                p.scored = true;
                score++;
                pointSound.play();
            }
        }

        if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0)
            return endGame();

        const boxW = 110,
        boxH = 40,
        boxX = canvas.width - boxW - 10,
        boxY = 10;
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
        ctx.fillText(`Punkte: ${score}`, boxX + boxW / 2, boxY + 26);

        requestAnimationFrame(update);
    }
	// this method ends the game
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

        scoreText.innerText = `Punkte: ${score}`;
        bestText.innerText = isNewHigh
            ? `Allzeit-Bestpunktzahl: ${highScore} 🏆`
            : `Allzeit-Bestpunktzahl: ${highScore}`;


        if (lives === 0) {
            document.getElementById("gameOverText").innerText = "Game Over!";
            restartBtn.innerText = " Neu starten!";

            // ✅ Show Best out of three
            const bestOfThree = Math.max(...attempts);
            document.getElementById("bestOutOfThree").innerText = `Bestes von drei: ${bestOfThree}`;
            document.getElementById("bestOutOfThree").style.display = "block";
        } else {
           document.getElementById("gameOverText").innerText = "Du hast ein Leben verloren!";
		   restartBtn.innerText = `Erneut spielen (${lives})`;


            // ✅ Hide during non-final rounds
            document.getElementById("bestOutOfThree").style.display = "none";
        }

        restartBtn.style.display = "block";
        overlay.style.display = "flex";
    }
	  function createParticle() {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Randomly choose color
        const colorClass = Math.random() < 0.5 ? "white" : "gold";
        particle.classList.add(colorClass);

        // Random size
        const size = Math.random() * 6 + 6; // 6px to 12px
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        particle.style.left = Math.random() * 100 + "vw";
        particle.style.animationDuration = (Math.random() * 3 + 3) + "s";

        document.getElementById("particles").appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 6000);
    }

    setInterval(createParticle, 300);

    function createStarTrail(x, y) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("starWrapper");

        const star = document.createElement("div");
        star.classList.add("starTrail");
        const colorClass = Math.random() < 0.5 ? "white" : "gold";
        star.classList.add(colorClass);

        const size = Math.random() * 12 + 4;
        star.style.width = size + "px";
        star.style.height = size + "px";

        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        const screenX = rect.left + x * scaleX;
        const screenY = rect.top + y * scaleY;
        const jitterY = Math.random() * 20 - 10;

        wrapper.style.left = `${screenX}px`;
        wrapper.style.top = `${screenY}px`;
        wrapper.style.transform = `translateY(${jitterY}px)`;

        wrapper.appendChild(star);
        document.getElementById("starTrail").appendChild(wrapper);

        setTimeout(() => wrapper.remove(), 800);
    }
	// Event Listeners
    // Input
    canvas.setAttribute("tabindex", "0");
    canvas.addEventListener("keydown", e => {
        if (!gameOver && (e.code === "Space" || e.code === "ArrowUp")) {
            bird.velocity = flap;
            for (let i = 0; i < 12; i++) {
                createStarTrail(bird.x - 50, bird.y + (Math.random() * 20 - 10));
            }
        }
    });
    canvas.addEventListener("click", () => {
        if (!gameOver) {
            bird.velocity = flap;
            for (let i = 0; i < 12; i++) {
                createStarTrail(bird.x - 50, bird.y + (Math.random() * 20 - 10)); // slight vertical jitter
            }
        }
    });
    canvas.addEventListener("touchstart", () => {
        if (!gameOver) {
            bird.velocity = flap;
            for (let i = 0; i < 12; i++) {
                createStarTrail(bird.x - 50, bird.y + (Math.random() * 20 - 10));
            }
        }
    });

    playBtn.addEventListener("click", () => {
        homeScreen.style.display = "none";
        tutorialOverlay.style.display = "none";
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

  

});