import Phaser from 'phaser';
import { gameConfig } from '../config/gameConfig';
import { drawFestiveBackground } from '../utils/decorations';
import { getUnlockDebugInfo, getUnlockTestMode } from '../utils/unlockGate';

export class LockedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LockedScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    drawFestiveBackground(this, width, height);

    this.add
      .text(width / 2, height * 0.42, gameConfig.lockedMessage, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffd166',
        align: 'center',
        wordWrap: { width: width * 0.75 },
        stroke: '#1b4332',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.58, `🎂 ${gameConfig.birthdayName}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const testMode = getUnlockTestMode();
    if (testMode) {
      const debug = getUnlockDebugInfo();
      this.add
        .text(
          width / 2,
          height - 28,
          `тест: ${testMode} · МСК сегодня: ${debug.nowMoscowYmd} · открытие: ${debug.unlockMoscowYmd}`,
          {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '11px',
            color: '#b7e4c7',
          },
        )
        .setOrigin(0.5);
    }
  }
}
