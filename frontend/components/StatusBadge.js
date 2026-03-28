import { formatBotStatus } from "../lib/bots.js";

/**
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {formatBotStatus(status)}
    </span>
  );
}
