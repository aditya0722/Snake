import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * Custom hook for managing real-time notifications with SILENT background polling
 * No loading spinners or visual feedback - just silent updates
 * 
 * @param {number} userId - The current user's ID
 * @param {number} lightPollInterval - Light poll interval in ms (default: 30000 = 30s)
 * @param {number} heavyPollInterval - Heavy poll interval in ms (default: 60000 = 60s)
 */
export const useNotifications = (userId, lightPollInterval = 30000, heavyPollInterval = 60000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  
  // We DON'T expose loading state - polling happens silently in background
  const loading = false;
  
  const pollIntervalsRef = useRef({});
  const lastFetchTimeRef = useRef(null);
  const cacheRef = useRef({
    notifications: [],
    unreadCount: 0,
    lastUpdate: null
  });

  // Fetch all notifications SILENTLY (no state updates that cause re-renders)
  const fetchNotifications = useCallback(async (silent = true) => {
    if (!userId) return;

    try {
      const response = await api.get(
        `/notifications/notifications.php?action=getAll&user_id=${userId}&limit=20`
      );

      if (response.data?.success) {
        const data = response.data.data || [];
        
        // Only update state if data actually changed
        if (JSON.stringify(cacheRef.current.notifications) !== JSON.stringify(data)) {
          setNotifications(data);
          cacheRef.current.notifications = data;
          updateUnreadCount(data);
          lastFetchTimeRef.current = new Date();
        }
        
        setError(null);
      }
    } catch (err) {
      // Silently log error, don't show to user
      console.error('Silent fetch notifications error:', err);
      setError(null); // Keep UI clean
    }
  }, [userId]);

  // Fetch unread count SILENTLY (lighter request)
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(
        `/notifications/notifications.php?action=getUnreadCount&user_id=${userId}`
      );

      if (response.data?.success) {
        const count = response.data.data?.unread_count || 0;
        
        // Only update if different
        if (cacheRef.current.unreadCount !== count) {
          setUnreadCount(count);
          cacheRef.current.unreadCount = count;
        }
      }
    } catch (err) {
      // Silently fail
      console.error('Silent fetch unread count error:', err);
    }
  }, [userId]);

  // Update unread count based on notifications
  const updateUnreadCount = (notifs) => {
    const unread = notifs.filter(n => !n.is_read).length;
    if (cacheRef.current.unreadCount !== unread) {
      setUnreadCount(unread);
      cacheRef.current.unreadCount = unread;
    }
  };

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.post(
        '/notifications/notifications.php?action=markAsRead',
        { notification_id: notificationId }
      );

      if (response.data?.success) {
        // Update local state without showing loading
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.post(
        `/notifications/notifications.php?action=markAllAsRead?user_id=${userId}`
      );

      if (response.data?.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await api.post(
        '/notifications/notifications.php?action=delete',
        { notification_id: notificationId }
      );

      if (response.data?.success) {
        setNotifications(prev =>
          prev.filter(n => n.id !== notificationId)
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  }, [fetchUnreadCount]);

  // Create notification (admin/system)
  const createNotification = useCallback(async (targetUserId, title, message, relatedCaseId = null) => {
    try {
      const response = await api.post(
        '/notifications/notifications.php?action=create',
        {
          user_id: targetUserId,
          title,
          message,
          related_case_id: relatedCaseId,
        }
      );

      if (response.data?.success) {
        // If it's for current user, fetch silently
        if (targetUserId === userId) {
          await fetchNotifications(true); // Silent
        }
        return response.data.data;
      }
    } catch (err) {
      console.error('Create notification error:', err);
      throw err;
    }
  }, [userId, fetchNotifications]);

  // Smart polling strategy
  useEffect(() => {
    if (!userId) return;

    // Initial fetch - SILENT
    fetchNotifications(true);

    // Light poll - just unread count (every 30 seconds)
    pollIntervalsRef.current.light = setInterval(() => {
      fetchUnreadCount();
    }, lightPollInterval);

    // Heavy poll - full notifications (every 60 seconds)
    pollIntervalsRef.current.heavy = setInterval(() => {
      fetchNotifications(true); // Silent
    }, heavyPollInterval);

    return () => {
      if (pollIntervalsRef.current.light) clearInterval(pollIntervalsRef.current.light);
      if (pollIntervalsRef.current.heavy) clearInterval(pollIntervalsRef.current.heavy);
    };
  }, [userId, lightPollInterval, heavyPollInterval, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading: false, // Always false - silent polling
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: () => fetchNotifications(true), // Silent refetch
  };
};

export default useNotifications;