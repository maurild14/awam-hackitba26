import app from "./app.js";
import config from "./config/env.js";
import { createLogger } from "./lib/logger.js";

const logger = createLogger("proxy");

app.listen(config.port, () => {
  logger.info("Proxy listening.", {
    nodeEnv: config.nodeEnv,
    port: config.port
  });
});
