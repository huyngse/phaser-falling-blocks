import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";
import type { ShapeType } from "../types/shape";
import { SHAPES, SHAPE_COLORS } from "../constants/shape";
import { CONFIG } from "../config/gameConfig";
import { brightenColor } from "../utils/color";

export default class HudScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private starImage!: Phaser.GameObjects.Image;
    private queueGroup!: Phaser.GameObjects.Group;

    private readonly queueStart = { x: 595, y: 140 };
    private readonly queueSpacing = 55;

    constructor() {
        super("HudScene");
    }

    create() {
        this.createScoreDisplay();
        this.createQueueDisplay();

        this.registerGameEvents();
    }

    private createScoreDisplay() {
        const { width } = this.scale;
        this.scoreText = this.add.text(0, 0, "000000", {
            fontSize: "28px",
            fontFamily: "Quicksand",
            letterSpacing: 1
        });

        this.starImage = this.add.image(0, 0, ASSETS.images.star);
        this.starImage.setOrigin(0, 0);
        const spacing = 10;
        const totalWidth = this.scoreText.width + spacing + this.starImage.width;
        const startX = (width - totalWidth) / 2;
        this.starImage.setPosition(startX, 22);
        this.scoreText.setPosition(startX + spacing + this.starImage.width, 20);
    }

    private createQueueDisplay() {
        this.add.image(550, 70, ASSETS.images.next_bg).setOrigin(0, 0);
        this.queueGroup = this.add.group();
    }

    private registerGameEvents() {
        const gameScene = this.scene.get("GameScene");
        gameScene.events.on("scoreChanged", this.updateScore, this);

        gameScene.events.on("queueChanged", this.updateQueue, this);
    }

    private updateScore(score: number) {
        this.scoreText.setText(score.toString().padStart(6, "0"));
    }

    private updateQueue(queue: ShapeType[]) {
        this.queueGroup.clear(true, true);

        queue.forEach((shape, index) => {
            const preview = this.createShapePreview(shape);
            const bounds = preview.getBounds();

            preview.setPosition(
                this.queueStart.x - bounds.width / 2,
                this.queueStart.y + index * this.queueSpacing - bounds.height / 2
            );

            this.queueGroup.add(preview);
        });
    }

    private createShapePreview(shape: ShapeType): Phaser.GameObjects.Container {
        const container = this.add.container(0, 0);
        const color = SHAPE_COLORS[shape];
        const layout = SHAPES[shape];

        layout.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === 0) return;
                const block = this.add.image(
                    colIndex * CONFIG.tileSize,
                    rowIndex * CONFIG.tileSize,
                    ASSETS.images.block
                );

                block.setTint(brightenColor(color, 0.5));
                container.add(block);
            })
        })

        container.setScale(0.6);
        return container;
    }
}