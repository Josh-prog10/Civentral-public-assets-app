import React from 'react';
import { CATEGORIES } from '../constants/categories';
import type { Category } from '../types';

interface Props {
  value: Category | '';
  onChange: (value: Category) => void;
  hasError?: boolean;
}

const CategorySelect: React.FC<Props> = ({ value, onChange, hasError }) => (
  <select
    id="category"
    name="category"
    value={value}
    onChange={(e) => onChange(e.target.value as Category)}
    style={{
      padding: '0.75rem',
      fontSize: '1rem',
      borderRadius: '6px',
      border: `1px solid ${hasError ? '#d32f2f' : '#ccc'}`,
      outline: 'none',
      background: '#fff',
    }}
  >
    <option value="">Select a category</option>
    {CATEGORIES.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
);

export default CategorySelect;