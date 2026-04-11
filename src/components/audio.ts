let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

function initOnInteraction() {
  if (ctx) return
  const handler = () => {
    getCtx()
    document.removeEventListener("keydown", handler)
    document.removeEventListener("click", handler)
  }
  document.addEventListener("keydown", handler)
  document.addEventListener("click", handler)
}
initOnInteraction()

function tone(freq: number, endFreq: number, duration: number, type: OscillatorType = "sine", vol = 0.15, startTime = 0) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + startTime)
  osc.frequency.linearRampToValueAtTime(endFreq, c.currentTime + startTime + duration)
  gain.gain.setValueAtTime(vol, c.currentTime + startTime)
  gain.gain.linearRampToValueAtTime(0, c.currentTime + startTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime + startTime)
  osc.stop(c.currentTime + startTime + duration)
}

function noise(duration: number, vol = 0.1, startTime = 0, highpass = 0) {
  const c = getCtx()
  const bufSize = Math.floor(c.sampleRate * duration)
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const gain = c.createGain()
  gain.gain.setValueAtTime(vol, c.currentTime + startTime)
  gain.gain.linearRampToValueAtTime(0, c.currentTime + startTime + duration)
  if (highpass > 0) {
    const filter = c.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.value = highpass
    src.connect(filter)
    filter.connect(gain)
  } else {
    src.connect(gain)
  }
  gain.connect(c.destination)
  src.start(c.currentTime + startTime)
  src.stop(c.currentTime + startTime + duration)
}

export function playJump() {
  tone(200, 400, 0.1, "sine", 0.12)
}

export function playLand() {
  noise(0.05, 0.08)
}

export function playCoin() {
  tone(800, 800, 0.06, "sine", 0.1)
  tone(1200, 1200, 0.06, "sine", 0.1, 0.06)
}

export function playHit() {
  noise(0.15, 0.12)
  tone(100, 60, 0.15, "sine", 0.1)
}

export function playPowerup() {
  tone(400, 400, 0.1, "sine", 0.1)
  tone(500, 500, 0.1, "sine", 0.1, 0.1)
  tone(700, 700, 0.1, "sine", 0.1, 0.2)
}

export function playWhip() {
  noise(0.1, 0.1, 0, 800)
}

export function playSpin() {
  tone(300, 600, 0.15, "sine", 0.1)
}

export function playDash() {
  noise(0.2, 0.1, 0, 600)
}

export function playShuriken() {
  tone(1200, 800, 0.08, "sine", 0.08)
  noise(0.06, 0.06, 0, 2000)
}

export function playDefeat() {
  tone(500, 500, 0.12, "sine", 0.12)
  tone(400, 400, 0.12, "sine", 0.12, 0.12)
  tone(280, 280, 0.16, "sine", 0.12, 0.24)
}

export function playBossHit() {
  noise(0.2, 0.15)
  tone(80, 50, 0.2, "sine", 0.12)
}
