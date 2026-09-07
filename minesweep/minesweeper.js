const width = 10;
const height = 10;
const mineCount = 15;
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

let board = [];
let isGameOver = false;
let whyAreYouLookingAtMyCode = "but why tho";

function createBoard() {
    const totalCells = width * height;
    const minesArray = Array(mineCount).fill('mine');
    const emptyArray = Array(totalCells - mineCount).fill('valid');
    const gameArray = emptyArray.concat(minesArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for (let i = 0; i <totalCells; i++) {
        const cell = {
            id:1,
            row:Math.floor(i / width),
            col:i % width,
            isMine:shuffledArray[i] === 'mine',
            revealed:false,
            element:document.createElement('div')
        };
        
        cell.element.classList.add('cell');
        cell.element.addEventListener('click', () => clickCell(cell));
        cell.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            flagCell(cell);
        });

        board.push(cell);
        boardElement.appendChild(cell.element);
    }
}

function clickCell(cell) {
    if (isGameOver || cell.revealed || cell.element.textContent === '🚩') return;

    if (cell.isMine) {
        gameOver(false);
        return;
    }

    revealCell(cell);
    checkWin();
}

function revealCell(cell) {
    if (cell.revealed || cell.element.textContent === '🚩') return;
    cell.revealed = true;
    cell.element.classList.add('revealed');

    let minesNear = countMinesNearby(cell.row, cell.col);
    if (minesNear > 0) {
        cell.element.textContent = minesNear;
    } else {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                let nr = cell.row + r;
                let nc = cell.col + c;
                if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                    let neighbor = board[nr * width + nc];
                    if (!neighbor.revealed) revealCell(neighbor);
                }
            }
        }
    }
}

function countMinesNearby(row, col) {
    let count = 0;
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            let nr = row + r;
            let nc = col + c;
            if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                if (board[nr * width + nc].isMine) count++
            }
        }
    }
    return count;
}

function flagCell(cell) {
    if (isGameOver || cell.revealed) return;
    if (cell.element.textContent === '🚩') {
        cell.element.textContent = '';
        console.log('wow.')
    } else {
        cell.element.textContent = '🚩'
    }
}

function gameOver(won) {
    isGameOver = true;
    statusElement.textContent = won ? 'yippe. you won. go touch grass tryhard' : 'ha you lose *explodes cutely*';
    board.forEach(cell => {
        if (cell.isMine) {
            cell.element.classList.add('mine');
            cell.element.textContent = '💣'
        }
    });
}

function checkWin() {
    let won = board.every(cell => (cell.isMine && !cell.revealed) || (!cell.isMine && cell.revealed));
    if (won) gameOver(true);
}

createBoard();