import { defineConfig } from "vite"

// GitHub Pages serves this repo at /ninja-ballerina/. If you rename the
// repo or host at a custom root, update base to match.
export default defineConfig({
  base: "/ninja-ballerina/",
  server: {
    open: true,
  },
})
