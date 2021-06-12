import Enemy from "./enemy.js"
export default class FollowerEnemy extends Enemy {
  constructor(scene, x, y, directionX, directionY, velocity = 1) {
    super(scene, x, y, directionX, directionY, velocity, "vinilo");

    this.followTime = 3;
    this.currentFollowTime = 0;
    this.velocity = 10;
    this.body.setVelocity(this.directionX * this.velocity, this.directionY * this.velocity);
  }

  update(dt) {
    super.update();

    this.currentFollowTime += dt;
    if (this.scene.player != null && this.currentFollowTime < this.followTime)
    {
      var dx = this.scene.player.sprite.x - this.x;
      var dy = this.scene.player.sprite.y - this.y;

      var module = Math.sqrt(dx * dx + dy * dy);
      this.body.setVelocity((dx / module) * this.velocity, (dy / module) * this.velocity);

      this.velocity *= 1.007;
    }
  }

  destroy() {
    this.destroy();
  }
}