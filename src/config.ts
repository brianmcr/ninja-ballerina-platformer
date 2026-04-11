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

export const NINJA_COLORS = {
  idle: [90, 60, 90] as const,
  run: [110, 40, 80] as const,
  jump: [100, 80, 110] as const,
  float: [80, 60, 120] as const,
  spin: [180, 150, 0] as const,
  dash: [0, 180, 180] as const,
  whip: [180, 30, 30] as const,
} as const
