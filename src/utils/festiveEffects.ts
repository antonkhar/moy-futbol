import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';

const FLOAT_EMOJIS = ['🎂', '🎈', '🎉', '🍺', '⚽', '🥳', '🎁', '✨'];

export function addFloatingEmojis(scene: Phaser.Scene, width: number, height: number): void {
  for (let i = 0; i < 12; i++) {
    const emoji = FLOAT_EMOJIS[i % FLOAT_EMOJIS.length]!;
    const x = Phaser.Math.Between(30, width - 30);
    const y = Phaser.Math.Between(40, height - 40);
    const text = scene.add.text(x, y, emoji, { fontSize: `${Phaser.Math.Between(18, 28)}px` });
    text.setAlpha(0.55);
    text.setDepth(1);

    scene.tweens.add({
      targets: text,
      y: y + Phaser.Math.Between(-25, 25),
      x: x + Phaser.Math.Between(-15, 15),
      angle: Phaser.Math.Between(-15, 15),
      duration: Phaser.Math.Between(2000, 3500),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: i * 150,
    });
  }
}

export function addSparkleBurst(scene: Phaser.Scene, x: number, y: number): void {
  for (let i = 0; i < 8; i++) {
    const star = scene.add.text(x, y, '✨', { fontSize: '16px' });
    star.setDepth(100);
    const angle = (i / 8) * Math.PI * 2;
    scene.tweens.add({
      targets: star,
      x: x + Math.cos(angle) * 60,
      y: y + Math.sin(angle) * 60,
      alpha: 0,
      scale: 1.5,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => star.destroy(),
    });
  }
}

export function addFieldFestiveDecor(scene: Phaser.Scene, fieldX: number, fieldY: number, fieldW: number, fieldH: number): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0).setDepth(2);

  const banner = scene.add.text(fieldX + fieldW / 2, fieldY - 22, `🎉 С ДР, ${gameConfig.birthdayName}! 🎉`, {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffd166',
    backgroundColor: '#1b4332',
    padding: { x: 14, y: 6 },
  });
  banner.setOrigin(0.5);
  container.add(banner);

  scene.tweens.add({
    targets: banner,
    scaleX: 1.04,
    scaleY: 1.04,
    duration: 900,
    yoyo: true,
    repeat: -1,
  });

  const corners = [
    { x: fieldX - 8, y: fieldY, flip: 1 },
    { x: fieldX + fieldW + 8, y: fieldY, flip: -1 },
    { x: fieldX - 8, y: fieldY + fieldH, flip: 1 },
    { x: fieldX + fieldW + 8, y: fieldY + fieldH, flip: -1 },
  ];

  corners.forEach((corner, i) => {
    const pole = scene.add.rectangle(corner.x, corner.y, 4, 36, 0xffffff);
    const flag = scene.add.triangle(
      corner.x + 14 * corner.flip,
      corner.y - 10,
      0, 0,
      28 * corner.flip, 8,
      0, 16,
      [0xef476f, 0xffd166, 0x4cc9f0, 0x06d6a0][i]!,
    );
    container.add([pole, flag]);

    scene.tweens.add({
      targets: flag,
      scaleX: corner.flip * 1.15,
      duration: 700 + i * 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  });

  const gifts = ['🎁', '🍰', '🥤'];
  gifts.forEach((gift, i) => {
    const g = scene.add.text(fieldX - 40, fieldY + 80 + i * 90, gift, { fontSize: '26px' });
    container.add(g);
    scene.tweens.add({
      targets: g,
      y: g.y - 8,
      duration: 1000 + i * 200,
      yoyo: true,
      repeat: -1,
    });
  });

  return container;
}

export function addIntroConfettiRain(scene: Phaser.Scene, width: number): void {
  const colors = [0xef476f, 0xffd166, 0x06d6a0, 0x4cc9f0, 0xf72585];

  scene.time.addEvent({
    delay: 280,
    loop: true,
    callback: () => {
      const x = Phaser.Math.Between(0, width);
      const piece = scene.add.rectangle(x, -10, Phaser.Math.Between(6, 12), Phaser.Math.Between(8, 16), Phaser.Utils.Array.GetRandom(colors));
      piece.setAngle(Phaser.Math.Between(0, 360));
      piece.setDepth(50);
      piece.setAlpha(0.85);

      scene.tweens.add({
        targets: piece,
        y: scene.scale.height + 20,
        x: x + Phaser.Math.Between(-40, 40),
        angle: piece.angle + Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(2500, 4000),
        onComplete: () => piece.destroy(),
      });
    },
  });
}

export function shakeCamera(scene: Phaser.Scene): void {
  scene.cameras.main.shake(250, 0.008);
}
