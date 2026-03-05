// Chess sound effects using Web Audio API
const audioCtx = () => {
  if (!(window as any).__chessAudioCtx) {
    (window as any).__chessAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__chessAudioCtx as AudioContext;
};

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  const ctx = audioCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playMoveSound() {
  playTone(600, 0.08, "sine", 0.12);
  setTimeout(() => playTone(800, 0.06, "sine", 0.08), 30);
}

export function playCaptureSound() {
  playTone(300, 0.12, "square", 0.15);
  setTimeout(() => playTone(200, 0.1, "square", 0.1), 40);
}

export function playCheckSound() {
  playTone(880, 0.1, "sawtooth", 0.12);
  setTimeout(() => playTone(1100, 0.15, "sawtooth", 0.1), 80);
}

export function playCheckmateSound() {
  playTone(523, 0.15, "sine", 0.15);
  setTimeout(() => playTone(659, 0.15, "sine", 0.15), 150);
  setTimeout(() => playTone(784, 0.2, "sine", 0.18), 300);
  setTimeout(() => playTone(1047, 0.4, "sine", 0.2), 450);
}

export function playGameOverSound() {
  playTone(400, 0.2, "triangle", 0.12);
  setTimeout(() => playTone(300, 0.3, "triangle", 0.1), 200);
}
