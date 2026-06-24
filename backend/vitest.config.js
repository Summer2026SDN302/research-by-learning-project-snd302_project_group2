import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js", "src/**/*.integration.test.js"],
    clearMocks: true,
    restoreMocks: true,
  },
});

