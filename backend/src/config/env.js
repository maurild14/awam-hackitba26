const DEFAULT_PORT = 3001;
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
    frontendUrl: env.FRONTEND_URL ?? "http://localhost:3000",
    supabaseUrl: env.SUPABASE_URL ?? "",
    supabaseServiceKey: env.SUPABASE_SERVICE_KEY ?? "",
    upstashRedisUrl: env.UPSTASH_REDIS_URL ?? "",
    upstashRedisToken: env.UPSTASH_REDIS_TOKEN ?? "",
    vaultUrl: env.VAULT_URL ?? "",
    vaultToken: env.VAULT_TOKEN ?? "",
    mercadopagoAccessToken: env.MP_ACCESS_TOKEN ?? "",
    mercadopagoWebhookSecret: env.MP_WEBHOOK_SECRET ?? "",
    awsRegion: env.AWS_REGION ?? "",
    ecrRegistry: env.ECR_REGISTRY ?? "",
    s3BucketSource: env.S3_BUCKET_SOURCE ?? "",
    githubToken: env.GITHUB_TOKEN ?? "",
    internalApiToken: env.INTERNAL_API_TOKEN ?? ""
  });
}

const config = loadEnv();

export default config;
