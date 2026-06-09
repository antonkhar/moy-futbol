import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { PlayerConfig } from '../config/gameConfig';
import type { MatchData } from '../types';
import { drawFestiveBackground, createTextButton } from '../utils/decorations';

export class SelectScene extends Phaser.Scene {
  private selectedP1: PlayerConfig | null = null;
  private selectedP2: PlayerConfig | null = null;
  private quoteText?: Phaser.GameObjects.Text;
  private startButton?: Phaser.GameObjects.Container;
  private cardContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'SelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.selectedP1 = null;
    this.selectedP2 = null;
    this.cardContainers = [];

    drawFestiveBackground(this, width, height);

    this.add
      .text(width / 2, 36, 'Выбери двух футболистов', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffd166',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 68, 'Игрок 1 (WASD)  vs  Игрок 2 (стрелки)', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '16px',
        color: '#d8f3dc',
      })
      .setOrigin(0.5);

    const cols = 3;
    const cardW = 140;
    const cardH = 170;
    const gapX = 24;
    const gapY = 20;
    const gridW = cols * cardW + (cols - 1) * gapX;
    const startX = width / 2 - gridW / 2 + cardW / 2;
    const startY = 130 + cardH / 2;

    gameConfig.players.forEach((player, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);
      this.cardContainers.push(this.createPlayerCard(x, y, player, cardW, cardH));
    });

    this.quoteText = this.add.text(width / 2, height - 130, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width * 0.8 },
    });
    this.quoteText.setOrigin(0.5);

    this.startButton = createTextButton(this, width / 2, height - 60, 'На поле!', () => {
      if (!this.startButton?.getData('enabled')) return;
      if (this.selectedP1 && this.selectedP2) {
        const data: MatchData = { player1: this.selectedP1, player2: this.selectedP2 };
        this.scene.start('GameScene', data);
      }
    });
    this.startButton.setData('enabled', false);
    this.updateStartButton();
  }

  private createPlayerCard(
    x: number,
    y: number,
    player: PlayerConfig,
    w: number,
    h: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, 0xffffff, 0.15);
    bg.setStrokeStyle(3, 0xffffff, 0.4);

    const token = this.add.image(0, -15, `token_${player.id}`);
    token.setDisplaySize(88, 88);

    this.tweens.add({
      targets: token,
      y: token.y - 6,
      duration: 1100 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const name = this.add.text(0, 58, player.name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    name.setOrigin(0.5);

    const badge = this.add.text(0, -h / 2 + 14, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#1b4332',
      backgroundColor: '#ffd166',
      padding: { x: 6, y: 2 },
    });
    badge.setOrigin(0.5);

    container.add([bg, token, name, badge]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.tweens.add({ targets: token, scaleX: 1.15, scaleY: 1.15, duration: 100, yoyo: true });
      this.onCardClick(player, bg, badge);
    });
    container.setData('player', player);
    container.setData('bg', bg);
    container.setData('badge', badge);

    return container;
  }

  private onCardClick(player: PlayerConfig, bg: Phaser.GameObjects.Rectangle, badge: Phaser.GameObjects.Text): void {
    if (!this.selectedP1) {
      this.selectedP1 = player;
      badge.setText('P1');
      bg.setStrokeStyle(4, 0x4cc9f0);
      this.quoteText?.setText(player.selectQuote);
    } else if (!this.selectedP2 && player.id !== this.selectedP1.id) {
      this.selectedP2 = player;
      badge.setText('P2');
      bg.setStrokeStyle(4, 0xf72585);
      this.quoteText?.setText(`${this.selectedP1.selectQuote}\n${player.selectQuote}`);
    } else if (player.id === this.selectedP1?.id) {
      this.selectedP1 = this.selectedP2;
      this.selectedP2 = null;
      this.resetCards();
      if (this.selectedP1) {
        this.highlightPlayer(this.selectedP1, 'P1', 0x4cc9f0);
        this.quoteText?.setText(this.selectedP1.selectQuote);
      } else {
        this.quoteText?.setText('');
      }
    } else if (player.id === this.selectedP2?.id) {
      this.selectedP2 = null;
      badge.setText('');
      bg.setStrokeStyle(3, 0xffffff, 0.4);
      this.quoteText?.setText(this.selectedP1?.selectQuote ?? '');
    } else {
      this.selectedP2 = player;
      this.resetCards();
      this.highlightPlayer(this.selectedP1!, 'P1', 0x4cc9f0);
      this.highlightPlayer(player, 'P2', 0xf72585);
      this.quoteText?.setText(`${this.selectedP1!.selectQuote}\n${player.selectQuote}`);
    }
    this.updateStartButton();
  }

  private resetCards(): void {
    for (const card of this.cardContainers) {
      const bg = card.getData('bg') as Phaser.GameObjects.Rectangle;
      const badge = card.getData('badge') as Phaser.GameObjects.Text;
      bg.setStrokeStyle(3, 0xffffff, 0.4);
      badge.setText('');
    }
    this.selectedP2 = null;
  }

  private highlightPlayer(player: PlayerConfig, label: string, color: number): void {
    const card = this.cardContainers.find((c) => (c.getData('player') as PlayerConfig).id === player.id);
    if (!card) return;
    const bg = card.getData('bg') as Phaser.GameObjects.Rectangle;
    const badge = card.getData('badge') as Phaser.GameObjects.Text;
    badge.setText(label);
    bg.setStrokeStyle(4, color);
    if (label === 'P2') this.selectedP2 = player;
  }

  private updateStartButton(): void {
    if (!this.startButton) return;
    const ready = Boolean(this.selectedP1 && this.selectedP2);
    this.startButton.setAlpha(ready ? 1 : 0.4);
    this.startButton.setData('enabled', ready);
  }
}
