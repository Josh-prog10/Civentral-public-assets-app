import type { CSSProperties } from 'react';

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '13px',
  color: '#374151',
};

export const errorStyle: CSSProperties = {
  color: '#DC2626',
  fontSize: '12px',
  marginTop: '4px',
};

export const primaryButtonStyle: CSSProperties = {
  padding: '12px 32px',
  borderRadius: '8px',
  border: 'none',
  background: '#4F46E5',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
};

export const secondaryButtonStyle: CSSProperties = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  background: '#fff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  color: '#374151',
};