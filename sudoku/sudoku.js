let solutionBoard = [];
let initialBoard = [];
const container = document.getElementById("sudoku-container");

// --- SUDOKU ENGINE (Backtracking & Generation) ---

// Check if a number can safely be placed at board[row][col]
function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    // Row check
    if (board[row][i] === num) return false;
    // Column check
    if (board[i][col] === num) return false;
    // 3x3 Box check
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
    const boxCol = 3 * Math.floor(col / 3) + (i % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

// Solves the board using recursive backtracking
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        // Shuffle digits 1-9 to ensure randomness every generation
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
          () => Math.random() - 0.5,
        );
        for (let num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0; // Backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Creates a full puzzle and strips values out to form the playable board
function generateSudoku() {
  // 1. Initialize empty boards
  solutionBoard = Array.from({ length: 9 }, () => Array(9).fill(0));

  // 2. Generate a complete valid board solution
  fillBoard(solutionBoard);

  // 3. Deep copy solution array into initial playable array
  initialBoard = solutionBoard.map((row) => [...row]);

  // 4. Remove elements dynamically (higher count = harder difficulty)
  let attempts = 40; // Removes roughly 40 cells to leave ~41 clues
  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (initialBoard[row][col] !== 0) {
      initialBoard[row][col] = 0;
      attempts--;
    }
  }
}

// --- UI RENDERING & ACTIONS ---

function createGrid() {
  container.innerHTML = ""; // Clear previous board layouts
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellValue = initialBoard[row][col];
      const input = document.createElement("input");

      input.type = "text";
      input.maxLength = 1;
      input.classList.add("cell");
      input.dataset.row = row;
      input.dataset.col = col;

      if (cellValue !== 0) {
        input.value = cellValue;
        input.disabled = true;
        input.classList.add("initial");
      } else {
        input.addEventListener("input", (e) => {
          if (!/^[1-9]$/.test(e.target.value)) {
            e.target.value = "";
          }
          e.target.classList.remove("correct", "wrong");
        });
      }
      container.appendChild(input);
    }
  }
}

function checkPuzzle() {
  const inputs = document.querySelectorAll(".cell");
  let isPerfect = true;

  inputs.forEach((input) => {
    if (input.classList.contains("initial")) return;

    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const userValue = parseInt(input.value);
    const correctValue = solutionBoard[row][col];

    if (userValue === correctValue) {
      input.classList.add("correct");
      input.classList.remove("wrong");
    } else {
      if (input.value !== "") {
        input.classList.add("wrong");
      }
      input.classList.remove("correct");
      isPerfect = false;
    }
  });

  if (isPerfect) alert("🎉 Congratulations! You solved the puzzle!");
}

function startNewGame() {
  generateSudoku();
  createGrid();
}

// Attach event listeners
document.getElementById("check-btn").addEventListener("click", checkPuzzle);
document.getElementById("new-btn").addEventListener("click", startNewGame);

// Boot up first runtime cycle
startNewGame();