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
    host: "0.0.0.0", // VITE HTTPサーバーの待ち受けアドレス
    port: 80, // デフォルトポート（変更可能）
    strictPort: true, // ポートが使用中ならエラー
    watch: {
      usePolling: true, // WSLでのファイル変更検出を安定化
    },
    hmr: {
      protocol: "ws",
      host: process.env.VITE_HMR_HOST || "localhost", // ブラウザからの接続先
      clientPort: 80,
    },
    allowedHosts: ["localhost", "front"],
  },
  preview: {
    host: process.env.VITE_PREVIEW_HOST || "localhost",
    port: Number(process.env.VITE_PREVIEW_PORT) || 80,
  },
});
