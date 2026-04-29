import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/procon-gamepad-mapper/" : "/",
  root: "demo",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "demo/index.html"),
    },
  },
});
