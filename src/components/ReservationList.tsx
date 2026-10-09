import React from 'react';
import { Reservation } from '../types/reservation';

interface Props {
  reservations: Reservation[];
  onView: (id: string) => void;
}

const ReservationList: React.FC<Props> = ({ reservations, onView }) => {
  if (reservations.length === 0) {
    return <p className="empty">No reservations yet.</p>;
  }

  return (
    <div className="reservation-list">
      <h2>My Reservations</h2>
      <table>
        <thead>
          <tr>
            <th>Park</th>
            <th>Date</th>
            <th>Time</th>
            <th>Purpose</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.parkName}</td>
              <td>{r.date}</td>
              <td>{r.startTime} - {r.endTime}</td>
              <td>{r.purpose}</td>
              <td>
                <span className={`status-badge status-${r.status.toLowerCase()}`}>
                  {r.status}
                </span>
              </td>
              <td>
                <button className="btn-link" onClick={() => onView(r.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;