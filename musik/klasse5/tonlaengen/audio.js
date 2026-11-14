import { NOTES, sum } from './model.js';

const pianoPitch = 261.63;
const pianoUrl = new URL('./sounds/klavier-c4.mp3', import.meta.url);
const clavesUrl = new URL('./sounds/claves.wav', import.meta.url);

let context;
let generation = 0;
let frame;
const sources = new Set();
let sampleRequest;
let samples;

export function stop() {
  generation++;
  cancelAnimationFrame(frame);
  for (const source of sources) {
    try { source.stop(); } catch { /* Already finished. */ }
  }
  sources.clear();
}

async function decodeSample(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Tondatei konnte nicht geladen werden.');
  return context.decodeAudioData(await response.arrayBuffer());
}

function loadSamples() {
  if (!sampleRequest) {
    sampleRequest = Promise.all([decodeSample(pianoUrl), decodeSample(clavesUrl)])
      .then(([piano, claves]) => { samples = { piano, claves }; })
      .catch(error => {
        sampleRequest = undefined;
        throw error;
      });
  }
  return sampleRequest;
}

function playSample(buffer, at, duration, volume, rate = 1) {
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const release = Math.min(.035, duration / 2);
  gain.gain.setValueAtTime(volume, at);
  gain.gain.setValueAtTime(volume, at + duration - release);
  gain.gain.linearRampToValueAtTime(0, at + duration);
  source.connect(gain);
  gain.connect(context.destination);
  sources.add(source);
  source.onended = () => {
    source.disconnect();
    gain.disconnect();
    sources.delete(source);
  };
  source.start(at);
  source.stop(at + duration);
}

function piano(at, duration, volume = .66, frequency = pianoPitch) {
  playSample(samples.piano, at, duration, volume, frequency / pianoPitch);
}

function claves(at, accent, volume = .18) {
  const rate = accent ? .94 : 1;
  playSample(samples.claves, at, samples.claves.duration / rate, volume * (accent ? 1.48 : 1), rate);
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
    if (!samples) report('Klavier und Claves werden geladen …');
    await Promise.all([context.resume(), loadSamples()]);
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
  for (let i = 0; i < count; i++) claves(startAt + i * beat, i % beatsPerBar === 0);
}

function schedulePattern(pattern, at, beat) {
  for (const key of pattern) {
    const duration = NOTES[key].ticks * beat / 4;
    if (!key.startsWith('r')) piano(at, duration * .97);
    at += duration;
  }
}

export function playNotes(bars, bpm, report, countIn = 4) {
  const beat = 60 / bpm;
  const duration = bars.reduce((total, bar) => total + sum(bar) / 4, 0);
  return start(at => {
    scheduleBeats(at, countIn + Math.ceil(duration), beat);
    let barStart = at + countIn * beat;
    for (const pattern of bars) {
      schedulePattern(pattern, barStart, beat);
      barStart += sum(pattern) * beat / 4;
    }
    report(countIn ? 'Vier Claves-Schläge, dann erklingt das Klavier.' : 'Hör genau hin. Die Claves markieren den Grundschlag.');
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
      claves(time, downbeat, .34);
      if (accompaniment) {
        const root = i < count / 2 ? pianoPitch : 293.66;
        piano(time, beat * .67, .18, root);
        piano(time + beat / 2, beat * .31, .22, root * 1.5);
      }
    }
    report('Höre auf den betonten Claves-Schlag.');
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
    schedulePattern(pattern, at, beat);
    return elapsed => {
      const step = Math.floor(elapsed / beat);
      update(step);
      return step < 12;
    };
  }, report);
}

export function tapSound() {
  if (context?.state === 'running' && samples) piano(context.currentTime, .09, .35);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
});
window.addEventListener('pagehide', stop);
