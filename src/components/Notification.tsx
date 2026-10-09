import React, { useEffect } from 'react';
import { Notification } from '../types/reservation';

interface Props {
  notification: Notification | null;
  onDismiss: () => void;
}

const NotificationBanner: React.FC<Props> = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (notification) {
      const t = setTimeout(onDismiss, 4000);
      return () => clearTimeout(t);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      <span>{notification.message}</span>
      <button onClick={onDismiss}>✕</button>
    </div>
  );
};

export default NotificationBanner;