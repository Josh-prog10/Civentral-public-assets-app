import { useTheme } from '@/src/context/ThemeContext';
import {
    getMyWaterRequests,
    getWaterRequestCategories,
    submitWaterRequest,
    type WaterCategoryRecord,
    type WaterRequestRecord,
} from '@/src/services/civentralModuleApi';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LeafletPinMap } from '../components/LeafletPinMap';

const initialForm: {
  category: number | null;
  place: string;
  description: string;
  photoNote: string;
  latitude: number | null;
  longitude: number | null;
  photoUri: string | null;
} = {
  category: null,
  place: '',
  description: '',
  photoNote: '',
  latitude: null,
  longitude: null,
  photoUri: null,
};

const CALOOCAN_REGION = {
  latitude: 14.71,
  longitude: 121.015,
  latitudeDelta: 0.15,
  longitudeDelta: 0.16,
};

const getAddressLabel = (address: Location.LocationGeocodedAddress) =>
  [address.name, address.street, address.district, address.city, address.region]
    .filter(Boolean)
    .join(', ');

const isCaloocanAddress = (address: Location.LocationGeocodedAddress) =>
  [address.city, address.district, address.subregion, address.region, address.formattedAddress]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes('caloocan');

export default function WaterSupplyDrainagePage() {
  const { isDarkMode } = useTheme();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [requests, setRequests] = useState<WaterRequestRecord[]>([]);
  const [categories, setCategories] = useState<WaterCategoryRecord[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [placeLookupStatus, setPlaceLookupStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
  const [placeLookupMessage, setPlaceLookupMessage] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    referenceId: string;
    category: string;
    place: string;
    latitude: number;
    longitude: number;
    photoUri: string;
    status: string;
    submittedAt: string;
  } | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const placeLookupSequence = useRef(0);
  const skipNextPlaceLookup = useRef(false);

  useEffect(() => {
    void loadRequests();
    void loadCategories();
    void loadCurrentLocation();
  }, []);

  useEffect(() => {
    const query = form.place.trim();
    if (skipNextPlaceLookup.current) {
      skipNextPlaceLookup.current = false;
      return;
    }
    if (query.length < 4) return;

    const sequence = ++placeLookupSequence.current;
    const timeout = setTimeout(() => {
      void geocodePlace(query, sequence);
    }, 800);

    return () => clearTimeout(timeout);
  }, [form.place]);

  const loadRequests = async () => {
    try {
      setRequests(await getMyWaterRequests());
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load your submitted requests right now.' });
    }
  };

  const loadCategories = async () => {
    try {
      setCategories(await getWaterRequestCategories());
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load request categories.' });
    }
  };

  const loadCurrentLocation = async () => {
    placeLookupSequence.current += 1;
    setLocationLoading(true);
    setLocationConfirmed(false);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setForm((previous) => ({ ...previous, latitude: null, longitude: null }));
        setPlaceLookupStatus('error');
        setPlaceLookupMessage('Location permission is required to use your current location.');
        setMessage({ type: 'error', text: 'Location permission is required. Allow access to your current location to place and confirm the map pin.' });
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = currentLocation.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addresses[0];
      if (!address || !isCaloocanAddress(address)) {
        setForm((previous) => ({ ...previous, latitude: null, longitude: null }));
        setLocationConfirmed(false);
        setPlaceLookupStatus('error');
        setPlaceLookupMessage('Please select a location within North or South Caloocan.');
        setMessage({ type: 'error', text: 'Please select a location within North or South Caloocan.' });
        return;
      }

      const locationLabel = getAddressLabel(address);
      skipNextPlaceLookup.current = true;
      setForm((prev) => ({
        ...prev,
        latitude,
        longitude,
        place: locationLabel,
      }));
      setLocationConfirmed(true);
      setPlaceLookupStatus('found');
      setPlaceLookupMessage('Current location found in Caloocan and pinned on the map.');
      setIsReviewing(false);
      setMessage(null);
    } catch {
      setForm((previous) => ({ ...previous, latitude: null, longitude: null }));
      setLocationConfirmed(false);
      setMessage({ type: 'error', text: 'Unable to determine your current location right now. Please try again.' });
    } finally {
      setLocationLoading(false);
    }
  };

  const geocodePlace = async (place: string, sequence: number) => {
    setPlaceLookupStatus('searching');
    setPlaceLookupMessage('Finding this place in Caloocan...');
    setLocationConfirmed(false);

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (permission.status !== 'granted') {
        throw new Error('Location permission is required to find and verify this place.');
      }

      const candidates = await Location.geocodeAsync(`${place}, Caloocan City, Philippines`);
      for (const candidate of candidates) {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: candidate.latitude,
          longitude: candidate.longitude,
        });
        const address = addresses[0];
        if (!address || !isCaloocanAddress(address)) continue;
        if (sequence !== placeLookupSequence.current) return;

        setForm((previous) => ({
          ...previous,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
        }));
        setLocationConfirmed(true);
        setPlaceLookupStatus('found');
        setPlaceLookupMessage('Place found in Caloocan and pinned on the map.');
        setMessage(null);
        setIsReviewing(false);
        return;
      }

      if (sequence !== placeLookupSequence.current) return;
      setForm((previous) => ({ ...previous, latitude: null, longitude: null }));
      setLocationConfirmed(false);
      setPlaceLookupStatus('error');
      setPlaceLookupMessage(
        candidates.length > 0
          ? 'Please select a location within North or South Caloocan.'
          : 'Place not found. Check the place name and try again.'
      );
    } catch (error) {
      if (sequence !== placeLookupSequence.current) return;
      setForm((previous) => ({ ...previous, latitude: null, longitude: null }));
      setLocationConfirmed(false);
      setPlaceLookupStatus('error');
      setPlaceLookupMessage(error instanceof Error ? error.message : 'Unable to find this place. Please check the name and try again.');
    }
  };

  const capturePhoto = async () => {
    if (!cameraPermission || !cameraPermission.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        setMessage({ type: 'error', text: 'Camera permission is required to attach a photo of the issue.' });
        return;
      }
    }

    setCameraReady(false);
    setCameraOpen(true);
  };

  const takePicture = async () => {
    if (!cameraReady || !cameraRef.current) {
      setMessage({ type: 'error', text: 'The camera is still starting. Please wait a moment and try again.' });
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, exif: false });
      if (!photo?.uri) throw new Error('The photo could not be captured. Please try again.');

      setForm((prev) => ({
        ...prev,
        photoUri: photo.uri,
        photoNote: 'issue-photo.jpg',
      }));
      setIsReviewing(false);
      setCameraOpen(false);
      setMessage({ type: 'success', text: 'Photo captured and attached to this request.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'The photo could not be captured.' });
    }
  };

  const updatePinnedLocation = async (latitude: number, longitude: number) => {
    setIsReviewing(false);
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = addresses[0];
      if (!address || !isCaloocanAddress(address)) {
        setMessage({ type: 'error', text: 'Please select a location within North or South Caloocan.' });
        return;
      }

      skipNextPlaceLookup.current = true;
      setForm((previous) => ({
        ...previous,
        place: getAddressLabel(address),
        latitude,
        longitude,
      }));
      setLocationConfirmed(true);
      setPlaceLookupStatus('found');
      setPlaceLookupMessage('Location pinned within Caloocan.');
      setMessage(null);
    } catch {
      setMessage({ type: 'error', text: 'Unable to verify this map location. Please try another place.' });
    }
  };

  const validateRequest = () => {
    if (!form.category || !form.place.trim() || !form.description.trim()) {
      setMessage({ type: 'error', text: 'Select a category, enter the incident place, and describe the issue.' });
      return false;
    }
    if (locationLoading || placeLookupStatus === 'searching' || form.latitude == null || form.longitude == null || !locationConfirmed) {
      setMessage({ type: 'error', text: 'Find or use a current location within North or South Caloocan before submitting.' });
      return false;
    }
    if (!form.photoUri) {
      setMessage({ type: 'error', text: 'A photo is required. Take a photo of the issue before submitting.' });
      return false;
    }
    return true;
  };

  const colors = useMemo(
    () => ({
      background: isDarkMode ? '#101C24' : '#F3F7F6',
      surface: isDarkMode ? '#1A2A32' : '#FFFFFF',
      border: isDarkMode ? '#31444C' : '#DCE5E1',
      text: isDarkMode ? '#F2F7F4' : '#172B25',
      muted: isDarkMode ? '#B0C1BC' : '#62746D',
      primary: '#16764A',
      primarySoft: isDarkMode ? '#203D33' : '#E6F4EC',
      danger: '#D92D20',
      warningBg: isDarkMode ? '#2F3026' : '#FFF8E8',
      warningText: isDarkMode ? '#E8D9A9' : '#6D5A31',
    }),
    [isDarkMode]
  );

  const submitRequest = async () => {
    if (!validateRequest()) return;
    if (form.category == null || form.latitude == null || form.longitude == null || !form.photoUri) return;
    const selectedCategory = categories.find((category) => category.id === form.category);
    if (!selectedCategory) {
      setMessage({ type: 'error', text: 'Select a valid request category and try again.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitWaterRequest({
        categoryId: form.category,
        place: form.place.trim(),
        description: form.description.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        photoUri: form.photoUri,
        photoFileName: form.photoNote || 'issue-photo.jpg',
      });

      setConfirmation({
        referenceId: `WSDR-${String(result.id).padStart(6, '0')}`,
        category: result.category_name || selectedCategory.name,
        place: result.location_text,
        latitude: result.latitude!,
        longitude: result.longitude!,
        photoUri: result.attachments[0]?.url ?? '',
        status: result.status,
        submittedAt: result.created_at,
      });
      await loadRequests();
      setMessage({ type: 'success', text: `Request submitted. Reference: WSDR-${String(result.id).padStart(6, '0')}` });
      setForm(initialForm);
      setLocationConfirmed(false);
      setPlaceLookupStatus('idle');
      setPlaceLookupMessage(null);
      setIsReviewing(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not submit the request. Check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStatus = (status: string | null | undefined) => {
    if (!status) return 'Pending';
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  };

  return (
    <ScrollView
      style={[styles.wrapper, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Water Supply & Drainage Request</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Report a city utility issue and we will route it to the responsible office.</Text>

        <View style={[styles.sectionTitleWrap, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Issue details</Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
          <View style={styles.categoryWrap}>
            {categories.map((category) => {
              const selected = category.id === form.category;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setForm((previous) => ({ ...previous, category: category.id }))}
                  style={[styles.categoryChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : colors.surface }]}
                >
                  <Text style={[styles.categoryText, { color: selected ? colors.primary : colors.muted }]}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Place</Text>
          <TextInput
            value={form.place}
            onChangeText={(text) => {
              placeLookupSequence.current += 1;
              setForm((previous) => ({ ...previous, place: text, latitude: null, longitude: null }));
              setLocationConfirmed(false);
              setPlaceLookupStatus('idle');
              setPlaceLookupMessage(null);
              setIsReviewing(false);
            }}
            placeholder="e.g. Barangay Hall, Caloocan"
            placeholderTextColor={colors.muted}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          />
          {placeLookupMessage && (
            <Text style={[styles.placeStatus, { color: placeLookupStatus === 'error' ? colors.warningText : colors.muted }]}>
              {placeLookupMessage}
            </Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            value={form.description}
            onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
            placeholder="Describe the issue in detail"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
            style={[styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Current location</Text>
          <View style={[styles.locationBox, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={[styles.locationText, { color: colors.text }]}>
              {locationLoading ? 'Getting your current location...' : form.place || 'Use your current location or enter a place above'}
            </Text>
            <TouchableOpacity onPress={() => void loadCurrentLocation()} style={[styles.secondaryButton, { backgroundColor: colors.primarySoft }]} disabled={locationLoading}>
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>{locationLoading ? 'Finding location...' : 'Use my current location'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.mapWrap, { borderColor: colors.border }]}> 
              <LeafletPinMap
                latitude={form.latitude}
                longitude={form.longitude}
                onCoordinateSelect={(latitude, longitude) => void updatePinnedLocation(latitude, longitude)}
              />
              <View style={styles.pinFooter}>
                <Text style={[styles.coordinates, { color: colors.muted }]}>
                  {form.latitude != null && form.longitude != null
                    ? `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`
                    : 'Map focused on North and South Caloocan'}
                </Text>
              </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Photo of issue (required)</Text>

          {form.photoUri ? (
            <View style={[styles.photoBox, { backgroundColor: colors.background, borderColor: colors.border }]}> 
              <Image source={{ uri: form.photoUri }} style={styles.photoPreview} />
              <View style={styles.photoActions}>
                <TouchableOpacity onPress={() => void capturePhoto()} style={[styles.secondaryButton, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setForm((prev) => ({ ...prev, photoUri: null, photoNote: '' }))} style={[styles.secondaryButton, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.secondaryButtonText, { color: '#B91C1C' }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => void capturePhoto()} style={[styles.photoButton, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}> 
              <Text style={[styles.photoButtonText, { color: colors.primary }]}>Take issue photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {cameraOpen && (
          <View style={styles.cameraSheet}> 
            <CameraView ref={cameraRef} style={styles.cameraView} facing="back" onCameraReady={() => setCameraReady(true)} />
            <View style={styles.cameraFooter}>
              <TouchableOpacity onPress={() => setCameraOpen(false)} style={[styles.cameraCloseButton, { backgroundColor: '#111827' }]}>
                <Text style={styles.cameraCloseText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void takePicture()} disabled={!cameraReady} style={[styles.cameraCaptureButton, { backgroundColor: cameraReady ? '#16764A' : '#64748B' }]}>
                <Text style={styles.cameraCaptureText}>{cameraReady ? 'Capture' : 'Starting camera...'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {confirmation && (
          <View style={[styles.confirmationBox, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}> 
            <Text style={[styles.confirmationTitle, { color: colors.primary }]}>Request received</Text>
            <Text style={[styles.historyRef, { color: colors.primary }]}>{confirmation.referenceId}</Text>
            <Text style={[styles.historyText, { color: colors.text }]}>{confirmation.place}</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{confirmation.status}</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{confirmation.submittedAt}</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{confirmation.latitude.toFixed(6)}, {confirmation.longitude.toFixed(6)}</Text>
            <Image source={{ uri: confirmation.photoUri }} style={styles.photoPreview} />
          </View>
        )}

        {message && (
          <View
            style={[
              styles.notice,
              {
                backgroundColor: message.type === 'success' ? colors.primarySoft : colors.warningBg,
                borderColor: message.type === 'success' ? colors.primary : colors.warningText,
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: message.type === 'success' ? colors.primary : colors.warningText }]}>
              {message.text}
            </Text>
          </View>
        )}

        {isReviewing ? (
          <View style={[styles.reviewBox, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={[styles.historyTitle, { color: colors.text }]}>Review request</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{categories.find((category) => category.id === form.category)?.name}</Text>
            <Text style={[styles.historyText, { color: colors.text }]}>{form.place}</Text>
            <Text style={[styles.historyMeta, { color: colors.muted }]}>{form.description}</Text>
            {form.latitude != null && form.longitude != null && <Text style={[styles.historyMeta, { color: colors.muted }]}>{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</Text>}
            {form.photoUri && <Image source={{ uri: form.photoUri }} style={styles.photoPreview} />}
            <View style={styles.photoActions}>
              <TouchableOpacity onPress={() => setIsReviewing(false)} style={[styles.secondaryButton, { backgroundColor: colors.surface }]}>
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back to edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void submitRequest()} disabled={isSubmitting} style={[styles.submitButton, { backgroundColor: colors.primary, flex: 1 }]}>
                <Text style={styles.submitButtonText}>{isSubmitting ? 'Submitting...' : 'Confirm & submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 }]}
            onPress={() => {
              setMessage(null);
              if (validateRequest()) setIsReviewing(true);
            }}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            <Text style={styles.submitButtonText}>Review request</Text>
          </TouchableOpacity>
        )}

        {requests.length > 0 && (
          <View style={styles.historyBox}> 
            <Text style={[styles.historyTitle, { color: colors.text }]}>Submitted requests</Text>
            {requests.map((request) => (
              <View key={request.id} style={[styles.historyItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
                <View style={styles.historyHeader}> 
                  <Text style={[styles.historyRef, { color: colors.primary }]}>WSDR-{String(request.id).padStart(6, '0')}</Text>
                  <Text style={[styles.statusPill, { backgroundColor: colors.primarySoft, color: colors.primary }]}>{formatStatus(request.status)}</Text>
                </View>
                <Text style={[styles.historyMeta, { color: colors.muted }]}>{request.category_name}</Text>
                <Text style={[styles.historyText, { color: colors.text }]}>{request.title}</Text>
                <Text style={[styles.historyMeta, { color: colors.muted }]}>{request.location_text}</Text>
                {request.latitude != null && request.longitude != null && <Text style={[styles.historyMeta, { color: colors.muted }]}>{request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</Text>}
                {!!request.attachments[0]?.url && <Image source={{ uri: request.attachments[0].url }} style={styles.historyPhoto} />}
                <Text style={[styles.historyMeta, { color: colors.muted }]}>Staff update: {request.admin_notes || 'No staff remarks yet.'}</Text>
              </View>
            ))}
          </View>
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
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  sectionTitleWrap: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryText: { fontSize: 12, fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
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
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  notice: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  noticeText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  locationBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  placeStatus: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  mapWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  pinFooter: {
    padding: 10,
    gap: 8,
  },
  coordinates: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  photoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cameraSheet: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
  },
  cameraView: {
    flex: 1,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cameraCloseButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cameraCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cameraCaptureButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cameraCaptureText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  historyBox: {
    marginTop: 20,
    gap: 10,
  },
  confirmationBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  confirmationTitle: { fontSize: 18, fontWeight: '800' },
  reviewBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 10,
  },
  historyTitle: { fontSize: 16, fontWeight: '800' },
  historyItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyRef: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  historyText: { fontSize: 14, fontWeight: '700' },
  historyMeta: { fontSize: 12, lineHeight: 18 },
  historyPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});