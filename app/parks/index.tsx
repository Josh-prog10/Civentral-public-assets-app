import { useTheme } from '@/src/context/ThemeContext';
import { PARKS, TIME_SLOTS } from '@/src/data/parks';
import { getParkReservations, saveParkReservations } from '@/src/services/civentralSqlDatabase';
import type { Reservation } from '@/src/types/reservation';
import { getAvailableSlots, isSlotTaken } from '@/src/utils/availability';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TODAY = new Date().toISOString().slice(0, 10);

export default function ParksIndexRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const colors = useMemo(
    () => ({
      background: isDarkMode ? '#101C24' : '#F4F7F5',
      surface: isDarkMode ? '#1A2A32' : '#FFFFFF',
      border: isDarkMode ? '#31444C' : '#DCE5E1',
      text: isDarkMode ? '#F2F7F4' : '#172B25',
      muted: isDarkMode ? '#B0C1BC' : '#62746D',
      green: isDarkMode ? '#71D0A1' : '#16764A',
      greenSoft: isDarkMode ? '#203D33' : '#E6F4EC',
      warningBg: isDarkMode ? '#2F3026' : '#FFF8E8',
      warningText: isDarkMode ? '#E8D9A9' : '#6D5A31',
      danger: '#DC2626',
    }),
    [isDarkMode]
  );

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedParkId, setSelectedParkId] = useState(PARKS[0]?.id ?? '');
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedSlotId, setSelectedSlotId] = useState(TIME_SLOTS[0]?.id ?? '');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    getParkReservations().then((rows) => {
      if (active) {
        setReservations(rows);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const selectedPark = useMemo(
    () => PARKS.find((park: (typeof PARKS)[number]) => park.id === selectedParkId) ?? PARKS[0],
    [selectedParkId]
  );

  const availableSlots = useMemo(
    () => getAvailableSlots(reservations, TIME_SLOTS, selectedParkId, selectedDate),
    [reservations, selectedDate, selectedParkId]
  );

  const userReservations = useMemo(
    () => reservations.filter((reservation) => reservation.userId === 'user-1'),
    [reservations]
  );

  useEffect(() => {
    if (!availableSlots.some((slot) => slot.id === selectedSlotId) && availableSlots.length > 0) {
      setSelectedSlotId(availableSlots[0].id);
    }
  }, [availableSlots, selectedSlotId]);

  const submitReservation = async () => {
    if (!selectedPark || !selectedDate || !selectedSlotId || !purpose.trim()) {
      setMessage({ type: 'error', text: 'Please select a park, date, time slot, and purpose.' });
      return;
    }

    const slot = TIME_SLOTS.find((item: (typeof TIME_SLOTS)[number]) => item.id === selectedSlotId);
    if (!slot) {
      setMessage({ type: 'error', text: 'The selected time slot is invalid.' });
      return;
    }

    if (isSlotTaken(reservations, selectedParkId, selectedDate, selectedSlotId)) {
      setMessage({ type: 'error', text: 'This park slot is already reserved. Please choose another time.' });
      return;
    }

    const nextReservation: Reservation = {
      id: `res-${Date.now()}`,
      parkId: selectedPark.id,
      parkName: selectedPark.name,
      date: selectedDate,
      slotId: selectedSlotId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      purpose: purpose.trim(),
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
      userId: 'user-1',
    };

    const nextReservations = [nextReservation, ...reservations];
    setReservations(nextReservations);
    await saveParkReservations(nextReservations);
    setMessage({
      type: 'success',
      text: `Reservation submitted successfully for ${selectedPark.name}.`,
    });
    setPurpose('');
    setSelectedSlotId(availableSlots[0]?.id ?? TIME_SLOTS[0]?.id ?? '');
  };

  const cancelReservation = async (reservationId: string) => {
    const nextReservations: Reservation[] = reservations.map((reservation) =>
      reservation.id === reservationId ? { ...reservation, status: 'Cancelled' as const } : reservation
    );
    setReservations(nextReservations);
    await saveParkReservations(nextReservations);
    setMessage({ type: 'info', text: 'Reservation cancelled successfully.' });
  };

  return (
    <ScrollView style={[styles.wrapper, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity style={[styles.backButton, { borderColor: colors.border }]} onPress={() => router.back()}>
            <Text style={[styles.backText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Parks & Recreation Scheduling</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.muted }]}>Reserve a public park or recreation area for your event, activity, or gathering.</Text>

        <View style={[styles.sectionTitleWrap, { backgroundColor: colors.greenSoft }]}> 
          <Text style={[styles.sectionTitle, { color: colors.green }]}>Select a location</Text>
        </View>

        <View style={styles.locationList}>
          {PARKS.map((park: (typeof PARKS)[number]) => {
            const selected = park.id === selectedParkId;
            return (
              <TouchableOpacity
                key={park.id}
                onPress={() => setSelectedParkId(park.id)}
                style={[
                  styles.parkCard,
                  {
                    backgroundColor: selected ? colors.greenSoft : colors.background,
                    borderColor: selected ? colors.green : colors.border,
                  },
                ]}
              >
                <Text style={[styles.parkName, { color: colors.text }]}>{park.name}</Text>
                <Text style={[styles.parkMeta, { color: colors.muted }]}>{park.address}</Text>
                <Text style={[styles.parkMeta, { color: colors.muted }]}>Capacity: {park.capacity}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.formGrid}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <TextInput
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Available time slots</Text>
          <View style={styles.slotWrap}>
            {availableSlots.length === 0 ? (
              <Text style={[styles.emptyState, { color: colors.muted }]}>No available slots for this date.</Text>
            ) : (
              availableSlots.map((slot) => {
                const selected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => setSelectedSlotId(slot.id)}
                    style={[
                      styles.slotButton,
                      {
                        backgroundColor: selected ? colors.green : colors.background,
                        borderColor: selected ? colors.green : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.slotText, { color: selected ? '#FFFFFF' : colors.text }]}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Purpose of reservation</Text>
          <TextInput
            value={purpose}
            onChangeText={setPurpose}
            placeholder="Community event, sports practice, etc."
            placeholderTextColor={colors.muted}
            style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            multiline
            numberOfLines={4}
          />
        </View>

        {message && (
          <View
            style={[
              styles.notice,
              {
                backgroundColor: message.type === 'success' ? colors.greenSoft : message.type === 'error' ? colors.warningBg : colors.background,
                borderColor: message.type === 'success' ? colors.green : message.type === 'error' ? colors.danger : colors.border,
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: message.type === 'success' ? colors.green : message.type === 'error' ? colors.danger : colors.text }]}>
              {message.text}
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.green }]} onPress={submitReservation} activeOpacity={0.9}>
          <Text style={styles.submitButtonText}>Submit reservation</Text>
        </TouchableOpacity>

        <View style={[styles.sectionTitleWrap, { backgroundColor: colors.background, marginTop: 18 }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My reservations</Text>
        </View>

        {userReservations.length === 0 ? (
          <Text style={[styles.emptyState, { color: colors.muted, marginTop: 10 }]}>No park reservations yet.</Text>
        ) : (
          userReservations.map((reservation) => (
            <View key={reservation.id} style={[styles.reservationCard, { backgroundColor: colors.background, borderColor: colors.border }]}> 
              <View style={styles.rowBetween}>
                <Text style={[styles.reservationTitle, { color: colors.text }]}>{reservation.parkName}</Text>
                <Text style={[styles.statusText, { color: reservation.status === 'Pending' ? colors.warningText : reservation.status === 'Cancelled' ? colors.danger : colors.green }]}>
                  {reservation.status}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: colors.muted }]}>{reservation.date} • {reservation.startTime} - {reservation.endTime}</Text>
              <Text style={[styles.metaText, { color: colors.muted }]}>{reservation.purpose}</Text>
              {reservation.status !== 'Cancelled' && (
                <TouchableOpacity style={[styles.cancelButton, { borderColor: colors.border }]} onPress={() => cancelReservation(reservation.id)}>
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  backButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { fontSize: 13, fontWeight: '700' },
  title: { flex: 1, fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  sectionTitleWrap: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  locationList: { gap: 10, marginBottom: 16 },
  parkCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  parkName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  parkMeta: { fontSize: 12, lineHeight: 18 },
  formGrid: { marginBottom: 12 },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, minHeight: 100, textAlignVertical: 'top', fontSize: 14 },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  slotText: { fontSize: 12, fontWeight: '700' },
  emptyState: { fontSize: 12, lineHeight: 18 },
  notice: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 12 },
  noticeText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  submitButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  reservationCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  reservationTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  metaText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  cancelButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: 10, alignSelf: 'flex-start' },
  cancelButtonText: { fontSize: 12, fontWeight: '700' },
});
