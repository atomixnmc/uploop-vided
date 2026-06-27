import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploopPackages = ["media", "timeline", "compositor", "output", "toolset", "project"];
const alias = {};
for (const pkg of uploopPackages) {
  alias[`@uploop/${pkg}`] = path.resolve(__dirname, `../${pkg}/src/index.js`);
}
alias["@uploop/vided-ui"] = path.resolve(__dirname, "../ui/src/index.js");
alias["@uploop/editor"] = path.resolve(__dirname, "./src/index.js");

export default defineConfig({
  root: "public",
  resolve: { conditions: ["import"], alias },
  server: { port: 3004, open: true },
  build: { outDir: "../dist", emptyOutDir: true },
});
