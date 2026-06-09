import Phaser from 'phaser';

export interface JoystickVector {
  x: number;
  y: number;
}

export class VirtualJoystick {
  private readonly base: Phaser.GameObjects.Arc;
  private readonly thumb: Phaser.GameObjects.Arc;
  private readonly maxRadius: number;
  private active = false;
  private vector: JoystickVector = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number) {
    this.maxRadius = radius;
    this.base = scene.add.circle(x, y, radius, color, 0.2);
    this.base.setStrokeStyle(3, color, 0.5);
    this.thumb = scene.add.circle(x, y, radius * 0.4, color, 0.6);
    this.thumb.setStrokeStyle(2, 0xffffff, 0.8);

    const zone = scene.add.zone(x, y, radius * 2.5, radius * 2.5).setInteractive();
    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onDown(pointer));
    zone.on('pointermove', (pointer: Phaser.Input.Pointer) => this.onMove(pointer));
    zone.on('pointerup', () => this.onUp());
    zone.on('pointerout', () => this.onUp());
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    this.active = true;
    this.updateThumb(pointer);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (!this.active || !pointer.isDown) return;
    this.updateThumb(pointer);
  }

  private onUp(): void {
    this.active = false;
    this.vector = { x: 0, y: 0 };
    this.thumb.setPosition(this.base.x, this.base.y);
  }

  private updateThumb(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - this.base.x;
    const dy = pointer.y - this.base.y;
    const dist = Math.min(Math.hypot(dx, dy), this.maxRadius);
    const angle = Math.atan2(dy, dx);

    const tx = this.base.x + Math.cos(angle) * dist;
    const ty = this.base.y + Math.sin(angle) * dist;
    this.thumb.setPosition(tx, ty);

    this.vector = {
      x: (Math.cos(angle) * dist) / this.maxRadius,
      y: (Math.sin(angle) * dist) / this.maxRadius,
    };
  }

  getVector(): JoystickVector {
    return this.vector;
  }

  setVisible(visible: boolean): void {
    this.base.setVisible(visible);
    this.thumb.setVisible(visible);
  }

  destroy(): void {
    this.base.destroy();
    this.thumb.destroy();
  }
}
