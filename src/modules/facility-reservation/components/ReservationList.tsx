import React, { useState, useMemo } from 'react';
import type { Reservation, ReservationStatus } from '../types';
import { formatDate } from '../utils/formatDate';
import { Badge } from './Badge';

interface ReservationListProps {
  reservations: Reservation[];
  onViewDetail: (r: Reservation) => void;
  onCancel: (id: string) => void;
  onModify: (r: Reservation) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({
  reservations,
  onViewDetail,
  onCancel,
  onModify,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.facilityName.toLowerCase().includes(search.toLowerCase()) ||
        r.purpose.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesDate = !dateFilter || r.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, search, statusFilter, dateFilter]);

  const canModifyOrCancel = (r: Reservation) =>
    r.status === 'Pending' || r.status === 'Confirmed';

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        My Facility Reservations
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
        }}
      >
        <input
          type="text"
          placeholder="Search by reference, facility, or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
            background: '#fff',
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
          }}
        />
        {(search || statusFilter !== 'All' || dateFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setDateFilter('');
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: '#6B7280',
            background: '#F9FAFB',
            borderRadius: '10px',
            border: '1px dashed #D1D5DB',
          }}
        >
          No reservations found matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: '#fff',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                    {r.facilityName}
                  </span>
                  <Badge status={r.status as ReservationStatus} />
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2px' }}>
                  <strong>Ref:</strong> {r.referenceNumber} &nbsp;|&nbsp;{' '}
                  <strong>Date:</strong> {formatDate(r.date)} &nbsp;|&nbsp;{' '}
                  <strong>Time:</strong> {r.startTime} – {r.endTime}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  <strong>Purpose:</strong> {r.purpose} &nbsp;|&nbsp;{' '}
                  <strong>Participants:</strong> {r.participants}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => onViewDetail(r)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #4F46E5',
                    background: '#fff',
                    color: '#4F46E5',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  View
                </button>
                {canModifyOrCancel(r) && (
                  <>
                    <button
                      onClick={() => onModify(r)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid #D97706',
                        background: '#fff',
                        color: '#D97706',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => onCancel(r.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: '1px solid #DC2626',
                        background: '#fff',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};