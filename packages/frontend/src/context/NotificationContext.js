import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService.js';
import { useApp } from './AppContext.js';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { userRole, currentUser } = useApp();
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await apiService.getNotificaciones({
        usuarioId: currentUser?.id,
        rolDestino: userRole,
      });
      setNotificaciones(items);
      const count = items.filter((n) => !n.leida).length;
      setUnreadCount(count);
    } catch (err) {
      console.warn('Error al cargar notificaciones:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, currentUser?.id]);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const marcarComoLeida = useCallback(async (id) => {
    try {
      await apiService.marcarNotificacionLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Error al marcar notificación:', err.message);
    }
  }, []);

  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      await apiService.marcarTodasNotificacionesLeidas({
        usuarioId: currentUser?.id,
        rolDestino: userRole,
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error al marcar todas:', err.message);
    }
  }, [currentUser?.id, userRole]);

  const agregarNotificacion = useCallback(async (data) => {
    try {
      const nueva = await apiService.crearNotificacion({
        ...data,
        usuarioId: data.usuarioId || currentUser?.id,
        rolDestino: data.rolDestino || userRole,
      });
      setNotificaciones((prev) => [nueva, ...prev]);
      setUnreadCount((prev) => prev + 1);
      return nueva;
    } catch (err) {
      console.warn('Error al crear notificación:', err.message);
      return null;
    }
  }, [currentUser?.id, userRole]);

  const value = {
    notificaciones,
    unreadCount,
    isLoading,
    cargarNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    agregarNotificacion,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
};
