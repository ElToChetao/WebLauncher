export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    const anims = scene.anims;
    anims.create({
      key: "player-walk",
      frames: anims.generateFrameNumbers("characters", { start: 46, end: 49 }),
      frameRate: 8,
      repeat: -1
    });
    anims.create({
      key: "player-walk-back",
      frames: anims.generateFrameNumbers("characters", { start: 65, end: 68 }),
      frameRate: 8,
      repeat: -1
    });

    this.sprite = scene.physics.add
      .sprite(x, y, "characters", 0)
      .setSize(22, 33)
      .setOffset(23, 27);

    this.sprite.anims.play("player-walk");
    this.sprite.anims.stop();

    this.keys = scene.input.keyboard.createCursorKeys();
    this.shift = scene.input.keyboard.addKey(16);

    this.isDashing = false;
    this.dead = false;
    this.canDash = true;
    this.dashTime = 0.2;
    this.currentDashTime = 0;

    this.dashCD = 1;
    this.currenDashCD = 0;

    this.freezed = false;

    this.particles = scene.add.particles("dust");
    this.emmiter = this.particles.createEmitter({
      lifespan: 500,
      speed: { min: 20, max: 50 },
      angle: 0,
      scale: { start: 0.4, end: 0 },
      quantity: 0,
    });

    this.bloodParticles = scene.add.particles("blood-drop");
    this.bloodEmmiter = this.bloodParticles.createEmitter({
      lifespan: 500,
      speed: { min: 100, max: 150 },
      scale: { start: 2, end: 0 },
      quantity: 0,
    });
  }

  freeze() {
    this.sprite.body.moves = false;
    this.freezed = true;
    this.sprite.anims.stop();
  }
  unFreeze() {
    this.sprite.body.moves = true;
    this.freezed = false;
  }

  vulnerable()
  {
    return !this.isDashing && !this.scene.invulnerable;
  }

  update(dt) {
    const keys = this.keys;
    const sprite = this.sprite;
    const speed = 300;
    const dashSpeed = speed * 2;

    this.move(keys, sprite, speed, dashSpeed, dt);
  }

  move(keys, sprite, speed, dashSpeed, dt) {
    var hInput = 0;
    var vInput = 0;

    if (!this.freezed)
    {
      hInput += keys.right.isDown - keys.left.isDown;
      vInput += keys.down.isDown - keys.up.isDown;
    
      this.applyMovement(hInput, sprite, speed, dashSpeed, dt, vInput);
      this.updateSprite(hInput, vInput, sprite);

      if(this.isDashing)
      {
        var angle = Math.atan2(-vInput, -hInput) - Math.atan2(0, 1);
        this.emmiter.setPosition(this.sprite.x, this.sprite.y + 30);
        this.emmiter.setAngle(angle * (180 / Math.PI) + Math.random() * 30 - 15);
        this.emmiter.emitParticle(2);
      }
    }
  }

  applyMovement(hInput, sprite, speed, dashSpeed, dt, vInput) {
    if (hInput < 0) {
      sprite.setFlipX(true);
    }
    else if (hInput > 0) {
      sprite.setFlipX(false);
    }

    if (this.canDash && !this.isDashing && this.shift.isDown) {
      this.isDashing = true;
      this.canDash = false;
      this.currenDashCD = 0;
    }

    var velocity = speed;
    if (this.isDashing) {
      velocity = dashSpeed;
      this.currentDashTime += dt;
      if (this.currentDashTime >= this.dashTime) {
        this.isDashing = false;
        this.currentDashTime = 0;
      }
    }
    else if (!this.canDash) {
      this.currenDashCD += dt;
      if (this.currenDashCD >= this.dashCD) {
        this.canDash = true;
      }
    }

    if(this.isDashing)
    {
      sprite.setTint(0xdcdcdc);
    }
    else
    {
      sprite.clearTint();
    }

    sprite.body.setVelocity(hInput * velocity, vInput * velocity);
    sprite.body.velocity.normalize().scale(velocity);
  }

  updateSprite(hInput, vInput, sprite) {
    if (hInput != 0 || vInput > 0) {
      sprite.anims.play("player-walk", true);
    }
    else if (vInput < 0) {
      sprite.anims.play("player-walk-back", true);
    }
    else {
      sprite.anims.stop();

      // If we were moving, pick and idle frame to use
      if (vInput < 0)
        sprite.setTexture("characters", 65);

      else
        sprite.setTexture("characters", 46);
    }
  }

  destroy() {
    this.bloodEmmiter.setPosition(this.sprite.x, this.sprite.y + 30);
    this.bloodEmmiter.emitParticle(20);
    this.sprite.destroy();
  }
}
