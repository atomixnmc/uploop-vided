/**
 * 17-playlist-player — Video playlist with fade transitions.
 *
 * Queue of test-videos.co.uk clips. Play one after another with fade
 * transitions between them. Shows playlist queue, current track info,
 * progress bar. Auto-advance on ended.
 *
 * @uses @uploop/html (html, component)
 * @uses @uploop/compositor (createTransition)
 * @uses @uploop/timeline (Clip, Track)
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";
import { Clip, Track } from "@uploop/timeline";

// ── Playlist data ─────────────────────────────────────────────────

const playlistSources = [
  {
    title: "Big Buck Bunny",
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  },
  {
    title: "Jellyfish",
    src: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
  },
  {
    title: "Sintel Trailer",
    src: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
  },
];

const FADE_DURATION = 0.5;

// ── Build timeline clips ──────────────────────────────────────────

const clips = playlistSources.map(
  (item, i) =>
    new Clip({
      id: `clip-${i}`,
      source: item.src,
      inPoint: i * 8,
      outPoint: i * 8 + 8,
      props: { opacity: 1 },
    }),
);

const track = new Track({ id: "video-track", type: "video", clips });

const transition = createTransition("fade", {
  duration: FADE_DURATION,
  easing: "easeInOut",
});

// ── Component ─────────────────────────────────────────────────────

const PlaylistPlayer = component("PlaylistPlayer", {
  state: {
    playlist: playlistSources,
    current: 0,
    playing: false,
    currentTime: 0,
    duration: 0,
    transitionProgress: 0,
    transitioning: false,
    transitionTarget: -1,
  },

  update: {
    play: (s) => ({ ...s, playing: true }),
    pause: (s) => ({ ...s, playing: false }),
    next: (s) => {
      if (s.transitioning) return s;
      const nextIdx = s.current + 1;
      if (nextIdx >= s.playlist.length) return { ...s, playing: false };
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        transitionTarget: nextIdx,
      };
    },
    prev: (s) => {
      if (s.transitioning) return s;
      const prevIdx = s.current - 1;
      if (prevIdx < 0) return s;
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        transitionTarget: prevIdx,
      };
    },
    select: (s, idx) => {
      if (s.transitioning || idx === s.current) return s;
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        transitionTarget: idx,
      };
    },
    timeUpdate: (s, t) => ({ ...s, currentTime: t }),
    metadataLoaded: (s, d) => ({ ...s, duration: d }),
    tickTransition: (s, dt = 0.016) => {
      if (!s.transitioning) return s;
      const nextProgress = s.transitionProgress + dt / FADE_DURATION;
      if (nextProgress >= 1) {
        return {
          ...s,
          current: s.transitionTarget,
          transitionProgress: 0,
          transitioning: false,
          transitionTarget: -1,
        };
      }
      return { ...s, transitionProgress: nextProgress };
    },
    endReached: (s) => {
      if (s.current >= s.playlist.length - 1) return { ...s, playing: false };
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        transitionTarget: s.current + 1,
      };
    },
  },

  view: (state, { send }) => {
    const currentTrack = state.playlist[state.current];
    const currentTitle = currentTrack ? currentTrack.title : "";
    const tf = transition.render(state.transitionProgress);
    const videoOpacity = state.transitioning ? tf.outgoing.opacity : 1;
    const progressPct =
      state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

    return html`
      <a href=".." class="back">← Examples</a>

      <div class="player">
        <div class="video-card">
          <video
            id="video-el"
            muted
            playsinline
            style="width:100%;display:block;background:#000;opacity:${videoOpacity};"
          ></video>
          <div class="progress-bar">
            <div
              class="progress-fill"
              id="progress-fill"
              style="width:${progressPct}%;"
            ></div>
          </div>
          <div class="now-playing" id="now-playing">
            ${state.transitioning && state.transitionTarget >= 0
              ? html`<strong
                    >${state.playlist[state.transitionTarget]?.title ||
                    ""}</strong
                  >
                  — Loading...`
              : state.playing
                ? html`<strong>${currentTitle}</strong> — Clip
                    ${state.current + 1}/${state.playlist.length}`
                : currentTrack
                  ? html`<strong>${currentTitle}</strong> — Ready`
                  : "🎬 Playlist complete"}
          </div>
          <div class="controls-row">
            <button id="btn-prev" @click=${() => send("prev")}>⏮ Prev</button>
            <button
              id="btn-play"
              @click=${() => (state.playing ? send("pause") : send("play"))}
            >
              ${state.playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button id="btn-next" @click=${() => send("next")}>⏭ Next</button>
          </div>
        </div>

        <div class="playlist">
          <h3>📋 Playlist Queue</h3>
          <div id="queue">
            ${state.playlist.map((item, i) => {
              let cls = "";
              if (i < state.current) cls = "played";
              else if (i === state.current) cls = "active";
              return html`<div
                class="queue-item ${cls}"
                @click=${() => send("select", i)}
              >
                <span class="queue-num">${i + 1}</span> ${item.title}
              </div>`;
            })}
          </div>
        </div>
      </div>

      <div class="info">
        Using <code>createTransition</code> (@uploop/compositor) +
        <code>Clip</code>/<code>Track</code> (@uploop/timeline)
      </div>
    `;
  },

  mount: (el, ctx) => {
    let rafId = null;
    let lastTime = 0;
    let prevPlaying = false;
    let prevCurrent = 0;
    let prevTransitioning = false;

    const videoEl = el.querySelector("video");
    if (!videoEl) {
      console.warn("PlaylistPlayer: no video element found");
      return () => {};
    }

    // Attach video event listeners
    const onTimeUpdate = () => ctx.send("timeUpdate", videoEl.currentTime);
    const onMetadata = () => ctx.send("metadataLoaded", videoEl.duration);
    const onEnded = () => ctx.send("endReached");

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("loadedmetadata", onMetadata);
    videoEl.addEventListener("ended", onEnded);

    // Load initial clip
    const initState = ctx.getState();
    if (initState.playlist[initState.current]) {
      videoEl.src = initState.playlist[initState.current].src;
    }

    // Render loop for transition animation
    const loop = (now) => {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = ctx.getState();
      if (s.transitioning) ctx.send("tickTransition", dt);

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Watch state to sync video playback
    const unwatch = ctx.watch((s) => {
      // Handle clip changes (transition completed)
      if (s.current !== prevCurrent && !s.transitioning) {
        videoEl.src = s.playlist[s.current].src;
        videoEl.load();
        if (s.playing) videoEl.play().catch(() => {});
      }

      // Handle transition start — swap source at fade midpoint
      if (s.transitioning && !prevTransitioning && s.transitionTarget >= 0) {
        const newSrc = s.playlist[s.transitionTarget].src;
        setTimeout(
          () => {
            const v = el.querySelector("video");
            if (v) {
              v.src = newSrc;
              v.load();
              if (ctx.getState().playing) v.play().catch(() => {});
            }
          },
          (FADE_DURATION * 1000) / 2,
        );
      }

      // Handle play/pause
      if (s.playing !== prevPlaying) {
        if (s.playing) {
          if (!videoEl.src || videoEl.src !== s.playlist[s.current].src) {
            videoEl.src = s.playlist[s.current].src;
          }
          videoEl.play().catch(() => {});
        } else {
          videoEl.pause();
        }
      }

      prevPlaying = s.playing;
      prevCurrent = s.current;
      prevTransitioning = s.transitioning;
    });

    // Keyboard
    const handleKey = (e) => {
      const s = ctx.getState();
      switch (e.key) {
        case " ":
          e.preventDefault();
          ctx.send(s.playing ? "pause" : "play");
          break;
        case "ArrowLeft":
          ctx.send("prev");
          break;
        case "ArrowRight":
          ctx.send("next");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("loadedmetadata", onMetadata);
      videoEl.removeEventListener("ended", onEnded);
      window.removeEventListener("keydown", handleKey);
      if (unwatch) unwatch();
    };
  },
});

export { PlaylistPlayer };
export default PlaylistPlayer;

// ── Mount ─────────────────────────────────────────────────────────

while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}
document.body.appendChild(new PlaylistPlayer());

console.log(
  "%c📋 Playlist Player%c | %d clips | fade transition",
  "color:#4f8",
  "",
  playlistSources.length,
);
console.log("  Controls: ▶ ⏭ ⏮ | Space = play/pause | ← → = prev/next");
