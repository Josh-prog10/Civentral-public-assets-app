import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label htmlFor={htmlFor} style={{ fontWeight: 600, fontSize: '0.95rem', color: '#333' }}>
      {label} {required && <span style={{ color: '#d32f2f' }}>*</span>}
    </label>
    {children}
    {error && <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>{error}</span>}
  </div>
);

export default FormField;