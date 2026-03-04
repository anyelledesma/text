import { defineStore } from 'pinia';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length,
  );

  function addNotification(
    type: Notification['type'],
    title: string,
    message: string,
  ) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };

    notifications.value.unshift(notification);
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  function clearAll() {
    notifications.value = [];
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll,
  };
});
