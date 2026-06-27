/**
 * 13-wipe-transitions — All 4 wipe direction showcase.
 *
 * Two panels with wipe transitions (left, right, up, down). Each button
 * triggers the corresponding wipe direction using createTransition from
 * @uploop/compositor. Shows direction indicator during transition.
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

const transitions = {
  wipeLeft: createTransition("wipeLeft", {
    duration: 1.2,
    easing: "easeInOut",
  }),
  wipeRight: createTransition("wipeRight", {
    duration: 1.2,
    easing: "easeInOut",
  }),
  wipeUp: createTransition("wipeUp", { duration: 1.2, easing: "easeInOut" }),
  wipeDown: createTransition("wipeDown", {
    duration: 1.2,
    easing: "easeInOut",
  }),
};

const directionLabels = {
  wipeLeft: "← wipe left",
  wipeRight: "→ wipe right",
  wipeUp: "↑ wipe up",
  wipeDown: "↓ wipe down",
};

const WipeTransitions = component("WipeTransitions", {
  state: {
    progress: 0,
    playing: false,
    direction: "wipeRight",
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
      direction: "wipeRight",
    }),
    setDirection: (s, d) => {
      if (s.playing) return s;
      return { ...s, direction: d };
    },
    tick: (s, dt) => {
      if (!s.playing) return s;
      const next = s.progress + dt / 1.2;
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
    const transition = transitions[s.direction];
    const tf = transition ? transition.render(s.progress) : null;

    const outgoingX = tf ? tf.outgoing.x * 100 : 0;
    const outgoingY = tf ? tf.outgoing.y * 100 : 0;
    const incomingX = tf ? tf.incoming.x * 100 : 0;
    const incomingY = tf ? tf.incoming.y * 100 : 0;
    const outgoingOp = tf ? tf.outgoing.opacity : 1;
    const incomingOp = tf ? tf.incoming.opacity : 1;

    const panelAStyle = [
      "background:linear-gradient(135deg,#1a5c3a,#0d3721)",
      s.currentPanel === "a"
        ? `opacity:${outgoingOp};transform:translate(${outgoingX}%,${outgoingY}%)`
        : `opacity:${incomingOp};transform:translate(${incomingX}%,${incomingY}%)`,
    ].join(";");

    const panelBStyle = [
      "background:linear-gradient(135deg,#5c3a1a,#37210d)",
      s.currentPanel === "b"
        ? `opacity:${outgoingOp};transform:translate(${outgoingX}%,${outgoingY}%)`
        : `opacity:${incomingOp};transform:translate(${incomingX}%,${incomingY}%)`,
    ].join(";");

    const indicatorText = s.playing ? directionLabels[s.direction] : "⏺ idle";
    const indicatorColor = s.playing
      ? "rgba(79,255,136,0.8)"
      : "rgba(255,255,255,0.5)";

    const dirs = ["wipeLeft", "wipeRight", "wipeUp", "wipeDown"];
    const arrows = {
      wipeLeft: "←",
      wipeRight: "→",
      wipeUp: "↑",
      wipeDown: "↓",
    };

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
          style="position:absolute;top:12px;right:16px;font-size:14px;color:${indicatorColor};background:rgba(0,0,0,0.4);padding:4px 10px;border-radius:4px;pointer-events:none"
        >
          ${indicatorText}
        </div>
      </div>
      <div class="controls">
        ${dirs.map(
          (d) => html`
            <button
              class="${s.direction === d && !s.playing ? "active" : ""}"
              @click=${() => {
                send("setDirection", d);
                send("play", d);
              }}
            >
              <span class="arrow">${arrows[d]}</span> ${d.replace("wipe", "")}
            </button>
          `,
        )}
        <button @click=${() => send("reset")}>Reset</button>
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
      switch (e.key) {
        case "ArrowLeft":
          ctx.send("setDirection", "wipeLeft");
          ctx.send("play", "wipeLeft");
          break;
        case "ArrowRight":
          ctx.send("setDirection", "wipeRight");
          ctx.send("play", "wipeRight");
          break;
        case "ArrowUp":
          ctx.send("setDirection", "wipeUp");
          ctx.send("play", "wipeUp");
          break;
        case "ArrowDown":
          ctx.send("setDirection", "wipeDown");
          ctx.send("play", "wipeDown");
          break;
        case "r":
        case "R":
          ctx.send("reset");
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

export { WipeTransitions };
export default WipeTransitions;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
WipeTransitions.mount(el);
