import Player from "./player.js"
import Ladder from "./ladder.js";
import TeleporterEnemy from "./teleporterEnemy.js";
import DefaultEnemy from "./defaultEnemy.js";
import RandomEnemy from "./randomEnemy.js";
import FollowerEnemy from "./followerEnemy.js";

export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super("playGame");
    this.enemies;
    this.timer = 0; 
    this.ladder = null;
    this.endRoom = false;
    this.canNewRoom = false;
    
    this.inMenu = true;

    this.roomSize = 416;
    this.tileSize = 32;
    this.dead = false;

    this.initialStats();

    this.transitionRect;
    this.transitionY = 0;
    this.direction = 1;
    this.isTimeScene = true;

    this.desiredCoins = 10;
    this.currentCoins = 0;

    this.developerMode = false;
    this.invulnerable = false;
  }

  initialStats() {
    this.spawnDelay = 1.5;
    this.currenSpawnTime = 0;

    this.timerMultiplier = 5;
    this.currentDungeonIndex = 1;
    this.unlockedEnemies = 0;

    this.isTimeScene = true;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomFloat(min,max)
  {
    return Math.random() * (max - min) + min;
  }

  create()
  {
    //Add input
    this.enter = this.input.keyboard.addKey('Enter');

    //Reset Variables
    this.timer = this.currentDungeonIndex * this.timerMultiplier + 5;
    this.desiredCoins = this.currentDungeonIndex * 5;

    this.currentCoins = 0;
    this.endRoom = false;
    this.currenSpawnTime = 0;

    //Create Map
    const map = this.make.tilemap({ key: "map"+ this.getRandomInt(0,3)});
    const tileset = map.addTilesetImage("tileSeet", "tiles");
    const ground = map.createStaticLayer("0", tileset, 0, 0);
    const upperWalls = map.createStaticLayer("1", tileset, 0, 0);

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.player = new Player(this, screenCenterX, screenCenterY);

    const walls = map.createStaticLayer("2", tileset, 0, 0);
    walls.depth = 1;
    walls.setCollisionByProperty({Collide:true});
    upperWalls.setCollisionByProperty({Collide:true});

    //Create Stairs
    this.ladder = new Ladder(this,
    this.getRandomInt(this.tileSize*2, this.roomSize - (this.tileSize * 2)),
    this.getRandomInt(this.tileSize*2, this.roomSize - (this.tileSize * 2)));
    
    this.ladder.setEnable(false);

    //Create enemies
    this.createEnemies();
    
    //Enable collisions
    this.physics.add.overlap(this.player.sprite, this.enemies, this.killPlayer, null, this);  
    this.physics.add.overlap(this.player.sprite, this.coins, this.coinCollected, null, this); 
    
    this.physics.add.collider(this.player.sprite, walls);
    this.physics.add.collider(this.player.sprite, upperWalls);
    
    //Hud
    
    this.text = this.add.text(screenCenterX, 35,"" , {fontFamily: 'Text', fontSize: '20px'}).setOrigin(0.5);
    if(this.transitionRect == undefined)
    {
      this.transitionRect = this.add.sprite(screenCenterX, screenCenterY, "fade");
      this.transitionRect.depth = 2;
    }
    this.transitionY = 800;
    if(this.inMenu)
    {
      this.menuText = this.add.text(screenCenterX , 35,"", {fontFamily: 'Text', fontSize: '20px'}).setOrigin(0.5);
      this.menuText.setText("Press 'Enter' to start");
    }

    this.dungeonText = this.add.text(screenCenterX , 15,"LEVEL: " + this.currentDungeonIndex, {fontFamily: 'Text', fontSize: '20px'}).setOrigin(0.5);
  }

  updateStats() {

    this.currentDungeonIndex++;
    if (this.unlockedEnemies < 4) {
      this.unlockedEnemies++;
    }
    this.spawnDelay *= 0.95;
  }

  createEnemies() {
    this.enemies = this.add.group();
    this.coins = this.add.group();
  }

  spawnEnemy() {
    var multSpeed = this.unlockedEnemies / 4 + 1;

    var randX;
    var randY;
    var distance;
    do {
      randX = this.getRandomFloat(this.tileSize * 3, this.roomSize - (this.tileSize * 2));
      randY = this.getRandomFloat(this.tileSize * 3, this.roomSize - (this.tileSize * 2));
      var dx = randX - this.player.sprite.x;
      var dy = randY - this.player.sprite.y;
      distance = Math.sqrt((dx * dx) + (dy * dy));
    } while (distance < 50);

    if(!this.isTimeScene)
    {
      var coin = this.coins.create(randX, randY, "coin");
      this.physics.world.enable(coin);
    }
    this.createEnemy(randX, randY, multSpeed );
  }

  async destroyEnemies() {
    const totalTime = 1000;
    var timePerEnemy = totalTime / this.enemies.getChildren().length;
    if(this.player != null)
    {
      this.player.freeze();
    }

    for (let i = 0; i < this.coins.getChildren().length; i++)
    {
      this.coins.getChildren()[i].destroy();
    }
    this.coins.clear();

    for (let i = 0; i < this.enemies.getChildren().length; i++)
    {
      this.enemies.getChildren()[i].freeze();
    }

    for (let i = 0; i < this.enemies.getChildren().length; i++)
    {
      this.enemies.getChildren()[i].setEnable(false);
      await this.sleep(timePerEnemy);
    }

    this.enemies.clear(true);

    this.ladder.setEnable(true);
    this.sound.add("ladder").play();
    this.physics.add.overlap(this.player.sprite, this.ladder, this.newRoom, null, this);
    this.player.unFreeze();
  }

  coinCollected(player, other)
  {
    other.destroy();
    this.coins.remove(other);
    this.sound.add("coin").play();
    this.currentCoins++;
  }
  createEnemy(x, y, speed)
  {
    var type = this.getRandomInt(0, this.unlockedEnemies);
    var dirX = this.getRandomFloat(-1, 1);
    var dirY = this.getRandomFloat(-1, 1);
    switch (type)
    {
      case 0:
        var enemy = new DefaultEnemy(this, x, y, dirX, dirY, speed * this.getRandomFloat(50, 100));
        break;
      case 1:
        var enemy = new TeleporterEnemy(this, x, y, dirX, dirY, speed * this.getRandomFloat(100, 200));
        break;
      case 2:
        var enemy = new RandomEnemy(this, x, y, dirX, dirY, speed * this.getRandomFloat(100, 200));
        break;
      case 3:
        var enemy = new FollowerEnemy(this, x, y, dirX, dirY);
        break;
    }
  }

  killPlayer(player, other)
  {
    if(this.player != null && !this.player.dead && this.player.vulnerable())
    {
      this.sound.add("chop").play();
      this.player.destroy();
      this.player = null;

      if(other != undefined)
      {
        other.setTint(0xff0000);
      }

      //Reload
      this.inMenu = true;
      if(!this.developerMode)
      {
        this.initialStats();
      }
      this.reloadScene();
    }
  }

  async reloadScene()
  {
    this.transitionRect.y = -400;
    this.transitionY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    await this.sleep(2000);
    this.text.setText("");
    this.create();
  }

  newRoom()
  {
    if (this.canNewRoom)
    {
      this.player.freeze();
      this.updateStats();
      this.reloadScene();
      this.canNewRoom = false;
      this.isTimeScene = !this.isTimeScene;
    }
  }

  update(time, delta)
  {
    this.transitionRect.y += 10;
    if(this.transitionRect.y > this.transitionY)
    {
      this.transitionRect.y = this.transitionY;
    }

    if(this.inMenu)
    {
      if(this.enter.isDown)
      {
        this.inMenu = false;
        this.menuText.setText("");
      }
    }
    else
    {
      var dt = delta / 1000;

      this.currenSpawnTime += dt;
      if(this.player != null && !this.endRoom && this.currenSpawnTime >= this.spawnDelay)
      {
        this.currenSpawnTime = 0;
        this.spawnEnemy();
      }

      if(this.isTimeScene)
      {
        this.timeMode(dt);
      }
      else
      {
        this.coinsMode(dt);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  timeMode(dt)
  {
    if(!this.endRoom)
    {
      this.timer -= dt;
      this.timer = Math.max(this.timer,0);
      this.text.setText("" + this.timer.toFixed(2));
    }

    if(this.timer <= 0 && !this.endRoom)
    {
      //Delete enemies
      this.destroyEnemies();

      //Next Scene
      this.canNewRoom = true;
      this.endRoom = true;
    }
    else
    {
      this.updateObjects(dt);
    }
  }
  updateObjects(dt) {
    if(this.enemies.getChildren().length > 10)
    {
      this.enemies.getChildren()[0].setEnable(false);
      this.enemies.remove(this.enemies.getChildren()[0]);
    }
    
    for (let i = 0; i < this.enemies.getChildren().length; i++) {
      this.enemies.getChildren()[i].update(dt);
    }

    if (this.player != null)
      this.player.update(dt);
  }

  coinsMode(dt)
  {
    if(!this.endRoom)
    {
      this.text.setText(this.currentCoins + "/" + this.desiredCoins);
    }
    if(this.currentCoins >= this.desiredCoins && !this.endRoom)
    {
      //Delete enemies
      this.destroyEnemies();

      //Next Scene
      this.canNewRoom = true;
      this.endRoom = true;
    }
    else
    {
      this.updateObjects(dt);
    }
  }
}