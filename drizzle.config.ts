import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: "./app/db/drizzle",
  schema: "./app/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
