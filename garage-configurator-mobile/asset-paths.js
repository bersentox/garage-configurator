function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

export function getEmbedBaseUrl() {
  const globalBase = window.GARAGE_CONFIGURATOR_MOBILE_BASE_URL || window.GARAGE_CONFIGURATOR_EMBED_BASE_URL;
  if (typeof globalBase === "string" && globalBase.trim()) {
    return ensureTrailingSlash(globalBase.trim());
  }
  return new URL("./", import.meta.url).href;
}

export function resolveEmbedAsset(path) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return new URL(normalizedPath, getEmbedBaseUrl()).href;
}
