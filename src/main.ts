import "./style.css";
import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import PreloadScene from "./scenes/PreloadScene";
import HudScene from "./scenes/HudScene";
import GameOverScene from "./scenes/GameOverScene";

window.onerror = function (message, source, lineno, colno, _error) {
  console.error("Crash detected! ", message, "at", source, lineno + ":" + colno);
  alert("Oops! Something went wrong. The game will reload!");
  window.location.reload();
  return true;
};

window.addEventListener('unhandledrejection', function (event) {
  console.error("Unhandled Promise Rejection", event.reason);
  alert("Oops! Something went wrong in a promise!");
  window.location.reload();
});


const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene, HudScene, GameOverScene],
};

new Phaser.Game(config);