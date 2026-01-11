export enum BatteryMode {
  IDLE = 'IDLE',
  CHARGE = 'CHARGE',
  DISCHARGE = 'DISCHARGE',
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  GAME_OVER_BLACKOUT = 'BLACKOUT',
  GAME_OVER_EXPLOSION = 'EXPLOSION',
}

export interface GameState {
  // Time
  timeOfDay: number; // 0-24 hours
  day: number;

  // Grid Physics
  frequency: number; // Target 50.00
  netPower: number; // Supply - Demand

  // Resources
  batteryLevel: number; // 0-100%
  solarOutput: number; // kW
  cityDemand: number; // kW
  generatorOutput: number; // kW

  // Player Controls
  isGeneratorOn: boolean;
  batteryMode: BatteryMode;
  
  // Meta
  status: GameStatus;
  score: number;
}

export type View = 'landing' | 'game' | 'privacy' | 'terms';