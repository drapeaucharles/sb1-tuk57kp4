import React from 'react';
import { Bell, Check, X, ArrowUpRight } from 'lucide-react';
import Badge from './ui/Badge';

type NotificationType = 'outbid' | 'won' | 'refund' | 'new-bid' | 'system';

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
  actionText?: string;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  timestamp,
  read,
  actionLink,
  actionText,
  onMarkAsRead,
  onDismiss
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'outbid':
        return <Bell className="h-5 w-5 text-amber-400" />;
      case 'won':
        return <Check className="h-5 w-5 text-emerald-400" />;
      case 'refund':
        return <Bell className="h-5 w-5 text-indigo-400" />;
      case 'new-bid':
        return <Bell className="h-5 w-5 text-blue-400" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getBadgeVariant = (): 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'default' => {
    switch (type) {
      case 'outbid': return 'warning';
      case 'won': return 'success';
      case 'refund': return 'primary';
      case 'new-bid': return 'secondary';
      case 'system': return 'default';
      default: return 'default';
    }
  };
  
  const getBadgeText = (): string => {
    switch (type) {
      case 'outbid': return 'Outbid';
      case 'won': return 'Reservation Won';
      case 'refund': return 'Refund';
      case 'new-bid': return 'New Bid';
      case 'system': return 'System';
      default: return 'Notification';
    }
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className={`p-4 border-b border-gray-800 transition-colors ${read ? 'bg-gray-900' : 'bg-gray-800'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">
          {renderIcon()}
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Badge variant={getBadgeVariant()} className="mr-2">
                {getBadgeText()}
              </Badge>
              <span className="text-xs text-gray-400">
                {formatTimestamp(timestamp)}
              </span>
            </div>
            
            <div className="flex space-x-1">
              {!read && (
                <button 
                  className="text-gray-400 hover:text-indigo-400 transition-colors p-1" 
                  onClick={() => onMarkAsRead(id)}
                  aria-label="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
              <button 
                className="text-gray-400 hover:text-rose-400 transition-colors p-1" 
                onClick={() => onDismiss(id)}
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <p className="mt-1 text-sm text-gray-200">{message}</p>
          
          {actionLink && actionText && (
            <a 
              href={actionLink}
              className="mt-2 inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {actionText}
              <ArrowUpRight size={14} className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;