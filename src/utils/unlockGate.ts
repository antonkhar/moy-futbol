import { gameConfig } from '../config/gameConfig';

export type UnlockTestMode = 'locked' | 'unlocked';

/** Полночь 11 июня 2026 по Москве (UTC+3) */
const UNLOCK_TIMESTAMP_MS = Date.parse(`${gameConfig.unlockDateIso}T00:00:00+03:00`);

/**
 * Тестовый режим через URL:
 * ?test=locked   — принудительно закрыто
 * ?test=unlocked — принудительно открыто
 */
export function getUnlockTestMode(): UnlockTestMode | null {
  const value = new URLSearchParams(window.location.search).get('test');
  if (value === 'locked' || value === 'lock') return 'locked';
  if (value === 'unlocked' || value === 'unlock') return 'unlocked';
  return null;
}

export function isGameUnlocked(): boolean {
  const testMode = getUnlockTestMode();
  if (testMode === 'locked') return false;
  if (testMode === 'unlocked') return true;
  return Date.now() >= UNLOCK_TIMESTAMP_MS;
}

export function getUnlockDebugInfo(): {
  nowUtc: string;
  unlockAtMoscow: string;
  unlocked: boolean;
  testMode: UnlockTestMode | null;
} {
  return {
    nowUtc: new Date().toISOString(),
    unlockAtMoscow: '11 июня 2026, 00:00 (Москва)',
    unlocked: isGameUnlocked(),
    testMode: getUnlockTestMode(),
  };
}
