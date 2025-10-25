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

    private heldShape: Shape | null = null;
    private canHold = true;

    public onScoreChange?: (score: number) => void;
    public onQueueChange?: (queue: Shape[]) => void;
    public onLevelChange?: (level: number) => void;
    public onHoldChange?: (shape: Shape | null) => void;
    public onLockShape?: (cleared: number) => void;

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
                this.onLockShape?.(cleared);
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
        this.canHold = true;
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

    public holdShape() {
        if (!this.currentShape || !this.canHold) return;
        if (this.heldShape) {
            const temp = this.currentShape;
            this.currentShape = this.heldShape;
            this.currentShape.x = Math.floor(this.width / 2) - 1;
            this.currentShape.y = 0;
            this.heldShape = temp;
        } else {
            this.heldShape = this.currentShape;
            this.spawnNewShape();
        }

        this.canHold = false;
        this.onHoldChange?.(this.heldShape);
    }

    private getGhostShape(): Shape | null {
        if (!this.currentShape) return null;
        const ghost = this.currentShape.clone();

        while (!this.board.isCollision(ghost.x, ghost.y + 1, ghost.currentPattern)) {
            ghost.y += 1;
        }
        return ghost;
    }

    public getBoard(): number[][] {
        const displayBoard = this.board.getBoard();

        const ghost = this.getGhostShape();
        if (ghost) {
            for (const { x, y } of ghost.getBlockPositions()) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    displayBoard[y][x] = -1;
                }
            }
        }

        if (this.currentShape) {
            for (const { x, y } of this.currentShape.getBlockPositions()) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    displayBoard[y][x] = this.currentShape.color;
                }
            }
        }
        return displayBoard;
    }

    public getHeldShape() {
        return this.heldShape;
    }
}