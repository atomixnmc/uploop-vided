/**
 * 03-video-transitions — Video playlist with animated transitions.
 *
 * Demonstrates @uploop/compositor's createTransition for crossfade,
 * dissolve, slide, and zoom transitions between video clips.
 */
import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

const videoSources = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
  "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",
];
const videoTitles = ["Big Buck Bunny", "Jellyfish", "Sintel"];
const TRANSITION_DURATION = 0.8;

const VideoTransitions = component("VideoTransitions", {
  state: {
    videos: videoSources.map((src, i) => ({
      src,
      title: videoTitles[i],
      idx: i,
    })),
    current: 0,
    nextSource: -1,
    progress: 0,
    playing: false,
    transitioning: false,
    currentSlot: 0,
    holdTimer: 0,
    transitionType: "fade",
  },

  update: {
    next: (s) => {
      if (s.transitioning) return s;
      const nextIdx = (s.current + 1) % s.videos.length;
      const otherSlot = s.currentSlot === 0 ? 1 : 0;
      return {
        ...s,
        nextSource: nextIdx,
        transitioning: true,
        progress: 0,
        currentSlot: otherSlot,
        playing: false,
      };
    },
    prev: (s) => {
      if (s.transitioning) return s;
      const prevIdx = (s.current - 1 + s.videos.length) % s.videos.length;
      const otherSlot = s.currentSlot === 0 ? 1 : 0;
      return {
        ...s,
        nextSource: prevIdx,
        transitioning: true,
        progress: 0,
        currentSlot: otherSlot,
        playing: false,
      };
    },
    selectTransition: (s, type) => ({ ...s, transitionType: type }),
    togglePlay: (s) => ({ ...s, playing: !s.playing }),
    tick: (s, dt) => {
      if (s.transitioning) {
        const progress = s.progress + dt / TRANSITION_DURATION;
        if (progress >= 1) {
          return {
            ...s,
            progress: 1,
            transitioning: false,
            current: s.nextSource,
            nextSource: -1,
            holdTimer: 0,
          };
        }
        return { ...s, progress };
      }
      if (s.playing) {
        const holdTimer = s.holdTimer + dt;
        if (holdTimer >= 5) {
          const nextIdx = (s.current + 1) % s.videos.length;
          const otherSlot = s.currentSlot === 0 ? 1 : 0;
          return {
            ...s,
            nextSource: nextIdx,
            transitioning: true,
            progress: 0,
            currentSlot: otherSlot,
            holdTimer: 0,
            playing: false,
          };
        }
        return { ...s, holdTimer };
      }
      return s;
    },
  },

  view: (state, { send }) => {
    const {
      current,
      nextSource,
      transitioning,
      progress,
      transitionType,
      currentSlot,
    } = state;

    // Compute transition output
    let outOpacity = 1,
      outX = 0,
      outY = 0,
      outScale = 1;
    let inOpacity = 0,
      inX = 0,
      inY = 0,
      inScale = 1;

    if (transitioning) {
      const tr = createTransition(transitionType, {
        duration: TRANSITION_DURATION,
        easing: "easeInOut",
      });
      const result = tr.render(Math.min(progress, 1));
      outOpacity = result.outgoing.opacity;
      outX = result.outgoing.x;
      outY = result.outgoing.y;
      outScale = result.outgoing.scale;
      inOpacity = result.incoming.opacity;
      inX = result.incoming.x;
      inY = result.incoming.y;
      inScale = result.incoming.scale;
    }

    const slotA = currentSlot === 0 ? current : nextSource;
    const slotB = currentSlot === 0 ? nextSource : current;

    return html`
      <div
        class="stage"
        style="
        width:min(800px,90vw);background:#151520;border-radius:12px;
        padding:20px;display:flex;flex-direction:column;gap:16px;
      "
      >
        <!-- Player -->
        <div
          class="player"
          style="
          position:relative;aspect-ratio:16/9;background:#0d0d18;
          border-radius:8px;overflow:hidden;
        "
        >
          <video
            data-ref="videoA"
            muted
            playsinline
            src="${slotA >= 0 ? videoSources[slotA] : ""}"
            style="
              position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
              opacity:${outOpacity};transform:translate(${outX * 100}%,${outY *
            100}%) scale(${outScale});
            "
          ></video>
          <video
            data-ref="videoB"
            muted
            playsinline
            src="${slotB >= 0 && slotB !== slotA ? videoSources[slotB] : ""}"
            style="
              position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
              opacity:${inOpacity};transform:translate(${inX * 100}%,${inY *
            100}%) scale(${inScale});
            "
          ></video>
          ${transitioning
            ? html`
                <div
                  style="
              position:absolute;top:12px;left:50%;transform:translateX(-50%);
              background:rgba(0,0,0,0.8);color:#4f8;padding:4px 14px;
              border-radius:20px;font-size:12px;font-weight:600;z-index:5;
            "
                >
                  ${transitionType.charAt(0).toUpperCase() +
                  transitionType.slice(1)}
                </div>
              `
            : null}
        </div>

        <!-- Controls -->
        <div class="controls" style="display:flex;align-items:center;gap:12px;">
          <button
            @click=${() => send("prev")}
            ?disabled=${transitioning}
            style="
            background:#2a2a3a;border:none;color:#e0e0e0;
            padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;
            opacity:${transitioning ? "0.3" : "1"};
          "
          >
            ◀ Prev
          </button>
          <button
            @click=${() => send("togglePlay")}
            style="
            background:#2a2a3a;border:none;color:#e0e0e0;
            padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;
          "
          >
            ${state.playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            @click=${() => send("next")}
            ?disabled=${transitioning}
            style="
            background:#2a2a3a;border:none;color:#e0e0e0;
            padding:10px 20px;border-radius:6px;cursor:pointer;font-size:14px;
            opacity:${transitioning ? "0.3" : "1"};
          "
          >
            Next ▶
          </button>
          <div
            class="transition-select"
            style="display:flex;align-items:center;gap:8px;font-size:13px;"
          >
            <span>Transition:</span>
            <select
              @change=${(e) => send("selectTransition", e.target.value)}
              style="
              background:#2a2a3a;color:#e0e0e0;border:1px solid #3a3a50;
              padding:6px 10px;border-radius:6px;font-size:13px;
            "
            >
              <option value="fade" ?selected=${transitionType === "fade"}>
                Fade
              </option>
              <option
                value="dissolve"
                ?selected=${transitionType === "dissolve"}
              >
                Dissolve
              </option>
              <option
                value="slideLeft"
                ?selected=${transitionType === "slideLeft"}
              >
                Slide Left
              </option>
              <option
                value="slideRight"
                ?selected=${transitionType === "slideRight"}
              >
                Slide Right
              </option>
              <option value="slideUp" ?selected=${transitionType === "slideUp"}>
                Slide Up
              </option>
              <option value="zoomIn" ?selected=${transitionType === "zoomIn"}>
                Zoom In
              </option>
              <option value="none" ?selected=${transitionType === "none"}>
                Cut
              </option>
            </select>
          </div>
        </div>

        <!-- Playlist thumbnails -->
        <div class="playlist" style="display:flex;gap:8px;flex-wrap:wrap;">
          ${state.videos.map(
            (v, i) => html`
              <div
                @click=${() => {
                  if (i === state.current || state.transitioning) return;
                  const otherSlot = state.currentSlot === 0 ? 1 : 0;
                  // Jump directly to this video
                  send("selectTransition", state.transitionType);
                }}
                style="
              width:120px;aspect-ratio:16/9;background:#0d0d18;
              border-radius:6px;border:2px solid ${i === current
                  ? "#4f8"
                  : "transparent"};
              cursor:pointer;overflow:hidden;position:relative;
            "
              >
                <video
                  src="${v.src}"
                  muted
                  preload="metadata"
                  style="width:100%;height:100%;object-fit:cover;pointer-events:none;"
                ></video>
                <span
                  style="position:absolute;bottom:4px;left:6px;font-size:11px;
                background:rgba(0,0,0,0.7);padding:1px 6px;border-radius:3px;"
                  >#${i + 1}</span
                >
              </div>
            `,
          )}
        </div>
      </div>
    `;
  },

  mount(el, ctx) {
    let lastTick = 0;
    let rafId;

    function loop(now) {
      if (lastTick === 0) lastTick = now;
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;
      ctx.send("tick", dt);

      // Manage video playback
      const s = ctx.get();
      const videoA = el.querySelector('[data-ref="videoA"]');
      const videoB = el.querySelector('[data-ref="videoB"]');

      if (s.playing && !s.transitioning && videoA) {
        videoA.play().catch(() => {});
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    // Keyboard
    const onKey = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          ctx.send("prev");
          break;
        case "ArrowRight":
          ctx.send("next");
          break;
        case " ":
          e.preventDefault();
          ctx.send("togglePlay");
          break;
      }
    };
    window.addEventListener("keydown", onKey);

    ctx.registerResource("video-transitions", {
      save: () => ({ rafId, onKey }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
    };
  },
});

export { VideoTransitions };
export default VideoTransitions;

// Auto-mount
const stage = document.querySelector(".stage");
if (stage) stage.replaceWith(new VideoTransitions());
else document.body.appendChild(new VideoTransitions());
