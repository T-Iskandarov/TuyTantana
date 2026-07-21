import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ArrowLeft, Bell, CheckCircle } from 'phosphor-react-native';
import { COLORS } from '../lib/theme';

export default function NotificationsScreen({ navigation }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications(token);
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif?.is_read) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await api.markNotificationAsRead(id, token);
    } catch (err) {
      // Revert if failed
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await api.markAllNotificationsAsRead(token);
    } catch (err) {
      fetchNotifications();
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.is_read;
    const dateStr = new Date(item.created_at).toLocaleString('uz-UZ', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });

    return (
      <TouchableOpacity 
        style={[styles.notifCard, isUnread ? styles.unreadCard : styles.readCard]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.notifIconContainer, isUnread ? styles.unreadIconContainer : {}]}>
          <Bell size={24} weight={isUnread ? "fill" : "regular"} color={isUnread ? COLORS.primary : '#9CA3AF'} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, isUnread && styles.unreadText]} numberOfLines={1}>{item.title}</Text>
            {isUnread && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Yangi</Text></View>}
          </View>
          <Text style={[styles.notifMessage, !isUnread && styles.readMessage]} numberOfLines={3}>{item.message}</Text>
          <Text style={styles.notifDate}>{dateStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirishnomalar</Text>
        {notifications.some(n => !n.is_read) ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
            <CheckCircle size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color="#e5e7eb" />
          <Text style={styles.emptyText}>Hozircha xabarlar yo'q</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit-Bold',
    color: COLORS.text,
  },
  markAllBtn: {
    padding: 8,
    marginRight: -8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: 'Outfit-Medium',
  },
  listContainer: {
    padding: 20,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  unreadCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  readCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadIconContainer: {
    backgroundColor: '#F5F3FF',
  },
  notifContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  notifTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: '#374151',
    flexShrink: 1,
  },
  unreadText: {
    color: COLORS.text,
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Outfit-Bold',
    textTransform: 'uppercase',
  },
  notifMessage: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Outfit-Medium',
    lineHeight: 22,
    marginBottom: 10,
  },
  readMessage: {
    color: '#6B7280',
    fontFamily: 'Outfit-Regular',
  },
  notifDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Outfit-Medium',
  },
});
