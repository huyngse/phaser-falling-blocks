import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";
import { CONFIG } from "../config/gameConfig";
import Game from "../objects/Game";

export default class GameScene extends Phaser.Scene {
    private gameLogic!: Game;
    private playfield!: Phaser.GameObjects.Container;
    private tileSize = CONFIG.tileSize;
    private dropInteval = CONFIG.dropInteval;
    private dropTimer = 0;
    private graphics!: Phaser.GameObjects.Graphics;
    private tileSprites: Phaser.GameObjects.Image[][] = [];

    constructor() {
        super("GameScene");
    }

    create() {
        this.scene.launch("HudScene");
        this.graphics = this.add.graphics();
        this.gameLogic = new Game(CONFIG.cols, CONFIG.rows);
        this.gameLogic.onScoreChange = (score) => {
            this.events.emit("scoreChanged", score);
        };
        this.gameLogic.onQueueChange = (queue) => {
            const queueData = queue.map(shape => shape.type);
            this.events.emit("queueChanged", queueData);
        }

        this.add.image(0, 0, ASSETS.images.background).setDepth(-1).setOrigin(0, 0);

        this.playfield = this.add.container(275, 15);

        for (let row = CONFIG.hiddenRows; row < CONFIG.rows; row++) {
            this.tileSprites[row] = [];
            for (let col = 0; col < CONFIG.cols; col++) {
                const tileImage = this.add.image(
                    col * this.tileSize,
                    row * this.tileSize,
                    ASSETS.images.block
                );
                tileImage.setOrigin(0, 0);
                tileImage.setVisible(false);
                this.playfield.add(tileImage);
                this.tileSprites[row][col] = tileImage;
            }
        }

        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-LEFT", () => this.gameLogic.moveShape("left"));
            this.input.keyboard.on("keydown-RIGHT", () => this.gameLogic.moveShape("right"));
            this.input.keyboard.on("keydown-DOWN", () => this.gameLogic.moveShape("down"));
            this.input.keyboard.on("keydown-UP", () => this.gameLogic.rotateShape("clockwise"));
            this.input.keyboard.on("keydown-Z", () => this.gameLogic.rotateShape("counterclockwise"));
            this.input.keyboard.on("keydown-X", () => this.gameLogic.rotateShape("clockwise"));
        }

        this.time.delayedCall(500, () => {
            this.gameLogic.spawnNewShape();
        })
    }

    update(_time: number, delta: number) {
        if (this.gameLogic.isOver) {
            return;
        }

        this.dropTimer += delta;
        if (this.dropTimer > this.dropInteval) {
            this.gameLogic.update();
            this.dropTimer -= this.dropInteval;
        }
        this.drawBoard();
    }

    private drawBoard() {
        const board = this.gameLogic.getBoard();
        const rows = board.length;
        const cols = board[0].length;

        this.graphics.clear();
        for (let row = CONFIG.hiddenRows; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const color = board[row][col];
                const tile = this.tileSprites[row][col];
                if (color !== 0) {
                    tile.setVisible(true);
                    tile.setTint(color);
                } else {
                    tile.setVisible(false);
                }
            }
        }
    }
}