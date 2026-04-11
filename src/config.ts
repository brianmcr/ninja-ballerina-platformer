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

export const COLORS = {
  idle: [255, 105, 180] as const,
  run: [255, 20, 147] as const,
  jump: [255, 182, 193] as const,
  float: [200, 162, 255] as const,
  spin: [255, 215, 0] as const,
  dash: [0, 255, 255] as const,
  whip: [255, 50, 50] as const,
} as const
