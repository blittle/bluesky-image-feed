import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: "src/bluesky-image-feed.js",
      formats: ["es"],
      fileName: () => "bluesky-image-feed.js",
    },
    rollupOptions: {
      output: {
        dir: "dist",
      },
    },
  },
});
