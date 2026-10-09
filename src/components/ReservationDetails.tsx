import React from 'react';
import { Reservation } from '../types/reservation';

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  onCancel: (id: string) => void;
  onModify: (id: string) => void;
}

const ReservationDetails: React.FC<Props> = ({
  reservation,
  onClose,
  onCancel,
  onModify,
}) => {
  if (!reservation) return null;

  const canModifyOrCancel =
    reservation.status === 'Pending' || reservation.status === 'Approved';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Reservation Details</h2>
        <div className="details-grid">
          <div><strong>Reservation ID:</strong> {reservation.id}</div>
          <div><strong>Park:</strong> {reservation.parkName}</div>
          <div><strong>Date:</strong> {reservation.date}</div>
          <div><strong>Time:</strong> {reservation.startTime} - {reservation.endTime}</div>
          <div><strong>Purpose:</strong> {reservation.purpose}</div>
          <div>
            <strong>Status:</strong>{' '}
            <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
              {reservation.status}
            </span>
          </div>
          <div><strong>Created:</strong> {new Date(reservation.createdAt).toLocaleString()}</div>
        </div>

        <div className="modal-actions">
          {canModifyOrCancel && (
            <>
              <button className="btn-warning" onClick={() => onModify(reservation.id)}>
                Modify
              </button>
              <button className="btn-danger" onClick={() => onCancel(reservation.id)}>
                Cancel Reservation
              </button>
            </>
          )}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;