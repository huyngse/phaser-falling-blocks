import type { ShapeType } from "../types/shape";
import { SHAPES, SHAPE_COLORS } from "../constants/shape";

export default class Shape {
    private _width = 0;
    private _height = 0;
    private _currentPattern!: number[][];
    private _tintColor = 0xffffff;
    private _x: number;
    private _y: number;
    private _type: ShapeType;

    public get x() { return this._x; }
    public get y() { return this._y; }
    public get width() { return this._width }
    public get height() { return this._height }
    public get color() { return this._tintColor }
    public get currentPattern() { return this._currentPattern }
    public get type() { return this._type }

    constructor(
        x: number,
        y: number,
        type: ShapeType
    ) {
        this._x = x;
        this._y = y;
        this._type = type;
        this.createBlock();
    }

    private createBlock() {
        const shapePattern = SHAPES[this._type];
        this._currentPattern = shapePattern.map(row => [...row]);
        this._tintColor = SHAPE_COLORS[this._type] || 0xffffff;
        this.updateDimensions();
    }

    private updateDimensions() {
        this._height = this._currentPattern.length;
        this._width = this._currentPattern[0].length;
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

        if (!checkCollision || !checkCollision(newX, newY, this._currentPattern)) {
            this._x = newX;
            this._y = newY;
        }
    }

    public rotate(direction: 'clockwise' | "counterclockwise" = 'clockwise') {
        let newPattern;
        if (direction === 'clockwise') {
            newPattern = this._currentPattern[0].map((_, colIndex) =>
                this._currentPattern.map(row => row[colIndex]).reverse()
            );
        } else if (direction === 'counterclockwise') {
            newPattern = this._currentPattern[0].map((_, colIndex) =>
                this._currentPattern.map(row => row[row.length - 1 - colIndex])
            ).reverse();
        } else {
            throw new Error("Invalid direction! Use 'clockwise' or 'counterclockwise'.");
        }

        this._currentPattern = newPattern;
        this.updateDimensions();
    }

    public getBlockPositions(): { x: number; y: number }[] {
        const positions: { x: number; y: number }[] = [];
        for (let row = 0; row < this._currentPattern.length; row++) {
            for (let col = 0; col < this._currentPattern[row].length; col++) {
                if (this._currentPattern[row][col] === 1) {
                    positions.push({
                        x: this.x + col,
                        y: this.y + row
                    });
                }
            }
        }
        return positions;
    }

    public clone(): Shape {
        const copy = new Shape(this.x, this.y, this._type);
        copy._currentPattern = this._currentPattern.map(row => [...row]);
        return copy;
    }
}
