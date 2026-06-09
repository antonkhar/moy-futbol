import Phaser from 'phaser';
import type { ResultData } from '../types';
import { gameConfig } from '../config/gameConfig';
import { drawFestiveBackground, createTextButton, randomFrom } from '../utils/decorations';
import { fireWinConfetti } from '../utils/confetti';
import { addFloatingEmojis, addSparkleBurst } from '../utils/festiveEffects';

export class ResultScene extends Phaser.Scene {
  private resultData!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData): void {
    this.resultData = data;
  }

  create(): void {
    const { width, height } = this.scale;
    const { score1, score2, player1, player2 } = this.resultData;

    drawFestiveBackground(this, width, height);
    addFloatingEmojis(this, width, height);
    fireWinConfetti();

    let winnerName: string;
    let winnerToken: string;
    let isDraw = false;

    if (score1 > score2) {
      winnerName = player1.name;
      winnerToken = `token_${player1.id}`;
    } else if (score2 > score1) {
      winnerName = player2.name;
      winnerToken = `token_${player2.id}`;
    } else {
      isDraw = true;
      winnerName = 'Ничья!';
      winnerToken = '';
    }

    this.add
      .text(width / 2, 50, '🏆 Итог матча', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '40px',
        fontStyle: '900',
        color: '#ffd166',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 100, `${player1.name}  ${score1} : ${score2}  ${player2.name}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    if (!isDraw && winnerToken) {
      const token = this.add.image(width / 2, height * 0.42, winnerToken);
      token.setDisplaySize(140, 140);
      this.tweens.add({
        targets: token,
        y: token.y - 12,
        angle: 8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.time.addEvent({
        delay: 1200,
        loop: true,
        callback: () => addSparkleBurst(this, token.x, token.y - 20),
      });
    }

    if (isDraw) {
      const t1 = this.add.image(width / 2 - 70, height * 0.42, `token_${player1.id}`).setDisplaySize(100, 100);
      const t2 = this.add.image(width / 2 + 70, height * 0.42, `token_${player2.id}`).setDisplaySize(100, 100);
      this.tweens.add({ targets: [t1, t2], y: '-=10', duration: 700, yoyo: true, repeat: -1 });
    }

    const winPhrase = isDraw ? 'Дружба победила! Как и торт — на всех!' : randomFrom(gameConfig.winPhrases);

    this.add
      .text(width / 2, height * 0.58, isDraw ? winnerName : `${winnerName} — ${winPhrase}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.7, randomFrom(gameConfig.insideJokes), {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '16px',
        color: '#b7e4c7',
        fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: width * 0.7 },
      })
      .setOrigin(0.5);

    const birthdayToast = this.add.text(width / 2, height * 0.82, gameConfig.endMatchMessage, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd166',
      align: 'center',
      wordWrap: { width: width * 0.85 },
      stroke: '#1b4332',
      strokeThickness: 4,
    });
    birthdayToast.setOrigin(0.5);
    birthdayToast.setScale(0.5);
    birthdayToast.setAlpha(0);

    this.tweens.add({
      targets: birthdayToast,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 500,
      delay: 400,
      ease: 'Back.easeOut',
    });
    this.tweens.add({
      targets: birthdayToast,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1,
      delay: 900,
      ease: 'Sine.easeInOut',
    });

    createTextButton(this, width / 2 - 130, height - 55, 'Реванш', () => {
      this.scene.start('GameScene', {
        player1: this.resultData.player1,
        player2: this.resultData.player2,
      });
    });

    createTextButton(this, width / 2 + 130, height - 55, 'Новый матч', () => {
      this.scene.start('SelectScene');
    });
  }
}
