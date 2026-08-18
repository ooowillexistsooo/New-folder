const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 100; // adjust the speed you cheater i dare you

let snake = [{ x: 10, y: 10 }];
let velocityX = 0;
let velocityY = 0;
let foodX = 5;
let foodY = 5;
let score = 0;
let gameLoopInterval;

function startGame() {
    placeFood();
    document.addEventListener("keydown", handleKeyDown);
    gameLoopInterval = setInterval(updateGame, gameSpeed);
}

function updateGame() {
    moveSnake();

    if (checkGameOver()) {
        resetGame();
        return;
        console.log("what a loser imagine losing to snake");
    }

    checkFoodCollision();
    drawCanvas();
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // feed the snek bbg
    ctx.fillStyle = "red";
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize -1 , gridSize -1);

    // dre snek
    ctx.fillStyle = "blue";
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize -1 , gridSize -1);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head);
    snake.pop();
}

function handleKeyDown(event) {
    const key = event.key;
    const goingUp = velocityY === -1;
    const goingDown = velocityY === 1;
    const goingLeft = velocityX === -1;
    const goingRight = velocityX === 1;

    if ((key === "ArrowLeft" || key === "a") && !goingRight) {velocityX = -1; velocityY = 0;}
    if ((key === "ArrowRight" || key === "d") && !goingLeft) {velocityX = 1; velocityY = 0;}
    if ((key === "ArrowUp" || key === "w") && !goingDown) {velocityX = 0; velocityY = -1;}
    if ((key === "ArrowDown" || key === "s") && !goingUp) {velocityX = 0; velocityY = 1;}
}

function placeFood() {
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);

    // snek doesnt wanna be isaac newtoned
    snake.forEach(part => {
        if (part.x === foodX && part.y === foodY) placeFood()
    });
}

function checkFoodCollision() {
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score++;
        scoreElement.textContent = score;
        growSnake();
        placeFood();
    }
}

function growSnake() {
    const lastPart = snake[snake.length - 1];
    snake.push({ x: lastPart.x, y: lastPart.y });
}

function checkGameOver() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }
    return false;
}

function resetGame() {
    alert("Game Over! Your score: " + score);
    clearInterval(gameLoopInterval);
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    scoreElement.textContent = score;
    startGame();
}

startGame();

//woah you read all of that