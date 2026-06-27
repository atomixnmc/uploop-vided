/**
 * 01-slideshow — Emoji slideshow with easing transitions.
 *
 * Uses @uploop/html component pattern with state/update/view.
 * Demonstrates @uploop/timeline easing for smooth slide transitions.
 */
import { html, component } from "@uploop/html";
import { easing } from "@uploop/timeline";

const slideDefs = [
  { emoji: "🌊", bg: "#1a3a5c", label: "Ocean" },
  { emoji: "🔥", bg: "#3a1a5c", label: "Fire" },
  { emoji: "🌿", bg: "#1a5c3a", label: "Nature" },
  { emoji: "☀️", bg: "#5c3a1a", label: "Sun" },
  { emoji: "🌸", bg: "#3a1a3a", label: "Blossom" },
];

const TRANSITION_DURATION = 0.8;
const SLIDE_HOLD = 3;

const Slideshow = component("Slideshow", {
  state: {
    slides: slideDefs,
    current: 0,
    next: 1,
    progress: 0,
    paused: false,
    _timer: 0,
  },

  update: {
    next: (s) => {
      if (s.paused) return s;
      const nxt = (s.current + 1) % s.slides.length;
      return {
        ...s,
        current: nxt,
        next: (nxt + 1) % s.slides.length,
        progress: 0,
        _timer: 0,
      };
    },
    prev: (s) => {
      const prev = (s.current - 1 + s.slides.length) % s.slides.length;
      return {
        ...s,
        current: prev,
        next: (prev + 1) % s.slides.length,
        progress: 0,
        _timer: 0,
      };
    },
    select: (s, idx) => {
      if (idx === s.current || (s.paused && idx === s.current)) return s;
      return {
        ...s,
        current: idx,
        next: (idx + 1) % s.slides.length,
        progress: 0,
        _timer: 0,
      };
    },
    tick: (s, dt) => {
      if (s.paused) return s;
      const timer = s._timer + dt;
      const phaseTime = timer % (TRANSITION_DURATION + SLIDE_HOLD);
      const progress = Math.min(phaseTime / TRANSITION_DURATION, 1);
      // Advance at end of hold
      if (timer >= TRANSITION_DURATION + SLIDE_HOLD) {
        const nxt = (s.current + 1) % s.slides.length;
        return { ...s, current: s.next, next: nxt, progress: 0, _timer: 0 };
      }
      return { ...s, progress, _timer: timer };
    },
    togglePause: (s) => ({ ...s, paused: !s.paused }),
  },

  view: (state, { send }) => {
    const t = easing.easeInOutCubic(Math.min(state.progress, 1));
    return html`
      <div
        class="stage"
        style="
        width:min(800px,90vw);height:min(500px,60vh);
        background:#151520;border-radius:12px;overflow:hidden;
        position:relative;display:flex;align-items:center;justify-content:center;
      "
      >
        ${state.slides.map((s, i) => {
          const isCurrent = i === state.current;
          const isNext = i === state.next;
          const opacity = isCurrent ? 1 - t : isNext ? t : 0;
          const visible = isCurrent || isNext ? "auto" : "none";
          return html`
            <div
              style="
              position:absolute;inset:0;
              display:flex;align-items:center;justify-content:center;
              font-size:5rem;background:${s.bg};
              opacity:${opacity};pointer-events:${visible};
            "
            >
              ${s.emoji}
            </div>
          `;
        })}
      </div>
      <div
        class="controls"
        style="display:flex;align-items:center;gap:12px;margin-top:16px;"
      >
        <button
          @click=${() => send("prev")}
          style="
          background:#2a2a3a;border:none;color:#e0e0e0;
          padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
        "
        >
          ◀ Prev
        </button>
        <button
          @click=${() => send("togglePause")}
          style="
          background:#2a2a3a;border:none;color:#e0e0e0;
          padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
        "
        >
          ${state.paused ? "▶ Play" : "⏸ Pause"}
        </button>
        <button
          @click=${() => send("next")}
          style="
          background:#2a2a3a;border:none;color:#e0e0e0;
          padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
        "
        >
          Next ▶
        </button>
        <div class="dots" style="display:flex;gap:8px;margin-left:8px;">
          ${state.slides.map(
            (_, i) => html`
              <div
                @click=${() => send("select", i)}
                style="
              width:10px;height:10px;border-radius:50%;
              background:${i === state.current ? "#4f8" : "#333"};
              cursor:pointer;transition:background 0.3s;
            "
              ></div>
            `,
          )}
        </div>
      </div>
      <div style="margin-top:12px;font-size:13px;color:#666;">
        Using <code>@uploop/timeline</code> easing functions for smooth
        transitions
      </div>
    `;
  },

  mount(el, ctx) {
    let lastTime = 0;
    let rafId;

    function loop(now) {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ctx.send("tick", dt);
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
          ctx.send("togglePause");
          break;
      }
    };
    window.addEventListener("keydown", onKey);

    // Cleanup via resource registration
    ctx.registerResource("slideshow-timer", {
      save: () => ({ rafId, onKey }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
    };
  },
});

export { Slideshow };
export default Slideshow;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
Slideshow.mount(el);
