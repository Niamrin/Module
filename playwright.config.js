import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4183/Module/";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL, channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  webServer: {
    command: "npm run preview -- --base /Module/ --host 127.0.0.1 --port 4183 --strictPort",
    url: baseURL,
  },
});
