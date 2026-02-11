import { defineConfig } from "drizzle-kit";

// DATABASE_URL should be provided via environment variables (e.g., .env.local locally, or Vercel dashboard in production)
if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./supabase/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
