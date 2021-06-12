import Enemy from "./enemy.js"
export default class TeleporterEnemy extends Enemy {
  constructor(scene, x, y, directionX, directionY, velocity) {
    super(scene, x, y, directionX, directionY, velocity, "vinilo2");

    this.scene = scene;
    this.movementTime = 1;
    this.currenMovementTime = 0;

    this.canMove = false;
  }

  update(dt) {
    super.update();

    this.currenMovementTime += dt;
    if (this.currenMovementTime >= this.movementTime)
    {
      this.canMove = !this.canMove;
      this.movementTime = Math.random() * 1 + 1;
      this.currenMovementTime = 0;
      if (this.canMove)
      {
        this.directionX = this.scene.getRandomFloat(-1, 1);
        this.directionY = this.scene.getRandomFloat(-1, 1);
        this.body.setVelocity(this.directionX * this.velocity, this.directionY * this.velocity);
      }
      else
      {
        this.body.setVelocity(0);
      }
    }

    if (this.canMove)
    {
      this.rotate(10 * this.directionX);
    }
  }

  destroy() {
    this.destroy();
  }
}