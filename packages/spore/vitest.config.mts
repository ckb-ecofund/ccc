import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  test: {
    watch: false,
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    include: ["src/**/*.test.ts"],
  },
});
