import { SHAPES } from "../constants/shape";
import type { ShapeType } from "../types/shape";
import Board from "./Board";
import Shape from "./Shape";

export default class Game {
    private board: Board;
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
        this.board = new Board(width, height);
        this.initializeQueue();
    }

    public update() {
        if (this._isOver) return;

        if (this.currentShape) {
            const oldY = this.currentShape.y;
            this.currentShape.move("down", this.board.isCollision.bind(this.board));

            if (this.currentShape.y === oldY) {
                this.board.lockShape(this.currentShape);
                const cleared = this.board.clearFullLines();
                if (cleared > 0) this.updateScoreAndLevel(cleared);
                this.spawnNewShape();
            }
        }
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
        if (this.board.isCollision(this.currentShape.x, this.currentShape.y, this.currentShape.currentPattern)) {
            this._isOver = true;
        }
    }

    private updateScoreAndLevel(clearedLines: number) {
        let scoreToAdd = clearedLines * 100;
        switch (clearedLines) {
            case 2: scoreToAdd += 50; break;
            case 3: scoreToAdd += 150; break;
            case 4: scoreToAdd += 400; break;
        }

        this._score += scoreToAdd;
        this.linesClearedTotal += clearedLines;
        this.onScoreChange?.(this._score);

        const newLevel = Math.floor(this.linesClearedTotal / 10) + 1;
        if (newLevel > this._level) {
            this._level = newLevel;
            this.onLevelChange?.(this._level);
        }
    }

    public moveShape(direction: "left" | "right" | "down") {
        if (this._isOver || !this.currentShape) return;
        this.currentShape.move(direction, this.board.isCollision.bind(this.board));
    }

    public rotateShape(direction: 'clockwise' | "counterclockwise" = 'clockwise') {
        if (this._isOver || !this.currentShape) return;
        const clone = this.currentShape.clone();
        clone.rotate(direction);
        if (!this.board.isCollision(clone.x, clone.y, clone.currentPattern)) {
            this.currentShape.rotate(direction);
        }
    }

    public getBoard(): number[][] {
        const displayBoard = this.board.getBoard();
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