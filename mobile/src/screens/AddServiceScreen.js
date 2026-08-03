import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YaMap, { Marker } from 'react-native-yamap';
import { ArrowLeft, Camera as CameraIcon, XCircle, Star } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, IMAGE_BASE } from '../lib/api';
import { COLORS, FONTS, SERVICE_TYPES } from '../lib/theme';
import { Picker } from '@react-native-picker/picker';
import { regionsAndDistricts, regionCoordinates } from '../lib/regions';
import { getPhosphorIcon } from '../lib/icons';

const REGIONS = Object.keys(regionsAndDistricts).map(r => ({ label: r, value: r }));

export default function AddServiceScreen({ navigation, route }) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const editItem = route.params?.editItem;
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 300);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
  const descY = useRef(0);
  const extraY = useRef(0);

  const getPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return t('placeholder_tuyxona') || "Masalan: Navro'z to'yxonasi";
      case 'FOTO_VIDEO': return t('placeholder_foto_video') || "Masalan: Qodirov Studio";
      case 'XONANDA': return t('placeholder_xonanda') || "Masalan: Tohir Sodiqov";
      case 'SALON': return t('placeholder_salon') || "Masalan: Go'zallik saloni";
      case 'KORTEJ': return t('placeholder_kortej') || "Masalan: Gelik 2024 (qora)";
      case 'TASHKILOTCHI': return t('placeholder_tashkilotchi') || "Masalan: To'yona Event";
      case 'LIBOSLAR': return t('placeholder_liboslar') || "Masalan: \"Kelin style\" sarpo va ko'ylaklar saloni";
      case 'AKSESSUARLAR': return t('placeholder_aksessuarlar') || "Masalan: \"Diamond\" zargarlik va uzuklar uyi";
      default: return t('placeholder_default') || "Masalan: Xizmat nomi";
    }
  };

  const getExtraServicesPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return t('extra_placeholder_tuyxona') || "Masalan: Wi-Fi, Avtoturargoh, Konditsioner";
      case 'FOTO_VIDEO': return t('extra_placeholder_foto_video') || "Masalan: Dron, Qo'shimcha operator, Albom";
      case 'XONANDA': return t('extra_placeholder_xonanda') || "Masalan: Jonli ijro, Apparatura";
      case 'SALON': return t('extra_placeholder_salon') || "Masalan: Makiyaj, Soch turmagi, Tirnoq dizayni";
      case 'KORTEJ': return t('extra_placeholder_kortej') || "Masalan: Haydovchi bilan, Bezaklar, Konditsioner";
      case 'TASHKILOTCHI': return t('extra_placeholder_tashkilotchi') || "Masalan: Boshlovchi, Dasturxon, Sahnani bezash";
      case 'LIBOSLAR': return t('extra_placeholder_liboslar') || "Masalan: Ko'ylakni o'lchamga moslab berish, Ximchistka, Sarpo sandiq";
      case 'AKSESSUARLAR': return t('extra_placeholder_aksessuarlar') || "Masalan: O'zbekiston bo'ylab yetkazib berish, Individual yozuv tushirish";
      default: return t('extra_placeholder_default') || "Masalan: Wi-Fi, Avtoturargoh";
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
      mapRef.current.setCenter({
        lat: newLat,
        lon: newLng,
      }, 12, 0, 0, 1);
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
        mapRef.current.setCenter({
          lat: newLat,
          lon: newLng,
        }, 12, 0, 0, 1);
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
    if (!form.name || !form.region || !form.district) {
      Alert.alert('Xato', 'Iltimos, barcha majburiy maydonlarni to\'ldiring!');
      return;
    }

    if (!editItem && images.length === 0 && existingImages.length === 0) {
      Alert.alert('Xato', 'Iltimos, xizmat uchun kamida bitta rasm yuklang.');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        name: form.name,
        type: form.type,
        price: form.price ? Number(form.price) : 0,
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

  const [initialMapRegion] = useState({
    lat: editItem?.location_lat ? Number(editItem.location_lat) : 41.2995,
    lon: editItem?.location_lng ? Number(editItem.location_lng) : 69.2401,
    zoom: 12,
  });

  const renderMap = () => {
    return (
      <View style={styles.mapContainer}>
        <YaMap
          ref={mapRef}
          style={styles.map}
          initialRegion={initialMapRegion}
          onMapPress={(e) => {
            if (!e || !e.nativeEvent) return;
            const { lat, lon } = e.nativeEvent;
            if (lat !== undefined && lon !== undefined) {
              setForm(prev => ({
                ...prev,
                location_lat: Number(lat),
                location_lng: Number(lon)
              }));
            }
          }}
        >
          <Marker
            point={{
              lat: form.location_lat,
              lon: form.location_lng,
            }}
          />
        </YaMap>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editItem ? (t('edit_service') || 'Xizmatni tahrirlash') : (t('new_service') || 'Yangi xizmat')}</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={mainScrollRef} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(60, keyboardHeight + 60) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          <Text style={styles.label}>{t('service_type') || 'Xizmat turi *'}</Text>
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
                  {t(`type_${type.value}`) || type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>{t('service_name') || 'Nomi *'}</Text>
          <TextInput
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
            placeholder={getPlaceholder(form.type)}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <Text style={styles.label}>{t('region_star') || 'Viloyat *'}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.region}
              onValueChange={handleRegionChange}
              style={[styles.picker, { color: COLORS.text }]}
              dropdownIconColor={COLORS.text}
            >
              {REGIONS.map(reg => (
                <Picker.Item key={reg.value} label={reg.label} value={reg.value} color={Platform.OS === 'android' ? undefined : COLORS.text} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>{t('district_star') || 'Tuman / Shahar *'}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.district}
              onValueChange={handleDistrictChange}
              style={[styles.picker, { color: COLORS.text }]}
              dropdownIconColor={COLORS.text}
            >
              {(regionsAndDistricts[form.region] || []).map(dist => (
                <Picker.Item key={dist} label={dist} value={dist} color={Platform.OS === 'android' ? undefined : COLORS.text} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>{t('mark_on_map') || 'Xaritada belgilang *'}</Text>
          {renderMap()}

          <Text style={styles.label}>{t('price_optional_hint') || "Narxi (so'm) — majburiy emas, o'rtacha narx"}</Text>
          <TextInput
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={getDisplayPrice()}
            onChangeText={formatPriceInput}
          />

          {form.type === 'TUYXONA' && (
            <>
              <Text style={styles.label}>{t('capacity_people_label') || "Sig'imi (odam)"}</Text>
              <TextInput
                placeholderTextColor={COLORS.textLight}
                style={styles.input}
                placeholder={t('placeholder_capacity') || "Masalan: 500"}
                keyboardType="numeric"
                value={form.capacity}
                onChangeText={(text) => setForm({ ...form, capacity: text.replace(/\D/g, '') })}
              />
            </>
          )}

          <View onLayout={(e) => { descY.current = e.nativeEvent.layout.y; }}>
            <Text style={styles.label}>{t('description') || 'Tavsif'}</Text>
            <TextInput
              placeholderTextColor={COLORS.textLight}
              style={[styles.input, styles.textArea]}
              placeholder={t('description_placeholder') || "Xizmat haqida batafsil ma'lumot..."}
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              onFocus={() => {
                setTimeout(() => {
                  if (descY.current) {
                    mainScrollRef.current?.scrollTo({ y: Math.max(0, descY.current - 10), animated: true });
                  }
                }, 350);
              }}
            />
          </View>

          <View onLayout={(e) => { extraY.current = e.nativeEvent.layout.y; }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
              <Text style={[styles.label, { marginTop: 0, marginBottom: 0 }]}>{t('extra_services') || "Qo'shimcha xizmatlar"}</Text>
              <Text style={styles.hintText}>{t('comma_separated') || "(vergul bilan ajrating)"}</Text>
            </View>
            <TextInput
              placeholderTextColor={COLORS.textLight}
              style={styles.input}
              placeholder={getExtraServicesPlaceholder(form.type)}
              value={form.extra_services}
              onChangeText={(text) => setForm({ ...form, extra_services: text })}
              onFocus={() => {
                setTimeout(() => {
                  mainScrollRef.current?.scrollToEnd({ animated: true });
                }, 350);
              }}
            />
          </View>

          <View style={styles.imageSection}>
            <ScrollView horizontal style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <CameraIcon size={32} color={COLORS.primary} weight="regular" />
                <Text style={styles.addImageText}>{t('add') || "Qo'shish"}</Text>
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
                      <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{t('main_image') || 'Asosiy'}</Text>
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
                        <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{t('main_image') || 'Asosiy'}</Text>
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
                <Text style={styles.submitBtnText}>{t('loading_wait') || 'Yuklanmoqda, kuting...'}</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>{t('save') || 'Saqlash'}</Text>
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
    paddingBottom: 60,
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
    color: COLORS.text,
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
