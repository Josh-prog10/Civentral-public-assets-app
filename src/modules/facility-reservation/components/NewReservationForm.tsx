import React, { useState } from 'react';
import type { Reservation } from '../types';
import { FACILITIES } from '../data/mockData';
import { generateReference } from '../utils/generateReference';
import { formatDate } from '../utils/formatDate';
import { inputStyle, labelStyle, errorStyle, primaryButtonStyle, secondaryButtonStyle } from '../styles/sharedStyles';

interface NewReservationFormProps {
  reservations: Reservation[];
  onSubmit: (r: Reservation) => void;
  editingReservation?: Reservation | null;
}

export const NewReservationForm: React.FC<NewReservationFormProps> = ({
  reservations,
  onSubmit,
  editingReservation,
}) => {
  const [step, setStep] = useState<'form' | 'review' | 'confirmation'>('form');

  const [facilityId, setFacilityId] = useState(editingReservation?.facilityId ?? '');
  const [date, setDate] = useState(editingReservation?.date ?? '');
  const [startTime, setStartTime] = useState(editingReservation?.startTime ?? '');
  const [endTime, setEndTime] = useState(editingReservation?.endTime ?? '');
  const [purpose, setPurpose] = useState(editingReservation?.purpose ?? '');
  const [participants, setParticipants] = useState(editingReservation?.participants ?? 0);
  const [notes, setNotes] = useState(editingReservation?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedRef, setConfirmedRef] = useState('');

  const selectedFacility = FACILITIES.find((f) => f.id === facilityId);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!facilityId) errs.facilityId = 'Please select a facility.';
    if (!date) errs.date = 'Please select a date.';
    if (!startTime) errs.startTime = 'Please select a start time.';
    if (!endTime) errs.endTime = 'Please select an end time.';
    if (startTime && endTime && startTime >= endTime)
      errs.endTime = 'End time must be after start time.';
    if (!purpose.trim()) errs.purpose = 'Please enter a purpose.';
    if (participants <= 0) errs.participants = 'Number of participants must be greater than 0.';
    if (selectedFacility && participants > selectedFacility.capacity)
      errs.participants = `Exceeds facility capacity of ${selectedFacility.capacity}.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep('review');
  };

  const handleSubmit = () => {
    const ref = editingReservation?.referenceNumber ?? generateReference(reservations.length);
    const newRes: Reservation = {
      id: editingReservation?.id ?? `r${Date.now()}`,
      referenceNumber: ref,
      facilityId,
      facilityName: selectedFacility?.name ?? '',
      date,
      startTime,
      endTime,
      purpose,
      participants,
      notes,
      status: 'Pending',
      createdAt: editingReservation?.createdAt ?? new Date().toISOString(),
    };
    onSubmit(newRes);
    setConfirmedRef(ref);
    setStep('confirmation');
  };

  const resetForm = () => {
    setFacilityId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setParticipants(0);
    setNotes('');
    setErrors({});
    setConfirmedRef('');
    setStep('form');
  };

  // ── Confirmation Screen ──
  if (step === 'confirmation') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          background: '#F0FDF4',
          borderRadius: '12px',
          border: '1px solid #BBF7D0',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
          Reservation Submitted!
        </h2>
        <p style={{ color: '#15803D', marginBottom: '24px', fontSize: '15px' }}>
          Your facility reservation has been successfully created and is pending approval.
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: '#fff',
            borderRadius: '10px',
            border: '2px dashed #16A34A',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
            RESERVATION REFERENCE NUMBER
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534', letterSpacing: '1px' }}>
            {confirmedRef}
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          Please save this reference number for your records.
        </div>
        <button onClick={resetForm} style={{ ...primaryButtonStyle, background: '#16A34A' }}>
          Create Another Reservation
        </button>
      </div>
    );
  }

  // ── Review Screen ──
  if (step === 'review') {
    const rows: [string, string][] = [
      ['Facility', selectedFacility?.name ?? ''],
      ['Location', selectedFacility?.location ?? ''],
      ['Date', formatDate(date)],
      ['Time', `${startTime} – ${endTime}`],
      ['Purpose', purpose],
      ['Participants', String(participants)],
      ['Notes', notes || '—'],
    ];

    return (
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
          Review Reservation Details
        </h2>
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {rows.map(([label, value], i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '14px 20px',
                borderBottom: i < rows.length - 1 ? '1px solid #E5E7EB' : 'none',
                background: i % 2 === 0 ? '#fff' : '#F9FAFB',
              }}
            >
              <div style={{ width: '160px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                {label}
              </div>
              <div style={{ flex: 1, color: '#111827', fontSize: '14px' }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setStep('form')} style={secondaryButtonStyle}>
            ← Edit Details
          </button>
          <button onClick={handleSubmit} style={primaryButtonStyle}>
            Submit Reservation
          </button>
        </div>
      </div>
    );
  }

  // ── Form Screen ──
  return (
    <form onSubmit={handleReview}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
        {editingReservation ? 'Modify Reservation' : 'New Facility Reservation'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={labelStyle}>Facility *</label>
          <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} style={inputStyle}>
            <option value="">— Select a facility —</option>
            {FACILITIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.type}) — Capacity: {f.capacity}
              </option>
            ))}
          </select>
          {selectedFacility && (
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              📍 {selectedFacility.location} &nbsp;|&nbsp; 👥 Max capacity: {selectedFacility.capacity}
            </div>
          )}
          {errors.facilityId && <div style={errorStyle}>{errors.facilityId}</div>}
        </div>

        <div>
          <label style={labelStyle}>Date *</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
          {errors.date && <div style={errorStyle}>{errors.date}</div>}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Start Time *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={inputStyle}
            />
            {errors.startTime && <div style={errorStyle}>{errors.startTime}</div>}
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>End Time *</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={inputStyle}
            />
            {errors.endTime && <div style={errorStyle}>{errors.endTime}</div>}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Purpose *</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g., Team meeting, Training session, Community event"
            style={inputStyle}
          />
          {errors.purpose && <div style={errorStyle}>{errors.purpose}</div>}
        </div>

        <div>
          <label style={labelStyle}>Number of Participants *</label>
          <input
            type="number"
            min={1}
            value={participants || ''}
            onChange={(e) => setParticipants(Number(e.target.value))}
            placeholder="Enter expected number of attendees"
            style={inputStyle}
          />
          {errors.participants && <div style={errorStyle}>{errors.participants}</div>}
        </div>

        <div>
          <label style={labelStyle}>Notes / Additional Information</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests, equipment needs, or additional information..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button type="submit" style={primaryButtonStyle}>
          Review Reservation →
        </button>
      </div>
    </form>
  );
};