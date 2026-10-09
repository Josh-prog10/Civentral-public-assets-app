import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  style,
  ...rest
}) => {
  const base: React.CSSProperties = {
    padding: '0.85rem 1.25rem',
    fontSize: '1rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, opacity 0.2s',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#1976d2', color: '#fff' },
    secondary: { backgroundColor: '#e0e0e0', color: '#333' },
  };

  return (
    <button
      {...rest}
      style={{ ...base, ...variants[variant], ...style }}
      disabled={rest.disabled}
    >
      {children}
    </button>
  );
};

export default Button;