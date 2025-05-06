// 扫雷游戏主逻辑，适合初中生理解

// 棋盘大小和地雷数量
const ROWS = 16;
const COLS = 16;
const MINES = 40;

// 保存棋盘数据
let board = [];
let mineMap = [];
let revealedCount = 0;
let flagCount = 0;
let gameOver = false;

const gameDiv = document.getElementById('game');
const messageDiv = document.getElementById('message');
const restartBtn = document.getElementById('restart');

// 初始化游戏
function initGame() {
    board = [];
    mineMap = [];
    revealedCount = 0;
    flagCount = 0;
    gameOver = false;
    messageDiv.textContent = '';
    gameDiv.innerHTML = '';

    // 创建空棋盘
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        mineMap[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = {
                revealed: false,
                flagged: false,
                mine: false,
                number: 0
            };
            mineMap[r][c] = 0;
        }
    }

    // 随机布置地雷
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
        let r = Math.floor(Math.random() * ROWS);
        let c = Math.floor(Math.random() * COLS);
        if (!board[r][c].mine) {
            board[r][c].mine = true;
            minesPlaced++;
        }
    }

    // 计算每个格子周围的地雷数
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c].mine) {
                board[r][c].number = countMines(r, c);
            }
        }
    }

    // 生成棋盘HTML
    for (let r = 0; r < ROWS; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let c = 0; c < COLS; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            // 左键点击
            cellDiv.addEventListener('click', onCellClick);
            // 右键插旗
            cellDiv.addEventListener('contextmenu', onCellRightClick);
            rowDiv.appendChild(cellDiv);
        }
        gameDiv.appendChild(rowDiv);
    }
}

// 计算某格周围地雷数
function countMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = row + dr;
            let nc = col + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (board[nr][nc].mine) count++;
            }
        }
    }
    return count;
}

// 左键点击格子
function onCellClick(e) {
    if (gameOver) return;
    const r = parseInt(this.dataset.row);
    const c = parseInt(this.dataset.col);
    if (board[r][c].revealed || board[r][c].flagged) return;
    revealCell(r, c);
    checkWin();
}

// 右键插旗/取消插旗
function onCellRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const r = parseInt(this.dataset.row);
    const c = parseInt(this.dataset.col);
    if (board[r][c].revealed) return;
    board[r][c].flagged = !board[r][c].flagged;
    this.classList.toggle('flag', board[r][c].flagged);
    this.textContent = board[r][c].flagged ? '🚩' : '';
    flagCount += board[r][c].flagged ? 1 : -1;
}

// 展开格子
function revealCell(r, c) {
    const cell = board[r][c];
    const cellDiv = getCellDiv(r, c);
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    cellDiv.classList.add('revealed');
    if (cell.mine) {
        cellDiv.classList.add('mine');
        cellDiv.textContent = '💣';
        gameOver = true;
        showAllMines();
        messageDiv.textContent = '游戏失败，你踩到地雷了！';
        return;
    }
    revealedCount++;
    if (cell.number > 0) {
        cellDiv.textContent = cell.number;
        cellDiv.style.color = getNumberColor(cell.number);
    } else {
        // 没有地雷，递归展开周围格子
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = r + dr;
                let nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    if (!board[nr][nc].revealed) {
                        revealCell(nr, nc);
                    }
                }
            }
        }
    }
}

// 获取格子的div元素
function getCellDiv(r, c) {
    return gameDiv.children[r].children[c];
}

// 显示所有地雷
function showAllMines() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c].mine) {
                const cellDiv = getCellDiv(r, c);
                cellDiv.classList.add('mine');
                cellDiv.textContent = '💣';
            }
        }
    }
}

// 判断是否胜利
function checkWin() {
    if (gameOver) return;
    if (revealedCount === ROWS * COLS - MINES) {
        gameOver = true;
        messageDiv.textContent = '恭喜你，成功扫清所有地雷！';
        showAllMines();
    }
}

// 数字颜色区分
function getNumberColor(num) {
    const colors = ['#000', '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#fbc02d', '#0288d1', '#c2185b', '#616161'];
    return colors[num] || '#000';
}

// 重新开始按钮
restartBtn.onclick = initGame;

// 页面加载自动开始
window.onload = initGame; 