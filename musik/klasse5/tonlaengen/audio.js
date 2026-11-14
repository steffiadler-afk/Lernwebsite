import { NOTES, sum, soundOnsets } from './model.js';

let context;
let generation = 0;
let frame;
const oscillators = new Set();

export function stop() {
  generation++;
  cancelAnimationFrame(frame);
  for (const oscillator of oscillators) {
    try { oscillator.stop(); } catch { /* Already finished. */ }
  }
  oscillators.clear();
}

function tone(at, duration, frequency, volume, type = 'sine') {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  const fadeIn = Math.min(.006, duration / 5);
  const release = Math.min(.035, duration / 2);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + fadeIn);
  gain.gain.setValueAtTime(volume, at + duration - release);
  gain.gain.linearRampToValueAtTime(0, at + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillators.add(oscillator);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    oscillators.delete(oscillator);
  };
  oscillator.start(at);
  oscillator.stop(at + duration + .005);
}

function click(at, accent = false) {
  tone(at, .038, accent ? 1450 : 1050, accent ? .092 : .056);
}

function drum(at, volume = .2) {
  tone(at, .085, 245, volume, 'triangle');
  tone(at, .025, 700, volume * .22);
}

function audibleTime() {
  const stamp = context.getOutputTimestamp?.();
  if (stamp?.contextTime > 0 && stamp.performanceTime > 0) {
    return stamp.contextTime + (performance.now() - stamp.performanceTime) / 1000;
  }
  return context.currentTime - (context.outputLatency || context.baseLatency || 0);
}

async function start(schedule, report) {
  stop();
  const run = generation;
  try {
    const BrowserAudio = window.AudioContext || window.webkitAudioContext;
    if (!BrowserAudio) throw new Error('Audio ist in diesem Browser nicht verfügbar.');
    context ??= new BrowserAudio();
    await context.resume();
    if (run !== generation) return null;
    const at = context.currentTime + .14;
    const update = schedule(at);
    const draw = () => {
      if (run === generation && update(audibleTime() - at)) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => audibleTime() - at;
  } catch {
    if (run === generation) report('Der Ton konnte nicht starten. Tippe erneut auf „Hören“.');
    return null;
  }
}

function scheduleBeats(startAt, count, beat, beatsPerBar = 4) {
  for (let i = 0; i < count; i++) click(startAt + i * beat, i % beatsPerBar === 0);
}

export function playNotes(bars, bpm, report, countIn = 4) {
  const beat = 60 / bpm;
  const duration = bars.reduce((total, bar) => total + sum(bar) / 4, 0);
  return start(at => {
    scheduleBeats(at, countIn + Math.ceil(duration), beat);
    let time = at + countIn * beat;
    for (const bar of bars) {
      for (const key of bar) {
        const length = NOTES[key].ticks * beat / 4;
        if (!key.startsWith('r')) tone(time, length * .97, 440, .21);
        time += length;
      }
    }
    report(countIn ? 'Vier Zählschläge, dann erklingt der Rhythmus.' : 'Hör genau hin. Die Klicks markieren den Grundschlag.');
    return elapsed => {
      if (elapsed < (countIn + duration) * beat) return true;
      report('Fertig. Du kannst noch einmal hören.');
      return false;
    };
  }, report);
}

export function playMeter({ meter, bpm, accompaniment }, report) {
  const beat = 60 / bpm;
  const count = meter * 4;
  return start(at => {
    for (let i = 0; i < count; i++) {
      const downbeat = i % meter === 0;
      const time = at + i * beat;
      tone(time, .13, downbeat ? 190 : 385, downbeat ? .3 : .17, 'triangle');
      if (accompaniment) {
        const root = i < count / 2 ? 261.63 : 293.66;
        tone(time, beat * .67, root, .055);
        tone(time + beat / 2, beat * .31, root * 1.5, .09);
      }
    }
    report('Höre auf den tieferen, betonten Schlag.');
    return elapsed => {
      if (elapsed < count * beat) return true;
      report('Welche Taktart hast du gehört?');
      return false;
    };
  }, report);
}

export function playEcho(pattern, bpm, update, report) {
  const beat = 60 / bpm;
  return start(at => {
    scheduleBeats(at, 12, beat);
    for (const onset of soundOnsets(pattern)) drum(at + onset * beat);
    return elapsed => {
      const step = Math.floor(elapsed / beat);
      update(step);
      return step < 12;
    };
  }, report);
}

export function tapSound() {
  if (context?.state === 'running') drum(context.currentTime, .14);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
});
window.addEventListener('pagehide', stop);
