let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 40;
let birdHeight = 28;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Backgrounds
let dayBgImg;
let nightBgImg;
let currentBgImg;
let startMenuBgImg;
let gameOverBgImg;

// Sounds
let sfxDie;
let sfxHit;
let sfxPoint;
let sfxSwooshing;
let sfxWing;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let highScore = 0;

// New flag to check if the game has started
let gameStarted = false;

// Flag for login status
let isLoggedIn = false;

window.onload = function () {
    usernameInput = document.getElementById("username");
    passwordInput = document.getElementById("password");
    loginMessage = document.getElementById("login-message");

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load assets
    loadAssets();

    // Add event listeners for login
    document.getElementById("submit-login").addEventListener("click", handleLogin);
};

function loadAssets() {
    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    dayBgImg = new Image();
    dayBgImg.src = "./flappybirdbg.png";

    nightBgImg = new Image();
    nightBgImg.src = "./background-night.png";

    gameOverBgImg = new Image();
    gameOverBgImg.src = "./bgover.jpg";

    startMenuBgImg = new Image();
    startMenuBgImg.src = "./bgawal.png";

    currentBgImg = dayBgImg;

    sfxDie = new Audio("./sfx_die.wav");
    sfxHit = new Audio("./sfx_hit.wav");
    sfxPoint = new Audio("./sfx_point.wav");
    sfxSwooshing = new Audio("./sfx_swooshing.wav");
    sfxWing = new Audio("./sfx_wing.wav");
}

function handleLogin() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Simulate login validation
    if (username === "itnay" && password === "ivannadYANTI") {
        isLoggedIn = true;
        loginMessage.textContent = "";

        // Hide the login form and show the game board
        document.getElementById("login-form").style.display = "none"; 
        document.getElementById("game-board").style.display = "block"; 

        // Show the start menu with bgawal.png
        showStartMenu(); 
    } else {
        loginMessage.textContent = "Invalid username or password!";
    }
}

function showStartMenu() {
    context.drawImage(startMenuBgImg, 0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    context.font = "30px '04B_19'";
    context.fillText("Press any key or tap to start", 40, boardHeight / 2);

    // Set up event listener for starting the game
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", moveBird);
}

function moveBird(e) {
    if (!gameStarted) {
        startGame();  // Start the game if not started yet
        return;
    }

    if (gameOver) {
        restartGame();
        return;
    }

    if (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX")) {
        velocityY = -6;
        sfxWing.play();
    } else if (e.type === "touchstart") {
        velocityY = -6;
        sfxWing.play();
    }
}

// Start the game when the player taps or presses any key
function startGame() {
    gameStarted = true;
    sfxSwooshing.play();
    requestAnimationFrame(update);
}

// Restart the game
function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
    velocityX = -2;
    currentBgImg = dayBgImg;
    sfxSwooshing.play();
    requestAnimationFrame(update);
}

function update() {
    // If the game hasn't started, show the start menu
    if (!gameStarted) {
        showStartMenu();
        return;
    }

    // Game update loop after the start
    if (gameOver) {
        displayGameOverText();
        return;
    }

    requestAnimationFrame(update);
    context.drawImage(currentBgImg, 0, 0, boardWidth, boardHeight);

    // Bird logic
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        triggerGameOver();
    }

    // Pipe logic
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            sfxPoint.play();
        }

        if (detectCollision(bird, pipe)) {
            triggerGameOver();
        }
    }

    // Clear off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Level progression
    if (score >= 25 && score < 50) {
        velocityX = -3;
    } else if (score >= 50) {
        velocityX = -4 - Math.floor((score - 50) / 10);
        currentBgImg = nightBgImg;
    }

    // Draw score
    drawScore();
}

function drawScore() {
    context.fillStyle = "white";
    context.font = "50px '04B_19'";
    context.fillText(score, 5, 50);
}

function displayGameOverText() {
    context.drawImage(gameOverBgImg, 0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    context.font = "50px '04B_19'";
    context.fillText("Game Over", 20, 150);
    context.fillText("Score: " + score, 20, 220);
    context.fillText("High Score: " + highScore, 20, 290);
}

function triggerGameOver() {
    gameOver = true;
    highScore = Math.max(highScore, score);
    sfxDie.play();
}

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(bottomPipe);
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
