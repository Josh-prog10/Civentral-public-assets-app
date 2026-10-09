import React from 'react';
import { TimeSlot } from '../types/reservation';

interface Props {
  slots: TimeSlot[];
  availableSlotIds: string[];
  selectedSlotId: string | null;
  onSelect: (slotId: string) => void;
}

const TimeSlotPicker: React.FC<Props> = ({
  slots,
  availableSlotIds,
  selectedSlotId,
  onSelect,
}) => {
  return (
    <div className="time-slot-picker">
      <h3>Select a Time Slot</h3>
      <div className="slot-grid">
        {slots.map((slot) => {
          const available = availableSlotIds.includes(slot.id);
          const selected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={!available}
              className={`slot-btn ${selected ? 'selected' : ''} ${
                !available ? 'taken' : ''
              }`}
              onClick={() => onSelect(slot.id)}
              title={!available ? 'Already reserved' : 'Available'}
            >
              {slot.startTime} - {slot.endTime}
              <span className="slot-status">
                {available ? 'Available' : 'Reserved'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;