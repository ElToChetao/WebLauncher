export default class LoadScene extends Phaser.Scene{
  constructor() {
    super("bootGame");
  }

  preload() {
    this.load.image("tiles", "../assets/tilesets/tileSeet.png");
    for(let i = 0; i < 4; i++)
    {
      this.load.tilemapTiledJSON("map"+i, "../assets/tilemaps/Map" + i + ".json");
    }

    //Player
    this.load.spritesheet(
      "characters",
      "../assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );

    // Font
    this.loadFont("Text", '/assets/fonts/phaserbankb.ttf');

    // ladder
    this.load.image("ladder", "/assets/sprites/ladder.png");

    // Bullet
    this.load.image("bullet", "/assets/sprites/bullet.png");

    // Money
    this.load.image("coin", "/assets/sprites/money.png");

    // Fade
    this.load.image("fade", "/assets/sprites/fade.png");

    // Enemies
    this.load.image("coin", "/assets/sprites/coin.png");
    this.load.image("cd", "/assets/sprites/cd.png");
    this.load.image("cd2", "/assets/sprites/cd2.png");
    this.load.image("vinilo", "/assets/sprites/vinilo.png");
    this.load.image("vinilo2", "/assets/sprites/vinilo2.png");
    this.load.image("blood", "/assets/sprites/blood.png");
    this.load.image("dust", "/assets/sprites/dust.png");
    this.load.image("dust2", "/assets/sprites/dust2.png");
    this.load.image("blood-drop", "/assets/sprites/blood-drop.png");
    
    // Audio
    this.load.audio("chop", "/assets/sounds/chop.wav");
    this.load.audio("ladder", "/assets/sounds/ladder.wav");
    this.load.audio("pop2", "/assets/sounds/pop.mp3");
    this.load.audio("coin", "/assets/sounds/coin.wav");
    this.load.audio("bso", "/assets/sounds/bso.mp3");
  }

  create()
  {
    this.add.text(20, 20, "Loading game...");
    this.scene.start("playGame");
    this.sound.add("bso", {volume: 0.2}).play();
  }

  loadFont(name, url) {
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
      document.fonts.add(loaded);
    }).catch(function (error) {
      return error;
    });
  }
}