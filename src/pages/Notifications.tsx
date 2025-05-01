import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import NotificationItem from '../components/NotificationItem';

// Sample notifications data
const initialNotifications = [
  {
    id: '1',
    type: 'outbid',
    message: "You've been outbid on 'Luxury Beach Villa' by $15.",
    timestamp: '2025-06-20T14:45:00',
    read: false,
    actionLink: '/property/1/bid',
    actionText: 'Place new bid'
  },
  {
    id: '2',
    type: 'won',
    message: "Congratulations! Your bid has won for 'Modern Downtown Loft'.",
    timestamp: '2025-06-18T09:30:00',
    read: false,
    actionLink: '/bids',
    actionText: 'View details'
  },
  {
    id: '3',
    type: 'refund',
    message: "Listing canceled – your funds for 'Urban Penthouse Suite' have been refunded.",
    timestamp: '2025-06-15T16:20:00',
    read: true,
    actionLink: '/wallet',
    actionText: 'View wallet'
  },
  {
    id: '4',
    type: 'new-bid',
    message: "New bid placed on your property 'Mountain Retreat Cabin'.",
    timestamp: '2025-06-14T11:15:00',
    read: true,
    actionLink: '/host/property/3/bids',
    actionText: 'View bids'
  },
  {
    id: '5',
    type: 'system',
    message: "Welcome to BidStay! Connect your wallet to start bidding on properties.",
    timestamp: '2025-06-10T08:00:00',
    read: true,
    actionLink: '/wallet',
    actionText: 'Connect wallet'
  }
];

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const handleDismiss = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 mt-1">You have {unreadCount} unread notifications</p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button 
              className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No notifications to display.</p>
              <p className="text-gray-500 text-sm">
                You'll be notified about bid updates, property changes, and more.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  id={notification.id}
                  type={notification.type as any}
                  message={notification.message}
                  timestamp={notification.timestamp}
                  read={notification.read}
                  actionLink={notification.actionLink}
                  actionText={notification.actionText}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;