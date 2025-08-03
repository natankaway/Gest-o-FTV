import React, { createContext, useContext, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@/hooks';
import type { NotificationContextType, Notification } from '@/types';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Show toast notification
    const message = notification.message || notification.title;
    switch (notification.type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      case 'info':
        toast(message, { icon: 'ℹ️' });
        break;
      default:
        toast(message);
    }
  }, [setNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, [setNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, [setNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, [setNotifications]);

  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  }), [
    notifications, 
    addNotification, 
    removeNotification, 
    clearAll, 
    markAsRead, 
    markAllAsRead
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};