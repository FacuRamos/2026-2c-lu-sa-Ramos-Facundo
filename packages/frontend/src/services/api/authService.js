import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const authService = {
  reset() {
    localStore.reset();
  },

  async loginDemo(rol = 'Comprador') {
    try {
      return await webApiCaller.post('/auth/demo', { rol });
    } catch (err) {
      if (err instanceof NetworkError) {
        const isOrg = rol === 'Organizador';
        const user = isOrg
          ? {
              id: 'usr-org-1',
              nombre: 'Luna',
              apellido: 'Producciones',
              nombreProductora: 'Luna Producciones',
              email: 'contacto@lunaproducciones.com',
              avatar: 'LP',
              rol: 'Organizador',
            }
          : {
              id: 'usr-comprador-1',
              nombre: 'Martina',
              apellido: 'García',
              email: 'martina.garcia@example.com',
              avatar: 'MG',
              rol: 'Comprador',
            };

        const token = isOrg ? 'demo-jwt-organizer-token' : 'demo-jwt-buyer-token';
        const refreshToken = isOrg ? 'demo-refresh-organizer' : 'demo-refresh-buyer';

        return { token, refreshToken, usuario: user };
      }
      throw err;
    }
  },

  async login({ email, password, rolSolicitado = null }) {
    if (!email || !email.trim()) throw new Error('El email es obligatorio');
    if (!password) throw new Error('La contraseña es obligatoria');

    try {
      return await webApiCaller.post('/auth/login', {
        email: email.trim(),
        password,
        rolSolicitado,
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const normalized = email.trim().toLowerCase();
        let user = localStore.users.find((u) => u.email && u.email.toLowerCase() === normalized);

        if (!user) {
          if (normalized.includes('luna') || rolSolicitado === 'Organizador') {
            user = {
              id: 'usr-org-1',
              nombre: 'Luna',
              apellido: 'Producciones',
              nombreProductora: 'Luna Producciones',
              email: normalized,
              rol: 'Organizador',
              avatar: 'LP',
            };
          } else {
            user = {
              id: `usr-${Date.now()}`,
              nombre: 'Usuario',
              apellido: 'Demo',
              email: normalized,
              rol: 'Comprador',
              avatar: 'UD',
            };
          }
        }

        const token = `jwt-token-${user.id}-${Date.now()}`;
        const refreshToken = `ref-${user.id}-${Date.now()}`;

        return { token, refreshToken, usuario: user };
      }
      throw err;
    }
  },

  async registerBuyer({ nombre, apellido, email, password }) {
    if (!nombre || nombre.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
    if (!apellido || apellido.trim().length < 2) throw new Error('El apellido debe tener al menos 2 caracteres');
    if (!email || !email.includes('@')) throw new Error('Formato de email inválido');
    if (!password || password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

    try {
      return await webApiCaller.post('/auth/register/buyer', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const newUser = {
          id: `usr-buyer-${Date.now()}`,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim().toLowerCase(),
          rol: 'Comprador',
          avatar: `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase(),
          favoritos: [],
        };

        localStore.users.push(newUser);
        const token = `jwt-token-${newUser.id}`;
        const refreshToken = `ref-${newUser.id}`;

        return { token, refreshToken, usuario: newUser };
      }
      throw err;
    }
  },

  async registerOrganizer({ nombre, apellido, nombreProductora, email, password, razonSocial }) {
    if (!nombre || nombre.trim().length < 2) throw new Error('El nombre del responsable debe tener al menos 2 caracteres');
    if (!apellido || apellido.trim().length < 2) throw new Error('El apellido debe tener al menos 2 caracteres');
    if (!nombreProductora || nombreProductora.trim().length < 2) throw new Error('El nombre de la productora es obligatorio');
    if (!email || !email.includes('@')) throw new Error('Formato de email inválido');
    if (!password || password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

    try {
      return await webApiCaller.post('/auth/register/organizer', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        nombreProductora: nombreProductora.trim(),
        razonSocial: razonSocial ? razonSocial.trim() : undefined,
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const newOrg = {
          id: `usr-org-${Date.now()}`,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          nombreProductora: nombreProductora.trim(),
          razonSocial: razonSocial ? razonSocial.trim() : null,
          email: email.trim().toLowerCase(),
          rol: 'Organizador',
          avatar: nombreProductora.substring(0, 2).toUpperCase(),
        };

        localStore.users.push(newOrg);
        const token = `jwt-token-${newOrg.id}`;
        const refreshToken = `ref-${newOrg.id}`;

        return { token, refreshToken, usuario: newOrg };
      }
      throw err;
    }
  },
};
