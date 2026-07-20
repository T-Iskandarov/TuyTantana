import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'phosphor-react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { COLORS, FONTS } from '../lib/theme';

LocaleConfig.locales['uz'] = {
  monthNames: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ],
  monthNamesShort: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  dayNames: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
  dayNamesShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
  today: 'Bugun'
};
LocaleConfig.defaultLocale = 'uz';

export default function ProviderServiceCalendarScreen({ route, navigation }) {
  const { serviceId } = route.params;
  const { token } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  const fetchServiceDetails = useCallback(async () => {
    try {
      const res = await api.getServiceById(serviceId);
      if (res.success && res.data) {
        setService(res.data);
        
        // Mark booked dates
        const newMarked = {};
        if (res.data.bookings && Array.isArray(res.data.bookings)) {
          res.data.bookings.forEach(b => {
            if (b.status !== 'CANCELLED') {
              newMarked[b.date] = { 
                selected: true, 
                selectedColor: COLORS.danger, 
                disableTouchEvent: false 
              };
            }
          });
        }
        setMarkedDates(newMarked);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Xato', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  const handleDayPress = (day) => {
    const isBooked = markedDates[day.dateString];
    
    if (isBooked) {
      Alert.alert(
        "Sanani bo'shatish",
        `${day.dateString} sanasidagi bandlikni bekor qilasizmi?`,
        [
          { text: "Yo'q", style: "cancel" },
          { 
            text: "Ha, bekor qilish", 
            onPress: async () => {
              try {
                const res = await api.unblockDate({ service_id: serviceId, date: day.dateString }, token);
                if (res.success) {
                  fetchServiceDetails();
                } else {
                  Alert.alert("Xato", res.message || "Bekor qilishda xatolik");
                }
              } catch (e) {
                Alert.alert("Xato", "Tarmoq xatosi");
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Sanani band qilish",
        `${day.dateString} sanasini band qilib qo'yasizmi? (Boshqa mijozlar bu sanani tanlay olmaydi)`,
        [
          { text: "Yo'q", style: "cancel" },
          { 
            text: "Ha, band qilish", 
            onPress: async () => {
              try {
                const res = await api.blockDate({ service_id: serviceId, date: day.dateString }, token);
                if (res.success) {
                  fetchServiceDetails();
                } else {
                  Alert.alert("Xato", res.message || "Band qilishda xatolik");
                }
              } catch (e) {
                Alert.alert("Xato", "Tarmoq xatosi");
              }
            }
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalendar: {service?.name}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Sanalarni ustiga bosib, ularni o'zingiz uchun band qiling yoki band qilingan sanalarni bo'shating. Qizil rangdagi sanalar — band qilingan kunlar.
        </Text>

        <Calendar
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: COLORS.primary,
            selectedDotColor: '#ffffff',
            arrowColor: COLORS.primary,
            disabledArrowColor: '#d9e1e8',
            monthTextColor: COLORS.text,
            indicatorColor: COLORS.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          style={styles.calendar}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 12,
  },
  headerTitle: {
    ...FONTS.h3,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  instruction: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    paddingBottom: 10,
  }
});
