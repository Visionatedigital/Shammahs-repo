'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { Icon } from '@/components/Icons';
import { toast } from 'sonner';
import { NotificationType } from '@/lib/notifications';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata: any;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'CREDIT':
      return 'credit';
    case 'SOCIAL':
      return 'users';
    case 'PAYMENT':
      return 'payment';
    case 'SYSTEM':
      return 'system';
    case 'CONTENT':
      return 'content';
    case 'ACCOUNT':
      return 'account';
    case 'COMMUNITY':
      return 'community';
    case 'SUPPORT':
      return 'support';
    default:
      return 'bell';
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'CREDIT':
      return 'bg-purple-100 text-purple-600';
    case 'SOCIAL':
      return 'bg-blue-100 text-blue-600';
    case 'PAYMENT':
      return 'bg-green-100 text-green-600';
    case 'SYSTEM':
      return 'bg-gray-100 text-gray-600';
    case 'CONTENT':
      return 'bg-yellow-100 text-yellow-600';
    case 'ACCOUNT':
      return 'bg-red-100 text-red-600';
    case 'COMMUNITY':
      return 'bg-indigo-100 text-indigo-600';
    case 'SUPPORT':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'ALL'>('ALL');

  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications();
    }
  }, [session?.user?.id]);

  const loadNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to load notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const filteredNotifications = selectedFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === selectedFilter);

  return (
    <DashboardLayout currentPage="notifications">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#202126]">Notifications</h1>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as NotificationType | 'ALL')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Notifications</option>
              <option value="CREDIT">Credit Alerts</option>
              <option value="SOCIAL">Social Interactions</option>
              <option value="PAYMENT">Payment Updates</option>
              <option value="SYSTEM">System Updates</option>
              <option value="CONTENT">Content Updates</option>
              <option value="ACCOUNT">Account Updates</option>
              <option value="COMMUNITY">Community Updates</option>
              <option value="SUPPORT">Support Updates</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Icon name="bell" size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 ${
                  !notification.isRead ? 'border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                    <Icon name={getNotificationIcon(notification.type)} size={24} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-[#202126]">{notification.title}</h3>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 