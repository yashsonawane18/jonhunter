import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, Check, Loader } from 'lucide-react';
import API_ENDPOINTS from '../config/api';
import { useUser } from '../contexts/UserContext';

interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: any;
}

const POLL_INTERVAL_MS = 60_000; // Poll every 60 seconds

/**
 * NotificationBell — shows a bell icon in the sidebar header with an unread badge.
 * Clicking it opens a dropdown listing all notifications; it marks them as read on open.
 */
const NotificationBell: React.FC = () => {
  const { user_id } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('session_token') || localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      'X-SESSION-TOKEN': token
    };
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!user_id) return;
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT(user_id), {
        headers: getHeaders()
      });
      if (res.ok) {
        const count: number = await res.json();
        setUnreadCount(count);
      }
    } catch {
      // silently ignore network errors for polling
    }
  }, [user_id, getHeaders]);

  const fetchAllNotifications = useCallback(async () => {
    if (!user_id) return;
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS_GET(user_id), {
        headers: getHeaders()
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user_id, getHeaders]);

  const markAllRead = useCallback(async () => {
    if (!user_id) return;
    try {
      await fetch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL(user_id), {
        method: 'POST',
        headers: getHeaders()
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  }, [user_id, getHeaders]);

  // Initial unread count fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Poll unread count every 60s
  useEffect(() => {
    const timer = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      await fetchAllNotifications();
      if (unreadCount > 0) {
        await markAllRead();
      }
    }
  };

  const formatDate = (dateInput: any) => {
    try {
      let date: Date;
      if (Array.isArray(dateInput)) {
        // [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        date = new Date(dateInput);
      }

      if (isNaN(date.getTime())) {
        return typeof dateInput === 'string' ? dateInput : '';
      }

      return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return String(dateInput);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}

        {/* Unread badge */}
        <span className={`absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] font-bold leading-none ${unreadCount > 0 ? 'bg-red-500' : 'bg-gray-500'}`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-[min(420px,calc(100vw-1rem))] rounded-xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${
                    !notification.isRead ? 'bg-amber-500/5' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Unread dot */}
                  <div className="flex gap-3 items-start">
                    {!notification.isRead && (
                      <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                    <div className={!notification.isRead ? '' : 'pl-5'}>
                      <p className="text-sm text-gray-200 leading-snug">{notification.message}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
