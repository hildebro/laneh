const FALLBACK_PROTOCOLS = ['https', 'http'];
// Default ports of the dev server and the production server
const FALLBACK_PORTS = [5173, 3000];

/**
 * Turns user input into the list of server URLs to try, in order. The input as given comes first. A missing protocol
 * is tried as https, then http. A missing port is tried as-is first, then with each fallback port.
 */
export function getServerUrlCandidates(input: string): string[] {
  const trimmed = input.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return [];
  }

  const protocolMatch = trimmed.match(/^([a-z][a-z\d+.-]*):\/\//i);
  const protocols = protocolMatch ? [protocolMatch[1].toLowerCase()] : FALLBACK_PROTOCOLS;
  const rest = protocolMatch ? trimmed.slice(protocolMatch[0].length) : trimmed;

  // Splits into the host (with optional user info) and everything after it. IPv6 hosts come in brackets.
  const [, host, port, path] = rest.match(/^((?:[^@/?#]*@)?(?:\[[^\]]*\]|[^:/?#]*))(:\d*)?(.*)$/)!;
  const hostVariants = port ? [host + port] : [host, ...FALLBACK_PORTS.map((p) => `${host}:${p}`)];

  return hostVariants.flatMap((hostVariant) => protocols.map((protocol) => `${protocol}://${hostVariant}${path}`));
}
