export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, directionX, directionY, velocity, sprite = "bullet") {
    super(scene, x, y, sprite);

    this.scene = scene;
    scene.add.existing(this);

    scene.physics.world.enableBody(this);
    scene.enemies.add(this);
    this.directionX = directionX;
    this.directionY = directionY;
    this.velocity = velocity;

    this.horizontalBorder = false;
    this.verticalBorder   = false;

    this.particles = scene.add.particles("dust2");
    this.emmiter = this.particles.createEmitter({
      lifespan: 500,
      speed: { min: 20, max: 50 },
      scale: { start: 1, end: 0 },
      quantity: 0,
    });
  }

  update(dt) {
    this.rotate(3);
    this.horizontalBorder = false;
    this.verticalBorder   = false;

    if (this.x < this.scene.tileSize)
    {
      this.x = this.scene.tileSize;
      this.horizontalBorder = true;
    }
    else if (this.x > this.scene.roomSize - this.scene.tileSize)
    {
      this.x = this.scene.roomSize - this.scene.tileSize;
      this.horizontalBorder = true;
    }
    if (this.y < 2.5 * this.scene.tileSize)
    {
      this.y = 2.5 * this.scene.tileSize;
      this.verticalBorder = true;

    }
    else if (this.y > this.scene.roomSize - this.scene.tileSize)
    {
      this.y = this.scene.roomSize - this.scene.tileSize;
      this.verticalBorder = true;
    }

    if (this.onHorizontalBorder()) 
    {
      this.directionX *= -1;
      this.body.setVelocityX(this.directionX * this.velocity);
    }
    if (this.onVerticalBorder())
    {
      this.directionY *= -1;
      this.body.setVelocityY(this.directionY * this.velocity);
    }
  }
  rotate(angle)
  {
    this.angle += angle;
  }
  onHorizontalBorder()
  {
    return this.horizontalBorder;
  }
  onVerticalBorder()
  {
    return this.verticalBorder;
  }

  destroy() {
    this.destroy();
  }

  setEnable(choice)
  {
    this.setActive(choice).setVisible(choice);

    if(!choice)
    {
      this.emmiter.setPosition(this.x, this.y);
      this.emmiter.emitParticle(20);
      this.scene.sound.add("pop2").play();
    }
  }

  freeze()
  {
    this.body.moves = false;
  }
}