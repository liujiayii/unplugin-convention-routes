import { defineConfig } from "tsdown"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/vite.ts",
    "src/rspack.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  deps: {
    neverBundle: ["unplugin", "@antfu/utils"],
  },
})
