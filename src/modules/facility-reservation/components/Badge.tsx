import React from 'react';
import type { ReservationStatus } from '../types';
import { getStatusColor } from '../utils/getStatusColor';

interface BadgeProps {
  status: ReservationStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      color: '#fff',
      backgroundColor: getStatusColor(status),
    }}
  >
    {status}
  </span>
);