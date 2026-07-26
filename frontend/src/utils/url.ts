export function normalizeExternalUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

export function getDomain(url: string) {
  try {
    return new URL(normalizeExternalUrl(url)).hostname;
  } catch {
    return url;
  }
}

export function matchesSearch(value: string | null | undefined, search: string) {
  return value?.toLowerCase().includes(search) ?? false;
}
