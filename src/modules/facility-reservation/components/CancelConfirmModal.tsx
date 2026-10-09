import React from 'react';

interface CancelConfirmModalProps {
  onKeep: () => void;
  onConfirm: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({ onKeep, onConfirm }) => (
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
    onClick={onKeep}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: '#fff',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
        Cancel Reservation?
      </h3>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
        This action cannot be undone. The reservation will be marked as cancelled.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onKeep}
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
          Keep
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#DC2626',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
);