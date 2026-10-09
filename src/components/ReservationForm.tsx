import React, { useMemo, useState } from 'react';
import { TIME_SLOTS } from '../data/parks';
import { Park, Reservation, ReservationFormData } from '../types/reservation';
import { isSlotTaken } from '../utils/availability';
import TimeSlotPicker from './TimeSlotPicker';

interface Props {
  parks: Park[];
  reservations: Reservation[];
  selectedPark: Park | null;
  onParkSelect: (parkId: string) => void;
  onSubmit: (data: ReservationFormData) => void;
}

const ReservationForm: React.FC<Props> = ({
  parks,
  reservations,
  selectedPark,
  onParkSelect,
  onSubmit,
}) => {
  const [date, setDate] = useState<string>('');
  const [slotId, setSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>('');
  const [availabilityMessage, setAvailabilityMessage] = useState<{
    type: 'success' | 'error' | 'info' | null;
    text: string;
  }>({ type: null, text: '' });

  // Compute available slots dynamically whenever park/date changes
  const availableSlotIds = useMemo(() => {
    if (!selectedPark || !date) return TIME_SLOTS.map((s) => s.id);
    return TIME_SLOTS.filter(
      (slot) => !isSlotTaken(reservations, selectedPark.id, date, slot.id)
    ).map((s) => s.id);
  }, [selectedPark, date, reservations]);

  const today = new Date().toISOString().split('T')[0];

  const checkAvailability = (): boolean => {
    if (!selectedPark || !date || !slotId) {
      setAvailabilityMessage({
        type: 'error',
        text: 'Please select a park, date, and time slot first.',
      });
      return false;
    }
    const taken = isSlotTaken(reservations, selectedPark.id, date, slotId);
    if (taken) {
      setAvailabilityMessage({
        type: 'error',
        text: '⚠️ This time slot is already reserved. Please choose another schedule.',
      });
      return false;
    }
    setAvailabilityMessage({
      type: 'success',
      text: '✅ This schedule is available! You may submit your reservation.',
    });
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedPark) {
      setAvailabilityMessage({ type: 'error', text: 'Please select a park.' });
      return;
    }
    if (!date) {
      setAvailabilityMessage({ type: 'error', text: 'Please select a date.' });
      return;
    }
    if (!slotId) {
      setAvailabilityMessage({ type: 'error', text: 'Please select a time slot.' });
      return;
    }
    if (!purpose.trim()) {
      setAvailabilityMessage({
        type: 'error',
        text: 'Please enter the purpose of your reservation.',
      });
      return;
    }

    // Re-check availability before submit (critical: prevent double booking)
    if (isSlotTaken(reservations, selectedPark.id, date, slotId)) {
      setAvailabilityMessage({
        type: 'error',
        text: '⚠️ This slot was just reserved by someone else. Please pick another slot.',
      });
      setSlotId(null);
      return;
    }

    onSubmit({
      parkId: selectedPark.id,
      date,
      slotId,
      purpose: purpose.trim(),
    });

    // Reset form
    setDate('');
    setSlotId(null);
    setPurpose('');
    setAvailabilityMessage({ type: null, text: '' });
  };

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <h2>Make a Reservation</h2>

      <div className="form-group">
        <label>1. Select Location</label>
        <select
          value={selectedPark?.id ?? ''}
          onChange={(e) => {
            onParkSelect(e.target.value);
            setSlotId(null);
            setAvailabilityMessage({ type: null, text: '' });
          }}
        >
          <option value="">-- Choose a park --</option>
          {parks.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>2. Select Date</label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlotId(null);
            setAvailabilityMessage({ type: null, text: '' });
          }}
        />
      </div>

      {selectedPark && date && (
        <TimeSlotPicker
          slots={TIME_SLOTS}
          availableSlotIds={availableSlotIds}
          selectedSlotId={slotId}
          onSelect={(id) => {
            setSlotId(id);
            setAvailabilityMessage({ type: null, text: '' });
          }}
        />
      )}

      <div className="form-group">
        <label>4. Purpose of Reservation</label>
        <textarea
          rows={3}
          placeholder="e.g., Community picnic, Sports practice, Birthday party..."
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      {availabilityMessage.type && (
        <div className={`availability-msg ${availabilityMessage.type}`}>
          {availabilityMessage.text}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={checkAvailability}>
          Check Availability
        </button>
        <button type="submit" className="btn-primary">
          Submit Reservation
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;