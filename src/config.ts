export const SCREEN = {
  WIDTH: 1280,
  HEIGHT: 720,
} as const

export const GRAVITY = 1600

export const PLAYER = {
  RUN_SPEED: 300,
  JUMP_FORCE: 600,
  DASH_SPEED: 500,
  DASH_DURATION: 0.3,
  FLOAT_GRAVITY: 400,
  SPIN_DURATION: 0.4,
  SPIN_RADIUS: 60,
  WHIP_DURATION: 0.3,
  WHIP_RANGE: 80,
  WHIP_WIDTH: 16,
  INVINCIBILITY_DURATION: 2,
  STARTING_LIVES: 3,
  SEQUINS_FOR_EXTRA_LIFE: 100,
  WIDTH: 32,
  HEIGHT: 48,
} as const

export const PLATFORM = {
  BOUNCY_FORCE: 900,
  SWING_DEFAULT_RANGE: 100,
  SWING_DEFAULT_SPEED: 1.5,
} as const

export const CAMERA = {
  LERP_SPEED: 0.1,
  VERTICAL_LERP: 0.05,
  VERTICAL_OFFSET: -100,
} as const

export const ENEMY = {
  BUTTER_PAT: {
    WIDTH: 28, HEIGHT: 16, SPEED: 80, HP: 1,
    COLOR: [255, 200, 50] as const,
    SLIPPERY_DURATION: 3, SLIPPERY_SPEED_MULT: 1.8,
  },
  GLUTEN_BLOB: {
    SIZE: 24, HP: 2, STICKY_DURATION: 0.5, STICKY_SPEED_MULT: 0.4,
    COLOR: [210, 180, 140] as const,
    HIT_COLOR: [235, 215, 180] as const,
  },
  SYRUP_DRIPPER: {
    SIZE: 20, DROP_INTERVAL: 3,
    COLOR: [139, 69, 19] as const,
    PUDDLE_SIZE: 16, PUDDLE_DURATION: 5, PUDDLE_SPEED_MULT: 0.3,
    PUDDLE_COLOR: [100, 50, 10] as const,
  },
  MILK_CARTON: {
    WIDTH: 32, HEIGHT: 48, SPEED: 40, HP: 1,
    COLOR: [200, 220, 255] as const,
    SHIELD_COLOR: [150, 170, 220] as const,
  },
} as const

export const PICKUP = {
  NINJA_SIZE: 32,
  NINJA_COLOR: [255, 165, 0] as const,
  NINJA_BOB_SPEED: 2,
  NINJA_BOB_RANGE: 6,
  SEQUIN_SIZE: 12,
  SEQUIN_COLOR: [255, 215, 0] as const,
  SEQUIN_BOB_SPEED: 3,
  SEQUIN_BOB_RANGE: 4,
  RIBBON_SIZE: 16,
  RIBBON_COLOR: [200, 100, 200] as const,
  RIBBON_BOB_SPEED: 1.5,
  RIBBON_BOB_RANGE: 5,
  RIBBON_ROTATE_SPEED: 1.2,
  STOMP_BOUNCE: 400,
} as const

export const COLORS = {
  idle: [255, 105, 180] as const,
  run: [255, 20, 147] as const,
  jump: [255, 182, 193] as const,
  float: [200, 162, 255] as const,
  spin: [255, 215, 0] as const,
  dash: [0, 255, 255] as const,
  whip: [255, 50, 50] as const,
} as const

export const WEAPON = {
  SHURIKEN: {
    SIZE: 8,
    SPEED: 500,
    COOLDOWN: 0.4,
    COLOR: [255, 215, 0] as const,
  },
  KATANA: {
    WIDTH: 120,
    HEIGHT: 24,
    DURATION: 0.35,
    COLOR: [180, 200, 255] as const,
  },
  SAIS: {
    WIDTH: 60,
    HEIGHT: 20,
    DURATION: 0.2,
    COOLDOWN: 0.15,
    COLOR: [255, 80, 80] as const,
  },
  PICKUP_KATANA_COLOR: [100, 140, 255] as const,
  PICKUP_SAIS_COLOR: [255, 80, 80] as const,
  PICKUP_SIZE: 24,
  PICKUP_BOB_SPEED: 2.5,
  PICKUP_BOB_RANGE: 5,
} as const

export const DESTRUCTIBLE = {
  WIDTH: 48,
  HEIGHT: 48,
  COLOR: [139, 100, 60] as const,
} as const

export const BOSS = {
  WIDTH: 48,
  HEIGHT: 56,
  COLOR: [180, 140, 60] as const,
  HEADBAND_COLOR: [100, 70, 30] as const,
  SPEED: 120,
  ENRAGED_SPEED_MULT: 1.5,
  TOTAL_HP: 9,
  HITS_PER_PHASE: 3,
  SYRUP_BOMB_INTERVAL: 2,
  SYRUP_BOMB_INTERVAL_ENRAGED: 1.2,
  SYRUP_BOMB_SPEED: 300,
  SYRUP_BOMB_SIZE: 12,
  SYRUP_BOMB_COLOR: [100, 50, 10] as const,
  SYRUP_PUDDLE_COLOR: [80, 40, 5] as const,
  SYRUP_PUDDLE_WIDTH: 60,
  SYRUP_PUDDLE_SLOW: 0.3,
  GLUTEN_BLOB_SPEED: 250,
  GLUTEN_BLOB_SIZE: 16,
  GLUTEN_BLOB_COLOR: [210, 180, 140] as const,
  INVINCIBLE_DURATION: 1.5,
  TAUNT_INTERVAL: 4,
  ARENA_WIDTH: 1600,
} as const

export const FEEL = {
  COYOTE_TIME: 0.12,
  JUMP_BUFFER: 0.1,
  JUMP_CUT_MULTIPLIER: 0.5,
  FALL_GRAVITY_MULT: 1.5,
  SHAKE_HIT: { intensity: 4, duration: 0.15 },
  SHAKE_ENEMY_DEFEAT: { intensity: 2, duration: 0.08 },
  SHAKE_BOSS_PHASE: { intensity: 8, duration: 0.3 },
  SHAKE_LAND: { intensity: 2, duration: 0.06 },
  LAND_SQUASH_THRESHOLD: 200,
  LAND_SQUASH_DURATION: 0.1,
  DASH_TRAIL_INTERVAL: 0.03,
  DASH_TRAIL_FADE: 0.2,
} as const

export const NINJA_COLORS = {
  idle: [90, 60, 90] as const,
  run: [110, 40, 80] as const,
  jump: [100, 80, 110] as const,
  float: [80, 60, 120] as const,
  spin: [180, 150, 0] as const,
  dash: [0, 180, 180] as const,
  whip: [180, 30, 30] as const,
} as const
