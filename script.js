const bird = document.querySelector(".bird-image");
const game = document.querySelector(".game");
const scoreDisplay = document.querySelector(".score-display");
const gameOverScreen = document.querySelector(".game-over-screen");
const finalScoreEl = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

// Game Constants & Physics Config
const GRAVITY = 0.20;   
const JUMP_FORCE = -6.5;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 1400; // milliseconds
const GAP_HEIGHT = 240; // gap size between top & bottom pipe

// Game State Variables
let birdY = 200;
let birdVelocity = 0;
let birdLeftPx = 100;
let score = 0;
let isGameOver = false;
let isGameStarted = false;
let pipes = [];
let animationFrameId = null;
let pipeIntervalId = null;

// Initialize bird starting position
function initBird() {
    const gameHeight = game.clientHeight;
    birdY = gameHeight / 2 - 25;
    birdVelocity = 0;
    birdLeftPx = Math.min(100, game.clientWidth * 0.2);
    bird.style.top = birdY + "px";
    bird.style.left = birdLeftPx + "px";
    bird.style.transform = "rotate(0deg)";
}

function startGame() {
    // Reset state
    isGameOver = false;
    isGameStarted = true;
    score = 0;
    scoreDisplay.textContent = score;
    gameOverScreen.classList.remove("active");

    // Clear old pipes from DOM
    pipes.forEach(pipe => {
        pipe.topElem.remove();
        pipe.bottomElem.remove();
    });
    pipes = [];

    // Reset bird position
    initBird();

    // Clear existing timers
    if (pipeIntervalId) clearInterval(pipeIntervalId);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Start timers and main game loop
    pipeIntervalId = setInterval(createPipe, PIPE_SPAWN_INTERVAL);
    gameLoop();
}

function jump() {
    if (!isGameStarted) {
        startGame();
        return;
    }
    if (isGameOver) return;

    birdVelocity = JUMP_FORCE;
}

function createPipe() {
    if (isGameOver || !isGameStarted) return;

    const gameHeight = game.clientHeight;
    const gameWidth = game.clientWidth;
    const pipeWidth = 80;

    // Calculate top and bottom pipe heights with margin
    const minPipeHeight = 50;
    const maxTopHeight = gameHeight - GAP_HEIGHT - minPipeHeight;
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minPipeHeight + 1)) + minPipeHeight;
    const bottomHeight = gameHeight - topHeight - GAP_HEIGHT;

    // Create DOM elements
    const pipeTop = document.createElement("div");
    const pipeBottom = document.createElement("div");

    pipeTop.classList.add("pipe", "pipe-top");
    pipeBottom.classList.add("pipe", "pipe-bottom");

    pipeTop.style.height = topHeight + "px";
    pipeBottom.style.height = bottomHeight + "px";
    pipeTop.style.left = gameWidth + "px";
    pipeBottom.style.left = gameWidth + "px";
    pipeTop.style.top = "0px";

    game.appendChild(pipeTop);
    game.appendChild(pipeBottom);

    pipes.push({
        topElem: pipeTop,
        bottomElem: pipeBottom,
        left: gameWidth,
        width: pipeWidth,
        topHeight: topHeight,
        bottomHeight: bottomHeight,
        passed: false
    });
}


function checkCollision(birdBox, pipe) {
    const pipeLeft = pipe.left;
    const pipeRight = pipe.left + pipe.width;
    const gameHeight = game.clientHeight;

    // Check if bird overlaps horizontally with this pipe
    if (birdBox.right > pipeLeft && birdBox.left < pipeRight) {
        // Collided with top pipe
        if (birdBox.top < pipe.topHeight) {
            return true;
        }
        // Collided with bottom pipe
        if (birdBox.bottom > gameHeight - pipe.bottomHeight) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (isGameOver) return;

    const gameHeight = game.clientHeight;

    // Apply physics
    birdVelocity += GRAVITY;
    birdY += birdVelocity;
    bird.style.top = birdY + "px";

    // Tilt bird based on velocity
    const rotation = Math.min(Math.max(birdVelocity * 4, -30), 70);
    bird.style.transform = `rotate(${rotation}deg)`;

    // Bird bounding box (pixels relative to container)
    const birdWidth = bird.clientWidth || 50;
    const birdHeight = bird.clientHeight || 50;
    const birdBox = {
        left: birdLeftPx,
        right: birdLeftPx + birdWidth,
        top: birdY,
        bottom: birdY + birdHeight
    };

    // Floor and Ceiling Collision
    if (birdBox.bottom >= gameHeight || birdBox.top <= 0) {
        endGame();
        return;
    }

    // Move pipes and check pipe collisions
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.left -= PIPE_SPEED;

        pipe.topElem.style.left = pipe.left + "px";
        pipe.bottomElem.style.left = pipe.left + "px";

        // Collision Check
        if (checkCollision(birdBox, pipe)) {
            endGame();
            return;
        }

        // Score Check (when bird passes pipe)
        if (!pipe.passed && pipe.left + pipe.width < birdLeftPx) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }

        // Remove off-screen pipes
        if (pipe.left + pipe.width < 0) {
            pipe.topElem.remove();
            pipe.bottomElem.remove();
            pipes.splice(i, 1);
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameOver = true;
    clearInterval(pipeIntervalId);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    finalScoreEl.textContent = score;
    gameOverScreen.classList.add("active");
}

// Event Listeners
game.addEventListener("click", () => {
    jump();
});

window.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
    }
});

restartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startGame();
});

window.addEventListener("keydown", (e) => {
    if(e.code === "Space"  && isGameOver){
        e.preventDefault();
        startGame();
    }
});

// Initial Setup
initBird();
