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

// Coin pitch rises with consecutive pickups (Mario-style).
// Resets after 1s of no collection.
let coinCombo = 0
let lastCoinTime = 0
export function playCoin() {
  const now = performance.now() / 1000
  if (now - lastCoinTime > 1.0) coinCombo = 0
  else coinCombo++
  lastCoinTime = now
  const semitone = Math.min(coinCombo, 12) * 2
  const basePitch = 800 * Math.pow(2, semitone / 12)
  const highPitch = 1200 * Math.pow(2, semitone / 12)
  tone(basePitch, basePitch, 0.06, "sine", 0.1)
  tone(highPitch, highPitch, 0.06, "sine", 0.1, 0.06)
}

// Stomp chain: each consecutive air-stomp plays a higher rising tone.
let stompChain = 0
let lastStompTime = 0
export function playStomp() {
  const now = performance.now() / 1000
  if (now - lastStompTime > 1.5) stompChain = 0
  else stompChain++
  lastStompTime = now
  const semitone = Math.min(stompChain, 10) * 2
  const start = 300 * Math.pow(2, semitone / 12)
  const end = 600 * Math.pow(2, semitone / 12)
  tone(start, end, 0.15, "triangle", 0.14)
}
export function getStompChain() { return stompChain }
export function resetStompChain() { stompChain = 0; lastStompTime = 0 }

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

export function playDamage() {
  tone(150, 100, 0.1, "sawtooth", 0.15)
}

export function playBossHit() {
  noise(0.2, 0.15)
  tone(80, 50, 0.2, "sine", 0.12)
}

// -------------------------------------------------------------------
// Background music — two looping chiptune tracks scheduled ahead of
// time. playBgm("level") drives a bouncy major-key loop; playBgm("boss")
// switches to a darker minor-key loop. stopBgm() halts scheduling.
// -------------------------------------------------------------------

type Note = { freq: number; dur: number }

// Simple melody — notes from C major pentatonic. Two-bar loop.
const LEVEL_MELODY: Note[] = [
  { freq: 523, dur: 0.2 }, // C5
  { freq: 659, dur: 0.2 }, // E5
  { freq: 784, dur: 0.2 }, // G5
  { freq: 880, dur: 0.2 }, // A5
  { freq: 784, dur: 0.2 }, // G5
  { freq: 659, dur: 0.4 }, // E5 long
  { freq: 587, dur: 0.2 }, // D5
  { freq: 523, dur: 0.2 }, // C5
  { freq: 659, dur: 0.4 }, // E5
  { freq: 523, dur: 0.4 }, // C5
]
// Bass line — walking notes under the melody
const LEVEL_BASS: Note[] = [
  { freq: 131, dur: 0.4 }, // C3
  { freq: 131, dur: 0.4 },
  { freq: 175, dur: 0.4 }, // F3
  { freq: 131, dur: 0.4 },
  { freq: 131, dur: 0.4 },
  { freq: 196, dur: 0.4 }, // G3
  { freq: 165, dur: 0.4 }, // E3
  { freq: 131, dur: 0.4 },
]

const BOSS_MELODY: Note[] = [
  { freq: 440, dur: 0.18 }, // A4
  { freq: 466, dur: 0.18 }, // A#4
  { freq: 440, dur: 0.18 },
  { freq: 392, dur: 0.36 }, // G4
  { freq: 349, dur: 0.18 }, // F4
  { freq: 311, dur: 0.36 }, // D#4
  { freq: 294, dur: 0.18 }, // D4
  { freq: 262, dur: 0.36 }, // C4
  { freq: 294, dur: 0.18 },
  { freq: 311, dur: 0.18 },
]
const BOSS_BASS: Note[] = [
  { freq: 110, dur: 0.2 }, // A2
  { freq: 110, dur: 0.2 },
  { freq: 98, dur: 0.2 }, // G2
  { freq: 82, dur: 0.2 }, // E2
  { freq: 73, dur: 0.2 }, // D2
  { freq: 82, dur: 0.2 },
  { freq: 98, dur: 0.2 },
  { freq: 110, dur: 0.2 },
]

let bgmPlaying: string | null = null
let bgmStopToken = 0

function scheduleBgm(track: Note[], bass: Note[], startTime: number, vol: number, bassVol: number, waveform: OscillatorType, token: number) {
  const c = getCtx()
  let t = startTime
  // Schedule the melody
  for (const n of track) {
    if (token !== bgmStopToken) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = waveform
    osc.frequency.setValueAtTime(n.freq, t)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.01)
    gain.gain.linearRampToValueAtTime(0, t + n.dur)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t)
    osc.stop(t + n.dur + 0.02)
    t += n.dur
  }
  // Schedule the bass
  let bt = startTime
  for (const n of bass) {
    if (token !== bgmStopToken) return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(n.freq, bt)
    gain.gain.setValueAtTime(bassVol, bt)
    gain.gain.linearRampToValueAtTime(0, bt + n.dur)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(bt)
    osc.stop(bt + n.dur + 0.02)
    bt += n.dur
  }
  // Recursively schedule the next loop ~0.1s before the current one ends
  const loopLen = track.reduce((a, n) => a + n.dur, 0)
  const nextStart = startTime + loopLen
  const msUntilRefill = (nextStart - c.currentTime - 0.1) * 1000
  setTimeout(() => {
    if (token === bgmStopToken) {
      scheduleBgm(track, bass, nextStart, vol, bassVol, waveform, token)
    }
  }, Math.max(50, msUntilRefill))
}

export function playBgm(track: "level" | "boss") {
  if (bgmPlaying === track) return
  stopBgm()
  bgmPlaying = track
  bgmStopToken++
  const token = bgmStopToken
  const c = getCtx()
  if (track === "level") {
    scheduleBgm(LEVEL_MELODY, LEVEL_BASS, c.currentTime + 0.05, 0.05, 0.04, "square", token)
  } else {
    scheduleBgm(BOSS_MELODY, BOSS_BASS, c.currentTime + 0.05, 0.06, 0.05, "sawtooth", token)
  }
}

export function stopBgm() {
  bgmPlaying = null
  bgmStopToken++
}
