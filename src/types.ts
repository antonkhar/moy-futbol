import type { PlayerConfig } from './config/gameConfig';

export interface MatchData {
  player1: PlayerConfig;
  player2: PlayerConfig;
}

export interface ResultData extends MatchData {
  score1: number;
  score2: number;
}
