import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sunmaoFsVitePlugin from "./tools/sunmao-fs-vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    sunmaoFsVitePlugin({
      schemas: [
        {
          name: "main",
          path: path.resolve(__dirname, "./src/sunmao/schema.json"),
        },
      ],
    }),
    react(),
  ],
});
