export const GAME_TICK_RATE_MS = 1000 / 60; // 60 FPS physics
export const TARGET_FREQUENCY = 50.0;
export const FAILURE_LOW_FREQ = 45.0;
export const FAILURE_HIGH_FREQ = 55.0;

export const MAX_BATTERY_CAPACITY = 2000; // kWh
export const BATTERY_RATE = 150; // kW charge/discharge rate

export const GENERATOR_OUTPUT = 300; // kW
export const BASE_DEMAND = 200; // kW
export const MAX_SOLAR_OUTPUT = 600; // kW

export const FREQUENCY_SENSITIVITY = 0.005; // Hz change per kW surplus/deficit per tick
export const TIME_SPEED = 0.02; // Hours per tick (approx 1.2 game hours per second)
