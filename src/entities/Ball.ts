import Phaser from 'phaser';

export const BALL_RADIUS = 14;
export const BALL_TEXTURE_KEY = 'ball';
export const BALL_IMAGE_PATH = '/assets/ball.png';

/** Базовый отскок 0.85 + ~22% */
const BALL_BOUNCE = 1.0;

export class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists(BALL_TEXTURE_KEY)) {
      createFallbackBallTexture(scene);
    }

    super(scene, x, y, BALL_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2);
    this.setCircle(BALL_RADIUS);
    this.setBounce(BALL_BOUNCE);
    this.setCollideWorldBounds(true);
    this.setDrag(32);
    this.setMaxVelocity(520);
  }
}

export function createFallbackBallTexture(scene: Phaser.Scene): void {
  const key = BALL_TEXTURE_KEY;
  if (scene.textures.exists(key)) return;

  const size = BALL_RADIUS * 2 + 4;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff, 1);
  g.fillCircle(size / 2, size / 2, BALL_RADIUS);
  g.lineStyle(2, 0x1b4332, 1);
  g.strokeCircle(size / 2, size / 2, BALL_RADIUS);
  g.lineStyle(1, 0x1b4332, 0.6);
  g.strokeCircle(size / 2 - 4, size / 2 - 3, 5);
  g.strokeCircle(size / 2 + 5, size / 2 + 2, 4);
  g.generateTexture(key, size, size);
  g.destroy();
}
