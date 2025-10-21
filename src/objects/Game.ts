import { SHAPES } from "../constants/shape";
import type { ShapeType } from "../types/shape";
import Shape from "./Shape";

export default class Game {
    private board: number[][];
    private _score = 0;
    private currentShape: Shape | null = null;
    private _nextShape: Shape | null = null;
    private _isOver = false;

    constructor(
        private readonly width: number,
        private readonly height: number
    ) {
        this.board = Array.from({ length: height }, () => Array(width).fill(0));
    }

    public update() {
        if (this._isOver) return;
        if (this.currentShape) {
            const oldY = this.currentShape.y;
            this.currentShape.move("down");
            
            if (this.currentShape.y == oldY) {
                this.lockShape();
                this.clearFullLines();
                this.spawnNewShape();
            }
        }
    }

    private getRandomShapeType() {
        const shapeTypes = Object.keys(SHAPES) as ShapeType[];
        return shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    }

    private spawnNewShape() {
        if (!this._nextShape) {
            this._nextShape = new Shape(Math.floor(this.width / 2) - 1, 0, this.getRandomShapeType());
        }
        this.currentShape = this._nextShape;
        this._nextShape = new Shape(Math.floor(this.width / 2) - 1, 0, this.getRandomShapeType());
    }

    private checkCollision(x: number, y: number, pattern: number[][]): boolean {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 0) continue;
                const boardX = x + col;
                const boardY = y + row;
                if (
                    boardX < 0 ||
                    boardX >= this.width ||
                    boardY >= this.height ||
                    (boardY >= 0 && this.board[row][col] !== 0)
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private lockShape() {
        if (!this.currentShape) return;
        for (const { x, y } of this.currentShape.getBlockPositions()) {
            if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                this.board[y][x] = this.currentShape.getColor();
            }
        }
    }

    private clearFullLines() {
        const newBoard = this.board.filter(row => row.some(cell => cell === 0));
        const clearedLines = this.height - newBoard.length;
        while (newBoard.length < this.height) {
            newBoard.unshift(Array(this.width).fill(0));
        }
        this.board = newBoard;
        this._score += clearedLines * 100;
    }

    public moveShape(direction: "left" | "right" | "down") {
        if (this._isOver || !this.currentShape) return;
        this.currentShape.move(direction, this.checkCollision);
    }

    public rotateShape(direction: 'clockwise' | "counterclockwise" = 'clockwise') {
        if (this._isOver || !this.currentShape) return;
        const clone = this.currentShape.clone();
        clone.rotate(direction);
        if (!this.checkCollision(clone.x, clone.y, clone.currentPattern)) {
            this.currentShape.rotate(direction);
        }
    }

    public getBoard(): number[][] {
        const displayBoard = this.board.map(row => [...row]);
        if (this.currentShape) {
            for (const { x, y } of this.currentShape.getBlockPositions()) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    displayBoard[y][x] = this.currentShape.getColor();
                }
            }
        }
        return displayBoard;
    }

    public get score() {
        return this._score;
    }

    public get isOver() {
        return this._isOver;
    }

    public get nextShape() {
        return this._nextShape;
    }
}