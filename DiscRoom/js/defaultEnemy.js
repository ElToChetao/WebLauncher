import Enemy from "./enemy.js"
export default class DefaultEnemy extends Enemy {
  constructor(scene, x, y, directionX, directionY, velocity) {
    super(scene, x, y, directionX, directionY, velocity, "cd2");

    this.body.setVelocity(directionX * this.velocity, directionY * this.velocity);
  }

  update(dt) {
    super.update();
  }

  destroy() {
    this.destroy();
  }
}