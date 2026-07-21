import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'phosphor-react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, FONTS } from '../lib/theme';
import { api } from '../lib/api';
import ServiceCard from '../components/ServiceCard';

export default function AllServicesScreen({ navigation, route }) {
  const { t } = useLanguage();
  const filterType = route.params?.filterType || '';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [filterType]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.getServices({ type: filterType === 'ALL' ? '' : filterType });
      if (res.success) {
        setServices(res.data || []);
      }
    } catch (error) {
      console.log('Error fetching all services:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('no_services_found') || 'Xizmatlar topilmadi'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav_services') || 'Barcha xizmatlar'}</Text>
      </View>

      {loading && services.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContainer, { paddingHorizontal: 16 }]}
          renderItem={({ item }) => (
            <ServiceCard 
              item={item} 
              onPress={() => navigation.navigate('ServiceDetail', { id: item.id })} 
              style={{ marginHorizontal: 4 }}
            />
          )}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    flex: 1,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.medium,
    color: COLORS.textLight,
  },
});
