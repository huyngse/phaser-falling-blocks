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
    private grid: (number)[][] = [];

    constructor() {
        super("GameScene");
    }

    create() {
        const graphics = this.add.graphics();
        this.grid = Array.from({ length: CONFIG.rows }, () => {
            return Array(CONFIG.cols).fill(0);
        });

        this.add.image(0, 0, ASSETS.images.background).setDepth(-1).setOrigin(0, 0);

        graphics.lineStyle(1, 0xffffff, 1);
        graphics.strokeRect(275, 65, 250, 500);

        this.playfield = this.add.container(275, 65);

    }

    update(time: number) {
      
    }


 

}