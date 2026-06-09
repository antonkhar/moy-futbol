import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { PlayerConfig } from '../config/gameConfig';
import { createPlayerTokenTexture } from '../utils/tokenTexture';
import { BALL_IMAGE_PATH, BALL_TEXTURE_KEY, createFallbackBallTexture } from '../entities/Ball';
import { assetUrl } from '../utils/assetUrl';
import { isGameUnlocked } from '../utils/unlockGate';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    if (!isGameUnlocked()) return;

    for (const player of gameConfig.players) {
      this.load.image(`face_${player.id}`, assetUrl(player.face));
    }
    this.load.image(BALL_TEXTURE_KEY, assetUrl(BALL_IMAGE_PATH));

    this.load.on('loaderror', (file: { key: string }) => {
      if (file.key === BALL_TEXTURE_KEY) {
        createFallbackBallTexture(this);
        return;
      }
      const player = gameConfig.players.find((p) => `face_${p.id}` === file.key);
      if (player) {
        createPlaceholderFace(this, player);
      }
    });
  }

  create(): void {
    if (!isGameUnlocked()) {
      this.scene.start('LockedScene');
      return;
    }

    if (!this.textures.exists(BALL_TEXTURE_KEY)) {
      createFallbackBallTexture(this);
    }

    for (const player of gameConfig.players) {
      const faceKey = `face_${player.id}`;
      if (!this.textures.exists(faceKey)) {
        createPlaceholderFace(this, player);
      }
      createPlayerTokenTexture(this, player);
    }
    this.scene.start('IntroScene');
  }
}

export function createPlaceholderFace(scene: Phaser.Scene, player: PlayerConfig): void {
  const faceKey = `face_${player.id}`;
  if (scene.textures.exists(faceKey)) return;

  const size = 128;
  const colorHex = player.color.toString(16).padStart(6, '0');
  const canvas = scene.textures.createCanvas(faceKey, size, size);
  if (!canvas) return;

  const ctx = canvas.getContext();
  ctx.fillStyle = `#${colorHex}`;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.name.charAt(0), size / 2, size / 2);
  canvas.refresh();
}
