//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
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

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//backgrounds
let dayBgImg;
let nightBgImg;
let currentBgImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let highScore = 0;
let gameOverBgImg;

//sounds
let sfxDie;
let sfxHit;
let sfxPoint;
let sfxSwooshing;
let sfxWing;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load images
    loadAssets();

    // Start game loop
    requestAnimationFrame(update);

    // Add event listeners
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", moveBird);

    setInterval(placePipes, 1500); // Spawn pipes every 1.5 seconds
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

    currentBgImg = dayBgImg;

    sfxDie = new Audio("./sfx_die.wav");
    sfxHit = new Audio("./sfx_hit.wav");
    sfxPoint = new Audio("./sfx_point.wav");
    sfxSwooshing = new Audio("./sfx_swooshing.wav");
    sfxWing = new Audio("./sfx_wing.wav");
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        context.drawImage(gameOverBgImg, 0, 0, boardWidth, boardHeight);
        context.fillStyle = "white";
        context.font = "50px '04B_19'"; // Updated font style
        context.fillText("Game Over", 20, 150);
        context.fillText("Score: " + score, 20, 220);
        context.fillText("High Score: " + highScore, 20, 290);
        return;
    }

    context.drawImage(currentBgImg, 0, 0, boardWidth, boardHeight); // Draw current background

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        highScore = Math.max(highScore, score);
        sfxDie.play();
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
            sfxPoint.play();
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            highScore = Math.max(highScore, score);
            sfxHit.play();
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //level progression
    if (score >= 25 && score < 50) {
        velocityX = -3; // Increase speed at score 25
    } else if (score >= 50) {
        velocityX = -4 - Math.floor((score - 50) / 10); // Further increase speed for each 10 points after 50
        currentBgImg = nightBgImg; // Change to night background
    }

    //score
    context.fillStyle = "white";
    context.font = "50px '04B_19'"; // Updated font style
    context.fillText(score, 5, 50);
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

function moveBird(e) {
    if (gameOver) {
        restartGame(); // Restart game if game over
        return;
    }

    if (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX")) {
        velocityY = -6; // Bird jumps
        sfxWing.play();
    } else if (e.type === "touchstart") {
        velocityY = -6; // Bird jumps on tap
        sfxWing.play();
    }
}

function restartGame() {
    // Reset game state
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

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function drawScore() {
    context.fillStyle = "white";
    context.font = "50px '04B_19'";
    context.fillText(score, 5, 50);
}

function displayGameOverText() {
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

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    currentBgImg = dayBgImg;
    velocityX = -2;
    sfxSwooshing.play();
}
