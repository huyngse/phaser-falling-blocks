import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";

export default class HudScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private starImage!: Phaser.GameObjects.Image;
    constructor() {
        super("HudScene");
    }

    preload() {

    }

    create() {
        const { width } = this.scale;
        this.scoreText = this.add.text(0, 0, "000000", {
            fontSize: "32px",
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

        const gameScene = this.scene.get("GameScene");
        gameScene.events.on("scoreChanged", (score: number) => {
            this.scoreText.setText(String(score).padStart(6, "0"));
        })
    }
}