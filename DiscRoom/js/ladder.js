export default class Ladder extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "ladder");
        this.setEnable(false);

        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.particles = scene.add.particles("dust");
        this.emmiter = this.particles.createEmitter({
          lifespan: 1000,
          speed: { min: 30, max: 60 },
          scale: { start: 1, end: 0 },
          quantity: 0,
      });
      this.emmiter.setPosition(this.x, this.y + 20);
    }

    changePosition(x,y)
    {
        this.x = x;
        this.y = y;
    }

    setEnable(choice)
    {
        this.setActive(choice).setVisible(choice);
        if(choice)
        {
          this.emmiter.emitParticle(100);
        }
    }
}
