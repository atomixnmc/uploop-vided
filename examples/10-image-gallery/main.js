/**
 * 10-image-gallery — Image slideshow with fade transitions.
 *
 * 8 placeholder images from picsum.photos. Uses createTransition from
 * @uploop/compositor for smooth fade transitions between slides.
 * Controls: prev/next, dot indicators, auto-play toggle.
 *
 * @uses @uploop/html (html, component)
 * @uses @uploop/compositor (createTransition)
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

// ── Constants ─────────────────────────────────────────────────────

const TOTAL = 8;
const TRANSITION_DURATION = 0.6;
const AUTO_INTERVAL = 3;

const images = Array.from(
  { length: TOTAL },
  (_, i) => `https://picsum.photos/800/500?random=${i + 1}`,
);

const transition = createTransition("fade", {
  duration: TRANSITION_DURATION,
  easing: "easeInOut",
});

// ── Component ─────────────────────────────────────────────────────

const ImageGallery = component("ImageGallery", {
  state: {
    images,
    current: 0,
    auto: false,
    transitionProgress: 0,
    transitioning: false,
    next: 1,
  },

  update: {
    next: (s) => {
      if (s.transitioning) return s;
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        next: (s.current + 1) % TOTAL,
      };
    },
    prev: (s) => {
      if (s.transitioning) return s;
      return {
        ...s,
        transitioning: true,
        transitionProgress: 0,
        next: (s.current - 1 + TOTAL) % TOTAL,
      };
    },
    select: (s, idx) => {
      if (s.transitioning || idx === s.current) return s;
      return { ...s, transitioning: true, transitionProgress: 0, next: idx };
    },
    toggleAuto: (s) => ({ ...s, auto: !s.auto }),
    tick: (s, dt = 0.016) => {
      if (!s.transitioning) return s;
      const nextProgress = s.transitionProgress + dt / TRANSITION_DURATION;
      if (nextProgress >= 1) {
        return {
          ...s,
          current: s.next,
          transitionProgress: 0,
          transitioning: false,
        };
      }
      return { ...s, transitionProgress: nextProgress };
    },
  },

  view: (state, { send }) => {
    const tf = transition.render(state.transitionProgress);

    return html`
      <a href=".." class="back">← Examples</a>

      <div class="stage" id="stage">
        ${state.images.map((src, i) => {
          const isCurrent = i === state.current;
          const isNext = i === (state.next !== undefined ? state.next : -1);
          let opacity = "0";
          if (isCurrent) opacity = String(tf.outgoing.opacity);
          else if (isNext) opacity = String(tf.incoming.opacity);

          return html`<div
            class="slide"
            style="opacity:${opacity}; background-image:url(${src}); background-size:cover; background-position:center;"
          ></div>`;
        })}
      </div>

      <div class="nav">
        <button id="prev-btn" @click=${() => send("prev")}>← Prev</button>
        <span class="counter" id="counter"
          >${state.current + 1} / ${TOTAL}</span
        >
        <button id="next-btn" @click=${() => send("next")}>Next →</button>
        <button
          id="autoplay-btn"
          class=${state.auto ? "active" : ""}
          @click=${() => send("toggleAuto")}
        >
          ${state.auto ? "⏸ Stop" : "▶ Auto"}
        </button>
      </div>

      <div class="dots" id="dots">
        ${state.images.map(
          (_, i) =>
            html`<div
              class=${"dot" + (i === state.current ? " active" : "")}
              @click=${() => send("select", i)}
            ></div>`,
        )}
      </div>

      <div class="info">
        Using <code>createTransition</code> from <code>@uploop/compositor</code>
      </div>
    `;
  },

  effect: {
    autoPlay: (send, getState) => {
      const timer = setInterval(() => {
        const s = getState();
        if (s.auto && !s.transitioning) send("next");
      }, AUTO_INTERVAL * 1000);
      return () => clearInterval(timer);
    },

    transitionLoop: (send, getState) => {
      let rafId = null;
      let lastTime = 0;

      const loop = (now) => {
        if (lastTime === 0) lastTime = now;
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const s = getState();
        if (s.transitioning) send("tick", dt);

        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    },
  },

  mount: (el, ctx) => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") ctx.send("prev");
      if (e.key === "ArrowRight") ctx.send("next");
      if (e.key === " ") {
        e.preventDefault();
        ctx.send("toggleAuto");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  },
});

export { ImageGallery };
export default ImageGallery;

// ── Mount ─────────────────────────────────────────────────────────

while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}
ImageGallery.mount(document.body);

console.log(
  "%c🖼️ Gallery%c | %d slides | fade transition via @uploop/compositor",
  "color:#4f8",
  "",
  TOTAL,
);
