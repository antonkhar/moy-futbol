import Phaser from 'phaser';
import type { PlayerConfig } from '../config/gameConfig';
import { TOKEN_RADIUS } from '../utils/tokenTexture';

const PLAYER_SPEED = 280;

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly playerConfig: PlayerConfig;
  private shadow!: Phaser.GameObjects.Ellipse;
  private sparkle!: Phaser.GameObjects.Arc;
  private movePhase = 0;
  private lastVx = 0;
  private lastVy = 0;
  private celebrating = false;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlayerConfig) {
    super(scene, x, y, `token_${config.id}`);
    this.playerConfig = config;

    this.shadow = scene.add.ellipse(x, y + 26, TOKEN_RADIUS * 1.5, TOKEN_RADIUS * 0.42, 0x000000, 0.22);
    this.shadow.setDepth(5);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);

    this.setCircle(TOKEN_RADIUS - 4);
    this.setCollideWorldBounds(true);
    this.setBounce(0.15);
    this.setDrag(800);
    this.setMaxVelocity(PLAYER_SPEED);

    this.sparkle = scene.add.circle(x, y, TOKEN_RADIUS + 8, config.color, 0);
    this.sparkle.setStrokeStyle(2, 0xffffff, 0);
    this.sparkle.setDepth(9);
  }

  applyInput(vx: number, vy: number): void {
    this.lastVx = vx;
    this.lastVy = vy;
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      this.setVelocity((vx / len) * PLAYER_SPEED, (vy / len) * PLAYER_SPEED);
    } else {
      this.setVelocity(0, 0);
    }
  }

  playGoalCelebration(): void {
    this.celebrating = true;
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.setAngle(0);
        this.setScale(1);
        this.celebrating = false;
      },
    });
    this.scene.tweens.add({
      targets: this.sparkle,
      alpha: { from: 0, to: 0.7 },
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 300,
      yoyo: true,
    });
  }

  playBumpAnimation(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.85,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = body.velocity.length();

    this.shadow.setPosition(this.x, this.y + 24);
    this.shadow.setScale(1 + speed / 2000, 1 - speed / 4000);

    this.sparkle.setPosition(this.x, this.y);

    if (this.celebrating) return;

    if (speed > 40) {
      this.movePhase += delta * 0.012;
      const bounce = 1 + Math.sin(this.movePhase) * 0.07;
      this.setScale(bounce);

      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      this.setRotation(angle * 0.12);

      this.sparkle.setStrokeStyle(2, this.playerConfig.color, 0.25 + Math.sin(this.movePhase) * 0.15);
    } else if (this.lastVx !== 0 || this.lastVy !== 0) {
      this.setScale(1);
      this.setRotation(0);
      this.sparkle.setStrokeStyle(2, this.playerConfig.color, 0);
    } else {
      this.setScale(1 + Math.sin(time * 0.003) * 0.02);
      this.setRotation(0);
      this.sparkle.setStrokeStyle(2, this.playerConfig.color, 0);
    }
  }

  destroy(fromScene?: boolean): void {
    this.shadow.destroy();
    this.sparkle.destroy();
    super.destroy(fromScene);
  }
}
