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

    //load images
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

    //load sounds
    sfxDie = new Audio("./sfx_die.wav");
    sfxHit = new Audio("./sfx_hit.wav");
    sfxPoint = new Audio("./sfx_point.wav");
    sfxSwooshing = new Audio("./sfx_swooshing.wav");
    sfxWing = new Audio("./sfx_wing.wav");

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    // Input listeners for keyboard and touch
    document.addEventListener("keydown", moveBird);
    board.addEventListener("touchstart", moveBird);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        context.drawImage(gameOverBgImg, 0, 0, boardWidth, boardHeight);
        context.fillStyle = "white";
        context.font = "50px '04B_19'";
        context.fillText("Game Over", 20, 150);
        context.fillText("Score: " + score, 20, 220);
        context.fillText("High Score: " + highScore, 20, 290);
        return;
    }

    context.drawImage(currentBgImg, 0, 0, boardWidth, boardHeight);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
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
            score += 0.5;
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
        pipeArray.shift();
    }

    //level progression
    if (score >= 25 && score < 50) {
        velocityX = -3;
    } else if (score >= 50) {
        velocityX = -4 - Math.floor((score - 50) / 10);
        currentBgImg = nightBgImg;
    }

    //score
    context.fillStyle = "white";
    context.font = "50px '04B_19'";
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
    if (e.type === "touchstart" || (e.type === "keydown" && (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX"))) {
        jumpBird();
    }
}

function jumpBird() {
    velocityY = -6;
    sfxWing.play();

    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        currentBgImg = dayBgImg;
        velocityX = -2;
        sfxSwooshing.play();
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
