import Phaser from "phaser";
import { ASSETS } from "../config/assetKeys";

export default class SoundManager {
    private static instance: SoundManager;
    private scene: Phaser.Scene;
    private soundPools: Map<string, Phaser.Sound.BaseSound[]> = new Map();
    private maxInstances: number = 5;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public static getInstance(scene: Phaser.Scene) {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager(scene);
            SoundManager.instance.create();
        } else {
            SoundManager.instance.scene = scene;
        }
        return SoundManager.instance;
    }

    create() {
        const soundKeys = ASSETS.sounds;
        Object.values(soundKeys).forEach(key => this.createSoundPool(key));
    }

    private createSoundPool(key: string) {
        const oldPool = this.soundPools.get(key);
        if (oldPool) {
            oldPool.forEach(s => s.destroy());
        }

        const pool: Phaser.Sound.BaseSound[] = [];
        for (let i = 0; i < this.maxInstances; i++) {
            const sfx = this.scene.sound.add(key, { volume: 0.5 });
            pool.push(sfx);
        }
        this.soundPools.set(key, pool);
    }

    play(key: string, volume?: number) {
        const pool = this.soundPools.get(key);
        if (!pool) return;


        const available = pool.find(s => !s.isPlaying);
        if (available) {
            if (volume !== undefined && "volume" in available) {
                available.volume = Phaser.Math.Clamp(volume, 0, 1);
            }
            available.play();
        } else {
            const first = pool[0];
            first.stop();
            if (volume !== undefined && "volume" in first) {
                first.volume = Phaser.Math.Clamp(volume, 0, 1);
            }
            first.play();
        }
    }

    stop(key: string) {
        const pool = this.soundPools.get(key);
        if (!pool) return;
        pool.forEach(s => s.stop());
    }

    stopAll() {
        this.soundPools.forEach(pool => pool.forEach(s => s.stop()));
    }

    setVolume(volume: number) {
        const clamped = Phaser.Math.Clamp(volume, 0, 1);
        this.scene.sound.volume = clamped;
        this.soundPools.forEach(pool =>
            pool.forEach(s => {
                if ("volume" in s) {
                    s.volume = clamped
                }
            })
        );
    }

    setMaxInstances(max: number) {
        this.maxInstances = Math.max(1, max);
    }
}