import { useTheme } from '@/src/context/ThemeContext';
import { LeafletPinMap } from '@/src/modules/water-supply-drainage/components/LeafletPinMap';
import {
    deleteEmployeeWaterRequest,
    getEmployeeWaterRequests,
    updateEmployeeWaterRequest,
    type EmployeeWaterRequestsResponse,
    type WaterRequestRecord,
} from '@/src/services/civentralModuleApi';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const REQUEST_STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'] as const;

const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function WaterDrainageAdminScreen() {
  const { isDarkMode } = useTheme();
  const [records, setRecords] = useState<WaterRequestRecord[]>([]);
  const [staff, setStaff] = useState<EmployeeWaterRequestsResponse['staff']>([]);
  const [canManage, setCanManage] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const colors = {
    background: isDarkMode ? '#101C24' : '#F3F7F6',
    surface: isDarkMode ? '#1A2A32' : '#FFFFFF',
    border: isDarkMode ? '#31444C' : '#DCE5E1',
    text: isDarkMode ? '#F2F7F4' : '#172B25',
    muted: isDarkMode ? '#B0C1BC' : '#62746D',
    primary: isDarkMode ? '#71D0A1' : '#16764A',
    primarySoft: isDarkMode ? '#203D33' : '#E6F4EC',
    warning: isDarkMode ? '#E8D9A9' : '#6D5A31',
  };

  const load = async () => {
    try {
      const response = await getEmployeeWaterRequests(filter === 'all' ? {} : { status: filter });
      setRecords(response.items);
      setCanManage(response.canManage);
      setStaff(response.staff);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load service requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [filter]);

  const updateRecord = async (record: WaterRequestRecord, action: 'status' | 'assign' | 'note', values: { status?: string; assigned_to?: number | null; note?: string }) => {
    setBusyId(record.id);
    try {
      const updated = await updateEmployeeWaterRequest(record.id, action, values);
      setRecords((current) => current.map((item) => item.id === record.id ? updated : item));
      setMessage('Request updated.');
      if (action === 'note') setNote('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update the request.');
    } finally {
      setBusyId(null);
    }
  };

  const removeRecord = (record: WaterRequestRecord) => {
    Alert.alert('Delete request?', 'This permanently removes the request and its attached files.', [
      { text: 'Keep request', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusyId(record.id);
          try {
            await deleteEmployeeWaterRequest(record.id);
            setRecords((current) => current.filter((item) => item.id !== record.id));
            setSelectedId(null);
            setMessage('Request deleted.');
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not delete the request.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const selectedRecord = records.find((record) => record.id === selectedId) ?? null;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Water & Drainage Requests</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Requests and status updates from the shared system.</Text>

      <View style={styles.filters}>
        {['all', ...REQUEST_STATUSES].map((status) => (
          <TouchableOpacity key={status} onPress={() => setFilter(status)} style={[styles.filter, { borderColor: filter === status ? colors.primary : colors.border, backgroundColor: filter === status ? colors.primarySoft : colors.surface }]}>
            <Text style={[styles.filterText, { color: filter === status ? colors.primary : colors.muted }]}>{status === 'all' ? 'All' : formatStatus(status)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {message && <Text accessibilityRole="alert" style={[styles.message, { color: colors.warning }]}>{message}</Text>}
      {isLoading && <Text style={{ color: colors.muted }}>Loading requests...</Text>}
      {!isLoading && records.length === 0 && <Text style={{ color: colors.muted }}>No requests found.</Text>}

      {records.map((record) => {
        const expanded = selectedId === record.id;
        const attachment = record.attachments?.[0];
        return (
          <TouchableOpacity key={record.id} activeOpacity={0.95} onPress={() => setSelectedId(expanded ? null : record.id)} style={[styles.record, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.recordHeader}>
              <View style={styles.recordTitleWrap}>
                <Text style={[styles.category, { color: colors.primary }]}>{record.category_name}</Text>
                <Text style={[styles.recordTitle, { color: colors.text }]}>{record.title}</Text>
              </View>
              <Text style={[styles.status, { color: colors.primary, backgroundColor: colors.primarySoft }]}>{formatStatus(record.status)}</Text>
            </View>
            <Text style={[styles.metadata, { color: colors.muted }]}>Request #{record.id} · {record.created_at}</Text>

            {expanded && (
              <View style={styles.details}>
                <Text style={[styles.detailText, { color: colors.text }]}>{record.description}</Text>
                <Text style={[styles.metadata, { color: colors.muted }]}>{record.location_text}</Text>
                {record.latitude != null && record.longitude != null && (
                  <>
                    <Text style={[styles.metadata, { color: colors.muted }]}>{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</Text>
                    <LeafletPinMap latitude={record.latitude} longitude={record.longitude} readOnly onCoordinateSelect={() => {}} />
                  </>
                )}
                {attachment?.url && <Image source={{ uri: attachment.url }} style={styles.attachment} />}
                <Text style={[styles.metadata, { color: colors.muted }]}>Staff remarks: {record.admin_notes || 'No staff remarks yet.'}</Text>

                {canManage && (
                  <View style={styles.managerSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Update status</Text>
                    <View style={styles.filters}>
                      {REQUEST_STATUSES.map((status) => (
                        <TouchableOpacity key={status} disabled={busyId === record.id} onPress={() => void updateRecord(record, 'status', { status })} style={[styles.filter, { borderColor: record.status === status ? colors.primary : colors.border, backgroundColor: record.status === status ? colors.primarySoft : colors.surface }]}>
                          <Text style={[styles.filterText, { color: record.status === status ? colors.primary : colors.muted }]}>{formatStatus(status)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Assign to staff</Text>
                    <View style={styles.filters}>
                      <TouchableOpacity disabled={busyId === record.id} onPress={() => void updateRecord(record, 'assign', { assigned_to: null })} style={[styles.filter, { borderColor: record.assigned_to == null ? colors.primary : colors.border, backgroundColor: record.assigned_to == null ? colors.primarySoft : colors.surface }]}>
                        <Text style={[styles.filterText, { color: colors.muted }]}>Unassigned</Text>
                      </TouchableOpacity>
                      {staff.map((member) => (
                        <TouchableOpacity key={member.id} disabled={busyId === record.id} onPress={() => void updateRecord(record, 'assign', { assigned_to: member.id })} style={[styles.filter, { borderColor: Number(record.assigned_to) === member.id ? colors.primary : colors.border, backgroundColor: Number(record.assigned_to) === member.id ? colors.primarySoft : colors.surface }]}>
                          <Text style={[styles.filterText, { color: colors.muted }]}>{member.full_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Staff note</Text>
                    <TextInput value={note} onChangeText={setNote} placeholder="Add an update for the requester" placeholderTextColor={colors.muted} style={[styles.noteInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} />
                    <TouchableOpacity disabled={busyId === record.id || !note.trim()} onPress={() => void updateRecord(record, 'note', { note: note.trim() })} style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Text style={styles.actionButtonText}>{busyId === record.id ? 'Saving...' : 'Add note'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={busyId === record.id} onPress={() => removeRecord(record)} style={[styles.actionButton, styles.deleteButton]}>
                      <Text style={styles.actionButtonText}>Delete request</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  filterText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 13, fontWeight: '700' },
  record: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  recordHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  recordTitleWrap: { flex: 1, gap: 3 },
  category: { fontSize: 11, fontWeight: '800' },
  recordTitle: { fontSize: 15, fontWeight: '700' },
  status: { borderRadius: 12, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  metadata: { fontSize: 12, lineHeight: 17 },
  details: { gap: 9, marginTop: 8 },
  detailText: { fontSize: 13, lineHeight: 20 },
  attachment: { height: 180, width: '100%', borderRadius: 8 },
  managerSection: { borderTopWidth: 1, borderTopColor: '#DCE5E1', paddingTop: 12, gap: 9 },
  sectionTitle: { fontSize: 13, fontWeight: '800' },
  noteInput: { minHeight: 42, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  actionButton: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  actionButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  deleteButton: { backgroundColor: '#B42318' },
});
