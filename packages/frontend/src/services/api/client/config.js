export const DEFAULT_TIMEOUT = 8000;

let customBaseUrl = null;

export function resolveBaseUrl() {
  if (customBaseUrl) return customBaseUrl;

  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Si estamos en un entorno Android nativo o emulador
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  if (isAndroid) {
    return 'http://10.0.2.2:3000/api';
  }

  // Entorno iOS Simulator, Web o Node.js
  return 'http://localhost:3000/api';
}

export function setBaseUrl(newUrl) {
  customBaseUrl = newUrl;
}

export function getBaseUrl() {
  return resolveBaseUrl();
}

export function resetBaseUrl() {
  customBaseUrl = null;
}
