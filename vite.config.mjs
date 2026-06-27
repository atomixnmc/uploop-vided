import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
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

for (const pkg of videdPackages) {
  alias[`@uploop/${pkg}`] = path.resolve(
    __dirname,
    `packages/${pkg}/src/index.js`,
  );
}

alias["@uploop/vided-ui"] = path.resolve(__dirname, "packages/ui/src/index.js");

alias["@uploop/html"] = path.join(uploopjsRoot, "html/src/index.js");
alias["@uploop/core"] = path.join(uploopjsRoot, "core/src/index.js");
alias["@uploop/css"] = path.join(uploopjsRoot, "css/src/index.js");

// ── Multi-page: find all example HTML entry points ──────────────
const examplesRoot = path.resolve(__dirname, "examples");

function findHtmlFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      files.push(...findHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

const htmlFiles = findHtmlFiles(examplesRoot);
const input = {};
for (const file of htmlFiles) {
  // Convert absolute path to relative from examples root
  const rel = path.relative(examplesRoot, file);
  // Use the path without .html as the output name
  // examples/index.html → index
  // examples/01-slideshow/index.html → 01-slideshow/index
  // examples/advanced/21-calculus-visualization/index.html → advanced/21-calculus-visualization/index
  const name = rel.replace(/\.html$/, "");
  input[name] = file;
}

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
    rollupOptions: { input },
  },
});
