import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { ArrowLeft, Camera as CameraIcon, XCircle } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api, IMAGE_BASE } from '../lib/api';
import { COLORS, FONTS, SERVICE_TYPES } from '../lib/theme';
import { Picker } from '@react-native-picker/picker';
import { regionsAndDistricts } from '../lib/regions';
import { getPhosphorIcon } from '../lib/icons';

const REGIONS = Object.keys(regionsAndDistricts).map(r => ({ label: r, value: r }));

export default function AddServiceScreen({ navigation, route }) {
  const { token } = useAuth();
  const editItem = route.params?.editItem;
  
  const [form, setForm] = useState({
    name: editItem?.name || '',
    type: editItem?.type || 'TUYXONA',
    price: editItem?.price ? editItem.price.toString() : '',
    description: editItem?.description || '',
    region: editItem?.location_name?.split(',')[0]?.trim() || REGIONS[0].value,
    district: editItem?.location_name?.split(',')[1]?.trim() || regionsAndDistricts[REGIONS[0].value][0],
    capacity: editItem?.capacity ? editItem.capacity.toString() : '',
    extra_services: editItem?.extra_services || '',
    location_lat: editItem?.location_lat ? Number(editItem.location_lat) : 41.2995,
    location_lng: editItem?.location_lng ? Number(editItem.location_lng) : 69.2401,
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(editItem?.images || []);
  const [loading, setLoading] = useState(false);

  const formatPriceInput = (text) => {
    // Remove non-digits
    const numStr = text.replace(/\D/g, '');
    setForm({ ...form, price: numStr });
  };

  const getDisplayPrice = () => {
    if (!form.price) return '';
    return Number(form.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Xato', 'Rasmlarga kirish uchun ruxsat kerak!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removeExistingImage = async (imageId) => {
    Alert.alert('Tasdiqlash', 'Haqiqatan ham bu rasmni o\'chirmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'O\'chirish', style: 'destructive', onPress: async () => {
          try {
            const res = await api.deleteServiceImage(imageId, token);
            if (res.success) {
              setExistingImages(prev => prev.filter(img => img.id !== imageId));
            } else {
              Alert.alert('Xato', res.message || 'Rasmni o\'chirishda xatolik yuz berdi');
            }
          } catch (error) {
            console.error(error);
            Alert.alert('Xato', 'Tarmoq xatosi yuz berdi');
          }
      }}
    ]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.region || !form.district) {
      Alert.alert('Xato', 'Iltimos, barcha majburiy maydonlarni to\'ldiring!');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        name: form.name,
        type: form.type,
        price: form.price,
        description: form.description,
        location_name: `${form.region}, ${form.district}`,
        location_lat: form.location_lat,
        location_lng: form.location_lng,
        extra_services: form.extra_services,
      };
      
      if (form.type === 'TUYXONA') {
        serviceData.capacity = form.capacity;
      }

      let res;
      if (editItem) {
        res = await api.updateService(editItem.id, serviceData, token);
      } else {
        res = await api.createService(serviceData, token);
      }
      
      if (res.success || (editItem && !res.error)) {
        const serviceId = editItem ? editItem.id : res.data.id;
        
        // Upload new images if any
        if (images.length > 0) {
          try {
            await api.uploadImages(serviceId, images, token);
          } catch (imgErr) {
            console.error('Image upload error:', imgErr);
            Alert.alert('Ogohlantirish', 'Xizmat saqlandi, ammo yangi rasmlarni yuklashda xatolik yuz berdi.');
          }
        }
        
        Alert.alert('Muvaffaqiyat', `Xizmat muvaffaqiyatli ${editItem ? 'yangilandi' : 'qo\'shildi'}!`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Xato', res.error || res.message || 'Xizmatni saqlashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Xato', 'Tarmoq xatosi yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editItem ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.label}>Xizmat turi *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {SERVICE_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeBtn, form.type === type.value && styles.typeBtnActive]}
                onPress={() => setForm({ ...form, type: type.value })}
              >
                <View style={styles.typeIconWrapper}>
                  {getPhosphorIcon(type.value, form.type === type.value, 24)}
                </View>
                <Text style={[styles.typeText, form.type === type.value && styles.typeTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Nomi *</Text>
          <TextInput
            style={styles.input}
            placeholder="Masalan: Navruz to'yxonasi"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <Text style={styles.label}>Viloyat *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.region}
              onValueChange={(val) => setForm({ ...form, region: val, district: regionsAndDistricts[val][0] })}
              style={styles.picker}
            >
              {REGIONS.map(reg => (
                <Picker.Item key={reg.value} label={reg.label} value={reg.value} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Tuman / Shahar *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.district}
              onValueChange={(val) => setForm({ ...form, district: val })}
              style={styles.picker}
            >
              {(regionsAndDistricts[form.region] || []).map(dist => (
                <Picker.Item key={dist} label={dist} value={dist} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Xaritada belgilang *</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: form.location_lat,
                longitude: form.location_lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onPress={(e) => setForm({
                ...form,
                location_lat: e.nativeEvent.coordinate.latitude,
                location_lng: e.nativeEvent.coordinate.longitude
              })}
            >
              <Marker
                coordinate={{
                  latitude: form.location_lat,
                  longitude: form.location_lng,
                }}
                draggable
                onDragEnd={(e) => setForm({
                  ...form,
                  location_lat: e.nativeEvent.coordinate.latitude,
                  location_lng: e.nativeEvent.coordinate.longitude
                })}
              />
            </MapView>
          </View>

          <Text style={styles.label}>Narxi (so'm) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={getDisplayPrice()}
            onChangeText={formatPriceInput}
          />

          {form.type === 'TUYXONA' && (
            <>
              <Text style={styles.label}>Sig'imi (odam)</Text>
              <TextInput
                style={styles.input}
                placeholder="Masalan: 500"
                keyboardType="numeric"
                value={form.capacity}
                onChangeText={(text) => setForm({ ...form, capacity: text.replace(/\D/g, '') })}
              />
            </>
          )}

          <Text style={styles.label}>Qo'shimcha xizmatlar</Text>
          <TextInput
            style={styles.input}
            placeholder="Masalan: Wi-Fi, Avtoturargoh, Konditsioner (vergul bilan ajrating)"
            value={form.extra_services}
            onChangeText={(text) => setForm({ ...form, extra_services: text })}
          />

          <Text style={styles.label}>Tavsif</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Xizmat haqida batafsil ma'lumot..."
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />

          <View style={styles.imageSection}>
            <ScrollView horizontal style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <CameraIcon size={32} color={COLORS.primary} weight="regular" />
                <Text style={styles.addImageText}>Qo'shish</Text>
              </TouchableOpacity>
              
              {existingImages.map((img) => (
                <View key={`existing-${img.id}`} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: `${IMAGE_BASE}${img.image_path}` }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeExistingImage(img.id)}>
                    <XCircle size={24} color={COLORS.danger} weight="fill" />
                  </TouchableOpacity>
                </View>
              ))}

              {images.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <XCircle size={24} color={COLORS.danger} weight="fill" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Saqlash</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
    marginRight: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    ...FONTS.medium,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    ...FONTS.regular,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  typeBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    width: 100,
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeIconWrapper: {
    marginBottom: 4,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  typeTextActive: {
    color: COLORS.primaryDark,
  },
  imageScroll: {
    flexGrow: 0,
    marginTop: 8,
    marginBottom: 16,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    ...FONTS.caption,
    color: COLORS.primary,
    marginTop: 4,
  },
  imagePreviewContainer: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    ...FONTS.h3,
    color: COLORS.white,
  },
});
