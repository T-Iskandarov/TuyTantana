import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { ArrowLeft, Camera as CameraIcon, XCircle, Star } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api, IMAGE_BASE } from '../lib/api';
import { COLORS, FONTS, SERVICE_TYPES } from '../lib/theme';
import { Picker } from '@react-native-picker/picker';
import { regionsAndDistricts, regionCoordinates } from '../lib/regions';
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
  
  const mapRef = useRef(null);
  const mainScrollRef = useRef(null);

  const getPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return "Masalan: Navro'z to'yxonasi";
      case 'FOTO_VIDEO': return "Masalan: Qodirov Studio";
      case 'XONANDA': return "Masalan: Tohir Sodiqov";
      case 'SALON': return "Masalan: Go'zallik saloni";
      case 'KORTEJ': return "Masalan: Gelik 2024 (qora)";
      case 'TASHKILOTCHI': return "Masalan: To'yona Event";
      default: return "Masalan: Xizmat nomi";
    }
  };

  const getExtraServicesPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return "Masalan: Wi-Fi, Avtoturargoh, Konditsioner";
      case 'FOTO_VIDEO': return "Masalan: Dron, Qo'shimcha operator, Albom";
      case 'XONANDA': return "Masalan: Jonli ijro, Apparatura";
      case 'SALON': return "Masalan: Makiyaj, Soch turmagi, Tirnoq dizayni";
      case 'KORTEJ': return "Masalan: Haydovchi bilan, Bezaklar, Konditsioner";
      case 'TASHKILOTCHI': return "Masalan: Boshlovchi, Dasturxon, Sahnani bezash";
      default: return "Masalan: Wi-Fi, Avtoturargoh";
    }
  };

  const handleRegionChange = (val) => {
    const coords = regionCoordinates[val];
    const newLat = coords ? coords.lat : 41.2995;
    const newLng = coords ? coords.lng : 69.2401;
    setForm({ 
      ...form, 
      region: val, 
      district: regionsAndDistricts[val][0],
      location_lat: newLat,
      location_lng: newLng
    });
    
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: newLat,
        longitude: newLng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    }
  };

  const handleDistrictChange = async (val) => {
    setForm({ 
      ...form, 
      district: val
    });
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ', ' + form.region + ', Uzbekistan')}`, {
        headers: { 'User-Agent': 'TuyTantanaApp/1.0' }
      });
      const data = await res.json();
      let newLat, newLng;
      if (data && data.length > 0) {
        newLat = parseFloat(data[0].lat);
        newLng = parseFloat(data[0].lon);
      } else {
        const fallback = regionCoordinates[form.region];
        newLat = fallback ? fallback.lat : 41.2995;
        newLng = fallback ? fallback.lng : 69.2401;
      }
      
      setForm(prev => ({...prev, location_lat: newLat, location_lng: newLng}));
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: newLat,
          longitude: newLng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }, 1000);
      }
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  };
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
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets) {
      const validAssets = [];
      let oversized = false;
      for (const asset of result.assets) {
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          oversized = true;
        } else {
          validAssets.push(asset);
        }
      }
      
      if (oversized) {
        Alert.alert('Ogohlantirish', 'Ba\'zi rasmlar hajmi 5MB dan katta bo\'lgani uchun yuklanmadi. Iltimos, kichikroq hajmdagi rasmlarni tanlang.');
      }
      
      setImages([...images, ...validAssets]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const setLocalMainImage = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = temp;
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

  const handleSetMainImage = async (imageId) => {
    try {
      const res = await api.setMainImage(imageId, token);
      if (res.success) {
        Alert.alert('Muvaffaqiyat', 'Asosiy rasm o\'zgartirildi');
        setExistingImages(prev => prev.map(img => ({
          ...img,
          is_main: img.id === imageId
        })));
      } else {
        Alert.alert('Xato', res.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Xato', 'Tarmoq xatosi');
    }
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

  const memoizedMap = useMemo(() => {
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: form.location_lat,
            longitude: form.location_lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => setForm(prev => ({
            ...prev,
            location_lat: e.nativeEvent.coordinate.latitude,
            location_lng: e.nativeEvent.coordinate.longitude
          }))}
        >
          <Marker
            coordinate={{
              latitude: form.location_lat,
              longitude: form.location_lng,
            }}
            draggable
            onDragEnd={(e) => setForm(prev => ({
              ...prev,
              location_lat: e.nativeEvent.coordinate.latitude,
              location_lng: e.nativeEvent.coordinate.longitude
            }))}
          />
        </MapView>
      </View>
    );
  }, [form.location_lat, form.location_lng]);

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
        <ScrollView ref={mainScrollRef} contentContainerStyle={styles.scrollContent}>
          
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
            placeholder={getPlaceholder(form.type)}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <Text style={styles.label}>Viloyat *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.region}
              onValueChange={handleRegionChange}
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
              onValueChange={handleDistrictChange}
              style={styles.picker}
            >
              {(regionsAndDistricts[form.region] || []).map(dist => (
                <Picker.Item key={dist} label={dist} value={dist} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Xaritada belgilang *</Text>
          {memoizedMap}

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

          <Text style={styles.label}>Tavsif</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Xizmat haqida batafsil ma'lumot..."
            multiline
            numberOfLines={4}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
            <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>Qo'shimcha xizmatlar</Text>
            <Text style={styles.hintText}>(vergul bilan ajrating)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={getExtraServicesPlaceholder(form.type)}
            value={form.extra_services}
            onChangeText={(text) => setForm({ ...form, extra_services: text })}
          />

          <View style={styles.imageSection}>
            <ScrollView horizontal style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <CameraIcon size={32} color={COLORS.primary} weight="regular" />
                <Text style={styles.addImageText}>Qo'shish</Text>
              </TouchableOpacity>
              
              {existingImages.map((img) => (
                <View key={`existing-${img.id}`} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: `${IMAGE_BASE}${img.image_path}` }} style={[styles.imagePreview, img.is_main && { borderColor: COLORS.primary, borderWidth: 3 }]} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeExistingImage(img.id)}>
                    <XCircle size={24} color={COLORS.danger} weight="fill" />
                  </TouchableOpacity>
                  {!img.is_main && (
                    <TouchableOpacity style={styles.mainImageBtn} onPress={() => handleSetMainImage(img.id)}>
                      <Star size={20} color={COLORS.warning} weight="fill" />
                    </TouchableOpacity>
                  )}
                  {img.is_main && (
                    <View style={styles.mainBadge}>
                      <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>Asosiy</Text>
                    </View>
                  )}
                </View>
              ))}

              {images.map((img, index) => {
                const isLocalMain = existingImages.length === 0 && index === 0;
                return (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: img.uri }} style={[styles.imagePreview, isLocalMain && { borderColor: COLORS.primary, borderWidth: 3 }]} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                      <XCircle size={24} color={COLORS.danger} weight="fill" />
                    </TouchableOpacity>
                    {!isLocalMain && existingImages.length === 0 && (
                      <TouchableOpacity style={styles.mainImageBtn} onPress={() => setLocalMainImage(index)}>
                        <Star size={20} color={COLORS.warning} weight="fill" />
                      </TouchableOpacity>
                    )}
                    {isLocalMain && (
                      <View style={styles.mainBadge}>
                        <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>Asosiy</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Yuklanmoqda, kuting...</Text>
              </View>
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
  hintText: {
    ...FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
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
  mainImageBtn: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
