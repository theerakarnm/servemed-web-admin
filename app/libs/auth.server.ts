import { db, schema } from "../db/db.server";
import { betterAuth } from "better-auth"
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from "better-auth/plugins/username";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:7300",
  secret: process.env.BETTER_AUTH_SECRET || undefined,
  // socialProviders: configuredProviders,
  plugins: [
    username(),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  advanced: process.env.NODE_ENV !== "production" ? undefined : {
    cookiePrefix: "servemed-web-admin",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: ".theerakarnm.dev",
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none",  // Allows CORS-based cookie sharing across subdomains
      partitioned: true, // New browser standards will mandate this for foreign cookies
    },
  }
});
