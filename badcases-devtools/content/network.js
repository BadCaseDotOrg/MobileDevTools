import { respond } from "../core/bus.js";

const logs = [];

const origFetch = window.fetch;

window.fetch = async (...args) => {
  const start = Date.now();

  const res = await origFetch(...args);

  const log = {
    url: args[0],
    status: res.status,
    time: Date.now() - start,
  };

  logs.push(log);

  respond("NETWORK_LOG", log);

  return res;
};

export function getLogs() {
  return logs;
}
