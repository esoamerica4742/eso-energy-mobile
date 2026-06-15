/** Map low-level fetch / DNS failures to user-safe copy. */
export function friendlyNetworkError(message: string, fallback = 'Could not reach the server. Check your internet connection and try again.'): string {
  const m = message.toLowerCase();

  if (
    m.includes('unknownhost') ||
    m.includes('unknown host') ||
    m.includes('unable to resolve host') ||
    m.includes('no address associated with hostname') ||
    m.includes('err_name_not_resolved') ||
    m.includes('getaddrinfo')
  ) {
    return 'No connection to Eso Energy servers. Check mobile data or Wi‑Fi, then try again.';
  }

  if (m.includes('fetch failed') || m.includes('network request failed') || m.includes('network error')) {
    return fallback;
  }

  if (m.includes('timed out') || m.includes('timeout')) {
    return 'Request timed out. Check your connection and try again.';
  }

  if (m.includes('failed to connect') || m.includes('connection refused') || m.includes('econnrefused')) {
    return 'Could not connect to the server. Try again in a moment.';
  }

  return message;
}

export function isNetworkFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('fetch failed') ||
    m.includes('unknownhost') ||
    m.includes('network request failed') ||
    m.includes('unable to resolve host') ||
    m.includes('timed out') ||
    m.includes('timeout')
  );
}
