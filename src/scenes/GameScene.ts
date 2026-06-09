import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import type { MatchData, ResultData } from '../types';
import { Player } from '../entities/Player';
import { Ball, BALL_RADIUS, BALL_TEXTURE_KEY } from '../entities/Ball';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { fireGoalConfetti } from '../utils/confetti';
import { randomFrom } from '../utils/decorations';
import { addFieldFestiveDecor, addSparkleBurst, shakeCamera } from '../utils/festiveEffects';

const FIELD = { x: 80, y: 70, width: 800, height: 460 };
const GOAL_TOP = FIELD.y + FIELD.height * 0.32;
const GOAL_BOTTOM = FIELD.y + FIELD.height * 0.68;

export class GameScene extends Phaser.Scene {
  private matchData!: MatchData;
  private player1!: Player;
  private player2!: Player;
  private ball!: Ball;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private score1 = 0;
  private score2 = 0;
  private timeLeft = gameConfig.matchDurationSec;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private goalBanner!: Phaser.GameObjects.Text;
  private pausedForGoal = false;
  private pausedForOut = false;
  private joystick1?: VirtualJoystick;
  private joystick2?: VirtualJoystick;
  private matchOver = false;
  private banterText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: MatchData): void {
    this.matchData = data;
    this.score1 = 0;
    this.score2 = 0;
    this.timeLeft = gameConfig.matchDurationSec;
    this.pausedForGoal = false;
    this.pausedForOut = false;
    this.matchOver = false;
  }

  create(): void {
    const { width, height } = this.scale;
    this.drawField();

    addFieldFestiveDecor(this, FIELD.x, FIELD.y, FIELD.width, FIELD.height);

    this.player1 = new Player(
      this,
      FIELD.x + FIELD.width * 0.25,
      FIELD.y + FIELD.height / 2,
      this.matchData.player1,
    );
    this.player2 = new Player(
      this,
      FIELD.x + FIELD.width * 0.75,
      FIELD.y + FIELD.height / 2,
      this.matchData.player2,
    );
    this.ball = new Ball(this, FIELD.x + FIELD.width / 2, FIELD.y + FIELD.height / 2);
    this.ball.setCollideWorldBounds(false);

    const walls = this.createFieldWalls();
    this.physics.world.setBounds(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
    this.player1.setCollideWorldBounds(true);
    this.player2.setCollideWorldBounds(true);

    this.physics.add.collider(this.player1, this.player2, () => {
      this.player1.playBumpAnimation();
      this.player2.playBumpAnimation();
    });
    this.physics.add.collider(this.player1, this.ball, () => {
      this.player1.playBumpAnimation();
      addSparkleBurst(this, this.ball.x, this.ball.y);
    });
    this.physics.add.collider(this.player2, this.ball, () => {
      this.player2.playBumpAnimation();
      addSparkleBurst(this, this.ball.x, this.ball.y);
    });
    this.physics.add.collider(this.ball, walls);
    this.physics.add.collider(this.player1, walls);
    this.physics.add.collider(this.player2, walls);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    if (this.sys.game.device.input.touch) {
      this.joystick1 = new VirtualJoystick(this, 100, height - 90, 55, this.matchData.player1.color);
      this.joystick2 = new VirtualJoystick(this, width - 100, height - 90, 55, this.matchData.player2.color);
    }

    this.scoreText = this.add.text(width / 2, 24, this.formatScore(), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ffd166',
    });
    this.scoreText.setOrigin(0.5);

    this.timerText = this.add.text(width / 2, 56, this.formatTime(), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '20px',
      color: '#d8f3dc',
    });
    this.timerText.setOrigin(0.5);

    this.goalBanner = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '42px',
      fontStyle: '900',
      color: '#ffd166',
      stroke: '#1b4332',
      strokeThickness: 6,
      align: 'center',
    });
    this.goalBanner.setOrigin(0.5);
    this.goalBanner.setAlpha(0);

    this.banterText = this.add.text(width / 2, height - 18, randomFrom(gameConfig.matchBanter), {
      fontFamily: 'Nunito, sans-serif',
      fontSize: '14px',
      color: '#ffd166',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width * 0.9 },
    });
    this.banterText.setOrigin(0.5);

    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => {
        if (this.pausedForGoal || this.pausedForOut || this.matchOver) return;
        this.banterText.setText(randomFrom(gameConfig.matchBanter));
        this.tweens.add({
          targets: this.banterText,
          alpha: { from: 0.3, to: 1 },
          duration: 400,
        });
      },
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.pausedForGoal || this.pausedForOut || this.matchOver) return;
        this.timeLeft -= 1;
        this.timerText.setText(this.formatTime());
        if (this.timeLeft <= 0) {
          this.endMatch();
        }
      },
    });
  }

  update(): void {
    if (this.pausedForGoal || this.pausedForOut || this.matchOver) return;

    let p1x = 0;
    let p1y = 0;
    let p2x = 0;
    let p2y = 0;

    if (this.wasd) {
      if (this.wasd.A.isDown) p1x -= 1;
      if (this.wasd.D.isDown) p1x += 1;
      if (this.wasd.W.isDown) p1y -= 1;
      if (this.wasd.S.isDown) p1y += 1;
    }
    if (this.cursors) {
      if (this.cursors.left.isDown) p2x -= 1;
      if (this.cursors.right.isDown) p2x += 1;
      if (this.cursors.up.isDown) p2y -= 1;
      if (this.cursors.down.isDown) p2y += 1;
    }

    if (this.joystick1) {
      const v1 = this.joystick1.getVector();
      if (Math.abs(v1.x) > 0.1 || Math.abs(v1.y) > 0.1) {
        p1x = v1.x;
        p1y = v1.y;
      }
    }
    if (this.joystick2) {
      const v2 = this.joystick2.getVector();
      if (Math.abs(v2.x) > 0.1 || Math.abs(v2.y) > 0.1) {
        p2x = v2.x;
        p2y = v2.y;
      }
    }

    this.player1.applyInput(p1x, p1y);
    this.player2.applyInput(p2x, p2y);

    this.checkGoals();
    this.checkOutOfBounds();
  }

  private createFieldWalls(): Phaser.Physics.Arcade.StaticGroup {
    const walls = this.physics.add.staticGroup();
    const thickness = 20;

    this.addWall(walls, FIELD.x + FIELD.width / 2, FIELD.y - thickness / 2, FIELD.width, thickness);
    this.addWall(walls, FIELD.x + FIELD.width / 2, FIELD.y + FIELD.height + thickness / 2, FIELD.width, thickness);

    const leftTopH = GOAL_TOP - FIELD.y;
    this.addWall(walls, FIELD.x - thickness / 2, FIELD.y + leftTopH / 2, thickness, leftTopH);

    const leftBottomH = FIELD.y + FIELD.height - GOAL_BOTTOM;
    this.addWall(walls, FIELD.x - thickness / 2, GOAL_BOTTOM + leftBottomH / 2, thickness, leftBottomH);

    const rightTopH = leftTopH;
    this.addWall(walls, FIELD.x + FIELD.width + thickness / 2, FIELD.y + rightTopH / 2, thickness, rightTopH);

    const rightBottomH = leftBottomH;
    this.addWall(walls, FIELD.x + FIELD.width + thickness / 2, GOAL_BOTTOM + rightBottomH / 2, thickness, rightBottomH);

    return walls;
  }

  private addWall(
    group: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const wall = group.create(x, y, BALL_TEXTURE_KEY) as Phaser.Physics.Arcade.Image;
    wall.setDisplaySize(w, h).setVisible(false).setImmovable(true);
    wall.refreshBody();
  }

  private drawField(): void {
    const g = this.add.graphics();

    g.fillStyle(0x2d6a4f, 1);
    g.fillRect(0, 0, this.scale.width, this.scale.height);

    g.fillStyle(0x40916c, 1);
    g.fillRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);

    g.lineStyle(3, 0xffffff, 0.7);
    g.strokeRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
    g.strokeCircle(FIELD.x + FIELD.width / 2, FIELD.y + FIELD.height / 2, 60);

    g.lineStyle(4, 0xffffff, 0.9);
    g.strokeLineShape(
      new Phaser.Geom.Line(FIELD.x, FIELD.y + FIELD.height / 2, FIELD.x + FIELD.width, FIELD.y + FIELD.height / 2),
    );

    const goalH = GOAL_BOTTOM - GOAL_TOP;
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(FIELD.x - 12, GOAL_TOP, 12, goalH);
    g.fillRect(FIELD.x + FIELD.width, GOAL_TOP, 12, goalH);
    g.lineStyle(3, 0xffd166, 1);
    g.strokeRect(FIELD.x - 12, GOAL_TOP, 12, goalH);
    g.strokeRect(FIELD.x + FIELD.width, GOAL_TOP, 12, goalH);

    const stripes = this.add.graphics();
    for (let i = 0; i < FIELD.width; i += 80) {
      stripes.fillStyle(0x52b788, 0.25);
      stripes.fillRect(FIELD.x + i, FIELD.y, 40, FIELD.height);
    }

    const emojis = ['🎂', '🍺', '⚽', '🎈'];
    emojis.forEach((e, i) => {
      const t = this.add.text(FIELD.x + FIELD.width - 30 - i * 28, FIELD.y + 12, e, { fontSize: '20px' });
      this.tweens.add({
        targets: t,
        y: t.y - 6,
        duration: 800 + i * 150,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private isInGoalMouth(by: number): boolean {
    return by >= GOAL_TOP && by <= GOAL_BOTTOM;
  }

  private checkGoals(): void {
    const bx = this.ball.x;
    const by = this.ball.y;

    if (!this.isInGoalMouth(by)) return;

    if (bx < FIELD.x - 6) {
      this.onGoal(2);
    } else if (bx > FIELD.x + FIELD.width + 6) {
      this.onGoal(1);
    }
  }

  private checkOutOfBounds(): void {
    const bx = this.ball.x;
    const by = this.ball.y;
    const inGoalMouth = this.isInGoalMouth(by);

    let side: 'top' | 'bottom' | 'left' | 'right' | null = null;

    if (by < FIELD.y - BALL_RADIUS) {
      side = 'top';
    } else if (by > FIELD.y + FIELD.height + BALL_RADIUS) {
      side = 'bottom';
    } else if (bx < FIELD.x - BALL_RADIUS && !inGoalMouth) {
      side = 'left';
    } else if (bx > FIELD.x + FIELD.width + BALL_RADIUS && !inGoalMouth) {
      side = 'right';
    } else if (
      !inGoalMouth &&
      (bx < FIELD.x - 50 ||
        bx > FIELD.x + FIELD.width + 50 ||
        by < FIELD.y - 50 ||
        by > FIELD.y + FIELD.height + 50)
    ) {
      side = by < FIELD.y + FIELD.height / 2 ? 'top' : 'bottom';
    }

    if (side) {
      this.onOut(side, bx, by);
    }
  }

  private onOut(side: 'top' | 'bottom' | 'left' | 'right', exitX: number, exitY: number): void {
    if (this.pausedForOut || this.pausedForGoal) return;
    this.pausedForOut = true;
    this.ball.setVelocity(0, 0);

    const phrase = randomFrom(gameConfig.outPhrases);
    this.goalBanner.setText(phrase);
    this.goalBanner.setAlpha(1);
    this.goalBanner.setScale(0.6);
    this.tweens.add({
      targets: this.goalBanner,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    this.time.delayedCall(900, () => {
      this.placeBallAfterOut(side, exitX, exitY);
      this.goalBanner.setAlpha(0);
      this.pausedForOut = false;
    });
  }

  private placeBallAfterOut(side: 'top' | 'bottom' | 'left' | 'right', exitX: number, exitY: number): void {
    const inset = BALL_RADIUS + 8;
    let x = Phaser.Math.Clamp(exitX, FIELD.x + inset, FIELD.x + FIELD.width - inset);
    let y = Phaser.Math.Clamp(exitY, FIELD.y + inset, FIELD.y + FIELD.height - inset);

    switch (side) {
      case 'top':
        y = FIELD.y + inset;
        break;
      case 'bottom':
        y = FIELD.y + FIELD.height - inset;
        break;
      case 'left':
        x = FIELD.x + inset;
        y = Phaser.Math.Clamp(exitY, FIELD.y + inset, FIELD.y + FIELD.height - inset);
        break;
      case 'right':
        x = FIELD.x + FIELD.width - inset;
        y = Phaser.Math.Clamp(exitY, FIELD.y + inset, FIELD.y + FIELD.height - inset);
        break;
    }

    this.ball.setPosition(x, y);
    this.ball.setVelocity(0, 0);
  }

  private onGoal(scorer: 1 | 2): void {
    if (this.pausedForGoal || this.pausedForOut) return;
    this.pausedForGoal = true;

    if (scorer === 1) this.score1 += 1;
    else this.score2 += 1;

    this.scoreText.setText(this.formatScore());
    fireGoalConfetti();
    shakeCamera(this);

    const scorerPlayer = scorer === 1 ? this.player1 : this.player2;
    scorerPlayer.playGoalCelebration();
    addSparkleBurst(this, scorerPlayer.x, scorerPlayer.y);

    const scorerName = scorer === 1 ? this.matchData.player1.name : this.matchData.player2.name;
    const phrase = randomFrom(gameConfig.goalPhrases);
    this.goalBanner.setText(`${phrase}\n${scorerName} забивает!`);
    this.goalBanner.setAlpha(1);
    this.goalBanner.setScale(0.5);

    this.tweens.add({
      targets: this.goalBanner,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.time.delayedCall(1800, () => {
      this.goalBanner.setAlpha(0);
      this.resetPositions();
      this.pausedForGoal = false;

      if (this.score1 >= gameConfig.goalsToWin || this.score2 >= gameConfig.goalsToWin) {
        this.endMatch();
      }
    });
  }

  private resetPositions(): void {
    this.ball.setPosition(FIELD.x + FIELD.width / 2, FIELD.y + FIELD.height / 2);
    this.ball.setVelocity(0, 0);
    this.player1.setPosition(FIELD.x + FIELD.width * 0.25, FIELD.y + FIELD.height / 2);
    this.player1.setVelocity(0, 0);
    this.player2.setPosition(FIELD.x + FIELD.width * 0.75, FIELD.y + FIELD.height / 2);
    this.player2.setVelocity(0, 0);
  }

  private endMatch(): void {
    if (this.matchOver) return;
    this.matchOver = true;

    const result: ResultData = {
      ...this.matchData,
      score1: this.score1,
      score2: this.score2,
    };

    this.time.delayedCall(500, () => {
      this.scene.start('ResultScene', result);
    });
  }

  private formatScore(): string {
    return `${this.matchData.player1.name}  ${this.score1} : ${this.score2}  ${this.matchData.player2.name}`;
  }

  private formatTime(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
