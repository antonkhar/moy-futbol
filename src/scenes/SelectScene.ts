import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { PlayerConfig } from '../config/gameConfig';
import type { MatchData } from '../types';
import { drawFestiveBackground, createTextButton } from '../utils/decorations';

const CARD_W = 130;
const CARD_H = 155;
const GRID_GAP_X = 20;
const GRID_GAP_Y = 14;

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
      .text(width / 2, 30, 'Выбери двух футболистов', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffd166',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 58, 'Игрок 1 (WASD)  vs  Игрок 2 (стрелки)', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '15px',
        color: '#d8f3dc',
      })
      .setOrigin(0.5);

    const cols = 3;
    const gridW = cols * CARD_W + (cols - 1) * GRID_GAP_X;
    const gridH = 2 * CARD_H + GRID_GAP_Y;
    const gridTop = 78;
    const startX = width / 2 - gridW / 2 + CARD_W / 2;
    const startY = gridTop + CARD_H / 2;

    gameConfig.players.forEach((player, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (CARD_W + GRID_GAP_X);
      const y = startY + row * (CARD_H + GRID_GAP_Y);
      this.cardContainers.push(this.createPlayerCard(x, y, player));
    });

    const gridBottom = gridTop + gridH;
    const quotePanelY = gridBottom + 36;
    const quotePanelH = 72;

    const quotePanel = this.add.rectangle(width / 2, quotePanelY, width * 0.88, quotePanelH, 0x1b4332, 0.72);
    quotePanel.setStrokeStyle(2, 0xffd166, 0.45);
    quotePanel.setDepth(5);

    this.quoteText = this.add.text(width / 2, quotePanelY, 'Выбери первого игрока', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width * 0.8 },
      lineSpacing: 4,
    });
    this.quoteText.setOrigin(0.5);
    this.quoteText.setDepth(6);

    const buttonY = height - 48;
    this.startButton = createTextButton(this, width / 2, buttonY, 'На поле!', () => {
      if (!this.startButton?.getData('enabled')) return;
      if (this.selectedP1 && this.selectedP2) {
        const data: MatchData = { player1: this.selectedP1, player2: this.selectedP2 };
        this.scene.start('GameScene', data);
      }
    });
    this.startButton.setDepth(10);
    this.startButton.setData('enabled', false);
    this.updateStartButton();
  }

  private createPlayerCard(x: number, y: number, player: PlayerConfig): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, CARD_W, CARD_H, 0xffffff, 0.15);
    bg.setStrokeStyle(3, 0xffffff, 0.4);

    const token = this.add.image(0, -12, `token_${player.id}`);
    token.setDisplaySize(80, 80);

    this.tweens.add({
      targets: token,
      y: token.y - 5,
      duration: 1100 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const name = this.add.text(0, 52, player.name, {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    name.setOrigin(0.5);

    const badge = this.add.text(0, -CARD_H / 2 + 12, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#1b4332',
      backgroundColor: '#ffd166',
      padding: { x: 6, y: 2 },
    });
    badge.setOrigin(0.5);

    container.add([bg, token, name, badge]);
    container.setSize(CARD_W, CARD_H);
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
        this.quoteText?.setText('Выбери первого игрока');
      }
    } else if (player.id === this.selectedP2?.id) {
      this.selectedP2 = null;
      badge.setText('');
      bg.setStrokeStyle(3, 0xffffff, 0.4);
      this.quoteText?.setText(this.selectedP1?.selectQuote ?? 'Выбери первого игрока');
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
