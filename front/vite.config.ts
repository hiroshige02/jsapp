import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import env from "vite-plugin-env-compatible";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    env({ prefix: "VITE_", mountedPath: "process.env" }),
    tsconfigPaths(),
  ],
  server: {
    host: "0.0.0.0", // WSL環境でもWindows側のブラウザから接続可能に
    port: 80, // デフォルトポート（変更可能）
    strictPort: true, // ポートが使用中ならエラー
    watch: {
      usePolling: true, // WSLでのファイル変更検出を安定化
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: 80,
    },
  },
});
