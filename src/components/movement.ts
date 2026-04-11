import { PLAYER, GRAVITY } from "../config"

export function applyFloat(player: any, isFloating: boolean) {
  if (isFloating && !player.isGrounded() && player.vel.y > 0) {
    const reduction = GRAVITY - PLAYER.FLOAT_GRAVITY
    player.vel.y -= reduction * dt()
    if (player.vel.y < 0) player.vel.y = 0
    return true
  }
  return false
}

export function startDash(player: any): { timer: number; dir: number } {
  return {
    timer: PLAYER.DASH_DURATION,
    dir: player.facing,
  }
}

export function updateDash(player: any, dashState: { timer: number; dir: number }): boolean {
  dashState.timer -= dt()
  if (dashState.timer <= 0) return false
  player.move(dashState.dir * PLAYER.DASH_SPEED, 0)
  return true
}
