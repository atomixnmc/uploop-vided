/**
 * 18-color-effects — Color effect presets demo.
 *
 * Applies CSS filter presets (sepia, grayscale, invert, vintage, cool, warm)
 * to a canvas-rendered scene. Includes preset buttons and an intensity slider.
 * Imports Effect from @uploop/compositor to register effect definitions.
 */

import { html, component } from "@uploop/html";
import { Effect } from "@uploop/compositor";

const effectDefs = {
  none: new Effect({ id: "none", type: "colorGrade", params: { filter: "" } }),
  sepia: new Effect({
    id: "sepia",
    type: "colorGrade",
    params: { filter: "sepia(1)" },
  }),
  grayscale: new Effect({
    id: "grayscale",
    type: "colorGrade",
    params: { filter: "grayscale(1)" },
  }),
  invert: new Effect({
    id: "invert",
    type: "colorGrade",
    params: { filter: "invert(1)" },
  }),
  vintage: new Effect({
    id: "vintage",
    type: "colorGrade",
    params: { filter: "sepia(0.6) contrast(1.1) brightness(0.9)" },
  }),
  cool: new Effect({
    id: "cool",
    type: "colorGrade",
    params: { filter: "hue-rotate(180deg) saturate(1.3)" },
  }),
  warm: new Effect({
    id: "warm",
    type: "colorGrade",
    params: { filter: "hue-rotate(-30deg) saturate(1.4) brightness(1.05)" },
  }),
};

const presetList = [
  "none",
  "sepia",
  "grayscale",
  "invert",
  "vintage",
  "cool",
  "warm",
];
const presetLabels = {
  none: "✨ None",
  sepia: "🟤 Sepia",
  grayscale: "⬜ Grayscale",
  invert: "🔄 Invert",
  vintage: "📷 Vintage",
  cool: "❄️ Cool",
  warm: "🔥 Warm",
};

function buildFilterString(filter, t) {
  if (!filter) return "";
  return filter.replace(/([\d.]+)/g, (match) => {
    const val = parseFloat(match);
    if (match.includes("deg")) return `${val * t}deg`;
    return (1 - t + val * t).toFixed(2);
  });
}

const ColorEffects = component("ColorEffects", {
  state: {
    preset: "none",
    intensity: 80,
  },

  update: {
    setPreset: (s, p) => ({ ...s, preset: p }),
    setIntensity: (s, v) => ({ ...s, intensity: v }),
  },

  view: (s, { send }) => {
    const def = effectDefs[s.preset];
    const filter = def.params.filter || "";
    const intensity = s.intensity / 100;
    const cssFilter = filter ? buildFilterString(filter, intensity) : "";

    return html`
      <a href=".." class="back">← Examples</a>
      <div class="stage">
        <canvas
          id="canvas"
          style="width:100%;height:100%;object-fit:contain;filter:${cssFilter}"
        ></canvas>
      </div>
      <div
        class="presets"
        style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:500px"
      >
        ${presetList.map(
          (p) => html`
            <button
              class="${s.preset === p ? "active" : ""}"
              style="background:#151520;color:#e0e0e0;border:1px solid #333;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px${s.preset ===
              p
                ? ";background:#2a3a2a;border-color:#4f8;color:#4f8"
                : ""}"
              @click=${() => send("setPreset", p)}
            >
              ${presetLabels[p]}
            </button>
          `,
        )}
      </div>
      <div
        class="slider-row"
        style="display:flex;align-items:center;gap:12px;width:min(500px,90vw)"
      >
        <label
          for="intensity"
          style="font-size:13px;color:#888;white-space:nowrap"
          >Intensity</label
        >
        <input
          type="range"
          id="intensity"
          min="0"
          max="100"
          value="${s.intensity}"
          style="flex:1;accent-color:#4f8"
          @input=${(e) => send("setIntensity", Number(e.target.value))}
        />
        <span style="font-size:13px;color:#4f8;width:32px;text-align:right"
          >${s.intensity}%</span
        >
      </div>
      <div class="info" style="font-size:13px;color:#666">
        Using <code>Effect</code> from <code>@uploop/compositor</code> with CSS
        filter pipeline
      </div>
    `;
  },

  mount: (el, ctx) => {
    const canvas = el.querySelector("#canvas");
    const ctx2d = canvas.getContext("2d");

    function drawScene() {
      const w = canvas.width;
      const h = canvas.height;

      ctx2d.clearRect(0, 0, w, h);

      // Background gradient
      const grad = ctx2d.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#2a1a4a");
      grad.addColorStop(0.5, "#1a3a3a");
      grad.addColorStop(1, "#4a2a1a");
      ctx2d.fillStyle = grad;
      ctx2d.fillRect(0, 0, w, h);

      // Sun
      ctx2d.fillStyle = "#f8c040";
      ctx2d.beginPath();
      ctx2d.arc(w * 0.75, h * 0.25, 60, 0, Math.PI * 2);
      ctx2d.fill();

      // Mountains
      ctx2d.fillStyle = "#1a2a4a";
      ctx2d.beginPath();
      ctx2d.moveTo(0, h);
      ctx2d.lineTo(w * 0.25, h * 0.5);
      ctx2d.lineTo(w * 0.5, h * 0.7);
      ctx2d.lineTo(w * 0.75, h * 0.4);
      ctx2d.lineTo(w, h * 0.6);
      ctx2d.lineTo(w, h);
      ctx2d.closePath();
      ctx2d.fill();

      // Foreground hill
      ctx2d.fillStyle = "#2a4a2a";
      ctx2d.beginPath();
      ctx2d.moveTo(0, h);
      ctx2d.quadraticCurveTo(w * 0.4, h * 0.6, w * 0.7, h * 0.7);
      ctx2d.lineTo(w, h * 0.75);
      ctx2d.lineTo(w, h);
      ctx2d.closePath();
      ctx2d.fill();

      // Trees
      ctx2d.fillStyle = "#1a3a1a";
      for (let i = 0; i < 5; i++) {
        const tx = w * 0.1 + i * (w * 0.2);
        ctx2d.beginPath();
        ctx2d.moveTo(tx, h * 0.72);
        ctx2d.lineTo(tx + 20, h * 0.55);
        ctx2d.lineTo(tx + 40, h * 0.72);
        ctx2d.closePath();
        ctx2d.fill();
      }

      // Text label
      ctx2d.fillStyle = "rgba(255,255,255,0.3)";
      ctx2d.font = "16px system-ui";
      ctx2d.textAlign = "center";
      ctx2d.fillText("uploop-vided", w / 2, h - 20);
    }

    function resizeCanvas() {
      const stage = canvas.parentElement;
      canvas.width = stage.clientWidth;
      canvas.height = stage.clientHeight;
      drawScene();
    }

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas.parentElement);

    // Keyboard quick-switch
    const keyMap = {
      0: "none",
      1: "sepia",
      2: "grayscale",
      3: "invert",
      4: "vintage",
      5: "cool",
      6: "warm",
    };
    function onKeydown(e) {
      const effect = keyMap[e.key];
      if (effect) ctx.send("setPreset", effect);
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      ro.disconnect();
      window.removeEventListener("keydown", onKeydown);
    };
  },
});

export { ColorEffects };
export default ColorEffects;
