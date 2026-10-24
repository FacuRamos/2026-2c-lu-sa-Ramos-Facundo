import { getBaseUrl, DEFAULT_TIMEOUT } from './config.js';
import { createApiErrorFromResponse, NetworkError, ApiError } from './apiError.js';
import { secureStoreService, SECURE_KEYS } from '../../secureStoreService.js';

export class WebApiCaller {
  constructor(config = {}) {
    this.defaultTimeout = config.timeout || DEFAULT_TIMEOUT;
  }

  async buildUrl(endpoint, query = null) {
    const base = getBaseUrl().replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let fullUrl = `${base}${cleanEndpoint}`;

    if (query && typeof query === 'object' && Object.keys(query).length > 0) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    return fullUrl;
  }

  async request(endpoint, {
    method = 'GET',
    body = null,
    headers = {},
    timeout = this.defaultTimeout,
    query = null,
  } = {}) {
    const fullUrl = await this.buildUrl(endpoint, query);

    // Obtener token JWT almacenado de forma segura en Hardware Keystore
    let authHeader = {};
    try {
      const token = await secureStoreService.getItem(SECURE_KEYS.AUTH_TOKEN);
      if (token) {
        authHeader = { Authorization: `Bearer ${token}` };
      }
    } catch {
      // Continuar sin token si secureStore no está disponible
    }

    const finalHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    };

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timer = null;
    if (controller && timeout > 0) {
      timer = setTimeout(() => controller.abort(), timeout);
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller ? controller.signal : undefined,
      });

      if (timer) clearTimeout(timer);

      let responseData = null;
      const text = await response.text();
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      }

      if (!response.ok) {
        throw createApiErrorFromResponse(response.status, responseData);
      }

      return responseData;
    } catch (err) {
      if (timer) clearTimeout(timer);

      if (err.name === 'AbortError') {
        throw new NetworkError(`Tiempo de espera agotado (${timeout}ms) al conectar con el servidor`, { originalError: err });
      }

      if (err instanceof ApiError) {
        throw err;
      }

      throw new NetworkError(err.message || 'Error de red al conectar con el servidor', { originalError: err });
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  async patch(endpoint, body = null, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Alias semántico para actualización
  async update(endpoint, body = null, options = {}) {
    return this.patch(endpoint, body, options);
  }
}

export const webApiCaller = new WebApiCaller();
