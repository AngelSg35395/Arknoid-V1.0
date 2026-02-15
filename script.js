const qs = (el => document.querySelector(el));

const canvas = qs("#canvas");
const ctx = canvas.getContext("2d");

// Modals And Buttons

const gameOverModal = qs("#game-over-dialog");
const restartGame = qs("#restart-btn");

const winModal = qs("#win-dialog");
const winRestartGame = qs("#win-restart-btn");

const welcomeModal = qs("#welcome-dialog");
const startGameBtn = qs("#start-btn");

const pauseModal = qs("#pause-dialog");
const pauseResumeBtn = qs("#resume-btn");

// Movil Buttons
const leftBtn = qs("#left-btn");
const rightBtn = qs("#right-btn");
const pauseBtn = qs("#pause-btn");

// Sounds
const gameOverSound = new Audio("./Assets/sounds/lose.wav");

const menuSound = new Audio("./Assets/sounds/menu.wav");
menuSound.loop = true;

const mainSound = new Audio("./Assets/sounds/main.wav");
mainSound.loop = true;

const winSound = new Audio("./Assets/sounds/winMusic.wav");
winSound.loop = true;

// Assets
const bricksAsset = qs("#bricksAsset");
const spritesAsset = qs("#spritesAsset");

// Canvas Properties
canvas.width = 448;
canvas.height = 440;

pointsCanvas.width = 448;
pointsCanvas.height = 440;


// Objects
const paddle = {
    width: 70,
    height: 12,
    x: (canvas.width - 100) / 2,
    y: canvas.height - 20,
    rounded: 5,
    dx: 6,
    keyRight: false,
    keyLeft: false,

    keyDownHandler(event) {
        const { key } = event;

        if (key === "ArrowRight" || key === "Right" || key.toUpperCase() === "D") {
            this.keyRight = true;
        };

        if (key === "ArrowLeft" || key === "Left" || key.toUpperCase() === "A") {
            this.keyLeft = true;
        };
    },

    keyUpHandler(event) {
        const { key } = event;

        if (key === "ArrowRight" || key === "Right" || key.toUpperCase() === "D") {
            this.keyRight = false;
        };

        if (key === "ArrowLeft" || key === "Left" || key.toUpperCase() === "A") {
            this.keyLeft = false;
        };
    },

    draw(ctx) {
        ctx.drawImage(
            spritesAsset,
            29,
            174,
            50,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height,
        )
    },

    movement() {
        if (this.keyRight && this.keyLeft) return;

        if (this.keyRight && this.x < canvas.width - this.width) {
            this.x += this.dx;
        };

        if (this.keyLeft && this.x > 0) {
            this.x -= this.dx;
        };
    },
};

const ball = {
    radius: 3,
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 3,
    dy: -3,

    movement() {
        // Left & Right Collision
        if (this.x + this.dx > canvas.width - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
            const hitWallSound = new Audio("./Assets/sounds/hitWall.wav");
            hitWallSound.play();
        };

        // Up Collision
        if (this.y + this.dy - this.radius < 0) {
            this.dy = -this.dy;
            const hitWallSound = new Audio("./Assets/sounds/hitWall.wav");
            hitWallSound.play();
        };

        // Paddle Collision
        const isBallSameXAsPaddle = this.x > paddle.x && this.x < paddle.x + paddle.width;
        const isBallTouchingPaddle = this.y + this.dy + this.radius >= paddle.y && this.y + this.dy - this.radius <= paddle.y + paddle.height;

        if (isBallSameXAsPaddle && isBallTouchingPaddle) {
            this.dy = -this.dy;
            const hitWallSound = new Audio("./Assets/sounds/hitWall.wav");
            hitWallSound.play();
        } else if (this.y + this.dy > canvas.height - this.radius) {
            player.gameOver = true;
            gameOver();
        }

        this.x += this.dx;
        this.y += this.dy;
    },

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.closePath();
    },
};

const BricksManager = {
    bricksRowCount: 1,
    bricksColumnCount: 1,
    bricksWidth: 30,
    bricksHeight: 14,
    bricksPadding: 2,
    bricksOffsetTop: 20,
    bricksOffsetLeft: 16,
    bricks: [],
    totalBricks: 0,
    destroyedBricks: 0,
    status: {
        "Active": 1,
        "Destroyed": 0,
    },

    createBricks() {
        this.totalBricks = 0;
        for (let c = 0; c < this.bricksColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.bricksRowCount; r++) {
                // Brick Position
                const brickX = (c * (this.bricksWidth + this.bricksPadding)) + this.bricksOffsetLeft;
                const brickY = (r * (this.bricksHeight + this.bricksPadding)) + this.bricksOffsetTop;

                // Give a random Color
                const color = Math.floor(Math.random() * 8);

                // Give a random point for color
                const points = (color + 1) * 30;

                // Save Brick
                this.bricks[c][r] = { x: brickX, y: brickY, status: this.status.Active, color: color, points: points };
                this.totalBricks++;
            }
        }
    },

    drawBricks(ctx) {
        for (let c = 0; c < this.bricksColumnCount; c++) {
            for (let r = 0; r < this.bricksRowCount; r++) {
                const currentBrick = this.bricks[c][r];
                if (currentBrick.status === this.status.Destroyed) continue;

                const clipX = currentBrick.color * 32;
                ctx.drawImage(
                    bricksAsset,
                    clipX,
                    6,
                    32.2,
                    10,
                    currentBrick.x,
                    currentBrick.y,
                    this.bricksWidth,
                    this.bricksHeight,
                );
            }
        }
    },

    collisionDetection() {
        for (let c = 0; c < this.bricksColumnCount; c++) {
            for (let r = 0; r < this.bricksRowCount; r++) {
                const currentBrick = this.bricks[c][r];
                if (currentBrick.status === this.status.Destroyed) continue;

                const isBallSameXAsBrick = ball.x > currentBrick.x && ball.x < currentBrick.x + this.bricksWidth;
                const isBallTouchingBrick = ball.y > currentBrick.y && ball.y < currentBrick.y + this.bricksHeight;

                if (isBallSameXAsBrick && isBallTouchingBrick) {
                    const hitSound = new Audio("./Assets/sounds/hit.wav");
                    hitSound.volume = 0.5;
                    hitSound.play();

                    ball.dy = -ball.dy;
                    currentBrick.status = this.status.Destroyed;
                    player.score += currentBrick.points;
                    this.destroyedBricks++;

                    // Show Points Message
                    const pointsCanvas = qs("#pointsCanvas");
                    const pointsCtx = pointsCanvas.getContext("2d");

                    let pos = currentBrick.y + 10;

                    pointsCtx.font = "16px VT323";
                    pointsCtx.fillStyle = "#fff";

                    const pointsTime = setInterval(() => {
                        pointsCtx.clearRect(
                            currentBrick.x,
                            pos - 10,
                            40,
                            40
                        );

                        pos += 5;

                        pointsCtx.fillText(`+${currentBrick.points}`, currentBrick.x, pos);

                        if (pos > currentBrick.y + 50) {
                            pointsCtx.clearRect(
                                currentBrick.x,
                                pos - 10,
                                40,
                                40
                            );

                            clearInterval(pointsTime);
                        }
                    }, 30);

                    if (this.destroyedBricks === this.totalBricks) {
                        player.gameOver = true;
                        win();
                    }
                }
            }
        }
    },
}

const player = {
    gameOver: true,
    pause: false,
    score: 0,
    bestScore: 0,

    drawScore() {
        ctx.font = "16px VT323";
        ctx.fillStyle = "#fff";
        ctx.fillText(
            `Score: ${this.score}`,
            8,
            canvas.height - 20,
        );
    },
}

// Functions

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function initEvents() {
    document.addEventListener("DOMContentLoaded", loadScreen);

    // Play Music Menu
    document.addEventListener("click", function () {
        if (!player.gameOver) return;
        menuSound.play();
    }, { once: true });

    // Keys Events
    document.addEventListener("keydown", paddle.keyDownHandler.bind(paddle));
    document.addEventListener("keyup", paddle.keyUpHandler.bind(paddle));
    document.addEventListener("keydown", pauseGame);

    // Buttons Events
    restartGame.addEventListener("click", startGame);
    winRestartGame.addEventListener("click", startGame);
    startGameBtn.addEventListener("click", startGame);
    pauseResumeBtn.addEventListener("click", resumeGame);

    // Movil Buttons Events
    leftBtn.addEventListener("touchstart", () => {
        paddle.keyLeft = true;
        leftBtn.classList.add("pressed");
    });

    leftBtn.addEventListener("touchend", () => {
        paddle.keyLeft = false;
        leftBtn.classList.remove("pressed");
    });

    rightBtn.addEventListener("touchstart", () => {
        paddle.keyRight = true;
        rightBtn.classList.add("pressed");
    });

    rightBtn.addEventListener("touchend", () => {
        paddle.keyRight = false;
        rightBtn.classList.remove("pressed");
    });

    pauseBtn.addEventListener("click", () => {
        if (player.pause || player.gameOver) return;

        pauseBtn.classList.add("pressed");
        qs("#pause-score").textContent = player.score;
        pauseModal?.showModal();
        player.pause = true;
        mainSound.volume = 0.2;
    });

    document.querySelectorAll("img").forEach(img => {
        img.addEventListener("contextmenu", e => {
            e.preventDefault();
        });
    });
};

function loadScreen() {
    ball.draw(ctx);
    paddle.draw(ctx);
    player.drawScore();
    BricksManager.drawBricks(ctx);
};

function startGame() {
    winSound.pause();
    winSound.currentTime = 0;

    // Reset Game
    player.gameOver = false;
    player.pause = false;
    player.score = 0;
    BricksManager.createBricks();
    BricksManager.destroyedBricks = 0;

    // Move Elements in default position
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;

    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - paddle.height - 10;

    // Close Modals
    gameOverModal?.close();
    winModal?.close();
    welcomeModal?.close();
    pauseModal?.close();

    // Load Screen
    loadScreen();
    draw();

    // Play Main Sound
    menuSound.pause();

    mainSound.volume = 0.6;
    mainSound.play();
};

function pauseGame(event) {
    event.preventDefault();
    if (event.key !== "Escape" || player.pause || player.gameOver) return;

    qs("#pause-score").textContent = player.score;
    pauseModal?.showModal();
    player.pause = true;
    mainSound.volume = 0.2;
};

function resumeGame() {
    pauseModal?.close();
    pauseBtn.classList.remove("pressed");
    player.pause = false;
    draw();
    mainSound.volume = 0.6;
};

function gameOver() {
    mainSound.pause();
    gameOverSound.play();

    setTimeout(() => {
        updateBestScoreModal();
        gameOverModal.showModal();
        menuSound.play();
    }, 2000);
};

function win() {
    mainSound.pause();
    qs("#win-score").textContent = player.score;

    setTimeout(() => {
        updateBestScoreModal();
        winModal.showModal();
        winSound.play();
    }, 1500);
};

// Best Score

player.bestScore = localStorage.getItem("bestScore") || 0;
function updateBestScore() {
    if (player.score > player.bestScore) {
        player.bestScore = player.score;
        localStorage.setItem("bestScore", player.bestScore);
    };
    updateBestScoreModal();
};

function updateBestScoreModal() {
    qs("#best-score-modal").textContent = player.bestScore;
    qs("#final-score").textContent = player.score;
    qs("#best-score").textContent = player.bestScore;
}

function draw() {
    if (player.gameOver) {
        updateBestScore();
        return;
    };

    if (player.pause) return;

    // Clear Canvas
    clearCanvas();

    loadScreen();

    // Logic
    ball.movement();

    paddle.movement();

    BricksManager.collisionDetection();

    window.requestAnimationFrame(draw);
};

BricksManager.createBricks();
initEvents();
updateBestScoreModal();
welcomeModal.showModal();