let fading = false

export function fadeOut(duration: number, callback: () => void) {
  if (fading) return
  fading = true

  const overlay = add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(0),
    fixed(),
    z(9999),
    "fade-overlay",
  ])

  let elapsed = 0
  overlay.onUpdate(() => {
    elapsed += dt()
    overlay.opacity = Math.min(elapsed / duration, 1)
    if (elapsed >= duration) {
      fading = false
      callback()
    }
  })
}

export function fadeIn(duration: number) {
  fading = false

  const overlay = add([
    rect(width(), height()),
    pos(0, 0),
    color(0, 0, 0),
    opacity(1),
    fixed(),
    z(9999),
    "fade-overlay",
  ])

  let elapsed = 0
  overlay.onUpdate(() => {
    elapsed += dt()
    overlay.opacity = Math.max(1 - elapsed / duration, 0)
    if (elapsed >= duration) {
      destroy(overlay)
    }
  })
}
