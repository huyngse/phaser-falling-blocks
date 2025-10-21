import type { ShapeType } from "../types/shape";
import { SHAPES, SHAPE_COLORS } from "../constants/shape";

export default class Shape {
    public shapeWidth = 0;
    public shapeHeight = 0;
    public currentPattern!: number[][];
    private tintColor = 0xffffff;
    private _x: number;
    private _y: number;

    public get x() { return this._x; }
    public get y() { return this._y; }

    constructor(
        x: number,
        y: number,
        private shapeType: ShapeType
    ) {
        this._x = x;
        this._y = y;
        this.createBlock();
    }

    private createBlock() {
        const shapePattern = SHAPES[this.shapeType];
        this.currentPattern = shapePattern.map(row => [...row]);
        this.tintColor = SHAPE_COLORS[this.shapeType] || 0xffffff;
        this.updateDimensions();
    }

    private updateDimensions() {
        this.shapeHeight = this.currentPattern.length;
        this.shapeWidth = this.currentPattern[0].length;
    }

    public move(
        direction: 'down' | 'left' | 'right',
        checkCollision?: (x: number, y: number, pattern: number[][]) => boolean
    ) {
        let newX = this.x;
        let newY = this.y;

        switch (direction) {
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
        }

        if (!checkCollision || !checkCollision(newX, newY, this.currentPattern)) {
            this._x = newX;
            this._y = newY;
        }
    }

    public rotate(direction: 'clockwise' | "counterclockwise" = 'clockwise') {
        let newPattern;
        if (direction === 'clockwise') {
            newPattern = this.currentPattern[0].map((_, colIndex) =>
                this.currentPattern.map(row => row[colIndex]).reverse()
            );
        } else if (direction === 'counterclockwise') {
            newPattern = this.currentPattern[0].map((_, colIndex) =>
                this.currentPattern.map(row => row[row.length - 1 - colIndex])
            ).reverse();
        } else {
            throw new Error("Invalid direction! Use 'clockwise' or 'counterclockwise'.");
        }

        this.currentPattern = newPattern;
        this.updateDimensions();
    }

    public getBlockPositions(): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];
        for (let row = 0; row < this.currentPattern.length; row++) {
            for (let col = 0; col < this.currentPattern[row].length; col++) {
                if (this.currentPattern[row][col] === 1) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        return positions;
    }

    public getType() {
        return this.shapeType;
    }

    public getColor() {
        return this.tintColor;
    }

    public clone(): Shape {
        const copy = new Shape(this.x, this.y, this.shapeType);
        copy.currentPattern = this.currentPattern.map(row => [...row]);
        return copy;
    }
}
