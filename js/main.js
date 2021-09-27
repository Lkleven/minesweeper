const game = document.getElementById("game");
const gameStatus = document.getElementById("game-status");
console.log("game", game);
const face = document.getElementById("face");
const board = document.createElement("div");
let flagMode = false;
board.classList.add("board");
const minesArr = [];
const boardSize = { width: 9, height: 9 };
const cellCount = boardSize.width * boardSize.height;
const numberOfMines = 10;
const cellSize = 30;
game.style.width = `${boardSize.width * cellSize}px`;
const minesCounter = document.getElementById("mines-counter");
const gameTimer = document.getElementById("game-timer");
let gameStarted = false;
let flagsPlaced = 0;
let timeElapsed = 0;
let intervalTimer = undefined; //initialize global

console.log("runs");

board.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    onClick(e, true);
});

const faces = {
    neutral: "🙂",
    mouseDown: "😮",
    gameOver: "💀",
    gameWon: "😎",
    flagMode: "😌",
};

const toggleFlagMode = (button) => {
    flagMode = !flagMode;
    face.textContent = flagMode ? faces.flagMode : faces.neutral;
    button.classList.toggle("active", flagMode);
};

const getAdjacentCells = (x, y) =>
    [
        { x: x - 1, y: y - 1 },
        { x: x, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y },
        { x: x + 1, y: y },
        { x: x - 1, y: y + 1 },
        { x: x, y: y + 1 },
        { x: x + 1, y: y + 1 },
    ].filter(
        (cell) =>
            cell.x >= 0 &&
            cell.y >= 0 &&
            cell.x < boardSize.width &&
            cell.y < boardSize.width
    );

const cellContainsMine = (cell) =>
    minesArr.some((mine) => mine.x === cell.x && mine.y === cell.y);

const getCell = (x, y) => board.querySelector(`[data-x="${x}"][data-y="${y}"]`);

const revealBlanks = (x, y) => {
    const cell = getCell(x, y);
    if (cell.disabled === true) {
        return;
    }
    const adjacentCells = getAdjacentCells(x, y);
    const number = adjacentCells.reduce((num, cell) => {
        return cellContainsMine(cell) ? num + 1 : num;
    }, 0);

    if (number === 0) {
        const cell = getCell(x, y);
        cell.disabled = true;
        cell.textContent = "";
        adjacentCells.forEach((cell) => revealBlanks(cell.x, cell.y));
    }
};

const revealMines = (explode = false) => {
    minesArr.forEach((mine) => {
        const cell = board.querySelector(
            `[data-x="${mine.x}"][data-y="${mine.y}"]`
        );
        cell.classList.add(explode ? "exploded" : "disarmed");
        cell.disabled = true;
        board.classList.add("lock");
    });
};

const gameEnd = (victory = false) => {
    clearInterval(intervalTimer);
    revealMines(victory ? false : true);
    gameStatus.textContent = victory ? "You won!" : "Game over!";
    face.textContent = victory ? faces.gameWon : faces.gameOver;
    game.classList.add(victory ? "won" : "lost");
};

const gameWon = () =>
    board.querySelectorAll("button:disabled").length ===
    cellCount - numberOfMines;

const onMouseDown = (e) => {
    const cell = e.target;
    const rightButton = e.which === 3;
    if (!flagMode && !rightButton && cell.disabled !== true) {
        face.textContent = faces.mouseDown;
    }
};

const toggleFlag = (cell) => {
    const hasFlag = cell.textContent === "🚩" ? true : false;
    cell.textContent = hasFlag ? "" : "🚩";
    flagsPlaced = hasFlag ? flagsPlaced - 1 : flagsPlaced + 1;
    updateMinesCounter();
};

const onClick = (e, rightClick = false) => {
    if (!gameStarted) {
        intervalTimer = setInterval(() => updateTimer(timeElapsed++), 1000);
    }
    gameStarted = true;
    const clickedCell = e.target;
    const x = Number(clickedCell.dataset.x);
    const y = Number(clickedCell.dataset.y);
    if ((flagMode || rightClick) && clickedCell.disabled !== true) {
        toggleFlag(clickedCell);
        if (!flagMode) {
            face.textContent = faces.neutral;
        }
    } else {
        if (cellContainsMine({ x, y })) {
            return gameEnd();
        }

        const adjacentCells = getAdjacentCells(x, y);
        const number = adjacentCells.reduce((num, cell) => {
            return cellContainsMine(cell) ? num + 1 : num;
        }, 0);
        if (number === 0) {
            revealBlanks(x, y);
        } else {
            clickedCell.disabled = true;
            clickedCell.textContent = number;
            clickedCell.classList.add(`number-${number}`);
        }
        face.textContent = faces.neutral;
        if (gameWon()) {
            gameEnd("victory");
        }
    }
};

const addCells = (width, height) => {
    const cells = width * height;
    for (var i = 0; i < cells; i++) {
        const cell = document.createElement("button");
        cell.classList.add("cell");
        cell.style.height = `${cellSize}px`;
        cell.style.width = `${cellSize}px`;
        cell.onclick = onClick;
        cell.onmousedown = (e) => onMouseDown(e);
        cell.addEventListener("touchstart", (e) => onMouseDown(e));
        cell.dataset.x = i % height;
        cell.dataset.y = Math.floor(i / width);
        board.appendChild(cell);
    }
    board.style.height = `${height * cellSize}px`;
    board.style.width = `${width * cellSize}px`;
};

const randomCoords = (x, y) => ({
    x: Math.floor(Math.random() * x),
    y: Math.floor(Math.random() * y),
});

const alreadyPlaced = (coords) =>
    minesArr.some((mine) => mine.x === coords.x && mine.y === coords.y);

const addMines = (minesCount) => {
    for (var i = 0; i < minesCount; i++) {
        //todo this looks weird
        let coords = randomCoords(boardSize.width, boardSize.height);
        while (alreadyPlaced(coords)) {
            coords = randomCoords(boardSize.width, boardSize.height);
        }
        minesArr.push(coords);
    }
};

const updateTimer = (timeElapsed) => {
    if (timeElapsed === 999) {
        clearInterval(intervalTimer);
    }
    const timeString = timeElapsed.toString();
    const number = "000" + timeString;
    gameTimer.textContent = number.substr(number.length - 3);
};

const updateMinesCounter = () => {
    const counter = (numberOfMines - flagsPlaced).toString();
    const number = "000" + counter;
    minesCounter.textContent = number.substr(number.length - 3);
};

const initializeBoard = () => {
    addCells(boardSize.width, boardSize.height);
    addMines(numberOfMines);
    updateMinesCounter();
    gameTimer.textContent = "000";
};

const resetGame = () => {
    gameStarted = false;
    game.classList.remove("won", "lost");
    board.classList.remove("lock");
    board.innerHTML = "";
    gameStatus.textContent = "Find all mines";
    face.textContent = faces.neutral;
    minesArr.length = 0;
    flagsPlaced = 0;
    timeElapsed = 0;
    clearInterval(intervalTimer);
    initializeBoard();
};

initializeBoard();

game.appendChild(board);
