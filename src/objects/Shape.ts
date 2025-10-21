import Phaser from "phaser";
import { CONFIG } from "../config/gameConfig";
import type { ShapeType } from "../types/shape";
import { SHAPES, SHAPE_COLORS } from "../constants/shape";
import { ASSETS } from "../config/assetKeys";

export default class Shape extends Phaser.GameObjects.Container {
    private blockSize = CONFIG.blockSize;
    public shapeWidth = 0;
    public shapeHeight = 0;
    public currentPattern!: number[][];
    private tintColor = 0xffffff;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        private shapeType: ShapeType
    ) {
        super(scene, x * CONFIG.blockSize, y * CONFIG.blockSize);
        this.createBlock();
    }

    public createBlock() {
        const shapePattern = SHAPES[this.shapeType];
        this.currentPattern = shapePattern;
        this.tintColor = SHAPE_COLORS[this.shapeType] || 0xffffff;
        this.renderPattern(shapePattern);
    }

    public getShapeHeight() {
        let maxY = 0;
        this.iterate((child: Phaser.GameObjects.Image) => {
            if (child.y > maxY) maxY = child.y;
        });
        return maxY + this.blockSize;
    }

    public getShapeWidth() {
        let maxX = 0;
        this.iterate((child: Phaser.GameObjects.Image) => {
            if (child.x > maxX) maxX = child.x;
        });
        return maxX + this.blockSize;
    }

    public dropDown() {
        this.y += this.blockSize;
    }

    public moveLeft() {
        const newX = this.x - this.blockSize;
        if (newX >= 0) {
            this.x = newX;
        }
    }

    public moveRight() {
        const newX = this.x + this.blockSize;
        if (newX + this.shapeWidth <= CONFIG.cols * CONFIG.blockSize) {
            this.x = newX;
        }
    }

    public rotate() {
        const newPattern = this.currentPattern[0].map((_, colIndex) => {
            return this.currentPattern.map(row => row[colIndex]).reverse();
        });
        this.currentPattern = newPattern;

        this.removeAll(true);
        this.renderPattern(newPattern);

        this.x = Phaser.Math.Clamp(this.x, 0, CONFIG.cols * CONFIG.blockSize - this.shapeWidth);
    }

    private renderPattern(pattern: number[][]) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const x = col * this.blockSize;
                    const y = row * this.blockSize;
                    const block = this.scene.add.image(x, y, ASSETS.images.block);
                    block.setOrigin(0, 0)
                    block.setTint(this.tintColor);
                    this.add(block);
                }
            }
        }

        this.shapeHeight = this.getShapeHeight();
        this.shapeWidth = this.getShapeWidth();
    }
}