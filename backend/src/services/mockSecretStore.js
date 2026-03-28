/**
 * @param {{ path: string, secrets: Record<string, string> }} input
 */
function cloneSecretEntry(input) {
  return {
    path: input.path,
    secrets: { ...input.secrets }
  };
}

/**
 * @param {{}} [dependencies]
 */
export function createMockSecretStore(dependencies = {}) {
  void dependencies;

  /** @type {Map<string, Record<string, string>>} */
  const entries = new Map();

  return {
    /**
     * @param {{ path: string, secrets: Record<string, string> }} input
     */
    async writeSecrets(input) {
      entries.set(input.path, cloneSecretEntry(input).secrets);

      return {
        path: input.path
      };
    },

    /**
     * @param {{ path: string }} input
     */
    async readSecrets(input) {
      const secrets = entries.get(input.path);

      if (!secrets) {
        return null;
      }

      return {
        path: input.path,
        secrets: { ...secrets }
      };
    },

    /**
     * @param {{ path: string }} input
     */
    async deleteSecrets(input) {
      entries.delete(input.path);
    },

    /**
     * @param {string} path
     */
    hasPath(path) {
      return entries.has(path);
    },

    size() {
      return entries.size;
    }
  };
}
