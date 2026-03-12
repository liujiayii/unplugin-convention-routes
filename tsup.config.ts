import { defineConfig } from "tsup"

export default defineConfig({
  entryPoints: [
    "src/index.ts",
    "src/vite.ts",
    "src/rspack.ts",
  ],
  format: [
    "cjs",
    "esm",
  ],
  dts: true,
  clean: true,
  sourcemap: false,
  splitting: false,
  external: ["unplugin", "@antfu/utils"],
})
