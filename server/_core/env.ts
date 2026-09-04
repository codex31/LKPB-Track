const isProduction = process.env.NODE_ENV === "production";
const cookieSecret = process.env.JWT_SECRET ?? "";

if (isProduction && !cookieSecret) {
  throw new Error("JWT_SECRET is required in production");
}

const configuredTrustProxy = process.env.TRUST_PROXY;
const trustProxy = configuredTrustProxy === undefined ? (isProduction ? 1 : 0) : Number(configuredTrustProxy);

if (!Number.isInteger(trustProxy) || trustProxy < 0) {
  throw new Error("TRUST_PROXY must be a non-negative integer");
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret,
  adminUsername: process.env.ADMIN_USERNAME ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  trustProxy,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
