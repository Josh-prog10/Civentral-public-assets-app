import React, { useMemo, useState } from 'react';
import './App.css';

import { PARKS, SEED_RESERVATIONS, TIME_SLOTS } from './data/parks';
import {
  Notification,
  Reservation,
  ReservationFormData,
  ReservationStatus,
} from './types/reservation';
import { generateId } from './utils/availability';

import NotificationBanner from './components/Notification';
import ParkList from './components/ParkList';
import ReservationDetails from './components/ReservationDetails';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';

// 👇 NEW: Water Supply & Drainage module
import { WaterSupplyDrainagePage } from './modules/water-supply-drainage';

const CURRENT_USER = 'user-1';

// 👇 NEW: Module identifier type
type ActiveModule = 'parks' | 'water';

const App: React.FC = () => {
  // 👇 NEW: Track which module is active
  const [activeModule, setActiveModule] = useState<ActiveModule>('parks');

  // --- Parks module state (unchanged) ---
  const [reservations, setReservations] = useState<Reservation[]>(SEED_RESERVATIONS);
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  const [viewingReservationId, setViewingReservationId] = useState<string | null>(null);
  const [modifyingReservationId, setModifyingReservationId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const selectedPark = useMemo(
    () => PARKS.find((p) => p.id === selectedParkId) ?? null,
    [selectedParkId]
  );

  const viewingReservation = useMemo(
    () => reservations.find((r) => r.id === viewingReservationId) ?? null,
    [reservations, viewingReservationId]
  );

  const notify = (message: string, type: Notification['type']) => {
    setNotification({
      id: generateId('notif'),
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSubmit = (data: ReservationFormData) => {
    const park = PARKS.find((p) => p.id === data.parkId);
    const slot = TIME_SLOTS.find((s) => s.id === data.slotId);
    if (!park || !slot) return;

    // Final conflict check
    const conflict = reservations.some(
      (r) =>
        r.parkId === data.parkId &&
        r.date === data.date &&
        r.slotId === data.slotId &&
        (r.status === 'Pending' || r.status === 'Approved')
    );

    if (conflict) {
      notify('⚠️ This slot is no longer available. Please choose another.', 'error');
      return;
    }

    const newReservation: Reservation = {
      id: generateId('res'),
      parkId: park.id,
      parkName: park.name,
      date: data.date,
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      purpose: data.purpose,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      userId: CURRENT_USER,
    };

    setReservations((prev) => [newReservation, ...prev]);
    notify('✅ Reservation submitted! Status: Pending approval.', 'success');
  };

  const handleCancel = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Cancelled' as ReservationStatus } : r
      )
    );
    notify('Reservation cancelled.', 'info');
    setViewingReservationId(null);
  };

  const handleModify = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return;
    // Load into form flow: select park and let user pick new date/slot
    setSelectedParkId(res.parkId);
    setModifyingReservationId(id);
    setViewingReservationId(null);
    notify('You may now select a new date and time for this reservation.', 'info');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌳 Parks & Recreation Scheduling</h1>
        <p>Reserve parks and recreation areas with real-time availability.</p>
      </header>

      {/* 👇 NEW: Module switcher tabs */}
      <nav style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveModule('parks')}
          style={{
            ...styles.tab,
            ...(activeModule === 'parks' ? styles.tabActive : {}),
          }}
        >
          🌳 Parks & Recreation
        </button>
        <button
          type="button"
          onClick={() => setActiveModule('water')}
          style={{
            ...styles.tab,
            ...(activeModule === 'water' ? styles.tabActive : {}),
          }}
        >
          💧 Water Supply & Drainage
        </button>
      </nav>

      {/* 👇 NEW: Conditional rendering based on active module */}
      {activeModule === 'parks' ? (
        <>
          <NotificationBanner
            notification={notification}
            onDismiss={() => setNotification(null)}
          />

          <main>
            <section className="section">
              <ParkList
                parks={PARKS}
                selectedParkId={selectedParkId}
                onSelect={setSelectedParkId}
              />
            </section>

            <section className="section">
              <ReservationForm
                parks={PARKS}
                reservations={reservations}
                selectedPark={selectedPark}
                onParkSelect={setSelectedParkId}
                onSubmit={handleSubmit}
              />
            </section>

            <section className="section">
              <ReservationList
                reservations={reservations.filter((r) => r.userId === CURRENT_USER)}
                onView={setViewingReservationId}
              />
            </section>
          </main>

          <ReservationDetails
            reservation={viewingReservation}
            onClose={() => setViewingReservationId(null)}
            onCancel={handleCancel}
            onModify={handleModify}
          />
        </>
      ) : (
        <main>
          <WaterSupplyDrainagePage />
        </main>
      )}
    </div>
  );
};

// 👇 NEW: Inline styles for the tab navigation
const styles: { [key: string]: React.CSSProperties } = {
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0 1.5rem 1rem',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.65rem 1.25rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px 6px 0 0',
    background: '#f0f0f0',
    color: '#555',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
  tabActive: {
    background: '#1976d2',
    color: '#fff',
  },
};

export default App;