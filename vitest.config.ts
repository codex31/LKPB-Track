import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    env: {
      // adminAuth.test.ts signs real tokens; env.ts fails fast in production
      // without JWT_SECRET, so provide a throwaway value for the test run.
      JWT_SECRET: "test-secret-not-for-production",
      NODE_ENV: "test",
    },
  },
});
