/**
 * @param {{}} [dependencies]
 */
export function createMockStreamEmitter(dependencies = {}) {
  void dependencies;

  /** @type {Map<string, Set<(event: { type: string, payload: Record<string, unknown> }) => void>>} */
  const listenersBySession = new Map();

  return {
    /**
     * @param {string} sessionId
     * @param {{ type: string, payload: Record<string, unknown> }} event
     */
    emit(sessionId, event) {
      const listeners = listenersBySession.get(sessionId);

      if (!listeners) {
        return;
      }

      for (const listener of [...listeners]) {
        listener(event);
      }
    },

    /**
     * @param {string} sessionId
     * @param {(event: { type: string, payload: Record<string, unknown> }) => void} listener
     */
    subscribe(sessionId, listener) {
      const listeners = listenersBySession.get(sessionId) ?? new Set();
      listeners.add(listener);
      listenersBySession.set(sessionId, listeners);

      return () => {
        const currentListeners = listenersBySession.get(sessionId);

        if (!currentListeners) {
          return;
        }

        currentListeners.delete(listener);

        if (currentListeners.size === 0) {
          listenersBySession.delete(sessionId);
        }
      };
    },

    /**
     * @param {string} sessionId
     */
    listenerCount(sessionId) {
      return listenersBySession.get(sessionId)?.size ?? 0;
    }
  };
}
