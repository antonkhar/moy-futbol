import Phaser from 'phaser';

const BALLOON_COLORS = [0xef476f, 0xffd166, 0x06d6a0, 0x4cc9f0, 0x9b5de5, 0xf72585];

export function drawFestiveBackground(scene: Phaser.Scene, width: number, height: number): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);

  const bg = scene.add.graphics();
  bg.fillGradientStyle(0x1b4332, 0x1b4332, 0x2d6a4f, 0x40916c, 1);
  bg.fillRect(0, 0, width, height);
  container.add(bg);

  for (let i = 0; i < 5; i++) {
    const sx = Phaser.Math.Between(40, width - 40);
    const streamer = scene.add.text(sx, 0, ['🎊', '🎉', '✨'][i % 3]!, { fontSize: '22px' });
    container.add(streamer);
    scene.tweens.add({
      targets: streamer,
      y: height + 20,
      x: sx + Phaser.Math.Between(-30, 30),
      angle: Phaser.Math.Between(-30, 30),
      duration: Phaser.Math.Between(4000, 6000),
      repeat: -1,
      delay: i * 800,
      onRepeat: () => {
        streamer.setY(-20);
        streamer.setX(Phaser.Math.Between(40, width - 40));
      },
    });
  }

  for (let i = 0; i < 8; i++) {
    const x = 60 + i * (width / 8);
    const color = BALLOON_COLORS[i % BALLOON_COLORS.length]!;
    const balloon = scene.add.ellipse(x, 80 + (i % 3) * 20, 36, 44, color);
    const highlight = scene.add.ellipse(x - 8, 70 + (i % 3) * 20, 10, 14, 0xffffff, 0.35);
    const string = scene.add.line(0, 0, x, 100 + (i % 3) * 20, x + (i % 2 === 0 ? 10 : -10), 180, 0xffffff, 0.4);
    container.add([string, balloon, highlight]);

    scene.tweens.add({
      targets: balloon,
      y: balloon.y + 12,
      duration: 1800 + i * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: highlight,
      y: highlight.y + 12,
      duration: 1800 + i * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  const garland = scene.add.graphics();
  garland.lineStyle(3, 0xffd166, 0.8);
  garland.beginPath();
  garland.moveTo(0, 40);
  for (let x = 0; x <= width; x += 40) {
    garland.lineTo(x + 20, 55);
    garland.lineTo(x + 40, 40);
  }
  garland.strokePath();
  container.add(garland);

  for (let x = 20; x < width; x += 40) {
    const bulb = scene.add.circle(x, 48, 5, BALLOON_COLORS[(x / 40) % BALLOON_COLORS.length]);
    container.add(bulb);
    scene.tweens.add({
      targets: bulb,
      alpha: { from: 0.4, to: 1 },
      duration: 600 + (x % 400),
      yoyo: true,
      repeat: -1,
    });
  }

  const cake = scene.add.container(width - 90, height - 70);
  const cakeBase = scene.add.rectangle(0, 10, 70, 30, 0xf4a261);
  const cakeTop = scene.add.rectangle(0, -10, 50, 25, 0xe76f51);
  const candle1 = scene.add.rectangle(-12, -28, 6, 18, 0xffd166);
  const candle2 = scene.add.rectangle(0, -30, 6, 20, 0xffd166);
  const candle3 = scene.add.rectangle(12, -28, 6, 18, 0xffd166);
  const flame1 = scene.add.circle(-12, -40, 4, 0xff6b35);
  const flame2 = scene.add.circle(0, -42, 4, 0xff6b35);
  const flame3 = scene.add.circle(12, -40, 4, 0xff6b35);
  cake.add([cakeBase, cakeTop, candle1, candle2, candle3, flame1, flame2, flame3]);
  container.add(cake);

  [flame1, flame2, flame3].forEach((flame) => {
    scene.tweens.add({
      targets: flame,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.7,
      duration: 300,
      yoyo: true,
      repeat: -1,
    });
  });

  return container;
}

export function createTextButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, 220, 56, 0xffd166);
  bg.setStrokeStyle(4, 0xffffff);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Nunito, sans-serif',
    fontSize: '24px',
    fontStyle: 'bold',
    color: '#1b4332',
  });
  text.setOrigin(0.5);
  container.add([bg, text]);
  container.setSize(220, 56);
  container.setInteractive({ useHandCursor: true });

  container.on('pointerover', () => {
    bg.setFillStyle(0xffe08a);
    scene.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
  });
  container.on('pointerout', () => {
    bg.setFillStyle(0xffd166);
    scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
  });
  container.on('pointerdown', onClick);

  return container;
}

export function randomFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
