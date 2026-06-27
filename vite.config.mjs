import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Vided packages ──────────────────────────────────────────────
const videdPackages = [
  "media",
  "timeline",
  "compositor",
  "output",
  "toolset",
  "project",
  "editor",
];

// ── Cross-project: uploopjs packages (HyperGraph runtime, UI) ──
const uploopjsRoot = path.resolve(__dirname, "../uploopjs/packages");

const alias = {};

// Vided packages
for (const pkg of videdPackages) {
  alias[`@uploop/${pkg}`] = path.resolve(
    __dirname,
    `packages/${pkg}/src/index.js`,
  );
}

// Special: @uploop/vided-ui (lives in packages/ui)
alias["@uploop/vided-ui"] = path.resolve(__dirname, "packages/ui/src/index.js");

// Cross-project: uploopjs (design doc says vided depends on these)
alias["@uploop/html"] = path.join(uploopjsRoot, "html/src/index.js");
alias["@uploop/core"] = path.join(uploopjsRoot, "core/src/index.js");
alias["@uploop/css"] = path.join(uploopjsRoot, "css/src/index.js");

export default defineConfig({
  root: "examples",
  server: {
    port: 3002,
    open: true,
  },
  resolve: {
    conditions: ["import"],
    alias,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
