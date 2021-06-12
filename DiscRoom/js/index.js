import DungeonScene from "./scene.js";
import LoadScene from "./loadScene.js";

const config = {
  type: Phaser.AUTO,
  width: 416,
  height: 416,
  scale:{
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: "#000",
  parent: "game-container",
  pixelArt: true,
  scene: [LoadScene, DungeonScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

var game = new Phaser.Game(config);
