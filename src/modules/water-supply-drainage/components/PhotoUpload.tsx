import React, { ChangeEvent, useRef } from 'react';

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  hasError?: boolean;
  errorMessage?: string;
}

const PhotoUpload: React.FC<Props> = ({ file, onChange, hasError, errorMessage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] ?? null);
  };

  const clearFile = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        id="photo"
        name="photo"
        accept="image/*"
        onChange={handleChange}
        style={{ padding: '0.5rem 0' }}
      />
      {file && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: '#eef4fb',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          <span>
            {file.name} — {(file.size / 1024).toFixed(1)} KB
          </span>
          <button
            type="button"
            onClick={clearFile}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#d32f2f',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Remove
          </button>
        </div>
      )}
      {hasError && errorMessage && (
        <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>{errorMessage}</span>
      )}
    </div>
  );
};

export default PhotoUpload;