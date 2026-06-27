/**
 * 04-audio-mixer — Multi-track audio mixer with volume & mute controls.
 *
 * Demonstrates @uploop/timeline's Timeline, Track, and Clip for managing
 * multiple audio layers. Each track has independent volume, mute, and
 * solo controls.
 */
import { html, component } from "@uploop/html";
import { Timeline, Track, Clip } from "@uploop/timeline";

const trackDefs = [
  {
    id: "synth",
    label: "Synth",
    src: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    color: "#c53a8b",
  },
  {
    id: "drum",
    label: "Drum",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    color: "#c58b3a",
  },
  {
    id: "bass",
    label: "Bass",
    src: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3",
    color: "#3a8bc5",
  },
  {
    id: "piano",
    label: "Piano",
    src: "https://samplelib.com/lib/preview/mp3/sample-12s.mp3",
    color: "#8bc53a",
  },
  {
    id: "ambient",
    label: "Ambient",
    src: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3",
    color: "#8b3ac5",
  },
];

const timeline = new Timeline({ name: "Audio Mixer", fps: 30 });
trackDefs.forEach((def, i) => {
  const track = new Track({ id: def.id, type: "audio" });
  track.addClip(
    new Clip({
      id: `${def.id}-clip`,
      source: def.src,
      inPoint: i * 0.2,
      outPoint: i * 0.2 + 15,
      props: { label: def.label, color: def.color },
    }),
  );
  timeline.addTrack(track);
});

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, "0");
  return `${String(m).padStart(2, "0")}:${sec}`;
}

const AudioMixer = component("AudioMixer", {
  state: {
    tracks: trackDefs.map((d) => ({
      id: d.id,
      label: d.label,
      color: d.color,
      src: d.src,
      volume: 0.75,
      muted: false,
      solo: false,
      vuLevel: 0,
    })),
    playing: false,
    elapsed: 0,
  },

  update: {
    setVolume: (s, trackId, v) => ({
      ...s,
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, volume: parseFloat(v) } : t,
      ),
    }),
    toggleMute: (s, trackId) => ({
      ...s,
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t,
      ),
    }),
    toggleSolo: (s, trackId) => ({
      ...s,
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              solo: !t.solo,
              muted: t.id !== trackId && !t.solo ? false : t.muted,
            }
          : t,
      ),
    }),
    togglePlayAll: (s) => ({ ...s, playing: !s.playing }),
    tick: (s, dt) => {
      if (!s.playing) return s;
      const elapsed = s.elapsed + dt;
      return {
        ...s,
        elapsed,
        tracks: s.tracks.map((t, i) => ({
          ...t,
          vuLevel: 0.3 + Math.sin(elapsed * 3 + i) * 0.3 + Math.random() * 0.2,
        })),
      };
    },
  },

  view: (state, { send }) => html`
    <div
      class="stage"
      style="
      width:min(700px,90vw);background:#151520;border-radius:12px;
      padding:20px;display:flex;flex-direction:column;gap:16px;
    "
    >
      <!-- Master controls -->
      <div
        class="master"
        style="
        display:flex;align-items:center;justify-content:center;gap:16px;
        padding:12px;background:#0d0d18;border-radius:8px;
      "
      >
        <button
          @click=${() => send("togglePlayAll")}
          style="
          background:${state.playing ? "#4f8" : "#2a2a3a"};
          color:${state.playing ? "#0a0a0f" : "#e0e0e0"};
          border:none;padding:10px 24px;border-radius:6px;
          cursor:pointer;font-size:16px;
        "
        >
          ${state.playing ? "⏸ Pause All" : "▶ Play All"}
        </button>
        <span
          class="timecode"
          style="font-family:monospace;font-size:14px;color:#888;"
        >
          ${fmtTime(state.elapsed)}
        </span>
      </div>

      <!-- Track rows -->
      <div class="tracks" style="display:flex;flex-direction:column;gap:6px;">
        ${state.tracks.map(
          (t) => html`
            <div
              class="track-row"
              style="
            display:flex;align-items:center;gap:10px;
            padding:10px 12px;background:#0d0d18;border-radius:8px;
            border-left:3px solid ${t.color};
          "
            >
              <span
                class="label"
                style="width:80px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
              >
                ${t.label}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value="${t.volume}"
                @input=${(e) => send("setVolume", t.id, e.target.value)}
                style="flex:1;accent-color:#4f8;height:6px;"
              />
              <span
                class="vol-val"
                style="width:36px;font-size:12px;color:#888;text-align:right;"
              >
                ${Math.round(t.volume * 100)}
              </span>
              <button
                @click=${() => send("toggleMute", t.id)}
                title="Mute"
                style="
              background:${t.muted ? "#5c1a1a" : "none"};
              border:1px solid ${t.muted ? "#8b3a3a" : "#3a3a50"};
              color:#e0e0e0;width:36px;height:30px;border-radius:4px;
              cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;
            "
              >
                M
              </button>
              <button
                @click=${() => send("toggleSolo", t.id)}
                title="Solo"
                style="
              background:${t.solo ? "#5c8a3a" : "none"};
              border:1px solid ${t.solo ? "#5c8a3a" : "#3a5c3a"};
              color:#e0e0e0;width:34px;height:30px;border-radius:4px;
              cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;
            "
              >
                S
              </button>
              <div
                class="vu"
                style="width:40px;height:4px;background:#1a1a2a;border-radius:2px;overflow:hidden;"
              >
                <div
                  style="height:100%;background:#4f8;width:${Math.min(
                    t.vuLevel * 100,
                    100,
                  )}%;transition:width 0.05s;"
                ></div>
              </div>
            </div>
          `,
        )}
      </div>
    </div>
  `,

  mount(el, ctx) {
    /** @type {AudioContext} */
    let audioCtx = null;
    const audioBuffers = new Map();
    const trackAudio = trackDefs.map((d) => ({
      id: d.id,
      buffer: null,
      sourceNode: null,
      gainNode: null,
      startedAt: 0,
      offset: 0,
      active: false,
    }));

    async function fetchAudio(url, id) {
      try {
        const res = await fetch(url);
        const arrayBuf = await res.arrayBuffer();
        const buffer = await audioCtx.decodeAudioData(arrayBuf);
        audioBuffers.set(id, buffer);
        const ta = trackAudio.find((t) => t.id === id);
        if (ta) ta.buffer = buffer;
      } catch (err) {
        console.warn(`Failed to load ${id}:`, err.message);
      }
    }

    function initAudio() {
      if (audioCtx) return;
      audioCtx = new AudioContext();
      trackDefs.forEach((d) => fetchAudio(d.src, d.id));
    }

    function createSource(ta, when = 0, offset = 0) {
      if (!ta.buffer || !audioCtx) return null;
      const source = audioCtx.createBufferSource();
      source.buffer = ta.buffer;
      source.loop = true;
      const gain = audioCtx.createGain();

      const s = ctx.get();
      const trackState = s.tracks.find((t) => t.id === ta.id);
      if (trackState) {
        if (trackState.muted) {
          gain.gain.value = 0;
        } else {
          const anySolo = s.tracks.some((t) => t.solo);
          if (anySolo && !trackState.solo) gain.gain.value = 0;
          else gain.gain.value = trackState.volume;
        }
      }

      source.connect(gain);
      gain.connect(audioCtx.destination);
      source.start(when, offset);
      return { source, gain };
    }

    function updateGains() {
      const s = ctx.get();
      trackAudio.forEach((ta) => {
        if (!ta.gainNode) return;
        const ts = s.tracks.find((t) => t.id === ta.id);
        if (!ts) return;
        if (ts.muted) {
          ta.gainNode.gain.value = 0;
          return;
        }
        const anySolo = s.tracks.some((t) => t.solo);
        if (anySolo && !ts.solo) {
          ta.gainNode.gain.value = 0;
          return;
        }
        ta.gainNode.gain.value = ts.volume;
      });
    }

    function playAll() {
      if (!audioCtx) initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      trackAudio.forEach((ta) => {
        if (ta.active) return;
        const nodes = createSource(ta, now, ta.offset);
        if (nodes) {
          ta.sourceNode = nodes.source;
          ta.gainNode = nodes.gain;
          ta.startedAt = now;
          ta.active = true;
        }
      });
    }

    function stopAll() {
      trackAudio.forEach((ta) => {
        try {
          ta.sourceNode?.stop();
        } catch (_) {}
        ta.sourceNode = null;
        ta.gainNode = null;
        ta.active = false;
        ta.offset = 0;
      });
    }

    // Track play/pause based on state
    let wasPlaying = false;
    let lastTick = 0;
    let rafId;

    function loop(now) {
      if (lastTick === 0) lastTick = now;
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      ctx.send("tick", dt);

      const s = ctx.get();
      if (s.playing !== wasPlaying) {
        wasPlaying = s.playing;
        if (s.playing) {
          initAudio();
          playAll();
        } else {
          stopAll();
        }
      }

      if (s.playing) {
        updateGains();
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    ctx.registerResource("audio-mixer", {
      save: () => ({ rafId, trackAudio, audioCtx }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      stopAll();
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  },
});

export { AudioMixer };
export default AudioMixer;

// Auto-mount
const stage = document.querySelector(".stage");
if (stage) stage.replaceWith(new AudioMixer());
else document.body.appendChild(new AudioMixer());
