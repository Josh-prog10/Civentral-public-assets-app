import { IconSymbol, type IconSymbolName } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FACILITIES = [
  {
    id: 'caloocan-peoples-park',
    title: "Caloocan People's Park",
    category: 'Parks & venues',
    description: 'Public park with playground, open spaces, and interactive fountain.',
    icon: 'location.fill',
  },
  {
    id: 'barangay-176-covered-court',
    title: 'Barangay 176 Covered Court',
    category: 'Community spaces',
    description: 'Multipurpose covered court for sports activities, community programs, and barangay events.',
    icon: 'building.2.fill',
  },
  {
    id: 'community-halls',
    title: 'Community halls & covered courts',
    category: 'Community spaces',
    description: 'Request a barangay venue for meetings, programs and neighborhood activities.',
    icon: 'person.2.fill',
  },
  {
    id: 'street-infrastructure',
    title: 'Drainage, lighting & public works',
    category: 'City infrastructure',
    description: 'Report blocked drainage, damaged streetlights or hazards near public facilities.',
    icon: 'wrench.and.screwdriver.fill',
  },
] satisfies {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: IconSymbolName;
}[];

const CATEGORIES = [
  'All facilities',
  'Parks & venues',
  'Community spaces',
  'City infrastructure',
] as const;

type Category = (typeof CATEGORIES)[number];

export default function FacilitiesIndexRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<'explore' | 'activity'>('explore');
  const [activeCategory, setActiveCategory] = useState<Category>('All facilities');
  const [search, setSearch] = useState('');

  const dm = isDarkMode;

  const colors = useMemo(
    () => ({
      background: dm ? '#101C24' : '#F4F7F5',
      surface: dm ? '#1A2A32' : '#FFFFFF',
      border: dm ? '#31444C' : '#DCE5E1',
      text: dm ? '#F2F7F4' : '#172B25',
      muted: dm ? '#B0C1BC' : '#62746D',
      green: dm ? '#71D0A1' : '#16764A',
      greenSoft: dm ? '#203D33' : '#E6F4EC',
      yellow: dm ? '#F1CC68' : '#B47B12',
      switchBg: dm ? '#24343B' : '#E8EEEB',
      noticeBg: dm ? '#2F3026' : '#FFF8E8',
      noticeText: dm ? '#E8D9A9' : '#6D5A31',
    }),
    [dm]
  );

  const visibleFacilities = useMemo(() => {
    const query = search.trim().toLowerCase();
    return FACILITIES.filter((facility) => {
      const matchesCategory =
        activeCategory === 'All facilities' || facility.category === activeCategory;
      const matchesSearch =
        !query ||
        `${facility.title} ${facility.category} ${facility.description}`
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const openTracker = () => router.push('/(tabs)/tracker');

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topNav,
          {
            paddingTop: Math.max(insets.top, 12),
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.navText}>
          <Text style={[styles.navEyebrow, { color: colors.muted }]}>CALOOCAN CITY</Text>
          <Text style={[styles.navTitle, { color: colors.text }]}>
            Public assets & facilities
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={openTracker}
          activeOpacity={0.7}
          accessibilityLabel="Open service tracker"
        >
          <IconSymbol name="history" size={20} color={colors.green} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.intro}>
            <View style={[styles.introMark, { backgroundColor: colors.greenSoft }]}>
              <IconSymbol name="building.2.fill" size={24} color={colors.green} />
            </View>
            <View style={styles.introCopy}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>
                City spaces, maintained together.
              </Text>
              <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
                Explore public facilities, ask about venue use, or report a maintenance
                concern in Caloocan City.
              </Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, styles.primaryAction, { backgroundColor: colors.green }]}
              onPress={() => router.push('/parks' as any)}
              activeOpacity={0.82}
            >
              <IconSymbol name="calendar" size={19} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Browse parks & venues</Text>
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => {
                setActiveView('explore');
                setActiveCategory('City infrastructure');
              }}
              activeOpacity={0.82}
            >
              <IconSymbol
                name="wrench.and.screwdriver.fill"
                size={19}
                color={colors.green}
              />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                Find maintenance services
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push('/facilities/reservations')}
              activeOpacity={0.82}
            >
              <IconSymbol name="building.2.fill" size={19} color={colors.green} />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                Reserve a facility
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push('/facilities/water-requests')}
              activeOpacity={0.82}
            >
              <IconSymbol name="wrench.and.screwdriver.fill" size={19} color={colors.green} />
              <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                Report water issue
              </Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View
            style={[styles.viewSwitch, { backgroundColor: colors.switchBg }]}
            accessibilityRole="tablist"
          >
            {(['explore', 'activity'] as const).map((view) => {
              const selected = activeView === view;
              return (
                <TouchableOpacity
                  key={view}
                  style={[
                    styles.viewTab,
                    selected && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setActiveView(view)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.viewTabText,
                      { color: selected ? colors.text : colors.muted },
                    ]}
                  >
                    {view === 'explore' ? 'Explore facilities' : 'My activity'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeView === 'explore' ? (
            <>
              <View
                style={[
                  styles.searchBox,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <IconSymbol name="magnifyingglass" size={19} color={colors.muted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search facilities or services"
                  placeholderTextColor={colors.muted}
                  style={[styles.searchInput, { color: colors.text }]}
                  returnKeyType="search"
                  accessibilityLabel="Search public facilities"
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    accessibilityLabel="Clear search"
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={19}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((category) => {
                  const selected = activeCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: selected ? colors.green : colors.border,
                          backgroundColor: selected ? colors.greenSoft : colors.surface,
                        },
                      ]}
                      onPress={() => setActiveCategory(category)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: selected ? colors.green : colors.muted },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.sectionHeading}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Facility directory
                  </Text>
                  <Text style={[styles.sectionCaption, { color: colors.muted }]}>
                    Public spaces and city services
                  </Text>
                </View>
                <Text style={[styles.resultCount, { color: colors.muted }]}>
                  {visibleFacilities.length} listed
                </Text>
              </View>

              <View style={styles.facilityGrid}>
                {visibleFacilities.map((facility) => (
                  <View
                    key={facility.id}
                    style={[
                      styles.facilityCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.facilityCardTop}>
                      <View
                        style={[
                          styles.facilityIcon,
                          { backgroundColor: colors.greenSoft },
                        ]}
                      >
                        <IconSymbol
                          name={facility.icon}
                          size={21}
                          color={colors.green}
                        />
                      </View>
                      <Text style={[styles.facilityCategory, { color: colors.green }]}>
                        {facility.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.facilityTitle, { color: colors.text }]}>
                      {facility.title}
                    </Text>
                    <Text
                      style={[styles.facilityDescription, { color: colors.muted }]}
                    >
                      {facility.description}
                    </Text>
                    <View style={styles.cardAction}>
                      <IconSymbol
                        name="info.circle.fill"
                        size={15}
                        color={colors.muted}
                      />
                      <Text style={[styles.cardActionText, { color: colors.muted }]}>
                        Confirm details with the city office
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {visibleFacilities.length === 0 && (
                <View
                  style={[
                    styles.emptyState,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <IconSymbol name="magnifyingglass" size={24} color={colors.muted} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    No matching facilities
                  </Text>
                  <Text style={[styles.emptyDescription, { color: colors.muted }]}>
                    Try another search or choose a different category.
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View
              style={[
                styles.activityPanel,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: colors.greenSoft }]}>
                <IconSymbol name="history" size={24} color={colors.green} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your facility requests
              </Text>
              <Text style={[styles.activityDescription, { color: colors.muted }]}>
                View updates for venue inquiries and maintenance reports in your service
                tracker.
              </Text>
              <TouchableOpacity
                style={[styles.trackerButton, { backgroundColor: colors.green }]}
                onPress={openTracker}
                activeOpacity={0.82}
              >
                <Text style={styles.trackerButtonText}>Open service tracker</Text>
                <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.notice,
              {
                borderLeftColor: colors.yellow,
                backgroundColor: colors.noticeBg,
              },
            ]}
          >
            <IconSymbol name="info.circle.fill" size={17} color={colors.yellow} />
            <Text style={[styles.noticeText, { color: colors.noticeText }]}>
              Facility schedules and reservation approvals are confirmed by the
              responsible city office.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topNav: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navText: { flex: 1 },
  navEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  navTitle: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 52 },
  page: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  intro: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  introMark: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCopy: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: '800', lineHeight: 31 },
  pageSubtitle: { fontSize: 14, lineHeight: 21, marginTop: 4, maxWidth: 640 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  quickAction: {
    minHeight: 50,
    flexGrow: 1,
    flexBasis: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
  },
  primaryAction: { borderColor: 'transparent' },
  primaryActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', flex: 1 },
  secondaryActionText: { fontSize: 14, fontWeight: '700', flex: 1 },
  viewSwitch: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: 8,
    marginBottom: 18,
  },
  viewTab: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  viewTabText: { fontSize: 13, fontWeight: '700' },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
  },
  searchInput: { flex: 1, minHeight: 46, fontSize: 14 },
  categoryRow: { gap: 8, paddingVertical: 14 },
  categoryChip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 18,
  },
  categoryText: { fontSize: 12, fontWeight: '700' },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionCaption: { fontSize: 12, marginTop: 3 },
  resultCount: { fontSize: 12, fontWeight: '600' },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  facilityCard: {
    flexGrow: 1,
    flexBasis: 300,
    borderWidth: 1,
    borderRadius: 9,
    padding: 17,
    minHeight: 205,
  },
  facilityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  facilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityCategory: { fontSize: 10, fontWeight: '800', textAlign: 'right' },
  facilityTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22 },
  facilityDescription: { fontSize: 13, lineHeight: 19, marginTop: 6, flex: 1 },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  cardActionText: { fontSize: 13, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 9,
    padding: 28,
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptyDescription: { fontSize: 13, textAlign: 'center' },
  activityPanel: {
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 9,
    padding: 22,
    maxWidth: 520,
  },
  activityIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  activityDescription: { fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  trackerButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 7,
  },
  trackerButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 13,
    marginTop: 22,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
});