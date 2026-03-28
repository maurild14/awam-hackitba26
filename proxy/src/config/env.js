const DEFAULT_PORT = 3002;
const ALLOWED_NODE_ENVS = new Set(["development", "test", "production"]);

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function loadEnv(env = process.env) {
  const nodeEnv = env.NODE_ENV ?? "development";

  if (!ALLOWED_NODE_ENVS.has(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV "${nodeEnv}". Expected one of development, test, production.`
    );
  }

  const parsedPort = Number(env.PORT ?? DEFAULT_PORT);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return Object.freeze({
    nodeEnv,
    port: parsedPort,
    sessionId: env.SESSION_ID ?? "",
    phantomToken: env.PHANTOM_TOKEN ?? "",
    vaultUrl: env.VAULT_URL ?? "",
    vaultToken: env.VAULT_TOKEN ?? "",
    allowedDomains: env.ALLOWED_DOMAINS ?? "",
    serviceRoutes: env.SERVICE_ROUTES ?? ""
  });
}

const config = loadEnv();

export default config;
