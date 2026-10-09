import React from 'react';

interface Props {
  type: 'success' | 'error';
  message: string;
  referenceId?: string;
}

const SubmitFeedback: React.FC<Props> = ({ type, message, referenceId }) => {
  const isSuccess = type === 'success';
  return (
    <div
      role="status"
      style={{
        padding: '0.85rem 1rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        textAlign: 'center',
        backgroundColor: isSuccess ? '#e8f5e9' : '#ffebee',
        color: isSuccess ? '#2e7d32' : '#c62828',
        border: `1px solid ${isSuccess ? '#a5d6a7' : '#ef9a9a'}`,
      }}
    >
      <div>{message}</div>
      {referenceId && (
        <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
          Reference ID: {referenceId}
        </div>
      )}
    </div>
  );
};

export default SubmitFeedback;