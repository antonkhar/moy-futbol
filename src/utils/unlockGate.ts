import { gameConfig } from '../config/gameConfig';
import { assetUrl } from './assetUrl';

export type UnlockTestMode = 'locked' | 'unlocked';

let resolvedUnlockState: boolean | null = null;
let resolvedAsOfIso: string | null = null;

/**
 * Тестовый режим через URL:
 * ?test=locked   — принудительно закрыто
 * ?test=unlocked — принудительно открыто
 * ?asOf=2026-06-10 — «сегодня» как эта дата (по Москве), проверка как в бою
 */
export function getSimulatedAsOfIso(): string | null {
  const asOf = new URLSearchParams(window.location.search).get('asOf');
  if (!asOf || !/^\d{4}-\d{2}-\d{2}$/.test(asOf)) return null;
  return asOf;
}

function dateFromMoscowIso(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00+03:00`);
}

export function getUnlockTestMode(): UnlockTestMode | null {
  const value = new URLSearchParams(window.location.search).get('test');
  if (value === 'locked' || value === 'lock') return 'locked';
  if (value === 'unlocked' || value === 'unlock') return 'unlocked';
  return null;
}

/** Календарная дата YYYYMMDD в часовом поясе Москвы */
export function toMoscowYmd(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const pick = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  return pick('year') * 10000 + pick('month') * 100 + pick('day');
}

function parseUnlockYmd(): number {
  const [year, month, day] = gameConfig.unlockDateIso.split('-').map(Number);
  return year * 10000 + month * 100 + day;
}

function isUnlockDateReached(now: Date): boolean {
  return toMoscowYmd(now) >= parseUnlockYmd();
}

/** Время с сервера GitHub Pages (UTC в заголовке Date), без кеша */
async function fetchServerTime(): Promise<Date | null> {
  try {
    const response = await fetch(`${assetUrl('favicon.svg')}?t=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
    });
    const dateHeader = response.headers.get('date');
    if (dateHeader) return new Date(dateHeader);
  } catch {
    // офлайн или сеть недоступна
  }
  return null;
}

/**
 * Вызывается один раз до старта Phaser.
 * Сначала время сервера, иначе — локальные часы через Москву.
 */
export async function resolveUnlockState(): Promise<boolean> {
  const testMode = getUnlockTestMode();
  if (testMode === 'locked') {
    resolvedUnlockState = false;
    return false;
  }
  if (testMode === 'unlocked') {
    resolvedUnlockState = true;
    return true;
  }

  const asOfIso = getSimulatedAsOfIso();
  if (asOfIso) {
    resolvedAsOfIso = asOfIso;
    resolvedUnlockState = isUnlockDateReached(dateFromMoscowIso(asOfIso));
    return resolvedUnlockState;
  }

  const serverTime = await fetchServerTime();
  const now = serverTime ?? new Date();
  resolvedUnlockState = isUnlockDateReached(now);
  return resolvedUnlockState;
}

export function isGameUnlocked(): boolean {
  const testMode = getUnlockTestMode();
  if (testMode === 'locked') return false;
  if (testMode === 'unlocked') return true;

  if (resolvedUnlockState !== null) return resolvedUnlockState;

  // Запасной синхронный путь (не должен срабатывать до resolveUnlockState)
  return isUnlockDateReached(new Date());
}

export function getUnlockDebugInfo(): {
  nowUtc: string;
  nowMoscowYmd: number;
  unlockMoscowYmd: number;
  unlocked: boolean;
  testMode: UnlockTestMode | null;
  simulatedAsOf: string | null;
} {
  const now = resolvedAsOfIso ? dateFromMoscowIso(resolvedAsOfIso) : new Date();
  return {
    nowUtc: now.toISOString(),
    nowMoscowYmd: toMoscowYmd(now),
    unlockMoscowYmd: parseUnlockYmd(),
    unlocked: isGameUnlocked(),
    testMode: getUnlockTestMode(),
    simulatedAsOf: resolvedAsOfIso,
  };
}
