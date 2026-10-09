import React from 'react';
import { Park } from '../types/reservation';

interface Props {
  parks: Park[];
  selectedParkId: string | null;
  onSelect: (parkId: string) => void;
}

const ParkList: React.FC<Props> = ({ parks, selectedParkId, onSelect }) => {
  return (
    <div className="park-list">
      <h2>Available Parks & Recreation Areas</h2>
      <div className="park-grid">
        {parks.map((park) => (
          <div
            key={park.id}
            className={`park-card ${selectedParkId === park.id ? 'selected' : ''}`}
            onClick={() => onSelect(park.id)}
          >
            <h3>{park.name}</h3>
            <p className="park-desc">{park.description}</p>
            <p><strong>📍</strong> {park.address}</p>
            <p><strong>👥 Capacity:</strong> {park.capacity}</p>
            <div className="amenities">
              {park.amenities.map((a) => (
                <span key={a} className="amenity-tag">{a}</span>
              ))}
            </div>
            {selectedParkId === park.id && (
              <div className="selected-badge">✓ Selected</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkList;