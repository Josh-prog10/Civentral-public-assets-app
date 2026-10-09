import { useTheme } from '@/src/context/ThemeContext';
import {
    checkLguReservationAvailability,
    createLguReservation,
    deleteLguReservation,
    getLguFacilities,
    getLguReservations,
    updateLguReservationStatus,
    type LguFacilityRecord,
    type LguReservationRecord,
} from '@/src/services/civentralModuleApi';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ReservationStatus = LguReservationRecord['status'];
const RESERVATION_STATUSES: ReservationStatus[] = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];

const formatDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (value: Date) => `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;

const dateFromValue = (value: string, fallback = new Date()) => {
  if (!value) return fallback;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const timeFromValue = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  const result = new Date();
  result.setHours(hours || 0, minutes || 0, 0, 0);
  return result;
};

const formatReservationStatus = (status: ReservationStatus) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatPaymentStatus = (status: LguReservationRecord['payment_status']) =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function FacilitiesReservationSystem() {
  const { isDarkMode } = useTheme();
  const [reservations, setReservations] = useState<LguReservationRecord[]>([]);
  const [facilities, setFacilities] = useState<LguFacilityRecord[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [datePicker, setDatePicker] = useState<'date' | 'start' | 'end' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getLguReservations(), getLguFacilities()])
      .then(([reservationResponse, facilityResponse]) => {
        if (!isMounted) return;
        setReservations(reservationResponse.items);
        setFacilities(facilityResponse.items);
        setCanManage(reservationResponse.canManage);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load reservations right now. Please try again.'))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  const [facilityId, setFacilityId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const colors = useMemo(
    () => ({
      background: isDarkMode ? '#101C24' : '#F4F7F5',
      surface: isDarkMode ? '#1A2A32' : '#FFFFFF',
      border: isDarkMode ? '#31444C' : '#DCE5E1',
      text: isDarkMode ? '#F2F7F4' : '#172B25',
      muted: isDarkMode ? '#B0C1BC' : '#62746D',
      green: isDarkMode ? '#71D0A1' : '#16764A',
      greenSoft: isDarkMode ? '#203D33' : '#E6F4EC',
      blue: '#2563EB',
      danger: '#DC2626',
      warningBg: isDarkMode ? '#2F3026' : '#FFF8E8',
      warningText: isDarkMode ? '#E8D9A9' : '#6D5A31',
    }),
    [isDarkMode]
  );

  const selectedFacility = facilities.find((facility) => String(facility.id) === facilityId);
  const filteredReservations = reservations.filter((reservation) => {
    const reference = reservation.receipt_number ?? `FRS-${String(reservation.id).padStart(6, '0')}`;
    const matchesQuery =
      searchQuery.trim().length === 0 ||
      reservation.facility_name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      reservation.purpose.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      reference.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const selectedReservation = reservations.find((reservation) => reservation.id === selectedReservationId) ?? null;

  const refreshReservations = async () => {
    const response = await getLguReservations();
    setReservations(response.items);
    setCanManage(response.canManage);
  };

  const setReservationStatus = async (id: number, status: ReservationStatus) => {
    try {
      await updateLguReservationStatus(id, status);
      await refreshReservations();
      setMessage('Reservation status updated.');
      setSelectedReservationId(id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update reservation status.');
    }
  };

  const removeReservation = async (id: number) => {
    try {
      await deleteLguReservation(id);
      await refreshReservations();
      setSelectedReservationId(null);
      setMessage('Reservation deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete the reservation.');
    }
  };

  const reservationDateTime = (time: string) => `${date} ${time}:00`;

  const checkAvailability = async () => {
    if (!selectedFacility || !date || !startTime || !endTime || startTime >= endTime) {
      setMessage('Select a facility, date, start time, and end time before checking availability.');
      setAvailability(null);
      return;
    }
    setIsCheckingAvailability(true);
    try {
      const result = await checkLguReservationAvailability({
        facility_id: selectedFacility.id,
        start_datetime: reservationDateTime(startTime),
        end_datetime: reservationDateTime(endTime),
      });
      setAvailability(result.available);
      setMessage(result.available ? 'This facility and time are available.' : 'This facility is already reserved during that time.');
    } catch (error) {
      setAvailability(null);
      setMessage(error instanceof Error ? error.message : 'Unable to check availability right now.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const submitReservation = async () => {
    if (!facilityId || !date || !startTime || !endTime || !purpose.trim()) {
      setMessage('Please select a place, date, start and end time, and enter the purpose.');
      return;
    }
    if (!selectedFacility) {
      setMessage('The selected facility is no longer available. Refresh the list and choose another.');
      return;
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      setMessage('Choose a valid date today or later.');
      return;
    }
    if (startTime >= endTime) {
      setMessage('The end time must be later than the start time.');
      return;
    }
    try {
      const created = await createLguReservation({
        facility_id: selectedFacility.id,
        purpose: purpose.trim(),
        description: notes.trim(),
        start_datetime: reservationDateTime(startTime),
        end_datetime: reservationDateTime(endTime),
      });
      await refreshReservations();
      setMessage(`Reservation submitted successfully. Status: ${created.status}.`);
      setFacilityId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setNotes('');
      setAvailability(null);
      setActiveTab('list');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the reservation. Please try again.');
    }
  };

  const handleDateTimeChange = (event: DateTimePickerEvent, value?: Date) => {
    const pickerType = datePicker;
    setDatePicker(null);
    if (event.type !== 'set' || !value || !pickerType) return;
    if (pickerType === 'date') {
      setDate(formatDate(value));
      setAvailability(null);
      return;
    }
    if (pickerType === 'start') setStartTime(formatTime(value));
    if (pickerType === 'end') setEndTime(formatTime(value));
    setAvailability(null);
  };

  return (
    <ScrollView style={[styles.wrapper, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Facilities Reservation System</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Book a city facility for meetings, events, and community use.</Text>

        <View style={[styles.tabBar, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <TouchableOpacity
            onPress={() => setActiveTab('list')}
            style={[styles.tab, activeTab === 'list' && { backgroundColor: colors.greenSoft, borderColor: colors.green }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'list' ? colors.green : colors.muted }]}>My reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('new')}
            style={[styles.tab, activeTab === 'new' && { backgroundColor: colors.greenSoft, borderColor: colors.green }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'new' ? colors.green : colors.muted }]}>New reservation</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchRow, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reservations or purpose"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <View style={styles.filterRow}> 
          {(['all', ...RESERVATION_STATUSES] as const).map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setStatusFilter(option)}
              style={[
                styles.filterChip,
                { borderColor: colors.border, backgroundColor: statusFilter === option ? colors.greenSoft : colors.surface },
              ]}
            >
              <Text style={[styles.filterChipText, { color: statusFilter === option ? colors.green : colors.muted }]}>
                {option === 'all' ? 'All' : formatReservationStatus(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'list' ? (
          <View style={styles.listWrap}>
            {message && (
              <View style={[styles.notice, { backgroundColor: colors.greenSoft, borderColor: colors.green }]}> 
                <Text style={[styles.noticeText, { color: colors.green }]}>{message}</Text>
              </View>
            )}
            {isLoading && <Text style={[styles.emptyStateText, { color: colors.muted }]}>Loading reservations...</Text>}
            {filteredReservations.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                onPress={() => setSelectedReservationId(reservation.id)}
                style={[styles.reservationCard, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.facilityName, { color: colors.text }]}>{reservation.facility_name}</Text>
                  <View style={[styles.badge, { backgroundColor: reservation.status === 'approved' ? colors.greenSoft : reservation.status === 'pending' ? colors.warningBg : colors.background }]}>
                    <Text style={[styles.badgeText, { color: reservation.status === 'approved' ? colors.green : reservation.status === 'pending' ? colors.warningText : colors.muted }]}>{formatReservationStatus(reservation.status)}</Text>
                  </View>
                </View>
                <Text style={[styles.metaText, { color: colors.muted }]}>{reservation.receipt_number || `FRS-${String(reservation.id).padStart(6, '0')}`}</Text>
                <Text style={[styles.metaText, { color: colors.muted }]}>{reservation.start_datetime.replace('T', ' ')} - {reservation.end_datetime.slice(11, 16)}</Text>
                <Text style={[styles.metaText, { color: colors.muted }]}>{reservation.purpose}</Text>

                {selectedReservationId === reservation.id && selectedReservation && (
                  <View style={[styles.detailBox, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                    <Text style={[styles.detailTitle, { color: colors.text }]}>Reservation details</Text>
                    <Text style={[styles.detailText, { color: colors.muted }]}>Reserved for: {selectedReservation.user_name}</Text>
                    <Text style={[styles.detailText, { color: colors.muted }]}>Payment: {formatPaymentStatus(selectedReservation.payment_status)}</Text>
                    <Text style={[styles.detailText, { color: colors.muted }]}>Description: {selectedReservation.description || 'None'}</Text>

                    {canManage && (
                      <View style={styles.managerActions}>
                        <Text style={[styles.detailTitle, { color: colors.text }]}>Manage status</Text>
                        <View style={styles.filterRow}>
                          {RESERVATION_STATUSES.map((status) => (
                            <TouchableOpacity key={status} onPress={() => void setReservationStatus(selectedReservation.id, status)} style={[styles.filterChip, { borderColor: colors.border, backgroundColor: selectedReservation.status === status ? colors.greenSoft : colors.surface }]}>
                              <Text style={[styles.filterChipText, { color: selectedReservation.status === status ? colors.green : colors.muted }]}>{formatReservationStatus(status)}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={() => void removeReservation(selectedReservation.id)} style={[styles.smallAction, { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.smallActionText, { color: colors.danger }]}>Delete reservation</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {filteredReservations.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <Text style={[styles.emptyStateText, { color: colors.muted }]}>No reservations match your current search or filter.</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.formWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Available facilities *</Text>
            <View style={styles.fieldWrap}>
              {facilities.map((facility) => (
                <TouchableOpacity
                  key={facility.id}
                  onPress={() => setFacilityId(String(facility.id))}
                  style={[
                    styles.option,
                    { borderColor: facilityId === String(facility.id) ? colors.green : colors.border, backgroundColor: facilityId === String(facility.id) ? colors.greenSoft : colors.surface },
                  ]}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{facility.name}</Text>
                  <Text style={[styles.optionMeta, { color: colors.muted }]}>{facility.type.replace(/_/g, ' ')} · Capacity: {facility.capacity} · {facility.location}</Text>
                </TouchableOpacity>
              ))}
              {facilities.length === 0 && <Text style={[styles.emptyStateText, { color: colors.muted }]}>No active facilities are available.</Text>}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
            <TouchableOpacity onPress={() => setDatePicker('date')} style={[styles.input, styles.pickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.pickerButtonText, { color: date ? colors.text : colors.muted }]}>{date || 'Choose a date'}</Text>
            </TouchableOpacity>

            <View style={styles.rowTwo}>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text }]}>Start time *</Text>
                <TouchableOpacity onPress={() => setDatePicker('start')} style={[styles.input, styles.pickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.pickerButtonText, { color: startTime ? colors.text : colors.muted }]}>{startTime || 'Choose time'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={[styles.label, { color: colors.text }]}>End time *</Text>
                <TouchableOpacity onPress={() => setDatePicker('end')} style={[styles.input, styles.pickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.pickerButtonText, { color: endTime ? colors.text : colors.muted }]}>{endTime || 'Choose time'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => void checkAvailability()} disabled={isCheckingAvailability} style={[styles.availabilityButton, { borderColor: colors.green, backgroundColor: colors.greenSoft }]}>
              <Text style={[styles.smallActionText, { color: colors.green }]}>{isCheckingAvailability ? 'Checking availability...' : 'Check availability'}</Text>
            </TouchableOpacity>
            {availability != null && (
              <Text style={[styles.availabilityText, { color: availability ? colors.green : colors.danger }]}>
                {availability ? 'Available for this time' : 'Already reserved for this time'}
              </Text>
            )}

            <Text style={[styles.label, { color: colors.text }]}>Purpose *</Text>
            <TextInput value={purpose} onChangeText={setPurpose} placeholder="Town hall meeting" placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} />

            <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="Add extra details or equipment" placeholderTextColor={colors.muted} multiline numberOfLines={4} style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} />

            {message && (
              <View style={[styles.notice, { backgroundColor: colors.warningBg, borderColor: colors.warningText }]}> 
                <Text style={[styles.noticeText, { color: colors.warningText }]}>{message}</Text>
              </View>
            )}

            <TouchableOpacity onPress={submitReservation} style={[styles.submitButton, { backgroundColor: colors.green }]} activeOpacity={0.9}>
              <Text style={styles.submitButtonText}>Submit reservation</Text>
            </TouchableOpacity>
          </View>
        )}

        {datePicker && (
          <DateTimePicker
            value={datePicker === 'date' ? dateFromValue(date) : timeFromValue(datePicker === 'start' ? startTime : endTime)}
            mode={datePicker === 'date' ? 'date' : 'time'}
            display={datePicker === 'date' ? 'calendar' : 'default'}
            minimumDate={datePicker === 'date' ? new Date() : undefined}
            onChange={handleDateTimeChange}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchRow: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    minHeight: 42,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addFacilityBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  pickerButton: {
    justifyContent: 'center',
    minHeight: 44,
  },
  pickerButtonText: {
    fontSize: 14,
  },
  tabText: { fontSize: 13, fontWeight: '700' },
  listWrap: { gap: 12 },
  reservationCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  facilityName: { fontSize: 16, fontWeight: '700', flex: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  metaText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  formWrap: { gap: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  fieldWrap: { gap: 10 },
  option: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  detailBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  detailTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  detailText: { fontSize: 12, lineHeight: 18 },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  managerActions: {
    marginTop: 12,
    gap: 10,
  },
  availabilityButton: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  smallAction: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  smallActionText: { fontSize: 12, fontWeight: '700' },
  emptyState: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  emptyStateText: { fontSize: 13, textAlign: 'center' },
  notice: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  noticeText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  optionText: { fontSize: 14, fontWeight: '700' },
  optionMeta: { fontSize: 12, marginTop: 4 },
  rowTwo: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#16764A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});