import React from 'react';
import type { Reservation } from '../types';
import { formatDate } from '../utils/formatDate';
import { Badge } from './Badge';

interface DetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ reservation, onClose }) => {
  const rows: [string, string][] = [
    ['Reference Number', reservation.referenceNumber],
    ['Facility', reservation.facilityName],
    ['Date', formatDate(reservation.date)],
    ['Time', `${reservation.startTime} – ${reservation.endTime}`],
    ['Purpose', reservation.purpose],
    ['Participants', String(reservation.participants)],
    ['Notes', reservation.notes || '—'],
    ['Status', reservation.status],
    ['Created', new Date(reservation.createdAt).toLocaleString()],
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Reservation Details</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              color: '#6B7280',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '10px 0',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div style={{ width: '140px', fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>
                {label}
              </div>
              <div style={{ flex: 1, fontSize: '14px', color: '#111827' }}>
                {label === 'Status' ? <Badge status={reservation.status} /> : value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 24px 20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              background: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};