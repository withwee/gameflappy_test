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

        // Physics
        let velocityX = -2;
        let velocityY = 0;
        let gravity = 0.4;

        let gameOver = false;
        let score = 0;
        let highScore = 0;
        let gameOverBgImg;

        // Sounds
        let sfxDie;
        let sfxHit;
        let sfxPoint;
        let sfxSwooshing;
        let sfxWing;
        let openingAudio;

        // New flag to check if the game has started
        let gameStarted = false;

        window.onload = function () {
            board = document.getElementById("board");
            board.height = boardHeight;
            board.width = boardWidth;
            context = board.getContext("2d");
        
            // Load assets
            loadAssets();
        
            // Set background awal ke start menu setelah gambar dimuat
            startMenuBgImg.onload = function() {
                currentBgImg = startMenuBgImg;
                context.drawImage(currentBgImg, 0, 0, boardWidth, boardHeight);
                requestAnimationFrame(update);
            };
        
            // Add event listeners
            document.addEventListener("keydown", moveBird);
            board.addEventListener("touchstart", moveBird);
        
            setInterval(placePipes, 1500); // Spawn pipes setiap 1,5 detik
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

    sfxDie = new Audio("./sfx_die.wav");
    sfxHit = new Audio("./sfx_hit.wav");
    sfxPoint = new Audio("./sfx_point.wav");
    sfxSwooshing = new Audio("./sfx_swooshing.wav");
    sfxWing = new Audio("./sfx_wing.wav");
    openingAudio = new Audio("./opening.mp3");
}

function showStartMenu() {
    context.drawImage(startMenuBgImg, 0, 0, boardWidth, boardHeight);
    context.fillStyle = "white";
    
    if (openingAudio.readyState >= 3) {
        openingAudio.play();  // Play the opening audio
        openingAudio.loop = true;  // Loop the audio
    }
}

function startGame() {
    gameStarted = true;
    sfxSwooshing.play();
    currentBgImg = dayBgImg;  // Set the main background to day after starting
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
            
                // Gambar pipa
                context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
            
                // Deteksi skor
                if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                    score += 0.5;
                    pipe.passed = true;
                    sfxPoint.play();
                }
            
                // Deteksi tabrakan
                if (detectCollision(bird, pipe)) {
                    triggerGameOver();
                }
            }
            
            // Hapus pipa yang sudah keluar dari layar
            pipeArray = pipeArray.filter(pipe => pipe.x + pipe.width > 0);


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

        function showStartMenu() {
            context.drawImage(startMenuBgImg, 0, 0, boardWidth, boardHeight);
            context.fillStyle = "white";
            openingAudio.play();
            openingAudio.loop = true;
            openingAudio.load();
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
            currentBgImg = dayBgImg;
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

       function placePipes() {
           if (gameOver) return;
       
           // Hitung waktu antar pipa berdasarkan kecepatan horizontal
           let timeBetweenPipes = Math.abs(pipeWidth / velocityX) * 1000; // dalam ms
           if (Date.now() - lastPipeTime < timeBetweenPipes) {
               return;
           }
       
           lastPipeTime = Date.now();
       
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
             console.log(pipeArray); 
         }

        // Detect collisions between the bird and pipes
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
