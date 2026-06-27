/**
 * 12-fade-transitions — Fade and dissolve transition showcase.
 *
 * Two colored panels. Buttons trigger fade or dissolve transitions
 * via createTransition from @uploop/compositor. Shows progress bar.
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

const fadeTransition = createTransition("fade", {
  duration: 1.5,
  easing: "easeInOut",
});
const dissolveTransition = createTransition("dissolve", {
  duration: 1.5,
  easing: "easeInOut",
});

const FadeTransitions = component("FadeTransitions", {
  state: {
    fromPanel: "a",
    toPanel: "b",
    progress: 0,
    playing: false,
    mode: "fade",
  },

  update: {
    play: (s) => {
      if (s.playing) return s;
      return { ...s, playing: true, progress: 0 };
    },
    reset: (s) => ({
      ...s,
      fromPanel: "a",
      toPanel: "b",
      progress: 0,
      playing: false,
      mode: "fade",
    }),
    setMode: (s, m) => {
      if (s.playing) return s;
      return { ...s, mode: m };
    },
    tick: (s, dt) => {
      if (!s.playing) return s;
      const next = s.progress + dt / 1.5;
      if (next >= 1) {
        return {
          ...s,
          progress: 1,
          playing: false,
          fromPanel: s.toPanel,
          toPanel: s.fromPanel,
        };
      }
      return { ...s, progress: next };
    },
  },

  view: (s, { send }) => {
    const isFade = s.mode === "fade";
    const tf = isFade
      ? fadeTransition.render(s.progress)
      : dissolveTransition.render(s.progress);

    const outgoing = s.fromPanel === "a" ? tf.outgoing : tf.incoming;
    const incoming = s.fromPanel === "a" ? tf.incoming : tf.outgoing;

    const panelAStyle = [
      `background:linear-gradient(135deg,#1a3a5c,#0d2137)`,
      `opacity:${s.fromPanel === "a" ? outgoing.opacity : incoming.opacity}`,
      `transform:scale(${s.fromPanel === "a" ? outgoing.scale : incoming.scale})`,
    ].join(";");

    const panelBStyle = [
      `background:linear-gradient(135deg,#3a1a5c,#210d37)`,
      `opacity:${s.fromPanel === "b" ? outgoing.opacity : incoming.opacity}`,
      `transform:scale(${s.fromPanel === "b" ? outgoing.scale : incoming.scale})`,
    ].join(";");

    return html`
      <a href=".." class="back">← Examples</a>
      <div class="stage">
        <div class="panel panel-a" style="${panelAStyle}">
          <span class="panel-label">Panel A</span>
        </div>
        <div class="panel panel-b" style="${panelBStyle}">
          <span class="panel-label">Panel B</span>
        </div>
        <div
          class="direction-indicator"
          style="position:absolute;top:12px;right:16px;font-size:14px;color:rgba(255,255,255,0.5);background:rgba(0,0,0,0.4);padding:4px 10px;border-radius:4px;pointer-events:none"
        >
          ${!s.playing
            ? "⏺ idle"
            : `▶ ${s.mode} ${Math.round(s.progress * 100)}%`}
        </div>
      </div>
      <div class="controls">
        <button
          class="${isFade ? "active" : ""}"
          @click=${() => send("setMode", "fade")}
        >
          Fade
        </button>
        <button
          class="${!isFade ? "active" : ""}"
          @click=${() => send("setMode", "dissolve")}
        >
          Dissolve
        </button>
        <button @click=${() => send(s.playing ? "reset" : "play")}>
          ${s.playing ? "⏹ Stop" : "▶ Play"}
        </button>
        <button @click=${() => send("reset")}>Reset</button>
      </div>
      <div
        class="progress-bar"
        style="width:min(600px,85vw);height:6px;background:#1a1a2e;border-radius:3px;margin-top:16px;overflow:hidden"
      >
        <div
          class="progress-fill"
          style="height:100%;background:#4f8;border-radius:3px;width:${s.progress *
          100}%"
        ></div>
      </div>
      <div class="info" style="margin-top:12px;font-size:13px;color:#666">
        Using <code>createTransition</code> from <code>@uploop/compositor</code>
      </div>
    `;
  },

  mount: (el, ctx) => {
    let rafId = null;
    let lastTime = 0;

    function loop(now) {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ctx.send("tick", dt);
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    function onKeydown(e) {
      if (e.key === "1") ctx.send("setMode", "fade");
      if (e.key === "2") ctx.send("setMode", "dissolve");
      if (e.key === " ") {
        e.preventDefault();
        ctx.send(ctx.state.playing ? "reset" : "play");
      }
      if (e.key === "r" || e.key === "R") ctx.send("reset");
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeydown);
    };
  },
});

export { FadeTransitions };
export default FadeTransitions;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
FadeTransitions.mount(el);
