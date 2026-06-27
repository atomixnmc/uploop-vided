/**
 * 16-crossfade-audio — Audio crossfading between two tracks.
 *
 * Two audio tracks with a crossfade slider. Volume meters driven
 * by simulated audio levels. Imports easing from @uploop/timeline
 * for smooth volume transitions.
 */

import { html, component } from "@uploop/html";
import { easing } from "@uploop/timeline";

const CrossfadeAudio = component("CrossfadeAudio", {
  state: {
    fader: 50,
    playing: false,
    trackA: {
      name: "Synth",
      src: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    },
    trackB: {
      name: "Bass",
      src: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    },
    meterA: 0,
    meterB: 0,
  },

  update: {
    setFader: (s, v) => ({ ...s, fader: v }),
    setVolumeA: (s, v) => ({ ...s, volA: v }),
    setVolumeB: (s, v) => ({ ...s, volB: v }),
    togglePlay: (s) => ({ ...s, playing: !s.playing }),
    tick: (s) => {
      if (!s.playing) return { ...s, meterA: 0, meterB: 0 };
      const t = s.fader / 100;
      const baseA = 1 - t;
      const baseB = t;
      const noiseA = Math.random() * 0.3 * baseA;
      const noiseB = Math.random() * 0.3 * baseB;
      return {
        ...s,
        meterA: baseA * 0.6 + noiseA * 0.4,
        meterB: baseB * 0.6 + noiseB * 0.4,
      };
    },
  },

  view: (s, { send }) => {
    const t = s.fader / 100;
    const eased = easing.easeInOut(t);
    const volA = 1 - eased;
    const volB = eased;
    const meterAW = s.playing ? s.meterA * 100 : 0;
    const meterBW = s.playing ? s.meterB * 100 : 0;

    return html`
      <a href=".." class="back">← Examples</a>
      <h2 style="font-size:18px;font-weight:600;color:#ccc">
        🎵 Audio Crossfade
      </h2>
      <div
        class="card"
        style="background:#151520;border-radius:12px;padding:24px;width:min(500px,90vw)"
      >
        <div
          class="track-label"
          style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"
        >
          <span style="font-size:14px;font-weight:600"
            >🔊 ${s.trackA.name}</span
          >
        </div>
        <div
          class="meter"
          style="display:flex;align-items:center;gap:8px;margin-bottom:16px"
        >
          <div
            class="meter-bar"
            style="flex:1;height:8px;background:#222;border-radius:4px;overflow:hidden"
          >
            <div
              class="meter-fill"
              style="height:100%;width:${meterAW}%;background:linear-gradient(90deg,#4f8,#8f4);border-radius:4px"
            ></div>
          </div>
          <span
            class="meter-val"
            style="font-size:12px;color:#888;width:40px;text-align:right"
            >${Math.round(volA * 100)}%</span
          >
        </div>
        <div
          class="track-label"
          style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"
        >
          <span style="font-size:14px;font-weight:600"
            >🔊 ${s.trackB.name}</span
          >
        </div>
        <div
          class="meter"
          style="display:flex;align-items:center;gap:8px;margin-bottom:16px"
        >
          <div
            class="meter-bar"
            style="flex:1;height:8px;background:#222;border-radius:4px;overflow:hidden"
          >
            <div
              class="meter-fill"
              style="height:100%;width:${meterBW}%;background:linear-gradient(90deg,#4f8,#8f4);border-radius:4px"
            ></div>
          </div>
          <span
            class="meter-val"
            style="font-size:12px;color:#888;width:40px;text-align:right"
            >${Math.round(volB * 100)}%</span
          >
        </div>
        <div class="crossfader" style="margin:20px 0">
          <label
            style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px;color:#aaa"
          >
            Crossfade
            <span style="color:#4f8;font-weight:700"
              >${Math.round(volA * 100)}% A / ${Math.round(volB * 100)}% B</span
            >
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value="${s.fader}"
            step="1"
            style="width:100%;accent-color:#4f8;cursor:pointer"
            @input=${(e) => send("setFader", Number(e.target.value))}
          />
        </div>
        <div class="play-row" style="display:flex;gap:8px;align-items:center">
          <button
            class="${s.playing ? "playing" : ""}"
            style="background:#151520;color:#e0e0e0;border:1px solid #333;padding:8px 20px;border-radius:8px;cursor:pointer;font-size:14px${s.playing
              ? ";background:#2a3a2a;border-color:#4f8;color:#4f8"
              : ""}"
            @click=${() => send("togglePlay")}
          >
            ${s.playing ? "⏸ Playing" : "▶ Play Both"}
          </button>
        </div>
      </div>
      <div class="info" style="font-size:13px;color:#666">
        Using <code>easing</code> from <code>@uploop/timeline</code> for smooth
        volume curves
      </div>
    `;
  },

  mount: (el, ctx) => {
    let audioCtx = null;
    let gainA = null;
    let gainB = null;
    let audioA = null;
    let audioB = null;
    let meterRaf = null;

    function initAudio() {
      if (audioCtx) return;
      audioCtx = new AudioContext();

      audioA = new Audio("https://samplelib.com/lib/preview/mp3/sample-3s.mp3");
      audioA.loop = true;
      audioB = new Audio("https://samplelib.com/lib/preview/mp3/sample-9s.mp3");
      audioB.loop = true;

      const srcA = audioCtx.createMediaElementSource(audioA);
      const srcB = audioCtx.createMediaElementSource(audioB);

      gainA = audioCtx.createGain();
      gainB = audioCtx.createGain();
      gainA.gain.value = 0.5;
      gainB.gain.value = 0.5;

      srcA.connect(gainA).connect(audioCtx.destination);
      srcB.connect(gainB).connect(audioCtx.destination);

      audioA._gain = gainA;
      audioB._gain = gainB;
    }

    const origToggle = ctx.state.playing;

    // Override togglePlay to handle audio context
    const origSend = ctx.send;
    const toggleIdx = Object.keys(ctx.state).indexOf("playing");

    function meterLoop() {
      if (ctx.state.playing) {
        const t = ctx.state.fader / 100;
        const eased = easing.easeInOut(t);
        const volAVal = Math.max(0.001, 1 - eased);
        const volBVal = Math.max(0.001, eased);

        if (gainA) gainA.gain.value = volAVal;
        if (gainB) gainB.gain.value = volBVal;

        if (audioA && audioA.paused) audioA.play().catch(() => {});
        if (audioB && audioB.paused) audioB.play().catch(() => {});

        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
      } else {
        if (audioA && !audioA.paused) audioA.pause();
        if (audioB && !audioB.paused) audioB.pause();
      }

      ctx.send("tick");
      meterRaf = requestAnimationFrame(meterLoop);
    }

    initAudio();

    // Wire fader changes to gain nodes
    const origSetFader = (v) => {
      const t = v / 100;
      const eased = easing.easeInOut(t);
      const volAVal = Math.max(0.001, 1 - eased);
      const volBVal = Math.max(0.001, eased);
      if (gainA) gainA.gain.value = volAVal;
      if (gainB) gainB.gain.value = volBVal;
    };

    // Listen for fader state changes via a simple proxy
    const updateGains = () => {
      const t = ctx.state.fader / 100;
      const eased = easing.easeInOut(t);
      const volAVal = Math.max(0.001, 1 - eased);
      const volBVal = Math.max(0.001, eased);
      if (gainA) gainA.gain.value = volAVal;
      if (gainB) gainB.gain.value = volBVal;
    };

    // Poll-based gain update (since state is managed by framework)
    const gainInterval = setInterval(updateGains, 50);

    meterRaf = requestAnimationFrame(meterLoop);

    function onKeydown(e) {
      if (e.key === "ArrowLeft") {
        const v = Math.max(0, ctx.state.fader - 5);
        ctx.send("setFader", v);
      }
      if (e.key === "ArrowRight") {
        const v = Math.min(100, ctx.state.fader + 5);
        ctx.send("setFader", v);
      }
      if (e.key === " ") {
        e.preventDefault();
        initAudio();
        ctx.send("togglePlay");
      }
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      cancelAnimationFrame(meterRaf);
      clearInterval(gainInterval);
      window.removeEventListener("keydown", onKeydown);
      if (audioA) {
        audioA.pause();
        audioA.src = "";
      }
      if (audioB) {
        audioB.pause();
        audioB.src = "";
      }
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  },
});

export { CrossfadeAudio };
export default CrossfadeAudio;
