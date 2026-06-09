import Phaser from 'phaser';
import type { PlayerConfig } from '../config/gameConfig';

const TOKEN_SIZE = 76;
const FACE_RADIUS = 28;

export function createPlayerTokenTexture(scene: Phaser.Scene, config: PlayerConfig): string {
  const key = `token_${config.id}`;
  if (scene.textures.exists(key)) return key;

  const faceKey = `face_${config.id}`;
  const canvas = scene.textures.createCanvas(key, TOKEN_SIZE, TOKEN_SIZE);
  if (!canvas) return key;

  const ctx = canvas.getContext();
  const cx = TOKEN_SIZE / 2;
  const cy = TOKEN_SIZE / 2;
  const colorHex = config.color.toString(16).padStart(6, '0');

  ctx.clearRect(0, 0, TOKEN_SIZE, TOKEN_SIZE);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 24, FACE_RADIUS * 0.82, FACE_RADIUS * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, FACE_RADIUS + 5, 0, Math.PI * 2);
  ctx.fillStyle = `#${colorHex}`;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  if (scene.textures.exists(faceKey)) {
    const faceSource = scene.textures.get(faceKey).getSourceImage() as CanvasImageSource;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, FACE_RADIUS - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceSource, cx - FACE_RADIUS, cy - FACE_RADIUS, FACE_RADIUS * 2, FACE_RADIUS * 2);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.ellipse(cx - FACE_RADIUS * 0.28, cy - FACE_RADIUS * 0.32, FACE_RADIUS * 0.32, FACE_RADIUS * 0.18, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, FACE_RADIUS + 5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  canvas.refresh();
  return key;
}

export const TOKEN_RADIUS = FACE_RADIUS + 5;
