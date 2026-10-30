import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { USER_ROLES, DEFAULT_USERS } from '../constants/roles.js';
import { apiService } from '../services/apiService.js';
import { secureStoreService, SECURE_KEYS } from '../services/secureStoreService.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState(['ev-luna-park', 'ev-teatro-funcion']);
  const [organizerStats, setOrganizerStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar sesión desde Hardware Keystore (expo-secure-store)
  useEffect(() => {
    async function restoreSession() {
      try {
        const savedUser = await secureStoreService.getObject(SECURE_KEYS.USER_DATA);
        const savedToken = await secureStoreService.getItem(SECURE_KEYS.AUTH_TOKEN);
        if (savedUser && savedToken) {
          setCurrentUser(savedUser);
          setUserRole(savedUser.rol === USER_ROLES.ORGANIZER ? USER_ROLES.ORGANIZER : USER_ROLES.BUYER);
          setToken(savedToken);
        } else {
          setCurrentUser(null);
          setUserRole(null);
          setToken(null);
        }
      } catch (e) {
        console.warn('Error al restaurar sesión segura:', e);
        setCurrentUser(null);
        setUserRole(null);
        setToken(null);
      } finally {
        setIsReady(true);
      }
    }
    restoreSession();
  }, []);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cats, evts] = await Promise.all([
        apiService.getCategorias(),
        apiService.getEventos(),
      ]);
      setCategories(cats);
      setEvents(evts);

      if (currentUser?.id) {
        if (userRole === USER_ROLES.BUYER) {
          const userPurchases = await apiService.getComprasByComprador(currentUser.id);
          setPurchases(userPurchases);
        } else if (userRole === USER_ROLES.ORGANIZER) {
          const [orgPurchases, stats] = await Promise.all([
            apiService.getComprasByOrganizador(currentUser.id),
            apiService.getStatsOrganizador(currentUser.id),
          ]);
          setPurchases(orgPurchases);
          setOrganizerStats(stats);
        }
      } else {
        setPurchases([]);
        setOrganizerStats(null);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [userRole, currentUser?.id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Cambiar rol de usuario
  const switchRole = useCallback(async (newRole) => {
    const isOrg = newRole === USER_ROLES.ORGANIZER;
    const targetRole = isOrg ? USER_ROLES.ORGANIZER : USER_ROLES.BUYER;

    // Si el usuario actual ya es una cuenta registrada con este rol, preservamos su identidad
    if (currentUser && currentUser.rol === targetRole && !currentUser.id?.startsWith('usr-')) {
      setUserRole(targetRole);
      return;
    }

    const targetUser = isOrg ? DEFAULT_USERS.organizer : DEFAULT_USERS.buyer;

    setUserRole(targetRole);
    setCurrentUser(targetUser);
    secureStoreService.setObject(SECURE_KEYS.USER_DATA, targetUser);

    try {
      const res = await apiService.loginDemo(isOrg ? 'Organizador' : 'Comprador');
      if (res?.token) {
        setToken(res.token);
        await secureStoreService.setItem(SECURE_KEYS.AUTH_TOKEN, res.token);
      }
      if (res?.usuario) {
        setCurrentUser(res.usuario);
        await secureStoreService.setObject(SECURE_KEYS.USER_DATA, res.usuario);
      }
    } catch {
      // Si falla login demo por offline, mantiene targetUser en memoria
    }
  }, [currentUser]);

  // Métodos de Autenticación y Sesión Segura
  const loginDemo = useCallback(async (rol = 'Comprador') => {
    setIsLoading(true);
    try {
      const res = await apiService.loginDemo(rol);
      setCurrentUser(res.usuario);
      setUserRole(res.usuario.rol === USER_ROLES.ORGANIZER ? USER_ROLES.ORGANIZER : USER_ROLES.BUYER);
      setToken(res.token);
      await secureStoreService.setObject(SECURE_KEYS.USER_DATA, res.usuario);
      await secureStoreService.setItem(SECURE_KEYS.AUTH_TOKEN, res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password, rolSolicitado }) => {
    setIsLoading(true);
    try {
      const res = await apiService.login({ email, password, rolSolicitado });
      setCurrentUser(res.usuario);
      setUserRole(res.usuario.rol === USER_ROLES.ORGANIZER ? USER_ROLES.ORGANIZER : USER_ROLES.BUYER);
      setToken(res.token);
      await secureStoreService.setObject(SECURE_KEYS.USER_DATA, res.usuario);
      await secureStoreService.setItem(SECURE_KEYS.AUTH_TOKEN, res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerBuyer = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await apiService.registerBuyer(data);
      setCurrentUser(res.usuario);
      setUserRole(USER_ROLES.BUYER);
      setToken(res.token);
      await secureStoreService.setObject(SECURE_KEYS.USER_DATA, res.usuario);
      await secureStoreService.setItem(SECURE_KEYS.AUTH_TOKEN, res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerOrganizer = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await apiService.registerOrganizer(data);
      setCurrentUser(res.usuario);
      setUserRole(USER_ROLES.ORGANIZER);
      setToken(res.token);
      await secureStoreService.setObject(SECURE_KEYS.USER_DATA, res.usuario);
      await secureStoreService.setItem(SECURE_KEYS.AUTH_TOKEN, res.token);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await secureStoreService.deleteItem(SECURE_KEYS.USER_DATA);
      await secureStoreService.deleteItem(SECURE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.warn('Error al borrar sesión segura:', e);
    }
    setCurrentUser(null);
    setUserRole(null);
    setToken(null);
    setPurchases([]);
    setOrganizerStats(null);
  }, []);

  // Favoritos
  const isFavorite = useCallback(
    (eventId) => favorites.includes(eventId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (eventId) => {
      if (!currentUser?.id) return false;
      try {
        const res = await apiService.toggleFavorito(currentUser.id, eventId);
        setFavorites(res.favoritos);
        return res.esFavorito;
      } catch (err) {
        setError(err.message);
        return false;
      }
    },
    [currentUser?.id]
  );

  // Compras
  const createPurchase = useCallback(
    async ({ eventoId, tipoEntradaId, cantidad }) => {
      if (!currentUser?.id) {
        throw new Error('Debés iniciar sesión para realizar una compra');
      }
      setIsLoading(true);
      try {
        const nuevaCompra = await apiService.createCompra({
          compradorId: currentUser.id,
          eventoId,
          tipoEntradaId,
          cantidad,
        });

        // Actualizar lista local de compras y eventos (cupo actualizado)
        setPurchases(prev => [nuevaCompra, ...prev]);
        const updatedEvents = await apiService.getEventos();
        setEvents(updatedEvents);

        // Disparar notificaciones para comprador y organizador
        try {
          const eventObj = events.find(e => e.id === eventoId);
          const organizerId = eventObj?.organizadorId || eventObj?.organizador?.id || nuevaCompra.organizadorId;

          await apiService.crearNotificacion({
            usuarioId: currentUser.id,
            rolDestino: 'Comprador',
            tipo: 'COMPRA_CONFIRMADA',
            titulo: '¡Compra confirmada!',
            mensaje: `Tu compra para "${nuevaCompra.eventoTitulo || eventObj?.nombre || 'el evento'}" fue confirmada con éxito.`,
            entidadId: nuevaCompra.id,
          });

          if (organizerId) {
            await apiService.crearNotificacion({
              usuarioId: organizerId,
              rolDestino: 'Organizador',
              tipo: 'NUEVA_VENTA',
              titulo: 'Nueva entrada vendida',
              mensaje: `${currentUser.nombre} compró ${cantidad} entrada(s) para "${nuevaCompra.eventoTitulo || eventObj?.nombre || 'tu evento'}".`,
              entidadId: nuevaCompra.eventoId,
            });
          }
        } catch (e) {
          console.warn('Error al disparar notificación de compra:', e);
        }

        return nuevaCompra;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const cancelPurchase = useCallback(
    async (compraId) => {
      if (!currentUser?.id) {
        throw new Error('Debés iniciar sesión para cancelar una compra');
      }
      setIsLoading(true);
      try {
        const compraActualizada = await apiService.cancelarCompra(compraId, currentUser.id);
        setPurchases(prev =>
          prev.map(p => (p.id === compraId ? { ...p, estado: 'CANCELADA' } : p))
        );
        const updatedEvents = await apiService.getEventos();
        setEvents(updatedEvents);

        try {
          const compra = purchases.find(p => p.id === compraId);
          const organizerId = compra?.organizadorId || compra?.evento?.organizadorId;

          await apiService.crearNotificacion({
            usuarioId: currentUser.id,
            rolDestino: 'Comprador',
            tipo: 'COMPRA_CANCELADA',
            titulo: 'Compra cancelada',
            mensaje: 'Tu compra fue cancelada y el cupo ha sido restituido.',
            entidadId: compraId,
          });

          if (organizerId) {
            await apiService.crearNotificacion({
              usuarioId: organizerId,
              rolDestino: 'Organizador',
              tipo: 'COMPRA_CANCELADA',
              titulo: 'Compra cancelada por el comprador',
              mensaje: `Una compra de ${currentUser.nombre} fue cancelada. Cupo reintegrado.`,
              entidadId: compraId,
            });
          }
        } catch (e) {
          console.warn('Error al disparar notificación de cancelación:', e);
        }

        return compraActualizada;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  const markPurchaseUtilized = useCallback(
    async (compraId) => {
      if (!currentUser?.id) {
        throw new Error('Debés iniciar sesión como organizador');
      }
      setIsLoading(true);
      try {
        const compraActualizada = await apiService.marcarEntradaUtilizada(compraId, currentUser.id);
        setPurchases(prev =>
          prev.map(p => (p.id === compraId ? { ...p, estado: 'UTILIZADA' } : p))
        );
        return compraActualizada;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser?.id]
  );

  // Chat
  const sendMessage = useCallback(
    async (compraId, texto) => {
      if (!currentUser?.id) {
        throw new Error('Debés iniciar sesión para enviar mensajes');
      }
      const remitenteNombre =
        userRole === USER_ROLES.BUYER
          ? `${currentUser.nombre} ${currentUser.apellido}`
          : (currentUser.nombreProductora || currentUser.nombre);

      const nuevoMsg = await apiService.enviarMensajeCompra(compraId, {
        remitenteId: currentUser.id,
        remitenteNombre,
        texto,
        esComprador: userRole === USER_ROLES.BUYER,
      });

      setPurchases(prev =>
        prev.map(p => {
          if (p.id === compraId) {
            return {
              ...p,
              mensajes: [...(p.mensajes || []), nuevoMsg],
            };
          }
          return p;
        })
      );

      try {
        const compra = purchases.find(p => p.id === compraId);
        const destinatarioId =
          userRole === USER_ROLES.BUYER
            ? (compra?.organizadorId || compra?.evento?.organizadorId)
            : (compra?.compradorId || compra?.usuarioId);

        const rolDestino = userRole === USER_ROLES.BUYER ? 'Organizador' : 'Comprador';
        await apiService.crearNotificacion({
          usuarioId: destinatarioId,
          rolDestino,
          tipo: 'NUEVO_MENSAJE_CHAT',
          titulo: `Nuevo mensaje de ${remitenteNombre}`,
          mensaje: texto,
          entidadId: compraId,
        });
      } catch (e) {
        console.warn('Error al disparar notificación de chat:', e);
      }

      return nuevoMsg;
    },
    [currentUser, userRole]
  );

  // Reseñas
  const createReview = useCallback(
    async ({ eventoId, compraId, puntuacion, detalle }) => {
      setIsLoading(true);
      try {
        const resenia = await apiService.crearResenia({
          compradorId: currentUser?.id,
          compradorNombre: `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
          eventoId,
          compraId,
          puntuacion,
          detalle,
        });

        const updatedEvents = await apiService.getEventos();
        setEvents(updatedEvents);
        return resenia;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Crear Evento (Organizador)
  const createEvent = useCallback(
    async (eventoData) => {
      if (!currentUser?.id) {
        throw new Error('Debés iniciar sesión como organizador');
      }
      setIsLoading(true);
      try {
        const nuevoEvento = await apiService.createEvento({
          ...eventoData,
          organizadorId: currentUser.id,
          organizadorNombre: (currentUser.nombreProductora || `${currentUser.nombre} ${currentUser.apellido}`).trim(),
        });

        setEvents(prev => [nuevoEvento, ...prev]);
        const stats = await apiService.getStatsOrganizador(currentUser.id);
        setOrganizerStats(stats);
        return nuevoEvento;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser]
  );

  // Recarga manual
  const refreshData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  const value = {
    userRole,
    currentUser,
    token,
    isReady,
    switchRole,
    loginDemo,
    login,
    registerBuyer,
    registerOrganizer,
    logout,
    events,
    categories,
    purchases,
    favorites,
    organizerStats,
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    createPurchase,
    cancelPurchase,
    markPurchaseUtilized,
    sendMessage,
    createReview,
    createEvent,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};
