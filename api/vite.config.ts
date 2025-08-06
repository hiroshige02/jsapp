import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/index.ts",
    }),
    tsconfigPaths(),
  ],
  build: {
    outDir: "dist",
    ssr: true, // サーバーサイドレンダリング用
    lib: {
      entry: "./src/index.ts", // 明示的にビルド対象のエントリポイントを指定
      formats: ["es"], // esm形式で出力
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["@prisma/client"],
    },
  },
  resolve: {
    extensions: [".ts", ".js", ".json"], // 拡張子の自動解決
  },
  server: {
    host: "0.0.0.0", // WSL環境でもWindows側のブラウザから接続可能に
    port: 3000, // デフォルトポート（変更可能）
    strictPort: true, // ポートが使用中ならエラー
    watch: {
      usePolling: true, // WSLでのファイル変更検出を安定化
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: 3000,
    },
  },
});
