import fs from 'node:fs';
import path from 'node:path';

interface TrackSpec {
  filename: string;
  durationSec: number;
  baseFreq: number;
  mode: 'dj_drop' | 'commercial' | 'event_fanfare' | 'street_sound' | 'paredao_bass';
}

const TRACK_SPECS: TrackSpec[] = [
  {
    filename: 'vinheta-dj-impacto.wav',
    durationSec: 8,
    baseFreq: 110,
    mode: 'dj_drop',
  },
  {
    filename: 'spot-comercial-varejo.wav',
    durationSec: 10,
    baseFreq: 261.63,
    mode: 'commercial',
  },
  {
    filename: 'chamada-vaquejada-fest.wav',
    durationSec: 9,
    baseFreq: 146.83,
    mode: 'event_fanfare',
  },
  {
    filename: 'locucao-carro-som.wav',
    durationSec: 8,
    baseFreq: 196,
    mode: 'street_sound',
  },
  {
    filename: 'abertura-paredao-grave.wav',
    durationSec: 10,
    baseFreq: 55,
    mode: 'paredao_bass',
  },
];

function writeWavFile(filePath: string, sampleRate: number, left: Float32Array, right: Float32Array): void {
  const numSamples = left.length;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-0.98, Math.min(0.98, left[i]));
    const r = Math.max(-0.98, Math.min(0.98, right[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

function synthesizeTrack(spec: TrackSpec): { left: Float32Array; right: Float32Array; sampleRate: number } {
  const sampleRate = 22050;
  const totalSamples = spec.durationSec * sampleRate;
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / spec.durationSec;

    // Smooth fade-in and fade-out
    const fadeIn = Math.min(1, t / 0.08);
    const fadeOut = Math.min(1, (spec.durationSec - t) / 0.35);
    const masterEnv = fadeIn * fadeOut;

    let lSample = 0;
    let rSample = 0;

    if (spec.mode === 'dj_drop') {
      // Rhythmic 128 BPM pulse + riser + sub impact
      const beatTime = t % 0.46875;
      const kickEnv = Math.exp(-beatTime * 16);
      const kickFreq = 48 + 90 * Math.exp(-beatTime * 35);
      const kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * kickEnv * 0.52;

      // Stereo synth stab on 2nd and 4th beats
      const barPos = (t * 2.133) % 4;
      const chordEnv = Math.exp(-((t % 0.9375) * 4.5));
      const f1 = spec.baseFreq * (barPos > 2 ? 1.5 : 1.0);
      const padL = (Math.sin(2 * Math.PI * f1 * 2 * t) + 0.5 * Math.sin(2 * Math.PI * f1 * 3 * t)) * chordEnv * 0.18;
      const padR = (Math.sin(2 * Math.PI * (f1 * 2.01) * t) + 0.5 * Math.sin(2 * Math.PI * (f1 * 2.99) * t)) * chordEnv * 0.18;

      // Subtle sweep in middle
      const sweepEnv = Math.sin(Math.PI * progress) * 0.12;
      const sweepFreq = 220 + 680 * progress;
      const sweep = Math.sin(2 * Math.PI * sweepFreq * t) * sweepEnv;

      lSample = kick + padL + sweep;
      rSample = kick + padR - sweep * 0.5;
    } else if (spec.mode === 'commercial') {
      // Warm upbeat broadcast bed (major 9th arpeggio + soft pulse)
      const notes = [1, 1.25, 1.5, 1.875, 1.5, 1.25];
      const step = Math.floor(t * 4) % notes.length;
      const noteT = t % 0.25;
      const pluckEnv = Math.exp(-noteT * 9);
      const freq = spec.baseFreq * notes[step];
      const pluckL = (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t)) * pluckEnv * 0.28;
      const pluckR = (Math.sin(2 * Math.PI * (freq * 1.003) * t) + 0.35 * Math.sin(4 * Math.PI * freq * t)) * pluckEnv * 0.28;

      const bass = Math.sin(2 * Math.PI * (spec.baseFreq * 0.5) * t) * 0.18;
      const chime = t < 0.8 ? Math.sin(2 * Math.PI * 1046.5 * t) * Math.exp(-t * 4) * 0.2 : 0;

      lSample = pluckL + bass + chime;
      rSample = pluckR + bass + chime;
    } else if (spec.mode === 'event_fanfare') {
      // Arena brass/synth fanfare + driving percussive groove
      const beat = t % 0.42;
      const drumEnv = Math.exp(-beat * 14);
      const drum = Math.sin(2 * Math.PI * (55 + 70 * Math.exp(-beat * 30)) * beat) * drumEnv * 0.48;

      const chordNotes = t < 4.5 ? [1, 1.25, 1.5] : [1.125, 1.406, 1.6875];
      const gate = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4.76 * t);
      let brassL = 0;
      let brassR = 0;
      for (const ratio of chordNotes) {
        const f = spec.baseFreq * 2 * ratio;
        brassL += Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t);
        brassR += Math.sin(2 * Math.PI * (f * 1.004) * t) + 0.4 * Math.sin(4 * Math.PI * f * t);
      }
      brassL *= 0.09 * (0.65 + 0.35 * gate);
      brassR *= 0.09 * (0.65 + 0.35 * gate);

      lSample = drum + brassL;
      rSample = drum + brassR;
    } else if (spec.mode === 'street_sound') {
      // Broadcast attention chime + clean rhythmic commercial groove
      const introChime = t < 1.2
        ? Math.sin(2 * Math.PI * (t < 0.4 ? 587.33 : t < 0.8 ? 783.99 : 1046.5) * t) * Math.exp(-(t % 0.4) * 6) * 0.25
        : 0;
      const grooveT = t % 0.5;
      const pulse = Math.sin(2 * Math.PI * spec.baseFreq * 0.5 * t) * (0.2 + 0.15 * Math.exp(-grooveT * 8));
      const pad = Math.sin(2 * Math.PI * spec.baseFreq * t) * 0.14 + Math.sin(2 * Math.PI * spec.baseFreq * 1.5 * t) * 0.1;

      lSample = introChime + pulse + pad;
      rSample = introChime + pulse + pad * 0.95;
    } else {
      // Paredão sub-bass impact + stereo harmonic drop
      const dropPhase = t < 2.5 ? t / 2.5 : 1;
      const riser = t < 2.5
        ? Math.sin(2 * Math.PI * (120 + 500 * dropPhase * dropPhase) * t) * dropPhase * 0.22
        : 0;
      const beatT = t >= 2.5 ? (t - 2.5) % 0.48 : 1;
      const subEnv = t >= 2.5 ? Math.exp(-beatT * 6) : 0;
      const subBass = Math.sin(2 * Math.PI * spec.baseFreq * t) * subEnv * 0.6;
      const subHarmonic = Math.sin(2 * Math.PI * (spec.baseFreq * 2) * t) * subEnv * 0.25;

      const leadGate = t >= 2.5 ? Math.exp(-((t - 2.5) % 0.96) * 4) : 0;
      const leadL = Math.sin(2 * Math.PI * 220 * t) * leadGate * 0.18;
      const leadR = Math.sin(2 * Math.PI * 221.2 * t) * leadGate * 0.18;

      lSample = riser + subBass + subHarmonic + leadL;
      rSample = riser * 0.8 + subBass + subHarmonic + leadR;
    }

    left[i] = lSample * masterEnv;
    right[i] = rSample * masterEnv;
  }

  return { left, right, sampleRate };
}

export function ensureDemoAudioFiles(uploadsRoot: string): void {
  const demoDir = path.join(uploadsRoot, 'demos');
  fs.mkdirSync(demoDir, { recursive: true });

  for (const spec of TRACK_SPECS) {
    const outPath = path.join(demoDir, spec.filename);
    if (!fs.existsSync(outPath)) {
      const { left, right, sampleRate } = synthesizeTrack(spec);
      writeWavFile(outPath, sampleRate, left, right);
    }
  }
}
