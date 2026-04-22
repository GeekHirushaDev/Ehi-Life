import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LibraryTab() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(db, "LibraryItems"), limit(20));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(results);
      } catch (err) {
        console.error("Failed fetching LibraryItems", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tab_library')}</Text>

      {/* Sticky Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          placeholder={t('lib_search')}
          placeholderTextColor={colors.tabIconDefault}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 3 Categories Grid */}
        <View style={styles.gridLayer}>
          <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
              <FontAwesome5 name="book-reader" size={28} color={colors.tint} />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>{t('lib_dhammapada')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
              <FontAwesome5 name="users" size={28} color={colors.tint} />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>{t('lib_bana')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} activeOpacity={0.7}>
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
              <FontAwesome5 name="book" size={28} color={colors.tint} />
            </View>
            <Text style={[styles.gridTitle, { color: colors.text }]}>{t('lib_gathas')}</Text>
          </TouchableOpacity>
        </View>

        {/* Database List */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Database Items</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : filteredItems.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No matching documents found.
          </Text>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemRow, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => router.push(`/library/${item.id}` as any)}
            >
              <View style={[styles.itemIcon, { backgroundColor: colors.tint + '15' }]}>
                <Ionicons name="document-text" size={20} color={colors.tint} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title || 'Untitled Document'}</Text>
                {item.category && <Text style={[styles.itemCat, { color: colors.tint }]}>{item.category}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  scrollContent: { paddingHorizontal: 24 },
  gridLayer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gridCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTextWrap: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemCat: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' }
});
