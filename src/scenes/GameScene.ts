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

    constructor() {
        super("GameScene");
    }

    create() {
        this.graphics = this.add.graphics();
        this.gameLogic = new Game(CONFIG.cols, CONFIG.rows);

        // this.add.image(0, 0, ASSETS.images.background).setDepth(-1).setOrigin(0, 0);

        // this.graphics.lineStyle(1, 0xffffff, 1);
        // this.graphics.strokeRect(275, 65, 250, 500);

        this.playfield = this.add.container(275, 65);

        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-LEFT", () => this.gameLogic.moveShape("left"));
            this.input.keyboard.on("keydown-RIGHT", () => this.gameLogic.moveShape("right"));
            this.input.keyboard.on("keydown-DOWN", () => this.gameLogic.moveShape("down"));
            this.input.keyboard.on("keydown-UP", () => this.gameLogic.rotateShape("clockwise"));
            this.input.keyboard.on("keydown-Z", () => this.gameLogic.rotateShape("counterclockwise"));
            this.input.keyboard.on("keydown-X", () => this.gameLogic.rotateShape("clockwise"));
        }

        this.gameLogic.spawnNewShape();
    }

    update(time: number, delta: number) {
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
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const color = board[row][col];
                if (color !== 0) {
                    this.graphics.fillStyle(color, 1);
                    this.graphics.fillRect(
                        col * this.tileSize,
                        row * this.tileSize,
                        this.tileSize - 1,
                        this.tileSize - 1
                    );
                } else {
                    this.graphics.lineStyle(1, 0x222222, 0.2);
                    this.graphics.strokeRect(
                        col * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
        }
    }
}