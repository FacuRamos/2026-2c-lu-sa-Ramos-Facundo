const memoryFallback = new Map();

export const SECURE_KEYS = {
  AUTH_TOKEN: 'AI_TICKET_IT_AUTH_TOKEN',
  REFRESH_TOKEN: 'AI_TICKET_IT_REFRESH_TOKEN',
  USER_DATA: 'AI_TICKET_IT_USER_DATA',
};

let nativeSecureStore = null;
let nativeChecked = false;

async function getSecureStore() {
  if (nativeChecked) return nativeSecureStore;
  nativeChecked = true;

  // Si estamos en entorno Node.js de pruebas (node --test) usamos memoryFallback
  if (typeof process !== 'undefined' && process.release?.name === 'node' && !globalThis.expo) {
    nativeSecureStore = null;
    return null;
  }

  try {
    const module = await import('expo-secure-store');
    nativeSecureStore = module;
    return module;
  } catch {
    nativeSecureStore = null;
    return null;
  }
}

export const secureStoreService = {
  async setItem(key, value) {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    const store = await getSecureStore();
    if (store && typeof store.setItemAsync === 'function') {
      try {
        await store.setItemAsync(key, stringVal);
        return;
      } catch (err) {
        // Fallback a memoria si falla Keychain nativo
      }
    }
    memoryFallback.set(key, stringVal);
  },

  async getItem(key) {
    const store = await getSecureStore();
    if (store && typeof store.getItemAsync === 'function') {
      try {
        const val = await store.getItemAsync(key);
        if (val !== null && val !== undefined) return val;
      } catch (err) {
        // Fallback
      }
    }
    return memoryFallback.get(key) || null;
  },

  async deleteItem(key) {
    const store = await getSecureStore();
    memoryFallback.delete(key);
    if (store && typeof store.deleteItemAsync === 'function') {
      try {
        await store.deleteItemAsync(key);
      } catch (err) {
        // Fallback
      }
    }
  },

  async getObject(key) {
    const raw = await this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async setObject(key, obj) {
    await this.setItem(key, JSON.stringify(obj));
  },
};
