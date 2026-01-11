import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameStatus, BatteryMode } from '../types';
import {
  GAME_TICK_RATE_MS,
  TARGET_FREQUENCY,
  FAILURE_LOW_FREQ,
  FAILURE_HIGH_FREQ,
  MAX_BATTERY_CAPACITY,
  BATTERY_RATE,
  GENERATOR_OUTPUT,
  BASE_DEMAND,
  MAX_SOLAR_OUTPUT,
  FREQUENCY_SENSITIVITY,
  TIME_SPEED
} from '../constants';

const INITIAL_STATE: GameState = {
  timeOfDay: 6, // Start at 6 AM
  day: 1,
  frequency: TARGET_FREQUENCY,
  netPower: 0,
  batteryLevel: 50, // %
  solarOutput: 0,
  cityDemand: BASE_DEMAND,
  generatorOutput: 0,
  isGeneratorOn: false,
  batteryMode: BatteryMode.IDLE,
  status: GameStatus.PLAYING,
  score: 0,
};

export const useGridGame = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  
  // Use refs for physics variables to avoid dependency loops and allow high-frequency updates
  const stateRef = useRef<GameState>(INITIAL_STATE);
  const loopRef = useRef<number | null>(null);

  const resetGame = useCallback(() => {
    stateRef.current = { ...INITIAL_STATE };
    setGameState({ ...INITIAL_STATE });
    if (!loopRef.current) {
      startGameLoop();
    }
  }, []);

  const toggleGenerator = useCallback(() => {
    if (stateRef.current.status !== GameStatus.PLAYING) return;
    stateRef.current.isGeneratorOn = !stateRef.current.isGeneratorOn;
    // Immediate state update for UI responsiveness
    setGameState({ ...stateRef.current });
  }, []);

  const setBatteryMode = useCallback((mode: BatteryMode) => {
    if (stateRef.current.status !== GameStatus.PLAYING) return;
    stateRef.current.batteryMode = mode;
    setGameState({ ...stateRef.current });
  }, []);

  const startGameLoop = useCallback(() => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);

    let lastTime = performance.now();
    let accumulatedTime = 0;

    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      accumulatedTime += deltaTime;

      // Fixed time step update
      while (accumulatedTime >= GAME_TICK_RATE_MS) {
        updatePhysics();
        accumulatedTime -= GAME_TICK_RATE_MS;
      }

      // Sync React state periodically (every frame is fine for this complexity, 
      // but in bigger apps we might throttle this)
      setGameState({ ...stateRef.current });

      if (stateRef.current.status === GameStatus.PLAYING) {
        loopRef.current = requestAnimationFrame(loop);
      }
    };

    loopRef.current = requestAnimationFrame(loop);
  }, []);

  const updatePhysics = () => {
    const s = stateRef.current;

    if (s.status !== GameStatus.PLAYING) return;

    // 1. Update Time
    s.timeOfDay += TIME_SPEED;
    if (s.timeOfDay >= 24) {
      s.timeOfDay = 0;
      s.day += 1;
    }

    // 2. Calculate Solar Output (Sine wave based on daylight 06:00 - 18:00)
    // Peak at 12:00. 
    // Normalized time: 6am=0, 12pm=1, 18pm=2 (scaled to PI)
    // Formula: max(0, sin( (time - 6) * (PI / 12) ))
    // We add some noise for clouds
    const sunAngle = (s.timeOfDay - 6) * (Math.PI / 12);
    let rawSolar = 0;
    if (s.timeOfDay > 6 && s.timeOfDay < 18) {
      rawSolar = Math.sin(sunAngle) * MAX_SOLAR_OUTPUT;
    }
    // Add random cloud fluctuation (noise)
    const cloudNoise = (Math.random() - 0.5) * 50;
    s.solarOutput = Math.max(0, rawSolar + cloudNoise);

    // 3. Calculate Demand
    // Base + Peak hours (09:00 and 19:00) + Noise
    const morningPeak = Math.exp(-Math.pow(s.timeOfDay - 9, 2) / 4) * 150;
    const eveningPeak = Math.exp(-Math.pow(s.timeOfDay - 19, 2) / 4) * 200;
    const demandNoise = (Math.random() - 0.5) * 40;
    // Difficulty scaling: Demand increases slightly every day
    const dayMultiplier = 1 + (s.day * 0.05);
    
    s.cityDemand = (BASE_DEMAND + morningPeak + eveningPeak + demandNoise) * dayMultiplier;

    // 4. Battery Logic
    let batteryFlow = 0; // Positive = Discharging (Supply), Negative = Charging (Load)
    const currentBatAbs = (s.batteryLevel / 100) * MAX_BATTERY_CAPACITY;
    
    if (s.batteryMode === BatteryMode.CHARGE) {
      // Can only charge if not full
      if (s.batteryLevel < 100) {
        batteryFlow = -BATTERY_RATE;
        const newCapacity = Math.min(MAX_BATTERY_CAPACITY, currentBatAbs + (BATTERY_RATE * (GAME_TICK_RATE_MS / 1000 / 3600))); 
        // Note: The unit math above is simplified for game feel, 
        // effectively adding rate * time_step to capacity
        // Let's refine: BATTERY_RATE is kW. Energy = Power * Time. 
        // We add (BATTERY_RATE * (1/60 seconds)) energy.
        // But for game pacing, let's just make it fill 0-100 in about 10 seconds of real time.
        // 10 sec = 600 ticks. 100% / 600 = 0.16% per tick.
        s.batteryLevel = Math.min(100, s.batteryLevel + 0.15);
      } else {
        s.batteryMode = BatteryMode.IDLE; // Auto cut-off
      }
    } else if (s.batteryMode === BatteryMode.DISCHARGE) {
      if (s.batteryLevel > 0) {
        batteryFlow = BATTERY_RATE;
        s.batteryLevel = Math.max(0, s.batteryLevel - 0.15);
      } else {
        s.batteryMode = BatteryMode.IDLE; // Auto cut-off
      }
    }

    // 5. Generator Logic
    s.generatorOutput = s.isGeneratorOn ? GENERATOR_OUTPUT : 0;

    // 6. Net Power Calculation
    // Production = Solar + Generator + BatteryDischarge
    // Consumption = City + BatteryCharge
    // Note: batteryFlow is (+) for supply, (-) for load
    const totalSupply = s.solarOutput + s.generatorOutput + (batteryFlow > 0 ? batteryFlow : 0);
    const totalLoad = s.cityDemand + (batteryFlow < 0 ? -batteryFlow : 0);
    
    s.netPower = totalSupply - totalLoad;

    // 7. Grid Frequency Update
    // Grid inertia simulation
    const freqDelta = s.netPower * FREQUENCY_SENSITIVITY;
    s.frequency += freqDelta;

    // Natural damping (very slight, to prevent runaway oscillation from tiny errors)
    // s.frequency = s.frequency * 0.999 + TARGET_FREQUENCY * 0.001; 

    // 8. Win/Loss Conditions
    if (s.frequency <= FAILURE_LOW_FREQ) {
      s.status = GameStatus.GAME_OVER_BLACKOUT;
    } else if (s.frequency >= FAILURE_HIGH_FREQ) {
      s.status = GameStatus.GAME_OVER_EXPLOSION;
    } else {
        s.score += 1;
    }
  };

  useEffect(() => {
    startGameLoop();
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [startGameLoop]);

  return {
    gameState,
    toggleGenerator,
    setBatteryMode,
    resetGame
  };
};
