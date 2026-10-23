import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/apiService.js';

/**
 * Custom Hook para gestionar la lógica de conversación y mensajería en tiempo real.
 * Encapsula la obtención de la compra, despacho de mensajes, auto-scroll y estados de carga.
 */
export function useChat(purchaseId) {
  const { currentUser, sendMessage, purchases } = useApp();

  const [purchase, setPurchase] = useState(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadChat() {
      if (!purchaseId) return;
      try {
        setLoading(true);
        const p = await apiService.getCompraById(purchaseId);
        if (isMounted) setPurchase(p);
      } catch (err) {
        if (isMounted) {
          Alert.alert('Error', err.message || 'No se pudo cargar la conversación');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChat();
    return () => {
      isMounted = false;
    };
  }, [purchaseId, purchases]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !purchase) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendMessage(purchase.id, textToSend);
      const updated = await apiService.getCompraById(purchase.id);
      setPurchase(updated);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    } catch (err) {
      Alert.alert('Error al enviar', err.message || 'No se pudo enviar el mensaje');
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  }, [inputText, purchase, sendMessage]);

  const messages = useMemo(() => purchase?.mensajes || [], [purchase]);

  return {
    currentUser,
    purchase,
    messages,
    inputText,
    setInputText,
    sending,
    loading,
    handleSend,
    scrollViewRef,
  };
}
