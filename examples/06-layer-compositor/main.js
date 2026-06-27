/**
 * 06-layer-compositor — Multi-layer compositing with toggles & opacity.
 *
 * Demonstrates @uploop/compositor's Compositor & Layer for stacking,
 * opacity control, visibility toggling, and layer reordering.
 */
import { html, component } from "@uploop/html";
import { Compositor, Layer } from "@uploop/compositor";

const W = 800;
const H = 450;

const layerDefs = [
  { id: "l1", name: "Background", color: "#1a3a5c", opacity: 1, visible: true },
  {
    id: "l2",
    name: "Mid Layer",
    color: "#3a5c1a",
    opacity: 0.8,
    visible: true,
  },
  {
    id: "l3",
    name: "Foreground",
    color: "#5c1a3a",
    opacity: 0.6,
    visible: true,
  },
  { id: "l4", name: "Overlay", color: "#8b5c3a", opacity: 0.4, visible: true },
];

const LayerCompositor = component("LayerCompositor", {
  state: {
    layers: layerDefs.map((d) => ({ ...d })),
    selectedLayer: null,
  },

  update: {
    toggleVisibility(s, id) {
      return {
        ...s,
        layers: s.layers.map((l) =>
          l.id === id ? { ...l, visible: !l.visible } : l,
        ),
      };
    },
    setOpacity(s, id, v) {
      return {
        ...s,
        layers: s.layers.map((l) =>
          l.id === id ? { ...l, opacity: parseFloat(v) } : l,
        ),
      };
    },
    reorder(s, from, to) {
      const layers = [...s.layers];
      const [moved] = layers.splice(from, 1);
      layers.splice(to, 0, moved);
      return { ...s, layers };
    },
    selectLayer(s, id) {
      return { ...s, selectedLayer: id === s.selectedLayer ? null : id };
    },
  },

  view: (state, { send }) => html`
    <a href=".." class="back">← Examples</a>
    <h1 style="font-size:1.5rem;margin-top:48px;margin-bottom:4px;">
      Layer Compositor
    </h1>
    <p class="subtitle" style="color:#666;font-size:13px;margin-bottom:24px;">
      Multi-layer compositing with toggles &amp; opacity
    </p>
    <div
      class="stage"
      style="
      width:min(800px,90vw);background:#151520;border-radius:12px;
      padding:20px;display:flex;flex-direction:column;gap:16px;
    "
    >
      <!-- Viewport -->
      <div
        class="viewport"
        style="
        aspect-ratio:16/9;background:#0d0d18;border-radius:8px;
        position:relative;overflow:hidden;
      "
      >
        <canvas
          data-ref="compositor-canvas"
          style="width:100%;height:100%;display:block;"
        ></canvas>
        <span
          class="label"
          style="
          position:absolute;top:8px;right:12px;font-size:11px;
          background:rgba(0,0,0,0.6);padding:2px 8px;border-radius:10px;color:#aaa;
        "
          >Composite Viewport</span
        >
      </div>

      <!-- Layer panel -->
      <div
        class="layer-panel"
        style="display:flex;flex-direction:column;gap:6px;"
      >
        <h3 style="font-size:13px;color:#888;margin-bottom:2px;">
          Layers (bottom → top)
        </h3>
        ${state.layers.map(
          (layer, i) => html`
            <div
              class="layer-control"
              @click=${() => send("selectLayer", layer.id)}
              style="
              display:flex;align-items:center;gap:10px;
              padding:8px 12px;background:#0d0d18;border-radius:8px;font-size:13px;
              border-left:3px solid ${layer.color};
              ${state.selectedLayer === layer.id
                ? "outline:1px solid #4f8;"
                : ""}
            "
            >
              <span class="lname" style="width:90px;font-weight:600;"
                >${layer.name}</span
              >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value="${layer.opacity}"
                @input=${(e) => {
                  e.stopPropagation();
                  send("setOpacity", layer.id, e.target.value);
                }}
                style="flex:1;accent-color:#4f8;"
              />
              <span
                class="op-val"
                style="width:36px;font-size:12px;color:#888;text-align:right;"
                >${Math.round(layer.opacity * 100)}</span
              >
              <button
                @click=${(e) => {
                  e.stopPropagation();
                  send("toggleVisibility", layer.id);
                }}
                class=${layer.visible ? "" : "hidden"}
                style="
                background:${layer.visible ? "none" : "#3a1a1a"};
                border:1px solid ${layer.visible ? "#3a3a50" : "#5c2a2a"};
                color:#e0e0e0;padding:4px 10px;border-radius:4px;
                cursor:pointer;font-size:12px;
              "
              >
                ${layer.visible ? "Hide" : "Show"}
              </button>
              ${i > 0
                ? html`<button
                    @click=${(e) => {
                      e.stopPropagation();
                      send("reorder", i, i - 1);
                    }}
                    class="order-btn"
                    title="Move up"
                    style="
                    width:28px;padding:4px 0;font-size:14px;
                    background:none;border:1px solid #3a3a50;
                    color:#e0e0e0;border-radius:4px;cursor:pointer;
                  "
                  >
                    ▲
                  </button>`
                : null}
              ${i < state.layers.length - 1
                ? html`<button
                    @click=${(e) => {
                      e.stopPropagation();
                      send("reorder", i, i + 1);
                    }}
                    class="order-btn"
                    title="Move down"
                    style="
                    width:28px;padding:4px 0;font-size:14px;
                    background:none;border:1px solid #3a3a50;
                    color:#e0e0e0;border-radius:4px;cursor:pointer;
                  "
                  >
                    ▼
                  </button>`
                : null}
            </div>
          `,
        )}
      </div>
    </div>
    <div class="info" style="margin-top:8px;font-size:13px;color:#666;">
      Using <code>@uploop/compositor</code> — Compositor · Layer for multi-layer
      compositing
    </div>
  `,

  mount(el, ctx) {
    const canvas = el.querySelector('[data-ref="compositor-canvas"]');
    const ctx2d = canvas.getContext("2d");

    function render() {
      const s = ctx.get();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx2d.clearRect(0, 0, W, H);
      ctx2d.fillStyle = "#0d0d18";
      ctx2d.fillRect(0, 0, W, H);

      // Draw layers bottom-to-top as colored rectangles
      for (const layer of s.layers) {
        if (!layer.visible || layer.opacity <= 0) continue;
        ctx2d.globalAlpha = layer.opacity;
        ctx2d.fillStyle = layer.color;
        const inset = (s.layers.indexOf(layer) + 1) * 24;
        ctx2d.fillRect(inset, inset, W - inset * 2, H - inset * 2);

        // Label
        ctx2d.globalAlpha = 0.7;
        ctx2d.fillStyle = "#fff";
        ctx2d.font = "14px system-ui, sans-serif";
        ctx2d.textAlign = "center";
        ctx2d.fillText(layer.name, W / 2, H / 2 + inset);
        ctx2d.globalAlpha = 1;
      }
    }

    // Re-render whenever state changes
    let rafId;
    function loop() {
      render();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Also re-render on resize
    const onResize = () => render();
    window.addEventListener("resize", onResize);

    ctx.registerResource("layer-compositor", {
      save: () => ({ rafId, onResize }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  },
});

export { LayerCompositor };
export default LayerCompositor;

// Auto-mount
const stage = document.querySelector(".stage");
if (stage) stage.replaceWith(new LayerCompositor());
else document.body.appendChild(new LayerCompositor());
