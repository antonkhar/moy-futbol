import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { drawFestiveBackground, createTextButton, randomFrom } from '../utils/decorations';
import { addFloatingEmojis, addIntroConfettiRain } from '../utils/festiveEffects';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    drawFestiveBackground(this, width, height);
    addFloatingEmojis(this, width, height);
    addIntroConfettiRain(this, width);

    const ballEmoji = this.add.text(width / 2 - 160, height * 0.28, '⚽', { fontSize: '48px' }).setOrigin(0.5);
    const ballEmoji2 = this.add.text(width / 2 + 160, height * 0.28, '🥳', { fontSize: '48px' }).setOrigin(0.5);

    this.tweens.add({
      targets: [ballEmoji, ballEmoji2],
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });

    const title = this.add.text(width / 2, height * 0.28, 'Мой футбол', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '52px',
      fontStyle: '900',
      color: '#ffd166',
      stroke: '#1b4332',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    const greeting = this.add.text(
      width / 2,
      height * 0.42,
      `${gameConfig.introMessage}\n${gameConfig.birthdayName}!`,
      {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      },
    );
    greeting.setOrigin(0.5);

    const joke = this.add.text(width / 2, height * 0.58, randomFrom(gameConfig.insideJokes), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#b7e4c7',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width * 0.7 },
    });
    joke.setOrigin(0.5);

    createTextButton(this, width / 2, height * 0.75, 'Играть!', () => {
      this.scene.start('SelectScene');
    });

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
