import Enemy from "./enemy.js"
export default class RandomEnemy extends Enemy {
  constructor(scene, x, y, directionX, directionY, velocity) {
    super(scene, x, y, directionX, directionY, velocity, "cd");

    this.collisionTime = 2;
    this.currentCollisionTime = 0;
    this.body.setVelocity(this.directionX * this.velocity, this.directionY * this.velocity);
  }

  update(dt) {
    super.update();

    this.currentCollisionTime += dt;
    if (this.currentCollisionTime >= this.collisionTime)
    {
      this.collisionTime = Math.random() * 1 + 1;
      this.currentCollisionTime = 0;
      this.directionX *= -1;
      this.directionY *= -1;
      this.body.setVelocity(this.directionX * this.velocity, this.directionY * this.velocity);
    }

  }

  destroy() {
    this.destroy();
  }
}