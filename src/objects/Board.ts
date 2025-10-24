import type Shape from "./Shape";

export default class Board {
    private board: number[][];

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {
        this.board = Array.from({ length: height }, () => Array(width).fill(0));
    }

    public getBoard() {
        return this.board.map(row => [...row]);
    }

    public isCollision(x: number, y: number, pattern: number[][]) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 0) continue;
                const boardX = x + col;
                const boardY = y + row;
                if (
                    boardX < 0 ||
                    boardX >= this.width ||
                    boardY >= this.height ||
                    (boardY >= 0 && this.board[boardY][boardX] !== 0)
                ) return true;
            }
        }
        return false;
    }

    public lockShape(shape: Shape) {
        for (const { x, y } of shape.getBlockPositions()) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.board[y][x] = shape.color;
            }
        }
    }

    public clearFullLines() {
        const newBoard = this.board.filter(row => row.some(cell => cell === 0));
        const clearedLines = this.height - newBoard.length;
        while (newBoard.length < this.height) {
            newBoard.unshift(Array(this.width).fill(0));
        }
        this.board = newBoard;
        return clearedLines;
    }
}