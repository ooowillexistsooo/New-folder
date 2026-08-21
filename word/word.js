let WORDS_POOL = [];

let ANSWER = "";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

let currentRow = 0;
let currentTile = 0;
let gameOver = false;
let guesses = [];

const board = document.getElementById("board");
const messageDisplay = document.getElementById("message");
const resetButton = document.getElementById("reset-button");

function initBoard() {
    board.innerHTML = "";
    for (let r = 0; r < MAX_ATTEMPTS; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tileDiv = document.createElement("div");
            tileDiv.className = "tile";
            tileDiv.id = `r-${r}-c-${c}`;
            rowDiv.appendChild(tileDiv);
        }
        board.appendChild(rowDiv);
    }
}

function resetGame() {
    if (WORDS_POOL.length === 0) return;

    const randomIndex = Math.floor(Math.random() * WORDS_POOL.length);
    ANSWER = WORDS_POOL[randomIndex];

    currentRow = 0;
    currentTile = 0;
    gameOver = false;
    guesses = Array(MAX_ATTEMPTS).fill().map(() => Array(WORD_LENGTH).fill(""));

    messageDisplay.textContent = "";
    messageDisplay.style.color = "#ff4a4a";
    resetButton.style.display = "none";

    const keys = document.querySelectorAll(".key")
    keys.forEach(key => {
        key.classList.remove("correct", "present", "absent")
    });

    initBoard()
}

function updateBoard() {
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.getElementById(`r-${currentRow}-c-${c}`);
        tile.textContent = guesses[currentRow][c];
    }
}

function handleInput(key) {
    if (gameOver) return;

    if (key === "ENTER") {
        submitGuess();
    } else if (key === "BACKSPACE" || key === "BACK") {
        if (currentTile > 0) {
            currentTile--;
            guesses[currentRow][currentTile] = "";
            updateBoard();
        }
    } else if (/^[A-Z]$/.test(key)) {
        if (currentTile < WORD_LENGTH) {
            guesses[currentRow][currentTile] = key;
            updateBoard();
            currentTile++;
        }
    }
}

function submitGuess() {
    if (currentTile < WORD_LENGTH) {
        messageDisplay.textContent = "not enough letters";
        return;
    }

    const guess = guesses[currentRow].join("");

    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.getElementById(`r-${currentRow}-c-${c}`);
        const letter = guess[c];
        const keyButton = document.querySelector(`.key[data-key = "${letter}"]`);

       if (ANSWER[c] === letter) {
        tile.classList.add("correct");
        updateKeyStyle(keyButton, "correct");
       } else if (ANSWER.includes(letter)) {
        tile.classList.add("present");
        updateKeyStyle(keyButton, "present");
       } else {
        tile.classList.add("absent");
        updateKeyStyle(keyButton, "absent");
       }
    }

    if (guess === ANSWER) {
        messageDisplay.style.color = "#538d4e";
        messageDisplay.textContent = "splendid";
        gameOver = true;
        resetButton.style.display = "block";
        return;
    }

    if (currentRow === MAX_ATTEMPTS - 1) {
        messageDisplay.textContent = `wow you\'re bad at this. the word was ${ANSWER}`;
        gameOver = true;
        resetButton.style.display = "block";
        return;
    }

    currentRow++
    currentTile = 0;
    messageDisplay.textContent = "";
}

function updateKeyStyle(keyButton, targetClass) {
    if (!keyButton) return;

    if (keyButton.classList.contains("correct")) return;
    if (keyButton.classList.contains("present") && targetClass === "absent") return;
    
    keyButton.classList.remove("present", "absent");
    keyButton.classList.add(targetClass);
}

window.addEventListener("keydown", (e) =>{
    handleInput(e.key.toUpperCase());
});

document.getElementById("keyboard").addEventListener("click", (e) => {
    const target = e.target.closest(".key");
    if (target) {
        const key = target.getAttribute("data-key");
        handleInput(key);
    }
});

async function loadWords() {
    try {
        const response = await fetch("words.txt");
        if (!response.ok) throw new Error("Could not load words.txt");
        WORDS_POOL = (await response.text())
            .split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length === WORD_LENGTH);
    } catch (error) {
        messageDisplay.textContent = "could not load words.txt";
        return;
    }

    resetGame();
}

loadWords();