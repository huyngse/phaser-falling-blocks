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

    constructor() {
        super("HudScene");
    }

    create() {
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

        this.add.image(550, 70, ASSETS.images.next_bg).setOrigin(0, 0);
        this.queueGroup = this.add.group();
        const previewStartX = 595;
        const previewStartY = 140;

        const gameScene = this.scene.get("GameScene");
        gameScene.events.on("scoreChanged", (score: number) => {
            this.scoreText.setText(String(score).padStart(6, "0"));
        });

        gameScene.events.on("queueChanged", (queue: ShapeType[]) => {
            this.updateQueueDisplay(queue, previewStartX, previewStartY);
        });
    }

    private updateQueueDisplay(queue: ShapeType[], x: number, y: number) {
        this.queueGroup.clear(true, true);

        const spacingY = 55;

        queue.forEach((shape, i) => {
            const shapeContainer = this.createShapePreview(shape, x, y + i * spacingY);
            const bounds = shapeContainer.getBounds();
            shapeContainer.x = x - bounds.width / 2;
            shapeContainer.y = y + i * spacingY - bounds.height / 2;
            this.queueGroup.add(shapeContainer);
        });
    }

    private createShapePreview(shape: ShapeType, x: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const color = SHAPE_COLORS[shape];
        const layout = SHAPES[shape];
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                if (layout[row][col] === 0) continue;
                const image = this.add.image(col * CONFIG.tileSize, row * CONFIG.tileSize, ASSETS.images.block);
                image.setTint(brightenColor(color, 0.5));
                container.add(image);
            }
        }
        container.setScale(0.6);
        return container;
    }
}