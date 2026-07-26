import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "auth",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome"
      }
    },
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: ".auth/user.json"
      },
      dependencies: ["auth"]
    }
  ],
  webServer: [
    {
      command: "npm run dev:backend",
      cwd: "..",
      url: "http://localhost:3001/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    },
    {
      command: "npm run dev:frontend",
      cwd: "..",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000
    }
  ]
});
