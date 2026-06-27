/**
 * 07-blend-modes — Interactive blend mode visualizer.
 *
 * Demonstrates @uploop/compositor's blendModes & blendModeToCanvas for
 * real-time visual blending between two colored layers on canvas.
 */
import { html, component } from "@uploop/html";
import { blendModes, blendModeToCanvas } from "@uploop/compositor";

const W = 500;
const H = 400;

const BlendModesDemo = component("BlendModesDemo", {
  state: {
    mode: "normal",
    colors: {
      fg: "#4488ff",
      bg: "#ff6644",
    },
  },

  update: {
    setMode(s, m) {
      return { ...s, mode: m };
    },
    setFgColor(s, c) {
      return { ...s, colors: { ...s.colors, fg: c } };
    },
    setBgColor(s, c) {
      return { ...s, colors: { ...s.colors, bg: c } };
    },
  },

  view: (state, { send }) => html`
    <a href=".." class="back">← Examples</a>
    <h2 style="font-size:1rem;font-weight:500;margin-bottom:12px;color:#aaa;">
      Blend Modes
    </h2>
    <canvas
      data-ref="blend-canvas"
      width="${W}"
      height="${H}"
      style="
      border-radius:12px;background:#151520;margin-bottom:20px;
    "
    ></canvas>

    <!-- Mode selector -->
    <div
      class="controls"
      style="
      display:flex;flex-wrap:wrap;gap:8px;justify-content:center;
      max-width:640px;margin-bottom:16px;
    "
    >
      ${Object.keys(blendModes).map(
        (name) => html`
          <button
            @click=${() => send("setMode", name)}
            class="mode-btn ${state.mode === name ? "active" : ""}"
            style="
            padding:8px 16px;
            background:${state.mode === name ? "#2a3a2a" : "#1a1a2e"};
            color:${state.mode === name ? "#4f8" : "#ccc"};
            border:1px solid ${state.mode === name ? "#4f8" : "#333"};
            border-radius:6px;cursor:pointer;font-size:13px;
            font-family:inherit;transition:all 0.2s;
          "
          >
            ${name}
          </button>
        `,
      )}
    </div>

    <!-- Color pickers -->
    <div
      style="
      display:flex;gap:24px;align-items:center;justify-content:center;
      font-size:13px;color:#888;
    "
    >
      <label style="display:flex;align-items:center;gap:8px;">
        Foreground
        <input
          type="color"
          value="${state.colors.fg}"
          @input=${(e) => send("setFgColor", e.target.value)}
          style="
          width:32px;height:32px;border:none;border-radius:6px;
          cursor:pointer;background:none;
        "
        />
      </label>
      <label style="display:flex;align-items:center;gap:8px;">
        Background
        <input
          type="color"
          value="${state.colors.bg}"
          @input=${(e) => send("setBgColor", e.target.value)}
          style="
          width:32px;height:32px;border:none;border-radius:6px;
          cursor:pointer;background:none;
        "
        />
      </label>
    </div>

    <div class="info" style="margin-top:16px;font-size:13px;color:#666;">
      Using <code>blendModes</code> from <code>@uploop/compositor</code>
    </div>
  `,

  mount(el, ctx) {
    const canvas = el.querySelector('[data-ref="blend-canvas"]');
    const ctx2d = canvas.getContext("2d");

    function render() {
      const s = ctx.get();
      const { mode, colors } = s;

      ctx2d.clearRect(0, 0, W, H);

      // Draw background circle
      ctx2d.globalCompositeOperation = "source-over";
      ctx2d.globalAlpha = 1;
      const bgGrad = ctx2d.createRadialGradient(200, 180, 30, 200, 180, 160);
      bgGrad.addColorStop(0, colors.bg);
      bgGrad.addColorStop(1, "transparent");
      ctx2d.fillStyle = bgGrad;
      ctx2d.beginPath();
      ctx2d.arc(200, 180, 160, 0, Math.PI * 2);
      ctx2d.fill();

      // Draw foreground circle with blend mode
      const canvasMode = blendModeToCanvas[mode] || "source-over";
      ctx2d.globalCompositeOperation = canvasMode;
      ctx2d.globalAlpha = 1;
      const fgGrad = ctx2d.createRadialGradient(300, 240, 30, 300, 240, 140);
      fgGrad.addColorStop(0, colors.fg);
      fgGrad.addColorStop(1, "transparent");
      ctx2d.fillStyle = fgGrad;
      ctx2d.beginPath();
      ctx2d.arc(300, 240, 140, 0, Math.PI * 2);
      ctx2d.fill();

      // Reset
      ctx2d.globalCompositeOperation = "source-over";

      // Labels
      ctx2d.globalAlpha = 0.8;
      ctx2d.fillStyle = "#fff";
      ctx2d.font = "12px system-ui, sans-serif";
      ctx2d.textAlign = "center";
      ctx2d.fillText(colors.bg, 200, 360);
      ctx2d.fillText(colors.fg, 300, 360);

      // Mode label
      ctx2d.globalAlpha = 0.5;
      ctx2d.fillStyle = "#aaa";
      ctx2d.font = "11px monospace";
      ctx2d.fillText(`mode: ${mode}`, W / 2, 385);
    }

    let rafId;
    function loop() {
      render();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    ctx.registerResource("blend-modes-demo", {
      save: () => ({ rafId }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  },
});

export { BlendModesDemo };
export default BlendModesDemo;

// Auto-mount
const el = document.querySelector("canvas") || document.body;
el.innerHTML = "";
BlendModesDemo.mount(el);
