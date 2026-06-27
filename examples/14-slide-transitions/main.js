/**
 * 14-slide-transitions — Slide transition showcase.
 *
 * Demonstrates slideLeft, slideRight, slideUp, slideDown transitions
 * using createTransition from @uploop/compositor.
 * Two colored panels slide in/out based on selected direction.
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

const slideTransitions = {
  slideLeft: createTransition("slideLeft", {
    duration: 0.6,
    easing: "easeInOut",
  }),
  slideRight: createTransition("slideRight", {
    duration: 0.6,
    easing: "easeInOut",
  }),
  slideUp: createTransition("slideUp", { duration: 0.6, easing: "easeInOut" }),
  slideDown: createTransition("slideDown", {
    duration: 0.6,
    easing: "easeInOut",
  }),
};

const SlideTransitions = component("SlideTransitions", {
  state: {
    progress: 0,
    playing: false,
    direction: "slideLeft",
    currentPanel: "a",
  },

  update: {
    play: (s, dir) => {
      if (s.playing) return s;
      return { ...s, playing: true, progress: 0, direction: dir };
    },
    reset: (s) => ({
      ...s,
      progress: 0,
      playing: false,
      currentPanel: "a",
      direction: "slideLeft",
    }),
    setDirection: (s, d) => {
      if (s.playing) return s;
      return { ...s, direction: d };
    },
    tick: (s, dt) => {
      if (!s.playing) return s;
      const next = s.progress + dt / 0.6;
      if (next >= 1) {
        return {
          ...s,
          progress: 1,
          playing: false,
          currentPanel: s.currentPanel === "a" ? "b" : "a",
        };
      }
      return { ...s, progress: next };
    },
  },

  view: (s, { send }) => {
    const transition = slideTransitions[s.direction];
    const tf = transition ? transition.render(s.progress) : null;

    const outX = tf ? tf.outgoing.x * 100 : 0;
    const outY = tf ? tf.outgoing.y * 100 : 0;
    const inX = tf ? tf.incoming.x * 100 : 0;
    const inY = tf ? tf.incoming.y * 100 : 0;
    const outOp = tf ? tf.outgoing.opacity : 1;
    const inOp = tf ? tf.incoming.opacity : 1;

    const panelAStyle = [
      "background:linear-gradient(135deg,#1a3a5c,#2a5a8c)",
      s.currentPanel === "a"
        ? `opacity:${outOp};transform:translate(${outX}%,${outY}%)`
        : `opacity:${inOp};transform:translate(${inX}%,${inY}%)`,
      `z-index:${s.currentPanel === "a" ? "1" : "0"}`,
    ].join(";");

    const panelBStyle = [
      "background:linear-gradient(135deg,#5c1a3a,#8c2a5a)",
      s.currentPanel === "b"
        ? `opacity:${outOp};transform:translate(${outX}%,${outY}%)`
        : `opacity:${inOp};transform:translate(${inX}%,${inY}%)`,
      `z-index:${s.currentPanel === "b" ? "1" : "0"}`,
    ].join(";");

    const dirs = ["slideLeft", "slideRight", "slideUp", "slideDown"];
    const arrows = {
      slideLeft: "⬅",
      slideRight: "➡",
      slideUp: "⬆",
      slideDown: "⬇",
    };

    return html`
      <a href=".." class="back">← Examples</a>
      <div class="stage">
        <div class="panel panel-a" style="${panelAStyle}">🟦 Panel A</div>
        <div class="panel panel-b" style="${panelBStyle}">🟥 Panel B</div>
      </div>
      <div class="controls">
        ${dirs.map(
          (d) => html`
            <button
              class="${s.direction === d && !s.playing ? "active" : ""}"
              title="${d}"
              @click=${() => {
                send("setDirection", d);
                send("play", d);
              }}
            >
              ${arrows[d]}
            </button>
          `,
        )}
      </div>
      <div class="info" style="font-size:13px;color:#666">
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
      switch (e.key) {
        case "ArrowLeft":
          ctx.send("setDirection", "slideLeft");
          ctx.send("play", "slideLeft");
          break;
        case "ArrowRight":
          ctx.send("setDirection", "slideRight");
          ctx.send("play", "slideRight");
          break;
        case "ArrowUp":
          ctx.send("setDirection", "slideUp");
          ctx.send("play", "slideUp");
          break;
        case "ArrowDown":
          ctx.send("setDirection", "slideDown");
          ctx.send("play", "slideDown");
          break;
      }
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeydown);
    };
  },
});

export { SlideTransitions };
export default SlideTransitions;
