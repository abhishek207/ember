export type SoundId = "forest" | "rain" | "night" | "ocean" | "ember";

export const SOUNDS: { id: SoundId; label: string; hint: string }[] = [
  { id: "forest", label: "Forest", hint: "Leaves and low air" },
  { id: "rain", label: "Rain", hint: "Soft fall on leaves" },
  { id: "night", label: "Night", hint: "Still, far insects" },
  { id: "ocean", label: "Shore", hint: "Slow tide" },
  { id: "ember", label: "Ember", hint: "Brown noise" },
];

export const SITS: { minutes: number; label: string }[] = [
  { minutes: 5, label: "5 min" },
  { minutes: 10, label: "10 min" },
  { minutes: 15, label: "15 min" },
];

type Listener = () => void;

function makeNoise(ctx: AudioContext, kind: "white" | "brown" | "pink"): AudioBuffer {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === "white") {
      data[i] = white * 0.35;
    } else if (kind === "brown") {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.5703 * b2 + white * 1.052691;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.1;
    }
  }
  return buffer;
}

function loopSource(ctx: AudioContext, buffer: AudioBuffer, dest: AudioNode): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(dest);
  src.start();
  return src;
}

class MediEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private sources: AudioBufferSourceNode[] = [];
  private oscillators: OscillatorNode[] = [];
  playing: SoundId | null = null;
  sitEndsAt: number | null = null;
  sitTotal = 0;
  private sitTimer: number | null = null;
  private listeners = new Set<Listener>();

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  sitRemaining(): number {
    if (!this.sitEndsAt) return 0;
    return Math.max(0, Math.ceil((this.sitEndsAt - Date.now()) / 1000));
  }

  async play(id: SoundId): Promise<void> {
    this.stopSound(false);
    const ctx = new AudioContext();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.1);
    master.connect(ctx.destination);
    this.master = master;
    this.patch(id, ctx, master);
    this.playing = id;
    this.emit();
  }

  stopSound(emit = true) {
    const closing = this.ctx;
    const closingMaster = this.master;
    if (closing && closingMaster) {
      try {
        closingMaster.gain.cancelScheduledValues(closing.currentTime);
        closingMaster.gain.setValueAtTime(closingMaster.gain.value, closing.currentTime);
        closingMaster.gain.linearRampToValueAtTime(0, closing.currentTime + 0.25);
      } catch {
        /* already closed */
      }
    }
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* stopped */
      }
    });
    this.oscillators.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* stopped */
      }
    });
    this.sources = [];
    this.oscillators = [];
    this.nodes = [];
    this.ctx = null;
    this.master = null;
    this.playing = null;
    window.setTimeout(() => {
      void closing?.close();
    }, 280);
    if (emit) this.emit();
  }

  startSit(minutes: number) {
    this.clearSitTimer();
    this.sitTotal = minutes * 60;
    this.sitEndsAt = Date.now() + this.sitTotal * 1000;
    this.sitTimer = window.setInterval(() => {
      if (this.sitRemaining() <= 0) this.stopSit();
      else this.emit();
    }, 250);
    if (!this.playing) void this.play("forest");
    this.emit();
  }

  stopSit() {
    this.clearSitTimer();
    this.sitEndsAt = null;
    this.sitTotal = 0;
    this.emit();
  }

  private clearSitTimer() {
    if (this.sitTimer != null) {
      window.clearInterval(this.sitTimer);
      this.sitTimer = null;
    }
  }

  private patch(id: SoundId, ctx: AudioContext, master: GainNode) {
    if (id === "ember") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 280;
      filter.connect(master);
      this.nodes.push(filter);
      this.sources.push(loopSource(ctx, makeNoise(ctx, "brown"), filter));
      return;
    }
    if (id === "rain") {
      const high = ctx.createBiquadFilter();
      high.type = "highpass";
      high.frequency.value = 900;
      const gain = ctx.createGain();
      gain.gain.value = 0.7;
      high.connect(gain);
      gain.connect(master);
      this.nodes.push(high, gain);
      this.sources.push(loopSource(ctx, makeNoise(ctx, "pink"), high));
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.18;
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      this.oscillators.push(lfo);
      this.nodes.push(lfoGain);
      return;
    }
    if (id === "ocean") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 520;
      filter.Q.value = 0.7;
      filter.connect(master);
      this.nodes.push(filter);
      this.sources.push(loopSource(ctx, makeNoise(ctx, "brown"), filter));
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.07;
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.oscillators.push(lfo);
      this.nodes.push(lfoGain);
      return;
    }
    if (id === "night") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      filter.connect(master);
      this.nodes.push(filter);
      this.sources.push(loopSource(ctx, makeNoise(ctx, "brown"), filter));
      return;
    }
    const low = ctx.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 640;
    const air = ctx.createBiquadFilter();
    air.type = "highpass";
    air.frequency.value = 1400;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.08;
    low.connect(master);
    air.connect(airGain);
    airGain.connect(master);
    this.nodes.push(low, air, airGain);
    this.sources.push(loopSource(ctx, makeNoise(ctx, "brown"), low));
    this.sources.push(loopSource(ctx, makeNoise(ctx, "pink"), air));
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(low.frequency);
    lfo.start();
    this.oscillators.push(lfo);
    this.nodes.push(lfoGain);
  }
}

export const mediEngine = new MediEngine();
