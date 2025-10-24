import { SHAPES } from "../constants/shape";
import type { ShapeType } from "../types/shape";
import Shape from "./Shape";

export default class Game {
    private board: number[][];
    private currentShape: Shape | null = null;
    private _score = 0;
    private _isOver = false;
    private _level = 1;
    private spawnQueue: Shape[] = [];
    private linesClearedTotal = 0;

    public onScoreChange?: (score: number) => void;
    public onQueueChange?: (queue: Shape[]) => void;
    public onLevelChange?: (level: number) => void;

    public get score() { return this._score; }
    public get level() { return this._level; }
    public get isOver() { return this._isOver; }
    public get nextShapes() { return this.spawnQueue; }

    constructor(
        private readonly width: number,
        private readonly height: number,
        private readonly queueSize: number = 3,
    ) {
        this.board = Array.from({ length: height }, () => Array(width).fill(0));
    }

    public update() {
        if (this._isOver) return;
        if (this.currentShape) {
            const oldY = this.currentShape.y;
            this.currentShape.move("down", this.checkCollision.bind(this));

            if (this.currentShape.y === oldY) {
                this.lockShape();
                const cleared = this.clearFullLines();
                if (cleared > 0) this.updateLevel();
                this.spawnNewShape();
            }
        }
        this.initializeQueue();
    }

    private createRandomShape() {
        return new Shape(Math.floor(this.width / 2) - 1, 0, this.getRandomShapeType());
    }

    private initializeQueue() {
        while (this.spawnQueue.length < this.queueSize) {
            this.spawnQueue.push(this.createRandomShape());
        }
    }

    private getRandomShapeType() {
        const shapeTypes = Object.keys(SHAPES) as ShapeType[];
        return shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    }

    public spawnNewShape() {
        if (this.spawnQueue.length === 0) {
            this.initializeQueue();
        }
        this.currentShape = this.spawnQueue.shift()!;
        this.spawnQueue.push(this.createRandomShape());
        this.onQueueChange?.([...this.spawnQueue]);
        if (this.checkCollision(this.currentShape.x, this.currentShape.y, this.currentShape.currentPattern)) {
            this._isOver = true;
        }
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
                    (boardY >= 0 && this.board[boardY][boardX] !== 0)
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
                this.board[y][x] = this.currentShape.color;
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

        if (clearedLines > 0) {
            let scoreToAdd = clearedLines * 100;
            switch (clearedLines) {
                case 2:
                    scoreToAdd += 50;
                    break;
                case 3:
                    scoreToAdd += 150;
                    break;
                case 4:
                    scoreToAdd += 400;
                    break;
            }

            this._score += scoreToAdd;
            this.linesClearedTotal += clearedLines;
            this.onScoreChange?.(this._score);
        }

        return clearedLines;
    }

    private updateLevel() {
        const newLevel = Math.floor(this.linesClearedTotal / 10) + 1;
        if (newLevel > this._level) {
            this._level = newLevel;
            this.onLevelChange?.(this._level);
        }
    }

    public moveShape(direction: "left" | "right" | "down") {
        if (this._isOver || !this.currentShape) return;
        this.currentShape.move(direction, this.checkCollision.bind(this));
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
                    displayBoard[y][x] = this.currentShape.color;
                }
            }
        }
        return displayBoard;
    }
}