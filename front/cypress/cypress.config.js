import { defineConfig } from "cypress";

// 設定項目: https://docs.cypress.io/app/references/configuration
export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:80",
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true,
    specPattern: "**/*.cy.(ts|js)",
    videosFolder: "./videos",
    screenshotsFolder: "./screenshots",
  },
});
