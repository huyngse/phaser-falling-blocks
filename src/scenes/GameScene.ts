import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";
import { CONFIG } from "../config/gameConfig";
import Shape from "../objects/Shape";

export default class GameScene extends Phaser.Scene {
    private playfield!: Phaser.GameObjects.Container;
    private currentShape: Shape | null = null;
    private blockSize = CONFIG.blockSize;
    private dropSpeed = CONFIG.dropSpeed;
    private lastDropTime = 0;

    constructor() {
        super("GameScene");
    }

    create() {
        const graphics = this.add.graphics();

        this.add.image(0, 0, ASSETS.images.background).setDepth(-1).setOrigin(0, 0);

        graphics.lineStyle(1, 0xffffff, 1);
        graphics.strokeRect(275, 65, 250, 500);

        this.playfield = this.add.container(275, 65);

        this.currentShape = new Shape(this, 0, 0, "L");
        this.playfield.add(this.currentShape);

        this.input.keyboard?.on("keydown-LEFT", () => {
            if (this.currentShape) this.currentShape.moveLeft();
        });

        this.input.keyboard?.on("keydown-RIGHT", () => {
            if (this.currentShape) this.currentShape.moveRight();
        });

        this.input.keyboard?.on("keydown-E", () => {
            console.log("rotate");
            if (this.currentShape) this.currentShape.rotate();
        });
    }

    update(time: number) {
        if (this.currentShape && time > this.lastDropTime + this.dropSpeed) {
            const newY = this.currentShape.y + this.blockSize;
            if (newY + this.currentShape.shapeHeight <= CONFIG.rows * this.blockSize) {
                this.currentShape.y = newY;
            } else {
                this.currentShape = null;
            }
            this.lastDropTime = time;
        }
    }

}