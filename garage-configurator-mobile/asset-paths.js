function ensureTrailingSlash(url) {
  return url.endsWith('/') ? url : `${url}/`;
}

function stripMobileSegment(url) {
  return url.replace(/garage-configurator-mobile\/?(?:index\.html)?(?:[?#].*)?$/u, '');
}

function getLocationBaseUrl() {
  if (typeof window === 'undefined' || !window.location) {
    return new URL('./', import.meta.url).href;
  }
  return new URL('./', window.location.href).href;
}

function getDerivedMobileBaseUrl() {
  const importBase = new URL('./', import.meta.url).href;
  const locationBase = getLocationBaseUrl();

  if (/garage-configurator-mobile\//u.test(locationBase)) {
    return locationBase;
  }

  if (/cdn\.jsdelivr\.net/u.test(locationBase) && /garage-configurator-mobile\//u.test(importBase)) {
    return importBase;
  }

  return importBase;
}

export function getEmbedBaseUrl() {
  const globalBase = window.GARAGE_CONFIGURATOR_MOBILE_BASE_URL || window.GARAGE_CONFIGURATOR_EMBED_BASE_URL;
  if (typeof globalBase === 'string' && globalBase.trim()) {
    return ensureTrailingSlash(globalBase.trim());
  }

  return ensureTrailingSlash(getDerivedMobileBaseUrl());
}

export function getSharedAssetBaseUrl() {
  const explicitAssetBase = window.GARAGE_CONFIGURATOR_ASSET_BASE_URL;
  if (typeof explicitAssetBase === 'string' && explicitAssetBase.trim()) {
    return ensureTrailingSlash(explicitAssetBase.trim());
  }

  return ensureTrailingSlash(stripMobileSegment(getEmbedBaseUrl()));
}

export function resolveEmbedAsset(path) {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return new URL(normalizedPath, getEmbedBaseUrl()).href;
}

export function resolveSharedAsset(path) {
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return new URL(normalizedPath, getSharedAssetBaseUrl()).href;
}

export function resolveModelAsset(fileName) {
  return resolveSharedAsset(`models/${String(fileName || '').replace(/^\/+/, '')}`);
}

export function resolveSceneAsset(fileName) {
  return resolveSharedAsset(`images/garages/scene/${String(fileName || '').replace(/^\/+/, '')}`);
}
