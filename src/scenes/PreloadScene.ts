import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.image(ASSETS.images.background, "assets/images/background.png");
        this.load.image(ASSETS.images.block, "assets/images/block.png");
        this.load.image(ASSETS.images.filter, "assets/images/filter.png");
        this.load.image(ASSETS.images.hold_bg, "assets/images/hold-bg.png");
        this.load.image(ASSETS.images.level_bg, "assets/images/level-bg.png");
        this.load.image(ASSETS.images.next_bg, "assets/images/next-bg.png");
        this.load.image(ASSETS.images.star, "assets/images/star.png");
    }

    create() {
        this.scene.start("GameScene");
    }
}